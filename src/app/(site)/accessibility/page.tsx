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
                  באתר &quot;Boaz Nahaissi&apos;s Online Studio&quot;, אנו שמים
                  דגש רב על נגישות ומאמינים כי כל משתמש, עם כל מגבלה שהיא, זכאי
                  לקבל גישה שווה לתכנים ושירותים המוצעים באתר. אנו פועלים לשיפור
                  מתמיד של נגישות האתר מתוך רצון לאפשר לכל המשתמשים, כולל אנשים
                  עם מוגבלויות, חוויית שימוש נוחה ושווה.
                </p>
                
                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">מאמצי הנגשה שנעשו באתר</strong>
                </p>

                <ul className="text-lg text-[#5C4B3E] list-disc list-inside mb-8 marker:text-[#B8A99C]">
                  <li>
                    נגישות באמצעות מקלדת: האתר מאפשר ניווט מלא באמצעות מקלדת
                    בלבד, ללא צורך בשימוש בעכבר.
                  </li>
                  <li>
                    התאמות לקוראי מסך: האתר מותאם לעבודה עם קוראי מסך, כך
                    שמשתמשים יכולים לנווט ולהבין את התכנים בצורה מלאה.
                  </li>
                  <li>
                    ניגודיות צבעים: הקפדנו על שימוש בניגודיות צבעים ברמה מספקת
                    בין טקסטים לרקע, כדי להקל על קריאה עבור משתמשים עם ליקויי
                    ראייה.
                  </li>
                  <li>
                    תיאורים אלטרנטיביים לתמונות: לכל התמונות באתר יש תיאור
                    טקסטואלי אלטרנטיבי (alt text) כדי להבטיח שמשתמשים עם
                    מוגבלויות ראייה יוכלו להבין את התוכן.
                  </li>
                </ul>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">עמידה בתקנים</strong>
                  <br />
                  האתר עומד בתקן הישראלי לנגישות אתרי אינטרנט על פי תקן WCAG 2.0
                  ברמה AA.
                </p>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">מגבלות נגישות</strong>
                  <br />
                  אנו עושים כל מאמץ להבטיח את נגישות האתר, אך יתכן שישנן בעיות
                  נגישות מסוימות שטרם זוהו או טופלו. אם נתקלת בבעיה, נשמח לשמוע
                  ממך ולסייע בכל דרך אפשרית.
                </p>

                <p className="text-lg text-[#5C4B3E] mb-8">
                  <strong className="text-[#7D6E61]">יצירת קשר</strong>
                  <br />
                  אם נתקלת בבעיה כלשהי בנגישות האתר, או אם יש לך שאלות או בקשות
                  בנוגע לנגישות, אנא פנה אלינו:
                  <br />
                  דוא&quot;ל: <span className="text-[#8B7D6F] hover:underline transition-all duration-300">info@studioboazonline.com</span>
                </p>

                <p className="text-lg text-[#5C4B3E]">
                  <strong className="text-[#7D6E61]">עדכון הצהרת נגישות</strong>
                  <br />
                  הצהרת נגישות זו עודכנה לאחרונה בתאריך 21.08.2024. אנו מתחייבים
                  לעדכן את הצהרת הנגישות באופן שוטף ולבצע שיפורים נוספים ככל
                  שנדרש.
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
