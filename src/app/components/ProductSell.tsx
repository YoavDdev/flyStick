"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import Studio1 from "../../../public/Studio1.jpg";
import Studio2 from "../../../public/Studio2.jpg";
import Studio3 from "../../../public/Studio3.jpg";
import Studio4 from "../../../public/Studio4.jpg";

const ProductSell = () => {
  const slides = [Studio1, Studio2, Studio3, Studio4];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7500); // Change the interval time (in milliseconds) as needed

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="container mx-auto py-11">
      <section className=" text-center">
        <h2 className="text-6xl mb-10">
          A Vast Array of Study Subjects Await You!
        </h2>
        <div className="max-w-[900px] h-[400px] w-full m-auto py-16 px-4 relative group">
          <div className=" rounded-3xl bg-center bg-cover">
            <Image
              src={slides[currentIndex]}
              alt="test"
              objectFit="cover"
              fill
              className="w-full h-full top-0 left-0 object-cover rounded-2xl"
            />
            {/* LeftArrow */}
            <div className=" hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
              <BsChevronCompactLeft onClick={prevSlide} size={30} />
            </div>
            {/* RightArrow */}
            <div className=" hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
              <BsChevronCompactRight onClick={nextSlide} size={30} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductSell;
