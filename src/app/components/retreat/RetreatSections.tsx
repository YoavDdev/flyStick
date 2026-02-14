"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type {
  RetreatHighlight,
  RetreatScheduleDay,
  RetreatGalleryImage,
  RetreatInstructor,
  RetreatTestimonial,
  RetreatFAQItem,
} from "@/config/retreats/types";

// ─── Reusable fade-in wrapper ────────────────────────────────────────
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Title ───────────────────────────────────────────────────
function SectionTitle({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center mb-14 md:mb-18">
      <h2
        className="text-3xl md:text-4xl lg:text-5xl font-extralight mb-4 leading-tight"
        style={{ color: light ? "#FAF7F2" : "#1C1917" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-base md:text-lg font-light max-w-2xl mx-auto"
          style={{ color: light ? "rgba(250,247,242,0.65)" : "#78716C" }}
        >
          {subtitle}
        </p>
      )}
      <div
        className="w-16 h-[1.5px] mx-auto mt-6"
        style={{
          background: light
            ? "linear-gradient(90deg, transparent, rgba(250,247,242,0.4), transparent)"
            : "linear-gradient(90deg, transparent, #D5C4B7, transparent)",
        }}
      />
    </div>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────
export function RetreatAbout({ about }: { about: string[] }) {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <FadeIn>
          <div className="text-center">
            {about.map((paragraph, i) => (
              <p
                key={i}
                className={`text-lg md:text-xl leading-relaxed font-light ${
                  i === 0
                    ? "text-2xl md:text-3xl font-extralight mb-8"
                    : "mb-6"
                }`}
                style={{
                  color: i === 0 ? "#1C1917" : "#57534E",
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── HIGHLIGHTS ──────────────────────────────────────────────────────
export function RetreatHighlights({
  highlights,
}: {
  highlights: RetreatHighlight[];
}) {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#F0EBE3" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="למה הריטריט הזה" subtitle="מה הופך אותו למיוחד" />
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                className="rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                }}
              >
                <span className="text-4xl block mb-4">{item.icon}</span>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#1C1917" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#78716C" }}
                >
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SCHEDULE ────────────────────────────────────────────────────────
export function RetreatSchedule({
  schedule,
}: {
  schedule: RetreatScheduleDay[];
}) {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="לו״ז הריטריט" subtitle="שלושה ימים של חוויה" />
        </FadeIn>

        {/* Day tabs */}
        <FadeIn delay={0.1}>
          <div className="flex justify-center gap-3 mb-12">
            {schedule.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className="px-5 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor:
                    activeDay === i ? "#8B7355" : "transparent",
                  color: activeDay === i ? "#FAF7F2" : "#8B7355",
                  border:
                    activeDay === i
                      ? "1.5px solid #8B7355"
                      : "1.5px solid #D5C4B7",
                }}
              >
                {day.day}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Active day content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-center mb-8">
              <h3
                className="text-xl md:text-2xl font-light"
                style={{ color: "#1C1917" }}
              >
                {schedule[activeDay].title}
              </h3>
            </div>

            <div className="space-y-0">
              {schedule[activeDay].items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 md:gap-6 py-4 group"
                  style={{
                    borderBottom:
                      i < schedule[activeDay].items.length - 1
                        ? "1px solid #E7E0D6"
                        : "none",
                  }}
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-14 md:w-16 text-left">
                    <span
                      className="text-sm md:text-base font-medium"
                      style={{ color: "#8B7355" }}
                    >
                      {item.time}
                    </span>
                  </div>

                  {/* Timeline dot */}
                  <div className="flex-shrink-0 flex flex-col items-center pt-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-125"
                      style={{ backgroundColor: "#D5C4B7" }}
                    />
                    {i < schedule[activeDay].items.length - 1 && (
                      <div
                        className="w-px flex-1 mt-1"
                        style={{ backgroundColor: "#E7E0D6" }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <h4
                      className="text-base md:text-lg font-medium mb-0.5"
                      style={{ color: "#1C1917" }}
                    >
                      {item.activity}
                    </h4>
                    {item.description && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#78716C" }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────
export function RetreatGallery({
  gallery,
}: {
  gallery: RetreatGalleryImage[];
}) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#F0EBE3" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="מהריטריט" />
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {gallery.map((img, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
                style={{ aspectRatio: i === 0 ? "4/3" : "1/1" }}
                onClick={() => setSelectedImage(i)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(28,25,23,0.4), transparent)",
                  }}
                />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
              style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.img
                src={gallery[selectedImage].src}
                alt={gallery[selectedImage].alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl transition-colors cursor-pointer"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── INCLUDES ────────────────────────────────────────────────────────
export function RetreatIncludes({
  includes,
  excludes,
}: {
  includes: string[];
  excludes?: string[];
}) {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="מה כולל הריטריט" />
        </FadeIn>

        <div
          className={`grid gap-10 md:gap-16 ${
            excludes && excludes.length > 0
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 max-w-2xl mx-auto"
          }`}
        >
          {/* Included */}
          <FadeIn delay={0.1}>
            <div>
              <h3
                className="text-lg font-medium mb-6 flex items-center gap-2"
                style={{ color: "#1C1917" }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: "#E8F5E9", color: "#4CAF50" }}
                >
                  ✓
                </span>
                כלול במחיר
              </h3>
              <ul className="space-y-3">
                {includes.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-base"
                    style={{ color: "#44403C" }}
                  >
                    <span
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#8B7355" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Excluded */}
          {excludes && excludes.length > 0 && (
            <FadeIn delay={0.2}>
              <div>
                <h3
                  className="text-lg font-medium mb-6 flex items-center gap-2"
                  style={{ color: "#1C1917" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: "#F5F5F5",
                      color: "#9E9E9E",
                    }}
                  >
                    –
                  </span>
                  לא כלול
                </h3>
                <ul className="space-y-3">
                  {excludes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-base"
                      style={{ color: "#78716C" }}
                    >
                      <span
                        className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#D5C4B7" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── INSTRUCTOR ──────────────────────────────────────────────────────
export function RetreatInstructor({
  instructor,
}: {
  instructor: RetreatInstructor;
}) {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ backgroundColor: "#F0EBE3" }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="המנחה" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
            {/* Image */}
            <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bio */}
            <div className="flex-1 text-center md:text-right">
              <h3
                className="text-2xl md:text-3xl font-light mb-2"
                style={{ color: "#1C1917" }}
              >
                {instructor.name}
              </h3>
              <p
                className="text-base mb-6"
                style={{ color: "#8B7355" }}
              >
                {instructor.title}
              </p>

              {instructor.bio.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed mb-4"
                  style={{ color: "#57534E" }}
                >
                  {paragraph}
                </p>
              ))}

              {instructor.credentials && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                  {instructor.credentials.map((cred, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs"
                      style={{
                        backgroundColor: "rgba(139,115,85,0.1)",
                        color: "#8B7355",
                        border: "1px solid rgba(139,115,85,0.2)",
                      }}
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────
export function RetreatTestimonials({
  testimonials,
}: {
  testimonials: RetreatTestimonial[];
}) {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF7F2" }}>
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle
            title="מה אומרים המשתתפים"
            subtitle="חוויות אישיות מריטריטים קודמים"
          />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                className="rounded-2xl p-7 md:p-8 h-full flex flex-col"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                }}
              >
                {/* Quote mark */}
                <span
                  className="text-5xl font-serif leading-none mb-3 block"
                  style={{ color: "#D5C4B7" }}
                >
                  ״
                </span>

                <p
                  className="text-base leading-relaxed flex-1 mb-6"
                  style={{ color: "#44403C" }}
                >
                  {t.text}
                </p>

                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#1C1917" }}
                  >
                    {t.name}
                  </p>
                  {t.role && (
                    <p className="text-xs mt-0.5" style={{ color: "#A8A29E" }}>
                      {t.role}
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────
export function RetreatFAQ({ faq }: { faq: RetreatFAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#F0EBE3" }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionTitle title="שאלות נפוצות" />
        </FadeIn>

        <div className="space-y-3">
          {faq.map((item, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow:
                    openIndex === i
                      ? "0 4px 20px rgba(0,0,0,0.06)"
                      : "0 1px 8px rgba(0,0,0,0.03)",
                }}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                  className="w-full flex items-center justify-between p-5 md:p-6 text-right cursor-pointer"
                >
                  <h3
                    className="text-base md:text-lg font-medium flex-1"
                    style={{ color: "#1C1917" }}
                  >
                    {item.question}
                  </h3>
                  <span
                    className="flex-shrink-0 mr-4 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform duration-300"
                    style={{
                      backgroundColor:
                        openIndex === i
                          ? "rgba(139,115,85,0.1)"
                          : "#F5F5F0",
                      color: "#8B7355",
                      transform:
                        openIndex === i ? "rotate(45deg)" : "rotate(0)",
                    }}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-5 md:px-6 pb-5 md:pb-6"
                        style={{ borderTop: "1px solid #F0EBE3" }}
                      >
                        <p
                          className="text-base leading-relaxed pt-4"
                          style={{ color: "#57534E" }}
                        >
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
