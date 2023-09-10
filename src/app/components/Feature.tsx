import React from "react";

const Feature = () => {
  return (
    <div className="bg-white p-5 sm:p-10 ">
      <section className="text-center">
        <div className="grid gap-x-5 sm:gap-x-10 md:grid-cols-1 lg:grid-cols-3 ">
          <div className="mb-5 sm:mb-10">
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              Whether a beginner or an experienced practitioner:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Streamlined Learning: Follow a guided path in our training
              program, with tailored challenges at every step.
            </p>
          </div>
          <div className="mb-5 sm:mb-10">
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              If you have curiosity and drive for more, our studio offers:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Deep Dives: Explore movement intricacies with in-depth insights.
              Inner Harmony: Unearth the profound connection between outer
              movement and inner self.
            </p>
          </div>
          <div>
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              For those who have already walked a path or are teachers and
              mentors:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Enhance and Inspire: Boost your knowledge, creativity, and value
              as an instructor with our studio's resources.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feature;
