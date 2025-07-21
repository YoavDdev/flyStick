import React from "react";

const AccessibilityStatement = () => {
  return (
    <div className="container pt-36 mx-auto md:px-6">
      <section className="mb-32">
        <div className="container mx-auto text-center lg:text-left xl:px-12">
          <div className="grid items-center lg:grid-cols-1">
            <div className="mb-12 lg:mb-0">
              <div className="relative z-[1] block rounded-2xl px-6 py-12 shadow-md md:px-12 bg-[#F7F3EB] border border-[#D5C4B7] text-right transition-all duration-300 hover:shadow-lg">
                <h2 className="mb-6 text-3xl font-bold text-[#5C4B3E]">הצהרת נגישות</h2>
                <div className="w-24 h-1 bg-[#B8A99C] rounded-full mb-8 mr-1"></div>
                <p className="text-lg text-[#5C4B3E] mb-8">
                  באתר &quot;Studio Boaz Online&quot; (FlyStick), אנו מחויבים לספק חוויית כושר ובריאות נגישה לכל המשתמשים. 
                  אנו מאמינים כי כל אדם, ללא קשר למגבלותיו, זכאי לגישה שווה לתכני הכושר והבריאות המקצועיים שלנו. 
                  הפלטפורמה שלנו בנויה על עקרונות נגישות מתקדמים המאפשרים לכל המשתמשים ליהנות מהמסע האישי שלהם לכושר ובריאות.
                </p>
                
                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">מאמצי הנגשה שנעשו באתר</strong>
                </p>

                <ul className="text-lg text-[#5C4B3E] list-disc list-inside mb-8 marker:text-[#B8A99C]">
                  <li>
                    <strong>ניווט מקלדת מלא:</strong> כל הפונקציות באתר נגישות באמצעות מקלדת בלבד, 
                    כולל נגן הווידאו, תפריטי הניווט וכל הכפתורים האינטראקטיביים.
                  </li>
                  <li>
                    <strong>תמיכה בקוראי מסך:</strong> האתר בנוי עם סמנטיקה נכונה של HTML5 
                    ותגי ARIA המאפשרים לקוראי מסך לתאר במדויק את התכנים והפונקציות.
                  </li>
                  <li>
                    <strong>ניגודיות צבעים אופטימלית:</strong> כל הטקסטים והאלמנטים הויזואליים 
                    עומדים בתקני WCAG 2.0 AA לניגודיות, המבטיחים קריאות מיטבית.
                  </li>
                  <li>
                    <strong>תיאורים אלטרנטיביים מקיפים:</strong> כל התמונות, הסרטונים והאלמנטים 
                    הגרפיים כוללים תיאורים טקסטואליים מפורטים (alt text) המתאימים לתוכן הכושר.
                  </li>
                  <li>
                    <strong>עיצוב רספונסיבי ונגיש:</strong> הפלטפורמה מותאמת לכל הגדלי המסך 
                    ומכשירי הקלט, כולל מסכי מגע ומכשירים מסייעים.
                  </li>
                  <li>
                    <strong>נגן וידאו נגיש:</strong> נגן הווידאו כולל בקרות מקלדת, תמיכה בכתוביות 
                    ותיאורי אודיו עבור תכני הכושר והבריאות.
                  </li>
                </ul>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">עמידה בתקנים</strong>
                  <br />
                  פלטפורמת FlyStick עומדת בתקנות שוויון זכויות לאנשים עם מוגבלות (התקנות לנגישות שירותי אינטרנט), התשע"ט-2019, 
                  ומיושמת על פי הנחיות WCAG 2.0 ברמה AA. האתר נבנה עם טכנולוגיות מתקדמות המבטיחות תאימות מלאה לכלי נגישות מודרניים.
                </p>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">שיפור מתמיד</strong>
                  <br />
                  אנו מחויבים לשיפור מתמיד של חוויית הנגישות בפלטפורמה. צוות הפיתוח שלנו עורך בדיקות נגישות שוטפות 
                  ומיישם עדכונים טכנולוgiים חדשים. אם נתקלת בקושי כלשהו או יש לך הצעות לשיפור, 
                  נשמח לשמוע ממך ולטפל בנושא במהירות.
                </p>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">יצירת קשר לנגישות</strong>
                  <br />
                  אם נתקלת בקושי נגישות כלשהו בפלטפורמה, יש לך הצעות לשיפור או שאלות בנושא נגישות, 
                  אנא פנה אלינו ונטפל בפנייתך במהירות:
                  <br /><br />
                  <strong>דואר אלקטרוני:</strong> <a href="mailto:zzaaoobb@gmail.com" className="text-[#8B7D6F] hover:text-[#7D6E61] underline transition-all duration-300">zzaaoobb@gmail.com</a>
                  <br />
                  <strong>אתר אינטרנט:</strong> <a href="https://studioboazonline.com" className="text-[#8B7D6F] hover:text-[#7D6E61] underline transition-all duration-300">www.studioboazonline.com</a>
                </p>

                <p className="text-lg text-[#5C4B3E]">
                  <strong className="text-[#7D6E61]">עדכון הצהרת נגישות</strong>
                  <br />
                  הצהרת נגישות זו עודכנה לאחרונה בתאריך 21.01.2025. אנו מתחייבים לעדכן את הצהרת הנגישות 
                  באופן שוטף, לבצע בדיקות נגישות שוטפות וליישם שיפורים טכנולוגיים חדשים לשיפור חוויית המשתמש.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityStatement;
