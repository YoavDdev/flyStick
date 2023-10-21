"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useState } from "react";

const Page = () => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
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
          <button className="hover:text-[#990011] text-2xl" onClick={openModal}>
            Show Modal
          </button>
        </div>
      ) : (
        <div className="ml-10 pt-28">
          <h1 className="text-4xl">Please sign in to continue.</h1>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
          <div className="absolute w-96 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Hello: "use client"</h2>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
