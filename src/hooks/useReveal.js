import { useEffect } from "react";

export default function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
    document.querySelectorAll("[data-reveal]:not(.is-in), .stat:not(.is-in)").forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
