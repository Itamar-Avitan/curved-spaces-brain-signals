# Page Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-sequence and rewrite the Riemannian EEG/BCI lesson page so that it reads as one argument — a trial is a shape, shapes live on a curved surface, flat arithmetic is wrong there — instead of ten correct sections stacked in the order they were built.

**Architecture:** Four new Lit custom elements plus an extension to the existing `<rg-formula>`, then a full rewrite of `index.html` into the running order and section template fixed by the spec. All maths comes from `src/math/spd.ts`; no number is ever typed by hand. The page's teaching claims are pinned by unit tests so a later "simplification" fails loudly instead of silently teaching something false.

**Tech Stack:** TypeScript 5.8, Lit 3.3, Vite 7, Vitest 3.2. No new dependencies.

**Spec:** [`docs/superpowers/specs/2026-07-27-page-flow-redesign-design.md`](../specs/2026-07-27-page-flow-redesign-design.md). Read §3.1, §4 and §5 before starting — they are the acceptance criteria.

**Companion plan:** `2026-07-27-notebook-realignment.md` runs after this one. It is the source of the numbers §4.4 quotes, so one copy block on this page stays provisional until that plan completes. Every task below marks it where relevant.

## Global Constraints

- **Section ids are preserved.** `#story`, `#eeg`, `#distance`, `#invariance`, `#mean`, `#classifier`, `#tangent`, `#transfer`, `#limits`, `#capstone`, `#notebook` must all still exist after the rewrite — `href` values in `src/glossary.ts` point at them. New ids: `#flat-map`, `#routes`, `#which`.
- **Headings state the answer, not the question.** The one exception is the hero. Exact heading text is fixed in spec §5 and repeated verbatim in each task below.
- **No hand-typed numbers.** Every numeric value shown to a reader is either rendered live by a widget from `src/math/spd.ts`, or is a string in `src/glossary.ts` pinned by the anti-drift test in Task 1.
- **The flat map is exact at the identity, nowhere else.** Spec §3.1. Any copy saying otherwise is a defect. `recenter(base, ·)` before any flat measurement.
- **`geodesic(p, q, t)` clamps `t` to [0, 1].** To travel beyond `q`, use `expMap(base, scaledTangent)`.
- **Laptop-first.** Do not extend `data-collapse-mobile` to new blocks. Phone must remain usable, not optimised.
- **No visual redesign.** Colours, fonts, and existing widget styling stay as they are.
- **Delete, don't comment out.** Removed blocks leave no commented corpse in `index.html`.
- Run `npm run test` and `npm run build` before every commit. Run `npm run audit:terms` before every commit that touches `index.html` or `src/glossary.ts`.

---

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `src/widgets/flat-map.ts` | `<rg-flat-map>` — §1.2. Drag two points apart; show surface distance vs flat-map distance diverging. |
| `src/widgets/flat-map.test.ts` | Pins spec §3.1: exact at the whitened base, diverging with separation, and **not** exact without whitening. |
| `src/widgets/case-file.ts` | `<rg-case-file step>` — the recurring one-decision strip, 5 placements. |
| `src/widgets/route-fork.ts` | `<rg-route-fork>` — the two-decoder fork diagram; `compact` and `active` variants. |
| `src/widgets/method-compare.ts` | `<rg-method-compare>` — 3-column matched comparison; replaces the `method-guide` section. |
| `src/glossary.worked.test.ts` | Anti-drift: recomputes every `worked` example from `src/math/spd.ts` and asserts the glossary strings match. |

**Modified**

| File | Change |
|---|---|
| `src/glossary.ts` | `Formula` gains `steps` + `worked`; all 7 existing formulas filled in; new `mdm` entry; `curvature.href` retargeted to `#flat-map`. |
| `src/widgets/formula.ts` | New `folded` property rendering the box as a closed `<details>` disclosure. |
| `src/predictions.ts` | New `tangent` prediction. |
| `src/main.ts` | Registers the four new widgets. |
| `index.html` | Rewritten into spec §5's order on spec §4's template. |
| `src/styles.css` | Styles for the new part/section shape; removal of rules for deleted blocks. |
| `scripts/audit-terms.mjs` | Also asserts every `href` in the glossary resolves to an id present in `index.html`. |

---

## Task 1: Folded, decoded formula boxes

**Files:**
- Modify: `src/glossary.ts:14-26` (the `Formula` interface)
- Modify: `src/widgets/formula.ts:14-20, 156-184`
- Test: `src/glossary.worked.test.ts` (create)

**Interfaces:**
- Consumes: `Sym2`, `determinant`, `euclideanInterpolate`, `geodesic` from `src/math/spd.ts`.
- Produces: `Formula.steps?: { part: string; says: string }[]`, `Formula.worked?: { lines: string[] }`, and `<rg-formula folded>`. Task 2 fills the data; Tasks 8–12 place the boxes.

- [ ] **Step 1: Write the failing test**

Create `src/glossary.worked.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";
import {
  determinant,
  euclideanInterpolate,
  geodesic,
  type Sym2,
} from "./math/spd";

/** Every checked value is written to 2 decimals, in the glossary and here. */
const fmt = (x: number) => x.toFixed(2);

const worked = (key: string) => {
  const w = GLOSSARY[key]?.formula?.worked;
  if (!w) throw new Error(`No worked example for "${key}"`);
  return w.lines.join("\n");
};

describe("worked examples do not drift from src/math/spd.ts", () => {
  it("geodesic: the flat midpoint swells and the geodesic one does not", () => {
    const A: Sym2 = [4, 0, 0.25];
    const B: Sym2 = [0.25, 0, 4];
    const text = worked("geodesic");

    expect(text).toContain(fmt(determinant(euclideanInterpolate(A, B, 0.5))));
    expect(text).toContain(fmt(determinant(geodesic(A, B, 0.5))));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/glossary.worked.test.ts`
Expected: FAIL with `No worked example for "geodesic"`.

- [ ] **Step 3: Extend the `Formula` interface**

In `src/glossary.ts`, replace the `Formula` interface:

```ts
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
```

- [ ] **Step 4: Add the geodesic worked example**

In `src/glossary.ts`, inside the `geodesic` entry's `formula` object, after `reading`:

```ts
      steps: [
        {
          part: "P₁^(−1/2) · P₂ · P₁^(−1/2)",
          says: "Redraw P₂ in units where P₁ is the unit circle. This is the whitening step, and it is the only reason the rest works.",
        },
        {
          part: "( … )^t",
          says: "Take t of the way there. t = 0 leaves you at P₁, t = 1 puts you at P₂.",
        },
        {
          part: "P₁^(1/2) ( … ) P₁^(1/2)",
          says: "Undo the redrawing, so the answer lands back in the original units.",
        },
      ],
      worked: {
        lines: [
          "P₁ = [4    0   ]        P₂ = [0.25  0]",
          "     [0    0.25]             [0     4]",
          "",
          "Both describe the same total strength:  det = 1.00",
          "",
          "Flat midpoint  ½(P₁ + P₂) = [2.125  0    ]   det = 4.52",
          "                            [0      2.125]",
          "",
          "Geodesic midpoint          = [1  0]          det = 1.00",
          "                             [0  1]",
          "",
          "The flat average invented 4.5× the strength that was in neither.",
        ],
      },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/glossary.worked.test.ts`
Expected: PASS.

- [ ] **Step 6: Add the `folded` rendering**

In `src/widgets/formula.ts`, add the property after `compact`:

```ts
  /** Render closed, behind a "Show the math" disclosure. */
  @property({ type: Boolean }) folded = false;
  /** Disclosure label suffix, e.g. "the path, decoded, with real numbers". */
  @property({ type: String }) summary = "";
```

Add to `static styles`, before the closing backtick:

```css
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

    .steps dd {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.55;
      color: #4a5265;
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
```

- [ ] **Step 7: Rewrite `render()`**

Replace `render()` in `src/widgets/formula.ts` with:

```ts
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
```

Add `GlossaryEntry` to the import from `../glossary`.

- [ ] **Step 8: Verify the build and the folded box in the browser**

Run: `npm run test && npm run build`
Expected: tests pass, `tsc --noEmit` clean, build succeeds.

Then `npm run dev`, and in `index.html` temporarily change the existing geodesic block to `<rg-formula key="geodesic" folded summary="the path, decoded, with real numbers"></rg-formula>`. Confirm: closed by default, opens on click, opens on Enter when focused, and the worked block scrolls horizontally rather than widening the page. Revert the temporary edit — Task 10 places it properly.

- [ ] **Step 9: Commit**

```bash
git add src/glossary.ts src/widgets/formula.ts src/glossary.worked.test.ts
git commit -m "Let a formula show its working, folded away until asked"
```

---

## Task 2: The remaining seven worked examples

**Files:**
- Modify: `src/glossary.ts`
- Test: `src/glossary.worked.test.ts:20+`

**Interfaces:**
- Consumes: `Formula.steps` / `Formula.worked` from Task 1.
- Produces: a `mdm` glossary entry with `term`, `plain`, `formal`, `formula`, `why`, `href: "#classifier"`. Tasks 11–12 reference `key="mdm"`.

All values below were computed from `src/math/spd.ts`. Do not retype them from
memory — the test recomputes them.

- [ ] **Step 1: Write the failing tests**

Append to `src/glossary.worked.test.ts`, and extend the import from `./math/spd` to add `congruence`, `distance`, `logMap`, `recenter`, `riemannianMean`, `tangentVector`, `totalSquaredDistance`, and `type Mat2`:

