import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { GLOSSARY, type GlossaryEntry } from "../glossary";

/**
 * One boxed formula with every symbol labeled underneath and a plain-English
 * reading. The third rung of the page's term ladder: plain idea -> the formula
 * -> the formal name.
 *
 * Markup comes from `src/glossary.ts`, authored in this repo, so `unsafeHTML`
 * is not handling untrusted input.
 */
@customElement("rg-formula")
export class RgFormula extends LitElement {
  /** Key into GLOSSARY. */
  @property({ type: String }) key = "";
  /** Hide the symbol legend when the surrounding prose already covers it. */
  @property({ type: Boolean }) compact = false;
  /** Render closed, behind a "Show the math" disclosure. */
  @property({ type: Boolean }) folded = false;
  /** Disclosure label suffix, e.g. "the path, decoded, with real numbers". */
  @property({ type: String }) summary = "";

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
      overflow: hidden;
    }

    .expr {
      overflow-x: auto;
      background: #fdf8ef;
      padding: 22px 24px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.1);
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.28rem;
      line-height: 1.7;
      text-align: center;
      white-space: nowrap;
    }

    .expr i {
      font-style: italic;
    }

    .expr .op {
      padding-right: 2px;
      font-family: "DM Sans", system-ui, sans-serif;
      font-size: 0.82em;
      font-style: normal;
    }

    .expr sup,
    .expr sub {
      font-size: 0.6em;
    }

    .frac {
      display: inline-flex;
      flex-direction: column;
      vertical-align: middle;
      margin: 0 4px;
      font-size: 0.72em;
      text-align: center;
    }

    .frac > span:first-child {
      border-bottom: 1px solid currentColor;
      padding: 0 5px 1px;
    }

    .frac > span:last-child {
      padding: 1px 5px 0;
    }

    .sqrt {
      margin-right: -2px;
    }

    .under {
      border-top: 1px solid currentColor;
      padding: 0 3px;
    }

    .reading {
      margin: 0;
      padding: 16px 24px;
      color: #4a5265;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .legend {
      display: grid;
      gap: 0;
      margin: 0;
      border-top: 1px solid rgba(46, 53, 74, 0.1);
      background: #faf9f5;
    }

    .legend > div {
      display: grid;
      grid-template-columns: minmax(96px, max-content) 1fr;
      gap: 14px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.07);
      padding: 10px 24px;
    }

    .legend > div:last-child {
      border-bottom: 0;
    }

    dt {
      font-family: "Fraunces", Georgia, serif;
      font-size: 0.98rem;
      font-style: italic;
      color: #6c4eb9;
      white-space: nowrap;
    }

    dd {
      margin: 0;
      color: #4a5265;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    @media (max-width: 640px) {
      .expr {
        padding: 18px 16px;
        font-size: 1.05rem;
      }

      .reading {
        padding: 14px 16px;
      }

      .legend > div {
        grid-template-columns: 1fr;
        gap: 3px;
        padding: 10px 16px;
      }
    }

    details {
      border: 1px solid rgba(46, 53, 74, 0.18);
      border-radius: 14px;
      background: #fffdf8;
      overflow: hidden;
    }

    summary {
      cursor: pointer;
      padding: 13px 18px;
      font-size: 0.92rem;
      font-weight: 600;
      color: #4a3585;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::before {
      content: "▸";
      display: inline-block;
      margin-right: 9px;
      transition: transform 0.15s ease;
    }

    details[open] summary::before {
      transform: rotate(90deg);
    }

    summary em {
      font-style: normal;
      font-weight: 400;
      opacity: 0.62;
    }

    summary:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: -3px;
    }

    details .box {
      border: 0;
      border-radius: 0;
      border-top: 1px solid rgba(46, 53, 74, 0.12);
    }

    .steps {
      margin: 0;
      padding: 4px 24px 16px;
      display: grid;
      gap: 10px;
    }

    .steps > div {
      display: grid;
      grid-template-columns: minmax(120px, max-content) 1fr;
      gap: 14px;
      align-items: baseline;
    }

    .steps dt {
      font-family: "Fraunces", Georgia, serif;
      font-size: 0.9rem;
      color: #6c4eb9;
    }

    pre.worked {
      margin: 0;
      padding: 16px 24px 20px;
      overflow-x: auto;
      border-top: 1px solid rgba(46, 53, 74, 0.1);
      background: #faf9f5;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.78rem;
      line-height: 1.65;
      color: #20283a;
    }

    @media (max-width: 640px) {
      .steps > div {
        grid-template-columns: 1fr;
        gap: 3px;
      }

      pre.worked {
        padding: 14px 16px 16px;
      }
    }
  `;

  private renderBox(formula: NonNullable<GlossaryEntry["formula"]>) {
    return html`
      <div class="box">
        <div class="expr" role="math" aria-label=${formula.reading}>
          ${unsafeHTML(formula.html)}
        </div>
        <p class="reading">${formula.reading}</p>
        ${formula.steps?.length
          ? html`
              <dl class="steps">
                ${formula.steps.map(
                  (step) => html`
                    <div>
                      <dt>${step.part}</dt>
                      <dd>${step.says}</dd>
                    </div>
                  `,
                )}
              </dl>
            `
          : nothing}
        ${formula.worked
          ? html`<pre class="worked">${formula.worked.lines.join("\n")}</pre>`
          : nothing}
        ${this.compact
          ? nothing
          : html`
              <dl class="legend">
                ${formula.legend.map(
                  (item) => html`
                    <div>
                      <dt>${unsafeHTML(item.symbol)}</dt>
                      <dd>${item.meaning}</dd>
                    </div>
                  `,
                )}
              </dl>
            `}
      </div>
    `;
  }

  render() {
    const entry = GLOSSARY[this.key];
    const formula = entry?.formula;
    if (!formula) return nothing;

    if (!this.folded) return this.renderBox(formula);

    return html`
      <details>
        <summary>
          Show the math${this.summary
            ? html` <em>— ${this.summary}</em>`
            : nothing}
        </summary>
        ${this.renderBox(formula)}
      </details>
    `;
  }
}
