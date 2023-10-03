"use client";

import { useSession, signOut } from "next-auth/react";

const Page = () => {
  const { data: session } = useSession();

  return (
    <div className="ml-10 pt-28">
      {session?.user ? (
        <div>
          <h1 className="text-4xl">Welcome, {session.user.name}!,</h1>
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
    </div>
  );
};

export default Page;
