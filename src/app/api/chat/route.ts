export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
import { folderMetadata } from "@/config/folder-metadata";

// Rate limiting: 10 messages per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([ip, entry]) => {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 5 * 60 * 1000);

// Cache for video catalog - refresh every hour
let videoCatalogCache: string | null = null;
let videoCatalogTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Build a compact folder-level summary (no individual videos) to minimize tokens
async function buildVideoCatalog(): Promise<string> {
  const now = Date.now();
  if (videoCatalogCache && now - videoCatalogTimestamp < CACHE_DURATION) {
    return videoCatalogCache;
  }

  const accessToken = process.env.VIMEO_TOKEN;
  if (!accessToken) {
    return "לא ניתן לטעון את קטלוג הסרטונים כרגע.";
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const foldersRes = await axios.get("https://api.vimeo.com/me/projects", {
      headers,
      params: { per_page: 100, fields: "uri,name,metadata.connections.videos.total" },
      timeout: 15000,
    });

    const folders = foldersRes.data.data || [];
    const catalogParts: string[] = [];

    for (const folder of folders) {
      const meta = folderMetadata[folder.name];
      if (!meta || !meta.isVisible) continue;

      const videoCount = folder.metadata?.connections?.videos?.total || 0;
      catalogParts.push(
        `• "${folder.name}" - ${meta.description} | רמה: ${meta.levelHebrew} | קטגוריה: ${meta.category} | ${videoCount} סרטונים`
      );
    }

    videoCatalogCache = catalogParts.join("\n");
    videoCatalogTimestamp = now;
    return videoCatalogCache;
  } catch (error) {
    console.error("Error building video catalog:", error);
    return "לא ניתן לטעון את קטלוג הסרטונים כרגע.";
  }
}

const SYSTEM_PROMPT = `אתה העוזר הדיגיטלי של "סטודיו בועז אונליין" - פלטפורמה לאימונים, תנועה מרפאה וכושר של בועז נחייסי.

בועז נחייסי: מייסד "בית הספר של בועז נחייסי" (2012), יוצר שיטת הפלייסטיק (2013) - אימון עם מקל. מורה לפילאטיס, קונטרולוג'י, תנועה מרפאה. התחיל בגיל 38. מלמד בארץ ובעולם.

האתר מציע מאות שיעורי וידאו: קונטרולוג'י, פלייסטיק, אימוני קיר, שיעורי כסא, קוויקיז (קצרים), הרצאות, סדנאות, נשימה ותנועה. לכל הרמות והגילאים.

דפים: /styles (תיקיות שיעורים), /explore (חיפוש סרטונים), /series (סדרות לרכישה בודדת), /about, /dashboard, /live, /#Pricing, /#Contact

מנוי: ₪220/חודש, גישה מלאה, ביטול בכל עת. סדרות גם ללא מנוי.

כללים:
1. דבר בעברית
2. המלץ על תיקיות מתאימות לפי הקטלוג למטה
3. פורמט המלצת סרטון: [שם](/explore?video=שם) - בתיקיית "שם". ללא דומיין.
4. פורמט דף: [שם](/path)
5. תשובות קצרות, עד 3-4 המלצות
6. נושאים לא רלוונטיים - הפנה בנימוס לתוכן האתר
7. לא בטוח - ציין זאת והפנה לבועז

תיקיות שיעורים באתר:
`;

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "יותר מדי הודעות. נסו שוב בעוד דקה." },
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages are required" },
        { status: 400 }
      );
    }

    // Limit conversation history to last 6 messages to save tokens
    const recentMessages = messages.slice(-6);

    // Build the video catalog context
    const catalog = await buildVideoCatalog();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + catalog,
        },
        ...recentMessages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "מצטער, לא הצלחתי לעבד את הבקשה.";

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (error: any) {
    console.error("Chat API error:", error.message);
    return NextResponse.json(
      { success: false, error: "שגיאה בעיבוד ההודעה" },
      { status: 500 }
    );
  }
}