```ts
  it("covariance-matrix: the 2×2 table from a 2×5 trial", () => {
    // Recompute rather than trusting the string: C = X Xᵀ / (n − 1), n = 5.
    const X = [
      [2, -1, 0, 1, -2],
      [1, -2, 1, 2, -2],
    ];
    const dot = (a: number[], b: number[]) =>
      a.reduce((sum, value, i) => sum + value * b[i], 0);

    expect(dot(X[0], Array(5).fill(1))).toBe(0); // rows are already centred
    expect(dot(X[1], Array(5).fill(1))).toBe(0);

    const n = X[0].length;
    const c = (a: number[], b: number[]) => dot(a, b) / (n - 1);
    const text = worked("covariance-matrix");

    expect(text).toContain(fmt(c(X[0], X[0]))); // 2.50
    expect(text).toContain(fmt(c(X[0], X[1]))); // 2.50
    expect(text).toContain(fmt(c(X[1], X[1]))); // 3.50
  });

  it("congruence + affine-invariant: the ruler does not move, the flat one does", () => {
    const A: Sym2 = [4, 0, 0.25];
    const B: Sym2 = [0.25, 0, 4];
    const W: Mat2 = [1.6, 0.7, 0, 0.8];
    const frob = (p: Sym2, q: Sym2) =>
      Math.sqrt((p[0] - q[0]) ** 2 + 2 * (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2);

    const text = worked("affine-invariant");
    expect(fmt(distance(A, B))).toBe(fmt(distance(congruence(W, A), congruence(W, B))));
    expect(text).toContain(fmt(distance(A, B)));                                  // 3.92
    expect(text).toContain(fmt(frob(A, B)));                                      // 5.30
    expect(text).toContain(fmt(frob(congruence(W, A), congruence(W, B))));        // 8.65
  });

  it("riemannian-mean: the Riemannian centre beats the flat one on its own objective", () => {
    const set: Sym2[] = [[4, 0, 0.25], [0.25, 0, 4], [1, 0.5, 1]];
    const text = worked("riemannian-mean");
    const riem = totalSquaredDistance(riemannianMean(set), set);
    const flat = totalSquaredDistance(
      [(4 + 0.25 + 1) / 3, (0 + 0 + 0.5) / 3, (0.25 + 4 + 1) / 3],
      set,
    );
    expect(riem).toBeLessThan(flat);
    expect(text).toContain(fmt(riem));   // 8.17
    expect(text).toContain(fmt(flat));   // 10.37
  });

  it("mdm: the two distances, and which one wins", () => {
    const left: Sym2[] = [[3.0, 0.8, 1.0], [2.6, 0.6, 1.2], [3.4, 1.0, 0.9]];
    const right: Sym2[] = [[1.0, -0.5, 3.0], [1.2, -0.7, 2.7], [0.9, -0.4, 3.3]];
    const trial: Sym2 = [2.8, 0.7, 1.1];
    const text = worked("mdm");
    const dL = distance(trial, riemannianMean(left));
    const dR = distance(trial, riemannianMean(right));
    expect(dL).toBeLessThan(dR);
    expect(text).toContain(fmt(dL));   // 0.17
    expect(text).toContain(fmt(dR));   // 1.78
  });

  it("log-map: the √2 makes the vector length equal the distance", () => {
    const ref: Sym2 = [2, 0.3, 2];
    const trial: Sym2 = [2.8, 0.7, 1.1];
    const text = worked("log-map");
    const v = tangentVector(ref, trial);
    expect(Math.hypot(...v)).toBeCloseTo(distance(ref, trial), 12);
    expect(text).toContain(fmt(distance(ref, trial)));   // 0.84
  });

  it("recentering: the reference lands on the identity and distances survive", () => {
    const set: Sym2[] = [[3.0, 0.8, 1.0], [2.6, 0.6, 1.2], [3.4, 1.0, 0.9]];
    const mean = riemannianMean(set);
    const trial: Sym2 = [2.8, 0.7, 1.1];
    const moved = recenter(mean, mean);

    expect(moved[0]).toBeCloseTo(1, 12);
    expect(moved[1]).toBeCloseTo(0, 12);
    expect(moved[2]).toBeCloseTo(1, 12);
    expect(distance(trial, set[0])).toBeCloseTo(
      distance(recenter(mean, trial), recenter(mean, set[0])),
      12,
    );
    expect(worked("recentering")).toContain(fmt(distance(trial, set[0])));   // 0.18
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/glossary.worked.test.ts`
Expected: 6 failures, each `No worked example for "<key>"` (or, for `mdm`, a `GLOSSARY[...]` miss).

- [ ] **Step 3: Add the `mdm` glossary entry**

In `src/glossary.ts`, immediately after the existing `mdm` entry's current definition — replacing it, since it currently has no `formula`:

```ts
  mdm: {
    term: "Minimum Distance to Mean (MDM)",
    plain:
      "Label a new trial by measuring it against each class centre and taking the nearest.",
    formal: "Minimum Distance to Mean",
    formula: {
      html: `${op("label")}(${v("P")}) = ${op("argmin")}<sub>${v("k")}</sub> δ(${v("P")}, ${v("M")}<sub>${v("k")}</sub>)`,
      legend: [
        { symbol: "<i>P</i>", meaning: "the new trial's covariance matrix" },
        { symbol: "<i>M<sub>k</sub></i>", meaning: "the stored centre of class k, one per class" },
        { symbol: "δ", meaning: "the affine-invariant distance — the same ruler used everywhere else" },
        { symbol: "argmin", meaning: "“whichever k makes this smallest”" },
      ],
      reading:
        "Measure the new trial against every class centre and return the label of the nearest one.",
      steps: [
        {
          part: "δ(P, M_k)",
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
          "New trial P = [2.8  0.7]",
          "              [0.7  1.1]",
          "",
          "  δ(P, M_left )  =  0.17     ← nearest",
          "  δ(P, M_right)  =  1.78",
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
```

- [ ] **Step 4: Fill the remaining six worked examples**

`covariance-matrix.formula`:

```ts
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
```

`congruence.formula` — steps only, no worked block (its numbers live in
`affine-invariant`, which is the box the page actually shows):

```ts
      steps: [
        { part: "G P Gᵀ", says: "Every hardware effect looks like this: re-referencing, electrode gain, volume conduction, whitening, a spatial filter. One family, one shape." },
        { part: "G invertible", says: "No information is destroyed — the recording is scrambled, not lost. That is exactly the case a good ruler should shrug off." },
      ],
```

`affine-invariant.formula`:

```ts
      steps: [
        { part: "P₁^(−1/2) P₂ P₁^(−1/2)", says: "Redraw P₂ in units where P₁ is the unit circle." },
        { part: "log( … )", says: "How many doublings away from that unit circle you land." },
        { part: "‖ · ‖_F", says: "Add those doublings up, Pythagoras-style, into one number." },
      ],
      worked: {
        lines: [
          "P₁ = [4    0   ]        P₂ = [0.25  0]",
          "     [0    0.25]             [0     4]",
          "",
          "  Riemannian δ  = 3.92        flat ‖P₁ − P₂‖ = 5.30",
          "",
          "Now rewire the amplifier — G = [1.6  0.7]",
          "                               [0    0.8]",
          "and replace each P with G P Gᵀ:",
          "",
          "  Riemannian δ  = 3.92        flat ‖P₁ − P₂‖ = 8.65",
          "      unchanged                    moved by 63%",
          "",
          "The brain did not change. Only one ruler agrees.",
        ],
      },
```

`riemannian-mean.formula`:

```ts
      steps: [
        { part: "Σ_i δ(M, P_i)²", says: "Add up the squared distance from a candidate centre to every trial." },
        { part: "argmin_M", says: "The centre is whichever M makes that total smallest. Non-positive curvature is what guarantees there is exactly one such M." },
      ],
      worked: {
        lines: [
          "Three trials:",
          "  P₁ = [4  0  ]   P₂ = [0.25  0]   P₃ = [1    0.5]",
          "       [0  0.25]        [0     4]        [0.5  1  ]",
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
```

`log-map.formula`:

```ts
      steps: [
        { part: "R^(−1/2) P R^(−1/2)", says: "Whiten by the reference. This is the step that puts the reference at the identity — the one point where a flat map is exact." },
        { part: "log( … )", says: "Flatten. Now you are on the map, not the surface." },
        { part: "upper triangle, off-diagonals × √2", says: "Read off the three independent numbers. The √2 is what makes the vector's ordinary length equal the Riemannian distance." },
      ],
      worked: {
        lines: [
          "Reference R = [2    0.3]     Trial P = [2.8  0.7]",
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
          "  Riemannian δ(R, P)    = 0.84      identical, and that is the point:",
          "                                    ordinary tools now measure correctly.",
        ],
      },
```

`recentering.formula`:

```ts
      steps: [
        { part: "M^(−1/2) P M^(−1/2)", says: "Whiten every trial in the session by that session's own mean." },
        { part: "the session mean itself", says: "…lands exactly on the identity. Every session now starts from the same place, and no labels were needed to do it." },
      ],
      worked: {
        lines: [
          "One session's trials → session mean M",
          "",
          "  recentre M by itself  =  [1  0]      exactly the identity",
          "                           [0  1]",
          "",
          "And nothing inside the session was damaged:",
          "",
          "  δ(trial, first trial)              = 0.18",
          "  δ(recentred, recentred first)      = 0.18",
          "",
          "The sessions move. The structure inside them does not.",
        ],
      },
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/glossary.worked.test.ts`
Expected: PASS, 7 tests.

If any `toContain` fails, **do not edit the expected value in the test** — read the number the test computed and fix the glossary string. The test is the source of truth.

- [ ] **Step 6: Verify the whole suite and build**

