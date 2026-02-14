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

// Build a text catalog of all videos grouped by folder
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
    // Fetch all folders
    const foldersRes = await axios.get("https://api.vimeo.com/me/projects", {
      headers,
      params: { per_page: 100 },
      timeout: 15000,
    });

    const folders = foldersRes.data.data || [];
    const catalogParts: string[] = [];

    // Fetch videos for each visible folder
    for (const folder of folders) {
      const meta = folderMetadata[folder.name];
      if (!meta || !meta.isVisible) continue;

      try {
        const videosRes = await axios.get(
          `https://api.vimeo.com${folder.uri}/videos`,
          {
            headers,
            params: {
              fields: "uri,name,description,duration",
              per_page: 100,
            },
            timeout: 10000,
          }
        );

        const videos = videosRes.data.data || [];
        if (videos.length === 0) continue;

        const folderSection = [
          `\n📁 תיקיה: "${folder.name}"`,
          `   תיאור: ${meta.description}`,
          `   רמה: ${meta.levelHebrew}`,
          `   קטגוריה: ${meta.category}`,
          `   סרטונים:`,
        ];

        videos.forEach((video: any) => {
          const mins = video.duration
            ? Math.round(video.duration / 60)
            : null;
          const durationStr = mins ? ` (${mins} דקות)` : "";
          const desc = video.description
            ? ` - ${video.description.slice(0, 100)}`
            : "";
          folderSection.push(
            `   • ${video.name}${durationStr}${desc} [תיקיה: ${folder.name}]`
          );
        });

        catalogParts.push(folderSection.join("\n"));
      } catch (err) {
        // Skip folders that fail
        continue;
      }
    }

    videoCatalogCache = catalogParts.join("\n");
    videoCatalogTimestamp = now;
    return videoCatalogCache;
  } catch (error) {
    console.error("Error building video catalog:", error);
    return "לא ניתן לטעון את קטלוג הסרטונים כרגע.";
  }
}

