import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("rg-concept-check")
export class ConceptCheck extends LitElement {
  @state() private selected: string | null = null;
  @state() private questionIndex = 0;

  private readonly questions = [
    {
      prompt:
        "Why not treat an EEG covariance matrix as an unrestricted list of numbers?",
      choices: [
        ["size", "It contains too many numbers."],
        [
          "geometry",
          "Only specially structured tables are valid, so they form their own curved space.",
        ],
        ["frequency", "It only represents high-frequency EEG."],
      ],
      correct: "geometry",
      correctFeedback:
        "Exactly. The table must stay symmetric and must describe a valid amount of variation in every direction. Those constraints give the collection of valid tables its own shape.",
      incorrectFeedback:
        "Not quite. The important point is that not every table of numbers is a valid covariance matrix. Its built-in constraints determine how it should be compared.",
    },
    {
      prompt: "Why use a Riemannian mean for one BCI class?",
      choices: [
        ["speed", "It always makes training instantaneous."],
        [
          "center",
          "It defines the class center using distances that respect the covariance-matrix space.",
        ],
        ["channels", "It removes all noisy EEG channels automatically."],
      ],
      correct: "center",
      correctFeedback:
        "Correct. The Riemannian mean is the curved-space center of the class trials, making it a meaningful prototype for later distance comparisons.",
      incorrectFeedback:
        "Not quite. The mean summarizes a class using the chosen geometry; it does not automatically remove noise or eliminate training.",
    },
    {
      prompt: "How does Minimum Distance to Mean classify a new trial?",
      choices: [
        ["largest", "It chooses the class with the largest covariance matrix."],
        ["nearest", "It chooses the class whose Riemannian mean is closest."],
        ["latest", "It chooses whichever class was trained most recently."],
      ],
      correct: "nearest",
      correctFeedback:
        "Correct. MDM measures the new covariance matrix against every learned class mean and returns the nearest one.",
      incorrectFeedback:
        "Not quite. MDM uses geometric distance to the learned class centers; matrix size and training order are not the decision rule.",
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
