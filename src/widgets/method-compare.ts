import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * §4.3 — "so which route?"
 *
 * Replaces the standalone method-guide section. Same content, but positioned as
 * the answer to the fork rather than as a table that appeared out of nowhere.
 * CSP + LDA is here as the baseline any credible BCI comparison needs.
 */

interface Column {
  key: string;
  name: string;
  needs: string;
  learns: string;
  decides: string;
  wins: string;
  watch: string;
}

const COLUMNS: Column[] = [
  {
    key: "one",
    name: "Route 1 · Riemannian MDM",
    needs: "One centre per class",
    learns: "Where each class sits",
    decides: "Nearest centre",
    wins: "Calibration is short, and you want to be able to explain the decision",
    watch: "A single centre cannot describe a class that is really two clusters",
  },
  {
    key: "two",
    name: "Route 2 · Tangent space",
    needs: "A reference point, then any classifier",
    learns: "A boundary in geometry-aware features",
    decides: "Whatever the classifier decides",
    wins: "You have enough data, and the classes need a more flexible separator",
    watch: "The reference point must be fitted inside each training fold, or you leak",
  },
  {
    key: "base",
    name: "Baseline · CSP + LDA",
    needs: "Two classes and a decent amount of calibration",
    learns: "Spatial filters with class-separating variance",
    decides: "A linear boundary on log-variance",
    wins: "Motor imagery, two classes, plenty of trials",
    watch: "Overfits with few trials, and must be fitted inside validation",
  },
];

const ROWS: { label: string; field: keyof Column }[] = [
  { label: "What it needs", field: "needs" },
  { label: "What it learns", field: "learns" },
  { label: "How it decides", field: "decides" },
  { label: "When it wins", field: "wins" },
  { label: "What to watch", field: "watch" },
];

@customElement("rg-method-compare")
export class RgMethodCompare extends LitElement {
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

    .grid {
      display: grid;
      grid-template-columns: minmax(130px, max-content) repeat(3, 1fr);
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 16px;
      overflow: hidden;
      background: #fffdf8;
    }

    .cell {
      padding: 13px 16px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.09);
      font-size: 0.87rem;
      line-height: 1.55;
      color: #4a5265;
    }

    .cell.head {
      font-family: "Fraunces", Georgia, serif;
      font-size: 0.98rem;
      font-weight: 700;
      color: #20283a;
      background: #fdfaf3;
      border-bottom: 2px solid rgba(46, 53, 74, 0.18);
    }

    .cell.head.one {
      box-shadow: inset 0 4px 0 #d99a2b;
    }

    .cell.head.two {
      box-shadow: inset 0 4px 0 #2b8f8a;
    }

    .cell.head.base {
      box-shadow: inset 0 4px 0 rgba(46, 53, 74, 0.35);
    }

    .cell.label {
      font-weight: 600;
      color: #6a7183;
      background: #faf9f5;
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .cell.head.label {
      background: #fdfaf3;
      color: #20283a;
      font-weight: 700;
      font-size: 0.98rem;
      letter-spacing: 0;
      text-transform: none;
    }

    .row {
      display: contents;
    }

    .grid > .cell:nth-last-child(-n + 4) {
      border-bottom: 0;
    }

    details {
      display: none;
    }

    @media (max-width: 900px) {
      .grid {
        display: none;
      }

      details {
        display: block;
        border: 1px solid rgba(46, 53, 74, 0.18);
        border-radius: 14px;
        background: #fffdf8;
        overflow: hidden;
      }

      summary {
        cursor: pointer;
        padding: 13px 18px;
        font-weight: 600;
        color: #4a3585;
      }

      .stack {
        padding: 0 18px 16px;
      }

      .stack section {
        border-top: 1px solid rgba(46, 53, 74, 0.12);
        padding: 12px 0;
      }

      .stack h4 {
        margin: 0 0 6px;
        font-family: "Fraunces", Georgia, serif;
        font-size: 1rem;
      }

      .stack dl {
        margin: 0;
        display: grid;
        gap: 6px;
      }

      .stack dt {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6a7183;
        font-weight: 700;
      }

      .stack dd {
        margin: 0 0 4px;
        font-size: 0.87rem;
        line-height: 1.55;
        color: #4a5265;
      }
    }
  `;

  render() {
    return html`
      <div class="grid" role="table" aria-label="Comparison of the two routes and the CSP baseline">
        <div class="row" role="row">
          <div class="cell head label" role="columnheader" aria-label="Comparison dimension"></div>
          ${COLUMNS.map(
            (c) => html`<div class=${`cell head ${c.key}`} role="columnheader">${c.name}</div>`,
          )}
        </div>
        ${ROWS.map(
          (row) => html`
            <div class="row" role="row">
              <div class="cell label" role="rowheader">${row.label}</div>
              ${COLUMNS.map(
                (c) => html`<div class="cell" role="cell">${c[row.field]}</div>`,
              )}
            </div>
          `,
        )}
      </div>

      <details>
        <summary>Compare the three side by side</summary>
        <div class="stack">
          ${COLUMNS.map(
            (c) => html`
              <section>
                <h4>${c.name}</h4>
                <dl>
                  ${ROWS.map(
                    (row) => html`
                      <dt>${row.label}</dt>
                      <dd>${c[row.field]}</dd>
                    `,
                  )}
                </dl>
              </section>
            `,
          )}
        </div>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-method-compare": RgMethodCompare;
  }
}