const SYSTEM_PROMPT = `אתה העוזר הדיגיטלי של "סטודיו בועז אונליין" - פלטפורמת אימונים, תנועה מרפאה וכושר של בועז נחייסי.

═══════════════════════════════
מי זה בועז נחייסי?
═══════════════════════════════
- מייסד "בית הספר של בועז נחייסי" מאז 2012
- יוצר שיטת הפלייסטיק (FlyStick) ב-2013 - שיטת אימון ייחודית עם מקל
- מורה ומנחה לפילאטיס, קונטרולוג'י, תנועה מרפאה וחיבור גוף-נפש
- מלמד בפסטיבלים, כנסים, קהל אולימפי, קורסי מורים, הכשרות והשתלמויות - בארץ ובעולם
- התחיל את דרכו בעולם התנועה בגיל 38, ללא ניסיון תרגולי
- מאמין באהבת הגוף וטיפוח הנפש, ושלתנועה יש כוח עצום בהבראה
- הפילוסופיה שלו: דרך תנועה ונשימה אנו גוברים על אתגרי החיים

═══════════════════════════════
מה האתר מציע?
═══════════════════════════════
סטודיו בועז אונליין הוא פלטפורמת וידאו מקצועית עם מאות שיעורים בנושאים:
- **קונטרולוג'י (Contrology)** - פילאטיס קלאסי ומתקדם, תרגילים מקוריים של ג'וזף פילאטיס
- **פלייסטיק (FlyStick)** - שיטה ייחודית שהמציא בועז, אימון עם מקל
- **אימוני קיר** - תרגילים מול הקיר, מצוין ליציבות ולגמישות
- **שיעורי כסא מרפאים** - תרגולים על כסא, מתאימים גם למי שקשה לו לעמוד או לשכב על הרצפה
- **קוויקיז (Quickies)** - שיעורים קצרים (8-20 דקות) למי שאין לו הרבה זמן
- **הרצאות ולימודי תודעה** - תוכן תיאורטי על אנטומיה, תודעה וחיבור גוף-נפש
- **סדנאות** - סדנאות מעמיקות בנושאים ספציפיים
- **אימונים לפלג גוף עליון/תחתון** - אימונים ממוקדים
- **נשימה ותנועה** - שילוב עבודת נשימה עם תנועה

השיעורים מתאימים לכל הרמות - מתחילים עד מתקדמים, כל הגילאים, גברים ונשים.

═══════════════════════════════
דפים חשובים באתר
═══════════════════════════════
- **/styles** (טכניקות) - כל תיקיות השיעורים לפי קטגוריה. כאן המנויים צופים בתוכן
- **/explore** (חיפוש) - מנוע חיפוש לכל הסרטונים באתר. פתוח לכולם לחיפוש
- **/series** (קורסים/סדרות) - סדרות שיעורים מובנות שניתן לרכוש בנפרד, גם ללא מנוי
- **/about** (אודות) - הסיפור של בועז וההשקפה שלו
- **/dashboard** (אזור אישי) - לוח בקרה אישי למנויים עם מעקב התקדמות
- **/live** (שידור חי) - שיעורים בשידור חי כשיש
- **/#Pricing** (מחירון) - פרטי מנוי ומחירים
- **/#Contact** (צור קשר) - יצירת קשר עם בועז

═══════════════════════════════
מחירים ומנוי
═══════════════════════════════
- **מנוי חודשי: ₪220 לחודש** - גישה מלאה לכל התכנים
- המנוי מתחדש מדי חודש, ניתן לבטל בכל עת ללא התחייבות
- מה כולל המנוי:
  • מאות שיעורים מקצועיים בנושאי תנועה, נשימה, יציבה וריפוי
  • כלים מתקדמים לשיפור הגוף והנפש לכל רמה ומגדר
  • שיטות מגוונות: קונטרולוג'י, פילאטיס, תודעה ופלייסטיק
  • אימונים קצרים וארוכים המותאמים לזמן שלך
  • שמירת סרטונים מועדפים והמשך צפייה מהנקודה האחרונה
  • תמיכה אישית וקהילה מקצועית
  • עדכונים ותכונות חדשות באופן קבוע
- **סדרות (קורסים) לרכישה בודדת** - ניתן לרכוש סדרות ספציפיות ללא מנוי חודשי, בעמוד /series

═══════════════════════════════
התפקיד שלך
═══════════════════════════════
- לעזור למשתמשים למצוא סרטוני אימון מתאימים
- להמליץ על שיעורים בהתאם לרמה, לנושא ולצרכים
- לענות על שאלות על האתר, בועז, המחירים, הדפים והתכנים
- להיות חם, מקצועי ומזמין - כמו בועז עצמו
- לעודד את המשתמש לנסות ולחקור תכנים חדשים

═══════════════════════════════
כללים חשובים
═══════════════════════════════
1. תמיד דבר בעברית
2. כשאתה ממליץ על סרטון, ציין את שם התיקיה שהוא נמצא בה
3. אם המשתמש שואל על משהו שלא קשור לאתר/אימונים/בריאות, ענה בנימוס שאתה מתמקד בעזרה עם תוכן האתר
4. אם אתה לא בטוח, תגיד שאתה לא בטוח ותציע לפנות לבועז ישירות
5. תשובות קצרות וברורות - לא יותר מ-3-4 סרטונים בהמלצה
6. כשממליצים על סרטון, הפורמט חייב להיות בדיוק כזה (נתיב יחסי בלבד, ללא דומיין):
   [שם הסרטון](/explore?video=שם הסרטון) (XX דקות) - בתיקיית "שם התיקיה"
   אסור לכלול https:// או כל דומיין. רק נתיב שמתחיל ב-/explore
7. כשמפנים לדף באתר (לא סרטון), השתמש בפורמט: [שם הדף](/path) - למשל [עמוד המחירים](/#Pricing) או [הקורסים](/series)
8. אם מישהו שואל "מי אתה" - ענה שאתה העוזר הדיגיטלי של סטודיו בועז, כאן לעזור למצוא שיעורים ולענות על שאלות

הנה קטלוג הסרטונים הזמינים באתר:
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

    // Limit conversation history to last 10 messages to save tokens
    const recentMessages = messages.slice(-10);

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
