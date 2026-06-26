function showReviewBuild(): void {
  if (import.meta.env.VITE_REVIEW_BUILD !== "true") return;

  const banner = document.querySelector<HTMLElement>(".review-build");
  if (!banner) return;

  const sha = import.meta.env.VITE_REVIEW_SHA || "local";
  const date = import.meta.env.VITE_REVIEW_DATE || "unknown date";
  const shaNode = banner.querySelector<HTMLElement>("[data-review-sha]");
  const dateNode = banner.querySelector<HTMLTimeElement>("[data-review-date]");

  if (shaNode) {
    shaNode.textContent = sha === "local" ? "local build" : sha.slice(0, 7);
    shaNode.title = sha;
  }
  if (dateNode) {
    dateNode.textContent = date;
    dateNode.dateTime = date;
  }
  banner.hidden = false;
}

if (document.readyState !== "loading") showReviewBuild();
else document.addEventListener("DOMContentLoaded", showReviewBuild);