Run: `npm run test && npm run build && npm run audit:terms`
Expected: all pass. `audit:terms` may now report `Minimum Distance to Mean` differently since the entry changed — it must still end with no "used before introduced" problems.

- [ ] **Step 7: Commit**

```bash
git add src/glossary.ts src/glossary.worked.test.ts
git commit -m "Give every formula its working, and give MDM a formula at all"
```

---

## Task 3: `<rg-flat-map>` — the missing intuition

**Files:**
- Create: `src/widgets/flat-map.ts`
- Create: `src/widgets/flat-map.test.ts`
- Modify: `src/main.ts:2` (add the import)

**Interfaces:**
- Consumes: `distance`, `expMap`, `recenter`, `type Sym2` from `src/math/spd.ts`.
- Produces: `<rg-flat-map>`, and the exported pure function
  `flatMapReadout(base: Sym2, direction: Sym2, separation: number): { riemannian: number; flat: number }`
  which Task 8 relies on for nothing, but the test pins.

**This is the task where spec §3.1 gets enforced.** The widget must whiten by
the base before taking the flat measurement. Without it the two readouts do not
agree at zero separation and the section teaches the opposite of its sentence.

- [ ] **Step 1: Write the failing test**

Create `src/widgets/flat-map.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { flatMapReadout, UNIT_DIRECTION } from "./flat-map";
import { distance, expMap, type Sym2 } from "../math/spd";

const IDENTITY: Sym2 = [1, 0, 1];
const OFF_BASE: Sym2 = [2.4, 0.6, 1.3];

const ratio = (base: Sym2, t: number) => {
  const { riemannian, flat } = flatMapReadout(base, UNIT_DIRECTION, t);
  return flat / riemannian;
};

describe("flat-map readout", () => {
  it("reports the separation it was asked for", () => {
    expect(flatMapReadout(IDENTITY, UNIT_DIRECTION, 1.7).riemannian).toBeCloseTo(1.7, 9);
    expect(flatMapReadout(OFF_BASE, UNIT_DIRECTION, 1.7).riemannian).toBeCloseTo(1.7, 9);
  });

  it("agrees with the curved ruler at the base point", () => {
    expect(ratio(IDENTITY, 0.01)).toBeCloseTo(1, 2);
    expect(ratio(OFF_BASE, 0.01)).toBeCloseTo(1, 2);
  });

  it("diverges, monotonically, as the points separate", () => {
    for (const base of [IDENTITY, OFF_BASE]) {
      expect(ratio(base, 4)).toBeGreaterThan(3);
      for (let t = 0.1; t < 4; t += 0.1) {
        expect(ratio(base, t + 0.1)).toBeGreaterThan(ratio(base, t));
      }
    }
  });

  it("is identical from any base point — because it whitens first", () => {
    for (const t of [0.01, 0.5, 1, 4]) {
      expect(ratio(OFF_BASE, t)).toBeCloseTo(ratio(IDENTITY, t), 9);
    }
  });

  it("REGRESSION: without whitening the claim is false, which is why we whiten", () => {
    // This is the bug the widget must never regress into. Measuring Frobenius
    // on the raw entries from a non-identity base does NOT agree at t → 0.
    const raw = (t: number) => {
      const far = expMap(OFF_BASE, [
        UNIT_DIRECTION[0] * t,
        UNIT_DIRECTION[1] * t,
        UNIT_DIRECTION[2] * t,
      ]);
      const frob = Math.sqrt(
        (OFF_BASE[0] - far[0]) ** 2 +
          2 * (OFF_BASE[1] - far[1]) ** 2 +
          (OFF_BASE[2] - far[2]) ** 2,
      );
      return frob / distance(OFF_BASE, far);
    };
    expect(raw(0.01)).toBeGreaterThan(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/flat-map.test.ts`
Expected: FAIL — cannot resolve `./flat-map`.

- [ ] **Step 3: Write the pure model**

Create `src/widgets/flat-map.ts` starting with the model only:

```ts
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { distance, expMap, recenter, type Sym2 } from "../math/spd";

/**
 * §1.2 — a flat map is exact where you centre it, and wrong by more the
 * further you go.
 *
 * The whitening in `flatMapReadout` is not an optimisation. The affine-invariant
 * metric equals the Frobenius one *at the identity and nowhere else*, so
 * measuring raw entries from an arbitrary base point disagrees even at zero
 * separation. `recenter(base, ·)` moves the base to the identity, which is
 * precisely what the tangent-space route and per-session re-centring do — the
 * same operation, three times, and this section is where the reader meets it.
 *
 * See `flat-map.test.ts` and spec §3.1.
 */

/** A tangent direction with both a scaling and a shear part, unit length. */
export const UNIT_DIRECTION: Sym2 = (() => {
  const raw: Sym2 = [0.6, 0.5, -0.4];
  const n = Math.sqrt(raw[0] ** 2 + 2 * raw[1] ** 2 + raw[2] ** 2);
  return [raw[0] / n, raw[1] / n, raw[2] / n];
})();

const frobenius = (a: Sym2, b: Sym2) =>
  Math.sqrt((a[0] - b[0]) ** 2 + 2 * (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

/**
 * Walk `separation` along a geodesic from `base` and measure the gap two ways.
 *
 * `expMap`, not `geodesic` — `geodesic` clamps t to [0, 1] and cannot travel
 * past its endpoint, and the interesting part of this demonstration is beyond 1.
 */
export function flatMapReadout(
  base: Sym2,
  direction: Sym2,
  separation: number,
): { riemannian: number; flat: number } {
  const far = expMap(base, [
    direction[0] * separation,
    direction[1] * separation,
    direction[2] * separation,
  ]);
  return {
    riemannian: distance(base, far),
    flat: frobenius(recenter(base, base), recenter(base, far)),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/flat-map.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the element**

Append to `src/widgets/flat-map.ts`:

```ts
const MAX_SEPARATION = 4;

@customElement("rg-flat-map")
export class RgFlatMap extends LitElement {
  @state() private separation = 0.4;

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
      padding: 22px 24px 24px;
    }

    .stage {
      display: block;
      width: 100%;
      height: auto;
      margin-bottom: 6px;
    }

    .readouts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      margin: 14px 0 4px;
    }

    .readout {
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 12px;
      padding: 12px 14px;
      background: #fdfaf3;
    }

    .readout span {
      display: block;
      font-size: 0.72rem;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      font-weight: 700;
      color: #6a7183;
      margin-bottom: 4px;
    }

    .readout strong {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.5rem;
      font-variant-numeric: tabular-nums;
    }

    .readout.curved strong {
      color: #1e5c58;
    }

    .readout.flat strong {
      color: #b03a2e;
    }

    .verdict {
      margin: 12px 0 0;
      font-size: 0.92rem;
      line-height: 1.6;
      color: #4a5265;
    }

    .verdict b {
      color: #20283a;
    }

    label {
      display: block;
      margin-top: 18px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5265;
    }

    input[type="range"] {
      width: 100%;
      margin-top: 8px;
      accent-color: #6c4eb9;
    }

    input[type="range"]:focus-visible {
      outline: 3px solid #6c4eb9;
      outline-offset: 4px;
    }
  `;

  private get readout() {
    return flatMapReadout([1, 0, 1], UNIT_DIRECTION, this.separation);
  }

  render() {
    const { riemannian, flat } = this.readout;
    const overstated = ((flat / riemannian - 1) * 100).toFixed(0);
    // Screen geometry only — the numbers above are the real content.
    const x = 60 + (this.separation / MAX_SEPARATION) * 300;

    return html`
      <div class="box">
        <svg
          class="stage"
          viewBox="0 0 460 200"
          role="img"
          aria-label=${`Two points on a curved surface separated by ${riemannian.toFixed(2)} measured on the surface and ${flat.toFixed(2)} measured on the flattened map.`}
        >
          <g stroke="rgba(46,53,74,.18)" fill="none">
            <path d="M20 150 Q230 96 440 150" />
            <path d="M20 122 Q230 66 440 122" />
            <path d="M20 178 Q230 126 440 178" />
          </g>
          <path
            d=${`M60 ${138 - 0} Q${(60 + x) / 2} ${112 - this.separation * 4} ${x} ${138 - this.separation * 2}`}
            stroke="#1e5c58"
            stroke-width="3.5"
            fill="none"
            stroke-linecap="round"
          />
          <line
            x1="60"
            y1="138"
            x2=${x}
            y2=${138 - this.separation * 2}
            stroke="#b03a2e"
            stroke-width="2"
            stroke-dasharray="6 5"
          />
          <circle cx="60" cy="138" r="7" fill="#6c4eb9" />
          <text x="60" y="176" font-size="11" text-anchor="middle" fill="#4a5265">
            where the map is centred
          </text>
          <circle cx=${x} cy=${138 - this.separation * 2} r="7" fill="#f4a261" />
        </svg>

        <div class="readouts">
          <div class="readout curved">
            <span>Measured on the surface</span>
            <strong>${riemannian.toFixed(2)}</strong>
          </div>
          <div class="readout flat">
            <span>Measured on the flat map</span>
            <strong>${flat.toFixed(2)}</strong>
          </div>
        </div>

        <p class="verdict" role="status">
          ${this.separation < 0.15
            ? html`Right next to the centre, the two rulers agree. <b>The flat map is exact here.</b>`
            : html`The flat map now overstates the gap by <b>${overstated}%</b>. It was exact at the centre and has been getting worse ever since.`}
        </p>

        <label>
          Drag the second point away from the centre
          <input
            type="range"
            min="0"
            max=${MAX_SEPARATION}
            step="0.01"
            .value=${String(this.separation)}
            @input=${(event: Event) => {
              this.separation = Number((event.target as HTMLInputElement).value);
            }}
          />
        </label>
      </div>
    `;
  }
}
```

