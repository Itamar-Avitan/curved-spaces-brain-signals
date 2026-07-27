/**
 * Single source of truth for every technical term and formula on the page.
 *
 * Both `<rg-term>` (the click-to-explain popover) and `<rg-formula>` read from
 * here, so a term is written once and can never drift between the place it is
 * introduced, the place it is defined, and the glossary index.
 *
 * Formulas are composed as small HTML strings rather than rendered with KaTeX.
 * That keeps the Wix bundle a single self-contained file with no font assets to
 * host, which is the constraint the deployment actually has.
 */

export interface FormulaLegendItem {
  symbol: string;
  meaning: string;
}

export interface FormulaStep {
  /** The fragment of the expression being read, as plain text. */
  part: string;
  /** What that fragment does, in words a non-mathematician can follow. */
  says: string;
}

export interface Formula {
  /** Pre-composed math markup. Authored here, never from user input. */
  html: string;
  /** What each symbol means. Every symbol in `html` should appear here. */
  legend: FormulaLegendItem[];
  /** How you would read the whole thing out loud. */
  reading: string;
  /** The expression read inside-out, one fragment at a time. */
  steps?: FormulaStep[];
  /**
   * The same operation with real numbers.
   *
   * Any value here that a reader could check is pinned by
   * `src/glossary.worked.test.ts`, which recomputes it from `src/math/spd.ts`.
   * Write checked values to two decimals so the assertion is exact.
   */
  worked?: { lines: string[] };
}

export interface GlossaryEntry {
  /** How the term is written when it is the heading of the card. */
  term: string;
  /** One sentence, no jargon inside it. */
  plain: string;
  /** The formal name, when the plain phrasing is what appears in the prose. */
  formal?: string;
  formula?: Formula;
  /** Why an EEG person should care. Skip when it would be padding. */
  why?: string;
  /** Where on the page this is taught. */
  href?: string;
  hrefLabel?: string;
  /** Other entries worth reading next. */
  see?: string[];
}

/** Shorthand for the markup used inside formulas. */
const v = (name: string) => `<i>${name}</i>`;
const op = (name: string) => `<span class="op">${name}</span>`;

