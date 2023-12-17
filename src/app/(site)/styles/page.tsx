"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Import Link from React Router
import exp from "constants";

const Page = () => {
  const [folders, setFolders] = useState([]);
  const { data: session } = useSession();
  const accessToken = process.env.VIMEO_TOKEN;
  const apiUrl = "https://api.vimeo.com/me/projects";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
      });

      const data = response.data;
      const foldersData = data.data;

      const folders = foldersData.map((folder: any) => ({
        name: folder.name,
        uri: folder.uri, // Include the folder URI
      }));

      setFolders(folders);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-white">
      <div className="min-h-screen text-white">
        <div className="pt-20">
          <div className="container mx-auto p-6">
            <div className="mx-auto max-w-7xl px-8 pb-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-[#990011]">
                  Training Your Way
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Choose Your Style
                </p>
              </div>
              <div className="text-center mt-4 sm:hidden">
                <p className="text-gray-500">Scroll down for more styles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 xl:gap-x-8 ">
              {folders.map((folder: any, index: number) => (
                <Link
                  href={`/styles/${folder.uri.split("/").pop()}`}
                  key={folder.uri}
                >
                  <div className="overflow-hidden transform transition-transform duration-300 ease-in-out hover:scale-105">
                    <div className="aspect-h-2 aspect-w-3 w-full rounded-lg bg-[#FCF6F5]">
                      <div className="h-full w-full flex flex-col justify-center items-center text-center p-4">
                        <h3 className="text-2xl font-semibold text-[#990011] mb-2">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-700">
                          Click to explore
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
