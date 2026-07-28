import { LitElement, css, html, nothing } from "lit";
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

export const MAX_SEPARATION = 4;

/** The reference point the widget centres on — the identity, i.e. no distortion yet. */
export const BASE_POINT: Sym2 = [1, 0, 1];

/**
 * Layout for the two-panel picture below. Both panels share one
 * pixels-per-unit scale, chosen so the flat reading at the slider's maximum
 * (computed here, not hand-typed, so it can't drift from the real model)
 * exactly fills its track. The Riemannian reading, which grows far more
 * slowly, only ever fills a fraction of its own track at the same scale —
 * that visible mismatch *is* the picture.
 */
export const TRACK_WIDTH = 150;
export const LEFT_ANCHOR_X = 45;
export const RIGHT_ANCHOR_X = 265;
const POINT_Y = 112;
const MAX_FLAT = flatMapReadout(BASE_POINT, UNIT_DIRECTION, MAX_SEPARATION).flat;
const PX_PER_UNIT = TRACK_WIDTH / MAX_FLAT;

export interface FlatMapLayout {
  /** Screen x of the moving point on the globe panel. */
  leftX: number;
  /** Screen x of the moving point on the flat-map panel, clamped to its track. */
  rightX: number;
  /** How high the geodesic arc bows; 0 when the two points coincide. */
  leftArcHeight: number;
  /** True when the flat reading has run off the edge of its own track. */
  overflowing: boolean;
}

/**
 * Turn a readout into screen coordinates.
 *
 * Extracted from `render()` so `flat-map.test.ts` can pin the invariant the
 * whole picture rests on: **both panels are drawn at the same
 * pixels-per-unit**, so the visibly longer gap is the numerically larger one.
 * Get that wrong and the widget draws the opposite of the numbers printed
 * directly beneath it — a defect this file has shipped once already.
 */
export function flatMapLayout(readout: {
  riemannian: number;
  flat: number;
}): FlatMapLayout {
  const leftX = LEFT_ANCHOR_X + readout.riemannian * PX_PER_UNIT;
  const rightEdge = RIGHT_ANCHOR_X + TRACK_WIDTH;
  const rawRightX = RIGHT_ANCHOR_X + readout.flat * PX_PER_UNIT;
  return {
    leftX,
    // Bows the arc up as the points separate; at zero separation the two
    // points coincide, so the control point collapses onto them too, rather
    // than tracing a stray loop above a single dot.
    leftArcHeight: Math.min(22, (leftX - LEFT_ANCHOR_X) * 3),
    overflowing: rawRightX > rightEdge + 0.01,
    rightX: Math.min(rawRightX, rightEdge),
  };
}

