"use client";
import React from "react";
import Link from "next/link"; // Import Link from react-router-dom
import flystikClassMain from "../../../../public/flystickClassMain.jpg";
import pilatisMainCalss from "../../../../public/pilatisMainClass.jpg";
import yogaMainClass from "../../../../public/yoagaMainClass.jpg";
import backser from "../../../../public/backser.jpg";
import pecStretches from "../../../../public/Pec-Stretches-Back-Muscles1.jpg";
const Page = () => {
  const products = [
    {
      id: 1,
      name: "FlyStick technique",
      // Update the 'to' prop with the desired URL
      to: "classes/flystick",
      imageSrc: flystikClassMain.src,
      imageAlt: "",
      price: "",
      description:
        "The FlyStick technique is an innovative and dynamic approach to movement and exercise that draws inspiration from aerial arts and dance.",
    },
    {
      id: 2,
      name: "Yoga technique",
      // Update the 'to' prop with the desired URL
      to: "classes/yoga",
      imageSrc: yogaMainClass.src,
      imageAlt: "",
      price: "",
      description:
        "Yoga is a holistic and ancient practice that harmonizes the mind, body, and spirit. Rooted in Indian philosophy, yoga encompasses a wide range of techniques and disciplines aimed at promoting physical health, mental clarity, and emotional well-being",
    },
    {
      id: 3,
      name: "Pilatis technique",
      // Update the 'to' prop with the desired URL
      to: "classes/basin-series",
      imageSrc: pilatisMainCalss.src,
      imageAlt: "",
      price: "$35",
      description:
        "Pilates is a comprehensive and low-impact fitness system that focuses on strengthening the core, improving flexibility, and enhancing overall body awareness",
    },
    {
      id: 4,
      name: "Basic Tee",
      // Update the 'to' prop with the desired URL
      to: "classes/basin-series",
      imageSrc: backser.src,
      imageAlt: "",
      price: "$35",
      description: "Black",
    },
    {
      id: 5,
      name: "Basic Tee",
      // Update the 'to' prop with the desired URL
      to: "classes/basin-series",
      imageSrc: pecStretches.src,
      imageAlt: "Front of men's Basic Tee in black.",
      price: "$35",
      description: "Black",
    },
  ];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900 text-center">
          Choose your style
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <Link href={product.to}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </Link>
              </div>
              <div className="mt-4 flex justify-between ">
                <div>
                  <h3 className="text-lg text-[#990011] font-semibold ">
                    <Link href={product.to}>{product.name}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.description}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
