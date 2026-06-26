import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  ARITHMETIC_BOUNDARY,
  GEOMETRIC_BOUNDARY,
  MOVE_POWER,
  REST_POWER,
  bandTrace,
  classify,
  trialPower,
} from "./power-line-model";

const P_MIN = 0.18;
const P_MAX = 1.28;
const AXIS_X0 = 64;
const AXIS_X1 = 656;

@customElement("rg-power-line")
export class PowerLine extends LitElement {
  @state() private movement = 0.62;
  @state() private useLog = false;

  static styles = css`
    :host {
      display: block;
      color: #20283a;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .shell {
      overflow: hidden;
      border: 1px solid rgba(53, 46, 79, 0.13);
      border-radius: 30px;
      background: #fffdf8;
      box-shadow: 0 26px 70px rgba(62, 45, 91, 0.12);
    }

    .heading {
      padding: 26px 32px 4px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #b8472f;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    h3 {
      margin: 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .controls {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 18px 26px;
      align-items: center;
      padding: 20px 32px;
    }

    label {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: center;
      color: #5d6475;
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    input[type="range"] {
      width: 100%;
      min-height: 44px;
      accent-color: #b8472f;
      touch-action: pan-x;
    }

    output {
      min-width: 74px;
      color: #b8472f;
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      text-align: right;
    }

    .toggle {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(53, 46, 79, 0.2);
      border-radius: 999px;
      background: #fff;
      padding: 8px 16px;
      color: #3f2b7c;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
    }

    .toggle[aria-pressed="true"] {
      border-color: #6c4eb9;
      background: #6c4eb9;
      color: #fff;
    }

    .toggle .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.5;
    }

    .toggle[aria-pressed="true"] .dot {
      opacity: 1;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 3px solid #1ca9a0;
      outline-offset: 3px;
    }

    .stage {
      padding: 4px 28px 8px;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .panel-label {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin: 12px 4px 2px;
      color: #555d6d;
      font-size: 0.74rem;
      font-weight: 700;
    }

    .verdict {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: center;
      margin: 8px 28px 0;
      border-radius: 16px;
      background: #f3eeff;
      padding: 14px 18px;
    }

    .verdict.flip {
      background: #fdeede;
    }

    .badge {
      border-radius: 10px;
      padding: 7px 13px;
      color: #fff;
      font-size: 0.82rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .badge.rest {
      background: #18756f;
    }

    .badge.move {
      background: #b8472f;
    }

    .verdict p {
      margin: 0;
      color: #4a4368;
      font-size: 0.82rem;
      line-height: 1.5;
    }

    .verdict strong {
      color: #20283a;
    }

    .takeaway {
      margin-top: 18px;
      padding: 18px 32px;
      background: #24283b;
      color: #d8d9e2;
      font-size: 0.86rem;
      line-height: 1.55;
    }

    .takeaway strong {
      color: #ffd36b;
    }

    @media (max-width: 720px) {
      .controls {
        grid-template-columns: 1fr;
      }
    }
  `;

  private powerToX(power: number): number {
    const clamped = Math.min(P_MAX, Math.max(P_MIN, power));
    return (
      AXIS_X0 + ((clamped - P_MIN) / (P_MAX - P_MIN)) * (AXIS_X1 - AXIS_X0)
    );
  }

