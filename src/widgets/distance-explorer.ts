import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  congruence,
  determinant,
  eigen,
  euclideanInterpolate,
  geodesic,
  type Sym2,
} from "../math/spd";

/** Rotate an SPD matrix by `angle`, keeping its eigenvalues. */
function rotate(s: Sym2, angle: number): Sym2 {
  const c = Math.cos(angle);
  const n = Math.sin(angle);
  return congruence([c, -n, n, c], s);
}

/**
 * Two ways to pose the same pair of trials.
 *
 * `aligned` is the classic swelling demo: both patterns share the coordinate
 * axes, so they commute and the geodesic only rescales the axes.
 *
 * `rotated` tilts the second one. The matrices no longer commute, and the
 * geodesic has to TURN the ellipse to get there — the visible signature of
 * curvature, and the one thing that cannot be explained away as "take logs
 * before averaging".
 */
const POSES = {
  aligned: {
    label: "Axis-aligned",
    note: "Both patterns line up with the axes, so the path only stretches and squeezes.",
    start: [0.25, 0, 4] as Sym2,
    end: [4, 0, 0.25] as Sym2,
  },
  rotated: {
    label: "Tilted",
    note: "Now the second pattern is turned. Watch the path rotate the ellipse — no amount of rescaling alone gets you there.",
    start: [0.25, 0, 4] as Sym2,
    end: rotate([4, 0, 0.25] as Sym2, Math.PI / 3),
  },
} as const;

type PoseKey = keyof typeof POSES;

@customElement("rg-distance-explorer")
export class DistanceExplorer extends LitElement {
  @state() private position = 0.5;
  @state() private isPlaying = false;

  @state() private pose: PoseKey = "aligned";

  private get start(): Sym2 {
    return POSES[this.pose].start;
  }

  private get end(): Sym2 {
    return POSES[this.pose].end;
  }
  private animationFrame?: number;
  private animationStartedAt = 0;

