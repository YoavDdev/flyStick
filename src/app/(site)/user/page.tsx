"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const Page = () => {
  const { data: session } = useSession();
  const [folderNames, setFolderNames] = useState([]);

  useEffect(() => {
    if (session && session.user) {
      // Perform data fetching when the component mounts
      axios
        .post("/api/all-user-folder-names", {
          userEmail: session.user.email,
        })
        .then((response) => {
          if (response.status === 200) {
            setFolderNames(response.data.folderNames);

            // console.log(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching folder names:", error);
        });
    }
  }, [session]); // Run this effect whenever the 'session' variable changes

  const handleDeleteFolder = (folderName: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${folderName}?`,
    );

    if (confirmDelete) {
      axios
        .delete("/api/delete-a-folder", {
          data: {
            userEmail: session?.user?.email,
            folderName,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Folder deleted");
            // Folder deleted successfully, you can update the UI accordingly
          }
        })
        .catch((error) => {
          console.error("Error deleting folder:", error);
          toast.success("Error to delete the folder");
        });
    }
  };

  return (
    <div className="bg-white py-10">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {session?.user ? (
          <div>
            <h1 className="text-4xl">Welcome, {session.user.name}!</h1>
          </div>
        ) : (
          <div className="ml-10 pt-28">
            <h1 className="text-4xl">Please sign in to continue.</h1>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-6 lg:px-8 p-10">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-2xl font-semibold leading-7 text-[#990011] ">
              My library...
            </h2>
          </div>
        </div>
        <div
          className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 
        lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
        >
          {folderNames.map((folderName) => (
            <Link href={`/user/${folderName}`} key={folderName}>
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-[#FCF6F5] xl:aspect-h-8 xl:aspect-w-7">
                <div className="h-full w-full flex flex-col justify-center items-center text-center">
                  <h3 className="text-2xl font-semibold text-[#990011] mb-2">
                    {folderName}
                  </h3>
                  <p className="text-sm text-gray-700">Click to explore</p>
                  <Link
                    href={"/"}
                    onClick={() => handleDeleteFolder(folderName)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 left-4"
                  >
                    Delete
                  </Link>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
