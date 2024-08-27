import React from "react";
import Image from "next/image";
import contacMe2 from "../../../../public/contacMe2.jpeg";
import Link from "next/link";

const Contact = () => {
  return (
    <div className="relative isolate overflow-hidden pt-36 sm:pt-64 md:h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full object-cover transition-opacity">
        <Image
          src={contacMe2}
          alt="Contact Background"
          layout="fill"
          className="object-cover mt-20"
          priority
        />
      </div>
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div />
      </div>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-6xl">
          צור קשר
        </h2>
        <p className="mt-6 sm:text-xl mx-5 text-white">
          אל תהססו לפנות בשאלות, בקשות מיוחדות או סתם להגיד שלום. אני כאן כדי לדייק ולעזור עם כל מידע שאתם צריכים. בין אם זה שאלות שעלו מהשיעורים, או שיתוף פעולה והגעה אליכם. שלחו אלי הודעת וואטצאפ ואעשה את כל המאמצים לשוב אליכם בהקדם. המשוב והתקשורת ביננו חשובים לי מאד. בואו נהיה בקשר!
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center transition-all duration-500 ease-in-out">
          <Link
            href="https://wa.me/972527061212"
            className="bg-green-500 text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-green-600"          >
            וואטסאפ
          </Link>
        </div>
      </div>
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
};

export default Contact;
