"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { RetreatConfig } from "@/config/retreats/types";
import {
  RetreatAbout,
  RetreatHighlights,
  RetreatSchedule,
  RetreatGallery,
  RetreatIncludes,
  RetreatInstructor,
  RetreatTestimonials,
  RetreatFAQ,
} from "./RetreatSections";

// ─── Animated Section Wrapper ────────────────────────────────────────
function FadeInSection({
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
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Floating Navigation ─────────────────────────────────────────────
function RetreatNav({
  title,
  ctaText,
  ctaLink,
  registrationOpen,
}: {
  title: string;
  ctaText: string;
  ctaLink: string;
  registrationOpen: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(250, 247, 242, 0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
        borderBottom: scrolled ? "1px solid rgba(213, 196, 183, 0.3)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16 md:h-18">
        <span
          className="text-base md:text-lg font-medium tracking-wide transition-colors duration-500"
          style={{ color: scrolled ? "#1C1917" : "#FAF7F2" }}
        >
          {title}
        </span>
        {registrationOpen && (
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              backgroundColor: scrolled ? "#8B7355" : "rgba(255,255,255,0.2)",
              color: "#FAF7F2",
              border: scrolled ? "none" : "1px solid rgba(255,255,255,0.35)",
              backdropFilter: scrolled ? "none" : "blur(4px)",
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────
function RetreatHero({ retreat }: { retreat: RetreatConfig }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={retreat.heroImage}
          alt={retreat.title}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.55) saturate(1.1)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(28,25,23,0.3) 0%, rgba(28,25,23,0.15) 40%, rgba(28,25,23,0.5) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
        {/* Tagline */}
        {retreat.tagline && (
          <motion.p
            className="text-sm md:text-base tracking-[0.2em] uppercase mb-6 md:mb-8"
            style={{ color: "rgba(250,247,242,0.8)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {retreat.tagline}
          </motion.p>
        )}

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-extralight mb-4 md:mb-6 leading-[1.1]"
          style={{
            color: "#FAF7F2",
            textShadow: "0 2px 30px rgba(0,0,0,0.3)",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {retreat.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-2xl font-light mb-10 md:mb-14"
          style={{ color: "rgba(250,247,242,0.85)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {retreat.subtitle}
        </motion.p>

        {/* Info badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <InfoBadge label={retreat.date} icon="📅" />
          <InfoBadge label={retreat.location} icon="📍" />
          {retreat.spotsLeft && (
            <InfoBadge
              label={`${retreat.spotsLeft} מקומות אחרונים`}
              icon="🔥"
              highlight
            />
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {retreat.registrationOpen && (
            <a
              href={retreat.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
              style={{
                background:
                  "linear-gradient(135deg, #8B7355 0%, #6B5B43 100%)",
                color: "#FAF7F2",
                boxShadow: "0 4px 25px rgba(107,91,67,0.35)",
              }}
            >
              {retreat.ctaText}
              {retreat.earlyBirdPrice && (
                <span className="block text-xs opacity-80 mt-0.5">
                  מחיר השכמה: {retreat.earlyBirdPrice}
                </span>
              )}
            </a>
          )}
          <button
            onClick={() =>
              document
                .getElementById("retreat-about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-4 rounded-full text-base font-medium transition-all duration-300 cursor-pointer w-full sm:w-auto"
            style={{
              border: "1.5px solid rgba(250,247,242,0.4)",
              color: "#FAF7F2",
              backgroundColor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(4px)",
            }}
          >
            גלו עוד ↓
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className="w-6 h-10 rounded-full border-2 flex justify-center pt-2"
          style={{ borderColor: "rgba(250,247,242,0.4)" }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2.5 rounded-full"
            style={{ backgroundColor: "rgba(250,247,242,0.6)" }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Info Badge ──────────────────────────────────────────────────────
function InfoBadge({
  label,
  icon,
  highlight = false,
}: {
  label: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base"
      style={{
        backgroundColor: highlight
          ? "rgba(196, 149, 106, 0.25)"
          : "rgba(255,255,255,0.12)",
        color: "#FAF7F2",
        border: highlight
          ? "1px solid rgba(196, 149, 106, 0.5)"
          : "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Final CTA Section ───────────────────────────────────────────────
function RetreatFinalCTA({ retreat }: { retreat: RetreatConfig }) {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2D2520 0%, #1C1917 50%, #2D2520 100%)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #C4956A 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <FadeInSection>
          <h2
            className="text-3xl md:text-5xl font-extralight mb-6"
            style={{ color: "#FAF7F2" }}
          >
            מוכנים לצאת למסע?
          </h2>
          <p
            className="text-lg md:text-xl font-light mb-10 leading-relaxed"
            style={{ color: "rgba(250,247,242,0.7)" }}
          >
            {retreat.maxParticipants && (
              <>המקומות מוגבלים ל-{retreat.maxParticipants} משתתפים. </>
            )}
            {retreat.spotsLeft && (
              <>
                נותרו{" "}
                <span style={{ color: "#C4956A" }}>
                  {retreat.spotsLeft} מקומות
                </span>{" "}
                אחרונים.
              </>
            )}
          </p>
        </FadeInSection>

        <FadeInSection delay={0.15}>
          {/* Price card */}
          <div
            className="inline-block rounded-3xl p-8 md:p-10 mb-10"
            style={{
              backgroundColor: "rgba(250,247,242,0.06)",
              border: "1px solid rgba(250,247,242,0.12)",
            }}
          >
            {retreat.earlyBirdPrice && (
              <div className="mb-3">
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(196,149,106,0.2)",
                    color: "#C4956A",
                    border: "1px solid rgba(196,149,106,0.3)",
                  }}
                >
                  מחיר השכמה עד {retreat.earlyBirdDeadline}
                </span>
              </div>
            )}

            <div className="flex items-baseline justify-center gap-4 mb-2">
              {retreat.earlyBirdPrice && (
                <span
                  className="text-2xl md:text-3xl line-through opacity-40"
                  style={{ color: "#FAF7F2" }}
                >
                  {retreat.price}
                </span>
              )}
              <span
                className="text-4xl md:text-5xl font-light"
                style={{ color: "#FAF7F2" }}
              >
                {retreat.earlyBirdPrice || retreat.price}
              </span>
            </div>

            {retreat.priceNote && (
              <p
                className="text-sm mt-2"
                style={{ color: "rgba(250,247,242,0.5)" }}
              >
                {retreat.priceNote}
              </p>
            )}
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {retreat.registrationOpen && (
              <a
                href={retreat.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group px-12 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  background:
                    "linear-gradient(135deg, #C4956A 0%, #8B7355 100%)",
                  color: "#FAF7F2",
                  boxShadow: "0 4px 30px rgba(196,149,106,0.35)",
                }}
              >
                {retreat.ctaText}
              </a>
            )}
            {retreat.ctaWhatsApp && (
              <a
                href={`https://wa.me/${retreat.ctaWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full text-base transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
                style={{
                  border: "1.5px solid rgba(250,247,242,0.25)",
                  color: "rgba(250,247,242,0.8)",
                }}
              >
                יש לי שאלה 💬
              </a>
            )}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Retreat Footer ──────────────────────────────────────────────────
function RetreatFooter({ retreat }: { retreat: RetreatConfig }) {
  return (
    <footer
      className="py-8 text-center"
      style={{
        backgroundColor: "#1C1917",
        borderTop: "1px solid rgba(250,247,242,0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="text-sm mb-2"
          style={{ color: "rgba(250,247,242,0.5)" }}
        >
          {retreat.instructor.name} · {retreat.instructor.title}
        </p>
        <a
          href="https://www.studioboazonline.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors duration-300 hover:opacity-80"
          style={{ color: "rgba(250,247,242,0.3)" }}
        >
          studioboazonline.com
        </a>
      </div>
    </footer>
  );
}

// ─── Main Retreat Landing Page ───────────────────────────────────────
export default function RetreatLanding({
  retreat,
}: {
  retreat: RetreatConfig;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#FAF7F2", direction: "rtl" }}
    >
      <RetreatNav
        title={retreat.title}
        ctaText={retreat.ctaText}
        ctaLink={retreat.ctaLink}
        registrationOpen={retreat.registrationOpen}
      />

      <RetreatHero retreat={retreat} />

      <div id="retreat-about">
        <RetreatAbout about={retreat.about} />
      </div>

      <RetreatHighlights highlights={retreat.highlights} />

      <RetreatSchedule schedule={retreat.schedule} />

      {retreat.gallery.length > 0 && (
        <RetreatGallery gallery={retreat.gallery} />
      )}

      <RetreatIncludes
        includes={retreat.includes}
        excludes={retreat.excludes}
      />

      <RetreatInstructor instructor={retreat.instructor} />

      {retreat.testimonials.length > 0 && (
        <RetreatTestimonials testimonials={retreat.testimonials} />
      )}

      {retreat.faq.length > 0 && <RetreatFAQ faq={retreat.faq} />}

      <RetreatFinalCTA retreat={retreat} />

      <RetreatFooter retreat={retreat} />

      {/* Floating mobile CTA */}
      {retreat.registrationOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 p-4 md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(250,247,242,0.98) 60%, transparent)",
          }}
        >
          <a
            href={retreat.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-full text-center text-base font-medium transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, #8B7355 0%, #6B5B43 100%)",
              color: "#FAF7F2",
              boxShadow: "0 -2px 20px rgba(107,91,67,0.2)",
            }}
          >
            {retreat.ctaText}
            {retreat.spotsLeft && (
              <span className="text-xs opacity-75 mr-2">
                · {retreat.spotsLeft} מקומות
              </span>
            )}
          </a>
        </div>
      )}
    </div>
  );
}

export { FadeInSection };
