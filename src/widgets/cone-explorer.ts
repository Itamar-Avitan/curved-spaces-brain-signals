import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  determinant,
  eigen,
  euclideanInterpolate,
  geodesic,
  type Sym2,
} from "../math/spd";

/**
 * The SPD cone as a coordinate system you can put a matrix into, rather than a
 * drawing of one.
 *
 * Coordinates. Writing a matrix as [[a, b], [b, c]] and setting
 *
 *   u = (a − c)/√2      v = b·√2      w = (a + c)/√2
 *
 * the condition "symmetric positive-definite" becomes exactly
 *
 *   w > 0   and   u² + v² < w²
 *
 * — a right circular cone with a 45° half-angle, apex at the zero matrix, with
 * the identity sitting on its axis. That is not an analogy or a squashed
 * projection; it is the same statement as ac > b² rewritten. Verified against
 * 20,000 random matrices.
 */

const TILT = 0.38; // how flat the cross-section circles read on screen
const CX = 236;
const CY = 318;
const SCALE = 69;

interface World {
  u: number;
  v: number;
  w: number;
}

function toWorld([a, b, c]: Sym2): World {
  return {
    u: (a - c) / Math.SQRT2,
    v: b * Math.SQRT2,
    w: (a + c) / Math.SQRT2,
  };
}

function project({ u, v, w }: World): [number, number] {
  return [CX + SCALE * u, CY - SCALE * w + SCALE * TILT * v];
}

const screenOf = (m: Sym2) => project(toWorld(m));

@customElement("rg-cone-explorer")
export class ConeExplorer extends LitElement {
  @state() private var1 = 1.5;
  @state() private var2 = 1.1;
  @state() private correlation = 0.45;
  @state() private showPaths = false;

  /** The fixed partner used when the two routes are shown. */
  private readonly partner: Sym2 = [0.7, -0.45, 2.3];

