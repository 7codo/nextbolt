"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, StopCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PixelData {
  x: number;
  y: number;
  color: string;
}

interface AnimationData extends PixelData {
  r: number;
}

export function VanishTextArea({
  placeholders,
  onChange,
  onSubmit,
  style,
  chatStarted,
  textRef,
  isStreaming,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  style?: React.CSSProperties;
  chatStarted: boolean;
  isStreaming: boolean;
  textRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
  const TEXTAREA_MIN_HEIGHT = 76;

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the interval when the tab is not visible
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation(); // Restart the interval when the tab becomes visible
    }
  };

  useEffect(() => {
    if (!chatStarted) {
      startAnimation();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders, chatStarted]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<AnimationData[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const displayPlaceholder = chatStarted
    ? "Ask a follow up"
    : placeholders[currentPlaceholder];

  const draw = useCallback(() => {
    if (!textareaRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 800;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const computedStyles = getComputedStyle(textareaRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));

    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const pixelData = imageData.data;
    const newData: PixelData[] = [];

    for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
      const rowOffset = y * CANVAS_WIDTH * 4;
      for (let x = 0; x < CANVAS_WIDTH; x += 2) {
        const i = rowOffset + x * 4;
        if (pixelData[i] + pixelData[i + 1] + pixelData[i + 2] > 0) {
          newData.push({
            x,
            y,
            color: `rgba(${pixelData[i]}, ${pixelData[i + 1]}, ${pixelData[i + 2]}, ${pixelData[i + 3]})`,
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = useCallback((start: number) => {
    const animateFrame = (pos: number = 0) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      requestAnimationFrame(() => {
        const newArr = newDataRef.current.filter((current) => {
          if (current.x < pos) return true;
          if (current.r <= 0) return false;

          current.x += Math.random() > 0.5 ? 1 : -1;
          current.y += Math.random() > 0.5 ? 1 : -1;
          current.r -= 0.05;
          return true;
        });

        ctx.clearRect(pos, 0, 800, 800);

        ctx.beginPath();
        newArr.forEach(({ x: n, y: i, r: s, color }) => {
          if (n > pos) {
            ctx.rect(n, i, s, s);
            ctx.fillStyle = color;
          }
        });
        ctx.fill();

        newDataRef.current = newArr;

        if (newArr.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !animating) {
      if (e.shiftKey) {
        return;
      }
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = textareaRef.current?.value || "";
    if (value && textareaRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
    onSubmit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /*  if (textareaRef.current) {
      setValue("");
    } */
    vanishAndSubmit();
  };

  const mergedRef = useMemo(
    () => (element: HTMLTextAreaElement | null) => {
      (
        textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
      ).current = element;
      if (textRef) {
        (
          textRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = element;
      }
    },
    [textRef]
  );

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-white dark:bg-zinc-800  rounded-xl overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-gray-50"
      )}
      style={{
        minHeight: TEXTAREA_MIN_HEIGHT,
        maxHeight: TEXTAREA_MAX_HEIGHT,
      }}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none  text-base transform scale-50 top-[20%] left-2 origin-top-left filter invert dark:invert-0 pr-2 bg-transparent",
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />
      <textarea
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={mergedRef}
        value={value}
        style={style}
        className={cn(
          "w-full text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 pr-4 py-3 resize-none",
          animating && "text-transparent dark:text-transparent"
        )}
      />

      <div className="flex w-full z-50  justify-between h-9 px-2">
        {value.length > 3 ? (
          <div className="text-xs text-bolt-elements-textTertiary">
            Use <kbd className="kdb">Shift</kbd> +{" "}
            <kbd className="kdb">Return</kbd> for a new line
          </div>
        ) : (
          <div />
        )}
        <button
          type="submit"
          className="h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
        >
          {isStreaming ? (
            <StopCircle className="text-white w-6 h-6" />
          ) : chatStarted ? (
            <ArrowUp className="text-white w-6 h-6" />
          ) : (
            <ArrowRight className="text-white w-6 h-6" />
          )}
        </button>
      </div>

      <div className="absolute left-0 top-4 flex items-center rounded-full pointer-events-none bg-transparent">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={displayPlaceholder}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 text-left truncate"
            >
              {displayPlaceholder}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