  static styles = css`
    :host {
      display: block;
      color: #20283a;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    button:focus-visible,
    input:focus-visible,
    summary:focus-visible {
      outline: 3px solid #1ca9a0;
      outline-offset: 4px;
    }

    .shell {
      overflow: hidden;
      border: 1px solid rgba(46, 53, 74, 0.12);
      border-radius: 30px;
      background: #fffdf8;
      box-shadow: 0 26px 70px rgba(62, 45, 91, 0.12);
    }

    .problem {
      display: grid;
      grid-template-columns: 0.7fr 1fr;
      gap: 32px;
      padding: 28px 30px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      background: #fff7e9;
    }

    .problem-label,
    .method-label {
      margin: 0;
      color: #a93a31;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .problem h3 {
      margin: 7px 0 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.55rem;
      line-height: 1.1;
    }

    .problem-copy {
      margin: 0;
      color: #616879;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .endpoint-key {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 15px;
      align-items: center;
      padding: 20px 30px;
      background: #fffdf8;
    }

    .endpoint-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 13px;
      align-items: center;
      border-radius: 15px;
      background: rgba(32, 40, 58, 0.055);
      padding: 13px 15px;
    }

    .endpoint-card i {
      display: block;
      width: 29px;
      height: 58px;
      border: 3px solid #1ca9a0;
      border-radius: 50%;
      background: rgba(28, 169, 160, 0.12);
    }

    .endpoint-card.end i {
      width: 58px;
      height: 29px;
      border-color: #ef6b5b;
      background: rgba(239, 107, 91, 0.12);
    }

    .endpoint-card strong,
    .endpoint-card span {
      display: block;
    }

    .endpoint-card strong {
      font-size: 0.84rem;
    }

    .endpoint-card span {
      margin-top: 3px;
      color: #555d6d;
      font-size: 0.72rem;
      line-height: 1.4;
    }

    .same-size {
      color: #6c4eb9;
      font-size: 0.74rem;
      font-weight: 800;
      text-align: center;
    }

    .pose-row {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 8px 16px;
      align-items: center;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      padding: 16px 30px;
      background: #fffdf8;
    }

    .pose-label {
      color: #6c4eb9;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pose-buttons {
      display: flex;
      gap: 7px;
    }

    .pose-buttons button {
      min-height: 36px;
      border: 1px solid rgba(46, 53, 74, 0.18);
      border-radius: 99px;
      background: #fff;
      padding: 6px 15px;
      color: #3c4459;
      font-size: 0.79rem;
      font-weight: 700;
      cursor: pointer;
    }

    .pose-buttons button[aria-pressed="true"] {
      border-color: #6c4eb9;
      background: #6c4eb9;
      color: #fff;
    }

    .pose-note {
      margin: 0;
      color: #616879;
      font-size: 0.79rem;
      line-height: 1.5;
    }

    @media (max-width: 820px) {
      .pose-row {
        grid-template-columns: 1fr;
      }
    }

    .pose-punch {
      display: block;
      margin-top: 8px;
      color: #12766f;
      font-style: normal;
      font-weight: 700;
    }

    .control {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 18px;
      align-items: center;
      padding: 24px 30px;
      background: #22283b;
      color: white;
    }

    .play {
      min-width: 104px;
      min-height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      background: #ffd36b;
      padding: 10px 15px;
      color: #302616;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
    }

    .slider-wrap {
      display: grid;
      gap: 7px;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #ffd36b;
    }

    .stage-labels {
      display: flex;
      justify-content: space-between;
      color: #aeb2c5;
      font-size: 0.65rem;
      font-weight: 700;
    }

    .quick-positions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .quick-positions button {
      min-height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      background: transparent;
      padding: 6px 8px;
      color: #c7c9d3;
      font-size: 0.65rem;
      font-weight: 700;
      cursor: pointer;
    }

    .quick-positions button.active {
      border-color: #ffd36b;
      background: rgba(255, 211, 107, 0.12);
      color: #ffd36b;
    }

    .position {
      min-width: 116px;
      color: #fff;
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      text-align: right;
    }

    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .method {
      padding: 30px;
    }

    .method + .method {
      border-left: 1px solid rgba(46, 53, 74, 0.1);
      background: #f5f1ff;
    }

    .method.geometry .method-label {
      color: #6c4eb9;
    }

    .method h3 {
      margin: 8px 0 5px;
      font-size: 1.2rem;
    }

    .formal-name {
      margin: 0 0 4px;
      color: #555d6d;
      font-size: 0.76rem;
    }

    .method-explanation {
      min-height: 58px;
      margin: 8px 0 4px;
      color: #666d7d;
      font-size: 0.78rem;
      line-height: 1.5;
    }

    svg {
      display: block;
      width: min(100%, 420px);
      height: auto;
      margin: 4px auto;
    }

    .readout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 8px;
    }

    .readout div {
      border-radius: 13px;
      background: rgba(32, 40, 58, 0.055);
      padding: 12px;
    }

    .readout span,
    .readout strong {
      display: block;
    }

    .readout span {
      color: #555d6d;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .readout strong {
      margin-top: 3px;
      font-variant-numeric: tabular-nums;
    }

    .area-bar {
      position: relative;
      height: 8px;
      margin-top: 8px;
      overflow: hidden;
      border-radius: 99px;
      background: #dedfe5;
    }

    .area-bar i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #ef6b5b;
      transition: width 140ms ease;
    }

    .geometry .area-bar i {
      background: #6c4eb9;
    }

    .warning,
    .success {
      min-height: 82px;
      margin: 14px 0 0;
      border-radius: 13px;
      padding: 12px 14px;
      font-size: 0.8rem;
      line-height: 1.45;
    }

    .warning {
      background: #fff0ed;
      color: #8e3d34;
    }

    .success {
      background: #e8f8f3;
      color: #176c57;
    }

    .warning strong,
    .success strong {
      display: block;
      margin-bottom: 3px;
    }

    .definition {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 18px;
      align-items: center;
      padding: 20px 28px;
      background: #fff1cc;
    }

    .definition strong {
      color: #7a5720;
    }

    .definition p {
      margin: 0;
      color: #6d5c3f;
      font-size: 0.86rem;
      line-height: 1.5;
    }

    .bci-chain {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(32, 40, 58, 0.12);
    }

    .bci-chain div {
      background: #fffdf8;
      padding: 18px 22px;
    }

    .bci-chain span {
      color: #a93a31;
      font-size: 0.66rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .bci-chain strong {
      display: block;
      margin-top: 5px;
      font-size: 0.84rem;
      line-height: 1.4;
    }

    details {
      border-top: 1px solid rgba(32, 40, 58, 0.1);
      padding: 18px 28px 22px;
      background: #edf8f6;
    }

    summary {
      display: flex;
      min-height: 44px;
      align-items: center;
      color: #176c57;
      font-size: 0.84rem;
      font-weight: 800;
      cursor: pointer;
    }

    details p {
      margin: 10px 0 0;
      color: #356e61;
      font-size: 0.82rem;
      line-height: 1.55;
    }

    @media (max-width: 760px) {
      .problem,
      .comparison,
      .bci-chain {
        grid-template-columns: 1fr;
      }

      .endpoint-key {
        grid-template-columns: 1fr;
      }

      .same-size {
        transform: rotate(90deg);
      }

      .pose-row {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 8px 16px;
      align-items: center;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      padding: 16px 30px;
      background: #fffdf8;
    }

    .pose-label {
      color: #6c4eb9;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pose-buttons {
      display: flex;
      gap: 7px;
    }

    .pose-buttons button {
      min-height: 36px;
      border: 1px solid rgba(46, 53, 74, 0.18);
      border-radius: 99px;
      background: #fff;
      padding: 6px 15px;
      color: #3c4459;
      font-size: 0.79rem;
      font-weight: 700;
      cursor: pointer;
    }

    .pose-buttons button[aria-pressed="true"] {
      border-color: #6c4eb9;
      background: #6c4eb9;
      color: #fff;
    }

    .pose-note {
      margin: 0;
      color: #616879;
      font-size: 0.79rem;
      line-height: 1.5;
    }

    @media (max-width: 820px) {
      .pose-row {
        grid-template-columns: 1fr;
      }
    }

    .pose-punch {
      display: block;
      margin-top: 8px;
      color: #12766f;
      font-style: normal;
      font-weight: 700;
    }

    .control {
        grid-template-columns: 1fr;
      }

      .play {
        width: 100%;
      }

      .position {
        text-align: center;
      }

      .method + .method {
        border-top: 1px solid rgba(46, 53, 74, 0.1);
        border-left: 0;
      }

      .definition {
        grid-template-columns: 1fr;
        gap: 5px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .area-bar i {
        transition: none;
      }
    }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopAnimation();
  }

  private stopAnimation(): void {
    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
    this.isPlaying = false;
  }

  private toggleAnimation(): void {
    if (this.isPlaying) {
      this.stopAnimation();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      this.position = this.position === 0.5 ? 0 : 0.5;
      return;
    }

    this.isPlaying = true;
    this.animationStartedAt = performance.now();
    const duration = 4200;

    const animate = (now: number): void => {
      const elapsed = now - this.animationStartedAt;
      const progress = Math.min(1, elapsed / duration);
      this.position = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);

      if (progress < 1 && this.isPlaying) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.position = 0.5;
        this.stopAnimation();
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private updatePosition(event: Event): void {
    this.stopAnimation();
    this.position = Number((event.target as HTMLInputElement).value);
    this.dispatchEvent(
      new CustomEvent("rg-interaction", {
        bubbles: true,
        composed: true,
        detail: {
          widget: "distance-explorer",
          position: this.position,
        },
      }),
    );
  }

  private setPosition(position: number): void {
    this.stopAnimation();
    this.position = position;
  }

  private ellipse(matrix: Sym2, color: string) {
    const axes = (m: Sym2) => {
      const { values, angle } = eigen(m);
      return {
        rx: 48 * Math.sqrt(values[0]),
        ry: 48 * Math.sqrt(values[1]),
        deg: ((angle * 180) / Math.PI).toFixed(2),
      };
    };
    const now = axes(matrix);
    const from = axes(this.start);
    const to = axes(this.end);

    return svg`
      <svg viewBox="0 0 300 235" role="img" aria-label="Endpoint covariance ellipses and the current intermediate pattern">
        <line x1="25" x2="275" y1="117.5" y2="117.5" stroke="#d9dbe3" />
        <line x1="150" x2="150" y1="15" y2="220" stroke="#d9dbe3" />
        <ellipse
          cx="150"
          cy="117.5"
          rx=${from.rx}
          ry=${from.ry}
          transform=${`rotate(${from.deg} 150 117.5)`}
          fill="none"
          stroke="#1ca9a0"
          stroke-width="2"
          stroke-dasharray="5 6"
          opacity="0.45"
        />
        <ellipse
          cx="150"
          cy="117.5"
          rx=${to.rx}
          ry=${to.ry}
          transform=${`rotate(${to.deg} 150 117.5)`}
          fill="none"
          stroke="#ef6b5b"
          stroke-width="2"
          stroke-dasharray="5 6"
          opacity="0.45"
        />
        <ellipse
          cx="150"
          cy="117.5"
          rx=${now.rx}
          ry=${now.ry}
          transform=${`rotate(${now.deg} 150 117.5)`}
          fill="${color}22"
          stroke=${color}
          stroke-width="4"
        />
        <circle cx="150" cy="117.5" r="4" fill=${color} />
        <text x="28" y="26" fill="#747b8d" font-size="11">
          dashed = real endpoints
        </text>
      </svg>
    `;
  }

  render() {
    const entryPath = euclideanInterpolate(
      this.start,
      this.end,
      this.position,
    );
    const geometryPath = geodesic(this.start, this.end, this.position);
    const entryArea = Math.sqrt(determinant(entryPath));
    const geometryArea = Math.sqrt(determinant(geometryPath));
    const atEndpoint = this.position < 0.02 || this.position > 0.98;
    const nearMiddle = Math.abs(this.position - 0.5) < 0.08;

    return html`
      <div class="shell">
        <section class="problem">
          <div>
            <p class="problem-label">The decoder’s problem</p>
            <h3>It has seen A and B. What should count as “between” them?</h3>
          </div>
          <p class="problem-copy">
            Imagine two valid EEG trials from nearby recording conditions, both
            carrying the same total amount of variation but arranged
            differently. A decoder that averages trials or aligns sessions must
            decide what the patterns in between them mean.
          </p>
        </section>

