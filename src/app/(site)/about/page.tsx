import React from "react";
import Image from "next/image";
import boazAbout from "../../../../public/BoazAbout.jpeg";

const About = () => {
  return (
    <div className="container pt-36 mx-auto md:px-6">
      <section className="mb-32">
        <div className="container mx-auto text-center lg:text-left xl:px-32">
          <div className="grid items-center lg:grid-cols-2">
            <div className="mb-12 lg:mb-0">
              <div className="relative z-[1] block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] dark:shadow-black/20 md:px-12 lg:-mr-14 bg-[#FCF6F5] text-right">
                <h2 className="mb-8 text-4xl md:text-5xl lg:text-6xl font-bold text-[#990011]">
                  מנויים יקרים.
                </h2>
                <p className="text-lg text-gray-700">
                  שמח שהגעתם לסטודיו המקוון שלי ואני מקווה שהוא גורם לכם לעונג
                  ובריאות גופניים. דרכי בעולם התנועה החלה בגיל 38 כשאני חסר
                  נסיון תרגולי וכמובן, חסר גמישות ומודעות סומאטית. התשוקה לחקור
                  ולדעת הובילו אותי לדרך שלא ידעתי בתחילתה לאן היא תוביל אותי
                  וכמה תובנות היא תעניק לי אותם אני מגיש לכם באהבה בכל שיעור כאן
                  בסטודיו. הידע והנסיון שלי התפתחו דרך תהליך אישי ומעמיק כך שכל
                  המידע בסטודיו הוא ממקור ראשון ואינו העתקה והדבקה.
                </p>
                <p className="text-lg text-gray-700">
                  אני המייסד של ׳בית הספר של בועז נחייסי׳ מאז 2012, מקום של
                  חדשנות, יזמות ועידוד לחיבור ושינוי. החוויה הגופנית הביאה אותי
                  להמציא את שיטת הפלייסטיק ב-2013 ומאז ועד היום אני מלמד
                  בפסטיבלים, כנסים, קהל אולימפי, קבוצות, קורסי מורים, הכשרות,
                  השתלמויות, חברות וועדי עובדים. מלמד גם בארץ וגם בעולם. חדשנית
                  שזכתה להצלחה בישראל ובעולם.
                </p>
                <p className="text-lg text-gray-700">
                  אני מאמין באהבת הגוף וטיפוח הנפש. לתנועה יש כח עצום בהבראה.
                  היא מקדמת איזון בין הגוף לנפש הפועלת בתוכו, היא מעודדת גילוי
                  עצמי כפי שמתגלים שרירים וסיבים חדשים כך גם תפיסות המציאות
                  נהיות עשירות, מגוונות ומרווחות ללא מתח וסטרס. דרך התנועה אנו
                  גוברים על אתגרי החיים ואם נלמד לטפח את הזרימה שלה בגוף, כמו
                  שמים זורמים, נשוט ביתר קלות בנהר חיינו.
                </p>
                <p className="text-lg text-gray-700">
                  כיישות מים אני פונה אליכם בחיבוק גדול יישויות מים יקרות ומבקש
                  שלא תעצרו לעולם את הכח המרפא והגדול שיש לנו- נשימה ותנועה יחד
                  וכאן בסטודיו אני מרחיב את הלימוד וצולל לעומקים שיובילו בסופו
                  של דבר לסנכרון בין השתיים ואלו, יחזירו את הגוף שלכם להיות רענן
                  וטהור כבימי ילדותינו. הצטרפו אלי ויחד נשפר ונשדרג את מערכת
                  הגופנפש שלכם במסע החיים הפגיע והמשתנה הזה.
                </p>

                <p className="mb-0 text-lg md:text-xl pt-10">בועז.</p>
              </div>
            </div>

            <div>
              <Image
                src={boazAbout}
                alt="image"
                className="w-full rounded-lg shadow-lg dark:shadow-black/20"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
