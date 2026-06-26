/**
 * Chapter navigation progress + active-chapter highlight (§10).
 *
 * Drives two things on the sticky `.chapter-map`:
 *  - a thin scroll-progress bar showing how far through the page the reader is;
 *  - an `is-active` / `aria-current` highlight on the chapter whose section is
 *    currently in view (a lightweight scroll-spy).
 *
 * It is intentionally framework-free and guarded, so it is a no-op when the
 * chapter map is absent and runs unchanged on the page preview or the Wix embed
 * wherever the same markup is present.
 */

function initChapterProgress(): void {
  const map = document.querySelector<HTMLElement>(".chapter-map");
  if (!map) return;

  const links = Array.from(
    map.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
  );
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1) ?? "";
      return id ? document.getElementById(id) : null;
    })
    .filter((section): section is HTMLElement => section !== null);

  const setActive = (id: string): void => {
    for (const link of links) {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  if ("IntersectionObserver" in window && sections.length > 0) {
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        let bestId = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActive(bestId);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((section) => observer.observe(section));
  }

  const bar = map.querySelector<HTMLElement>(".chapter-progress span");
  if (bar) {
    const update = (): void => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const fraction = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${fraction})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }
}

if (document.readyState !== "loading") initChapterProgress();
else document.addEventListener("DOMContentLoaded", initChapterProgress);