        <div class="pose-row">
          <span class="pose-label">How the two patterns sit</span>
          <div class="pose-buttons" role="group" aria-label="Pattern alignment">
            ${(Object.keys(POSES) as PoseKey[]).map(
              (key) => html`
                <button
                  type="button"
                  aria-pressed=${key === this.pose ? "true" : "false"}
                  @click=${() => {
                    this.stopAnimation();
                    this.pose = key;
                  }}
                >
                  ${POSES[key].label}
                </button>
              `,
            )}
          </div>
          <p class="pose-note">${POSES[this.pose].note}</p>
        </div>

        <div class="endpoint-key">
          <div class="endpoint-card">
            <i aria-hidden="true"></i>
            <div>
              <strong>Pattern A · channel 2 dominates</strong>
              <span>Relative ellipse area: 1.00</span>
            </div>
          </div>
          <span class="same-size">same total variation ↔</span>
          <div class="endpoint-card end">
            <i aria-hidden="true"></i>
            <div>
              <strong>Pattern B · ${this.pose === "rotated" ? "same shape, turned" : "channel 1 dominates"}</strong>
              <span>Relative ellipse area: 1.00</span>
            </div>
          </div>
        </div>

        <div class="control">
          <button class="play" type="button" @click=${this.toggleAnimation}>
            ${this.isPlaying ? "Pause replay" : "▶ Replay the journey"}
          </button>
          <div class="slider-wrap">
            <input
              aria-label="Position between covariance patterns"
              type="range"
              min="0"
              max="1"
              step="0.01"
              .value=${String(this.position)}
              @input=${this.updatePosition}
            />
            <div class="stage-labels" aria-hidden="true">
              <span>A · start</span><span>halfway</span><span>B · end</span>
            </div>
            <div class="quick-positions" aria-label="Guided positions">
              <button
                class=${this.position < 0.02 ? "active" : ""}
                type="button"
                @click=${() => this.setPosition(0)}
              >
                Show A
              </button>
              <button
                class=${Math.abs(this.position - 0.5) < 0.02 ? "active" : ""}
                type="button"
                @click=${() => this.setPosition(0.5)}
              >
                Show halfway
              </button>
              <button
                class=${this.position > 0.98 ? "active" : ""}
                type="button"
                @click=${() => this.setPosition(1)}
              >
                Show B
              </button>
            </div>
          </div>
          <span class="position">
            ${Math.round(this.position * 100)}% from A to B
          </span>
        </div>

