"use client";

import { useSession, signOut } from "next-auth/react";

import React, { useEffect, useState } from "react";
import axios from "axios";

const Page = () => {
  const { data: session } = useSession();
  const [folderNames, setFolderNames] = useState([]);

  useEffect(() => {
    async function fetchFolderNames() {
      try {
        const response = await axios.get("/api/get-folder-names");
        if (response.status === 200) {
          setFolderNames(response.data.folderNames);
        } else {
          console.error("Failed to fetch folder names");
        }
      } catch (error) {
        console.error("Error fetching folder names:", error);
      }
    }

    fetchFolderNames();
  }, []);

  return (
    <div className="ml-10 pt-28">
      {session?.user ? (
        <div>
          <h1 className="text-4xl">Welcome, {session.user.name}!</h1>
          <button
            className="hover:text-[#990011] text-2xl"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="ml-10 pt-28">
          <h1 className="text-4xl">Please sign in to continue.</h1>
        </div>
      )}
      <div>
        <h2>Folder Names:</h2>
        <ul>
          {folderNames.map((folderName) => (
            <li key={folderName}>{folderName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Page;
