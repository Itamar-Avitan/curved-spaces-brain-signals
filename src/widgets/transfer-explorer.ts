import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  congruence,
  distance,
  logMap,
  recenter,
  riemannianMean,
  type Mat2,
  type Sym2,
} from "../math/spd";

const TRIALS_PER_CLASS = 9;

/** Deterministic jitter — no Math.random, so the figure is stable across renders. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** One class's trials: a base pattern plus small, repeatable variation. */
function makeClass(base: Sym2, seed: number): Sym2[] {
  return Array.from({ length: TRIALS_PER_CLASS }, (_, i) => {
    const a = 1 + 0.16 * jitter(seed + i * 3.1);
    const b = 0.13 * jitter(seed + i * 7.7 + 1);
    const c = 1 + 0.16 * jitter(seed + i * 5.3 + 2);
    return congruence([a, b, b, c] as Mat2, base);
  });
}

/**
 * Coordinates for the picture: the two directions in which this space is
 * actually curved (the traceless ones). Dropping the overall-scale direction
 * keeps the plot honest — it is a genuine slice of the tangent space, not an
 * arbitrary 2-D squash.
 */
function project(reference: Sym2, s: Sym2): [number, number] {
  const [xx, xy, yy] = logMap(reference, s);
  return [(xx - yy) / Math.SQRT2, Math.SQRT2 * xy];
}

@customElement("rg-transfer-explorer")
export class TransferExplorer extends LitElement {
  @state() private drift = 0.8;
  @state() private aligned = false;

  // Deliberately close together: two imagined movements are not far apart in
  // covariance space, which is exactly why a session shift can swamp them.
  private readonly classA = makeClass([1.35, 0.35, 2.05], 3);
  private readonly classB = makeClass([2.05, -0.3, 1.35], 11);