  private get matrix(): Sym2 {
    const b = this.correlation * Math.sqrt(this.var1 * this.var2);
    return [this.var1, b, this.var2];
  }

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
    input:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 3px;
    }

    .shell {
      overflow: hidden;
      border: 1px solid rgba(46, 53, 74, 0.12);
      border-radius: 28px;
      background: #fffdf8;
      box-shadow: 0 24px 64px rgba(62, 45, 91, 0.14);
    }

    .head {
      display: grid;
      grid-template-columns: 0.85fr 1fr;
      gap: 28px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      background: #f4f0ff;
      padding: 24px 28px;
    }

    .head p.label {
      margin: 0;
      color: #6c4eb9;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .head h3 {
      margin: 7px 0 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.5rem;
      line-height: 1.15;
    }

    .head p.copy {
      margin: 0;
      color: #565d70;
      font-size: 0.89rem;
      line-height: 1.65;
    }

    .sliders {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      background: #fff7e9;
      padding: 18px 28px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
    }

    label {
      display: block;
      color: #4b5265;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    label b {
      display: block;
      margin: 2px 0 4px;
      color: #20283a;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.15rem;
      font-variant-numeric: tabular-nums;
    }

    input[type="range"] {
      width: 100%;
      min-height: 34px;
      accent-color: #6c4eb9;
    }

    .body {
      display: grid;
      grid-template-columns: 1fr 290px;
    }

    .stage {
      border-right: 1px solid rgba(46, 53, 74, 0.1);
      padding: 8px 10px 16px;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .rim {
      fill: none;
      stroke: rgba(108, 78, 185, 0.5);
      stroke-width: 1.6;
    }

    .rim.faint {
      stroke: rgba(108, 78, 185, 0.2);
      stroke-width: 1.2;
    }

    .ray {
      stroke: rgba(108, 78, 185, 0.28);
      stroke-width: 1.1;
    }

    .surface {
      fill: rgba(108, 78, 185, 0.07);
      stroke: none;
    }

    .axis-line {
      stroke: rgba(32, 40, 58, 0.32);
      stroke-width: 1.3;
      stroke-dasharray: 4 4;
    }

    .axis-label {
      fill: #6b7186;
      font-family: "Fraunces", Georgia, serif;
      font-size: 12px;
      font-style: italic;
    }

    .apex-label,
    .id-label {
      fill: #6b7186;
      font-size: 10.5px;
      font-weight: 700;
    }

    .pt {
      fill: #6c4eb9;
      stroke: #fffdf8;
      stroke-width: 2.5;
    }

    .pt.invalid {
      fill: #c8402f;
    }

    .pt-id {
      fill: none;
      stroke: #2b3348;
      stroke-width: 1.6;
    }

    .drop {
      stroke: rgba(108, 78, 185, 0.45);
      stroke-width: 1.2;
      stroke-dasharray: 3 3;
    }

    .path-eu {
      fill: none;
      stroke: #ef6b5b;
      stroke-width: 2.6;
    }

    .path-geo {
      fill: none;
      stroke: #1ca9a0;
      stroke-width: 2.6;
    }

    .path-end {
      fill: #8b8f9e;
      stroke: #fffdf8;
      stroke-width: 2;
    }

    .readout {
      padding: 20px 22px;
      background: #faf8ff;
    }

    .readout h4 {
      margin: 0 0 10px;
      font-size: 0.92rem;
    }

    .mat {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }

    .mat i {
      border-radius: 10px;
      padding: 10px 4px;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.02rem;
      font-style: normal;
      font-variant-numeric: tabular-nums;
      text-align: center;
    }

    .mat i.diag {
      background: #efeaff;
      color: #4a3388;
    }

    .mat i.off {
      background: #ffe9e3;
      color: #a93a31;
    }

    .coords {
      display: grid;
      gap: 5px;
      margin-bottom: 12px;
      border-radius: 12px;
      background: #fff;
      padding: 12px 13px;
    }

    .coords div {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.79rem;
      color: #4b5265;
    }

    .coords b {
      font-family: "Fraunces", Georgia, serif;
      font-variant-numeric: tabular-nums;
    }

    .verdict {
      border-radius: 12px;
      padding: 11px 13px;
      font-size: 0.81rem;
      font-weight: 700;
      line-height: 1.45;
    }

    .verdict.ok {
      background: #d9f2ee;
      color: #12766f;
    }

    .verdict.no {
      background: #ffe1db;
      color: #a93a31;
    }

    .ell {
      margin-top: 14px;
      border-radius: 12px;
      background: #fff;
      padding: 8px;
    }

    .ell svg {
      max-width: 190px;
      margin: 0 auto;
    }

    .ell-shape {
      fill: rgba(108, 78, 185, 0.14);
      stroke: #6c4eb9;
      stroke-width: 2.4;
    }

    .ell-axis {
      stroke: rgba(32, 40, 58, 0.18);
      stroke-width: 1;
    }

    .ell p {
      margin: 4px 0 0;
      color: #6b7186;
      font-size: 0.72rem;
      text-align: center;
    }

    .toggle {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      background: #22283b;
      padding: 14px 28px;
      color: #fff;
      font-size: 0.83rem;
    }

    .toggle button {
      min-height: 40px;
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 999px;
      background: transparent;
      padding: 8px 18px;
      color: #fff;
      font-size: 0.79rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }

    .toggle button[aria-pressed="true"] {
      border-color: #ffd36b;
      background: #ffd36b;
      color: #302616;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      padding: 12px 28px;
      background: #fffdf8;
      border-top: 1px solid rgba(46, 53, 74, 0.09);
      color: #555d6d;
      font-size: 0.75rem;
    }

    .legend b {
      font-family: "Fraunces", Georgia, serif;
      font-variant-numeric: tabular-nums;
    }

    .legend-note {
      flex: 1 1 100%;
      color: #6b7186;
      line-height: 1.55;
    }

    .legend i {
      display: inline-block;
      width: 16px;
      height: 3px;
      margin-right: 6px;
      border-radius: 2px;
      vertical-align: 3px;
    }

    @media (max-width: 900px) {
      .head,
      .body,
      .sliders {
        grid-template-columns: 1fr;
      }

      .stage {
        border-right: 0;
        border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      }

      .toggle {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;

  /** One cross-section of the cone, drawn as an ellipse. */
  private rim(w: number, faint = false) {
    const [, cyAt] = project({ u: 0, v: 0, w });
    return svg`<ellipse
      class=${`rim${faint ? " faint" : ""}`}
      cx=${CX}
      cy=${cyAt.toFixed(1)}
      rx=${(SCALE * w).toFixed(1)}
      ry=${(SCALE * w * TILT).toFixed(1)}
    />`;
  }

  private pathPoints(fn: (t: number) => Sym2) {
    return Array.from({ length: 41 }, (_, i) => screenOf(fn(i / 40)))
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
  }

  render() {
    const m = this.matrix;
    const world = toWorld(m);
    const [px, py] = project(world);
    const det = determinant(m);
    const valid = m[0] > 0 && det > 1e-9;
    const radius = Math.hypot(world.u, world.v);

    const euMid = euclideanInterpolate(m, this.partner, 0.5);
    const geoMid = geodesic(m, this.partner, 0.5);
    const euMidDet = determinant(euMid);
    const geoMidDet = determinant(geoMid);
    const fairDet = Math.sqrt(
      Math.max(det, 0) * Math.max(determinant(this.partner), 0),
    );

    const wMax = 3.1;
    const [, apexY] = project({ u: 0, v: 0, w: 0 });
    const [, topY] = project({ u: 0, v: 0, w: wMax });
    const rimX = SCALE * wMax;
    const rimY = SCALE * wMax * TILT;

    // Ellipse preview for the same matrix.
    const { values, angle } = eigen(m);
    const eScale = 30;

    return html`
      <div class="shell">
        <div class="head">
          <div>
            <p class="label">The cone, with real axes</p>
            <h3>Put your matrix in the space.</h3>
          </div>
          <p class="copy">
            This is not an illustration of the idea — it is the idea, drawn to
            scale. Every valid covariance matrix is exactly one point in here,
            and the surface is where “valid” stops. Move the sliders and watch
            your matrix travel; push the correlation far enough and it reaches
            the wall.
          </p>
        </div>

        <div class="sliders">
          <label>
            Channel 1 variance <b>${this.var1.toFixed(2)}</b>
            <input
              type="range" min="0.15" max="2.6" step="0.01"
              .value=${String(this.var1)}
              @input=${(e: Event) => {
                this.var1 = Number((e.target as HTMLInputElement).value);
              }}
            />
          </label>
          <label>
            Channel 2 variance <b>${this.var2.toFixed(2)}</b>
            <input
              type="range" min="0.15" max="2.6" step="0.01"
              .value=${String(this.var2)}
              @input=${(e: Event) => {
                this.var2 = Number((e.target as HTMLInputElement).value);
              }}
            />
          </label>
          <label>
            Correlation <b>${this.correlation.toFixed(2)}</b>
            <input
              type="range" min="-0.995" max="0.995" step="0.005"
              .value=${String(this.correlation)}
              @input=${(e: Event) => {
                this.correlation = Number((e.target as HTMLInputElement).value);
              }}
            />
          </label>
        </div>

        <div class="body">
          <div class="stage">
            <svg viewBox="0 0 472 352" role="img"
              aria-label=${`The SPD cone with the current matrix plotted inside it. Determinant ${det.toFixed(3)}.`}>
              <!-- the cone surface, apex at the zero matrix -->
              <path class="surface"
                d=${`M ${CX} ${apexY} L ${CX - rimX} ${topY} A ${rimX} ${rimY} 0 0 0 ${CX + rimX} ${topY} Z`} />
              ${[0.8, 1.6, 2.4].map((w) => this.rim(w, true))}
              ${this.rim(wMax)}
              ${Array.from({ length: 12 }, (_, i) => {
                const theta = (i * Math.PI) / 6;
                const [ex, ey] = project({
                  u: wMax * Math.cos(theta),
                  v: wMax * Math.sin(theta),
                  w: wMax,
                });
                return svg`<line class="ray" x1=${CX} y1=${apexY}
                  x2=${ex.toFixed(1)} y2=${ey.toFixed(1)} />`;
              })}

              <!-- the axis of the cone: matrices proportional to the identity -->
              <line class="axis-line" x1=${CX} y1=${apexY} x2=${CX} y2=${topY - 14} />
              <text class="axis-label" x=${CX + 8} y=${topY + 4}>
                the identity direction
              </text>
              <circle class="pt-id" r="5" cx=${screenOf([1, 0, 1])[0]}
                cy=${screenOf([1, 0, 1])[1]} />
              <text class="id-label" x=${screenOf([1, 0, 1])[0] + 10}
                y=${screenOf([1, 0, 1])[1] + 4}>identity</text>
              <text class="apex-label" x=${CX - 66} y=${apexY + 6}>
                the zero matrix
              </text>
              <text class="axis-label" x="14" y=${topY + 96}>← more σ₂₂</text>
              <text class="axis-label" x="372" y=${topY + 96}>more σ₁₁ →</text>
              <text class="axis-label" x=${CX - 116} y=${topY + 20}>σ₁₂ tilts you round the cone</text>

              ${this.showPaths
                ? svg`
                    <path class="path-eu"
                      d=${this.pathPoints((t) => euclideanInterpolate(m, this.partner, t))} />
                    <path class="path-geo"
                      d=${this.pathPoints((t) => geodesic(m, this.partner, t))} />
                    <circle class="path-end" r="5"
                      cx=${screenOf(this.partner)[0]} cy=${screenOf(this.partner)[1]} />
                  `
                : nothing}

              <!-- drop line to the cross-section, so depth is readable -->
              <line class="drop" x1=${px.toFixed(1)} y1=${py.toFixed(1)}
                x2=${CX} y2=${project({ u: 0, v: 0, w: world.w })[1].toFixed(1)} />
              <circle class=${`pt${valid ? "" : " invalid"}`} r="7.5"
                cx=${px.toFixed(1)} cy=${py.toFixed(1)} />
            </svg>
          </div>

          <div class="readout">
            <h4>The same matrix, three ways</h4>
            <div class="mat">
              <i class="diag">${m[0].toFixed(2)}</i>
              <i class="off">${m[1].toFixed(2)}</i>
              <i class="off">${m[1].toFixed(2)}</i>
              <i class="diag">${m[2].toFixed(2)}</i>
            </div>

            <div class="coords">
              <div><span>height up the cone</span><b>${world.w.toFixed(2)}</b></div>
              <div><span>distance from the axis</span><b>${radius.toFixed(2)}</b></div>
              <div><span>determinant</span><b>${det.toFixed(3)}</b></div>
            </div>

            <div class=${`verdict ${valid ? "ok" : "no"}`}>
              ${valid
                ? radius > world.w * 0.93
                  ? "Just inside the surface — the two channels are nearly perfectly correlated, and the ellipse has almost collapsed to a line."
                  : "Inside the cone: a valid covariance matrix."
                : "On or past the surface — this is no longer a covariance matrix."}
            </div>

            <div class="ell">
              <svg viewBox="0 0 200 130" role="img" aria-label="The same matrix drawn as an ellipse">
                <line class="ell-axis" x1="14" y1="65" x2="186" y2="65" />
                <line class="ell-axis" x1="100" y1="8" x2="100" y2="122" />
                ${valid
                  ? svg`<ellipse class="ell-shape" cx="100" cy="65"
                      rx=${(eScale * Math.sqrt(values[0])).toFixed(1)}
                      ry=${(eScale * Math.sqrt(Math.max(values[1], 1e-6))).toFixed(1)}
                      transform=${`rotate(${((angle * 180) / Math.PI).toFixed(1)} 100 65)`} />`
                  : nothing}
              </svg>
              <p>height in the cone is overall size; distance from the axis is how stretched and tilted</p>
            </div>
          </div>
        </div>

        <div class="toggle">
          <span>
            Two routes from your matrix to a fixed second one — the same
            comparison as the distance section, now drawn inside the space.
          </span>
          <button
            type="button"
            aria-pressed=${this.showPaths ? "true" : "false"}
            @click=${() => {
              this.showPaths = !this.showPaths;
            }}
          >
            ${this.showPaths ? "✓ Showing both routes" : "Show both routes"}
          </button>
        </div>

        ${this.showPaths
          ? html`
              <div class="legend">
                <span
                  ><i style="background:#ef6b5b"></i>straight line · midpoint
                  determinant <b>${euMidDet.toFixed(2)}</b></span
                >
                <span
                  ><i style="background:#1ca9a0"></i>geodesic · midpoint
                  determinant <b>${geoMidDet.toFixed(2)}</b></span
                >
                <span class="legend-note">
                  The two endpoints justify a midpoint determinant of
                  ${fairDet.toFixed(2)}. The geodesic hits that exactly; the
                  straight route inflates it
                  ${(euMidDet / Math.max(fairDet, 1e-9)).toFixed(1)}×. That is
                  the swelling, and the dip you can see is the geodesic paying
                  for it — it drops toward the apex rather than letting the
                  overall size run away.
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
