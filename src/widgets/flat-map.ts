import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { distance, expMap, recenter, type Sym2 } from "../math/spd";

/**
 * §1.2 — a flat map is exact where you centre it, and wrong by more the
 * further you go.
 *
 * The whitening in `flatMapReadout` is not an optimisation. The affine-invariant
 * metric equals the Frobenius one *at the identity and nowhere else*, so
 * measuring raw entries from an arbitrary base point disagrees even at zero
 * separation. `recenter(base, ·)` moves the base to the identity, which is
 * precisely what the tangent-space route and per-session re-centring do — the
 * same operation, three times, and this section is where the reader meets it.
 *
 * See `flat-map.test.ts` and spec §3.1.
 */

/** A tangent direction with both a scaling and a shear part, unit length. */
export const UNIT_DIRECTION: Sym2 = (() => {
  const raw: Sym2 = [0.6, 0.5, -0.4];
  const n = Math.sqrt(raw[0] ** 2 + 2 * raw[1] ** 2 + raw[2] ** 2);
  return [raw[0] / n, raw[1] / n, raw[2] / n];
})();

const frobenius = (a: Sym2, b: Sym2) =>
  Math.sqrt((a[0] - b[0]) ** 2 + 2 * (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

/**
 * Walk `separation` along a geodesic from `base` and measure the gap two ways.
 *
 * `expMap`, not `geodesic` — `geodesic` clamps t to [0, 1] and cannot travel
 * past its endpoint, and the interesting part of this demonstration is beyond 1.
 */
export function flatMapReadout(
  base: Sym2,
  direction: Sym2,
  separation: number,
): { riemannian: number; flat: number } {
  const far = expMap(base, [
    direction[0] * separation,
    direction[1] * separation,
    direction[2] * separation,
  ]);
  return {
    riemannian: distance(base, far),
    flat: frobenius(recenter(base, base), recenter(base, far)),
  };
}

const MAX_SEPARATION = 4;

@customElement("rg-flat-map")
export class RgFlatMap extends LitElement {
  @state() private separation = 0.4;

  static styles = css`
    :host {
      display: block;
      margin: 22px 0;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    .box {
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 18px;
      background: #fffdf8;
      padding: 22px 24px 24px;
    }

    .stage {
      display: block;
      width: 100%;
      height: auto;
      margin-bottom: 6px;
    }

    .readouts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      margin: 14px 0 4px;
    }

    .readout {
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 12px;
      padding: 12px 14px;
      background: #fdfaf3;
    }

    .readout span {
      display: block;
      font-size: 0.72rem;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      font-weight: 700;
      color: #6a7183;
      margin-bottom: 4px;
    }

    .readout strong {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.5rem;
      font-variant-numeric: tabular-nums;
    }

    .readout.curved strong {
      color: #1e5c58;
    }

    .readout.flat strong {
      color: #b03a2e;
    }

    .verdict {
      margin: 12px 0 0;
      font-size: 0.92rem;
      line-height: 1.6;
      color: #4a5265;
    }

    .verdict b {
      color: #20283a;
    }

    label {
      display: block;
      margin-top: 18px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5265;
    }

    input[type="range"] {
      width: 100%;
      margin-top: 8px;
      accent-color: #6c4eb9;
    }

    input[type="range"]:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 4px;
    }
  `;

  private get readout() {
    return flatMapReadout([1, 0, 1], UNIT_DIRECTION, this.separation);
  }

  render() {
    const { riemannian, flat } = this.readout;
    const overstated = ((flat / riemannian - 1) * 100).toFixed(0);
    // Screen geometry only — the numbers above are the real content.
    const x = 60 + (this.separation / MAX_SEPARATION) * 300;

    return html`
      <div class="box">
        <svg
          class="stage"
          viewBox="0 0 460 200"
          role="img"
          aria-label=${`Two points on a curved surface separated by ${riemannian.toFixed(2)} measured on the surface and ${flat.toFixed(2)} measured on the flattened map.`}
        >
          <g stroke="rgba(46,53,74,.18)" fill="none">
            <path d="M20 150 Q230 96 440 150" />
            <path d="M20 122 Q230 66 440 122" />
            <path d="M20 178 Q230 126 440 178" />
          </g>
          <path
            d=${`M60 ${138 - 0} Q${(60 + x) / 2} ${112 - this.separation * 4} ${x} ${138 - this.separation * 2}`}
            stroke="#1e5c58"
            stroke-width="3.5"
            fill="none"
            stroke-linecap="round"
          />
          <line
            x1="60"
            y1="138"
            x2=${x}
            y2=${138 - this.separation * 2}
            stroke="#b03a2e"
            stroke-width="2"
            stroke-dasharray="6 5"
          />
          <circle cx="60" cy="138" r="7" fill="#6c4eb9" />
          <text x="20" y="176" font-size="11" text-anchor="start" fill="#4a5265">
            where the map is centred
          </text>
          <circle cx=${x} cy=${138 - this.separation * 2} r="7" fill="#f4a261" />
        </svg>

        <div class="readouts">
          <div class="readout curved">
            <span>Measured on the surface</span>
            <strong>${riemannian.toFixed(2)}</strong>
          </div>
          <div class="readout flat">
            <span>Measured on the flat map</span>
            <strong>${flat.toFixed(2)}</strong>
          </div>
        </div>

        <p class="verdict" role="status">
          ${this.separation < 0.15
            ? html`Right next to the centre, the two rulers agree. <b>The flat map is exact here.</b>`
            : html`The flat map now overstates the gap by <b>${overstated}%</b>. It was exact at the centre and has been getting worse ever since.`}
        </p>

        <label>
          Drag the second point away from the centre
          <input
            type="range"
            min="0"
            max=${MAX_SEPARATION}
            step="0.01"
            .value=${String(this.separation)}
            @input=${(event: Event) => {
              this.separation = Number((event.target as HTMLInputElement).value);
            }}
          />
        </label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-flat-map": RgFlatMap;
  }
}