  /** How Monday's headset differs from Tuesday's. A congruence, like everything else. */
  private mixing(): Mat2 {
    const t = this.drift;
    const target: Mat2 = [1.35, 0.62, -0.42, 0.88];
    return [
      1 + (target[0] - 1) * t,
      target[1] * t,
      target[2] * t,
      1 + (target[3] - 1) * t,
    ];
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
    input:focus-visible,
    summary:focus-visible {
      outline: 3px solid #ffd36b;
      outline-offset: 3px;
    }

    .shell {
      overflow: hidden;
      border-radius: 28px;
      background: #fffdf8;
      box-shadow: 0 26px 70px rgba(28, 22, 48, 0.22);
    }

    .head {
      display: grid;
      grid-template-columns: 0.8fr 1fr;
      gap: 30px;
      background: #fff7e9;
      padding: 26px 30px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
    }

    .head p.label {
      margin: 0;
      color: #a93a31;
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
      color: #616879;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .control {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 22px;
      align-items: center;
      background: #22283b;
      padding: 20px 30px;
      color: #fff;
    }

    .control strong {
      display: block;
      font-size: 0.85rem;
    }

    .control span.sub {
      display: block;
      margin-top: 2px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.72rem;
    }

    input[type="range"] {
      width: 100%;
      min-height: 40px;
      margin-top: 8px;
      accent-color: #ffd36b;
    }

    .align {
      min-height: 46px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      background: transparent;
      padding: 10px 20px;
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }

    .align[aria-pressed="true"] {
      border-color: #ffd36b;
      background: #ffd36b;
      color: #302616;
    }

    .body {
      display: grid;
      grid-template-columns: 1fr 300px;
    }

    .plot {
      padding: 22px 26px 26px;
      border-right: 1px solid rgba(46, 53, 74, 0.1);
    }

    .plot h4 {
      margin: 0 0 3px;
      font-size: 0.95rem;
    }

    .plot p {
      margin: 0 0 8px;
      color: #616879;
      font-size: 0.79rem;
      line-height: 1.5;
    }

    svg {
      display: block;
      /* The plot column is wide; without a cap the square viewBox stretches to
         roughly a full screen of height. */
      width: 100%;
      max-width: 460px;
      height: auto;
      margin: 0 auto;
    }

    .axis {
      stroke: rgba(32, 40, 58, 0.16);
      stroke-width: 1;
    }

    .mon-1 {
      fill: #1ca9a0;
    }

    .mon-2 {
      fill: #ef6b5b;
    }

    .tue-1 {
      fill: none;
      stroke: #1ca9a0;
      stroke-width: 2.2;
    }

    .tue-2 {
      fill: none;
      stroke: #ef6b5b;
      stroke-width: 2.2;
    }

    .center {
      fill: none;
      stroke: #22283b;
      stroke-width: 2;
      stroke-dasharray: 3 4;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      margin-top: 10px;
      color: #555d6d;
      font-size: 0.73rem;
    }

    .legend i {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 5px;
      border-radius: 50%;
      vertical-align: -1px;
    }

    .legend i.ring {
      border: 2px solid currentColor;
      background: none;
    }

    .readout {
      padding: 22px 24px;
      background: #faf8ff;
    }

    .score {
      border-radius: 16px;
      background: #fff;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(62, 45, 91, 0.07);
      text-align: center;
    }

    .score + .score {
      margin-top: 12px;
    }

    .score span {
      display: block;
      color: #545c6e;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .score strong {
      display: block;
      margin-top: 5px;
      font-family: "Fraunces", Georgia, serif;
      font-size: 2.1rem;
      line-height: 1;
    }

    .score.bad strong {
      color: #a93a31;
    }

    .score.good strong {
      color: #12766f;
    }

    .score em {
      display: block;
      margin-top: 5px;
      color: #6c6f7d;
      font-size: 0.73rem;
      font-style: normal;
    }

    .note {
      margin: 14px 0 0;
      border-left: 3px solid #6c4eb9;
      padding-left: 12px;
      color: #4a5265;
      font-size: 0.79rem;
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
      .head,
      .body,
      .control,
      .verdict {
        grid-template-columns: 1fr;
      }

      .plot {
        border-right: 0;
        border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      }

      .verdict {
        justify-items: start;
      }
    }
  `;

  /** Nearest-class-mean, trained on Monday and applied to Tuesday. */
  private accuracy(train: Sym2[][], test: Sym2[][]): number {
    const centers = train.map((trials) => riemannianMean(trials));
    let correct = 0;
    let total = 0;
    test.forEach((trials, trueClass) => {
      for (const trial of trials) {
        const predicted =
          distance(trial, centers[0]) <= distance(trial, centers[1]) ? 0 : 1;
        if (predicted === trueClass) correct += 1;
        total += 1;
      }
    });
    return total === 0 ? 0 : correct / total;
  }

  render() {
    const mixing = this.mixing();
    const monday: Sym2[][] = [this.classA, this.classB];
    const tuesday: Sym2[][] = monday.map((trials) =>
      trials.map((c) => congruence(mixing, c)),
    );

    // Re-centring whitens each session by its OWN mean, so it needs no labels
    // and no data from the other session.
    const prep = (session: Sym2[][]): Sym2[][] => {
      if (!this.aligned) return session;
      const mean = riemannianMean(session.flat());
      return session.map((trials) => trials.map((c) => recenter(mean, c)));
    };

    const mon = prep(monday);
    const tue = prep(tuesday);

    const naive = this.accuracy(monday, tuesday);
    const shown = this.accuracy(mon, tue);
    const sameDay = this.accuracy(mon, mon);

    // Common reference for the picture so both sessions are drawn in one frame.
    const reference = riemannianMean(mon.flat());
    const pts = (session: Sym2[][]) =>
      session.map((trials) => trials.map((c) => project(reference, c)));
    const monPts = pts(mon);
    const tuePts = pts(tue);

    const all = [...monPts.flat(), ...tuePts.flat()];
    const span =
      Math.max(0.35, ...all.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) *
      1.15;
    const S = 150 / span;
    const cx = 175;
    const cy = 150;
    const sx = (x: number) => cx + x * S;
    const sy = (y: number) => cy - y * S;

    const pct = (v: number) => `${Math.round(v * 100)}%`;

    return html`
      <div class="shell">
        <div class="head">
          <div>
            <p class="label">The quiet superpower</p>
            <h3>Trained on Monday. Used on Tuesday.</h3>
          </div>
          <p class="copy">
            Same person, same task, same two imagined movements — but the headset
            went on slightly differently. Nothing about the brain changed; only
            the recording did. Watch what that costs a decoder, and what one line
            of geometry buys back.
          </p>
        </div>

        <div class="control">
          <div>
            <strong>How different is Tuesday's setup?</strong>
            <span class="sub">
              Electrodes shifted, impedances drifted — an invertible mix of the
              channels.
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              .value=${String(this.drift)}
              aria-label="Amount of session drift"
              @input=${(e: Event) => {
                this.drift = Number((e.target as HTMLInputElement).value);
              }}
            />
          </div>
          <button
            class="align"
            type="button"
            aria-pressed=${this.aligned ? "true" : "false"}
            @click=${() => {
              this.aligned = !this.aligned;
            }}
          >
            ${this.aligned ? "✓ Re-centred" : "Re-centre each session"}
          </button>
        </div>

        <div class="body">
          <div class="plot">
            <h4>Both sessions, same picture</h4>
            <p>
              Filled dots are Monday, outlines are Tuesday. Colour is the imagined
              movement.
            </p>
            <svg viewBox="0 0 350 300" role="img"
              aria-label=${`Monday and Tuesday trials plotted together. Transfer accuracy ${pct(shown)}.`}>
              <line class="axis" x1="12" y1=${cy} x2="338" y2=${cy} />
              <line class="axis" x1=${cx} y1="8" x2=${cx} y2="292" />
              ${monPts.map((cls, i) =>
                cls.map(
                  ([x, y]) => svg`<circle class=${i === 0 ? "mon-1" : "mon-2"}
                    cx=${sx(x).toFixed(1)} cy=${sy(y).toFixed(1)} r="5" />`,
                ),
              )}
              ${tuePts.map((cls, i) =>
                cls.map(
                  ([x, y]) => svg`<circle class=${i === 0 ? "tue-1" : "tue-2"}
                    cx=${sx(x).toFixed(1)} cy=${sy(y).toFixed(1)} r="5.5" />`,
                ),
              )}
            </svg>
            <div class="legend">
              <span><i class="mon-1" style="background:#1ca9a0"></i>Monday · move A</span>
              <span><i class="mon-2" style="background:#ef6b5b"></i>Monday · move B</span>
              <span style="color:#1ca9a0"><i class="ring"></i>Tuesday · move A</span>
              <span style="color:#ef6b5b"><i class="ring"></i>Tuesday · move B</span>
            </div>
          </div>

          <div class="readout">
            <div class=${`score ${shown < 0.7 ? "bad" : "good"}`}>
              <span>Monday's decoder, on Tuesday</span>
              <strong>${pct(shown)}</strong>
              <em>
                ${this.aligned
                  ? `up from ${pct(naive)} without re-centring`
                  : "no alignment applied"}
              </em>
            </div>
            <div class="score">
              <span>Same-day ceiling</span>
              <strong>${pct(sameDay)}</strong>
              <em>Monday's decoder on Monday</em>
            </div>
            <p class="note">
              ${this.aligned
                ? "Each session is whitened by its own Riemannian mean. That needs no labels from Tuesday — only its own trials — which is why it works for a brand-new user."
                : "Tuesday's trials land somewhere else entirely, so Monday's class centres point at the wrong regions."}
            </p>
          </div>
        </div>

        <div class="verdict">
          <b>Why it is free</b>
          <p>
            Re-centring is itself a congruence, so it leaves every distance
            <em>inside</em> a session exactly as it was — nothing is distorted or
            thrown away. And the difference between sessions is also a congruence,
            so it cancels. One move, both halves. No Euclidean method can claim
            both at once.
          </p>
        </div>

        <details>
          <summary>Check your understanding: why doesn't this just erase the signal?</summary>
          <p>
            Because it only removes what the two sessions share — the common
            centre. The class structure lives in how trials sit
            <em>relative</em> to that centre, and congruence preserves every one
            of those relative distances exactly. What is left after re-centring is
            a residual rotation, which is why more advanced alignment methods add
            a rotation step on top. Re-centring alone does most of the work, for
            free, with no labels.
          </p>
        </details>
      </div>
    `;
  }
}
