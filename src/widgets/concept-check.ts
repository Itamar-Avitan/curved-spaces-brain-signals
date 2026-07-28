import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("rg-concept-check")
export class ConceptCheck extends LitElement {
  @state() private selected: string | null = null;
  @state() private questionIndex = 0;

  private readonly questions = [
    {
      prompt: "What does an EEG trial's covariance matrix actually summarise?",
      choices: [
        ["raw", "The exact voltage trace at every electrode, kept in full."],
        [
          "pairs",
          "How much every pair of electrodes moved together over the trial.",
        ],
        ["duration", "How long the trial lasted."],
      ],
      correct: "pairs",
      correctFeedback:
        "Right. The diagonal is how much each channel varies on its own; the off-diagonal is how much pairs of channels vary together — and that off-diagonal is where the motor signal actually lives.",
      incorrectFeedback:
        "Not quite. A covariance matrix is not the raw recording, and it says nothing about the trial's length. It is a table built from the signal, summarising how every pair of channels moved together.",
    },
    {
      prompt:
        "Average two trials' covariance matrices cell by cell instead of respecting the geometry. What goes wrong?",
      choices: [
        [
          "stronger",
          "The result describes noticeably more activity than either trial actually had.",
        ],
        ["weaker", "The result describes less activity than either trial had."],
        [
          "nothing",
          "Nothing — an entry-wise average is exactly what a class center should be.",
        ],
      ],
      correct: "stronger",
      correctFeedback:
        "Correct — that is swelling. Entry-wise averaging invents a scale that was in neither trial, because it is flat arithmetic applied to a space that is not flat.",
      incorrectFeedback:
        "Not quite. Entry-wise averaging inflates the result rather than shrinking it or leaving it unchanged — a swollen center is not a trustworthy stand-in for the class, which is exactly why the ruler has to respect the geometry instead.",
    },
    {
      prompt:
        "A tangent-space map flattens the space around one chosen reference point. Where is that map accurate, and why?",
      choices: [
        [
          "reference",
          "Exactly at the reference point, degrading the further a trial sits from it.",
        ],
        ["everywhere", "Everywhere equally, once the log map is applied."],
        [
          "labels",
          "Wherever the class labels happen to sit, regardless of the reference point.",
        ],
      ],
      correct: "reference",
      correctFeedback:
        "Right — this is §1.2's rule, returning. A flat map is exact at the point you centre it on and wrong by more the further you stray. That is exactly why the reference is placed at the data's mean: it puts every trial as close as possible to the one place the flattening is exact.",
      incorrectFeedback:
        "Not quite. Flattening cannot be accurate everywhere — curvature forbids that — and the accuracy follows the chosen reference point, not the class labels. That is why this route can be built before a single trial is labeled.",
    },
    {
      prompt:
        "Volume conduction, re-referencing, and a drifted amplifier all do the same thing to a covariance matrix mathematically. What is that operation, and which distance ignores it?",
      choices: [
        [
          "congruence",
          "They are all a congruence — sandwiching the matrix between an invertible matrix and its transpose — and the affine-invariant distance is blind to it.",
        ],
        [
          "shift",
          "They all shift the matrix by a constant amount, and the straight-line distance ignores it.",
        ],
        [
          "rescale",
          "They all rescale the matrix, and every distance ignores it equally.",
        ],
      ],
      correct: "congruence",
      correctFeedback:
        "Exactly. A congruence is that one operation — sandwiching the table between an invertible matrix and its transpose — behind volume conduction, gain, referencing, and drift alike. The affine-invariant distance is built to be blind to that whole family; the straight-line distance is not.",
      incorrectFeedback:
        "Not quite. These recording changes are not a simple shift, and the straight-line distance is exactly the ruler that moves under them. The shared operation is a congruence, and only the affine-invariant distance ignores it.",
    },
    {
      prompt:
        "Route 1 (MDM) stores a class centre and compares distances to it. Route 2 flattens trials into vectors and fits an ordinary classifier. Which needs less calibration data to start working, and why?",
      choices: [
        [
          "route1",
          "Route 1 — nothing is fitted beyond the class centres themselves.",
        ],
        ["route2", "Route 2 — flattening the data always reduces how much is needed."],
        [
          "equal",
          "Both need the same amount, since they start from the same covariance matrices.",
        ],
      ],
      correct: "route1",
      correctFeedback:
        "Right. MDM's whole decision is distance to the nearest stored centre — no boundary is fitted in between — so it starts working with very little calibration data. Route 2 hands the flattened vectors to a real classifier, which has more to fit and more room to improve once data arrives.",
      incorrectFeedback:
        "Not quite. Sharing the same covariance matrices does not make the two routes equally data-hungry: Route 2 fits a genuine classifier on the flattened vectors, while Route 1 only ever compares to stored centres — which is why it needs less to get going.",
    },
    {
      prompt:
        "A decoder trained on Monday fails on Tuesday after the headset shifted. You re-centre each session on its own mean. What does that need from Tuesday's session?",
      choices: [
        ["nolabels", "Only that session's own trials — no labels."],
        [
          "somelabels",
          "A handful of labeled Tuesday trials to anchor the re-centring.",
        ],
        ["mondaylabels", "Monday's labels, carried over and reapplied to Tuesday."],
      ],
      correct: "nolabels",
      correctFeedback:
        "Correct. Re-centring only needs that session's own trials to compute its mean — no labels at all — which is why it can run before a single Tuesday trial has been classified. It is the same re-centering operation as the tangent space's first whitening step, put to a second job.",
      incorrectFeedback:
        "Not quite. Re-centring needs no labels from the new session — only its own trials, to compute where its mean sits. That is what makes it usable before anything has been classified yet.",
    },
  ] as const;

