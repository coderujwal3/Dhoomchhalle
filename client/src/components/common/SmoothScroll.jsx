import { useEffect } from "react";
import Lenis from "lenis";

let lenis = null;

export const getLenis = () => lenis;

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    lenis = new Lenis({
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
      lenis = null;
    };
  }, []);

  return children;
};

export default SmoothScroll;