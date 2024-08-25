import React from "react";
import Image from "next/image";
import contacMe from "../../../../public/contacMe.jpeg";
import Link from "next/link";

const Contact = () => {
  return (
    <div className="container pt-36 mx-auto md:px-6">
      <section className="mb-32">
        <div className="container mx-auto text-center lg:text-left xl:px-32">
          <div className=" grid items-center lg:grid-cols-2">
            <div className="mb-12 lg:mb-0">
              <div className="relative z-[1] block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] dark:shadow-black/20 md:px-12 lg:-mr-14 bg-[#FCF6F5] text-right">
                <h2 className="mb-12 text-3xl font-bold">צור קשר</h2>
                <p className="text-lg text-gray-700 mb-8">
                  אל תהססו לפנות בשאלות, בקשות מיוחדות או סתם להגיד שלום. אני
                  כאן כדי לדייק ולעזור עם כל מידע שאתם צריכים. בין אם זה שאלות
                  שעלו מהשיעורים, או שיתוף פעולה והגעה אליכם. שלחו אלי הודעת
                  וואטצאפ ואעשה את כל המאמצים לשוב אליכם בהקדם. המשוב והתקשורת
                  ביננו חשובים לי מאד. בואו נהיה בקשר!
                </p>

                <Link
                  href="https://wa.me/972527061212"
                  className=" bg-green-500 text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-green-600 flex justify-center"
                >
                  וואטסאפ
                </Link>
              </div>
            </div>

            <div>
              <Image
                src={contacMe}
                alt="image"
                className="w-full rounded-lg shadow-lg dark:shadow-black/20 ml-8"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
