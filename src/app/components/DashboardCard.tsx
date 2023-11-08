import React from "react";
import Link from "next/link";

const DashboardCard = ({ title, description, link }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-extrabold text-[#2D3142] mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={link}>
        <span className="text-[#EF8354] hover:underline">
          Explore More &rarr;
        </span>
      </Link>
    </div>
  );
};

export default DashboardCard;
