import { useEffect, useRef } from "react";

/** Static, readable HTML is the default. Enhance only when motion is welcome. */
export function useSkybookMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      observer?.disconnect();
      clearTimeout(timer);
      element.removeAttribute("data-intro");
      element
        .querySelectorAll("[data-reveal]")
        .forEach((section) => section.removeAttribute("data-reveal-state"));
    };
    const setup = () => {
      clear();
      if (preference.matches) return;
      try {
        if (!sessionStorage.getItem("westin.skybook.intro")) {
          element.setAttribute("data-intro", "playing");
          // Delay the marker so StrictMode's setup/cleanup does not cancel the intro.
          timer = setTimeout(() => {
            element.removeAttribute("data-intro");
            try {
              sessionStorage.setItem("westin.skybook.intro", "seen");
            } catch {
              /* Storage is optional. */
            }
          }, 1100);
        }
      } catch {
        /* Private browsing still gets the complete static scene. */
      }
      if (!("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-reveal-state", "visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px 40px 0px", threshold: 0.06 },
      );
      element.querySelectorAll("[data-reveal]").forEach((section) => {
        // Do not hide content already visible, or leave focused controls invisible.
        if (section.getBoundingClientRect().top > window.innerHeight) {
          section.setAttribute("data-reveal-state", "waiting");
          observer?.observe(section);
        }
      });
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      clear();
      preference.removeEventListener("change", setup);
    };
  }, []);
  return root;
}
