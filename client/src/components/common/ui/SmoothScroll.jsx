import { useEffect } from "react";
import Lenis from "lenis";
import { clearLenis, setLenis } from "./lenisInstance";

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      allowNestedScroll: true,
    });
    setLenis(lenis);

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      clearLenis();
    };
  }, []);

  return children;
};

export default SmoothScroll;
