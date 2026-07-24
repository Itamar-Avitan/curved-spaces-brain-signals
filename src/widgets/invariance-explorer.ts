import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import { congruence, distance, eigen, type Mat2, type Sym2 } from "../math/spd";

interface Distortion {
  key: string;
  label: string;
  blurb: string;
  target: Mat2;
}

/**
 * Every one of these is the same algebraic operation on a covariance matrix:
 * a congruence C -> W C W^T. That single fact is what the whole method rests on.
 */
const DISTORTIONS: Distortion[] = [
  {
    key: "gain",
    label: "Electrode gain drifts",
    blurb:
      "One electrode makes better contact than the other, so its channel is amplified and the other is damped.",
    target: [2.6, 0, 0, 0.45],
  },
  {
    key: "reference",
    label: "You switch montage",
    blurb:
      "You re-reference to a bipolar montage, so channel 1 now records the difference between the two electrodes. Standard practice — and it rewrites every covariance matrix you have.",
    target: [1, -1, 0, 1],
  },
  {
    key: "mixing",
    label: "Volume conduction",
    blurb:
      "The skull smears each source across both electrodes, mixing the channels linearly.",
    target: [1.25, 0.75, -0.35, 0.95],
  },
];

/** Frobenius distance on the matrix entries — the "obvious" flat ruler. */
function euclideanDistance(p: Sym2, q: Sym2): number {
  return Math.hypot(p[0] - q[0], Math.SQRT2 * (p[1] - q[1]), p[2] - q[2]);
}

function lerpMixing(target: Mat2, t: number): Mat2 {
  return [
    1 + (target[0] - 1) * t,
    target[1] * t,
    target[2] * t,
    1 + (target[3] - 1) * t,
  ];
}

@customElement("rg-invariance-explorer")
export class InvarianceExplorer extends LitElement {
  @state() private amount = 0;
  @state() private choice = 0;