export const GLOSSARY: Record<string, GlossaryEntry> = {
  "covariance-matrix": {
    term: "Covariance matrix",
    plain:
      "A small table summarizing one trial: how much each channel moved, and how much each pair of channels moved together.",
    formula: {
      html: `${v("C")} = <span class="frac"><span>1</span><span>${v("n")} − 1</span></span> ${v("X")} ${v("X")}<sup>⊤</sup>`,
      legend: [
        { symbol: "<i>X</i>", meaning: "the trial: one row per channel, one column per time sample (mean removed)" },
        { symbol: "<i>n</i>", meaning: "how many time samples the trial contains" },
        { symbol: "⊤", meaning: "transpose — flip rows and columns" },
        { symbol: "<i>C</i>", meaning: "the result: channels × channels, not time × time" },
      ],
      reading:
        "Multiply the trial by its own transpose and divide by the sample count. Time disappears; what survives is the relationship between channels.",
      steps: [
        { part: "X Xᵀ", says: "Multiply the trial by its own transpose. Every entry becomes one channel dotted with another." },
        { part: "1 / (n − 1)", says: "Divide by the sample count so a longer trial does not look like a stronger one." },
      ],
      worked: {
        lines: [
          "Two channels, five samples, mean already removed:",
          "",
          "  X = [ 2  -1   0   1  -2 ]",
          "      [ 1  -2   1   2  -2 ]",
          "",
          "  X Xᵀ = [10  10]        C = X Xᵀ / 4 = [2.50  2.50]",
          "         [10  14]                       [2.50  3.50]",
          "",
          "Time is gone. Two channels in, a 2×2 table out —",
          "and it would still be 2×2 for a trial ten times longer.",
        ],
      },
    },
    why: "Motor imagery changes band power and how regions couple — both second-order effects. Covariance is exactly the summary that keeps those and throws away the rest.",
    href: "#eeg",
    hrefLabel: "See it built from a signal",
    see: ["spd", "off-diagonal"],
  },

  "off-diagonal": {
    term: "Off-diagonal entry",
    plain:
      "The cells away from the top-left-to-bottom-right line: how strongly two different channels move together.",
    why: "This is where the BCI signal mostly lives. Imagining a left-hand squeeze changes how motor-cortex electrodes couple, not just how loud each one is. On the picture, it is the tilt of the ellipse.",
    href: "#eeg",
    hrefLabel: "Turn the correlation slider",
    see: ["covariance-matrix"],
  },

  spd: {
    term: "Symmetric positive-definite (SPD)",
    plain:
      "A table that is mirrored across its diagonal and reports a positive amount of variation in every direction — the two rules every real covariance matrix obeys.",
    why: "The rules are what make the space interesting: you cannot move a covariance matrix in an arbitrary direction and still have a covariance matrix.",
    href: "#eeg",
    hrefLabel: "See the space they fill",
    see: ["spd-manifold", "covariance-matrix"],
  },

  "spd-manifold": {
    term: "SPD manifold",
    plain: "The collection of every valid covariance matrix, taken as a space in its own right — one trial is one point in it.",
    why: "Positivity confines that collection to a cone. The cone is the shape; how far apart two points in it are is a separate decision, and that decision is the whole subject.",
    href: "#eeg",
    hrefLabel: "See the cone",
    see: ["spd", "metric", "curvature"],
  },

  metric: {
    term: "Metric",
    plain: "A rule for how far apart two things are — a ruler you choose, not a fact you discover.",
    why: "Change the ruler and you change which trials count as similar, which changes every prediction the decoder makes. Picking it well is most of the work.",
    href: "#distance",
    hrefLabel: "Compare two rulers",
    see: ["affine-invariant", "geodesic"],
  },

  geodesic: {
    term: "Geodesic",
    plain: "The shortest route between two points that never leaves the space — the curved-space version of a straight line.",
    formula: {
      html: `${v("P")} #<sub>${v("t")}</sub> ${v("Q")} = ${v("P")}<sup>1/2</sup> (${v("P")}<sup>−1/2</sup> ${v("Q")} ${v("P")}<sup>−1/2</sup>)<sup>${v("t")}</sup> ${v("P")}<sup>1/2</sup>`,
      legend: [
        { symbol: "<i>P</i>, <i>Q</i>", meaning: "the two covariance matrices you are travelling between" },
        { symbol: "<i>t</i>", meaning: "how far along, from 0 at P to 1 at Q" },
        { symbol: "<i>P</i><sup>1/2</sup>", meaning: "the matrix square root — the matrix that squares to P" },
      ],
      reading:
        "Move to a viewpoint where P looks like the identity, take the plain power-t step there, then move back. Halfway means multiplying by the same factor twice, not adding the same amount twice.",
      steps: [
        {
          part: "P^(−1/2) · Q · P^(−1/2)",
          says: "Redraw Q in units where P is the unit circle. This is the whitening step, and it is the only reason the rest works.",
        },
        {
          part: "( … )^t",
          says: "Take t of the way there. t = 0 leaves you at P, t = 1 puts you at Q.",
        },
        {
          part: "P^(1/2) ( … ) P^(1/2)",
          says: "Undo the redrawing, so the answer lands back in the original units.",
        },
      ],
      worked: {
        lines: [
          "P = [4    0   ]        Q = [0.25  0]",
          "    [0    0.25]            [0     4]",
          "",
          "Both describe the same total strength:  det = 1.00",
          "",
          "Flat midpoint  ½(P + Q) = [2.125  0    ]     det = 4.52",
          "                          [0      2.125]",
          "",
          "Geodesic midpoint          = [1  0]          det = 1.00",
          "                             [0  1]",
          "",
          "The flat average invented 4.5× the strength that was in neither.",
        ],
      },
    },
    why: "Averaging two trials means finding the midpoint of this path. Take the straight-line midpoint instead and you invent variance neither trial had.",
    href: "#distance",
    hrefLabel: "Walk the path",
    see: ["swelling", "metric"],
  },

  "affine-invariant": {
    term: "Affine-invariant distance",
    plain:
      "The ruler that gives the same reading no matter how the recording was mixed, scaled, or re-referenced.",
    formula: {
      html: `${v("δ")}(${v("P")}, ${v("Q")}) = ‖ ${op("log")}(${v("P")}<sup>−1/2</sup> ${v("Q")} ${v("P")}<sup>−1/2</sup>) ‖<sub>F</sub> = <span class="sqrt">√</span><span class="under">Σ<sub>i</sub> ${op("log")}<sup>2</sup> ${v("λ")}<sub>i</sub></span>`,
      legend: [
        { symbol: "<i>P</i>, <i>Q</i>", meaning: "two covariance matrices" },
        { symbol: "<i>P</i><sup>−1/2</sup> <i>Q</i> <i>P</i><sup>−1/2</sup>", meaning: "Q seen from P's point of view — how Q differs from P, in P's own units" },
        { symbol: "<i>λ</i><sub>i</sub>", meaning: "the eigenvalues of that comparison: the stretch factor along each direction" },
        { symbol: "log", meaning: "the matrix logarithm, so a stretch of ×2 and a squeeze of ÷2 count as equally far" },
        { symbol: "‖·‖<sub>F</sub>", meaning: "add up the squares of all entries, take the square root" },
      ],
      reading:
        "Ask how much Q stretches or squeezes each direction relative to P, take the log of each of those factors, and combine them. Identical matrices give all ratios 1, all logs 0, distance 0.",
      steps: [
        { part: "P^(−1/2) Q P^(−1/2)", says: "Redraw Q in units where P is the unit circle." },
        { part: "log( … )", says: "How many doublings away from that unit circle you land." },
        { part: "‖ · ‖_F", says: "Add those doublings up, Pythagoras-style, into one number." },
      ],
      worked: {
        lines: [
          "P = [4    0   ]        Q = [0.25  0]",
          "    [0    0.25]            [0     4]",
          "",
          "  Riemannian δ  = 3.92        flat ‖P − Q‖ = 5.30",
          "",
          "Now rewire the amplifier — W = [1.6  0.7]",
          "                               [0    0.8]",
          "and replace each matrix with W C Wᵀ:",
          "",
          "  Riemannian δ  = 3.92        flat ‖P − Q‖ = 8.65",
          "      unchanged                    moved by 63%",
          "",
          "The brain did not change. Only one ruler agrees.",
        ],
      },
    },
    why: "The property in the name is the whole reason this works on EEG: volume conduction, electrode gain, and re-referencing all leave this number completely unchanged.",
    href: "#invariance",
    hrefLabel: "Try to move the number",
    see: ["congruence", "metric", "eigenvalue"],
  },

  congruence: {
    term: "Congruence",
    plain: "Sandwiching a matrix between some other matrix and its transpose — what every recording change does to your covariance.",
    formula: {
      html: `${v("C")} ⟼ ${v("W")} ${v("C")} ${v("W")}<sup>⊤</sup>`,
      legend: [
        { symbol: "<i>C</i>", meaning: "a covariance matrix from one trial" },
        { symbol: "<i>W</i>", meaning: "any invertible matrix describing how the channels got mixed" },
      ],
      reading: "Replace C with W times C times W-transpose.",
      steps: [
        { part: "W C Wᵀ", says: "Every hardware effect looks like this: re-referencing, electrode gain, volume conduction, whitening, a spatial filter. One family, one shape." },
        { part: "W invertible", says: "No information is destroyed — the recording is scrambled, not lost. That is exactly the case a good ruler should shrug off." },
      ],
    },
    why: "Volume conduction, the lead field, electrode gain, re-referencing, whitening, spatial filtering and session drift are all this one operation. That is why a single invariance property covers all of them at once.",
    href: "#invariance",
    hrefLabel: "See all three cases",
    see: ["affine-invariant", "recentering"],
  },

  swelling: {
    term: "Swelling",
    plain: "The trap where averaging two patterns entry by entry produces something stronger than either one was.",
    why: "A class center built that way is exaggerated, and the class center decides every prediction. It is the first of the two reasons not to use a straight-line ruler.",
    href: "#distance",
    hrefLabel: "Watch it inflate",
    see: ["geodesic", "riemannian-mean"],
  },

  "riemannian-mean": {
    term: "Riemannian mean",
    plain: "The one matrix that sits at the smallest total distance from all of a class's training trials.",
    formal: "Riemannian mean (also: Fréchet mean, Karcher mean)",
    formula: {
      html: `${v("M")} = ${op("arg min")}<sub>${v("M")}</sub> Σ<sub>i</sub> ${v("δ")}<sup>2</sup>(${v("M")}, ${v("C")}<sub>i</sub>)`,
      legend: [
        { symbol: "<i>C</i><sub>i</sub>", meaning: "the training trials for one class" },
        { symbol: "<i>δ</i>", meaning: "the affine-invariant distance" },
        { symbol: "arg min", meaning: "the M that makes the total as small as possible" },
      ],
      reading:
        "The mean is whatever minimizes the total squared distance to the examples — the same definition an ordinary average satisfies on a number line, with the distance swapped out.",
      steps: [
        { part: "Σᵢ δ²(M, Cᵢ)", says: "Add up the squared distance from a candidate centre to every trial." },
        { part: "argmin_M", says: "The centre is whichever M makes that total smallest. Non-positive curvature is what guarantees there is exactly one such M." },
      ],
      worked: {
        lines: [
          "Three trials:",
          "  C₁ = [4  0  ]   C₂ = [0.25  0]   C₃ = [1    0.5]",
          "       [0  0.25]       [0     4]        [0.5  1  ]",
          "",
          "Total squared distance to each candidate centre:",
          "",
          "  Riemannian centre   8.17     ← smallest, by definition",
          "  entry-wise average  10.37",
          "",
          "The flat average is not just differently placed.",
          "It is worse at the job a centre exists to do.",
        ],
      },
    },
    why: "There is no formula for it; you iterate. It converges to a single answer because this space curves the helpful way — geodesics spread apart rather than reconverging, so there is exactly one minimum.",
    href: "#mean",
    hrefLabel: "Compare two candidate centers",
    see: ["swelling", "mdm", "curvature"],
  },

  mdm: {
    term: "Minimum Distance to Mean (MDM)",
    plain:
      "Label a new trial by measuring it against each class centre and taking the nearest.",
    formal: "Minimum Distance to Mean",
    formula: {
      html: `${op("label")}(${v("C")}) = ${op("argmin")}<sub>${v("k")}</sub> δ(${v("C")}, ${v("M")}<sub>${v("k")}</sub>)`,
      legend: [
        { symbol: "<i>C</i>", meaning: "the new trial's covariance matrix" },
        { symbol: "<i>M<sub>k</sub></i>", meaning: "the stored centre of class k, one per class" },
        { symbol: "δ", meaning: "the affine-invariant distance — the same ruler used everywhere else" },
        { symbol: "argmin", meaning: "“whichever k makes this smallest”" },
      ],
      reading:
        "Measure the new trial against every class centre and return the label of the nearest one.",
      steps: [
        {
          part: "δ(C, M_k)",
          says: "One number per class: how far this trial is from that class's centre.",
        },
        {
          part: "argmin_k",
          says: "Pick the class with the smallest number. That is the whole decision — there is no boundary to learn.",
        },
      ],
      worked: {
        lines: [
          "Three 'left' trials  →  centre M_left",
          "Three 'right' trials →  centre M_right",
          "",
          "New trial C = [2.8  0.7]",
          "              [0.7  1.1]",
          "",
          "  δ(C, M_left )  =  0.17     ← nearest",
          "  δ(C, M_right)  =  1.78",
          "",
          "Decision: left.",
        ],
      },
    },
    why: "This is the decision a Riemannian BCI actually ships. Two stored matrices per class pair, one distance each, no boundary to fit — which is why it needs so little calibration data.",
    href: "#classifier",
    hrefLabel: "Watch it decide",
    see: ["riemannian-mean", "affine-invariant"],
  },

  "tangent-space": {
    term: "Tangent space",
    plain: "A flat set of coordinates laid over one small neighborhood of the curved space, so ordinary tools work again.",
    why: "Once each trial is a plain list of numbers, logistic regression, LDA or an SVM can take over. The geometry does its work during feature extraction; the classifier afterwards is completely ordinary.",
    href: "#tangent",
    hrefLabel: "Flatten a neighborhood",
    see: ["log-map", "recentering"],
  },

  "log-map": {
    term: "Log map",
    plain: "The step that turns a covariance matrix into a plain vector, measured relative to a chosen reference point.",
    formula: {
      html: `${op("Log")}<sub>${v("M")}</sub>(${v("C")}) = ${op("log")}(${v("M")}<sup>−1/2</sup> ${v("C")} ${v("M")}<sup>−1/2</sup>)`,
      legend: [
        { symbol: "<i>M</i>", meaning: "the reference point — in practice the Riemannian mean of the training set" },
        { symbol: "<i>C</i>", meaning: "the trial being converted" },
        { symbol: "log", meaning: "the MATRIX logarithm: rotate to the eigenvector frame, log each eigenvalue, rotate back — not the log of each entry" },
      ],
      reading:
        "View the trial from the reference point, then take the matrix log. The result is symmetric, so keeping its upper triangle loses nothing.",
      steps: [
        { part: "M^(−1/2) C M^(−1/2)", says: "Whiten by the reference. This is the step that puts the reference at the identity — the one point where a flat map is exact." },
        { part: "log( … )", says: "Flatten. Now you are on the map, not the surface." },
        { part: "upper triangle, off-diagonals × √2", says: "Read off the three independent numbers. The √2 is what makes the vector's ordinary length equal the Riemannian distance." },
      ],
      worked: {
        lines: [
          "Reference M = [2    0.3]     Trial C = [2.8  0.7]",
          "              [0.3  2  ]               [0.7  1.1]",
          "",
          "  whitened     [1.3736  0.2084]",
          "               [0.2084  0.5139]",
          "",
          "  log          [ 0.2958   0.2433]",
          "               [ 0.2433  -0.7077]",
          "",
          "  vector       ( 0.2958,  0.3441,  -0.7077 )",
          "                          ↑ off-diagonal × √2",
          "",
          "  its length            = 0.84",
          "  Riemannian δ(M, C)    = 0.84      identical, and that is the point:",
          "                                    ordinary tools now measure correctly.",
        ],
      },
    },
    why: "Take the upper triangle and multiply the off-diagonal entries by √2, and the vector's ordinary length equals the true Riemannian distance. Without that √2 the channel-coupling features — where the signal lives — get quietly shrunk.",
    href: "#tangent",
    hrefLabel: "See the flattening",
    see: ["tangent-space", "riemannian-mean"],
  },

  recentering: {
    term: "Re-centering",
    plain: "Whitening every trial in a session by that session's own average, so each session starts from the same place.",
    formula: {
      html: `${v("C")} ⟼ ${v("M")}<sup>−1/2</sup> ${v("C")} ${v("M")}<sup>−1/2</sup>`,
      legend: [
        { symbol: "<i>M</i>", meaning: "the Riemannian mean of that session's trials" },
        { symbol: "<i>C</i>", meaning: "each trial in the session" },
      ],
      reading: "Divide out the session's own average, in the matrix sense, so its mean lands on the identity.",
      steps: [
        { part: "M^(−1/2) C M^(−1/2)", says: "Whiten every trial in the session by that session's own mean." },
        { part: "the session mean itself", says: "…lands exactly on the identity. Every session now starts from the same place, and no labels were needed to do it." },
      ],
      worked: {
        lines: [
          "One session's trials C₁, C₂, C₃ → session mean M",
          "",
          "  recentre M by itself  =  [1  0]      exactly the identity",
          "                           [0  1]",
          "",
          "And nothing inside the session was damaged:",
          "",
          "  δ(C, C₁)                      = 0.18",
          "  δ(recentred C, recentred C₁)  = 0.18",
          "",
          "The sessions move. The structure inside them does not.",
        ],
      },
    },
    why: "This is itself a congruence, so it distorts nothing inside a session — and the shift between sessions is also a congruence, so it cancels. Both halves at once is what no Euclidean method can offer.",
    href: "#tangent",
    hrefLabel: "Where it comes up",
    see: ["congruence", "affine-invariant"],
  },

  curvature: {
    term: "Curvature",
    plain: "How much a space departs from being flat — and in which direction.",
    why: "Here it is non-positive and varies from place to place. That sign is the good one: geodesics spread apart rather than reconverging, so any two points are joined by exactly one shortest path and a class center is always unique. A sphere curves the other way and has neither property.",
    href: "#story",
    hrefLabel: "Where the analogy stops",
    see: ["geodesic", "riemannian-mean"],
  },

  eigenvalue: {
    term: "Eigenvalue",
    plain: "A direction's own stretch factor: how much the matrix scales things along one of its special axes.",
    why: "For a covariance matrix these are the lengths of the ellipse's axes. Positive-definite just means every one of them is above zero.",
    see: ["spd", "affine-invariant"],
  },

  csp: {
    term: "Common Spatial Patterns (CSP)",
    plain: "The classical approach: learn channel mixtures whose power differs most between the two classes, then classify on that power.",
    why: "A strong, standard baseline — not a strawman. Any honest comparison on this page includes it, and with plenty of calibration data it is hard to beat.",
    href: "#notebook",
    hrefLabel: "See it compared",
    see: ["mdm"],
  },

  "leave-one-group-out": {
    term: "Leave-one-group-out validation",
    plain: "Hold out an entire recording run for testing, never individual trials scattered through it.",
    why: "Trials from one run share drift, electrode positions and the user's state. Splitting them randomly lets the model recognize the run instead of the intention, and the score comes out flattering and wrong.",
    href: "#notebook",
    hrefLabel: "How the notebook tests",
  },

  potato: {
    term: "Riemannian potato",
    plain: "An automatic quality check: flag any trial whose covariance sits unusually far from a clean reference.",
    why: "The same representation that makes the decision also tells you when not to trust it — so a blink or a jaw clench gets skipped instead of decoded.",
    href: "#limits",
    hrefLabel: "Read the aside",
    see: ["affine-invariant"],
  },
};

export function lookup(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}

/** Keys in a stable, teaching-order sequence, for the glossary index. */
export const GLOSSARY_ORDER: string[] = [
  "covariance-matrix",
  "off-diagonal",
  "spd",
  "spd-manifold",
  "metric",
  "geodesic",
  "swelling",
  "affine-invariant",
  "congruence",
  "riemannian-mean",
  "mdm",
  "tangent-space",
  "log-map",
  "recentering",
  "curvature",
  "eigenvalue",
  "csp",
  "leave-one-group-out",
  "potato",
];
