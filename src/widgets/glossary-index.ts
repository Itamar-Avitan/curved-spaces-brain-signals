import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { GLOSSARY, GLOSSARY_ORDER } from "../glossary";
import "./term";

/**
 * The glossary section, generated from `src/glossary.ts` rather than written out
 * again in the page. Previously the same definitions lived in two places and
 * could drift; now every term here opens the identical card the inline terms do.
 *
 * Ordered by when each idea is taught, not alphabetically — reading it top to
 * bottom retraces the lesson.
 */
@customElement("rg-glossary")
export class RgGlossary extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    ol {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
      gap: 0;
      margin: 0;
      border: 1px solid rgba(46, 53, 74, 0.13);
      border-radius: 20px;
      background: #fffdf8;
      padding: 0;
      list-style: none;
      overflow: hidden;
    }

    li {
      border-right: 1px solid rgba(46, 53, 74, 0.09);
      border-bottom: 1px solid rgba(46, 53, 74, 0.09);
      padding: 18px 20px;
    }

    .term {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.02rem;
      font-weight: 700;
      color: #4a3388;
    }

    p {
      margin: 7px 0 0;
      color: #545c6e;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    @media (max-width: 640px) {
      li {
        padding: 15px 16px;
      }
    }
  `;

  render() {
    return html`
      <ol>
        ${GLOSSARY_ORDER.filter((key) => GLOSSARY[key]).map((key) => {
          const entry = GLOSSARY[key];
          return html`
            <li>
              <rg-term key=${key}
                ><span class="term">${entry.term}</span></rg-term
              >
              <p>${entry.plain}</p>
            </li>
          `;
        })}
      </ol>
    `;
  }
}
