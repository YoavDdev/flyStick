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
                  שלום!
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  אני בועז נחייסי. הדרך שלי בעולם התנועה היא ייחודית. בניגוד
                  לרבים שמתחילים עם שיטות מסודרות ותנועות פיזיות, התחלתי מאוחר
                  יותר ללא גמישות טבעית או קשר לגוף. הידע והניסיון שלי התפתחו
                  דרך תהליך אישי ומעמיק.
                </p>
                <p className="text-lg text-gray-700">
                  אני עומד מאחורי &apos;בית הספר לתנועה של בועז נחייסי&apos;, מקום של
                  חדשנות ושינוי. התשוקה שלי הביאה להמצאת שיטת Flystick – טכניקה
                  חדשנית שזכתה להצלחה בישראל ובעולם.
                </p>
                <p className="text-lg text-gray-700">
                  למדתי לעומק בפילאטיס, קונטרולוגיה, שיטת Flystick ועוד. אני
                  מלמד באולמות, חדרי כושר, סדנאות, קורסים למורים בישראל ובעולם.
                </p>
                <p className="text-lg text-gray-700">
                  אני מאמין שתנועה יש לה כוח עצום, מקדמת איזון גופני, תפקוד,
                  גילוי עצמי והתמודדות עם אתגרי החיים. כמו שמים זורמים, כך גם
                  תנועה זורמת בנו. אנחנו מים - אנחנו תנועה.
                </p>
                <p className="text-lg text-gray-700">
                  הצטרפו אליי, ונשפר יחד את הגוף והנפש שלכם במסע המשתנה הזה.
                </p>
                <p className="mb-0 text-lg md:text-xl pt-10">בועז נחייסי.</p>
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
