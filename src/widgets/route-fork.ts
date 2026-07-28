import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

/**
 * §4.0 — same covariance matrix, two ways out.
 *
 * The page's two decoders were previously separated by the invariance section,
 * so they never even looked adjacent. This is the picture that says they are
 * siblings: full size once, then compact at the head of each branch so the
 * reader always knows which one they are inside.
 */
@customElement("rg-route-fork")
export class RgRouteFork extends LitElement {
  /** Small variant for the head of a route. */
  @property({ type: Boolean }) compact = false;
  /** "1" or "2" — dims the branch you are not currently reading. */
  @property({ type: String }) active = "";

  static styles = css`
    :host {
      display: block;
      margin: 26px 0;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    .wrap {
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 18px;
      background: #fffdf8;
      padding: 24px;
    }

    :host([compact]) .wrap {
      padding: 14px 18px;
      background: #fdfaf3;
    }

    .source {
      max-width: 320px;
      margin: 0 auto 6px;
      border: 1px solid rgba(108, 78, 185, 0.45);
      border-radius: 12px;
      background: rgba(108, 78, 185, 0.07);
      padding: 11px 16px;
      text-align: center;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .stem {
      display: block;
      margin: 0 auto;
      width: 2px;
      height: 20px;
      background: rgba(46, 53, 74, 0.25);
    }

    .branches {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .branch {
      border: 1px solid rgba(46, 53, 74, 0.16);
      border-radius: 14px;
      padding: 16px 18px;
      background: #fdfaf3;
      transition: opacity 0.15s ease;
    }

    .branch.one {
      border-top: 4px solid #d99a2b;
    }

    .branch.two {
      border-top: 4px solid #2b8f8a;
    }

    .branch.dim {
      opacity: 0.42;
    }

    .kicker {
      font-size: 0.7rem;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .one .kicker {
      color: #a8722a;
    }

    .two .kicker {
      color: #1e5c58;
    }

    .headline {
      margin: 0 0 8px;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.06rem;
      line-height: 1.3;
    }

    .branch .detail {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.6;
      color: #4a5265;
    }

    :host([compact]) .source,
    :host([compact]) .stem,
    :host([compact]) .branch .detail {
      display: none;
    }

    :host([compact]) .branch {
      padding: 10px 14px;
    }

    :host([compact]) .headline {
      font-size: 0.95rem;
      margin: 0;
    }
  `;

  render() {
    return html`
      <div class="wrap">
        <p class="source">One trial's covariance matrix</p>
        <span class="stem" aria-hidden="true"></span>
        <div class="branches">
          <div class=${classMap({
            branch: true,
            one: true,
            dim: this.active && this.active !== "1",
          })}>
            <p class="kicker">Route 1</p>
            <p class="headline">Measure on the surface</p>
            <p class="detail">
              Keep one centre per class. Label a new trial by whichever centre
              is nearest. Nothing is flattened and nothing is fitted.
            </p>
          </div>
          <div class=${classMap({
            branch: true,
            two: true,
            dim: this.active && this.active !== "2",
          })}>
            <p class="kicker">Route 2</p>
            <p class="headline">Draw a local map first</p>
            <p class="detail">
              Flatten around a reference point so each trial becomes a short
              list of numbers, then hand it to any ordinary classifier.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-route-fork": RgRouteFork;
  }
}
