import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  covarianceFromParameters,
  syntheticSignals,
} from "../math/covariance";

@customElement("rg-covariance-explorer")
export class CovarianceExplorer extends LitElement {
  @state() private correlation = 0.72;
  @state() private varianceX = 1.2;
  @state() private varianceY = 0.72;

  static styles = css`
    :host {
      display: block;
      color: #203044;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .shell {
      overflow: hidden;
      border: 1px solid rgba(46, 53, 74, 0.12);
      border-radius: 32px;
      background: #fffdf8;
      box-shadow: 0 26px 70px rgba(62, 45, 91, 0.12);
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      padding: 28px 32px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      background: #fff7e9;
    }

    label {
      display: grid;
      gap: 9px;
      color: #5b6171;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    label span {
      color: #20283a;
      font-size: 1rem;
      letter-spacing: 0;
      text-transform: none;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #ef6b5b;
    }

    .visuals {
      display: grid;
      grid-template-columns: 1.15fr 0.9fr 0.75fr;
      min-height: 370px;
    }

    .panel {
      min-width: 0;
      padding: 28px;
      border-right: 1px solid rgba(46, 53, 74, 0.1);
    }

    .panel:last-child {
      border-right: 0;
    }

    h3 {
      margin: 0 0 6px;
      font-size: 1rem;
    }

    .hint {
      min-height: 36px;
      margin: 0 0 18px;
      color: #555d6d;
      font-size: 0.82rem;
      line-height: 1.45;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .matrix {
      position: relative;
      display: grid;
      grid-template-columns: repeat(2, minmax(54px, 1fr));
      gap: 10px;
      max-width: 220px;
      margin: 46px auto 28px;
      padding: 8px 16px;
    }

    .matrix::before,
    .matrix::after {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 8px;
      border-block: 2px solid #353d52;
      content: "";
    }

    .matrix::before {
      left: 0;
      border-left: 2px solid #353d52;
    }

    .matrix::after {
      right: 0;
      border-right: 2px solid #353d52;
    }

    .cell {
      border-radius: 9px;
      background: #f2ecff;
      padding: 12px 7px;
      color: #5c43a7;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      text-align: center;
    }

    .cell.cross {
      background: #fff0e8;
      color: #a83b32;
    }

    .badge {
      display: block;
      width: fit-content;
      margin: 0 auto;
      border-radius: 99px;
      background: #e8f8f3;
      padding: 9px 13px;
      color: #18745e;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .explanation {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 28px;
      background: #22283b;
      color: #f8f4eb;
    }

    .explanation strong {
      flex: 0 0 auto;
      color: #ffd36b;
    }

    .explanation p {
      margin: 0;
      color: #d8d9e2;
      font-size: 0.92rem;
      line-height: 1.55;
    }

    @media (max-width: 850px) {
      .controls,
      .visuals {
        grid-template-columns: 1fr;
      }

      .panel {
        border-right: 0;
        border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      }
    }
  `;

  private setNumber(
    event: Event,
    setter: (value: number) => void,
  ): void {
    setter(Number((event.target as HTMLInputElement).value));
    this.dispatchEvent(
      new CustomEvent("rg-interaction", {
        bubbles: true,
        composed: true,
        detail: { widget: "covariance-explorer" },
      }),
    );
  }

