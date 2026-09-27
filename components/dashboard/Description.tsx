"use client";
import { useState } from "react";

const Description = ({ description }: { description: string }) => {

  const [expanded, setExpanded] = useState(false);

  const limit = 180; // characters
  const isLong = description.length > limit;

  const displayedText = expanded
    ? description
    : description.slice(0, limit) + (isLong ? "..." : "");

  return (
    <>
      <p className="text-slate-400 text-sm md:text-md leading-relaxed font-medium max-w-3xl break-words">
        {displayedText}{" "}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-500 text-sm mt-1"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>
    </>
  );
};

export default Description;
