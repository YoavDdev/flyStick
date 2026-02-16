export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
import { folderMetadata } from "@/config/folder-metadata";
import { knowledgeBase } from "@/config/knowledge-base";

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

// Cache for folder catalog - refresh every hour
let folderCatalogCache: string | null = null;
let folderCatalogTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Cache for folder videos - keyed by folder name, refresh every hour
const folderVideosCache = new Map<string, { data: string; timestamp: number }>();

// Build a compact folder-level summary (no individual videos) to minimize tokens
async function buildFolderCatalog(): Promise<string> {
  const now = Date.now();
  if (folderCatalogCache && now - folderCatalogTimestamp < CACHE_DURATION) {
    return folderCatalogCache;
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

    folderCatalogCache = catalogParts.join("\n");
    folderCatalogTimestamp = now;
    return folderCatalogCache;
  } catch (error) {
    console.error("Error building folder catalog:", error);
    return "לא ניתן לטעון את קטלוג הסרטונים כרגע.";
  }
}

// Fetch videos for a specific folder by name
async function fetchFolderVideos(folderName: string): Promise<string> {
  const now = Date.now();
  const cached = folderVideosCache.get(folderName);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const accessToken = process.env.VIMEO_TOKEN;
  if (!accessToken) {
    return "לא ניתן לטעון סרטונים כרגע.";
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    // First find the folder URI
    const foldersRes = await axios.get("https://api.vimeo.com/me/projects", {
      headers,
      params: { per_page: 100, fields: "uri,name" },
      timeout: 15000,
    });

    const folder = (foldersRes.data.data || []).find(
      (f: any) => f.name === folderName
    );

    if (!folder) {
      return `לא נמצאה תיקיה בשם "${folderName}".`;
    }

    const videosRes = await axios.get(
      `https://api.vimeo.com${folder.uri}/videos`,
      {
        headers,
        params: { fields: "name,duration,description", per_page: 50 },
        timeout: 10000,
      }
    );

    const videos = videosRes.data.data || [];
    if (videos.length === 0) {
      return `אין סרטונים בתיקיה "${folderName}".`;
    }

    const videoList = videos.map((v: any) => {
      const mins = v.duration ? Math.round(v.duration / 60) : 0;
      const desc = v.description ? ` - ${v.description.slice(0, 80)}` : "";
      return `• ${v.name} (${mins} דקות)${desc}`;
    }).join("\n");

    const result = `סרטונים בתיקיה "${folderName}":\n${videoList}`;
    folderVideosCache.set(folderName, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.error(`Error fetching videos for folder "${folderName}":`, error);
    return `שגיאה בטעינת סרטונים מתיקיה "${folderName}".`;
  }
}

// Search knowledge base by keywords
function searchKnowledge(query: string): string {
  const queryLower = query.toLowerCase();
  const matches = knowledgeBase.filter((chunk) =>
    chunk.keywords.some((kw) => queryLower.includes(kw.toLowerCase())) ||
    chunk.topic.toLowerCase().includes(queryLower)
  );

  if (matches.length === 0) {
    return "לא נמצא מידע ספציפי בנושא זה במאגר הידע.";
  }

  return matches
    .slice(0, 3)
    .map((m) => `**${m.topic}**\n${m.content}`)
    .join("\n\n");
}

// OpenAI function definitions
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_folder_videos",
      description: "מביא את רשימת הסרטונים מתיקיה ספציפית באתר. השתמש בזה כדי להמליץ על סרטונים ספציפיים.",
      parameters: {
        type: "object",
        properties: {
          folder_name: {
            type: "string",
            description: "שם התיקיה בדיוק כפי שמופיע בקטלוג (למשל: \"קונטרולוג'י מתחילים\")",
          },
        },
        required: ["folder_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_knowledge",
      description: "מביא ידע על הפילוסופיה של בועז, עקרונות התנועה, נשימה, גוף כיישות מים, פלקשיין/אקסטנשיין, נוכחות והתבוננות, כאב כרוני, וכו'. השתמש כשהמשתמש שואל על הגישה הפילוסופית או עקרונות יסוד.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "הנושא או מילות מפתח לחיפוש (למשל: 'נשימה', 'פלקשיין', 'כאב כרוני', 'נוכחות')",
          },
        },
        required: ["topic"],
      },
    },
  },
];

