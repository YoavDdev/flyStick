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
              <div className="relative z-[1] block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] dark:shadow-black/20 md:px-12 lg:-mr-14 bg-[#FCF6F5]">
                <h2 className="mb-12 text-3xl font-bold">Contact Me</h2>
                <p className="text-lg text-gray-700 mb-8">
                  Feel free to reach out to me if you have any questions,
                  inquiries, or just want to say hello. I'm here to assist you
                  with any information you may need. Whether it's about a
                  project, collaboration, or you simply want to connect, I'm
                  just a message away. You can use the WhatsApp button to send
                  me a direct message, and I'll get back to you as soon as
                  possible. Your feedback and communication are important to me,
                  and I look forward to hearing from you!
                </p>

                <Link
                  href="https://wa.me/972548132603"
                  className=" bg-green-500 text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-green-600 flex justify-center"
                >
                  WhatsApp
                </Link>
              </div>
            </div>

            <div>
              <Image
                src={contacMe}
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

export default Contact;
