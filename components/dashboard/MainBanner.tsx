"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import bannerSlides from "@/data/banner.json";

const MAX_SLIDES = 7;

const ACCENT_STYLES: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MainBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = bannerSlides.slice(0, MAX_SLIDES);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentIndex];
  const accentClass = ACCENT_STYLES[current.accent] || ACCENT_STYLES.blue;

  return (
    <div className="relative w-full h-[300px] md:h-[420px] rounded-[2rem] overflow-hidden mb-10 md:border">
      {/* Dynamic background per slide, crossfades on change */}
      {slides.map((slide, idx) => (
        <Image
          key={slide.id}
          src={slide.background}
          alt=""
          fill
          priority={idx === 0}
          className={`object-contain lg:object-cover transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Localized gradient — only behind the bottom text area, not the full image */}
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/85 via-black/5 to-transparent pointer-events-none" />

      <Link
        href={current.link}
        className="absolute inset-0 flex items-end p-6 lg:p-10"
      >
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex gap-2 items-center mb-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${accentClass}`}
            >
              {current.category}
            </span>
          </div>

          {current.description && (
            <p className="text-slate-300 font-bold text-sm md:text-base line-clamp-1 mb-4">
              {current.description}
            </p>
          )}

          {(current as any).isPast ? (
            <>
              {" "}
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors">
                Resolved
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors">
              Explore Markets
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          )}
        </div>
      </Link>

      {slides.length > 1 && (
        <div className="absolute bottom-4 right-6 md:right-10 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "bg-blue-500 w-6"
                  : "bg-white/30 hover:bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
