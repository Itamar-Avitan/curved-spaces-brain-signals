/**
 * Fold reference material away on phones.
 *
 * The guide is long because it teaches by letting you handle things, and the
 * interactive sections are the point — they are not the part to shorten. What
 * can fold is the material a reader consults rather than reads: comparison
 * tables, the glossary index, the reading library, the list of next steps.
 *
 * Progressive enhancement, and deliberately not a `<details>` element: the same
 * markup has to stay fully expanded on desktop, where the length is not a
 * problem and the layout depends on the content being in flow.
 *
 * Mark a block with `data-collapse-mobile="Label for the button"`.
 */

const BREAKPOINT = "(max-width: 720px)";

interface Collapsible {
  panel: HTMLElement;
  button: HTMLButtonElement;
  label: string;
}

let collapsibles: Collapsible[] = [];
let wired = false;

function setOpen(item: Collapsible, open: boolean): void {
  item.panel.hidden = !open;
  item.button.setAttribute("aria-expanded", open ? "true" : "false");
  item.button.textContent = open ? `Hide ${item.label}` : `Show ${item.label}`;
}

function build(): void {
  if (wired) return;
  wired = true;

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-collapse-mobile]"),
  );

  for (const panel of targets) {
    const label = panel.dataset.collapseMobile?.trim() || "this section";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "collapse-toggle";
    button.setAttribute("aria-expanded", "false");

    const id =
      panel.id || `collapsible-${Math.abs(hash(label + targets.indexOf(panel)))}`;
    panel.id = id;
    button.setAttribute("aria-controls", id);

    panel.parentElement?.insertBefore(button, panel);

    const item: Collapsible = { panel, button, label };
    button.addEventListener("click", () => {
      setOpen(item, panel.hidden);
      if (!panel.hidden) return;
      // Collapsing something you have scrolled past leaves you stranded below
      // it; bring the control back into view.
      const box = button.getBoundingClientRect();
      if (box.top < 0) button.scrollIntoView({ block: "center" });
    });
    collapsibles.push(item);
  }
}

function hash(value: string): number {
  let out = 0;
  for (let i = 0; i < value.length; i += 1) {
    out = (out << 5) - out + value.charCodeAt(i);
    out |= 0;
  }
  return out;
}

function apply(matches: boolean): void {
  if (matches) build();
  for (const item of collapsibles) {
    item.button.hidden = !matches;
    // Always fully expanded above the breakpoint.
    if (!matches) {
      item.panel.hidden = false;
    } else {
      setOpen(item, false);
    }
  }
}

function init(): void {
  if (!("matchMedia" in window)) return;
  const query = window.matchMedia(BREAKPOINT);
  apply(query.matches);
  query.addEventListener("change", (event) => apply(event.matches));
}

if (document.readyState !== "loading") init();
else document.addEventListener("DOMContentLoaded", init);
