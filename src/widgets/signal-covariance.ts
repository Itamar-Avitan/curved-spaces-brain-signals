import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import { signalCovarianceFrame } from "./signal-covariance-model";

@customElement("rg-signal-covariance")
export class SignalCovariance extends LitElement {
  @state() private progress = 0.28;
  @state() private playing = false;
  @state() private reducedMotion = false;

  private timer: number | undefined;
  private motionQuery?: MediaQueryList;

  static styles = css`
    :host {
      display: block;
      margin-top: 58px;
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
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 36px;
      align-items: end;
      padding: 28px 32px;
      border-bottom: 1px solid rgba(53, 46, 79, 0.1);
      background:
        linear-gradient(125deg, rgba(108, 78, 185, 0.12), transparent 48%),
        #f8f4ff;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #6c4eb9;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    h3 {
      margin: 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(1.75rem, 3.2vw, 2.8rem);
      letter-spacing: -0.025em;
      line-height: 1.08;
    }

    .heading > p {
      margin: 0;
      color: #5d6475;
      font-size: 0.88rem;
      line-height: 1.55;
    }

    .controls {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 18px;
      align-items: center;
      padding: 18px 32px;
      border-bottom: 1px solid rgba(53, 46, 79, 0.1);
      background: #fff8ed;
    }

    button {
      min-width: 116px;
      min-height: 44px;
      border: 0;
      border-radius: 999px;
      background: #a93a31;
      padding: 10px 18px;
      color: white;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 3px solid #1ca9a0;
      outline-offset: 3px;
    }

    label {
      display: grid;
      gap: 7px;
      color: #5d6475;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #6c4eb9;
      touch-action: pan-x;
    }

    output {
      min-width: 92px;
      color: #4f3892;
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      text-align: right;
    }

    .visuals {
      display: grid;
      grid-template-columns: 1.35fr 56px 0.85fr;
      align-items: stretch;
    }

    .panel {
      min-width: 0;
      padding: 26px 30px 30px;
    }

    .panel-label {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 18px;
    }

    .panel-label strong {
      font-size: 0.94rem;
    }

    .panel-label span {
      color: #555d6d;
      font-size: 0.72rem;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .collapse {
      display: grid;
      place-items: center;
      border-inline: 1px solid rgba(53, 46, 79, 0.09);
      background: #f4efff;
      color: #6c4eb9;
      font-size: 1.45rem;
      font-weight: 800;
    }

    .matrix {
      position: relative;
      display: grid;
      grid-template-columns: repeat(2, minmax(58px, 1fr));
      gap: 9px;
      max-width: 225px;
      margin: 24px auto 22px;
      padding: 8px 16px;
    }

    .matrix::before,
    .matrix::after {
      position: absolute;
      inset-block: 0;
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
      background: #eee8ff;
      padding: 11px 6px;
      color: #513a95;
      font-size: 0.86rem;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      text-align: center;
      transition:
        background 160ms ease,
        color 160ms ease;
    }

    .cell.cross {
      background: #ffede6;
      color: #a83b32;
    }

    .equivalent {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
      align-items: baseline;
      margin: 0;
      padding: 18px 30px;
      background: #24283b;
      color: #d8d9e2;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    .equivalent strong {
      color: #ffd36b;
      white-space: nowrap;
    }

    @media (max-width: 800px) {
      .heading,
      .visuals {
        grid-template-columns: 1fr;
      }

      .controls {
        grid-template-columns: 1fr;
      }

      output {
        text-align: left;
      }

      .collapse {
        min-height: 48px;
        border-block: 1px solid rgba(53, 46, 79, 0.09);
        border-inline: 0;
        transform: rotate(90deg);
      }
    }

    @media (max-width: 520px) {
      .heading,
      .controls,
      .panel {
        padding-inline: 20px;
      }

      .equivalent {
        grid-template-columns: 1fr;
        gap: 4px;
        padding-inline: 20px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cell {
        transition: none;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionQuery.matches;
    if (this.reducedMotion) {
      this.progress = 1;
    }
    this.motionQuery.addEventListener("change", this.handleMotionChange);
  }

  disconnectedCallback(): void {
    this.stopPlayback();
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    super.disconnectedCallback();
  }

  private readonly handleMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    if (event.matches) {
      this.stopPlayback();
      this.progress = 1;
    }
  };

  private linePath(values: number[], yCenter: number): string {
    const width = 520;
    const amplitude = 38;
    return values
      .map((value, index) => {
        const x = (index / Math.max(1, values.length - 1)) * width;
        const y = yCenter - value * amplitude;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  private emitInteraction(): void {
    this.dispatchEvent(
      new CustomEvent("rg-interaction", {
        bubbles: true,
        composed: true,
        detail: { widget: "signal-covariance" },
      }),
    );
  }

  private stopPlayback(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
    this.playing = false;
  }

  private togglePlayback(): void {
    if (this.reducedMotion) {
      this.progress = 1;
      return;
    }
    if (this.playing) {
      this.stopPlayback();
      return;
    }
    if (this.progress >= 0.995) {
      this.progress = 0.05;
    }
    this.playing = true;
    this.emitInteraction();
    this.timer = window.setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.012);
      if (this.progress >= 1) {
        this.stopPlayback();
      }
    }, 45);
  }

  private scrub(event: Event): void {
    this.stopPlayback();
    this.progress = Number((event.target as HTMLInputElement).value);
    this.emitInteraction();
  }

  render() {
    const frame = signalCovarianceFrame(this.progress);
    const visibleX = frame.signals.x.slice(0, frame.visibleCount);
    const visibleY = frame.signals.y.slice(0, frame.visibleCount);
    const [major, minor] = frame.eigenvalues;
    const ellipseRx = Math.min(94, 78 * Math.sqrt(major));
    const ellipseRy = Math.min(70, 78 * Math.sqrt(minor));
    const angle = (frame.angle * 180) / Math.PI;
    const matrix = frame.covariance;
    const relationship =
      frame.correlation > 0.35
        ? "The channels tend to rise and fall together."
        : frame.correlation < -0.35
          ? "The channels tend to move in opposite directions."
          : "The channels currently share little linear variation.";

    return html`
      <section class="shell" aria-labelledby="signal-covariance-title">
        <div class="heading">
          <div>
            <p class="eyebrow">Watch the representation change</p>
            <h3 id="signal-covariance-title">
              Many voltage samples become one relationship summary.
            </h3>
          </div>
          <p>
            Scrub through the trial. At each point, the decoder recomputes
            variance within each channel and covariance between them using only
            the samples revealed so far.
          </p>
        </div>

