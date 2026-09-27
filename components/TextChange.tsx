"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type RotatingWordProps = {
  words?: string[];
  interval?: number;
};

const reducedMotionStore = {
  subscribe: (cb: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);

    return () => mq.removeEventListener("change", cb);
  },
  getSnapshot: () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  getServerSnapshot: () => false,
};

const RotatingWord = ({
  words = [" Your,", "Sport,", "Social,", "Finance,", "Politics,"],
  interval = 2500,
}: RotatingWordProps) => {
  const reducedMotion = useSyncExternalStore(
    reducedMotionStore.subscribe,
    reducedMotionStore.getSnapshot,
    reducedMotionStore.getServerSnapshot,
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);

    return () => clearInterval(id);
  }, [reducedMotion, interval, words.length]);

  const active = reducedMotion ? 0 : index;

  const longestWord = words.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    "",
  );

  return (
    <span className="relative inline-block align-baseline" aria-live="polite">
      {/* Reserves the width of the longest word */}
      <span className="invisible italic" aria-hidden="true">
        {longestWord}
      </span>

      {words.map((word, i) => (
        <span
          key={word}
          className={`absolute left-0 top-0  font-bold text-blue-500 transition-all duration-500 ease-out motion-reduce:transition-none ${
            i === active
              ? "translate-y-0 opacity-100 blur-0"
              : "translate-y-3 opacity-0 blur-[2px]"
          }`}
          aria-hidden={i !== active}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

export default RotatingWord;
