"use client";

import React, { useState } from "react";
import { quiz } from "./data";

// Define a type for the video link map
type VideoLinkMap = {
  [key: string]: string;
};

const Quiz = () => {
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [videoLink, setVideoLink] = useState<string>("");

  const { questions } = quiz;
  const { question, answers } = questions[activeQuestion];

  const onAnswerSelected = (answer: string, idx: number) => {
    setSelectedAnswerIndex((prev) => {
      const updatedIndexes = [...prev];
      updatedIndexes[activeQuestion] = idx;
      return updatedIndexes;
    });
  };

  const nextQuestion = () => {
    setSelectedAnswerIndex((prev) => {
      const updatedIndexes = [...prev];
      updatedIndexes[activeQuestion] = 0;
      return updatedIndexes;
    });

    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      setActiveQuestion(0);
      setShowResult(true);

      // Determine the video link based on answers
      const newVideoLink = determineVideoLink();
      setVideoLink(newVideoLink);
    }
  };

  const determineVideoLink = () => {
    // Create an array to store the user's answers for each question
    const userAnswers = selectedAnswerIndex.map((idx) => {
      // Check if the answer is null, and replace it with a default value
      return idx === null ? "0" : idx.toString();
    });

    // Join the user's answers into a single string
    const answerCombination = userAnswers.join("");

    // Define a mapping of answer combinations to video links
    const videoLinkMap: VideoLinkMap = {
      "000":
        "https://www.youtube.com/embed/h1LSNDkSRjI?autoplay=1&si=jejFYT0MlqqpAvOp",
      "001": "https://www.youtube.com/embed/8jPL_5BoKuA?si=623aiCdsE3HQI3Ll",
      "002":
        "https://www.youtube.com/embed/pqhcRnqZLSo?autoplay=1&si=sQqrXsJEHVyc658r",
      "010": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "011": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "012": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "020": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "021": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "022": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "100":
        "https://www.youtube.com/embed/Drc5r2W8urE?autoplay=1&si=bbmnaB_M6z0L3o6a",
      "101": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "102": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "110": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "111": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "112": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "120": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "121": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "122": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "200":
        "https://www.youtube.com/embed/Drc5r2W8urE?autoplay=1&si=bbmnaB_M6z0L3o6a",
      "201": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "202": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "210": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "211": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "212": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "220": "https://www.youtube.com/embed/sPCIB7OGLjg?si=8q0Fnd0KojjoBh_h",
      "221": "https://www.youtube.com/embed/YtaR_I65wmI?si=9lcZDe6KHfkfOCSX",
      "222":
        "https://www.youtube.com/embed/Drc5r2W8urE?autoplay=1&si=bbmnaB_M6z0L3o6a",
    };

    // Use the answer combination to look up the corresponding video link
    const videoLink = videoLinkMap[answerCombination];

    return videoLink;
  };

  return (
    <div className="bg-[#FCF6F5] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-4xl font-semibold mb-4 text-center">
          Discover Your Custom Video Experience:
        </h1>
        <div>
          <h2 className="text-xl mb-4">
            {activeQuestion + 1}/{questions.length}
          </h2>
        </div>
        <div>
          {!showResult ? (
            <div>
              <h3 className="mb-2 text-[#990011] text-2xl sm:text-4xl">
                {questions[activeQuestion].question}
              </h3>
              {answers.map((answer, idx) => (
                <li
                  key={idx}
                  onClick={() => onAnswerSelected(answer, idx)}
                  className={`list-none cursor-pointer border border-gray-300 p-4 mb-2 rounded-lg ${
                    selectedAnswerIndex[activeQuestion] === idx
                      ? "bg-white text-black selected"
                      : "bg-gray-100"
                  } transition duration-300`}
                >
                  <span>{answer}</span>
                </li>
              ))}
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={nextQuestion}
                  disabled={selectedAnswerIndex[activeQuestion] === null}
                  className={`rounded-md bg-red-600 px-40 py-2.5 text-sm  text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5 "
                > ${
                  selectedAnswerIndex[activeQuestion] === null
                    ? "bg-gray-500 text-white"
                    : "bg-blue-600 text-white"
                }`}
                >
                  {activeQuestion === questions.length - 1
                    ? "To the Video"
                    : "Next"}
                </button>
              </div>
            </div>
          ) : (
            <div className="container mx-auto p-4">
              {videoLink && (
                <div className="container mx-auto ">
                  <div className=" max-w-[900px] h-[600px] w-full m-auto  px-4 relative group">
                    <iframe
                      id="ytplayer"
                      width="50%"
                      height="360"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      src={videoLink}
                      className="w-full h-full top-0 left-0 object-cover rounded-2xl"
                    ></iframe>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-md bg-indigo-600 px-40 py-2.5 mt-5 text-sm  text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