        <div class="controls">
          <button type="button" @click=${this.togglePlayback}>
            ${this.reducedMotion
              ? "Show complete trial"
              : this.playing
                ? "Pause construction"
                : this.progress >= 0.995
                  ? "Replay construction"
                  : "Play construction"}
          </button>
          <label>
            Samples included
            <input
              aria-label="Samples included in covariance estimate"
              type="range"
              min="0.05"
              max="1"
              step="0.01"
              .value=${String(this.progress)}
              @input=${this.scrub}
            />
          </label>
          <output aria-live="polite">
            ${frame.visibleCount} / ${frame.signals.x.length}
          </output>
        </div>

        <div class="visuals">
          <div class="panel">
            <div class="panel-label">
              <strong>Samples seen so far</strong>
              <span>two channels across time</span>
            </div>
            <svg viewBox="0 0 520 270" role="img" aria-label="Two accumulating synthetic EEG traces">
              ${[74, 202].map(
                (y) => svg`
                  <line
                    x1="0"
                    x2="520"
                    y1=${y}
                    y2=${y}
                    stroke="#d9dce5"
                    stroke-dasharray="4 7"
                  />
                `,
              )}
              <text x="6" y="27" fill="#18756f" font-size="13" font-weight="700">channel 1</text>
              <text x="6" y="155" fill="#b84d43" font-size="13" font-weight="700">channel 2</text>
              <path
                d=${this.linePath(visibleX, 74)}
                fill="none"
                stroke="#1ca9a0"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d=${this.linePath(visibleY, 202)}
                fill="none"
                stroke="#ef6b5b"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <div class="collapse" aria-hidden="true">→</div>

          <div class="panel">
            <div class="panel-label">
              <strong>Current covariance</strong>
              <span>one matrix per trial</span>
            </div>
            <div class="matrix" aria-label="Current two by two covariance matrix">
              <span class="cell">${matrix[0][0].toFixed(2)}</span>
              <span class="cell cross">${matrix[0][1].toFixed(2)}</span>
              <span class="cell cross">${matrix[1][0].toFixed(2)}</span>
              <span class="cell">${matrix[1][1].toFixed(2)}</span>
            </div>
            <svg viewBox="0 0 280 160" role="img" aria-label="Ellipse representing the current covariance matrix">
              <line x1="28" x2="252" y1="80" y2="80" stroke="#d9dce5" />
              <line x1="140" x2="140" y1="16" y2="144" stroke="#d9dce5" />
              <ellipse
                cx="140"
                cy="80"
                rx=${ellipseRx}
                ry=${ellipseRy}
                fill="rgba(108, 78, 185, 0.16)"
                stroke="#6c4eb9"
                stroke-width="3"
                transform="rotate(${angle} 140 80)"
              />
            </svg>
          </div>
        </div>

        <p class="equivalent">
          <strong>${this.reducedMotion ? "Static view" : "What changed"}</strong>
          <span>
            ${relationship} The diagonal cells store each channel’s variance;
            the matching off-diagonal cells store how the pair changes
            together. The full trial is compressed into this structured
            summary.
          </span>
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-signal-covariance": SignalCovariance;
  }
}
