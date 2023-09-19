"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";

import flystikClass from "../../../../../public/flystickClass.png";
import flystikClass2 from "../../../../../public/flystikClass2.png";
import flystikClass3 from "../../../../../public/flystikClass3.png";
import flystikClass4 from "../../../../../public/flystikClass4.png";
import flystikClass5 from "../../../../../public/flystikClass5.png";

const page = () => {
  const products = [
    {
      id: 1,
      title: "FlyStick fill good",
      subtitle: "3 video classes",
      imageSrc: flystikClass.src,
      imageAlt: "FlyStick fill good",
      videoUrl: "https://vimeo.com/showcase/5908428/embed",
    },
    {
      id: 2,
      title: "FlyStick fill good",
      subtitle: "3 video classes",
      imageSrc: flystikClass2.src,
      imageAlt: "FlyStick fill good",
      videoUrl: "https://vimeo.com/showcase/5908428/embed",
    },
    {
      id: 3,
      title: "FlyStick fill good",
      subtitle: "3 video classes",
      imageSrc: flystikClass3.src,
      imageAlt: "FlyStick fill good",
      videoUrl: "https://vimeo.com/showcase/5908428/embed",
    },
    {
      id: 4,
      title: "FlyStick fill good",
      subtitle: "3 video classes",
      imageSrc: flystikClass4.src,
      imageAlt: "FlyStick fill good",
      videoUrl: "https://vimeo.com/showcase/5908428/embed",
    },
    {
      id: 5,
      title: "FlyStick fill good",
      subtitle: "3 video classes",
      imageSrc: flystikClass5.src,
      imageAlt: "FlyStick fill good",
      videoUrl: "https://vimeo.com/showcase/5908428/embed",
    },

    // More products...
  ];

  // State to track whether video should be displayed
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Function to handle video display
  const toggleVideo = (url?: string) => {
    if (url) {
      setVideoUrl(url);
      setShowVideo(!showVideo);
    }
  };
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              {/* Container for the image */}
              <div
                className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7"
                onClick={() => toggleVideo(product.videoUrl)}
              >
                {/* Image */}
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />

                {/* Play icon (custom SVG) */}
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.title}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {product.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showVideo && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative w-[80%] h-[80%]">
            {" "}
            <button
              className="absolute top-4 right-4 text-white text-2xl z-50"
              onClick={() => setShowVideo(false)} // Close video modal by setting showVideo to false
            >
              &times;
            </button>
            <iframe
              className="w-full h-full"
              src={videoUrl}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;

{
  /* <div style='padding:47.2% 0 0 0;position:relative;'><iframe src='https://vimeo.com/showcase/9082139/embed' allowfullscreen frameborder='0' style='position:absolute;top:0;left:0;width:100%;height:100%;'></iframe></div> */
}
