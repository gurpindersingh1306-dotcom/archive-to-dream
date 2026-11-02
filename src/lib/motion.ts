import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

// Site-wide GSAP scroll motion driven by data attributes:
//   data-reveal            fade + rise when scrolled into view
//   data-reveal-stagger    children reveal one after another
//   data-parallax="0.2"    drifts while scrolling (scrubbed)
//   data-split             headline words rise in on load
//   data-count="1234"      number counts up when visible
export function useScrollMotion() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const done = new WeakSet<Element>();

      const scan = () => {
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          if (done.has(el)) return;
          done.add(el);
          const words = (el.textContent ?? "").split(" ");
          el.innerHTML = words.map((w) => `<span style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em"><span data-w style="display:inline-block">${w}</span></span>`).join(" ");
          el.setAttribute("aria-label", words.join(" "));
          gsap.from(el.querySelectorAll("[data-w]"), { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.06, delay: 0.1 });
        });
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          if (done.has(el)) return;
          done.add(el);
          gsap.from(el, { y: 48, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
        document.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((el) => {
          if (done.has(el) || !el.children.length) return;
          done.add(el);
          gsap.from(el.children, { y: 36, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          if (done.has(el)) return;
          done.add(el);
          const speed = Number(el.dataset["parallax"] || 0.2);
          gsap.to(el, { yPercent: -100 * speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          if (done.has(el)) return;
          done.add(el);
          const to = Number(el.dataset["count"]);
          const obj = { v: 0 };
          gsap.to(obj, { v: to, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString("en-IN"); } });
        });
        ScrollTrigger.refresh();
      };

      scan();
      let t: number | undefined;
      const mo = new MutationObserver(() => { window.clearTimeout(t); t = window.setTimeout(scan, 80); });
      mo.observe(document.body, { childList: true, subtree: true });
      cleanup = () => { mo.disconnect(); window.clearTimeout(t); ScrollTrigger.getAll().forEach((s) => s.kill()); };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [pathname]);
}
