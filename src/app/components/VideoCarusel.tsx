import React from "react";

const VideoCarusel = () => {
  return (
    <div className="container mx-auto ">
      <div className=" max-w-[900px] h-[600px] w-full m-auto py-16 px-4 relative group">
        <iframe
          id="ytplayer"
          width="50%"
          height="360"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          src="https://www.youtube.com/embed/VmxL_n52jPA?autoplay=1&loop=1&mute=1&si=r7sh91q0pP3U0mKG&playlist=VmxL_n52jPA"
          className="w-full h-full top-0 left-0 object-cover rounded-2xl"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoCarusel;
