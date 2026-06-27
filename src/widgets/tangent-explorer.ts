import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("rg-tangent-explorer")
export class TangentExplorer extends LitElement {
  @state() private spread = 0.65;

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
      border: 1px solid rgba(46, 53, 74, 0.12);
      border-radius: 30px;
      background: #24283b;
      color: #fffaf1;
      box-shadow: 0 26px 70px rgba(20, 23, 38, 0.22);
    }

    .control {
      display: grid;
      grid-template-columns: 0.75fr 1fr;
      gap: 28px;
      align-items: center;
      padding: 24px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .control strong,
    .control span {
      display: block;
    }

    .control span {
      margin-top: 3px;
      color: #bfc1ce;
      font-size: 0.78rem;
    }

    label {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 13px;
      align-items: center;
      color: #dfe0e7;
      font-size: 0.76rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #ffd36b;
    }

    output {
      color: #ffd36b;
      font-variant-numeric: tabular-nums;
    }

    .visual {
      padding: 25px 28px 10px;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .tangent-stage {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 8px;
      align-items: center;
    }

    .t-panel {
      min-width: 0;
      margin: 0;
    }

    .t-panel figcaption {
      margin-bottom: 4px;
      color: #fffaf1;
      font-size: 0.92rem;
      font-weight: 700;
      text-align: center;
    }

    .t-panel svg {
      max-width: 320px;
      margin: 0 auto;
    }

    .t-logmap {
      display: grid;
      justify-items: center;
      gap: 5px;
      color: #ffd36b;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .t-logmap svg {
      width: 40px;
    }

    @media (max-width: 640px) {
      .tangent-stage {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .t-logmap svg {
        transform: rotate(90deg);
      }
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 18px;
      margin: 4px 2px 2px;
      padding: 12px 16px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
    }

    .readout.far {
      background: rgba(239, 107, 91, 0.16);
    }

    .rd-metric {
      color: #dfe0e7;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .rd-metric b {
      color: #ffd36b;
      font-variant-numeric: tabular-nums;
    }

    .rd-verdict {
      color: #c9cbd6;
      font-size: 0.82rem;
    }

    .readout.ok .rd-verdict {
      color: #9fe7d4;
    }

    .readout.far .rd-verdict {
      color: #ffd0c7;
    }

    .definitions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 0 28px 28px;
    }

    .definitions article {
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.07);
      padding: 15px;
    }

    .definitions span,
    .definitions strong,
    .definitions p {
      display: block;
    }

    .definitions span {
      color: #ffd36b;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .definitions strong {
      margin-top: 4px;
    }

    .definitions p {
      margin: 5px 0 0;
      color: #c9cbd6;
      font-size: 0.78rem;
      line-height: 1.45;
    }

    .takeaway {
      padding: 18px 28px;
      background: #ffd36b;
      color: #493a17;
      font-size: 0.86rem;
      line-height: 1.5;
    }

    .takeaway strong {
      margin-right: 10px;
    }

    .check {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 28px 22px;
      background: #20243a;
    }

    .check summary {
      display: flex;
      min-height: 44px;
      align-items: center;
      cursor: pointer;
      color: #ffd36b;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .check summary:focus-visible {
      outline: 3px solid var(--cyan, #1ca9a0);
      outline-offset: 3px;
      border-radius: 6px;
    }

    .check p {
      margin: 12px 0 0;
      color: #c9cbd6;
      font-size: 0.82rem;
      line-height: 1.55;
    }

    @media (max-width: 720px) {
      .control,
      .definitions {
        grid-template-columns: 1fr;
      }
    }
  `;

  private updateSpread(event: Event): void {
    this.spread = Number((event.target as HTMLInputElement).value);
  }

  render() {
    const r = this.spread; // neighborhood size, 0.25..1.5
    const n = 5;
    const C = 180; // panel centre (each panel is a 360x360 square)
    const cyMid = 188;
    const ringScreen = 38 + ((r - 0.25) / 1.25) * 80; // 38..118 px
    const distortion = Math.min(0.2, 0.075 * r * r); // grows with neighborhood
    const distPct = (distortion * 100).toFixed(distortion < 0.1 ? 1 : 0);
    const faithful = distortion < 0.035; // ~ r < 0.68
    const bow = ringScreen * distortion * 2.7; // how far the geodesic arcs bow out

    const angles = Array.from(
      { length: n },
      (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n,
    );
    const pts: Array<readonly [number, number]> = angles.map(
      (a) =>
        [C + ringScreen * Math.cos(a), cyMid + ringScreen * Math.sin(a)] as const,
    );

    const arcPath = (
      a: readonly [number, number],
      b: readonly [number, number],
    ): string => {
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const dx = mx - C;
      const dy = my - cyMid;
      const len = Math.hypot(dx, dy) || 1;
      const qx = mx + (dx / len) * bow;
      const qy = my + (dy / len) * bow;
      return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    };

    return html`
      <div class="shell">
        <div class="control">
          <div>
            <strong>Flatten a neighborhood — not the whole world</strong>
            <span>
              Drag to set how far the trials sit from the reference, and watch how
              faithfully the flattened copy matches the curved one.
            </span>
          </div>
          <label>
            Neighborhood size
            <input
              aria-label="Tangent space neighborhood size"
              type="range"
              min="0.25"
              max="1.5"
              step="0.01"
              .value=${String(this.spread)}
              @input=${this.updateSpread}
            />
            <output>${this.spread.toFixed(2)}</output>
          </label>
        </div>

        <div class="visual">
          <div class="tangent-stage">
            <figure class="t-panel">
              <figcaption>curved covariance space</figcaption>
              <svg viewBox="0 0 360 360" role="img" aria-label="The curved covariance space joins the matrices around the reference with geodesic arcs that bow outward.">
                <circle cx=${C} cy=${cyMid} r=${ringScreen} fill="none" stroke="#ffd36b" stroke-opacity="0.32" stroke-dasharray="4 6" />
                ${pts.map(
                  (p) =>
                    svg`<line x1=${C} y1=${cyMid} x2=${p[0]} y2=${p[1]} stroke="#565b78" stroke-width="1" />`,
                )}
                ${pts.map(
                  (p, i) =>
                    svg`<path d=${arcPath(p, pts[(i + 1) % n])} fill="none" stroke="#8d72d4" stroke-width="3" stroke-linecap="round" />`,
                )}
                ${pts.map(
                  (p) => svg`<circle cx=${p[0]} cy=${p[1]} r="7" fill="#1ca9a0" />`,
                )}
                <circle cx=${C} cy=${cyMid} r="9" fill="#ffd36b" />
                <text x=${C} y="348" fill="#ffd36b" font-size="13" font-weight="700" text-anchor="middle">reference</text>
              </svg>
            </figure>

            <div class="t-logmap" aria-hidden="true">
              <span>log map</span>
              <svg viewBox="0 0 40 24">
                <path d="M3 12 q 17 -11 31 0" fill="none" stroke="#ffd36b" stroke-width="3" stroke-linecap="round" />
                <path d="M28 4 l 8 8 l -10 4" fill="none" stroke="#ffd36b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <figure class="t-panel">
              <figcaption>flat tangent space</figcaption>
              <svg viewBox="0 0 360 360" role="img" aria-label="The flat tangent space joins the same matrices with straight lines.">
                <line x1="30" x2="330" y1=${cyMid} y2=${cyMid} stroke="#3a3f59" stroke-width="1" />
                <line x1=${C} x2=${C} y1="40" y2="338" stroke="#3a3f59" stroke-width="1" />
                ${pts.map(
                  (p) =>
                    svg`<line x1=${C} y1=${cyMid} x2=${p[0]} y2=${p[1]} stroke="#565b78" stroke-width="1" />`,
                )}
                ${pts.map((p, i) => {
                  const q = pts[(i + 1) % n];
                  return svg`<line x1=${p[0]} y1=${p[1]} x2=${q[0]} y2=${q[1]} stroke="#1ca9a0" stroke-width="3" stroke-linecap="round" />`;
                })}
                ${pts.map(
                  (p) => svg`<circle cx=${p[0]} cy=${p[1]} r="7" fill="#1ca9a0" />`,
                )}
                <circle cx=${C} cy=${cyMid} r="9" fill="#ffd36b" />
              </svg>
            </figure>
          </div>

          <div class="readout ${faithful ? "ok" : "far"}">
            <span class="rd-metric">shape distortion vs. flat <b>${distPct}%</b></span>
            <span class="rd-verdict">
              ${faithful
                ? "Close to the reference — the flat copy is faithful."
                : "Too far — the flat copy distorts the real shape."}
            </span>
          </div>
        </div>

        <div class="definitions">
          <article>
            <span>Plain idea</span>
            <strong>Flatten near one reference point</strong>
            <p>
              Nearby covariance matrices become coordinates that familiar
              linear machine-learning tools can use.
            </p>
          </article>
          <article>
            <span>Mathematical names</span>
            <strong>Log map → tangent space</strong>
            <p>
              The log map sends each matrix to a vector in the flat tangent
              space around the chosen reference mean.
            </p>
          </article>
        </div>

        <div class="takeaway">
          <strong>BCI use</strong>
          Tangent-space vectors can feed logistic regression, linear
          discriminant analysis, support-vector machines, or later neural
          models.
        </div>

        <details class="check">
          <summary>
            Check your understanding: why keep the neighborhood small?
          </summary>
          <p>
            Far from the reference, the curved distances between covariance
            matrices grow noticeably longer than the straight-line distances in
            the flat tangent space, so the flat coordinates start to distort the
            real relationships. Picking a reference close to your trials keeps
            that distortion small, which is why the log map is taken around a
            class or session mean rather than an arbitrary point.
          </p>
        </details>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-tangent-explorer": TangentExplorer;
  }
}