        <div class="comparison">
          <section class="method">
            <p class="method-label">Treat entries as ordinary coordinates</p>
            <h3>Average each matrix entry</h3>
            <p class="formal-name">Formal name: Euclidean interpolation</p>
            <p class="method-explanation">
              ${this.pose === "rotated"
                ? "Each entry slides straight to its target. The"
                : "Every diagonal value changes by the same additive amount. The"}
              result remains a valid covariance matrix, but its overall scale
              can grow beyond both observed endpoints.
            </p>
            ${this.ellipse(entryPath, "#ef6b5b")}
            <div class="readout">
              <div>
                <span>relative ellipse area</span>
                <strong>${entryArea.toFixed(2)}×</strong>
                <div class="area-bar" aria-hidden="true">
                  <i style="width:${Math.min(100, entryArea * 42)}%"></i>
                </div>
              </div>
              <div>
                <span>interpretation</span>
                <strong>
                  ${atEndpoint
                    ? "observed endpoint"
                    : nearMiddle
                      ? "artificially enlarged"
                      : "growing scale"}
                </strong>
              </div>
            </div>
            <p class="warning">
              <strong>${nearMiddle ? "Notice the halfway pattern." : "Watch the solid ellipse."}</strong>
              ${atEndpoint
                ? "At the real endpoints, both routes agree."
                : "It becomes larger than both real patterns. This is the swelling effect: a valid but potentially misleading intermediate scale."}
            </p>
          </section>