const SYSTEM_PROMPT = `אתה העוזר הדיגיטלי של "סטודיו בועז אונליין" - פלטפורמה לאימונים, תנועה מרפאה וכושר של בועז נחייסי.

בועז נחייסי: מייסד "בית הספר של בועז נחייסי" (2012), יוצר שיטת הפלייסטיק (2013) - אימון עם מקל. מורה לפילאטיס, קונטרולוג'י, תנועה מרפאה. התחיל בגיל 38. מלמד בארץ ובעולם.

הפילוסופיה: בועז מלמד על הגוף כיישות מים (70% מים), חשיבות הנשימה כפונקציה ראשונית, תרגול פיסי כגילוי רוחני, נוכחות והתבוננות, והתנועה בין פלקשיין (כיפוף, אהבה כלפי חוץ) לאקסטנשיין (פתיחה, אהבה עצמית).

האתר מציע מאות שיעורי וידאו: קונטרולוג'י, פלייסטיק, אימוני קיר, שיעורי כסא, קוויקיז (קצרים), הרצאות, סדנאות, נשימה ותנועה. לכל הרמות והגילאים.

דפים: /styles (תיקיות שיעורים), /explore (חיפוש סרטונים), /series (סדרות לרכישה בודדת), /about, /dashboard, /live, /#Pricing, /#Contact

מנוי: ₪220/חודש, גישה מלאה, ביטול בכל עת. סדרות גם ללא מנוי.

כללים:
1. דבר בעברית
2. כשמשתמש שואל על עקרונות, פילוסופיה או גישה - השתמש בפונקציה get_knowledge
3. כשמשתמש מבקש המלצה על שיעורים - השתמש בפונקציה get_folder_videos
4. פורמט המלצת סרטון: [שם](/explore?video=שם) - בתיקיית "שם". ללא דומיין.
5. פורמט דף: [שם](/path)
6. תשובות קצרות, עד 3-4 המלצות
7. נושאים לא רלוונטיים - הפנה בנימוס לתוכן האתר
8. לא בטוח - ציין זאת והפנה לבועז

תיקיות שיעורים באתר:
`;export async function POST(request: NextRequest) {
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

    // Build the folder catalog context
    const catalog = await buildFolderCatalog();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // First call - AI decides if it needs specific folder videos
    const firstCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + catalog,
        },
        ...recentMessages,
      ],
      tools,
      tool_choice: "auto",
      max_tokens: 500,
      temperature: 0.7,
    });

    const firstMessage = firstCompletion.choices[0]?.message;

    // If the AI wants to call functions, execute them and send results back
    if (firstMessage?.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolCall = firstMessage.tool_calls[0] as any;
      const args = JSON.parse(toolCall.function.arguments);
      
      let toolResult = "";
      if (toolCall.function.name === "get_folder_videos") {
        toolResult = await fetchFolderVideos(args.folder_name);
      } else if (toolCall.function.name === "get_knowledge") {
        toolResult = searchKnowledge(args.topic);
      }

      // Second call - AI generates final answer with function results
      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT + catalog,
          },
          ...recentMessages,
          firstMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = secondCompletion.choices[0]?.message?.content || "מצטער, לא הצלחתי לעבד את הבקשה.";
      return NextResponse.json({ success: true, message: reply });
    }

    // No tool call - AI answered directly (e.g. general questions)
    const reply = firstMessage?.content || "מצטער, לא הצלחתי לעבד את הבקשה.";

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
