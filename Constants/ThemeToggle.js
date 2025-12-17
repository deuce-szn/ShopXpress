"use client";
import { useEffect, useState } from "react";
import { GiSunflower, GiMoon } from "react-icons/gi";

export default function ThemeToggle() {
    const [isMobile, setIsMobile] = useState(false);

  // Define resize handler first
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1025);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);


  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const root = document.documentElement;

    if (savedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      setTheme("dark");
    } else if (savedTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      setTheme("light");
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
      setTheme("system");
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  
  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      {theme === "light" ? (
        <GiMoon color={isMobile ? "#9CC4FB" : "white"} size={30} />
      ) : (
        <GiSunflower color={isMobile ? "#9CC4FB" : "white"} size={30} />
      )}
    </div>
  );
}
