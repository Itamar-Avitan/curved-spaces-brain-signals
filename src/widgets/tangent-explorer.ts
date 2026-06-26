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
    const basePoints = [
      [-0.8, 0.35],
      [-0.45, -0.5],
      [0.2, 0.55],
      [0.68, -0.25],
    ];
    const points = basePoints.map(([x, y]) => [
      x * this.spread,
      y * this.spread,
    ]);
    const localEnough = this.spread <= 0.8;

    return html`
      <div class="shell">
        <div class="control">
          <div>
            <strong>Flatten a neighborhood—not the whole world</strong>
            <span>
              Choose how far the trials sit from the reference pattern.
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
          <svg viewBox="0 0 900 390" role="img" aria-label="Mapping a curved neighborhood to a tangent plane">
            <defs>
              <linearGradient id="surface" x1="0" x2="1">
                <stop offset="0" stop-color="#6c4eb9" stop-opacity=".22" />
                <stop offset="1" stop-color="#1ca9a0" stop-opacity=".18" />
              </linearGradient>
            </defs>
            <text x="185" y="34" fill="#fffaf1" font-size="18" font-weight="700" text-anchor="middle">
              curved matrix space
            </text>
            <path
              d="M35 235 C95 95 285 80 380 220 C300 340 100 350 35 235 Z"
              fill="url(#surface)"
              stroke="#6c4eb9"
              stroke-width="3"
            />
            <circle cx="205" cy="220" r="10" fill="#ffd36b" />
            <text x="205" y="258" fill="#ffd36b" font-size="13" font-weight="700" text-anchor="middle">
              reference mean
            </text>
            ${points.map(([x, y], index) => {
              const colors = ["#1ca9a0", "#ef6b5b", "#8d72d4", "#4cc0b8"];
              return svg`
                <circle
                  cx=${205 + x * 125}
                  cy=${210 - y * 82 - x * x * 12}
                  r="8"
                  fill=${colors[index]}
                />
              `;
            })}

            <path d="M405 205 C455 160 485 150 520 168" fill="none" stroke="#ffd36b" stroke-width="4" />
            <path d="M510 155 L528 169 L507 177" fill="none" stroke="#ffd36b" stroke-width="4" />
            <text x="465" y="132" fill="#ffd36b" font-size="14" font-weight="700" text-anchor="middle">
              log map
            </text>

            <text x="710" y="34" fill="#fffaf1" font-size="18" font-weight="700" text-anchor="middle">
              flat feature space
            </text>
            <path
              d="M545 285 L842 285 L790 100 L500 100 Z"
              fill="#343a54"
              stroke="#747b8d"
              stroke-width="2"
            />
            <line x1="680" x2="680" y1="115" y2="278" stroke="#596075" />
            <line x1="535" x2="815" y1="205" y2="205" stroke="#596075" />
            <circle cx="680" cy="205" r="10" fill="#ffd36b" />
            ${points.map(([x, y], index) => {
              const colors = ["#1ca9a0", "#ef6b5b", "#8d72d4", "#4cc0b8"];
              return svg`
                <circle
                  cx=${680 + x * 125}
                  cy=${205 - y * 90}
                  r="8"
                  fill=${colors[index]}
                />
              `;
            })}
            <text x="680" y="335" fill=${localEnough ? "#7de0c5" : "#ffd36b"} font-size="14" font-weight="700" text-anchor="middle">
              ${localEnough
                ? "nearby curved points become useful vectors"
                : "farther points make the flat approximation less local"}
            </text>
          </svg>
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
