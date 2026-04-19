import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { logout as logoutRequest } from "../../services/auth.service";

const commonRoutes = [
  { to: "/", label: "Home" },
  { to: "/hotels", label: "Hotels" },
  { to: "/timings", label: "Timings" },
  { to: "/route-planner", label: "Route Planner" },
  { to: "/transport", label: "Transport" },
  { to: "/fare-check", label: "Fare Check" },
]

const routeBtnClass = "bg-red-600 text-white/90 p-2 rounded-md text-center hover:border-2 hover:border-amber-500";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setAuthTick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onAuthChanged = () => setAuthTick((t) => t + 1);
    window.addEventListener("dhoom-auth-changed", onAuthChanged);
    return () => window.removeEventListener("dhoom-auth-changed", onAuthChanged);
  }, []);

  const isAuthed = Boolean(
    typeof window !== "undefined" && localStorage.getItem("token"),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navTextClass = scrolled ? "text-gray-900" : "text-black/80";

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear client session even if API fails
    }
    localStorage.removeItem("token");
    setIsOpen(false);
    navigate("/");
    window.dispatchEvent(new Event("dhoom-auth-changed"));
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-gray-800/40 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link
          to="/"
          className="font-display flex flex-row justify-center items-center gap-3 md:gap-4.5 text-2xl md:text-4xl font-extrabold bg-linear-20 from-amber-900 to-amber-700 bg-clip-text text-transparent"
        >
          <img
            src="/DhoomLogo(1).png"
            alt="Dhoomchhalle logo"
            className="md:w-12 w-10 object-cover md:scale-110"
          />
          <p className="font-['Dancing_Script'] md:text-4xl text-3xl">
            Dhoomchhalle
          </p>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {commonRoutes.map((route,id)=> {
            return (
              <motion.div
                key={route.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (0.4 * (id+1)),
                  duration: 0.4,
                }}
              >
                <Link
                  to={route.to}
                  onClick={() => setIsOpen(false)}
                  className={`font-sans text-lg ${routeBtnClass} font-medium transition-colors ${navTextClass}`}
                >
                  {route.label}
                </Link>
              </motion.div>
            )
          })}
          {isAuthed ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 2.5,
                  duration: 0.6,
                }}
              >
                <Link
                  to="/dashboard"
                  className={`font-sans text-lg ${routeBtnClass} font-medium transition-colors ${navTextClass}`}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 2.75,
                  duration: 0.6,
                }}
                onClick={handleLogout}
                className={`font-sans text-lg font-medium transition-colors cursor-pointer ${navTextClass} border border-white/30 rounded-md px-3 py-1.5 hover:bg-white/10`}
              >
                Log out
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 2.5,
                  duration: 0.6,
                }}
              >
                <Link
                  to="/login"
                  className={`font-sans text-lg ${routeBtnClass} font-medium transition-colors ${navTextClass}`}
                >
                  Login
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-md ${scrolled ? "text-black" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="md:hidden bg-background/98 backdrop-blur-md border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {commonRoutes.map((route, i) => (
                <motion.div
                  key={route.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={route.to}
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium text-gray-900 py-2 hover:text-orange-600/60 transition-colors block"
                  >
                    {route.label}
                  </Link>
                </motion.div>
              ))}
              {isAuthed ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: commonRoutes.length * 0.05 }}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="font-sans text-base font-medium py-2 hover:text-orange-600/60 transition-colors duration-300 block"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (commonRoutes.length + 1) * 0.05 }}
                    onClick={handleLogout}
                    className="font-sans text-base font-medium text-left text-gray-900 py-2 hover:text-orange-600/60 duration-300 transition-colors"
                  >
                    Log out
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: commonRoutes.length * 0.05 }}
                  >
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="font-sans text-base font-medium text-gray-900 py-2 hover:text-orange-600/60 transition-colors block"
                    >
                      Register
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (commonRoutes.length + 1) * 0.05 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="font-sans text-base font-medium text-gray-900 py-2 hover:text-orange-600/60 transition-colors block"
                    >
                      Login
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
