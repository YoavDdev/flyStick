import React from "react";

const Feature = () => {
  return (
    <div className="bg-white p-10">
      <section className=" text-center ">
        <h2 className="pt-3 text-6xl">
          Your Path to Deeper Insights and Lasting Transformation
        </h2>
        <div className="grid gap-x-6 md:grid-cols-3 lg:gap-x-12">
          <div className="mb-12 md:mb-0">
            <div className="mb-6 inline-block rounded-md bg-primary-100 p-4 text-primary"></div>
            <h5 className="mb-4 font-bold text-[#990011] text-4xl transition-opacity ease-in-out ">
              Whether you're taking your first steps or you're an experienced
              practitioner/teacher:
            </h5>
            <p className="text-xl">
              Structured Learning: Enjoy a step-by-step journey through our
              structured study and training program. Tailored Training: Progress
              through different training levels, ensuring you're always at the
              right challenge point.
            </p>
          </div>
          <div className="mb-12 md:mb-0">
            <div className="mb-6 inline-block rounded-md bg-primary-100 p-4 text-primary"></div>
            <h5 className="mb-4 font-bold text-[#990011] text-4xl">
              If you have curiosity and drive for more, our studio offers:
            </h5>
            <p className="text-xl">
              Deep Insights: Delve into movement with more depth and explore its
              intricacies. Inner Connection: Discover the profound connection
              between outer movement and inner self.
            </p>
          </div>
          <div className="mb-12 md:mb-0">
            <div className="mb-6 inline-block rounded-md bg-primary-100 p-4 text-primary"></div>
            <h5 className="mb-4 font-bold text-[#990011] text-4xl">
              For those who have already walked a path or are teachers and
              mentors:
            </h5>
            <p className="text-xl">
              Expand and Deepen: Amplify and enrich your existing knowledge
              through our studio. Inspiration and Innovation: Gain fresh
              inspiration, ideas, and innovative techniques for your workouts.
              Enhanced Value: Offer remarkable value to your trainees and
              elevate your teaching to new heights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feature;