- [ ] **Step 6: Register it**

In `src/main.ts`, after `import "./widgets/formula";`:

```ts
import "./widgets/flat-map";
```

- [ ] **Step 7: Verify**

Run: `npm run test && npm run build`
Expected: PASS and clean build.

Then `npm run dev` with `<rg-flat-map></rg-flat-map>` temporarily placed in `index.html`. Confirm: at slider 0 both readouts show the same number; dragging to the far end shows roughly 4.00 vs 23.47; the slider is reachable and operable by keyboard; the verdict line updates. Revert the temporary placement.

- [ ] **Step 8: Commit**

```bash
git add src/widgets/flat-map.ts src/widgets/flat-map.test.ts src/main.ts
git commit -m "Let the reader watch a flat map stop being accurate"
```

---

## Task 4: `<rg-case-file>` — the one decision, carried through

**Files:**
- Create: `src/widgets/case-file.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `<rg-case-file step="1|2|3|4|5">`. Tasks 9–13 place one per part. Steps 3 and 4 quote live numbers, which come from `src/math/spd.ts` inside this file — never from the surrounding prose.

- [ ] **Step 1: Create the element**

```ts
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { distance, riemannianMean, type Sym2 } from "../math/spd";

/**
 * The page's one concrete decision, revisited five times.
 *
 * One participant imagines squeezing the left hand or the right; the decoder
 * must output "left". Everything on the page serves that single decision, and
 * this strip is what makes that visible rather than asserted.
 *
 * Steps 3 and 4 show real distances computed here, so the numbers in the strip
 * cannot drift away from the numbers in the widgets beside it.
 */

const LEFT: Sym2[] = [
  [3.0, 0.8, 1.0],
  [2.6, 0.6, 1.2],
  [3.4, 1.0, 0.9],
];
const RIGHT: Sym2[] = [
  [1.0, -0.5, 3.0],
  [1.2, -0.7, 2.7],
  [0.9, -0.4, 3.3],
];
const TRIAL: Sym2 = [2.8, 0.7, 1.1];

const d = (set: Sym2[]) => distance(TRIAL, riemannianMean(set)).toFixed(2);

interface Beat {
  where: string;
  body: unknown;
}

const BEATS: Record<string, Beat> = {
  "1": {
    where: "after Part 2",
    body: html`The trial is now a 3×3 table of which electrodes moved together.
      We still cannot compare two of them.`,
  },
  "2": {
    where: "after Part 3",
    body: html`Now we can measure the gap between two trials, and rewiring the
      amplifier will not change the answer. We still have nothing to measure
      <em>against</em>.`,
  },
  "3": {
    where: "after Route 1",
    body: html`Two stored centres. The new trial sits <strong>${d(LEFT)}</strong>
      from the "left" centre and <strong>${d(RIGHT)}</strong> from the "right"
      one. Decision: <strong>left</strong>.`,
  },
  "4": {
    where: "after Route 2",
    body: html`Same trial, flattened onto the local map into three numbers, fed
      to ordinary logistic regression. Decision: <strong>left</strong>. Two
      routes, one answer, and neither is the "real" one.`,
  },
  "5": {
    where: "before the notebook",
    body: html`Both routes run for real in the notebook — on recorded EEG, with
      whole recording runs held out, and the accuracy reported honestly.`,
  },
};

@customElement("rg-case-file")
export class RgCaseFile extends LitElement {
  /** Which beat to show: "1" through "5". */
  @property({ type: String }) step = "1";

  static styles = css`
    :host {
      display: block;
      margin: 26px 0;
      font-family: "DM Sans", system-ui, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .strip {
      display: grid;
      grid-template-columns: minmax(0, max-content) 1fr;
      gap: 18px;
      align-items: center;
      border-left: 4px solid #f4a261;
      border-radius: 0 14px 14px 0;
      background: rgba(244, 162, 97, 0.09);
      padding: 15px 20px;
    }

    .tag {
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      color: #a8562a;
      line-height: 1.5;
    }

    .tag small {
      display: block;
      font-size: 0.78em;
      letter-spacing: 0.06em;
      text-transform: none;
      font-weight: 500;
      opacity: 0.72;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.62;
      color: #3a4152;
    }

    @media (max-width: 640px) {
      .strip {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `;

