import React from "react";
import {
  AiOutlineInstagram,
  AiOutlineFacebook,
  AiOutlineYoutube,
} from "react-icons/ai";

const Footer = () => {
  return (
    <div className="relative">
      <footer className=" flex flex-col items-center bg-neutral-200 text-center text-white dark:bg-neutral-600">
        <div className="container pt-9">
          <div className="mb-9 flex justify-evenly">
            <AiOutlineFacebook
              size={30}
              className="cursor-pointer hover:text-[#990011]"
            />

            <AiOutlineInstagram
              size={30}
              className="cursor-pointer hover:text-[#990011]"
            />
            <AiOutlineYoutube
              size={30}
              className="cursor-pointer hover:text-[#990011]"
            />
          </div>
        </div>

        <div className="w-full bg-neutral-300 p-4 text-center text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
          © 2023 Copyright: FlyStick
        </div>
      </footer>
    </div>
  );
};

export default Footer;