  private linePath(values: number[], yCenter: number): string {
    const width = 420;
    const amplitude = 34;
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = yCenter - value * amplitude;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  render() {
    const model = covarianceFromParameters(
      this.varianceX,
      this.varianceY,
      this.correlation,
    );
    const signals = syntheticSignals(this.correlation);
    const [major, minor] = model.eigenvalues;
    const ellipseRx = 72 * Math.sqrt(major);
    const ellipseRy = 72 * Math.sqrt(minor);
    const angleDegrees = (model.angle * 180) / Math.PI;
    const covariance = model.covariance;
    const relationship =
      Math.abs(this.correlation) < 0.2
        ? "mostly independent"
        : this.correlation > 0
          ? "moving together"
          : "moving in opposite directions";

    return html`
      <div class="shell">
        <div class="controls">
          <label>
            Channel relationship
            <span>${this.correlation.toFixed(2)}</span>
            <input
              aria-label="Channel correlation"
              type="range"
              min="-0.95"
              max="0.95"
              step="0.01"
              .value=${String(this.correlation)}
              @input=${(event: Event) =>
                this.setNumber(event, (value) => (this.correlation = value))}
            />
          </label>
          <label>
            Channel 1 variance
            <span>${this.varianceX.toFixed(2)}</span>
            <input
              aria-label="Channel 1 variance"
              type="range"
              min="0.3"
              max="1.8"
              step="0.01"
              .value=${String(this.varianceX)}
              @input=${(event: Event) =>
                this.setNumber(event, (value) => (this.varianceX = value))}
            />
          </label>
          <label>
            Channel 2 variance
            <span>${this.varianceY.toFixed(2)}</span>
            <input
              aria-label="Channel 2 variance"
              type="range"
              min="0.3"
              max="1.8"
              step="0.01"
              .value=${String(this.varianceY)}
              @input=${(event: Event) =>
                this.setNumber(event, (value) => (this.varianceY = value))}
            />
          </label>
        </div>

        <div class="visuals">
          <section class="panel">
            <h3>Two synthetic EEG channels</h3>
            <p class="hint">The channels are currently ${relationship}.</p>
            <svg viewBox="0 0 420 235" role="img" aria-label="Synthetic EEG signals">
              ${[60, 175].map(
                (y) => svg`<line x1="0" x2="420" y1=${y} y2=${y}
                  stroke="#dde0e8" stroke-dasharray="4 6" />`,
              )}
              <path
                d=${this.linePath(signals.x, 60)}
                fill="none"
                stroke="#1ca9a0"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d=${this.linePath(signals.y, 175)}
                fill="none"
                stroke="#ef6b5b"
                stroke-width="3"
                stroke-linecap="round"
              />
              <text x="4" y="18" fill="#178078" font-size="13" font-weight="700">
                channel 1
              </text>
              <text x="4" y="133" fill="#c85347" font-size="13" font-weight="700">
                channel 2
              </text>
            </svg>
          </section>

          <section class="panel">
            <h3>The covariance ellipse</h3>
            <p class="hint">
              Covariance means shared change. Tilt shows whether the channels
              move together; axis length shows how much each varies.
            </p>
            <svg viewBox="0 0 300 260" role="img" aria-label="Covariance ellipse">
              <line x1="22" x2="278" y1="130" y2="130" stroke="#d7d9e2" />
              <line x1="150" x2="150" y1="15" y2="245" stroke="#d7d9e2" />
              <g transform="translate(150 130)">
                <ellipse
                  rx=${ellipseRx}
                  ry=${ellipseRy}
                  transform="rotate(${angleDegrees})"
                  fill="rgba(108, 78, 185, .18)"
                  stroke="#6c4eb9"
                  stroke-width="4"
                />
                <line
                  x1=${-ellipseRx}
                  x2=${ellipseRx}
                  transform="rotate(${angleDegrees})"
                  stroke="#6c4eb9"
                  stroke-width="2"
                  stroke-dasharray="5 5"
                />
              </g>
              <circle cx="150" cy="130" r="5" fill="#ef6b5b" />
            </svg>
          </section>

          <section class="panel">
            <h3>The covariance matrix</h3>
            <p class="hint">
              A matrix is a table of numbers. Here, the diagonal stores each
              channel’s variation and the other cells store shared change.
            </p>
            <div class="matrix" aria-label="Two by two covariance matrix">
              <span class="cell">${covariance[0][0].toFixed(2)}</span>
              <span class="cell cross">${covariance[0][1].toFixed(2)}</span>
              <span class="cell cross">${covariance[1][0].toFixed(2)}</span>
              <span class="cell">${covariance[1][1].toFixed(2)}</span>
            </div>
            <span class="badge">✓ valid in every direction</span>
          </section>
        </div>

        <div class="explanation">
          <strong>One trial → one point</strong>
          <p>
            With more EEG channels, this ellipse becomes a many-dimensional
            shape encoded by one covariance matrix. Valid matrices of this kind
            are called symmetric positive-definite, or SPD. Their collection is
            the curved data space we will learn to navigate.
          </p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-covariance-explorer": CovarianceExplorer;
  }
}
