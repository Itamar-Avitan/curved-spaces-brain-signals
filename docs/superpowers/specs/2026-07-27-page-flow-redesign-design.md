# Flow redesign — Curved Spaces, Brain Signals

Companion to [`REVIEW.md`](../../../REVIEW.md) and
[`REVISION_PLAN.md`](../../../REVISION_PLAN.md). Those two took the page from
*wrong* to *correct*. This one takes it from *correct* to *understood*.

---

## 1. The problem

Every task in `REVISION_PLAN.md` shipped except **Phase 6 — Re-sequence**. The
progress table lists T6.2, but T6.1 (rebalance Part 1) and T6.3 (the running
order) were never done. Every fix since then was added *in place*.

The result is a page of individually correct sections that were never ordered
into an argument. The reader's report:

> I have all those big titles and some word here and there and not understand
> really the idea of Riemannian geometry used in BCI.

Four failures, confirmed:

1. **No through-line.** Ten mini-lessons stacked, not one argument built.
2. **Chrome over prose.** Each section is eyebrow + `<h2>` + one thin paragraph
   + term-ladder box + "sentence to leave with" box + widget + formula block:
   four label blocks wrapping roughly 55 words of actual explanation.
3. **No concrete BCI problem.** The `bci-example` box appears once in the route
   section and never returns. Nothing is ever decoded end to end before the
   notebook.
4. **Part 1 sets up the wrong model.** Euclid → Gauss → Riemann → Einstein plus
   a gravity well is beautiful and teaches curvature *backwards* — a gravity
   well has positive curvature and the SPD cone has non-positive curvature, and
   every convenient property of the latter follows from that sign.

Plus two the reader added:

5. **The math never lands** for readers who are helped by math.
6. **MDM and tangent space don't read as two decoders** — they read as one
   lesson followed by an unrelated one.

**Non-obvious cause of #6:** the invariance section physically sits *between*
them, so on the page they are not even adjacent.

## 2. The spine

> **An EEG trial is not a squiggle. It is a shape — which electrodes moved
> together — and shapes live on a curved surface where flat arithmetic gives
> wrong answers.**

Object-first. Curvature is the headline, not a side effect. Every section must
be able to name which clause of that sentence it advances; if it cannot, it is
decoration and gets cut or moved.

Consequence: **invariance is no longer a standalone keystone.** It becomes the
answer to the question §3.1 leaves open — *which* curved ruler? — which is a
stronger position for it than the bolted-on one it has now.

## 3. The controlling image: the map and the globe

The gravity well is demoted. The load-bearing metaphor becomes **a flat map of
a curved surface**, chosen because it is not a metaphor at all — it is the same
mathematics, and it stays true at every point the page uses it.

| Page moment | What the image says | Why it is literally true |
|---|---|---|
| §1.1 Gauss | You cannot flatten a curved surface without distorting distances. Gauss proved it *while running the Hanover land survey*. | Theorema Egregium (1827): Gaussian curvature is intrinsic, so no distance-preserving map exists between surfaces of different curvature. A plane has K = 0. |
| §1.2 | A flat map is exact at **one** point and wrong by more the further you go — and *you choose which point*. | The affine-invariant metric at *P* is ⟨A,B⟩\_P = tr(P⁻¹AP⁻¹B). At *P* = I this **equals** the Frobenius (Euclidean) inner product; away from I it does not. See §3.1 — this is exact, verified, and stricter than it first looks. |
| §3.1 swelling | Cell-by-cell averaging *is* the flat map's arithmetic. | Same fact, applied to the midpoint. |
| §4.2 tangent space | Draw a local map, centred where you're standing; flat tools work on it. | The log map is exactly a chart; "accurate near the base point" is exactly why it is used. |
| §4.4 re-centring | Redraw the map with today's session at the centre. | Re-centring moves the base point to the session mean. |
| §4.1 MDM | Or skip the map and measure on the globe. | MDM never leaves the manifold. |

