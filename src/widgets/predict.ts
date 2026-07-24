import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PREDICTIONS } from "../predictions";

/**
 * Commit to an answer before the widget below reveals it.
 *
 * Deliberately un-skippable-looking but genuinely optional: every choice leads
 * to an explanation, and nothing is gated. Getting it wrong on purpose is a
 * legitimate way to read the page.
 */
@customElement("rg-predict")
export class RgPredict extends LitElement {
  /** Key into PREDICTIONS. */
  @property({ type: String }) key = "";

  @state() private chosen: number | null = null;

  static styles = css`
    :host {
      display: block;
      margin: 0 0 20px;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    .box {
      border: 1px dashed rgba(108, 78, 185, 0.45);
      border-radius: 20px;
      background: #f7f4ff;
      padding: 22px 24px;
    }

    .kicker {
      margin: 0 0 8px;
      color: #6c4eb9;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .question {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 600;
      line-height: 1.5;
    }

    .hint {
      margin: 7px 0 0;
      color: #61688a;
      font-size: 0.82rem;
      line-height: 1.5;
    }

    .options {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 15px;
    }

    button {
      flex: 1 1 210px;
      min-height: 46px;
      border: 1px solid rgba(46, 53, 74, 0.18);
      border-radius: 14px;
      background: #fff;
      padding: 11px 15px;
      color: #2c3346;
      font: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      border-color: #6c4eb9;
      background: #fdfcff;
    }

    button:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 2px;
    }

    button.picked {
      border-color: #6c4eb9;
      background: #6c4eb9;
      color: #fff;
    }

    button:disabled {
      cursor: default;
      opacity: 0.55;
    }

    button.picked:disabled {
      opacity: 1;
    }

    .response {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 12px;
      margin-top: 15px;
      border-radius: 14px;
      background: #fff;
      padding: 15px 16px;
      font-size: 0.89rem;
      line-height: 1.6;
    }

    .mark {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      color: #fff;
      font-size: 0.82rem;
      font-weight: 800;
      line-height: 26px;
      text-align: center;
    }

    .mark.yes {
      background: #12766f;
    }

    .mark.no {
      background: #a97b31;
    }

    .again {
      display: block;
      margin-top: 11px;
      border: 0;
      background: none;
      padding: 0;
      color: #6c4eb9;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: underline;
      cursor: pointer;
      min-height: 0;
      flex: none;
    }

    @media (max-width: 640px) {
      .box {
        padding: 18px 16px;
      }

      button {
        flex: 1 1 100%;
      }
    }
  `;

  render() {
    const item = PREDICTIONS[this.key];
    if (!item) return nothing;

    const picked = this.chosen === null ? null : item.options[this.chosen];

    return html`
      <div class="box">
        <p class="kicker">Predict first</p>
        <p class="question">${item.question}</p>
        ${item.hint ? html`<p class="hint">${item.hint}</p>` : nothing}

        <div class="options">
          ${item.options.map(
            (option, index) => html`
              <button
                type="button"
                class=${index === this.chosen ? "picked" : ""}
                ?disabled=${this.chosen !== null}
                @click=${() => {
                  this.chosen = index;
                }}
              >
                ${option.label}
              </button>
            `,
          )}
        </div>

        ${picked
          ? html`
              <div class="response" role="status">
                <span class=${`mark ${picked.correct ? "yes" : "no"}`}>
                  ${picked.correct ? "✓" : "!"}
                </span>
                <div>
                  ${picked.response}
                  <button
                    class="again"
                    type="button"
                    @click=${() => {
                      this.chosen = null;
                    }}
                  >
                    Try another answer
                  </button>
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
