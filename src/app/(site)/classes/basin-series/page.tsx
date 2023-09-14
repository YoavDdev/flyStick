"use client";

import React from "react";
import { useState } from "react";

const page = () => {
  const products = [
    {
      id: 1,
      title: "פירוט תרגילים חלק 2",
      subtitle: "$48",
      imageSrc:
        "https://videoapi-muybridge.vimeocdn.com/animated-thumbnails/image/cc7f7368-0586-4f7e-a097-b4091b1064ce.gif?ClientID=vimeo-core-prod&Date=1694679909&Signature=5bca2c79fc30c066b6b30857f172e35def0b7130",
      imageAlt: "פירוט תרגילים חלק 2",
      videoUrl:
        "https://player.vimeo.com/video/831156544?h=8ad41f8601&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479",
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
            <div key={product.id} className="group">
              <div
                className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7"
                onClick={() => toggleVideo(product.videoUrl)} // Toggle video on image click
              >
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
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
