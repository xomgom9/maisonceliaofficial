import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { resolveMotionMode, type MotionPreference, type MotionMode } from "@/lib/motion-preference";

const MotionContext = createContext({ mode: "light" as MotionMode, preference: "device" as MotionPreference, setPreference: (_value: MotionPreference) => {} });
export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<MotionPreference>("device");
  const [deviceReduced, setDeviceReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const mode = resolveMotionMode(preference, deviceReduced);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setDeviceReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    try {
      const saved = localStorage.getItem("celia-motion");
      if (saved === "device" || saved === "light" || saved === "off") setPreferenceState(saved);
    } catch { /* Storage may be unavailable. */ }
    setReady(true);
    return () => media.removeEventListener("change", sync);
  }, []);
  const setPreference = (value: MotionPreference) => {
    setPreferenceState(value);
    try { localStorage.setItem("celia-motion", value); } catch { /* Keep this session's choice. */ }
  };
  useEffect(() => {
    document.documentElement.dataset.motion = mode;
    if (!ready || mode === "off" || !("IntersectionObserver" in window)) return;
    const main = document.querySelector("main");
    if (!main) return;
    const observed = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "true");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    const scan = () => {
      main.querySelectorAll("h1, h2, h3, p").forEach((element) => {
        if (observed.has(element) || element.closest("[data-motion-static], form, [data-motion-reveal]")) return;
        observed.add(element);
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.setAttribute("data-motion-reveal", "true");
        observer.observe(element);
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); mutations.disconnect();
      observed.forEach((element) => {
        element.removeAttribute("data-motion-reveal"); element.removeAttribute("data-revealed");
      });
    };
  }, [mode, ready, pathname]);
  return <MotionContext.Provider value={{ mode, preference, setPreference }}>{children}</MotionContext.Provider>;
}
