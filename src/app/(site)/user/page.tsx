"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";

const Page = () => {
  const { data: session } = useSession();

  return (
    <div className="ml-10 hover:text-[#990011] text-xl pt-28">
      {session?.user ? (
        <p>Welcome, {session.user.name}!</p>
      ) : (
        <p>Please sign in to continue.</p>
      )}
    </div>
  );
};

export default Page;
