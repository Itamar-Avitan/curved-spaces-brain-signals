import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { GLOSSARY } from "../glossary";
import "./formula";

const OPEN_EVENT = "rg-term-open";

/**
 * A jargon term you can click to get a short explainer without losing your
 * place: plain idea, the formula if there is one, why it matters for EEG, and a
 * link to where it is taught.
 *
 * Wraps inline text and inherits the surrounding type, so it can be dropped into
 * running prose:
 *
 *   <rg-term key="spd-manifold">SPD manifold</rg-term>
 *
 * On a phone the card becomes a bottom sheet rather than a floating popover,
 * because a popover anchored to a word in a narrow column has nowhere to go.
 */
@customElement("rg-term")
export class RgTerm extends LitElement {
  /** Key into GLOSSARY. */
  @property({ type: String }) key = "";

  @state() private open = false;
  /** Which entry the card is showing; resets to `key` on each open. */
  @state() private activeKey = "";
  @state() private placement: { top: number; left: number; above: boolean } = {
    top: 0,
    left: 0,
    above: false,
  };
  @state() private sheet = false;

  private readonly onDocumentDown = (event: Event) => {
    if (!this.open) return;
    if (event.composedPath().includes(this)) return;
    this.close();
  };

  private readonly onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.open) {
      event.stopPropagation();
      this.close({ restoreFocus: true });
    }
  };

  private readonly onOtherOpened = (event: Event) => {
    if ((event as CustomEvent).detail !== this && this.open) this.close();
  };

  private readonly onReflow = () => {
    if (this.open) this.close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.onDocumentDown, true);
    document.addEventListener("keydown", this.onKey, true);
    document.addEventListener(OPEN_EVENT, this.onOtherOpened);
    window.addEventListener("scroll", this.onReflow, true);
    window.addEventListener("resize", this.onReflow);
  }

  disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.onDocumentDown, true);
    document.removeEventListener("keydown", this.onKey, true);
    document.removeEventListener(OPEN_EVENT, this.onOtherOpened);
    window.removeEventListener("scroll", this.onReflow, true);
    window.removeEventListener("resize", this.onReflow);
    super.disconnectedCallback();
  }

  private close({ restoreFocus = false } = {}) {
    this.open = false;
    if (restoreFocus) {
      this.renderRoot.querySelector<HTMLButtonElement>(".trigger")?.focus();
    }
  }

  private toggle() {
    if (this.open) {
      this.close({ restoreFocus: true });
      return;
    }

    const trigger = this.renderRoot.querySelector<HTMLButtonElement>(".trigger");
    if (!trigger) return;

    const box = trigger.getBoundingClientRect();
    this.sheet = window.innerWidth < 640;

    if (!this.sheet) {
      const width = 340;
      const margin = 14;
      const roomBelow = window.innerHeight - box.bottom;
      const above = roomBelow < 280 && box.top > 280;
      const left = Math.min(
        Math.max(margin, box.left + box.width / 2 - width / 2),
        window.innerWidth - width - margin,
      );
      this.placement = {
        top: above ? box.top - 10 : box.bottom + 10,
        left,
        above,
      };
    }

    this.activeKey = this.key;
    this.open = true;
    document.dispatchEvent(
      new CustomEvent(OPEN_EVENT, { detail: this, bubbles: false }),
    );

    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(".card")?.focus();
    });
  }

  static styles = css`
    :host {
      display: inline;
    }

    * {
      box-sizing: border-box;
    }

    .trigger {
      display: inline;
      margin: 0;
      border: 0;
      background: none;
      padding: 0;
      color: inherit;
      font: inherit;
      text-align: inherit;
      text-decoration: underline dotted currentColor;
      text-decoration-thickness: 1.5px;
      text-underline-offset: 3px;
      cursor: help;
    }

    .trigger:hover,
    .trigger[aria-expanded="true"] {
      background: rgba(108, 78, 185, 0.12);
      border-radius: 3px;
      text-decoration-style: solid;
    }

    .trigger:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 2px;
      border-radius: 3px;
    }

    .scrim {
      position: fixed;
      inset: 0;
      z-index: 998;
      background: rgba(20, 24, 38, 0.34);
    }

    .card {
      position: fixed;
      z-index: 999;
      width: 340px;
      max-height: min(70vh, 520px);
      overflow-y: auto;
      border: 1px solid rgba(46, 53, 74, 0.16);
      border-radius: 18px;
      background: #fffdf8;
      box-shadow: 0 22px 60px rgba(28, 22, 48, 0.28);
      padding: 18px 20px 16px;
      color: #20283a;
      font-family: "DM Sans", system-ui, sans-serif;
      text-align: left;
    }

    .card:focus {
      outline: none;
    }

    .card.above {
      transform: translateY(-100%);
    }

    .card.sheet {
      top: auto;
      right: 0;
      bottom: 0;
      left: 0;
      width: auto;
      max-height: 82vh;
      border-radius: 22px 22px 0 0;
      padding-bottom: 26px;
    }

    .head {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: start;
    }

    h3 {
      margin: 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.12rem;
      line-height: 1.25;
    }

    .dismiss {
      flex: none;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 50%;
      background: rgba(32, 40, 58, 0.08);
      color: #3c4459;
      font-size: 1rem;
      line-height: 1;
      cursor: pointer;
    }

    .dismiss:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 2px;
    }

    .plain {
      margin: 9px 0 0;
      font-size: 0.93rem;
      line-height: 1.6;
    }

    .formal {
      display: inline-block;
      margin-top: 10px;
      border-radius: 99px;
      background: #efeaff;
      padding: 4px 10px;
      color: #4a3388;
      font-size: 0.71rem;
      font-weight: 700;
    }

    rg-formula {
      margin: 14px 0 0;
      font-size: 0.92rem;
    }

    .why {
      margin: 14px 0 0;
      border-left: 3px solid #1ca9a0;
      padding-left: 12px;
      color: #40485a;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 15px;
      padding-top: 13px;
      border-top: 1px solid rgba(46, 53, 74, 0.1);
    }

    a {
      border-radius: 99px;
      background: rgba(108, 78, 185, 0.1);
      padding: 5px 11px;
      color: #4a3388;
      font-size: 0.76rem;
      font-weight: 700;
      text-decoration: none;
    }

    a.go {
      background: #6c4eb9;
      color: #fff;
    }

    a:hover {
      text-decoration: underline;
    }
  `;

  render() {
    const entry = GLOSSARY[this.activeKey || this.key];

    if (!GLOSSARY[this.key] || !entry) {
      // Unknown key: render the text plainly rather than a dead control.
      return html`<slot></slot>`;
    }

    // No whitespace between the top-level nodes below: the host is inline, so a
    // stray newline renders as a space before the following punctuation.
    return html`<button
        class="trigger"
        type="button"
        aria-expanded=${this.open ? "true" : "false"}
        aria-haspopup="dialog"
        title=${`What is ${entry.term.toLowerCase()}?`}
        @click=${this.toggle}
      ><slot></slot></button>${this.open && this.sheet
        ? html`<div class="scrim" @click=${() => this.close()}></div>`
        : nothing}${this.open
        ? html`
            <div
              class=${`card${this.sheet ? " sheet" : ""}${
                !this.sheet && this.placement.above ? " above" : ""
              }`}
              style=${this.sheet
                ? ""
                : `top:${this.placement.top}px;left:${this.placement.left}px`}
              role="dialog"
              aria-label=${entry.term}
              tabindex="-1"
            >
              <div class="head">
                <h3>${entry.term}</h3>
                <button
                  class="dismiss"
                  type="button"
                  aria-label="Close"
                  @click=${() => this.close({ restoreFocus: true })}
                >
                  ✕
                </button>
              </div>

              <p class="plain">${entry.plain}</p>
              ${entry.formal
                ? html`<span class="formal">${entry.formal}</span>`
                : nothing}
              ${entry.formula
                ? html`<rg-formula key=${this.activeKey} compact></rg-formula>`
                : nothing}
              ${entry.why ? html`<p class="why">${entry.why}</p>` : nothing}

              <div class="links">
                ${entry.href
                  ? html`<a
                      class="go"
                      href=${entry.href}
                      @click=${() => this.close()}
                      >${entry.hrefLabel ?? "Go to the section"} →</a
                    >`
                  : nothing}
                ${(entry.see ?? [])
                  .filter((key) => GLOSSARY[key])
                  .map(
                    (key) => html`<a
                      href="#glossary-title"
                      @click=${(event: Event) => {
                        event.preventDefault();
                        this.activeKey = key;
                      }}
                      >${GLOSSARY[key].term}</a
                    >`,
                  )}
              </div>
            </div>
          `
        : nothing}`;
  }
}