  render() {
    const beat = BEATS[this.step];
    if (!beat) return nothing;

    return html`
      <div class="strip">
        <p class="tag">
          The case
          <small>imagine left or right</small>
        </p>
        <p>${beat.body}</p>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Register it**

In `src/main.ts`, after the flat-map import:

```ts
import "./widgets/case-file";
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: `tsc --noEmit` clean, build succeeds.

Then `npm run dev` with all five steps temporarily placed in `index.html`. Confirm each renders, and that steps 3 and 4 read `0.17` and `1.78` — the same numbers the MDM worked example uses. Revert the temporary placement.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/case-file.ts src/main.ts
git commit -m "Carry one BCI decision through the whole page"
```

---

## Task 5: `<rg-route-fork>` — the two-decoder diagram

**Files:**
- Create: `src/widgets/route-fork.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `<rg-route-fork>` (full), `<rg-route-fork compact active="1">`, `<rg-route-fork compact active="2">`. Task 11 places all three.

- [ ] **Step 1: Create the element**

```ts
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * §4.0 — same covariance matrix, two ways out.
 *
 * The page's two decoders were previously separated by the invariance section,
 * so they never even looked adjacent. This is the picture that says they are
 * siblings: full size once, then compact at the head of each branch so the
 * reader always knows which one they are inside.
 */
@customElement("rg-route-fork")
export class RgRouteFork extends LitElement {
  /** Small variant for the head of a route. */
  @property({ type: Boolean }) compact = false;
  /** "1" or "2" — dims the branch you are not currently reading. */
  @property({ type: String }) active = "";

  static styles = css`
    :host {
      display: block;
      margin: 26px 0;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    .wrap {
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 18px;
      background: #fffdf8;
      padding: 24px;
    }

    :host([compact]) .wrap {
      padding: 14px 18px;
      background: #fdfaf3;
    }

    .source {
      max-width: 320px;
      margin: 0 auto 6px;
      border: 1px solid rgba(108, 78, 185, 0.45);
      border-radius: 12px;
      background: rgba(108, 78, 185, 0.07);
      padding: 11px 16px;
      text-align: center;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .stem {
      display: block;
      margin: 0 auto;
      width: 2px;
      height: 20px;
      background: rgba(46, 53, 74, 0.25);
    }

    .branches {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .branch {
      border: 1px solid rgba(46, 53, 74, 0.16);
      border-radius: 14px;
      padding: 16px 18px;
      background: #fdfaf3;
      transition: opacity 0.15s ease;
    }

    .branch.one {
      border-top: 4px solid #d99a2b;
    }

    .branch.two {
      border-top: 4px solid #2b8f8a;
    }

    .branch.dim {
      opacity: 0.42;
    }

    .kicker {
      font-size: 0.7rem;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .one .kicker {
      color: #a8722a;
    }

    .two .kicker {
      color: #1e5c58;
    }

    .headline {
      margin: 0 0 8px;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.06rem;
      line-height: 1.3;
    }

    .branch p {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.6;
      color: #4a5265;
    }

    :host([compact]) .source,
    :host([compact]) .stem,
    :host([compact]) .branch p {
      display: none;
    }

    :host([compact]) .branch {
      padding: 10px 14px;
    }

    :host([compact]) .headline {
      font-size: 0.95rem;
      margin: 0;
    }
  `;

  render() {
    const dim = (which: string) =>
      this.active && this.active !== which ? "dim" : "";

    return html`
      <div class="wrap">
        <p class="source">One trial's covariance matrix</p>
        <span class="stem" aria-hidden="true"></span>
        <div class="branches">
          <div class=${`branch one ${dim("1")}`}>
            <p class="kicker">Route 1</p>
            <p class="headline">Measure on the surface</p>
            <p>
              Keep one centre per class. Label a new trial by whichever centre
              is nearest. Nothing is flattened and nothing is fitted.
            </p>
          </div>
          <div class=${`branch two ${dim("2")}`}>
            <p class="kicker">Route 2</p>
            <p class="headline">Draw a local map first</p>
            <p>
              Flatten around a reference point so each trial becomes a short
              list of numbers, then hand it to any ordinary classifier.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Register it**

In `src/main.ts`:

```ts
import "./widgets/route-fork";
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: clean.

`npm run dev` with all three variants temporarily placed. Confirm the compact variant hides the source box and the descriptions, and that `active="1"` dims Route 2 only. Revert.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/route-fork.ts src/main.ts
git commit -m "Draw the fork the page has been implying"
```

---

## Task 6: `<rg-method-compare>` — the fork's payoff

**Files:**
- Create: `src/widgets/method-compare.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `<rg-method-compare>`. Task 11 places it at §4.3. It carries the content currently in the `method-guide` section of `index.html:805-830`, which Task 11 deletes.

Renders as a plain grid on desktop and collapses into a `<details>` below 900px — laptop-first, per the global constraints.

- [ ] **Step 1: Create the element**

```ts
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * §4.3 — "so which route?"
 *
 * Replaces the standalone method-guide section. Same content, but positioned as
 * the answer to the fork rather than as a table that appeared out of nowhere.
 * CSP + LDA is here as the baseline any credible BCI comparison needs.
 */

interface Column {
  key: string;
  name: string;
  needs: string;
  learns: string;
  decides: string;
  wins: string;
  watch: string;
}

const COLUMNS: Column[] = [
  {
    key: "one",
    name: "Route 1 · Riemannian MDM",
    needs: "One centre per class",
    learns: "Where each class sits",
    decides: "Nearest centre",
    wins: "Calibration is short, and you want to be able to explain the decision",
    watch: "A single centre cannot describe a class that is really two clusters",
  },
  {
    key: "two",
    name: "Route 2 · Tangent space",
    needs: "A reference point, then any classifier",
    learns: "A boundary in geometry-aware features",
    decides: "Whatever the classifier decides",
    wins: "You have enough data, and the classes need a more flexible separator",
    watch: "The reference point must be fitted inside each training fold, or you leak",
  },
  {
    key: "base",
    name: "Baseline · CSP + LDA",
    needs: "Two classes and a decent amount of calibration",
    learns: "Spatial filters with class-separating variance",
    decides: "A linear boundary on log-variance",
    wins: "Motor imagery, two classes, plenty of trials",
    watch: "Overfits with few trials, and must be fitted inside validation",
  },
];

const ROWS: { label: string; field: keyof Column }[] = [
  { label: "What it needs", field: "needs" },
  { label: "What it learns", field: "learns" },
  { label: "How it decides", field: "decides" },
  { label: "When it wins", field: "wins" },
  { label: "What to watch", field: "watch" },
];

@customElement("rg-method-compare")
export class RgMethodCompare extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: 26px 0;
      font-family: "DM Sans", system-ui, sans-serif;
      color: #20283a;
    }

    * {
      box-sizing: border-box;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(130px, max-content) repeat(3, 1fr);
      border: 1px solid rgba(46, 53, 74, 0.14);
      border-radius: 16px;
      overflow: hidden;
      background: #fffdf8;
    }

    .cell {
      padding: 13px 16px;
      border-bottom: 1px solid rgba(46, 53, 74, 0.09);
      font-size: 0.87rem;
      line-height: 1.55;
      color: #4a5265;
    }

    .cell.head {
      font-family: "Fraunces", Georgia, serif;
      font-size: 0.98rem;
      font-weight: 700;
      color: #20283a;
      background: #fdfaf3;
      border-bottom: 2px solid rgba(46, 53, 74, 0.18);
    }

    .cell.head.one {
      box-shadow: inset 0 4px 0 #d99a2b;
    }

    .cell.head.two {
      box-shadow: inset 0 4px 0 #2b8f8a;
    }

    .cell.head.base {
      box-shadow: inset 0 4px 0 rgba(46, 53, 74, 0.35);
    }

    .cell.label {
      font-weight: 600;
      color: #6a7183;
      background: #faf9f5;
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .grid > .cell:nth-last-child(-n + 4) {
      border-bottom: 0;
    }

    details {
      display: none;
    }

    @media (max-width: 900px) {
      .grid {
        display: none;
      }

      details {
        display: block;
        border: 1px solid rgba(46, 53, 74, 0.18);
        border-radius: 14px;
        background: #fffdf8;
        overflow: hidden;
      }

      summary {
        cursor: pointer;
        padding: 13px 18px;
        font-weight: 600;
        color: #4a3585;
      }

      .stack {
        padding: 0 18px 16px;
      }

      .stack section {
        border-top: 1px solid rgba(46, 53, 74, 0.12);
        padding: 12px 0;
      }

      .stack h4 {
        margin: 0 0 6px;
        font-family: "Fraunces", Georgia, serif;
        font-size: 1rem;
      }

      .stack dl {
        margin: 0;
        display: grid;
        gap: 6px;
      }

      .stack dt {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6a7183;
        font-weight: 700;
      }

      .stack dd {
        margin: 0 0 4px;
        font-size: 0.87rem;
        line-height: 1.55;
        color: #4a5265;
      }
    }
  `;

  render() {
    return html`
      <div class="grid" role="table" aria-label="Comparison of the two routes and the CSP baseline">
        <div class="cell head label" role="columnheader"></div>
        ${COLUMNS.map(
          (c) => html`<div class=${`cell head ${c.key}`} role="columnheader">${c.name}</div>`,
        )}
        ${ROWS.map(
          (row) => html`
            <div class="cell label" role="rowheader">${row.label}</div>
            ${COLUMNS.map(
              (c) => html`<div class="cell" role="cell">${c[row.field]}</div>`,
            )}
          `,
        )}
      </div>

      <details>
        <summary>Compare the three side by side</summary>
        <div class="stack">
          ${COLUMNS.map(
            (c) => html`
              <section>
                <h4>${c.name}</h4>
                <dl>
                  ${ROWS.map(
                    (row) => html`
                      <dt>${row.label}</dt>
                      <dd>${c[row.field]}</dd>
                    `,
                  )}
                </dl>
              </section>
            `,
          )}
        </div>
      </details>
    `;
  }
}
```

- [ ] **Step 2: Register it**

In `src/main.ts`:

```ts
import "./widgets/method-compare";
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: clean.

`npm run dev` with the element temporarily placed. Confirm the grid shows on a wide window and the `<details>` stack replaces it below 900px. Revert.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/method-compare.ts src/main.ts
git commit -m "Answer 'which route' where the question is actually asked"
```

---

## Task 7: A prediction for Route 2

**Files:**
- Modify: `src/predictions.ts:100+` (append to `PREDICTIONS`)

**Interfaces:**
- Consumes: `Prediction`, `PredictOption` (already defined).
- Produces: `PREDICTIONS.tangent`, used as `<rg-predict key="tangent">` in Task 11.

Route 1 has a predict prompt and a visible failure-then-fix; Route 2 has
neither. Without this the two routes do not read as equals.

- [ ] **Step 1: Add the prediction**

In `src/predictions.ts`, after the `invariance` entry and before `transfer`:

```ts
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
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/predictions.ts
git commit -m "Ask the reader to commit before Route 2 reveals itself"
```

---

## Task 8: Part 1 — history that carries the intuition

**Files:**
- Modify: `index.html:201-380` (the `part-math` divider, `#story`, `relativity-section`, `bridge-section`)
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `<rg-flat-map>` (Task 3), `<rg-formula folded>` (Task 1).
- Produces: `#flat-map` section id, used by `src/glossary.ts`'s `curvature` entry in Task 13.

**Deletes:** the `bridge-section` entirely; the `bci-lens` aside; the
`relativity-section`'s standalone section wrapper.

- [ ] **Step 1: Rewrite the part divider**

Replace `index.html:201-210` with:

```html
      <section id="part-math" class="part-divider math section-shell" aria-label="Part 1: Curved things break flat arithmetic">
        <span class="part-kicker">Part 1 of 5</span>
        <h2>Curved things break flat arithmetic</h2>
        <p>
          Not "space can bend" — that is the famous version and it is not the
          useful one. The useful version is what curvature does to ordinary
          sums and averages, because in Part 2 the thing being averaged is a
          brain recording.
        </p>
      </section>
```

- [ ] **Step 2: Rewrite §1.1**

Replace the `#story` section (`index.html:212-283`) with a section that keeps
`id="story"` and the existing `.history-track` markup verbatim — the four
`<article>` blocks with their SVGs are unchanged — but changes the heading,
the prose, and the four card captions.

Required heading, exactly:

```html
<h2>Gauss found this problem while surveying land.</h2>
```

The prose must make these four points, in this order, in continuous paragraphs
(no boxes):

1. Euclid's geometry assumes the space is flat, and for two thousand years that was the only geometry there was.
2. Gauss, running the Hanover land survey in the 1820s, proved something sharper than "surfaces can curve": curvature is measurable **from inside the surface**, without stepping outside it — and therefore **no flat map of a curved surface can keep all its distances right.** Every world map you have ever seen is lying about something, and it has to.
3. Riemann generalised it to spaces of any dimension — and, crucially, to spaces whose "points" are not places at all. (This is the sentence absorbed from the deleted bridge section.)
4. Einstein used it, which made it famous, and that fame is why most people meet this idea in the wrong order.

Re-caption the four history cards to say what each contributes:

| Card | New caption |
|---|---|
| Euclid | `Geometry that assumes flat.` |
| Gauss | `<rg-term key="curvature">Curvature</rg-term> is measurable from inside — so every flat map must lie.` |
| Riemann | `Any number of dimensions. And the "points" need not be places.` |
| Einstein | `The famous application — and the misleading one.` |

Keep `data-collapse-mobile="the four-step history"` on the track.

- [ ] **Step 3: Add §1.2**

Immediately after `#story`, insert:

```html
      <section id="flat-map" class="lesson-section section-shell">
        <p class="section-index">1.2</p>
        <h2>A flat map is exact where you centre it, and wrong by more the further you go.</h2>
        <p>
          That is the whole transferable idea, and it is worth more than the
          picture of a bending sheet. Flattening does not fail everywhere at
          once. It fails <em>gradually</em>, from a single point outward — and
          you get to choose the point.
        </p>
        <p>
          Drag the second point away from the centre below. At the centre the
          two rulers return the same number. They are not approximately equal
          there; they are equal. Then watch what happens as the gap grows.
        </p>
        <rg-flat-map></rg-flat-map>
        <p class="section-takeaway">
          Remember this one. It comes back twice: it is why one of the two BCI
          decoders in Part 4 works at all, and why the fix for tomorrow's
          recording session in §4.4 is a one-line change.
        </p>
      </section>
```

**Copy constraint (spec §3.1):** the heading says *where you centre it*. Do not
shorten it to "exact at one point" — the flat map is exact at the identity and
nowhere else, and the widget only agrees at the base because it whitens first.

- [ ] **Step 4: Demote the relativity section to §1.3**

Replace `index.html:285-369` (`relativity-section` and both its asides) with a
block inside the same section flow. Keep the entire `.spacetime-demo` SVG
verbatim. Delete the `bci-lens` aside. Required heading:

```html
<h2>Einstein's gravity is the most famous case of choosing a distance rule.</h2>
```

Three sentences of prose maximum: matter changes the geometry, objects follow
the straightest available path (`<rg-term key="geodesic">geodesic</rg-term>`),
and the rule that says how to measure a step is the
`<rg-term key="metric">metric</rg-term>`. Keep the `.metric-card`. Keep the
`.visual-caption`.

- [ ] **Step 5: Rewrite §1.4, the analogy boundary**

Replace the `analogy-boundary` aside with a section carrying this heading
exactly:

```html
<h2>Where the analogy stops: our surface bends the other way, and that is lucky.</h2>
```

Body must state, in prose:

- A globe and a gravity well have **positive** curvature. The space of covariance matrices, with the ruler Part 3 chooses, has **non-positive** curvature.
- Consequences, stated as a short list: exactly one shortest path between any two points; no cut locus; a class centre that always exists and is always unique; an algorithm that always converges. On a sphere none of these hold.
- The causal order, stated explicitly: *we need invariance → that forces this metric → that metric makes the space curved → the curvature is non-positive → therefore means and geodesics are unique → therefore the algorithms are simple.* Curvature is a cost that turns out to be a benefit. **It is not what makes the decoder accurate.**

Do **not** write "constant curvature" — it is non-constant here (κ ∈ [−1/4, 0]).

- [ ] **Step 6: Add the styles**

In `src/styles.css`, add rules for `.lesson-section`, `.section-index`, and
`.section-takeaway`, following the existing `.section-shell` conventions:

```css
.lesson-section {
  padding-block: clamp(48px, 6vw, 88px);
}

.section-index {
  margin: 0 0 10px;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  font-weight: 700;
  color: rgba(46, 53, 74, 0.42);
}

.lesson-section > h2 {
  max-width: 22ch;
  margin: 0 0 20px;
}

.lesson-section > p {
  max-width: 62ch;
  margin: 0 0 16px;
  line-height: 1.75;
}

.section-takeaway {
  max-width: 62ch;
  margin-top: 26px;
  padding-top: 14px;
  border-top: 2px solid var(--lemon, #ffd36b);
  font-weight: 600;
}
```

If `--lemon` is not a variable in this stylesheet, use the literal the rest of
the file uses for the same accent — check `src/styles.css` for the existing
eyebrow colours rather than inventing one.

- [ ] **Step 7: Verify**

Run: `npm run build && npm run audit:terms`
Expected: build clean; `audit:terms` reports no term used before it is introduced.

`npm run dev`, then read Part 1 top to bottom. Check: no `term-ladder` or
`lesson-purpose` box remains in Part 1; the four history captions changed; the
flat-map widget is present; §1.4 states the sign difference.

- [ ] **Step 8: Commit**

```bash
git add index.html src/styles.css
git commit -m "Rebuild Part 1 so the history earns its length"
```

---

## Task 9: Part 2 — a trial is a shape

**Files:**
- Modify: `index.html:382-488` (the `part-eeg` divider and `#eeg`)

**Deletes:** the four-article `.pipeline` strip (`index.html:429-480`) — it is
the third "here are the steps" strip on the page.

- [ ] **Step 1: Rewrite the divider**

```html
      <section id="part-eeg" class="part-divider eeg section-shell" aria-label="Part 2: An EEG trial is a shape">
        <span class="part-kicker">Part 2 of 5</span>
        <h2>An EEG trial is a shape, not a squiggle</h2>
        <p>
          Point that geometry at the brain. A few seconds of signal across many
          electrodes folds into one structured object — and that object, not
          the waveform, is what a modern decoder actually works with. Between
          2014 and 2016 pipelines built on it took first place in five
          international neural-decoding competitions, against fields of 260 to
          688 teams.
        </p>
      </section>
```

- [ ] **Step 2: Rewrite §2.1**

Keep `id="eeg"`. Required heading:

```html
<h2>One trial becomes a table of which electrodes moved together.</h2>
```

Prose requirements, in continuous paragraphs, replacing both the current
`reveal-heading` paragraph and the `lesson-purpose covariance-purpose` box:

- Instead of thousands of voltage samples, summarise how every pair of electrodes changes together — a `<rg-term key="covariance-matrix">covariance matrix</rg-term>`.
- The diagonal is how much each channel varies; the `<rg-term key="off-diagonal">off-diagonal</rg-term>` is how much they vary *together*, and that is where the motor signal lives.
- Say what to do with the widget: turn up the channel relationship and watch the ellipse tilt; that tilt *is* the off-diagonal number.
- These tables are symmetric and describe a real amount of variation in every direction — `<rg-term key="spd">symmetric positive-definite</rg-term>`.

Widget order, unchanged from today except the deleted strip:

```html
<rg-covariance-explorer></rg-covariance-explorer>
<rg-signal-covariance></rg-signal-covariance>
<rg-formula key="covariance-matrix" folded summary="the table, built from five samples by hand"></rg-formula>
```

- [ ] **Step 3: Rewrite §2.2**

Required heading:

```html
<h2>Not every table is possible, so they fill a curved cone.</h2>
```

Prose: positivity is a real constraint, not bookkeeping — push one off-diagonal
entry far enough and an eigenvalue goes negative, and the matrix stops
describing any possible recording. The valid ones fill a specific
region — the `<rg-term key="spd-manifold">SPD manifold</rg-term>` — and once a
distance rule is chosen on it, that region behaves as a curved space.

Then `<rg-cone-explorer></rg-cone-explorer>`, then a takeaway line, then:

```html
<rg-case-file step="1"></rg-case-file>
```

- [ ] **Step 4: Delete the pipeline strip**

Remove `index.html:429-480` entirely. Then remove the now-unused `.pipeline`,
`.pipeline-number`, `.pipeline-arrow`, and `.pipe-icon` rules from
`src/styles.css`.

- [ ] **Step 5: Verify**

Run: `npm run build && npm run audit:terms`
Expected: clean.

Then confirm by search that `class="pipeline"` appears nowhere in `index.html`
and `.pipeline` appears nowhere in `src/styles.css`:

```bash
grep -n "pipeline" index.html src/styles.css
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add index.html src/styles.css
git commit -m "Part 2: the object, without the third steps-strip"
```

---

## Task 10: Part 3 — which ruler, and why that one

**Files:**
- Modify: `index.html:490-537` (`part-use` divider, `#distance`)
- Move: `index.html:623-676` (`#invariance`) to directly after `#distance`

**Interfaces:**
- Consumes: `<rg-formula folded>`, `<rg-case-file>`.
- Produces: `#invariance` in its new position — **the id must not change**.

This is the move that makes the two decoders adjacent in Task 11.

- [ ] **Step 1: Rewrite the divider**

```html
      <section id="part-use" class="part-divider use section-shell" aria-label="Part 3: Which ruler">
        <span class="part-kicker">Part 3 of 5</span>
        <h2>Which ruler, and why that one</h2>
        <p>
          Every trial is now a point. Before anything can be averaged, compared
          or classified, one decision has to be made — how far apart two of
          these points are. The obvious answer is wrong in two separate ways,
          and the second one is the reason this whole approach exists.
        </p>
      </section>
```

- [ ] **Step 2: Rewrite §3.1**

Keep `id="distance"`. Required heading:

```html
<h2>The straight average invents strength that was in neither trial.</h2>
```

Prose replaces both the `distance-intro` paragraph and the `lesson-purpose`
box. It must:

- Explain *why we are averaging at all*: the average of a class's trials becomes the centre the decoder compares everything against, so getting it wrong poisons every prediction.
- State the failure concretely: average the tables cell by cell and the result is stronger than either input — both described a certain amount of activity, the average describes about four and a half times as much. `<rg-term key="swelling">Swelling</rg-term>.
- Name it as the flat map's arithmetic, calling back to §1.2 by name.
- Tell the reader what to watch: the relative area under each ellipse; one holds at 1.00 and one does not.
- **End by leaving the next question open**, in words close to: *this rules out the obvious ruler, but it does not tell us which one to use instead — and there is more than one curved ruler available.*

That last sentence is a requirement, not a flourish: §3.2 is only the keystone
if §3.1 visibly asks the question it answers (spec §13).

Widget order:

```html
<rg-predict key="swelling"></rg-predict>
<rg-distance-explorer></rg-distance-explorer>
<rg-formula key="geodesic" folded summary="the path you dragged, with real numbers"></rg-formula>
```

- [ ] **Step 3: Move and rewrite §3.2**

Cut the whole `#invariance` section and paste it immediately after `#distance`.
Keep `id="invariance"`. Required heading:

```html
<h2>Rewire the amplifier and the straight ruler changes its mind. This one does not.</h2>
```

Prose replaces the `lesson-heading` paragraph, the `term-ladder`, and the
`lesson-purpose invariance-purpose` box. It must:

- Answer §3.1's open question directly: *of the available rulers, pick the one that cannot see the recording chain.*
- Say what the recording chain does: volume conduction, the lead field, electrode gain, your choice of reference, whitening, spatial filtering, session drift — every one of them multiplies the covariance matrix on both sides by the same kind of invertible matrix, a `<rg-term key="congruence">congruence</rg-term>`.
- State the payoff: because the `<rg-term key="affine-invariant">affine-invariant</rg-term>` distance is blind to that whole family, you get much of the benefit of untangling the signal without ever untangling it.
- Tell the reader what to watch: try each preset and see which of the two numbers moves.

Keep the existing `invariance-note` aside content, folded into the prose or
kept as one aside — not both.

Widget order:

```html
<rg-predict key="invariance"></rg-predict>
<rg-invariance-explorer></rg-invariance-explorer>
<rg-formula key="affine-invariant" folded summary="the ruler that would not move, in numbers"></rg-formula>
<rg-case-file step="2"></rg-case-file>
```

- [ ] **Step 4: Verify the move did not orphan anything**

```bash
grep -n 'id="invariance"\|id="distance"\|key="invariance"\|key="swelling"' index.html
```
Expected: `#distance` appears before `#invariance`, and both `<rg-predict>` keys resolve.

Run: `npm run build && npm run audit:terms`
Expected: clean. If `audit:terms` now reports a term used before introduced, it
is because moving invariance earlier moved an `<rg-term>` introduction — fix by
moving the introduction, not by deleting the term.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Put invariance where the question is asked, not after the answer"
```

---

## Task 11: Part 4 — two ways to build a decoder

**Files:**
- Modify: `index.html` — `#mean`, `#classifier`, `#tangent`, `#transfer`, `method-guide`, `limits-section`

**Deletes:** the entire `method-guide` section (its content now lives in
`<rg-method-compare>`).

Order within Part 4: `#routes` → Route 1 (`#mean`, `#classifier`) → Route 2
(`#tangent`) → `#which` → `#transfer` → `#limits`.

- [ ] **Step 1: Add the Part 4 divider and the fork**

```html
      <section id="part-routes" class="part-divider use section-shell" aria-label="Part 4: Two ways to build a decoder">
        <span class="part-kicker">Part 4 of 5</span>
        <h2>Two ways to build a decoder</h2>
        <p>
          One representation, one ruler — and from here the field splits in
          two. Both routes are in real use, both are in the notebook, and
          neither is the "real" one.
        </p>
      </section>

      <section id="routes" class="lesson-section section-shell">
        <p class="section-index">4.0</p>
        <h2>Same covariance matrix, two ways out.</h2>
        <p>
          Route 1 never leaves the curved surface: it stores one centre per
          class and asks which is nearest. Route 2 flattens the neighbourhood
          into a local map first, and then any ordinary classifier can read it.
          Route 1 asks less of your data; Route 2 asks less of your geometry.
        </p>
        <rg-route-fork></rg-route-fork>
      </section>
```

- [ ] **Step 2: Rewrite Route 1**

Keep ids `mean` and `classifier`. Head the route with:

```html
<rg-route-fork compact active="1"></rg-route-fork>
```

§4.1a — required heading on `#mean`:

```html
<h2>A class centre is whatever sits at the smallest total distance from its examples.</h2>
```

Prose replaces the `lesson-heading` second column, the `term-ladder`, and the
`lesson-purpose mean-purpose` box. It must say: repeated trials of the same
class are similar but never identical; the centre must be built with the same
ruler that will later judge a new trial; the name for it is the
`<rg-term key="riemannian-mean">Riemannian mean</rg-term>`; and — calling back
to §1.4 — the reason there is exactly one such centre is the non-positive
curvature established there.

Keep the `model-scope-note` aside verbatim; it is still true and still needed.

```html
<rg-mean-explorer></rg-mean-explorer>
<rg-formula key="riemannian-mean" folded summary="what 'the centre' actually minimises"></rg-formula>
```

§4.1b — required heading on `#classifier`:

```html
<h2>To label a new trial, measure it against each centre and take the nearest.</h2>
```

Prose: that is the entire decision — no boundary is fitted, which is why it
needs so little calibration data. Name it
`<rg-term key="mdm">Minimum Distance to Mean</rg-term>`.

```html
<rg-mdm-playground></rg-mdm-playground>
<rg-formula key="mdm" folded summary="the decision, and the two distances it compares"></rg-formula>
<rg-case-file step="3"></rg-case-file>
```

- [ ] **Step 3: Rewrite Route 2**

Keep `id="tangent"`. Head with:

```html
<rg-route-fork compact active="2"></rg-route-fork>
```

Required heading:

```html
<h2>Flatten a local map first, and any ordinary classifier can read it.</h2>
```

Prose must:

- Connect explicitly to §1.2: this is the flat map from Part 1, and the reference point is where you centre it.
- Say the operation: whiten by the reference, take the log, read off the numbers — the `<rg-term key="log-map">log map</rg-term>` into the `<rg-term key="tangent-space">tangent space</rg-term>`.
- Say why the reference is chosen to be the mean of the data: it puts every trial as close as possible to the one place the map is exact.
- Say what it buys: each trial becomes a short vector, so LDA, logistic regression or an SVM can take over.

```html
<rg-predict key="tangent"></rg-predict>
<rg-tangent-explorer></rg-tangent-explorer>
<rg-formula key="log-map" folded summary="the step that turns a trial into a vector"></rg-formula>
<rg-case-file step="4"></rg-case-file>
```

- [ ] **Step 4: Add §4.3 and delete the method-guide section**

```html
      <section id="which" class="lesson-section section-shell">
        <p class="section-index">4.3</p>
        <h2>Which route? It depends on how much calibration you can ask for.</h2>
        <p>
          Route 1 stores a centre and compares. Route 2 fits a boundary in
          flattened coordinates. The first needs less from the user before it
          starts working; the second has more room to grow once data arrives.
          A credible study reports both against a strong task-specific
          baseline, which for motor imagery means
          <rg-term key="csp">CSP + LDA</rg-term>.
        </p>
        <rg-method-compare></rg-method-compare>
      </section>
```

Then delete `index.html:780-831` (the whole `method-guide` section), and remove
the now-unused `.method-guide`, `.method-table`, `.method-row`, and
`.method-purpose` rules from `src/styles.css`.

- [ ] **Step 5: Rewrite §4.4**

Keep `id="transfer"`. Required heading:

```html
<h2>Tomorrow's session breaks both — until you redraw the map around it.</h2>
```

Prose must:

- State the practical stake: a BCI that needs twenty minutes of recalibration every session is not a BCI anyone uses.
- Say the fix in §1.2's language: re-centre each session on its own mean, which puts every session's reference at the same place — the identity. That is the same `recenter` operation as the log map's first step and as the flat-map widget in Part 1. **Say that it is the same operation**, not that it is similar.
- Note that it needs no labels from the new session.

```html
<rg-predict key="transfer"></rg-predict>
<rg-transfer-explorer></rg-transfer-explorer>
<rg-formula key="recentering" folded summary="one line, and it needs no labels"></rg-formula>
```

**Provisional block.** Keep the existing `transfer-caveat` aside for now. The
companion notebook plan rewrites it once E3 has produced a real result. Mark it
in the HTML so it is not forgotten:

```html
<!-- PROVISIONAL: rewritten by 2026-07-27-notebook-realignment.md Task 6,
     once E2/E3 have executed and produced real numbers. -->
```

- [ ] **Step 6: Keep §4.5 as it is**

The `limits-section` and the `potato-note` aside move under Part 4 unchanged.
Change only the heading level context if needed; the content is correct and
stays. Add the section index `4.5`.

- [ ] **Step 7: Verify**

Run: `npm run build && npm run audit:terms && npm run test`
Expected: all clean.

```bash
grep -n "method-guide\|method-table\|method-row" index.html src/styles.css
```
Expected: no output.

Then check the id order is what Part 4 claims:

```bash
grep -n '^\s*<section id=' index.html
```
Expected order: `part-math`, `story`, `flat-map`, `part-eeg`, `eeg`, `part-use`, `distance`, `invariance`, `part-routes`, `routes`, `mean`, `classifier`, `tangent`, `which`, `transfer`, `limits`, `capstone`, `notebook`, `references`.

- [ ] **Step 8: Commit**

```bash
git add index.html src/styles.css
git commit -m "Part 4: make the two decoders siblings, not sequels"
```

---

## Task 12: Part 5 — do it yourself

**Files:**
- Modify: `index.html:911-1102` (`#notebook`)

**Deletes:** `.notebook-path`, `.concept-to-code`, and `.notebook-scope` —
three overlapping "what is in the notebook" blocks — replaced by one.

- [ ] **Step 1: Rewrite the arrival**

Keep `id="notebook"`. Required heading:

```html
<h2>You have the whole pipeline. Now run it on real brains.</h2>
```

Update the part kicker to `Part 5 of 5 · do it yourself`.

- [ ] **Step 2: Reword the concept check questions**

Open `src/widgets/concept-check.ts` and update the six questions so they use
the new vocabulary and cover the new emphases. Required coverage, one question
each:

1. What a covariance matrix summarises about a trial.
2. Why the entry-wise average of two trials is wrong.
3. Where a flattened map is accurate, and why. *(new — this is §1.2, and nothing currently tests it)*
4. What a congruence does, and which ruler ignores it.
5. Which of the two routes needs less calibration data, and why.
6. What re-centring does, and what it needs from the new session. *(answer: no labels)*

Keep the existing answer-explanation mechanism and its `<rg-term>` links.

- [ ] **Step 3: Merge the three strips into one**

Replace `.notebook-path`, `.concept-to-code`, and `.notebook-scope` with a
single block: three stages (see the EEG · build the space · test the BCI), each
naming the page section it continues. Keep
`data-collapse-mobile="the three notebook stages"` on it.

The page↔notebook mapping that `.concept-to-code` used to carry is replaced by
the two-way anchors added in the companion notebook plan — do not reintroduce a
mapping table here.

- [ ] **Step 4: Keep the results blocks and the CTA**

`.notebook-launch`, `.notebook-grid`, and `.geometry-contrast` stay. Their
numbers are re-verified by the companion notebook plan; do not edit them here.

Add at the end of the section:

```html
<rg-case-file step="5"></rg-case-file>
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run audit:terms && npm run test`

```bash
grep -n "notebook-path\|concept-to-code\|notebook-scope" index.html src/styles.css
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add index.html src/styles.css src/widgets/concept-check.ts
git commit -m "Part 5: one handoff block instead of three overlapping ones"
```

---

## Task 13: Hero, navigation, and the glossary's links

**Files:**
- Modify: `index.html:33-199` (hero, `chapter-map`, `learning-route`)
- Modify: `src/glossary.ts` (the `curvature` entry's `href`)
- Modify: `scripts/audit-terms.mjs`

- [ ] **Step 1: Retarget the hero headline**

Keep the entire `.hero-demo` SVG — the A→B geodesic against the mesh —
**unchanged**. Change only `.hero-eyebrow`, `<h1>`, and `.hero-lede`.

The `<h1>` becomes a question about the object rather than about paths. It is
the one deliberate exception to the answer-first rule (spec §5). Keep the
`.hero-ul` underline flourish on the emphasised phrase so the existing SVG
underline still has a target.

The lede must set up the spine in one sentence: a recording is not a waveform
but a shape, and the geometry that measures shapes is the same one that
survives a change of hardware.

Update the four `.nav-links` to the new parts: `#part-math` The idea ·
`#part-eeg` The object · `#part-use` The ruler · `#part-routes` The decoders ·
`#notebook` Do it.

- [ ] **Step 2: Update the chapter map to five parts**

```html
      <nav class="chapter-map" aria-label="Guide parts">
        <div class="section-shell">
          <a href="#part-math"><span>Part 1</span>Curved things break flat arithmetic</a>
          <a href="#part-eeg"><span>Part 2</span>A trial is a shape</a>
          <a href="#part-use"><span>Part 3</span>Which ruler</a>
          <a href="#part-routes"><span>Part 4</span>Two decoders</a>
          <a href="#notebook"><span>Part 5</span>Do it yourself</a>
        </div>
        <div class="chapter-progress" aria-hidden="true"><span></span></div>
      </nav>
```

Then check `src/chapter-progress.ts` — it tracks part sections and may hardcode
four. Update it to read the anchors from the nav rather than a fixed list, or
to the new five ids.

- [ ] **Step 3: Trim the learning route**

Delete the `.guide-parts` ordered list — it duplicates the nav directly above
it. Keep `.route-outcomes`, `.route-facts` and `.bci-example`.

Update the four outcome bullets to match the new argument. They must include:
what a covariance matrix is; where a flat map is accurate; the two routes and
which needs less calibration; what re-centring does.

Update `.route-facts` time estimate if the sections changed materially — check
it, do not assume 50 minutes still holds.

- [ ] **Step 4: Retarget the `curvature` glossary link**

In `src/glossary.ts`, the `curvature` entry currently has `href: "#story"`.
Change to:

```ts
    href: "#flat-map",
    hrefLabel: "Watch a flat map stop being accurate",
```

- [ ] **Step 5: Write the failing href check**

In `scripts/audit-terms.mjs`, after the existing `notMarkedUp` reporting block
and before the final summary, add:

```js
/** Every href in the glossary must point at an id that exists on the page. */
const ids = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
);
const brokenLinks = [];
for (const m of glossary.matchAll(/href:\s*"#([^"]+)"/g)) {
  if (!ids.has(m[1])) brokenLinks.push(m[1]);
}

if (brokenLinks.length) {
  console.log("Glossary links pointing at ids that do not exist:");
  for (const id of new Set(brokenLinks)) console.log(`  #${id}`);
  console.log("");
}
```

And extend the success line and the exit condition:

```js
if (!problems.length && !notMarkedUp.length && !brokenLinks.length) {
  console.log("No term is used before it is introduced, and every link resolves. ✓");
}

if (strict && (problems.length || brokenLinks.length)) process.exit(1);
```

- [ ] **Step 6: Run the audit to verify it catches real breakage**

Run: `npm run audit:terms`
Expected: no broken links reported.

Then deliberately break one to confirm the check works — temporarily change a
glossary `href` to `#does-not-exist`, re-run, confirm it is reported, and revert.

- [ ] **Step 7: Verify everything**

Run: `npm run test && npm run build:all && npm run audit:terms`
Expected: all clean, both build targets validated.

- [ ] **Step 8: Commit**

```bash
git add index.html src/glossary.ts src/chapter-progress.ts scripts/audit-terms.mjs
git commit -m "Five parts, a hero that asks the page's real question, and links that are checked"
```

---

## Task 14: The whole-page audit

**Files:**
- Modify: whatever the audit finds
- Create: `docs/superpowers/plans/2026-07-27-page-flow-redesign-audit.md`

This task exists because every individual section of this page was correct
before this plan started, and the page still failed. Part-level correctness is
not whole-level coherence. Do not skip it, and do not perform it in the same
sitting as Task 13 — read the whole page fresh.

- [ ] **Step 1: The heading-spine test**

Extract every section heading in document order and read them alone:

```bash
grep -oE '<h[12][^>]*>[^<]*' index.html | sed 's/<[^>]*>//g'
```

Write the output into the audit document. Then answer, in writing:

1. Do these alone answer "what is Riemannian geometry doing in a BCI?"
2. Is there any heading that states a topic rather than a claim?
3. Is there any adjacent pair where the second does not follow from the first?

Any "no" is a defect to fix in this task, not a note for later.

- [ ] **Step 2: The chrome-to-prose count**

```bash
grep -c 'class="lesson-purpose\|class="term-ladder' index.html
```
Expected: `0`. These were the boxes the redesign exists to remove.

```bash
grep -c '<rg-formula' index.html
```
Expected: `7`.

```bash
grep -c '<rg-case-file' index.html
```
Expected: `5`.

- [ ] **Step 3: The §3.1 claim audit**

Search every occurrence of the flat-map sentence and confirm each one names the
point:

```bash
grep -n -i "flat map\|local map\|exact at\|exact where" index.html
```

Every hit must be consistent with "exact where you centre it". Any phrasing
implying the raw Euclidean treatment is locally accurate at an arbitrary point
is a defect — see spec §3.1.

- [ ] **Step 4: Dead CSS sweep**

For each class removed by Tasks 9, 11 and 12, confirm no rule survives:

```bash
for c in pipeline pipe-icon method-guide method-table method-row method-purpose \
         notebook-path concept-to-code notebook-scope guide-parts bci-lens \
         analogy-boundary bridge-section bridge-question bridge-arrow; do
  printf '%-22s html:%s css:%s\n' "$c" \
    "$(grep -c "$c" index.html)" "$(grep -c "$c" src/styles.css)"
done
```

Expected: `0` in both columns for every class, except where a class was
deliberately kept (record any exception in the audit document with its reason).

- [ ] **Step 5: Keyboard and reading pass**

`npm run dev`, then with the keyboard only: Tab through the page from the top.
Confirm every `<rg-formula folded>` disclosure opens with Enter, the flat-map
slider responds to arrow keys, `<rg-method-compare>`'s mobile disclosure opens,
and focus is visible on all of them.

Then read the page end to end at 1440px as a reader, not an author. Record in
the audit document: every place the argument stalls, repeats itself, or asserts
something the reader has not been given yet.

- [ ] **Step 6: Fix what the audit found**

Work through the recorded defects. If a defect requires a decision rather than
a fix, record it in the audit document and raise it rather than guessing.

- [ ] **Step 7: Final verification**

Run: `npm run test && npm run build:all && npm run audit:terms`
Expected: all clean.

Confirm the Wix bundle still registers every tag, including the four new ones:

```bash
grep -o 'rg-[a-z-]*' dist/riemannian-eeg-widgets.js | sort -u
```
Expected: includes `rg-flat-map`, `rg-case-file`, `rg-route-fork`, `rg-method-compare`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Audit the page as one thing, and fix what that found"
```

---

## Self-Review

**Spec coverage.** Spec §2 spine → Tasks 8–12 headings. §3 controlling image →
Tasks 8, 11 (§4.2, §4.4 callbacks). §3.1 → Task 3 (widget + regression test),
Task 8 Step 3 copy constraint, Task 14 Step 3 audit. §4 template → Tasks 8–12,
verified in Task 14 Step 2. §5 running order → Tasks 8–13, id order verified in
Task 11 Step 7. §6 components → Tasks 3–6. §7 math layer → Tasks 1–2. §8 cuts →
Tasks 9, 11, 12, 13, swept in Task 14 Step 4. §9 notebook → companion plan.
§11 deliverables 1–3 → Tasks 1–13; deliverable 4 (notebook) and 5 (Wix port
guide) → companion plan. §12 acceptance → Task 14.

**Known gap, deliberate:** the `transfer-caveat` copy at §4.4 stays provisional
until the notebook plan runs, and is marked in the HTML. Spec §9.4 requires
this ordering — the page must not quote a result the notebook has not produced.

**Placeholder scan.** No "TBD", no "add appropriate error handling", no
"similar to Task N". The prose-writing steps specify exact headings, exact
takeaway placement, and an explicit list of the points each paragraph must
make — that is the correct granularity for copy, because the copy itself is the
deliverable, not the plan.

**Type consistency.** `flatMapReadout(base, direction, separation)` and
`UNIT_DIRECTION` are exported in Task 3 Step 3 and consumed under those exact
names in Task 3 Step 1. `Formula.steps` / `Formula.worked` are defined in Task 1
Step 3 and consumed in Task 1 Step 7's `renderBox` and Task 2's data. `fmt` and
`worked()` are defined in Task 1 Step 1 and reused in Task 2 Step 1.
`<rg-formula folded summary="…">` uses the `summary` property declared in Task 1
Step 6. `<rg-case-file step>` and `<rg-route-fork compact active>` match their
declarations in Tasks 4 and 5.
