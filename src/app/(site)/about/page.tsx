import React from "react";
import Image from "next/image";
import boazAbout from "../../../../public/BoazAbout.jpeg";

const About = () => {
  return (
    <div className="container pt-36 mx-auto md:px-6">
      <section className="mb-32">
        <div className="container mx-auto text-center lg:text-left xl:px-32">
          <div className=" grid items-center lg:grid-cols-2">
            <div className="mb-12 lg:mb-0">
              <div className="relative z-[1] block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] dark:shadow-black/20 md:px-12 lg:-mr-14 bg-[#FCF6F5]">
                <h2 className="mb-8 text-4xl md:text-5xl lg:text-6xl font-bold text-[#990011]">
                  Greetings!
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Allow me to introduce myself, I am Boaz Nahaissi and my
                  journey into the realm of movement has been an extraordinary
                  one. Unlike others who may have been immersed in established
                  movements since a young age, I embarked on this path later in
                  life, lacking the inherent flexibility and physical connection
                  that some may possess from early exposure. Through a deeply
                  personal process, I have developed unique insights and
                  expertise in this field.
                </p>
                <p className="text-lg text-gray-700">
                  I am the heart behind the &apos;Boaz Nahaissi School For
                  Movement,&apos; a place of innovation and transformation. My
                  passion led to the birth of the Flystick method—a
                  revolutionary technique that has made waves not only across
                  Israel but worldwide.
                </p>
                <p className="text-lg text-gray-700">
                  Diving deep into Pilates/Controlology and Flystick training,
                  I&apos;ve honed expertise that extends beyond conventional
                  boundaries. Besides the studio, I share my knowledge in gyms,
                  workshops, training sessions, teacher&apos;s courses, and
                  across the globe.
                </p>
                <p className="text-lg text-gray-700">
                  I believe movement wields immense power, fostering bodily
                  balance, function, self-discovery, and resilience in
                  life&apos;s challenges. Just as water flows, movement courses
                  through us. We are water - we are movement.
                </p>
                <p className="text-lg text-gray-700">
                  Join me, and together, let&apos;s nurture your body and soul
                  along this transformative path.
                </p>
                <p className="mb-0 text-lg md:text-xl pt-10 ">Boaz Nahaissi.</p>
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
