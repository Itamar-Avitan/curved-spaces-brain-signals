/**
 * Predict-before-you-reveal prompts.
 *
 * Every interaction on the page is exploratory: you drag something and watch
 * what happens. Committing to an answer first is what turns watching into
 * remembering, and it costs one click. Kept here rather than in the widgets so
 * the wording sits with the rest of the teaching copy.
 */

export interface PredictOption {
  label: string;
  /** Shown after choosing. Wrong answers get a reason, not just a cross. */
  response: string;
  correct?: boolean;
}

export interface Prediction {
  question: string;
  hint?: string;
  options: PredictOption[];
}

export const PREDICTIONS: Record<string, Prediction> = {
  swelling: {
    question:
      "Two patterns, equally strong, pointing different ways. Before you drag: how strong is the pattern halfway between them, if you just average the numbers?",
    hint: "“Strength” here means the overall amount of variation — the area of the ellipse.",
    options: [
      {
        label: "Stronger than either one",
        response:
          "Right — and that is the trap. Averaging entry by entry invents variation that neither trial contained. A class center built this way is exaggerated, and the class center decides every prediction.",
        correct: true,
      },
      {
        label: "Exactly as strong as both",
        response:
          "That is what you would want, and what the geometry-aware route actually delivers. Plain entry-wise averaging does not: watch the relative area climb past 1.00 as you drag.",
      },
      {
        label: "Weaker than either one",
        response:
          "It goes the other way. Entry-wise averaging inflates rather than shrinks — drag the slider and watch the area pass 1.00.",
      },
    ],
  },

  invariance: {
    question:
      "You change nothing about the brain — only the amplifier. Which distance between two trials changes?",
    options: [
      {
        label: "The straight-line one only",
        response:
          "Exactly. The affine-invariant distance is defined so that this whole family of recording changes leaves it alone. That is the property the method is named after, and the reason it survives real hardware.",
        correct: true,
      },
      {
        label: "Both of them",
        response:
          "The straight-line one does move — a lot. The Riemannian one does not move at all, by construction. Try each preset and watch the second number stay put.",
      },
      {
        label: "Neither — the brain didn't change",
        response:
          "That is the intuition we want, but only one ruler actually honours it. The straight-line distance confuses a hardware change with a change of mind; watch it swing.",
      },
    ],
  },

  tangent: {
    question:
      "You flatten every trial onto one local map and hand the result to plain logistic regression. Where is that map most accurate?",
    hint: "The map is built around one chosen reference point.",
    options: [
      {
        label: "Near the reference point",
        response:
          "Right — and that is the whole design. The map is exact at the reference and drifts further out, which is why the reference is chosen to be the mean of your data: it puts every trial as close to the accurate part as possible.",
        correct: true,
      },
      {
        label: "Everywhere equally",
        response:
          "That would be lovely and it is exactly what curvature forbids. Flattening always distorts; the only choice you get is where the distortion is zero. Part 1's slider is the same fact.",
      },
      {
        label: "Near the class centres",
        response:
          "Only if a class centre happens to be the reference. The accuracy follows the reference point, not the labels — which is why this route works even before you know any labels.",
      },
    ],
  },

  transfer: {
    question:
      "A decoder trained on Monday, used on Tuesday after the headset shifted. Two classes. What does it score?",
    options: [
      {
        label: "About 50% — no better than guessing",
        response:
          "That is what a big enough shift does, and it is why calibration-free BCI is hard. Now press re-center: the same decoder, the same data, back up near the ceiling.",
        correct: true,
      },
      {
        label: "Slightly below its same-day score",
        response:
          "Push the drift slider to the top. A session shift is not a small perturbation — it can move the trials clean out of the region the decoder learned, all the way down to chance.",
      },
      {
        label: "The same as its same-day score",
        response:
          "Only if nothing moved. Slide the drift up and watch the score fall — then re-center and watch it come back.",
      },
    ],
  },
};
