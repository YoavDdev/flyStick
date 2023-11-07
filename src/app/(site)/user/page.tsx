"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const Page = () => {
  const { data: session } = useSession();
  const [folderNames, setFolderNames] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (session && session.user) {
      setLoading(true);
      axios
        .post("/api/all-user-folder-names", {
          userEmail: session.user.email,
        })
        .then((response) => {
          if (response.status === 200) {
            setFolderNames(response.data.folderNames);
          }
        })
        .catch((error) => {
          console.error("Error fetching folder names:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session]);

  const fetchFolderNames = () => {
    if (session && session.user) {
      axios
        .post("/api/all-user-folder-names", {
          userEmail: session.user.email,
        })
        .then((response) => {
          if (response.status === 200) {
            setFolderNames(response.data.folderNames);
          }
        })
        .catch((error) => {
          console.error("Error fetching folder names:", error);
        });
    }
  };

  useEffect(() => {
    fetchFolderNames(); // Fetch folder names when the component mounts
  }, [session]);

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
            fetchFolderNames(); // Fetch folder names again to refresh the list
          }
        })
        .catch((error) => {
          console.error("Error deleting folder:", error);
          toast.success("Error deleting the folder");
        });
    }
  };

  return (
    <div className="bg-white py-10">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {session?.user ? (
          <div>
            <div className="mx-auto max-w-7xl px-8 pb-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-[#990011]">
                  All Your Favorites in One Place
                </h2>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {loading
                    ? "Loading..."
                    : folderNames.length === 0
                    ? "Library is empty"
                    : "Your Library"}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {folderNames.map((folderName) => (
                <div key={folderName}>
                  <Link href={`/user/${folderName}`}>
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-[#FCF6F5] xl:aspect-h-8 xl:aspect-w-7">
                      <div className="h-full w-full flex flex-col justify-center items-center text-center">
                        <h3 className="text-2xl font-semibold text-[#EF8354] mb-2">
                          {folderName}
                        </h3>
                        <p className="text-sm text-gray-700">
                          Click to explore
                        </p>
                        <Link
                          onClick={() => handleDeleteFolder(folderName)}
                          href={"/user"}
                          className="bg-red-800 hover-bg-red-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 left-4"
                        >
                          Delete
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ml-10 ">
            <h1 className="text-4xl">Please Login to continue.</h1>
          </div>
        )}
      </div>
    </div>
  );
};
export default Page;
