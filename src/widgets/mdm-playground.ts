import { LitElement, css, html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  expMapCoordinates,
  geometricMean,
  riemannianDistance,
  type DiagonalMatrix2,
} from "../math/geometry";

@customElement("rg-mdm-playground")
export class MdmPlayground extends LitElement {
  @state() private testX = 0;
  @state() private testY = 0;

  private readonly leftTrials: DiagonalMatrix2[] = [
    expMapCoordinates([-0.95, 0.55], [1, 1]),
    expMapCoordinates([-0.72, 0.32], [1, 1]),
    expMapCoordinates([-0.58, 0.7], [1, 1]),
    expMapCoordinates([-0.86, 0.2], [1, 1]),
  ];

  private readonly rightTrials: DiagonalMatrix2[] = [
    expMapCoordinates([0.62, -0.5], [1, 1]),
    expMapCoordinates([0.92, -0.28], [1, 1]),
    expMapCoordinates([0.72, -0.75], [1, 1]),
    expMapCoordinates([1.02, -0.58], [1, 1]),
  ];

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
      background: #fffdf8;
      box-shadow: 0 26px 70px rgba(62, 45, 91, 0.12);
    }

    .controls {
      display: grid;
      grid-template-columns: 0.8fr 1fr 1fr;
      gap: 24px;
      align-items: center;
      padding: 24px 30px;
      background: #fff1cc;
    }

    .controls strong,
    .controls span {
      display: block;
    }

    .controls span {
      margin-top: 3px;
      color: #715d37;
      font-size: 0.78rem;
    }

    label {
      display: grid;
      gap: 7px;
      color: #5f512e;
      font-size: 0.74rem;
      font-weight: 800;
    }

    label b {
      color: #20283a;
      font-variant-numeric: tabular-nums;
    }

    input {
      width: 100%;
      min-height: 44px;
      accent-color: #6c4eb9;
    }

    .content {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
    }

    .map,
    .decision {
      padding: 28px;
    }

    .decision {
      border-left: 1px solid rgba(46, 53, 74, 0.1);
      background: #f3efff;
    }

    h3 {
      margin: 0;
      font-size: 1.08rem;
    }

    .hint {
      margin: 5px 0 14px;
      color: #555d6d;
      font-size: 0.8rem;
      line-height: 1.45;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .prediction {
      margin: 24px 0;
      border-radius: 18px;
      background: white;
      padding: 20px;
      text-align: center;
    }

    .prediction span,
    .prediction strong {
      display: block;
    }

    .prediction span {
      color: #555d6d;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .prediction strong {
      margin-top: 6px;
      font-size: 1.35rem;
    }

    .prediction.left strong {
      color: #15867d;
    }

    .prediction.right strong {
      color: #c84e43;
    }

    .distances {
      display: grid;
      gap: 10px;
    }

    .distance {
      border-radius: 14px;
      background: white;
      padding: 13px;
    }

    .distance div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .bar {
      height: 8px;
      margin-top: 8px;
      overflow: hidden;
      border-radius: 99px;
      background: #e6e7ed;
    }

    .bar i {
      display: block;
      height: 100%;
      border-radius: inherit;
    }

    .steps {
      margin: 22px 0 0;
      padding-left: 20px;
      color: #5f6575;
      font-size: 0.78rem;
      line-height: 1.6;
    }

    .takeaway {
      padding: 18px 28px;
      background: #24283b;
      color: #d7d8e2;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .takeaway strong {
      color: #ffd36b;
      margin-right: 8px;
    }

    @media (max-width: 760px) {
      .controls,
      .content {
        grid-template-columns: 1fr;
      }

      .decision {
        border-top: 1px solid rgba(46, 53, 74, 0.1);
        border-left: 0;
      }
    }
  `;

  private updateX(event: Event): void {
    this.testX = Number((event.target as HTMLInputElement).value);
  }

  private updateY(event: Event): void {
    this.testY = Number((event.target as HTMLInputElement).value);
  }

  render() {
    const leftMean = geometricMean(this.leftTrials);
    const rightMean = geometricMean(this.rightTrials);
    const testMatrix = expMapCoordinates(
      [this.testX, this.testY],
      [1, 1],
    );
    const leftDistance = riemannianDistance(testMatrix, leftMean);
    const rightDistance = riemannianDistance(testMatrix, rightMean);
    const predictedLeft = leftDistance <= rightDistance;
    const maxDistance = Math.max(leftDistance, rightDistance, 0.01);
    const toScreen = ([x, y]: DiagonalMatrix2) => ({
      x: 300 + x * 150,
      y: 205 - y * 125,
    });
    const leftLogPoints: DiagonalMatrix2[] = [
      [-0.95, 0.55],
      [-0.72, 0.32],
      [-0.58, 0.7],
      [-0.86, 0.2],
    ];
    const rightLogPoints: DiagonalMatrix2[] = [
      [0.62, -0.5],
      [0.92, -0.28],
      [0.72, -0.75],
      [1.02, -0.58],
    ];
    const leftMeanLog: DiagonalMatrix2 = [
      leftLogPoints.reduce((sum, point) => sum + point[0], 0) /
        leftLogPoints.length,
      leftLogPoints.reduce((sum, point) => sum + point[1], 0) /
        leftLogPoints.length,
    ];
    const rightMeanLog: DiagonalMatrix2 = [
      rightLogPoints.reduce((sum, point) => sum + point[0], 0) /
        rightLogPoints.length,
      rightLogPoints.reduce((sum, point) => sum + point[1], 0) /
        rightLogPoints.length,
    ];
    const testScreen = toScreen([this.testX, this.testY]);
    const leftMeanScreen = toScreen(leftMeanLog);
    const rightMeanScreen = toScreen(rightMeanLog);

    return html`
      <div class="shell">
        <div class="controls">
          <div>
            <strong>Move the new EEG trial</strong>
            <span>This is synthetic data for intuition.</span>
          </div>
          <label>
            Channel-pattern direction 1 <b>${this.testX.toFixed(2)}</b>
            <input
              aria-label="Test trial first log coordinate"
              type="range"
              min="-1.3"
              max="1.3"
              step="0.01"
              .value=${String(this.testX)}
              @input=${this.updateX}
            />
          </label>
          <label>
            Channel-pattern direction 2 <b>${this.testY.toFixed(2)}</b>
            <input
              aria-label="Test trial second log coordinate"
              type="range"
              min="-1"
              max="1"
              step="0.01"
              .value=${String(this.testY)}
              @input=${this.updateY}
            />
          </label>
        </div>

        <div class="content">
          <section class="map">
            <h3>Training trials and their class centers</h3>
            <p class="hint">
              Large circles are the Riemannian means. The yellow point is the
              new trial.
            </p>
            <svg viewBox="0 0 600 410" role="img" aria-label="Synthetic minimum distance to mean classifier">
              <ellipse cx="300" cy="205" rx="268" ry="170" fill="#f3efff" stroke="#c9bdf0" stroke-width="2" />
              <line x1="55" x2="545" y1="205" y2="205" stroke="#d7d3e5" />
              <line x1="300" x2="300" y1="48" y2="362" stroke="#d7d3e5" />
              ${leftLogPoints.map((point) => {
                const screen = toScreen(point);
                return svg`<circle cx=${screen.x} cy=${screen.y} r="8" fill="#1ca9a0" />`;
              })}
              ${rightLogPoints.map((point) => {
                const screen = toScreen(point);
                return svg`<circle cx=${screen.x} cy=${screen.y} r="8" fill="#ef6b5b" />`;
              })}
              <line
                x1=${testScreen.x}
                y1=${testScreen.y}
                x2=${leftMeanScreen.x}
                y2=${leftMeanScreen.y}
                stroke="#1ca9a0"
                stroke-width=${predictedLeft ? 5 : 2}
                stroke-dasharray="7 6"
              />
              <line
                x1=${testScreen.x}
                y1=${testScreen.y}
                x2=${rightMeanScreen.x}
                y2=${rightMeanScreen.y}
                stroke="#ef6b5b"
                stroke-width=${predictedLeft ? 2 : 5}
                stroke-dasharray="7 6"
              />
              <circle cx=${leftMeanScreen.x} cy=${leftMeanScreen.y} r="15" fill="#1ca9a0" stroke="white" stroke-width="4" />
              <circle cx=${rightMeanScreen.x} cy=${rightMeanScreen.y} r="15" fill="#ef6b5b" stroke="white" stroke-width="4" />
              <circle cx=${testScreen.x} cy=${testScreen.y} r="12" fill="#ffd36b" stroke="#20283a" stroke-width="4" />
              <text x=${leftMeanScreen.x} y=${leftMeanScreen.y - 25} fill="#14776f" font-size="13" font-weight="700" text-anchor="middle">
                left-hand mean
              </text>
              <text x=${rightMeanScreen.x} y=${rightMeanScreen.y - 25} fill="#b3443a" font-size="13" font-weight="700" text-anchor="middle">
                right-hand mean
              </text>
            </svg>
          </section>

          <section class="decision">
            <h3>The decoder’s decision</h3>
            <p class="hint">Whichever class mean is closer wins.</p>
            <div class="prediction ${predictedLeft ? "left" : "right"}">
              <span>Predicted state</span>
              <strong>
                ${predictedLeft
                  ? "Left-hand imagery"
                  : "Right-hand imagery"}
              </strong>
            </div>
            <div class="distances">
              <div class="distance">
                <div>
                  <span>Distance to left mean</span>
                  <b>${leftDistance.toFixed(2)}</b>
                </div>
                <div class="bar">
                  <i
                    style="width:${(leftDistance / maxDistance) * 100}%;background:#1ca9a0"
                  ></i>
                </div>
              </div>
              <div class="distance">
                <div>
                  <span>Distance to right mean</span>
                  <b>${rightDistance.toFixed(2)}</b>
                </div>
                <div class="bar">
                  <i
                    style="width:${(rightDistance / maxDistance) * 100}%;background:#ef6b5b"
                  ></i>
                </div>
              </div>
            </div>
            <ol class="steps">
              <li>Summarize each training trial with a covariance matrix.</li>
              <li>Compute one Riemannian mean for each class.</li>
              <li>Measure the new trial’s distance to every class mean.</li>
              <li>Return the class with the minimum distance.</li>
            </ol>
          </section>
        </div>

        <div class="takeaway">
          <strong>Minimum Distance to Mean (MDM)</strong>
          is simple enough for real-time use and is a strong baseline—not a
          guarantee of best performance for every dataset.
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-mdm-playground": MdmPlayground;
  }
}