          <section class="method geometry">
            <p class="method-label">Respect covariance scaling</p>
            <h3>Change the axes multiplicatively</h3>
            <p class="formal-name">Formal name: Riemannian geodesic</p>
            <p class="method-explanation">
              ${this.pose === "rotated"
                ? "The path has to turn the ellipse, not just resize it — the two patterns cannot be reached from one another by rescaling the axes alone."
                : "One axis contracts while the other expands by matching multiplicative factors."}
              This route follows the geometry used to define Riemannian
              distance.
            </p>
            ${this.ellipse(geometryPath, "#6c4eb9")}
            <div class="readout">
              <div>
                <span>relative ellipse area</span>
                <strong>${geometryArea.toFixed(2)}×</strong>
                <div class="area-bar" aria-hidden="true">
                  <i style="width:${Math.min(100, geometryArea * 42)}%"></i>
                </div>
              </div>
              <div>
                <span>interpretation</span>
                <strong>scale preserved</strong>
              </div>
            </div>
            <p class="success">
              <strong>The halfway pattern changes shape, not total scale.</strong>
              Its relative area stays at 1.00 because this example’s endpoints
              have equal determinant.
              ${this.pose === "rotated"
                ? html`<em class="pose-punch"
                    >It also rotates — and rotation is exactly what no amount of
                    “take the logs and average” can produce. This is the part of
                    the geometry that is genuinely curved.</em
                  >`
                : nothing}
            </p>
          </section>
        </div>

        <div class="definition">
          <strong>What “distance” means here</strong>
          <p>
            A path defines how we move between matrices; its length defines
            distance. The Riemannian route is the shortest path under a metric
            designed for positive-definite covariance matrices.
          </p>
        </div>

        <div class="bci-chain" aria-label="Why the interpolation lesson matters to a BCI">
          <div>
            <span>Training</span>
            <strong>Several trials describe one brain-state class.</strong>
          </div>
          <div>
            <span>Geometry</span>
            <strong>The distance rule decides where their centre lies.</strong>
          </div>
          <div>
            <span>Prediction</span>
            <strong>A shifted centre changes which class looks nearest.</strong>
          </div>
        </div>

        <details>
          <summary>Check your understanding: is the arithmetic halfway matrix invalid?</summary>
          <p>
            No. In this example it is still positive definite and therefore
            valid. The problem is subtler: entry-wise averaging enlarges its
            scale even though both endpoints have the same scale. The
            structure-aware route avoids that distortion under the chosen
            geometry.
          </p>
        </details>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-distance-explorer": DistanceExplorer;
  }
}
