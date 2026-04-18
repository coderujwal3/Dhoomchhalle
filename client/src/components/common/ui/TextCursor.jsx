import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TextCursor = ({
  text = "ॐ",
  spacing = 120,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 5,
}) => {
  const [trail, setTrail] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const containerRef = useRef(null);
  const lastMoveTimeRef = useRef(0);
  const idCounter = useRef(0);
  const lastPointRef = useRef(null);
  const pendingMouseRef = useRef(null);
  const rafRef = useRef(0);
  const isEnabledRef = useRef(false);

  const appendTrailFromMouse = useCallback((mouseX, mouseY) => {
    if (!containerRef.current) return;

    const createRandomData = () =>
      randomFloat
        ? {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5,
          }
        : {};

    setTrail((prev) => {
      const newTrail = [...prev];
      const last = lastPointRef.current;

      if (!last) {
        const firstPoint = {
          id: idCounter.current++,
          x: mouseX,
          y: mouseY,
          angle: 0,
          ...createRandomData(),
        };
        newTrail.push(firstPoint);
        lastPointRef.current = firstPoint;
      } else {
        const dx = mouseX - last.x;
        const dy = mouseY - last.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= spacing) {
          const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const computedAngle = followMouseDirection ? rawAngle : 0;
          const steps = Math.floor(distance / spacing);

          for (let i = 1; i <= steps; i++) {
            const t = (spacing * i) / distance;
            const newPoint = {
              id: idCounter.current++,
              x: last.x + dx * t,
              y: last.y + dy * t,
              angle: computedAngle,
              ...createRandomData(),
            };
            newTrail.push(newPoint);
            lastPointRef.current = newPoint;
          }
        }
      }

      const trimmed =
        newTrail.length > maxPoints
          ? newTrail.slice(newTrail.length - maxPoints)
          : newTrail;
      if (trimmed.length > 0) {
        lastPointRef.current = trimmed[trimmed.length - 1];
      }
      return trimmed;
    });

    lastMoveTimeRef.current = Date.now();
  }, [followMouseDirection, maxPoints, randomFloat, spacing]);

  const handleMouseMove = useCallback((e) => {
    if (!isEnabledRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    pendingMouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (!pendingMouseRef.current) return;
      appendTrailFromMouse(pendingMouseRef.current.x, pendingMouseRef.current.y);
      pendingMouseRef.current = null;
    });
  }, [appendTrailFromMouse]);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    isEnabledRef.current = !isTouchDevice && !prefersReducedMotion;
    setIsEnabled(isEnabledRef.current);
    if (!isEnabledRef.current) {
      return undefined;
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => {
          if (prev.length === 0) return prev;
          const next = prev.slice(1);
          lastPointRef.current = next.length > 0 ? next[next.length - 1] : null;
          return next;
        });
      }
    }, Math.max(removalInterval, 80));
    return () => clearInterval(interval);
  }, [removalInterval]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen text-white/80 fixed top-0 left-0 z-9999 pointer-events-none"
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 1, rotate: item.angle }}
              animate={{
                opacity: 0.8,
                scale: 1,
                x: randomFloat ? [0, item.randomX || 0, 0] : 0,
                y: randomFloat ? [0, item.randomY || 0, 0] : 0,
                rotate: randomFloat
                  ? [
                      item.angle,
                      item.angle + (item.randomRotate || 0),
                      item.angle,
                    ]
                  : item.angle,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: "easeOut" },
                ...(randomFloat && {
                  x: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  },
                  y: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  },
                  rotate: {
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  },
                }),
              }}
              className="text-cursor-item absolute select-none whitespace-nowrap text-3xl font-bold"
              style={{ left: item.x, top: item.y }}
            >
              {text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default TextCursor;
