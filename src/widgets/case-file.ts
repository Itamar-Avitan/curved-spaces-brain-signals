import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { distance, riemannianMean, type Sym2 } from "../math/spd";

/**
 * The page's one concrete decision, revisited five times.
 *
 * One participant imagines squeezing the left hand or the right; the decoder
 * must output "left". Everything on the page serves that single decision, and
 * this strip is what makes that visible rather than asserted.
 *
 * Steps 3 and 4 show real distances computed here, so the numbers in the strip
 * cannot drift away from the numbers in the widgets beside it.
 */

const LEFT: Sym2[] = [
  [3.0, 0.8, 1.0],
  [2.6, 0.6, 1.2],
  [3.4, 1.0, 0.9],
];
const RIGHT: Sym2[] = [
  [1.0, -0.5, 3.0],
  [1.2, -0.7, 2.7],
  [0.9, -0.4, 3.3],
];
const TRIAL: Sym2 = [2.8, 0.7, 1.1];

const d = (set: Sym2[]) => distance(TRIAL, riemannianMean(set)).toFixed(2);

interface Beat {
  where: string;
  body: unknown;
}

const BEATS: Record<string, Beat> = {
  "1": {
    where: "after Part 2",
    body: html`The trial is now a 3×3 table of which electrodes moved together.
      We still cannot compare two of them.`,
  },
  "2": {
    where: "after Part 3",
    body: html`Now we can measure the gap between two trials, and rewiring the
      amplifier will not change the answer. We still have nothing to measure
      <em>against</em>.`,
  },
  "3": {
    where: "after Route 1",
    body: html`Two stored centres. The new trial sits <strong>${d(LEFT)}</strong>
      from the "left" centre and <strong>${d(RIGHT)}</strong> from the "right"
      one. Decision: <strong>left</strong>.`,
  },
  "4": {
    where: "after Route 2",
    body: html`Same trial, flattened onto the local map into three numbers, fed
      to ordinary logistic regression. Decision: <strong>left</strong>. Two
      routes, one answer, and neither is the "real" one.`,
  },
  "5": {
    where: "before the notebook",
    body: html`Both routes run for real in the notebook — on recorded EEG, with
      whole recording runs held out, and the accuracy reported honestly.`,
  },
};

@customElement("rg-case-file")
export class RgCaseFile extends LitElement {
  /** Which beat to show: "1" through "5". */
  @property({ type: String }) step = "1";

  static styles = css`
    :host {
      display: block;
      margin: 26px 0;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .strip {
      display: grid;
      grid-template-columns: minmax(0, max-content) 1fr;
      gap: 18px;
      align-items: center;
      border-left: 4px solid #f4a261;
      border-radius: 0 14px 14px 0;
      background: rgba(244, 162, 97, 0.09);
      padding: 15px 20px;
    }

    .tag {
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      color: #a8562a;
      line-height: 1.5;
    }

    .tag small {
      display: block;
      font-size: 0.78em;
      letter-spacing: 0.06em;
      text-transform: none;
      font-weight: 500;
      opacity: 0.72;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.62;
      color: #3a4152;
    }

    @media (max-width: 640px) {
      .strip {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `;

  render() {
    const beat = BEATS[this.step];
    if (!beat) return nothing;

    return html`
      <div class="strip">
        <p class="tag">
          The case
          <small>imagine left or right</small>
        </p>
        <p>${beat.body}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-case-file": RgCaseFile;
  }
}