@customElement("rg-flat-map")
export class RgFlatMap extends LitElement {
  @state() private separation = 0;

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
    return flatMapReadout(BASE_POINT, UNIT_DIRECTION, this.separation);
  }

  render() {
    const { riemannian, flat } = this.readout;

    // Both panels share PX_PER_UNIT, so a pixel gap in one is directly
    // comparable to the same pixel gap in the other. The left (globe) point
    // only ever crosses a fraction of its track; the right (map) point is
    // scaled to exactly reach its track's edge at the slider's maximum.
    const { leftX, leftArcHeight, rightX, overflowing } = flatMapLayout(
      this.readout,
    );
    const rightEdge = RIGHT_ANCHOR_X + TRACK_WIDTH;

    return html`
      <div class="box">
        <svg
          class="stage"
          viewBox="0 0 460 200"
          role="img"
          aria-label=${`Two panels showing the same two points. On the globe, measured on the curved surface, they are ${riemannian.toFixed(2)} apart. On the flat map, the same two points flattened out are ${flat.toFixed(2)} apart${overflowing ? " — past the edge of the map" : ""}.`}
        >
          <line x1="230" y1="8" x2="230" y2="192" stroke="rgba(46,53,74,.14)" />

          <text
            x=${LEFT_ANCHOR_X + TRACK_WIDTH / 2}
            y="20"
            font-size="10.5"
            font-weight="700"
            letter-spacing="0.08em"
            text-anchor="middle"
            fill="#6a7183"
          >
            THE GLOBE
          </text>
          <g stroke="rgba(46,53,74,.16)" fill="none">
            <path
              d=${`M15 150 Q${LEFT_ANCHOR_X + TRACK_WIDTH / 2} 122 ${LEFT_ANCHOR_X + TRACK_WIDTH + 15} 150`}
            />
            <path
              d=${`M15 128 Q${LEFT_ANCHOR_X + TRACK_WIDTH / 2} 100 ${LEFT_ANCHOR_X + TRACK_WIDTH + 15} 128`}
            />
            <path
              d=${`M15 172 Q${LEFT_ANCHOR_X + TRACK_WIDTH / 2} 146 ${LEFT_ANCHOR_X + TRACK_WIDTH + 15} 172`}
            />
          </g>
          <path
            d=${`M${LEFT_ANCHOR_X} ${POINT_Y} Q${(LEFT_ANCHOR_X + leftX) / 2} ${POINT_Y - leftArcHeight} ${leftX} ${POINT_Y}`}
            stroke="#1e5c58"
            stroke-width="3.5"
            fill="none"
            stroke-linecap="round"
          />
          <circle cx=${LEFT_ANCHOR_X} cy=${POINT_Y} r="7" fill="#6c4eb9" />
          <circle cx=${leftX} cy=${POINT_Y} r="7" fill="#f4a261" />
          <text x=${LEFT_ANCHOR_X} y="182" font-size="10" text-anchor="middle" fill="#4a5265">
            centre
          </text>

          <text
            x=${RIGHT_ANCHOR_X + TRACK_WIDTH / 2}
            y="20"
            font-size="10.5"
            font-weight="700"
            letter-spacing="0.08em"
            text-anchor="middle"
            fill="#6a7183"
          >
            THE FLAT MAP
          </text>
          <g stroke="rgba(46,53,74,.12)">
            <line x1=${RIGHT_ANCHOR_X - 15} y1="90" x2=${RIGHT_ANCHOR_X + TRACK_WIDTH + 15} y2="90" />
            <line x1=${RIGHT_ANCHOR_X - 15} y1="112" x2=${RIGHT_ANCHOR_X + TRACK_WIDTH + 15} y2="112" />
            <line x1=${RIGHT_ANCHOR_X - 15} y1="134" x2=${RIGHT_ANCHOR_X + TRACK_WIDTH + 15} y2="134" />
          </g>
          <line
            x1=${RIGHT_ANCHOR_X}
            y1=${POINT_Y}
            x2=${rightX}
            y2=${POINT_Y}
            stroke="#b03a2e"
            stroke-width="2.5"
            stroke-dasharray="6 5"
          />
          <circle cx=${RIGHT_ANCHOR_X} cy=${POINT_Y} r="7" fill="#6c4eb9" />
          <circle cx=${rightX} cy=${POINT_Y} r="7" fill="#f4a261" />
          <text x=${RIGHT_ANCHOR_X} y="182" font-size="10" text-anchor="middle" fill="#4a5265">
            centre
          </text>
          ${overflowing
            ? html`<path
                d=${`M${rightEdge - 4} ${POINT_Y - 9} L${rightEdge + 8} ${POINT_Y} L${rightEdge - 4} ${POINT_Y + 9} Z`}
                fill="#b03a2e"
              />`
            : nothing}
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
          ${this.separation === 0
            ? html`At the centre exactly, the two rulers agree. <b>The flat map is exact here.</b>`
            : this.separation < 0.15
              ? html`A hair off the centre, the two rulers already disagree by
                  <b>${((flat / riemannian - 1) * 100).toFixed(1)}%</b> — too small to see
                  above, but no longer exact.`
              : html`The flat map now overstates the gap by
                  <b>${((flat / riemannian - 1) * 100).toFixed(0)}%</b>. It was exact at the
                  centre and has been getting worse ever since.`}
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