  static styles = css`
    :host {
      display: block;
      max-width: 760px;
      margin: 48px auto 0;
      font-family: "DM Sans", system-ui, sans-serif;
      text-align: left;
    }

    * {
      box-sizing: border-box;
    }

    .card {
      border: 1px solid rgba(53, 61, 82, 0.12);
      border-radius: 28px;
      background: #fff;
      padding: 30px;
      box-shadow: 0 20px 50px rgba(56, 44, 86, 0.1);
    }

    .label {
      margin: 0 0 10px;
      color: #6c4eb9;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h3 {
      margin: 0 0 22px;
      color: #20283a;
      font-size: clamp(1.2rem, 2vw, 1.55rem);
    }

    .choices {
      display: grid;
      gap: 10px;
    }

    button {
      width: 100%;
      border: 1px solid #dedbe8;
      border-radius: 14px;
      background: #faf8ff;
      padding: 14px 16px;
      color: #343b4d;
      font: inherit;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    button:hover,
    button:focus-visible {
      border-color: #6c4eb9;
      outline: none;
    }

    button.correct {
      border-color: #279276;
      background: #eaf9f4;
      color: #176c57;
    }

    button.incorrect {
      border-color: #ef6b5b;
      background: #fff0ed;
      color: #a84035;
    }

    .feedback {
      margin: 18px 0 0;
      border-radius: 14px;
      background: #fff7df;
      padding: 14px 16px;
      color: #5e512c;
      line-height: 1.55;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-top: 16px;
    }

    .progress {
      color: #555d6d;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .next {
      width: auto;
      border: 0;
      background: #20283a;
      padding-inline: 18px;
      color: white;
      text-align: center;
    }
  `;

  private choose(choice: string): void {
    this.selected = choice;
    this.dispatchEvent(
      new CustomEvent("rg-interaction", {
        bubbles: true,
        composed: true,
        detail: { widget: "concept-check", choice },
      }),
    );
  }

  private advance(): void {
    this.questionIndex =
      (this.questionIndex + 1) % this.questions.length;
    this.selected = null;
  }

  render() {
    const question = this.questions[this.questionIndex];
    const correct = question.correct;
    const feedback =
      this.selected === correct
        ? question.correctFeedback
        : question.incorrectFeedback;

    return html`
      <section class="card">
        <p class="label">Quick understanding check</p>
        <h3>${question.prompt}</h3>
        <div class="choices">
          ${question.choices.map(
            ([value, label]) => html`
              <button
                class=${this.selected === value
                  ? value === correct
                    ? "correct"
                    : "incorrect"
                  : ""}
                @click=${() => this.choose(value)}
              >
                ${label}
              </button>
            `,
          )}
        </div>
        ${this.selected
          ? html`<p class="feedback" role="status">${feedback}</p>`
          : null}
        <div class="footer">
          <span class="progress">
            ${this.questionIndex + 1} of ${this.questions.length}
          </span>
          ${this.selected
            ? html`
                <button class="next" @click=${this.advance}>
                  ${this.questionIndex === this.questions.length - 1
                    ? "Start again"
                    : "Next question"}
                </button>
              `
            : null}
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rg-concept-check": ConceptCheck;
  }
}
