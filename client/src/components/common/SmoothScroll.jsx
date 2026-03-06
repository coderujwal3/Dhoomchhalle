import { useEffect } from "react";
import Lenis from "lenis";

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      allowNestedScroll: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
};

export default SmoothScroll;