  private tracePath(values: number[]): string {
    const width = AXIS_X1 - AXIS_X0;
    return values
      .map((value, index) => {
        const x = AXIS_X0 + (index / (values.length - 1)) * width;
        const y = 60 - value * 30;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  private onMovement(event: Event): void {
    this.movement = Number((event.target as HTMLInputElement).value);
  }

  private toggleRule(): void {
    this.useLog = !this.useLog;
  }

  render() {
    const power = trialPower(this.movement);
    const predicted = classify(power, this.useLog);
    const otherPrediction = classify(power, !this.useLog);
    const flips = predicted !== otherPrediction;
    const boundary = this.useLog ? GEOMETRIC_BOUNDARY : ARITHMETIC_BOUNDARY;
    const trace = bandTrace(this.movement);

    const trialX = this.powerToX(power);
    const restX = this.powerToX(REST_POWER);
    const moveX = this.powerToX(MOVE_POWER);
    const boundaryX = this.powerToX(boundary);
    const arithX = this.powerToX(ARITHMETIC_BOUNDARY);
    const geomX = this.powerToX(GEOMETRIC_BOUNDARY);

    return html`
      <div class="shell">
        <div class="heading">
          <p class="eyebrow">The simplest decoder · one electrode</p>
          <h3>Before matrices: one channel is just a number.</h3>
        </div>

        <div class="controls">
          <label>
            Imagined movement
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              aria-label="Imagined movement strength, rest to move"
              .value=${String(this.movement)}
              @input=${this.onMovement}
            />
            <output aria-live="polite">
              ${this.movement < 0.18
                ? "rest"
                : this.movement > 0.82
                  ? "move"
                  : "in between"}
            </output>
          </label>
          <button
            class="toggle"
            type="button"
            aria-pressed=${this.useLog ? "true" : "false"}
            @click=${this.toggleRule}
          >
            <span class="dot" aria-hidden="true"></span>
            Use the log (ratio) distance
          </button>
        </div>

        <div class="stage">
          <div class="panel-label">
            <span>One channel, band-pass filtered</span>
            <span>power = variance of this trace</span>
          </div>
          <svg viewBox="0 0 720 120" role="img" aria-label="A single EEG trace whose amplitude shrinks as imagined movement increases">
            <line x1=${AXIS_X0} x2=${AXIS_X1} y1="60" y2="60" stroke="#e0dcef" stroke-dasharray="4 7" />
            <path
              d=${this.tracePath(trace)}
              fill="none"
              stroke="#b8472f"
              stroke-width="2.4"
              stroke-linecap="round"
            />
          </svg>

          <div class="panel-label">
            <span>Band power on a number line</span>
            <span>nearest class mean wins</span>
          </div>
          <svg viewBox="0 0 720 150" role="img" aria-label="Band power number line with rest and move class means, the decision boundary, and the current trial">
            <line x1=${AXIS_X0} x2=${AXIS_X1} y1="78" y2="78" stroke="#cfd3dd" stroke-width="2" />

            <!-- candidate boundaries -->
            <line x1=${arithX} x2=${arithX} y1="44" y2="112" stroke=${this.useLog ? "#cdb4f0" : "#6c4eb9"} stroke-width=${this.useLog ? 1.5 : 3} stroke-dasharray=${this.useLog ? "4 4" : "0"} />
            <line x1=${geomX} x2=${geomX} y1="44" y2="112" stroke=${this.useLog ? "#6c4eb9" : "#cdb4f0"} stroke-width=${this.useLog ? 3 : 1.5} stroke-dasharray=${this.useLog ? "0" : "4 4"} />
            <text x=${arithX} y="128" fill=${this.useLog ? "#9a86c6" : "#6c4eb9"} font-size="11" font-weight="700" text-anchor="middle">straight-line middle</text>
            <text x=${geomX} y="142" fill=${this.useLog ? "#6c4eb9" : "#9a86c6"} font-size="11" font-weight="700" text-anchor="middle">ratio-correct</text>

            <!-- class means -->
            <circle cx=${moveX} cy="78" r="10" fill="#b8472f" />
            <text x=${moveX} y="46" fill="#b8472f" font-size="12.5" font-weight="800" text-anchor="middle">move mean</text>
            <circle cx=${restX} cy="78" r="10" fill="#18756f" />
            <text x=${restX} y="46" fill="#18756f" font-size="12.5" font-weight="800" text-anchor="middle">rest mean</text>

            <!-- the new trial -->
            <line x1=${trialX} x2=${trialX} y1="62" y2="94" stroke="#d8a219" stroke-width="2" />
            <circle cx=${trialX} cy="78" r="7" fill="#ffd36b" stroke="#caa01f" stroke-width="2" />
            <text x=${trialX} y="112" fill="#a07c17" font-size="11.5" font-weight="800" text-anchor="middle">new trial</text>

            <line x1=${boundaryX} x2=${trialX} y1="78" y2="78" stroke="transparent" />
          </svg>
        </div>

        <div class="verdict ${flips ? "flip" : ""}">
          <span class="badge ${predicted}">nearest: ${predicted === "rest" ? "rest mean" : "move mean"}</span>
          <p>
            ${flips
              ? html`<strong>This trial is in the gap.</strong> The straight-line
                  rule and the ratio-correct rule disagree here — toggling the
                  distance flips which mean is “nearest.” That trap is the whole
                  reason the rest of the page exists.`
              : html`The new trial sits nearer the
                  <strong>${predicted === "rest" ? "rest" : "move"} mean</strong>.
                  Which mean is nearer is the whole comparison — the actual
                  decision waits for the finale, and the matrices reuse it.`}
          </p>
        </div>

        <p class="takeaway">
          <strong>Two ingredients, not the finale:</strong>
          summarise a trial as one number (its power), and compare powers with
          the right ruler. Band power is a ratio scale (like decibels), so the
          honest distance is <em>|log a − log b|</em>, not <em>|a − b|</em> —
          which is exactly why the straight-line rule above can mislead. A
          covariance matrix will need the very same fix, one dimension up.
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-power-line": PowerLine;
  }
}