  /** Two trials from different classes. Deliberately non-commuting. */
  private readonly trialA: Sym2 = [2.6, 0.55, 0.85];
  private readonly trialB: Sym2 = [0.9, -0.5, 2.4];

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
      grid-template-columns: 0.75fr 1fr;
      gap: 32px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      background: #fff7e9;
      padding: 28px 30px;
    }

    .problem-label {
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

    .problem p {
      margin: 0;
      color: #616879;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .picker {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 20px 30px 0;
    }

    .picker button {
      flex: 1 1 190px;
      border: 1px solid rgba(46, 53, 74, 0.16);
      border-radius: 14px;
      background: #fff;
      padding: 11px 14px;
      color: #3c4459;
      font-size: 0.82rem;
      font-weight: 700;
      text-align: left;
      cursor: pointer;
    }

    .picker button[aria-pressed="true"] {
      border-color: #6c4eb9;
      background: #f3efff;
      color: #4a3388;
      box-shadow: inset 0 0 0 1px #6c4eb9;
    }

    .blurb {
      margin: 14px 30px 0;
      border-left: 3px solid #6c4eb9;
      padding-left: 14px;
      color: #555d6d;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    .control {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 18px;
      align-items: center;
      margin-top: 20px;
      background: #22283b;
      padding: 22px 30px;
      color: #fff;
    }

    .control strong {
      font-size: 0.86rem;
    }

    .control span {
      display: block;
      margin-top: 3px;
      color: rgba(255, 255, 255, 0.64);
      font-size: 0.72rem;
    }

    input[type="range"] {
      width: 100%;
      min-height: 44px;
      accent-color: #ffd36b;
    }

    .amount {
      min-width: 74px;
      color: #ffd36b;
      font-size: 0.86rem;
      font-weight: 800;
      text-align: right;
    }

    .body {
      display: grid;
      grid-template-columns: 1fr 0.85fr;
    }

    .stage {
      border-right: 1px solid rgba(46, 53, 74, 0.1);
      padding: 24px 26px 28px;
    }

    .stage h4,
    .readouts h4 {
      margin: 0 0 4px;
      font-size: 0.95rem;
    }

    .stage p,
    .readouts > p {
      margin: 0 0 12px;
      color: #616879;
      font-size: 0.8rem;
      line-height: 1.55;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .ell-a {
      fill: rgba(28, 169, 160, 0.16);
      stroke: #1ca9a0;
      stroke-width: 3;
    }

    .ell-b {
      fill: rgba(239, 107, 91, 0.14);
      stroke: #ef6b5b;
      stroke-width: 3;
    }

    .ghost {
      fill: none;
      stroke: rgba(32, 40, 58, 0.22);
      stroke-width: 2;
      stroke-dasharray: 5 6;
    }

    .axis {
      stroke: rgba(32, 40, 58, 0.16);
      stroke-width: 1;
    }

    .legend {
      display: flex;
      gap: 18px;
      margin-top: 10px;
      color: #555d6d;
      font-size: 0.74rem;
    }

    .legend i {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: -1px;
    }

    .readouts {
      padding: 24px 26px 28px;
      background: #faf8ff;
    }

    .meter {
      margin-bottom: 14px;
      border-radius: 16px;
      background: #fff;
      padding: 15px 16px;
      box-shadow: 0 2px 10px rgba(62, 45, 91, 0.07);
    }

    .meter-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
    }

    .meter-name {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .meter.euclid .meter-name {
      color: #a93a31;
    }

    .meter.riemann .meter-name {
      color: #1ca9a0;
    }

    .meter-value {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .track {
      height: 9px;
      margin-top: 11px;
      border-radius: 99px;
      background: rgba(32, 40, 58, 0.09);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 99px;
    }

    .meter.euclid .fill {
      background: #ef6b5b;
    }

    .meter.riemann .fill {
      background: #1ca9a0;
    }

    .delta {
      margin-top: 9px;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .meter.euclid .delta {
      color: #a93a31;
    }

    .meter.riemann .delta {
      color: #12766f;
    }

    .wbox {
      border-radius: 16px;
      background: #f0ecff;
      padding: 15px 16px;
    }

    .wbox > span {
      display: block;
      color: #4a3388;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .wrow {
      display: flex;
      gap: 7px;
      align-items: center;
      margin: 11px 0 9px;
      color: #2c2350;
      font-size: 1rem;
    }

    .wrow em {
      font-family: "Fraunces", Georgia, serif;
      font-style: italic;
      font-size: 1.15rem;
    }

    .wmat {
      display: inline-flex;
      gap: 5px;
      align-items: center;
    }

    .wmat b,
    .wrow b {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.15rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3px;
      border-left: 2px solid #6c4eb9;
      border-right: 2px solid #6c4eb9;
      padding: 3px 5px;
    }

    .grid i {
      min-width: 40px;
      color: #4a3388;
      font-size: 0.74rem;
      font-style: normal;
      font-variant-numeric: tabular-nums;
      text-align: center;
    }

    .wbox p {
      margin: 0;
      color: #4d4470;
      font-size: 0.76rem;
      line-height: 1.55;
    }

    .verdict {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
      align-items: center;
      background: #22283b;
      padding: 20px 30px;
      color: #fff;
    }

    .verdict b {
      border-radius: 99px;
      background: #ffd36b;
      padding: 7px 12px;
      color: #302616;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .verdict p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    details {
      border-top: 1px solid rgba(46, 53, 74, 0.1);
      background: #e9f7f4;
      padding: 16px 30px;
    }

    summary {
      color: #12766f;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    details p {
      margin: 10px 0 0;
      color: #33474a;
      font-size: 0.84rem;
      line-height: 1.65;
    }

    @media (max-width: 900px) {
      .problem,
      .body,
      .control {
        grid-template-columns: 1fr;
      }

      .stage {
        border-right: 0;
        border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      }

      .amount {
        text-align: left;
      }

      .verdict {
        grid-template-columns: 1fr;
        gap: 12px;
        justify-items: start;
      }

      .picker button {
        flex: 1 1 100%;
      }
    }
  `;

  private onAmount(event: Event) {
    this.amount = Number((event.target as HTMLInputElement).value);
  }

  private ellipse(s: Sym2, scale: number, cx: number, cy: number, cls: string) {
    const { values, angle } = eigen(s);
    const rx = Math.sqrt(values[0]) * scale;
    const ry = Math.sqrt(values[1]) * scale;
    const deg = (angle * 180) / Math.PI;
    return svg`<ellipse
      class=${cls}
      cx=${cx}
      cy=${cy}
      rx=${rx.toFixed(2)}
      ry=${ry.toFixed(2)}
      transform=${`rotate(${deg.toFixed(2)} ${cx} ${cy})`}
    />`;
  }

  render() {
    const distortion = DISTORTIONS[this.choice];
    const mixing = lerpMixing(distortion.target, this.amount);

    const a = congruence(mixing, this.trialA);
    const b = congruence(mixing, this.trialB);

    const euclidNow = euclideanDistance(a, b);
    const euclidStart = euclideanDistance(this.trialA, this.trialB);
    const riemannNow = distance(a, b);
    const riemannStart = distance(this.trialA, this.trialB);

    const euclidRatio = euclidNow / euclidStart;
    const riemannRatio = riemannNow / riemannStart;

    // Fixed scale from the fully distorted state so nothing leaves the frame.
    const extreme = [
      congruence(distortion.target, this.trialA),
      congruence(distortion.target, this.trialB),
      this.trialA,
      this.trialB,
    ];
    const biggest = Math.max(
      ...extreme.map((m) => Math.sqrt(eigen(m).values[0])),
    );
    const scale = 84 / biggest;

    const pct = (value: number) => `${(value * 100).toFixed(0)}%`;
    const signed = (ratio: number) => {
      const change = (ratio - 1) * 100;
      if (Math.abs(change) < 0.05) return "unchanged — 0.0%";
      return `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs. the original`;
    };

    return html`
      <div class="shell">
        <div class="problem">
          <div>
            <p class="problem-label">The decoder's real enemy</p>
            <h3>Same brain. Different recording. Does your ruler notice?</h3>
          </div>
          <p>
            Two trials from two different imagined movements. Now change something
            about the <em>recording</em> — not the brain. A good distance should
            report the same separation between these two mental states either way.
          </p>
        </div>

        <div class="picker" role="group" aria-label="Choose a recording change">
          ${DISTORTIONS.map(
            (item, index) => html`
              <button
                type="button"
                aria-pressed=${index === this.choice ? "true" : "false"}
                @click=${() => {
                  this.choice = index;
                }}
              >
                ${item.label}
              </button>
            `,
          )}
        </div>
        <p class="blurb">${distortion.blurb}</p>

        <div class="control">
          <div>
            <strong>How much has the recording changed?</strong>
            <span>The brain states themselves never move.</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.amount)}
            aria-label="Amount of recording change"
            @input=${this.onAmount}
          />
          <div class="amount">${pct(this.amount)}</div>
        </div>

        <div class="body">
          <div class="stage">
            <h4>The two trials, as recorded</h4>
            <p>Dashed outlines show where they started.</p>
            <svg viewBox="0 0 380 196" role="img"
              aria-label=${`Two covariance ellipses distorted by ${distortion.label}. Euclidean distance ${euclidNow.toFixed(2)}, Riemannian distance ${riemannNow.toFixed(2)}.`}>
              <line class="axis" x1="14" y1="98" x2="366" y2="98" />
              <line class="axis" x1="98" y1="10" x2="98" y2="186" />
              <line class="axis" x1="282" y1="10" x2="282" y2="186" />
              ${this.ellipse(this.trialA, scale, 98, 98, "ghost")}
              ${this.ellipse(this.trialB, scale, 282, 98, "ghost")}
              ${this.ellipse(a, scale, 98, 98, "ell-a")}
              ${this.ellipse(b, scale, 282, 98, "ell-b")}
            </svg>
            <div class="legend">
              <span><i style="background:#1ca9a0"></i>trial A</span>
              <span><i style="background:#ef6b5b"></i>trial B</span>
              <span><i style="background:rgba(32,40,58,.22)"></i>before the change</span>
            </div>
          </div>

          <div class="readouts">
            <h4>How far apart does each ruler say they are?</h4>
            <p>Both bars start the same length. Watch which one moves.</p>

            <div class="meter euclid">
              <div class="meter-top">
                <span class="meter-name">Straight-line ruler</span>
                <span class="meter-value">${euclidNow.toFixed(2)}</span>
              </div>
              <div class="track">
                <div
                  class="fill"
                  style=${`width:${Math.min(100, (euclidRatio / 3) * 100).toFixed(1)}%`}
                ></div>
              </div>
              <p class="delta">${signed(euclidRatio)}</p>
            </div>

            <div class="meter riemann">
              <div class="meter-top">
                <span class="meter-name">Riemannian ruler</span>
                <span class="meter-value">${riemannNow.toFixed(2)}</span>
              </div>
              <div class="track">
                <div
                  class="fill"
                  style=${`width:${Math.min(100, (riemannRatio / 3) * 100).toFixed(1)}%`}
                ></div>
              </div>
              <p class="delta">${signed(riemannRatio)}</p>
            </div>

            <div class="wbox">
              <span>What the recording did to every trial</span>
              <div class="wrow">
                <em>C</em> <span aria-hidden="true">→</span>
                <span class="wmat">
                  <b>W</b>
                  <span class="grid">
                    <i>${mixing[0].toFixed(2)}</i><i>${mixing[1].toFixed(2)}</i>
                    <i>${mixing[2].toFixed(2)}</i><i>${mixing[3].toFixed(2)}</i>
                  </span>
                </span>
                <em>C</em> <b>W</b><sup>T</sup>
              </div>
              <p>
                One invertible matrix, applied on both sides. Every distortion
                above is this — which is why one property covers all of them.
              </p>
            </div>
          </div>
        </div>

        <div class="verdict">
          <b>Why it matters</b>
          <p>
            The straight-line ruler confuses a hardware change with a change of
            mind. The Riemannian one does not move at all — so a decoder built on
            it still works after you re-reference, swap an electrode, or come back
            tomorrow.
          </p>
        </div>

        <details>
          <summary>
            Check your understanding: why does the Riemannian number not budge?
          </summary>
          <p>
            All three changes above do the same thing to a covariance matrix:
            they replace <em>C</em> with <em>W C W</em>ᵀ for some invertible
            <em>W</em>. That operation is called a congruence, and the
            affine-invariant distance is <em>defined</em> so that congruences
            leave it unchanged. It is not that the geometry is more accurate —
            it is that it was built to ignore exactly this family of nuisances.
            Volume conduction, electrode gain, referencing, and spatial filtering
            all belong to that family, which is why this one property does so
            much work in EEG.
          </p>
        </details>
      </div>
    `;
  }
}