**§1.2's sentence is the highest-leverage sentence on the page.** It is stated
once in Part 1 and cashed three times: at §4.2 (why tangent space works), at
§4.4 (why re-centring works), and in the notebook (where it is *measured*).

### 3.1 The precise form of the claim — verified, and stricter than it looks

Measured against `src/math/spd.ts`, walking out along a unit-speed geodesic and
comparing Frobenius distance on the raw entries against affine-invariant
distance:

| Base point | ratio at *t* = 0.01 | at *t* = 1 | at *t* = 4 |
|---|---|---|---|
| **A.** identity | **1.001** | 1.304 | 5.867 |
| **B.** [2.4, 0.6, 1.3], raw entries | **2.225** | 3.292 | 15.614 |
| **C.** same base, whitened by it first | **1.001** | 1.304 | 5.867 |

Row B is the trap. The flat map is **not** exact at an arbitrary point — it is
exact at the **identity**, and nowhere else. A looser phrasing ("pick any
reference and the flat map is accurate near it") is false, and would have
shipped as another F3-class error.

Row C is the payoff, and it makes the page stronger rather than weaker:

> **Whitening your data by a reference point *is* the map projection, and the
> reference is the one place the map is exact.**

C is numerically *identical* to A, to every digit. So §1.2, §4.2 and §4.4 are
not one idea illustrated three times — they are the **same operation** applied
three times: `recenter(reference, ·)` in `src/math/spd.ts`. The tangent-space
route whitens by the reference before flattening for exactly this reason, and
re-centring per session is exactly this operation with the session mean as the
reference.

**Copy requirement.** Wherever §1.2's sentence appears, it must name the point:
*exact where you centre it.* Never "exact at one point" without saying which,
and never implying the raw Euclidean treatment is locally fine anywhere other
than the identity.

**Implementation note.** `geodesic(p, q, t)` clamps *t* to [0, 1], so it cannot
walk past *q*. Anything that needs to travel further out — the §1.2 widget, and
any test sweeping distance — must use `expMap(base, scaledTangent)`.

### Where the analogy stops — §1.4, rewritten

The current card stops the analogy on the axis a reader can already guess
("this isn't real spacetime"). It must stop it on the axis they cannot:

> **The surface we are about to build bends the opposite way from a globe.**

| Globe / gravity well (κ > 0) | SPD cone, affine-invariant metric (κ ≤ 0) |
|---|---|
| Geodesics between antipodes are non-unique | **Exactly one** geodesic between any two points |
| Has conjugate points and a cut locus | Neither |
| Geodesics reconverge | Geodesics diverge |
| Fréchet mean need not be unique | Fréchet mean **always exists and is unique** |
| Compact, finite | Non-compact, infinite, no boundary |

This is not trivia. It is why "the class centre" in Part 4 is a well-defined
object rather than an act of faith, and why the algorithm that finds it
converges. Two precision notes for whoever writes this card: curvature here is
**non-constant** (κ ∈ [−1/4, 0] by Pennec's sectional-curvature computation) —
"constant curvature" is an error that circulates in the literature — and the
causal chain is *invariance requirement → forces this metric → metric makes the
space curved → curvature is non-positive → therefore means and geodesics are
unique → therefore the algorithms are simple and stable.* Curvature is a cost
that turns out to be a benefit, not the mechanism. A reader who leaves thinking
"curvature improves accuracy" has been failed even if every sentence was true.

## 4. Section template

Every teaching section is rebuilt to one shape:

```
small index         3.1
DECLARATIVE HEADING The straight average invents strength that was in neither trial.
prose               3–4 short paragraphs of continuous explanation (~140 words)
widget              the interactive, with its predict prompt merged into the flow
caption             one line naming what just happened
▸ folded math       closed by default
takeaway            one line above a thin rule
```

**Removed everywhere:** the `term-ladder` box (6×) and the `lesson-purpose`
box (7×). Their content moves into the prose; formal names become inline
`<rg-term>` popovers, which is what that component is for.

**Headings state the answer, not the question.** This is the through-line fix:
scrolling the headings alone must read as one argument. The full heading spine
is §5 below — it is the acceptance test for this whole document.

Label blocks per section: **4 → 1**. Explaining prose per section: **~55 → ~140
words**.

## 5. Running order

Five parts. Read the headings in sequence; that is the argument.

```
HERO                  unchanged graphic; headline becomes a question about the object
                      "What is an EEG trial, really?"
                      [the one deliberate exception to §4's answer-first rule:
                       it is the question the whole page exists to answer]

PART 1  Curved things break flat arithmetic
 1.1  Gauss found the problem while surveying land: no flat map keeps
      every distance right.                          [3 sections + bridge → 1]
 1.2  A flat map is exact at one point, and wrong by more the further
      you go.                                        [NEW · <rg-flat-map>]
 1.3  Einstein's gravity is the most famous case of choosing a distance
      rule.                                          [section → one block]
 1.4  Where the analogy stops: our surface bends the other way, and that
      is lucky.                                      [rewritten]

PART 2  An EEG trial is a shape, not a squiggle
 2.1  One trial becomes a table of which electrodes moved together.
      <rg-covariance-explorer> · <rg-signal-covariance>
 2.2  Not every table is possible, so they fill a curved cone.
      <rg-cone-explorer>
      → case file 1

PART 3  Which ruler, and why that one
 3.1  The straight average invents strength that was in neither trial.
      <rg-predict key="swelling"> · <rg-distance-explorer>
 3.2  Rewire the amplifier and the straight ruler changes its mind.
      This one does not.                             [MOVED from after MDM]
      <rg-predict key="invariance"> · <rg-invariance-explorer>
      → case file 2

PART 4  Two ways to build a decoder
 4.0  Same covariance matrix, two ways out.          [NEW · <rg-route-fork>]
 4.1  Route 1 — keep one centre per class, and take the nearest.
      <rg-mean-explorer> · <rg-mdm-playground>
      → case file 3
 4.2  Route 2 — flatten a local map first, then any ordinary classifier
      reads it.
      <rg-predict key="tangent"> [NEW] · <rg-tangent-explorer>
      → case file 4
 4.3  Which route? It depends on how much calibration you can ask for.
      <rg-method-compare>        [absorbs the method-guide table]
 4.4  Tomorrow's session breaks both — until you redraw the map around it.
      <rg-predict key="transfer"> · <rg-transfer-explorer>
 4.5  A better ruler cannot repair a bad measurement.  [limits + potato, kept]

CAPSTONE VIDEO        unchanged, and already in the right place — it recaps,
                      so it correctly follows the argument and precedes the notebook

PART 5  Do it yourself
 5.1  You have the whole pipeline. Now run it on real brains.
      <rg-concept-check> → Colab → results
      → case file 5

GLOSSARY · REFERENCES  unchanged
```

**Section ids are preserved** wherever they exist (`#story`, `#eeg`,
`#distance`, `#invariance`, `#mean`, `#classifier`, `#tangent`, `#transfer`,
`#limits`, `#capstone`, `#notebook`) so `href`s in `src/glossary.ts` keep
resolving. New ids: `#flat-map` (1.2), `#routes` (4.0), `#which` (4.3). The
`curvature` glossary entry retargets from `#story` to `#flat-map`. The
chapter-map nav goes from 4 entries to 5.

## 6. New components

All four are Lit custom elements rather than inline markup, because the
deployable unit for Wix is the widget bundle — a tag is cheaper to port than a
block of hand-built HTML.

### `<rg-flat-map>` — §1.2

A base point marked as *where the map is centred*, and a second point the reader
drags away from it. Two live readouts: distance measured on the surface
(`distance`) and distance measured on the flattened map (Frobenius on the
entries). Identical when the points coincide; separating as they move apart.

The reader is meant to *discover* the sentence, not be told it. Both numbers
are computed from `src/math/spd.ts`, not from a decorative parametrisation —
this is the one place where a fabricated-looking number would undo the
section's whole point.

**Per §3.1, the widget must whiten by the base point before taking the flat
measurement** (`recenter(base, ·)`), or the readouts will not agree even at
zero separation and the section will teach the opposite of its own sentence.
Walking the dragged point outward uses `expMap`, not `geodesic` (which clamps).

Reference behaviour, from the verified sweep: ratio 1.001 at separation 0.01,
1.304 at 1, 5.867 at 4. The widget should let the reader reach separations of
at least 3–4, because the effect is unimpressive below 0.5 and that is where a
reader who drags timidly will stop.

**Known risk, mitigated by §1.4:** a globe has positive curvature and the SPD
cone does not. §1.4 must ship in the same change as §1.2, never later.

### `<rg-route-fork>` — §4.0, and compact at 4.1 / 4.2

One covariance matrix at the top; two labelled branches. Attributes:
`compact` (small variant) and `active="1" | "2"` (highlights the branch you are
currently reading). Appears full-size once at 4.0 and compact at the head of
each route.

### `<rg-case-file step="1..5">`

A slim recurring strip carrying the one concrete decision through the page:
**one participant, imagine squeezing the left hand or the right; the decoder
must output "left".** ~25 words per appearance.

| Step | Placement | Content |
|---|---|---|
| 1 | end of Part 2 | The trial is now a table of which electrodes moved together. We still cannot compare two of them. |
| 2 | end of Part 3 | Now we can measure. We still have nothing to measure *against*. |
| 3 | end of 4.1 | Two centres. New trial → *d*₁ to "left", *d*₂ to "right" → **"left"**. |
| 4 | end of 4.2 | Same trial, flattened to a short vector → logistic regression → **"left"**. |
| 5 | in 5.1 | Both routes run for real in the notebook, on held-out trials. |

Steps 3 and 4 quote live numbers, and those numbers come from the same
computation the adjacent widget runs — never typed into prose. No placeholder
value appears in this document for them, deliberately: this page has shipped a
fabricated number once already.

**And the verdicts are derived, not asserted.** Step 3's answer comes from
comparing the two distances it displays, so the word and the numbers cannot
disagree — which also makes the beat demonstrate the MDM rule rather than state
its outcome. Step 4 shows the real tangent-space vector for the same trial and
says plainly that the notebook is where a classifier reads it; no classifier is
fitted in this widget, and the copy must not imply one is. A hardcoded verdict
sitting beside live numbers is the same defect as a fabricated number, one
indirection removed.

### `<rg-method-compare>` — §4.3

Three matched columns — Route 1, Route 2, CSP + LDA — over the same four rows
(what it needs · what it learns · how it decides · when it wins). Renders open
on desktop, folded behind a toggle below ~900px. This **replaces** the
standalone `method-guide` section; its content is preserved.

## 7. The math layer

`src/glossary.ts` already carries seven formulas with symbol legends and plain
readings. The chosen depth — *decode the formula* — is two optional fields plus
a folded presentation, not a new system.

```ts
interface Formula {
  html;  legend;  reading;                     // exist today
  steps?:  { part: string; says: string }[];   // NEW — the inside-out reading
  worked?: { lines: string[] };                // NEW — the same thing in numbers
}
```

`<rg-formula folded>` renders as a disclosure, closed by default, summary
`▸ Show the math — <short label>`.

| § | Box | Worked example |
|---|---|---|
| 2.1 | `covariance-matrix` | 2 channels × 5 samples → the 2×2 table, by hand |
| 3.1 | `geodesic` | P₁ = diag(4, 0.25), P₂ = diag(0.25, 4): both det 1.00 → flat midpoint det **4.52**, geodesic midpoint det **1.00** |
| 3.2 | `congruence` → `affine-invariant` | δ = 3.92 before rewiring and **3.92** after; Euclidean 5.30 → changes |
| 4.1 | `riemannian-mean` | total squared distance for two candidate centres |
| 4.1 | **`mdm`** — does not exist yet | the argmin, and the two distances it compares |
| 4.2 | `log-map` | one 2×2 matrix → its 3-number vector |
| 4.4 | `recentering` | a session mean → identity, and what that does to one trial |

`mdm` is the decision rule the entire page builds toward and it currently has
no formula. That is a real gap, not a nice-to-have.

**Anti-drift test (required).** Every `worked` example gets a unit test that
recomputes its numbers from `src/math/spd.ts` and asserts they match the
strings in `src/glossary.ts`. This page has already shipped one fabricated
number (`REVIEW.md` F6); seven hand-typed arithmetic blocks is exactly how that
recurs.

## 8. Cuts and merges

Justified by argument clarity, not by page length — the audience reads on a
laptop, so phone length is not the constraint.

| Removed / merged | Reason |
|---|---|
| The 4-step `pipeline` strip in `#eeg` | Third "here are the steps" strip on the page |
| The standalone `bridge-section` | Its one good line ("the points of a space need not be places") closes §1.1 |
| `notebook-path` + `concept-to-code` + `notebook-scope` → one block | Three overlapping "what's in the notebook" blocks; the page↔notebook mapping is replaced by the two-way anchors in §9 |
| The `guide-parts` list in `learning-route` | Duplicates the sticky chapter-map nav immediately above it |
| 6 × `term-ladder`, 7 × `lesson-purpose` | Content moves into prose (§4) |
| `relativity-section` → one block; `story` + `relativity` + `bridge` → one section | Part 1 rebalance (T6.1, never done) |
| `method-guide` section → `<rg-method-compare>` at 4.3 | Becomes the fork's payoff instead of a standalone table |
| The two asides on `relativity-section` | One is deleted, one becomes §1.4 |

**Kept, unchanged:** the hero graphic and its animation, the spacetime-well
SVG, the history track (re-captioned), all ten existing widgets, the capstone
video, the limits list, the potato, the glossary, the references.

**Expected length:** ~54 phone screens → high-40s. The number moves modestly;
the composition changes substantially. Length was never the main defect.

## 9. Notebook — where the advantage gets *demonstrated*, not asserted

Generated from `notebooks/build_notebook.py`; edits go there, then rebuild →
execute → `notebooks/publish_notebook.sh`.

The page can only ever *claim* that this geometry earns its keep — its widgets
are synthetic by necessity. The notebook is the only place the claim can be
measured on real EEG, so that is its job, and the structure should say so.

Two defects to fix first:

- **The same ordering bug as the site.** §4 *uses* tangent space inside a
  pipeline; §7 only *shows* what tangent space is, twenty cells later.
- **The advantages are scattered.** The geometry contrast is a sub-heading of
  §4, low-calibration is §5, the potato is §5c, re-centring is §5b — four
  separate demonstrations of "what this buys you", none of them framed as such.

### 9.1 Structural changes

| Change | Detail |
|---|---|
| **Mirror the fork** | §4 "Three complete BCI pipelines" splits into **§4 Route 1 · MDM** and **§5 Route 2 · tangent space**. The current §7 tangent-coordinate plot moves up into Route 2. CSP + LDA remains the baseline. Later sections renumber. |
| **New part: "What the geometry buys you"** | The four existing advantage demos are gathered into one part with two new experiments (§9.2), and it closes with a single summary table. This becomes the notebook's centre of gravity. |
| **One new intuition cell** | Measure §1.2's claim: pick a reference, compute Euclidean and Riemannian distance to trials at increasing Riemannian distance from it, plot both. They agree near the reference and separate with distance. Turns the page's central intuition from asserted into measured. |
| **Language sync** | Map/globe vocabulary at the three places it is literally accurate: the §0 toy example, tangent space, re-centring. |
| **Two-way anchors** | Each of the seven folded math boxes names its notebook section; each notebook section names its page section. Replaces the cut `concept-to-code` strip, and is better for being bidirectional. |

### 9.2 The advantage experiments

| # | Experiment | Status |
|---|---|---|
| E1 | **Same features, different ruler.** Identical covariances, identical validation, only the mean and distance swapped. | Exists (82.4 → 97.9). Promoted, not rewritten. |
| E2 | **The recording chain changes, and the ruler does not notice.** Apply one invertible congruence *G* to every covariance matrix, train and test alike, and re-run. Riemannian MDM's predictions are **bit-identical**; the Euclidean covariance baseline moves. | **NEW** |
| E3 | **A session shift, injected on purpose — and repaired.** Apply *G* to the held-out run's covariances only. Everything degrades. Re-centre each run on its own Riemannian mean and the Riemannian pipelines recover; the baselines have no comparable cheap fix. | **NEW** — and it is what §5b has been missing |
| E4 | **Limited calibration.** The 2/4/6/10-trials-per-class learning curve. | Exists. Moves into this part. |
| E5 | **The same distance as a quality gate.** The Riemannian potato. | Exists. Moves into this part. |

E3 is the important one. §5b currently reports a *negative* re-centring result
— correctly, because the three runs come from one sitting and there was no
session shift to remove. That honest finding stays, and now sits next to a case
where a shift genuinely exists, so the reader learns the real lesson:
**alignment is a hypothesis about your data, and here is what it looks like
when the hypothesis is true and when it is false.** That pairing is worth more
than either result alone, and it gives the page's §4.4 a real result to point at
instead of only a synthetic widget.

### 9.3 A claim we must not make

**CSP + LDA is also invariant to a global congruence.** The CSP generalised
eigenproblem *C₁w = λ(C₁+C₂)w* has congruence-invariant eigenvalues, and its
log-variance features are unchanged when every covariance is mapped to *GCGᵀ*.
So E2 must **not** be framed as "Riemannian survives the hardware change and
CSP does not." That would be false.

What E2 honestly shows is the contrast the page actually argues:

> The naive Euclidean treatment of these matrices is **not** blind to the
> recording chain. The Riemannian one is — exactly, to machine precision.

Two further precision notes for whoever implements it:

- Apply *G* to the **covariance matrices**, where invariance is exact. Applying
  it to the raw signals and re-estimating with `Covariances(estimator="oas")`
  breaks exact equivariance, because shrinkage toward a scaled identity is not
  congruence-equivariant. Both versions are worth running; only the first
  supports an "identical" claim, and the second should be labelled as the
  realistic-but-approximate case.
- Tangent-space + logistic regression is invariant only *up to solver
  tolerance* — the congruence conjugates the tangent coordinates by a fixed
  orthogonal matrix, and L2-regularised logistic regression is rotation
  equivariant. Say "unchanged to solver tolerance", not "identical". Any
  feature standardisation step in the pipeline breaks even that, and should be
  checked before the claim is written.

### 9.4 Consequences for the page

E3 produces a positive re-centring result on real data, so the
`transfer-caveat` aside at §4.4 must be rewritten. It currently says the
notebook gets a negative result, full stop. It will need to say both: the
mechanism works when a shift exists, and does nothing when one does not.

**Unchanged:** dataset, held-out-run protocol, the three exercises, per-fold
statistics, and every existing honest negative result.

**Number re-verification.** The page quotes 84.2 / 94.5 / 94.9 and 82.4 → 97.9
(+15.5). Re-ordering cells should not change any computation, but after rebuild
these are re-checked against fresh outputs before the page copy is finalised.
Not assumed. E2 and E3 add new numbers to the page, which are quoted only after
the notebook has been executed — never written from expectation.

## 10. Non-goals

- No visual redesign. Colours, fonts, and the existing widget styling stay.
- No new dataset, participant, or analysis beyond the one divergence cell.
- No new mobile machinery. `data-collapse-mobile` is not extended to new blocks.
- Not building the Wix page. That is the final deliverable (§11) and a separate
  activity.
- The capstone video is not re-cut. Its content still matches the argument.
- C7 (two cold readers) remains deferred, as the author decided.

## 11. Deliverables

1. Rebuilt `index.html` in the order of §5, on the template of §4.
2. Four new widgets: `<rg-flat-map>`, `<rg-route-fork>`, `<rg-case-file>`,
   `<rg-method-compare>`; plus `<rg-formula folded>`, a new `mdm` formula, and
   a `tangent` prediction in `src/predictions.ts`.
3. `steps` + `worked` on all eight formulas — the seven that exist plus the new
   `mdm` — presented in the seven boxes of §7, with the anti-drift test.
4. Rebuilt notebook per §9 — the fork mirrored, the advantage experiments
   gathered into one part, E2 and E3 implemented, executed end to end, with all
   quoted numbers re-verified.
5. `docs/wix-port-guide.md` — an ordered, section-by-section list of what to
   place on the Wix page and which text goes in it, so the port is mechanical.

## 12. Acceptance

**The heading-spine test (primary).** Read the fifteen section headings of §5 in
order, with nothing else. They must form a single argument that answers "what is
Riemannian geometry doing in a BCI?" If they read as a list of topics, this
document has failed regardless of what else shipped.

Then:

- `npm run build:all` clean; every custom element still registers, including
  the four new tags.
- `npm run audit:terms` clean, extended to also assert that every `href` in
  `src/glossary.ts` resolves to an id that exists in `index.html`.
- New unit tests: the worked-example anti-drift test, and a permanent version
  of the §3.1 sweep — all three rows, including **B**, so that if anyone later
  "simplifies" `<rg-flat-map>` by dropping the whitening step, a test fails
  rather than the page quietly starting to teach something false.
- The existing congruence-invariance test in `src/math/spd.test.ts` still
  passes — it is the regression test for the page's whole thesis.
- `<rg-concept-check>`'s six questions re-worded into the new vocabulary, still
  covering the stated outcomes.
- Keyboard pass over the four new widgets and every new disclosure.
- Notebook executes end to end; quoted numbers re-verified.
- **E2 asserts, not prints:** the notebook contains an explicit assertion that
  Riemannian MDM's predicted labels before and after the congruence are equal,
  so the invariance claim fails loudly rather than being read off a figure.
- Every claim in §9.3 that the notebook makes about CSP is checked against what
  the code actually produces before it is written into either the notebook or
  the page.

## 13. Open risks

| Risk | Mitigation |
|---|---|
| The globe has the wrong curvature sign for the SPD cone — the exact trap the gravity well already fell into | §1.4 ships in the same change as §1.2, never later, and states the sign difference explicitly with its consequences |
| §1.2's sentence gets written loosely as "exact near any reference", which is false — the flat map is exact only at the identity | §3.1 states the measured form, the copy requirement names the point every time, and `<rg-flat-map>` whitens by the base so the widget cannot demonstrate the false version |
| Seven hand-typed worked examples drift from the code | The anti-drift unit test in §7 |
| Re-execution shifts the numbers the page quotes | §9 re-verification step before copy is finalised |
| Prose per section triples; the page could get wordier rather than clearer | Every section's prose is checked against the C5 language rules already in `REVISION_PLAN.md`, and against the §2 spine — a paragraph that does not advance the spine is cut |
| Moving invariance out of its keystone slot weakens it | It becomes the answer to the question §3.1 explicitly asks. If §3.1 does not visibly leave that question open, the move fails — that is a copy requirement on §3.1, not an afterthought |
| E2 gets written up as "Riemannian survives the hardware change, CSP does not" — which is false, since CSP's generalised eigenvalues are congruence-invariant too | §9.3 states the permitted claim and the two precision notes; the acceptance list requires every CSP claim to be checked against produced output before it is written |
| E3's injected congruence reads as a rigged demo | It is framed as what it is — a deliberate, exactly-specified simulation of the transform that re-referencing and gain change actually apply — and it ships *next to* the existing real-data negative result, not instead of it |
