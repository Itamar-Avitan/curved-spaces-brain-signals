import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  arithmeticMean,
  determinant,
  geometricMean,
  riemannianDistance,
  type DiagonalMatrix2,
} from "../math/geometry";

@customElement("rg-mean-explorer")
export class MeanExplorer extends LitElement {
  @state() private thirdTrialX = 3.2;
  @state() private phase = 3;
  @state() private isPlaying = false;

  private replayTimer?: number;

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
      grid-template-columns: 0.72fr 1fr;
      gap: 32px;
      padding: 28px 30px;
      background: #fff7e9;
    }

    .eyebrow {
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

    .problem p:last-child {
      margin: 0;
      color: #616879;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .not-waveform {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 15px;
      align-items: center;
      border-top: 1px solid rgba(46, 53, 74, 0.1);
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      background: #edf8f6;
      padding: 16px 30px;
    }

    .not-waveform strong {
      color: #176c57;
      white-space: nowrap;
    }

    .not-waveform p {
      margin: 0;
      color: #356e61;
      font-size: 0.82rem;
      line-height: 1.5;
    }

    .control {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 28px;
      align-items: center;
      padding: 22px 30px;
      background: #2f3550;
      color: white;
    }

    .replay {
      min-height: 44px;
      border: 0;
      border-radius: 999px;
      background: #ffd36b;
      padding: 10px 16px;
      color: #302616;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .steps button {
      min-height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 11px;
      background: transparent;
      padding: 9px 10px;
      color: #c8cad5;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
    }

    .steps button.active {
      border-color: #ffd36b;
      background: rgba(255, 211, 107, 0.12);
      color: #ffd36b;
    }

    .content {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
    }

    .samples,
    .means {
      padding: 30px;
    }

    .means {
      border-left: 1px solid rgba(46, 53, 74, 0.1);
      background: #f7f2ff;
    }

    h4 {
      margin: 0;
      font-size: 1.08rem;
    }

    .hint {
      margin: 5px 0 18px;
      color: #555d6d;
      font-size: 0.8rem;
      line-height: 1.5;
    }

    .trial-control {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 6px;
      border-radius: 12px;
      background: rgba(32, 40, 58, 0.055);
      padding: 10px 12px;
      color: #5f6677;
      font-size: 0.72rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #ef6b5b;
    }

    output {
      min-width: 34px;
      color: #a83b32;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .phase {
      opacity: 0.18;
      transition:
        opacity 260ms ease,
        transform 260ms ease;
    }

    .phase.visible {
      opacity: 1;
    }

    .mean-cards {
      display: grid;
      gap: 12px;
    }

    .mean-card {
      display: grid;
      grid-template-columns: 70px 1fr auto;
      gap: 13px;
      align-items: center;
      border: 1px solid transparent;
      border-radius: 16px;
      background: white;
      padding: 13px;
    }

    .mean-card.geometry {
      border-color: rgba(108, 78, 185, 0.3);
    }

    .mini-ellipse {
      display: grid;
      width: 64px;
      height: 64px;
      place-items: center;
    }

    .mini-ellipse i {
      display: block;
      border: 3px solid #ef6b5b;
      border-radius: 50%;
      background: rgba(239, 107, 91, 0.12);
    }

    .geometry .mini-ellipse i {
      border-color: #6c4eb9;
      background: rgba(108, 78, 185, 0.12);
    }

    .mean-card span,
    .mean-card strong,
    .mean-card small {
      display: block;
    }

    .mean-card span {
      color: #555d6d;
      font-size: 0.64rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .mean-card strong {
      margin: 3px 0;
      font-size: 0.88rem;
    }

    .mean-card small {
      color: #555d6d;
      font-size: 0.69rem;
      line-height: 1.4;
    }

    .score {
      min-width: 62px;
      border-radius: 11px;
      background: #fff0ed;
      padding: 8px;
      color: #9a4036;
      text-align: center;
    }

    .geometry .score {
      background: #eee8ff;
      color: #5c43a7;
    }

    .score b,
    .score em {
      display: block;
      font-style: normal;
    }

    .score b {
      font-size: 1rem;
      font-variant-numeric: tabular-nums;
    }

    .score em {
      margin-top: 2px;
      font-size: 0.56rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .objective-definition {
      margin: 13px 0 0;
      border-radius: 12px;
      background: rgba(108, 78, 185, 0.08);
      padding: 11px 13px;
      color: #625d72;
      font-size: 0.72rem;
      line-height: 1.5;
    }

    .prototype {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 15px;
      align-items: center;
      border-top: 1px solid rgba(46, 53, 74, 0.1);
      background: #22283b;
      padding: 20px 28px;
      color: #fff;
    }

    .prototype-number {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border-radius: 50%;
      background: #ffd36b;
      color: #302616;
      font-weight: 800;
    }

    .prototype strong,
    .prototype span {
      display: block;
    }

    .prototype span {
      margin-top: 3px;
      color: #c8cad5;
      font-size: 0.78rem;
      line-height: 1.45;
    }

    .test-trial {
      color: #ffd36b;
      font-size: 0.72rem;
      font-weight: 800;
      text-align: right;
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
      color: #6c4eb9;
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
      .control,
      .content,
      .not-waveform,
      .prototype,
      .bci-chain {
        grid-template-columns: 1fr;
      }

      .not-waveform strong {
        white-space: normal;
      }

      .steps {
        grid-template-columns: 1fr;
      }

      .means {
        border-top: 1px solid rgba(46, 53, 74, 0.1);
        border-left: 0;
      }

      .test-trial {
        text-align: left;
      }
    }

    @media (max-width: 480px) {
      .mean-card {
        grid-template-columns: 58px 1fr;
      }

      .score {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .phase {
        transition: none;
      }
    }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopReplay();
  }

  private stopReplay(): void {
    if (this.replayTimer !== undefined) {
      window.clearInterval(this.replayTimer);
      this.replayTimer = undefined;
    }
    this.isPlaying = false;
  }

  private replay(): void {
    if (this.isPlaying) {
      this.stopReplay();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      this.phase = this.phase === 3 ? 1 : this.phase + 1;
      return;
    }

    this.phase = 1;
    this.isPlaying = true;
    this.replayTimer = window.setInterval(() => {
      if (this.phase >= 3) {
        this.stopReplay();
        return;
      }
      this.phase += 1;
    }, 1350);
  }

  private setPhase(phase: number): void {
    this.stopReplay();
    this.phase = phase;
  }

  private updateTrial(event: Event): void {
    this.stopReplay();
    this.phase = 3;
    this.thirdTrialX = Number((event.target as HTMLInputElement).value);
  }

  private ellipseDimensions(matrix: DiagonalMatrix2, scale = 44) {
    return {
      rx: Math.min(78, scale * Math.sqrt(matrix[0])),
      ry: Math.min(78, scale * Math.sqrt(matrix[1])),
    };
  }

  private totalSquaredDistance(
    center: DiagonalMatrix2,
    trials: DiagonalMatrix2[],
  ): number {
    return trials.reduce((total, trial) => {
      const distance = riemannianDistance(center, trial);
      return total + distance ** 2;
    }, 0);
  }

  render() {
    const trials: DiagonalMatrix2[] = [
      [0.25, 4],
      [0.5, 2],
      [this.thirdTrialX, 1 / this.thirdTrialX],
    ];
    const ordinary = arithmeticMean(trials);
    const geometry = geometricMean(trials);
    const ordinaryShape = this.ellipseDimensions(ordinary, 25);
    const geometryShape = this.ellipseDimensions(geometry, 25);
    const ordinaryObjective = this.totalSquaredDistance(ordinary, trials);
    const geometryObjective = this.totalSquaredDistance(geometry, trials);

    return html`
      <div class="shell">
        <section class="problem">
          <div>
            <p class="eyebrow">The decoder’s problem</p>
            <h3>Many “feet imagery” trials must become one class prototype.</h3>
          </div>
          <p>
            EEG changes from trial to trial. Minimum Distance to Mean does not
            store every example as a separate rule. It summarizes the
            covariance matrices from one class with a center, then compares a
            new trial with that center.
          </p>
        </section>

        <div class="not-waveform">
          <strong>We are not averaging raw waveforms.</strong>
          <p>
            Each ellipse already summarizes one trial’s channel variances and
            relationships. This lesson averages those covariance summaries
            after the raw time series have been converted to matrices.
          </p>
        </div>

        <div class="control">
          <button class="replay" type="button" @click=${this.replay}>
            ${this.isPlaying ? "Pause construction" : "▶ Replay construction"}
          </button>
          <div class="steps" aria-label="Class prototype construction steps">
            <button
              class=${this.phase === 1 ? "active" : ""}
              type="button"
              @click=${() => this.setPhase(1)}
            >
              1 · collect trials
            </button>
            <button
              class=${this.phase === 2 ? "active" : ""}
              type="button"
              @click=${() => this.setPhase(2)}
            >
              2 · compare centers
            </button>
            <button
              class=${this.phase === 3 ? "active" : ""}
              type="button"
              @click=${() => this.setPhase(3)}
            >
              3 · keep the prototype
            </button>
          </div>
        </div>

        <div class="content">
          <section class="samples phase ${this.phase >= 1 ? "visible" : ""}">
            <h4>Step 1 · training trials from one class</h4>
            <p class="hint">
              The ellipses differ because repeated EEG trials are never
              identical. Move trial 3 to see both candidate centers update.
            </p>
            <label class="trial-control">
              Trial 3 shape
              <input
                aria-label="Third trial horizontal variation"
                type="range"
                min="0.3"
                max="5"
                step="0.01"
                .value=${String(this.thirdTrialX)}
                @input=${this.updateTrial}
              />
              <output>${this.thirdTrialX.toFixed(1)}</output>
            </label>
            <svg viewBox="0 0 520 290" role="img" aria-label="Three covariance ellipses from the same BCI class">
              <line x1="30" x2="490" y1="145" y2="145" stroke="#e0e2e8" />
              ${trials.map((trial, index) => {
                const dimensions = this.ellipseDimensions(trial);
                const centers = [100, 260, 420];
                const colors = ["#1ca9a0", "#6c4eb9", "#ef6b5b"];
                return svg`
                  <ellipse
                    cx=${centers[index]}
                    cy="145"
                    rx=${dimensions.rx}
                    ry=${dimensions.ry}
                    fill="${colors[index]}20"
                    stroke=${colors[index]}
                    stroke-width="4"
                  />
                  <text
                    x=${centers[index]}
                    y="267"
                    fill="#5e6575"
                    font-size="13"
                    text-anchor="middle"
                    font-weight="700"
                  >
                    training trial ${index + 1}
                  </text>
                `;
              })}
            </svg>
          </section>

          <section class="means phase ${this.phase >= 2 ? "visible" : ""}">
            <h4>Step 2 · which candidate is the center?</h4>
            <p class="hint">
              Because classification will use Riemannian distance, evaluate
              each candidate with that same distance rule. Lower total squared
              distance means a more central prototype.
            </p>
            <div class="mean-cards">
              <article class="mean-card">
                <div class="mini-ellipse">
                  <i
                    style="width:${ordinaryShape.rx}px;height:${ordinaryShape.ry}px"
                  ></i>
                </div>
                <div>
                  <span>Average the entries</span>
                  <strong>Arithmetic candidate</strong>
                  <small>
                    Relative area ${Math.sqrt(determinant(ordinary)).toFixed(2)}×
                  </small>
                </div>
                <div class="score">
                  <b>${ordinaryObjective.toFixed(2)}</b>
                  <em>total distance²</em>
                </div>
              </article>
              <article class="mean-card geometry">
                <div class="mini-ellipse">
                  <i
                    style="width:${geometryShape.rx}px;height:${geometryShape.ry}px"
                  ></i>
                </div>
                <div>
                  <span>Minimize curved-space distance</span>
                  <strong>Riemannian center</strong>
                  <small>
                    Relative area ${Math.sqrt(determinant(geometry)).toFixed(2)}×
                  </small>
                </div>
                <div class="score">
                  <b>${geometryObjective.toFixed(2)}</b>
                  <em>total distance²</em>
                </div>
              </article>
            </div>
            <p class="objective-definition">
              <strong>Why this is called a mean:</strong> it is the matrix that
              minimizes the sum of squared distances to the training matrices,
              just as an ordinary mean does on a flat number line.
            </p>
          </section>
        </div>

        <div class="prototype phase ${this.phase >= 3 ? "visible" : ""}">
          <span class="prototype-number">3</span>
          <div>
            <strong>Store the Riemannian center as this class’s prototype.</strong>
            <span>
              Repeat the same construction for every BCI class—for example,
              hands imagery and feet imagery.
            </span>
          </div>
          <span class="test-trial">new trial → measure distance to every prototype</span>
        </div>

        <div class="bci-chain" aria-label="How a class mean is used by an MDM classifier">
          <div>
            <span>Learn</span>
            <strong>One center summarizes each labeled class.</strong>
          </div>
          <div>
            <span>Compare</span>
            <strong>A new covariance matrix is measured against all centers.</strong>
          </div>
          <div>
            <span>Predict</span>
            <strong>The nearest center supplies the class label.</strong>
          </div>
        </div>

        <details>
          <summary>Check your understanding: why not keep the arithmetic center?</summary>
          <p>
            You could, but it optimizes ordinary entry-wise squared error, not
            the Riemannian distance used by this decoder. If prediction uses
            curved-space distance, the matching Riemannian mean is the
            internally consistent prototype and has the lowest total squared
            Riemannian distance to these trials.
          </p>
        </details>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-mean-explorer": MeanExplorer;
  }
}
