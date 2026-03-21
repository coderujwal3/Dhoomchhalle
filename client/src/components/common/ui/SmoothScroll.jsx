import { useEffect } from "react";
import Lenis from "lenis";

let lenis = null;

export const getLenis = () => lenis;

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      allowNestedScroll: true,
    });

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  return children;
};

export default SmoothScroll;