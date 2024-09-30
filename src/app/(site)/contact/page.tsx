import React from "react";
import Image from "next/image";
import contactMe4 from "../../../../public/contactMe4.jpeg";
import contactMePhone4 from "../../../../public/contactMePhone4.jpeg";

import Link from "next/link";

const Contact = () => {
  return (
    <div className="relative h-screen">
      {/* Background Image for Desktop */}
      <div className="absolute inset-0 z-[-1 hidden md:block">
        <Image
          src={contactMe4}
          alt="Contact Background"
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Background Image for Mobile */}
      <div className="absolute inset-0 z-[-1 block md:hidden">
        <Image
          src={contactMePhone4}
          alt="Contact Background Mobile"
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Text Overlay */}
      <div className="relative z-[1] flex flex-col items-center justify-center h-full text-center px-6">
        <div className=" p-10 max-w-xl">
          <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            צור קשר
          </h2>
          <p className="text-lg text-gray-700  md:text-center text-right ">
            אל תהססו לפנות בשאלות, בקשות מיוחדות או סתם להגיד שלום.  
          </p>
          <p className="text-lg text-gray-700 mb-4 md:text-center text-right ">
            אני כאן
            כדי לדייק ולעזור עם כל מידע שאתם צריכים.
          </p>
          <p className="text-lg text-gray-700 mb-4 md:text-center text-right ">
            בין אם זה שאלות שעלו מהשיעורים, או שיתוף פעולה והגעה אליכם. שלחו אלי הודעת וואטצאפ ואעשה את כל המאמצים לשוב אליכם בהקדם.
          </p>
          <p className="text-lg text-gray-700 mb-6 md:text-center text-right">
            המשוב והתקשורת ביננו חשובים לי מאד. בואו נהיה בקשר!
          </p>
          <Link
            href="https://wa.me/972527061212"
            className="bg-green-500 text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-green-600 "
          >
            וואטסאפ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;
