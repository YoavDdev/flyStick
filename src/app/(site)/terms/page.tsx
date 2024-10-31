import React from "react";
import Link from "next/link";

const TermsAndConditions = () => {
  return (
    <div className="container pt-36 mx-auto md:px-6">
      <section className="mb-32">
        <div className="container mx-auto text-center lg:text-left xl:px-12">
          <div className="grid items-center lg:grid-cols-1">
            <div className="mb-12 lg:mb-0">
              <div className="relative z-[1] block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] dark:shadow-black/20 md:px-12 bg-[#FCF6F5] text-right">
                <h2 className="mb-12 text-3xl font-bold">
                  תקנון אתר - סטודיו אונליין של בועז נחייסי
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  תאריך עדכון אחרון: 21/08/2024
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>1. כללי</strong>
                  <br />
                  1.1. ברוכים הבאים לאתר &quot;סטודיו אונליין של בועז נחייסי&quot; (להלן:
                    &quot;<a href='https://www.studioboazonline.com/'>https://www.studioboazonline.com/</a>&quot;).
                  <br />
                  1.2. תקנון זה מהווה הסכם מחייב בינך (להלן: &quot;המשתמש&quot;) לבין
                  החברה. אנא קרא בעיון את התקנון, שכן שימוש באתר מעיד על הסכמתך
                  לתנאים אלו.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>2. שימוש באתר</strong>
                  <br />
                  2.1. האתר מספק מידע ושירותים בתחומים שונים הקשורים לתחום
                  [לדוגמה: פעילות גופנית, פילאטיס וכדומה].
                  <br />
                  2.2. המשתמש מתחייב להשתמש באתר בהתאם לתקנון זה ולחוקים ולתקנות
                  החלים במדינת ישראל.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>3. רכישת שירותים ומוצרים</strong>
                  <br />
                  3.1. האתר מאפשר למשתמש לרכוש שירותים ומוצרים שונים, כפי שמפורט
                  באתר.
                  <br />
                  3.2. כל רכישה באתר כפופה לתנאי שימוש ספציפיים למוצר או השירות
                  הנרכש.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>4. זכויות יוצרים וקניין רוחני</strong>
                  <br />
                  4.1. כל התכנים המופיעים באתר, כולל טקסטים, תמונות, גרפיקה,
                  לוגואים, סרטונים וכו&apos;, מוגנים בזכויות יוצרים השייכות לחברה או
                  לצדדים שלישיים, ואין להעתיק, לשכפל, להפיץ או להשתמש בהם ללא
                  אישור מראש ובכתב מהחברה.
                  <br />
                  4.2. המשתמש מתחייב שלא להפר זכויות יוצרים, סימני מסחר או כל
                  זכויות קניין רוחני אחרות הקיימות באתר.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>5. פרטיות</strong>
                  <br />
                  5.1. החברה מכבדת את פרטיות המשתמשים ופועלת בהתאם להוראות חוק
                  הגנת הפרטיות.
                  <br />
                  5.2. מידע נוסף על ניהול הפרטיות והשימוש בנתוני המשתמש ניתן
                  למצוא{" "}
                  <Link
                    className="text-black hover:text-gray-500"
                    href="/privacyPolicy"
                  >
                    מדיניות פרטיות
                  </Link>
                  .
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>6. אחריות</strong>
                  <br />
                  6.1. החברה עושה כל מאמץ לשמור על תקינות ואיכות האתר והשירותים
                  הניתנים בו, אך אינה מתחייבת לכך שהשירותים יהיו זמינים בכל עת,
                  ללא תקלות או שגיאות.
                  <br />
                  6.2. החברה לא תשא באחריות לכל נזק ישיר או עקיף הנגרם כתוצאה
                  משימוש באתר.
                  <br />
                  6.3. המשתמש מסכים ומאשר כי כל פעילות גופנית או אחרת המתבצעת על סמך מידע או תוכן מהאתר היא על אחריותו בלבד, והחברה אינה נושאת באחריות לכל נזק גופני, בריאותי או כל נזק אחר שייגרם כתוצאה מהשימוש באתר.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>7. שינויים בתקנון</strong>
                  <br />
                  7.1. החברה שומרת לעצמה את הזכות לשנות תקנון זה בכל עת. כל
                  שינוי ייכנס לתוקף מיידי עם פרסומו באתר.
                  <br />
                  7.2. המשך שימוש באתר לאחר שינוי התקנון מהווה את הסכמת המשתמש
                  לשינויים אלה.
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  <strong>8. יצירת קשר</strong>
                  <br />
                  8.1. בכל שאלה או בקשה, ניתן לפנות לחברה בדוא&quot;ל
                  info@studioboazonline.com או בטלפון 052-706-1212.
                </p>

                <p className="text-lg text-gray-700">
                  <strong>9. סמכות שיפוט</strong>
                  <br />
                  9.1. תקנון זה והתקנון לשימוש באתר כפופים לדיני מדינת ישראל.
                  <br />
                  9.2. הסמכות הבלעדית לדון בכל סכסוך הנובע או הקשור לתקנון זה
                  תינתן לבית המשפט המוסמך באזור.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
