import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("rg-next-steps")
export class NextSteps extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: #20283a;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .section {
      background:
        linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
        #24283b;
      background-size: 34px 34px;
      padding: 112px max(24px, calc((100% - 1180px) / 2));
      color: #fffaf1;
    }

    .heading {
      display: grid;
      grid-template-columns: 1fr 0.72fr;
      gap: 70px;
      align-items: end;
    }

    .eyebrow {
      margin: 0 0 18px;
      color: #ffd36b;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    h2 {
      margin: 0;
      color: #fffaf1;
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(2.7rem, 5vw, 5.1rem);
      letter-spacing: -0.035em;
      line-height: 1.02;
    }

    .heading > p {
      margin: 0;
      color: #c7c9d4;
      font-size: 1rem;
      line-height: 1.65;
    }

    .launch-sequence {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      margin: 62px 0 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.055);
    }

    .launch-sequence article {
      position: relative;
      min-height: 190px;
      padding: 26px 28px;
    }

    .launch-sequence article + article {
      border-left: 1px solid rgba(255, 255, 255, 0.12);
    }

    .step {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border-radius: 50%;
      background: #ffd36b;
      color: #24283b;
      font-size: 0.75rem;
      font-weight: 900;
    }

    h3 {
      margin: 32px 0 8px;
      color: #fffaf1;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.35rem;
    }

    .launch-sequence p {
      margin: 0;
      color: #c7c9d4;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    .launch-sequence a {
      color: #7de0d7;
      font-weight: 800;
      text-underline-offset: 3px;
    }

    .resource-rack {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .resource-group {
      border-radius: 22px;
      background: #fffdf8;
      padding: 28px;
      color: #20283a;
    }

    .resource-group:nth-child(2) {
      background: #eef8f6;
    }

    .resource-group:nth-child(3) {
      background: #f1ebff;
    }

    .group-label {
      margin: 0;
      color: #6c4eb9;
      font-size: 0.68rem;
      font-weight: 850;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .resource-group h3 {
      margin: 9px 0 22px;
      color: #20283a;
      font-size: 1.55rem;
    }

    ul {
      display: grid;
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      padding: 14px 0;
      border-top: 1px solid rgba(32, 40, 58, 0.1);
    }

    li:first-child {
      border-top: 0;
      padding-top: 0;
    }

    li:last-child {
      padding-bottom: 0;
    }

    li a {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #3f2b7c;
      font-weight: 850;
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
    }

    li a::after {
      content: "↗";
      font-size: 0.72rem;
    }

    li p {
      margin: 5px 0 0;
      color: #606879;
      font-size: 0.78rem;
      line-height: 1.5;
    }

    a:focus-visible {
      border-radius: 4px;
      outline: 3px solid #1ca9a0;
      outline-offset: 4px;
    }

    .scope {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 18px;
      align-items: baseline;
      margin: 20px 0 0;
      border-left: 4px solid #ef6b5b;
      background: rgba(255, 255, 255, 0.065);
      padding: 17px 20px;
    }

    .scope strong {
      color: #ffd36b;
      white-space: nowrap;
    }

    .scope p {
      margin: 0;
      color: #c7c9d4;
      font-size: 0.82rem;
      line-height: 1.55;
    }

    @media (max-width: 850px) {
      .heading,
      .resource-rack {
        grid-template-columns: 1fr;
      }

      .launch-sequence {
        grid-template-columns: 1fr;
      }

      .launch-sequence article {
        min-height: 0;
      }

      .launch-sequence article + article {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        border-left: 0;
      }
    }

    @media (max-width: 520px) {
      .section {
        padding-block: 88px;
      }

      .scope {
        grid-template-columns: 1fr;
        gap: 5px;
      }

      .scope strong {
        white-space: normal;
      }
    }
  `;

  private externalLink(
    href: string,
    label: string,
    description: string,
  ) {
    return html`
      <li>
        <a href=${href} target="_blank" rel="noreferrer">${label}</a>
        <p>${description}</p>
      </li>
    `;
  }

  render() {
    return html`
      <section class="section" aria-labelledby="next-steps-title">
        <div class="heading">
          <div>
            <p class="eyebrow">From lesson to first project</p>
            <h2 id="next-steps-title">Keep one thing fixed. Change one thing.</h2>
          </div>
          <p>
            Start from a workflow you can already explain. Make one controlled
            extension, preserve the held-out group, and only then widen the
            question to new datasets or model families.
          </p>
        </div>

        <div class="launch-sequence" aria-label="A three-step path to a first EEG BCI project">
          <article>
            <span class="step">1</span>
            <h3>Run the guided notebook</h3>
            <p>
              Use the <a href="#notebook">implementation above</a> unchanged
              once. Confirm that every assertion and held-out-run result makes sense.
            </p>
          </article>
          <article>
            <span class="step">2</span>
            <h3>Change one variable</h3>
            <p>
              Try a different channel set, covariance estimator, epoch window,
              or participant. Write down what you expect before rerunning.
            </p>
          </article>
          <article>
            <span class="step">3</span>
            <h3>Branch with honest validation</h3>
            <p>
              Keep sessions or participants out of training, compare a credible
              baseline, and treat one-person results as a demonstration.
            </p>
          </article>
        </div>

        <div class="resource-rack">
          <section class="resource-group" aria-labelledby="datasets-title">
            <p class="group-label">Choose data</p>
            <h3 id="datasets-title">Datasets to explore</h3>
            <ul>
              ${this.externalLink(
                "https://eegdash.org/",
                "EEGDash",
                "Search 700+ BIDS-first EEG/MEG datasets, then load records through MNE and braindecode-compatible objects.",
              )}
              ${this.externalLink(
                "https://moabb.neurotechx.com/docs/index.html",
                "MOABB",
                "Compare BCI pipelines across standardized datasets, paradigms, and evaluation protocols.",
              )}
              ${this.externalLink(
                "https://physionet.org/content/eegmmidb/1.0.0/",
                "PhysioNet EEGMMI",
                "Use the 109-participant motor movement and imagery dataset behind this notebook's first example.",
              )}
            </ul>
          </section>

          <section class="resource-group" aria-labelledby="tools-title">
            <p class="group-label">Build the pipeline</p>
            <h3 id="tools-title">Core tools</h3>
            <ul>
              ${this.externalLink(
                "https://mne.tools/stable/",
                "MNE-Python",
                "Load, inspect, preprocess, epoch, and visualize electrophysiology data.",
              )}
              ${this.externalLink(
                "https://pyriemann.readthedocs.io/en/latest/",
                "pyRiemann",
                "Estimate covariance matrices and apply Riemannian classifiers, means, distances, and tangent maps.",
              )}
              ${this.externalLink(
                "https://braindecode.org/",
                "braindecode",
                "Build PyTorch decoding workflows for raw EEG, ECoG, and MEG when deep learning is justified.",
              )}
            </ul>
          </section>

          <section class="resource-group" aria-labelledby="learning-title">
            <p class="group-label">Keep learning</p>
            <h3 id="learning-title">Guides and community</h3>
            <ul>
              <li>
                <a href="#references">This page’s reading library</a>
                <p>Continue with the review papers and primary method sources collected below.</p>
              </li>
              ${this.externalLink(
                "https://mne.tools/stable/auto_tutorials/intro/index.html",
                "MNE introductory tutorials",
                "Work through the basic EEG/MEG data structures and analysis sequence.",
              )}
              ${this.externalLink(
                "https://neurotechx.org/",
                "NeuroTechX",
                "Find an open, volunteer-led neurotechnology community, education resources, and local chapters.",
              )}
            </ul>
          </section>
        </div>

        <aside class="scope">
          <strong>A useful first project is narrow.</strong>
          <p>
            Prefer one clear task, one preregistered comparison, and one honest
            held-out unit over a broad model search on a single participant.
          </p>
        </aside>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-next-steps": NextSteps;
  }
}
