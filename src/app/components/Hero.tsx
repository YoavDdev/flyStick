import React from "react";
import Image from "next/image";
import BoazMain_Clean from "../../../public/BoazMain_Clean.png";

const Hero = () => {
  return (
    <section className=" bg-scroll bg-[url(/BoazMain_Clean.png)] h-[972px]  bg-[center_left_-40rem] sm:bg-center">
      <div>
        <div className=" mx-auto max-w-screen-xl py-80 lg:flex lg:h-screen lg:items-center justify-end md:px-10 ">
          <div className="lg-w-xl text-center ltr:sm:text-left rtl:sm:text-right pt-16 ">
            <h1 className=" font-extrabold text-5xl">
              The flyStick move your
              <strong className="block font-extrabold text-[#fe6b2a]">
                Heart.
              </strong>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

/*     <section className="static bg-no-repeat bg-[url(/BoazMain_Clean.png)] bg-cover bg-center ">
      {" "}
      <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:from-white/95 sm:to-white/25 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l"></div>{" "}
      <div className="  mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center justify-end ">
        <div className="lg-w-xl text-center ltr:sm:text-left rtl:sm:text-right ">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            The flyStick move your
            <strong className="block font-extrabold text-[#fe6b2a]">
              Heart.
            </strong>
          </h1>
        </div>
      </div>
    </section> */
