import React from "react";
import Image from "next/image";
import boazAbout from "../../../public/BoazAbout.jpeg";

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
                <p className="mb-8 pb-2 text-lg md:text-xl lg:pb-0">
                  I'm Boaz Nahaisi, and I invite you to explore my profound
                  journey through the world of movement. Let me take you behind
                  the scenes of my story:
                </p>
                <p className="mb-0 text-lg md:text-xl">
                  I am the heart behind the 'Boaz Nahaisi School,' a place of
                  innovation and transformation. My passion led to the birth of
                  the Flystick method—a revolutionary technique that has made
                  waves not only across Israel but worldwide.
                </p>
                <p className="mb-0 text-lg md:text-xl">
                  Diving deep into Pilates/Controlology and Playistic training,
                  I've honed expertise that extends beyond conventional
                  boundaries. Beyond the studio, I share my knowledge in gyms,
                  workshops, and training sessions across the globe.
                </p>
                <p className="mb-0 text-lg md:text-xl">
                  I believe movement wields immense power, fostering bodily
                  balance, function, self-discovery, and resilience in life's
                  challenges. Just as water flows, movement courses through us.
                  We are water - we are movement.
                </p>
                <p className="mb-0 text-lg md:text-xl">
                  Join me, and together, let's nurture your body and soul along
                  this transformative path.
                </p>
                <p className="mb-0 text-lg md:text-xl pt-10 ">Boaz Nahaisi.</p>
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
