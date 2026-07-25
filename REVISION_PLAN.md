# Revision plan — Curved Spaces, Brain Signals

Companion to [`REVIEW.md`](REVIEW.md). Tasks are ordered so that each phase unblocks the
next: decide the argument → fix what's false → build shared infrastructure → fix the core
concept → deliver the payoff → sync the notebook → re-sequence → harden.

**Effort:** S ≈ under an hour · M ≈ a few hours · L ≈ a day or more.
Tasks marked **★** are the ones that actually close the gap identified in the review. If
you only do six things, do the ★ tasks.

**Supporting material** in [`review-notes/`](review-notes/):
- `riemannian_eeg_reference.md` — verified formulas, benchmark numbers, common errors, and
  a **20-row correctness checklist (§8)** to run against every formula you add in Phase 2.
  Claims are tagged ✅ verified / 🔢 numerically verified / ⚠️ unconfirmed, so check the tag
  before quoting anything.
- `notebook_analysis.md` — full cell-by-cell notebook audit behind Phase 5.
- `screenshots/` — the reviewed state at 1440px and 390px, for before/after comparison.

---

## Progress

Shipped so far (see git log for detail):

| Task | State |
|---|---|
| T1.1 causal claim about curvature | done |
| T1.2 fabricated distortion number | done — now measured |
| T1.3 mobile part-nav | done — auto-scrolls to the active part |
| T1.5 competition claim | done — five wins, 260–688 teams |
| T2.1 formula layer | done — `src/glossary.ts` + `<rg-formula>`, 5 on the page |
| T2.2 jargon popover | done — `<rg-term>`, 15 terms, glossary generated from the same module |
| T3.1 remount covariance explorer | done |
| T3.2 full 2×2 SPD math module | done — `src/math/spd.ts`, 34 tests |
| T3.3 rotating geodesic | done — "Tilted" pose in the distance explorer |
| T4.1 affine-invariance demo | done — `<rg-invariance-explorer>` |
| T4.2 transfer / re-centering demo | done — `<rg-transfer-explorer>` |
| T4.3 geometry-vs-features result | done — surfaced on the page |
| T4.4 results framing | done — crossover + resolution limit stated |
| T5.1 non-diagonal congruence | done |
| T5.2 notebook re-centering | done |
| T5.3 non-commuting toy example | done |
| T5.5 SPD display bug + positivity probe | done |
| T5.6 Fréchet iteration | done |
| T5.7 Riemannian potato | done |
| T6.2 checkpoint before the CTA | done |
| T7.1 predict-before-reveal | done — `<rg-predict>`, 3 prompts |
| T7.2 expanded concept check | done — 3 → 6 questions |
| T3.4 SPD cone as a coordinate system | done — `<rg-cone-explorer>`, drawn to scale |
| T3.5 honest MDM axes | done |
| T5.4 tangent space taught properly | done — log map, base point, √2 isometry verified |
| T5.8 notebook predict-before-run | done — 3 prompts with folded answers |
| T5.9 invalid confidence intervals | done — per-fold, with the resolution limit stated |
| T5.10 validation code made visible | done — printed with `inspect.getsource` |
| C3 first-use audit | done — `npm run audit:terms`, currently clean |
| C1/C2/C5 copy pass | done — 6 boxes now state the answer, spine in the lede, hedge words gone |
| T1.4 outcomes synced | done — includes the two-reasons question |
| T7.3 mobile length | done — 67 → 54 phone screens, desktop unchanged |
| T5.10 exercises | done — 3 runnable, solved, moved before the appendices |

Still open: **C7** (two cold readers), which the author explicitly deferred.
Everything else in this plan is shipped.

One manual step is the maintainer's, not mine: the website's "Open in Colab"
button points at a Drive-hosted copy of the notebook. The downloadable notebook
on the site is current, but that Drive file must be replaced by hand with
`notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb` for the Colab button to
serve the latest version.

The page is still 54 phone screens. That is the honest floor for a guide with
ten interactive widgets; shortening it further means removing something a reader
can handle, which is the part that makes it work.

---

## The comprehension contract — how we'll know it actually landed

Everything below this line is a correctness fix. Correctness is necessary and **not
sufficient**: a page can be entirely true and still leave the reader with nothing. This
section is the standard the revision is held to. Any task that adds content must satisfy
it, or the content doesn't ship.

### C1 — The spine sentence

One sentence carries the whole page. It gets stated in the hero, restated at each part
boundary in the local vocabulary, and paid off at the end:

> **Your recording distorts the signal in a predictable way. Pick the ruler that can't see
> the distortion, and patterns from the same brain state stay close no matter how the
> recording changed.**

Every section must visibly serve that sentence. If a section can't say which clause of it
it advances, the section is decoration and gets cut or moved.

**This also fixes a live problem:** the page currently runs four competing metaphors —
curved space, the cone, the ruler, the straight-line-versus-geodesic. A reader can't tell
which one is *the* idea. Promote **the ruler** to the controlling metaphor (it's the one
that's literally true — a metric *is* a ruler) and demote the others to supporting roles.

### C2 — Every section declares its one takeaway, in the reader's words

Each section gets a single sentence the reader must be able to say afterwards, written in
plain language with **no jargon in it at all**. Not "understand the affine-invariant
metric" — that's a topic, not a takeaway. This:

| Section | The sentence the reader must be able to say |
|---|---|
| Part 1 | "A distance rule is something you *choose*, and different choices disagree about what counts as similar." |
| Covariance | "One trial becomes a table of how every pair of electrodes moved together." |
| The cone | "Only some tables are possible, so they fill a specific shape — and averaging can push you somewhere silly inside it." |
| Distance | "Averaging these tables the obvious way invents strength that neither trial had." |
| Class center | "The center of a class is whatever sits at the smallest total distance from its examples." |
| MDM | "To label a new trial, measure it against each class center and take the nearest." |
| **Invariance** | **"If I rewire the amplifier, the Euclidean distance changes and the Riemannian one doesn't."** |
| Tangent space | "Flatten around one reference point and every trial becomes a plain list of numbers that ordinary machine learning can read." |
| **Transfer** | **"Re-centering each session to its own average cancels the difference between sessions without damaging what's inside them."** |

The page already has "question answered" boxes — good instinct, wrong object. They state
the *question*. Restate them as the *answer*, in these words. The two bolded rows are the
ones the page currently cannot produce at all.

### C3 — Term discipline

Enforced mechanically, not by vibes:

1. **No term appears before it is introduced.** Write a first-use audit (a ~20-line script
   over `index.html` comparing each glossary term's first occurrence against its
   introduction point) and run it in CI. The current page violates this — "SPD manifold"
   and "geodesic" both appear in body prose before they're taught.
2. **Plain idea first, always.** The term ladder is already the right pattern; make it the
   *only* pattern. The formal name never arrives before the plain idea.
3. **Every jargon term is an `<rg-term>`** (T2.2), so a reader who forgot one can recover
   without scrolling. This is what makes a dense page survivable.
4. **One name per concept.** The page currently calls the same thing "the curved data
   space," "the SPD manifold," "the cone," and "the space of valid matrices." Pick one
   primary name per concept, register the synonyms in the glossary, and stop rotating them
   in body copy — synonym rotation reads as elegant variation to a writer and as four
   different objects to a learner.

### C4 — The exit test

The page succeeds if a reader who finishes it can answer these five cold. These are the
acceptance criteria for the whole revision, and they become the concept-check questions
(T7.2):

1. Why does one EEG trial become a covariance matrix rather than staying a time series?
2. What goes wrong if you average two covariance matrices entry by entry?
3. Give **two independent reasons** not to use Euclidean distance here. *(Today the page
   can only produce one.)*
4. What does "affine-invariant" mean, and why does an EEG researcher care?
5. You trained a decoder on Monday and it fails on Tuesday. What does the geometry let you
   do about it, and why doesn't it destroy your data?

**Question 3 is the load-bearing one.** A reader with only one answer has learned a fact;
a reader with two has learned the idea.

### C5 — Language rules for the copy pass (T1.4)

- Lead each section with the takeaway; don't build to it. Readers scroll away mid-build.
- Ban **simply, just, obviously, of course, merely** — every one of them tells a struggling
  reader the problem is them.
- Any sentence over ~30 words, or with more than one subordinate clause, gets split. The
  current prose is good but several captions stack three ideas into one sentence.
- Every number shown to a reader must be real and reproducible (see T1.2).
- Every metaphor gets a stated boundary at the point of use, not in a card three screens
  later.

### C6 — Checkpoints at every part boundary, not one quiz at the end

Four checkpoints, one per part, each 2–3 questions drawn from C4, each with an explanation
that links back via `<rg-term>`. A single quiz at the end tests memory; checkpoints at the
joints test comprehension while it can still be repaired — and they tell *the reader*
whether to go back, which is the part that actually matters.

### C7 — Verification that a human, not the author, understands it

Before shipping: give the page to two people who match the stated audience — comfortable
with matrices, no Riemannian geometry, no BCI — and ask them the five C4 questions with the
page closed. Note where they hesitate. **Author judgment cannot substitute for this**; the
author is the one person in the world who cannot read the page cold. Two readers is enough
to find the top three confusions.

---

## Phase 0 — Decide what the page is arguing

Everything downstream is copy-editing against this decision, so make it first and write it
down. Right now the page's implicit thesis is *"the space is curved, so use a curved
ruler."* That thesis is not supported by anything the page demonstrates, and it is not
quite true (see F3).

### T0.1 — Write the one-sentence thesis and pin it in the repo · S ★
Adopt (or deliberately reject) this replacement:

> **Covariance matrices live in a constrained space, and you get to choose how to measure
> distance in it. The affine-invariant choice is the one that ignores exactly the
> distortions EEG measurement introduces — so patterns that are the same brain state stay
> close even when the recording changes.**

Why this thesis: it is defensible, it is what the literature actually claims, it makes the
metric a *design decision* rather than a mystical property, and — critically — it gives the
learner a second answer to "why not Euclidean?" beyond swelling.

**Deliverable:** a `THESIS.md` or a comment block at the top of `index.html`. Every
headline, caption, and widget subtitle gets checked against it in T1.4.

### T0.2 — Choose the target learner outcome · S
Current outcomes ("explain why a trial becomes a covariance matrix", etc.) are all
*narration*. Add one *reconstruction* outcome and one *defense* outcome, e.g.:
- "Write down the affine-invariant distance and say what each symbol does."
- "Answer 'why not just use Euclidean distance?' with two independent arguments."

These go in the existing `route-outcomes` list and become the spec for the quiz in T7.1.

---

## Phase 1 — Fix what is wrong or fabricated

Cheap, independent, and it protects credibility. Do this before adding anything.

### T1.1 — Correct the causal claim about curvature · S ★
**Where:** `index.html` cone `figcaption` (~line 455), and the `#eeg` reveal paragraph.

Replace "Variances can't be negative, and that one rule bends the space of matrices into a
cone" with the honest two-step:

1. Positivity confines every valid covariance matrix to an open **cone** — a *shape*, with
   a boundary of degenerate matrices you must never cross.
2. We then **choose** a way to measure distance inside it. The choice that keeps the
   boundary infinitely far away, and that ignores linear remixing of the channels, is the
   affine-invariant metric — and *that choice* is what makes straight-line averaging wrong.

**Acceptance:** the word "bends" no longer has "positivity" as its subject anywhere.

### T1.2 — Replace or compute the tangent explorer's distortion number · S ★
**Where:** `src/widgets/tangent-explorer.ts:264`.

`Math.min(0.2, 0.075 * r * r)` is presented to the user as "shape distortion vs. flat
3.2%". Either:
- **(preferred)** compute it for real — sample points at radius `r` around the reference,
  compare true geodesic distances to tangent-space Euclidean distances, report mean
  relative error. Trivial for the 2×2 case and makes the widget honest; or
- drop the percentage and keep only the qualitative verdict.

**Acceptance:** no number shown to a learner is a hard-coded curve fit.

### T1.3 — Fix the mobile part-navigation and add a length escape · S
**Where:** `.chapter-map` in `src/styles.css`.

At 390px the strip is clipped after "Part 3"; Parts 3 and 4 are unreachable. Make it
horizontally scrollable with snap points, or collapse to a compact "Part 2 of 4 ▾"
dropdown under 720px. The page is 40,384px tall on mobile (~48 screens) — also add a
persistent "back to contents" affordance.

**Acceptance:** all four parts reachable at 390px; no visual collision with content behind.

### T1.4 — Copy pass against the thesis · M
With T0.1 fixed, re-read every heading, caption, eyebrow, and widget subtitle and cut
anything that asserts curvature is doing work that the page doesn't show. Particular
targets: "curved data space" used as a synonym for "SPD manifold"; "a ruler shaped to the
cone"; "the geometry you pick changes which patterns count as similar" (this one is
*right* — keep and promote it).

### T1.5 — Cash out the competition claim · S
"Decoders built on it have won a string of international BCI competitions" needs a
concrete, defensible form. Verified against Barachant's own results listing:

| Competition | Year | Place | Teams |
|---|---|---|---|
| DecMeg2014 — Decoding the Human Brain | 2014 | 1st | 267 |
| BCI Challenge @ NER 2015 (Kaggle/Inria) | 2015 | 1st | 260 |
| Grasp-and-Lift EEG Detection (Kaggle) | 2015 | 1st | 379 |
| Microsoft Decoding Brain Signals | 2016 | 1st | 688 |
| Melbourne/NIH Seizure Prediction | 2016 | 1st | 478 |

Suggested wording: *"Alexandre Barachant, using Riemannian pipelines, placed first in five
international neural-decoding competitions between 2014 and 2016, against fields of 260 to
688 teams."*

Two cautions: the seizure-prediction win is **not** a BCI task, so don't say "five BCI
competitions"; and don't include the Biomag 2016 entry (6 teams) in a list where the others
had hundreds.

---

## Phase 2 — Build the math layer and the jargon popover

Shared infrastructure. Phase 3 and 4 content depends on both, so build them here.

### T2.1 — Add a formula component and give the term ladder a third rung · M ★
KaTeX is already a dependency and is **imported nowhere**. Wire it up.

Create `<rg-formula>`: renders one boxed expression with a **labeled callout under every
symbol** and a one-line plain-English reading. Then upgrade the existing
*plain idea → mathematical name* ladder to **plain idea → the formula → mathematical
name**.

Minimum set of five formulas, one per concept the page already teaches:

| Section | Formula |
|---|---|
| Covariance | `C = (1/(n−1)) · X Xᵀ` |
| Distance | `δ(P,Q) = ‖log(P^(−1/2) Q P^(−1/2))‖_F = √(Σᵢ log²λᵢ)` — and say **what the λᵢ are**: the eigenvalues of `P⁻¹Q`, i.e. the per-direction ratios between the two patterns |
| Geodesic | `P #ₜ Q = P^(1/2) (P^(−1/2) Q P^(−1/2))^t P^(1/2)` |
| Riemannian mean | `M = argmin_M Σᵢ δ²(M, Cᵢ)` (the page already explains this in words — just show it) |
| Log map | `Log_M(C) = log(M^(−1/2) C M^(−1/2))`, then upper triangle with √2 on off-diagonals → a vector of length `d(d+1)/2` |

Design note: keep these *collapsible* and default-open. The plain-language-first instinct
is the page's strength; the goal is to raise the ceiling, not the floor.

**Acceptance:** a learner can read `δ(P,Q)` off the page and say what each piece does.

### T2.2 — Build the click-to-explain jargon popover · M ★
*(your request — and it solves a real problem: it lets prose stay clean while the page
still teaches every term properly)*

Build `<rg-term key="spd-manifold">SPD manifold</rg-term>`:

- **Data:** one `src/glossary.ts` module, single source of truth. Seed it from the existing
  glossary section — that content is already written and well-phrased.
- **Each entry:** plain idea (1 sentence) · formal name · optional `<rg-formula>` ·
  "where you saw it" deep-link to the relevant section · optional 1-line "why it matters
  for EEG".
- **Interaction:** click/tap or keyboard-focus + Enter opens; Esc and outside-click close;
  the trigger gets a subtle dotted underline so terms are discoverable without shouting.
- **Mobile:** render as a bottom sheet, not a floating popover.
- **A11y:** `aria-describedby`, focus returns to the trigger on close, popover is
  keyboard-reachable in DOM order.
- **Wix constraint:** ship it as a registered custom element like every other widget so it
  drops into the Wix page unchanged (per `README.md`).

Terms to mark up first: *covariance matrix, SPD, SPD manifold, geodesic, metric,
affine-invariant, congruence, tangent space, log map, Riemannian mean, Fréchet mean, MDM,
CSP, whitening, recentering, balanced accuracy, leave-one-group-out*.

**Bonus this unlocks:** once terms self-explain, you can delete several inline definitional
clauses from body prose, which buys back vertical space toward the mobile length problem.

**Acceptance:** every bolded jargon term on the page is an `<rg-term>`; the standalone
glossary section becomes an index of them rather than a duplicate.

---

## Phase 3 — Make the demonstrated space actually curved

This is the core fix (F1). Everything here attacks the same problem: **nothing on the page
ever shows a matrix whose off-diagonal is non-zero, so nothing ever shows curvature.**

### T3.1 — Put the orphaned covariance explorer back on the page · S ★
`rg-covariance-explorer` already exists (380 lines), already has a **channel-relationship
slider**, already draws a tilted ellipse, already shows off-diagonal entries, and is
already advertised in the README. It is simply not imported in `src/main.ts` and its tag
appears nowhere in `index.html`.

Mount it in Part 2, **before** `<rg-signal-covariance>`, as the "what is a covariance
matrix, really" foundation. This is the single cheapest high-impact change in the project.

**Acceptance:** the learner's first contact with a covariance matrix lets them turn
correlation up and watch the ellipse tilt.

### T3.2 — Generalize the math module from diagonal to full 2×2 SPD · L ★
**Where:** `src/math/geometry.ts` — currently `type DiagonalMatrix2 = [number, number]`.

Add a real SPD-2 implementation: symmetric eigendecomposition (closed form for 2×2),
`sqrtm` / `invSqrtm` / `logm` / `expm`, then `distance`, `geodesic`, `riemannianMean`
(fixed-point iteration), `logMap`, `expMap`, and `congruence(A, P) → A P Aᵀ`.

Keep the existing diagonal functions — they're correct and the tests pass — but make the
widgets consume the general version. Everything is closed-form at 2×2; no linear-algebra
dependency needed.

**Acceptance:** `distance(congruence(A,P), congruence(A,Q)) === distance(P,Q)` passes as a
unit test for random invertible `A`. That single test is the whole point of the page.

### T3.3 — Make at least one geodesic visibly rotate an ellipse · M ★
With T3.2 in place, add a non-commuting example to the distance explorer: keep the current
axis-aligned pair as the warm-up, then offer a second preset where **A and B differ by a
rotation**, so the geodesic path *turns* the ellipse while the entry-wise path collapses it
through a degenerate shape.

This is the moment a learner can finally tell affine-invariant geometry apart from "take
logs and average." Right now no figure in either the website or the notebook does this.

**Acceptance:** a toggle labeled something like "make the patterns non-aligned" produces a
visibly rotating interpolation.

### T3.4 — Turn the SPD cone from decoration into a coordinate system · L ★
The cone is the page's signature image and currently has unlabeled axes, so nobody can
place their own matrix in it.

For 2×2 the cone is genuinely 3-D and genuinely drawable. Rebuild it with real axes
`σ₁₁`, `σ₂₂`, `σ₁₂`, the boundary surface `σ₁₁σ₂₂ = σ₁₂²`, and:

- a live point that **tracks the covariance explorer's sliders** (T3.1), so the learner sees
  their matrix move through the cone as they drag;
- the two interpolation paths from T3.3 drawn *inside* the cone — the straight chord versus
  the geodesic — which finally unifies the page's two competing pictures (matrix-as-ellipse
  and matrix-as-point);
- the boundary shown as the "invalid / degenerate" surface, so positivity becomes visible.

Also resolve the current metaphor collision: the cone figure draws ellipses floating inside
the cone, mixing "matrix as point" with "matrix as ellipse" without reconciling them. Show
both, linked — ellipse on the left, its point in the cone on the right, moving together.

**Don't design this from scratch.** pyRiemann's `examples/simulated/plot_metric_comparison.py`
is the canonical reference and is exactly the figure you want: a 3-D wireframe of the cone
`z = ±√(xy)` with the identity marked at `(1,1,0)` (this reproduces Fig. 3 of Yger, Bérar &
Lotte 2017), plus geodesics from `A = [[350,−50],[−50,45]]` to `B = [[200,10],[10,1]]`
drawn three ways — Euclidean chord, log-Euclidean, and affine-invariant — in the same cone
coordinates with 2-D shadow projections on each wall. Its source comment notes the
endpoints were deliberately chosen *away from the identity* to make log-Euclidean and
affine-invariant visibly diverge; copy that choice. The same file also contains the
canonical swelling figure (bilinear ellipse interpolation, reproducing Fig. 4.2 of Arsigny,
Fillard, Pennec & Ayache 2007).

### T3.5 — Relabel the MDM playground axes · S
They read "Channel-pattern direction 1 / 2". They are `log σ₁₁` and `log σ₂₂`. Say so —
and add one line noting that in *these* coordinates the geodesics are straight, which is
exactly why the plot looks flat. Turning a hidden simplification into an explicit teaching
point is cheaper than hiding it and more honest.

---

## Phase 4 — Deliver the payoff the page already promises

### T4.1 — Add an affine-invariance demonstration · M ★
**The missing centerpiece.** Currently "affine-invariant" appears twice on the page, both
times as a bare label.

Build a widget (or extend the distance explorer) where the learner:
1. sees two covariance matrices and their Riemannian and Euclidean distances;
2. drags a slider that applies an invertible mixing matrix `A` to **both** — framed
   physically: *"this is what a re-reference / a different amplifier gain / volume
   conduction does to your recording"*;
3. watches the **Euclidean distance swing wildly while the Riemannian distance does not
   move at all.**

Pair it with the formula from T2.1: `δ(APAᵀ, AQAᵀ) = δ(P,Q)`.

Frame it with the sentence the page is currently missing entirely — arguably the most
important sentence in the subject:

> Volume conduction, the lead field, electrode gain, referencing, whitening, spatial
> filtering and session drift are **all the same algebraic operation**: a congruence
> `C ↦ W C Wᵀ`. The affine-invariant distance is defined to be blind to exactly that
> operation. You get the benefit of solving the inverse problem without solving it.

**Optional depth worth one line:** the affine-invariant metric *is* the Fisher–Rao
information metric on zero-mean Gaussians — so this "distance" literally measures how
statistically distinguishable two underlying source distributions are. That reframes the
metric from an aesthetic choice into the canonical one, and it is the strongest available
answer to "why *this* metric and not some other curved one?"

**Why this matters more than anything else on the page:** it is the second, independent
answer to "why not Euclidean?", it is the actual reason the method works on real EEG, and
it is a genuinely surprising number that a learner will remember.

### T4.2 — Show the transfer/recentering superpower instead of asserting it · M ★
The page says re-centering is "the geometry's quiet superpower" and shows nothing. The
notebook doesn't implement it either. Fix both (notebook side is T5.2).

On the page: two clouds of points (session A, session B) sitting in different places; a
"recenter each session to its own mean" toggle; the clouds snap into alignment and a
decision boundary trained on A suddenly works on B. Even schematic, this converts the
page's biggest claim from faith to sight.

### T4.3 — Surface the geometry-vs-features result · S ★
The notebook already computes the cleanest evidence in the project: same covariance
features, different geometry — Euclidean mean **0.824 ± 0.104** vs Riemannian MDM
**0.979 ± 0.036**, delta **+0.155**. It appears nowhere on the website.

Put it next to the existing score row. It is the only number that separates "covariance
features help" from "**the geometry** helps" — the exact question the page currently leaves
unanswerable.

### T4.4 — Fix the results framing, and tell the better true story · M ★
The three headline percentages (84.2 / 94.5 / 94.9) are real, but they are the **most
Riemannian-favourable row** in the table; at 10 trials/class CSP+LDA leads (0.978 vs
0.967 / 0.972). "All three methods performed similarly" is a soft rendering of a crossover
the reader never sees. Show the crossover, and state the resolution limit: ~15 trials per
fold means one trial ≈ 6.25 accuracy points, so sub-point differences are noise.

**More importantly, the literature's actual story is stronger than the one you're telling.**
On BCI Competition IV-2a cross-session (Congedo, Barachant & Andreev 2013), MDM did *not*
beat CSP+LDA on binary accuracy — 79.71 ± 9.44 vs 80.45 ± 12.30, explicitly "no
difference," and 4-class only reached p = 0.074. What it *did* do:

- matched that accuracy with **zero hyperparameters** (CSP required choosing a filter count);
- cut cross-session standard deviation by ~25–30% (9.44 vs 12.30; 13.15 vs 18.80);
- and, in the authors' words, performed "more or less equivalent for subjects performing
  well, **while it is better for subjects performing poorly.**"

**Riemannian methods compress the bad tail.** For a real BCI, cutting the
BCI-illiteracy rate matters more than raising the ceiling. Lead with *robustness and
fewer knobs*, not peak accuracy. It's more defensible, more interesting, and it survives
scrutiny — which the current single-participant framing does not.

Optional supporting evidence: MOABB (Chevallier et al. 2024, 30 pipelines × 36 datasets)
found Riemannian pipelines "consistently outperform" deep-learning and raw pipelines across
all paradigms, with tangent space beating MDM. **Include their own caveat** — the DL
baselines were off-the-shelf, untuned, and un-augmented — and their finding that Riemannian
pipelines *degrade* above ~25 electrodes. Adding the caveat is what makes the citation
credible.

---

## Phase 5 — Notebook: from film to workshop

Do this after Phases 3–4 so the notebook mirrors the settled website concepts. Full
detail in the notebook analysis; the ordering below is by impact.

### T5.1 — Make the congruence matrix non-diagonal · S ★
One line. `channel_gain = np.diag([3.0, 0.4])` → a full invertible `G`, e.g.
`np.array([[1.2, 0.7], [-0.4, 0.9]])`. Keep the existing table and assertion; reframe the
prose: *this is what volume conduction, a re-reference, or a different montage does to your
covariances — and the Riemannian distance does not notice.*

Highest impact per character in the project. Keep the diagonal case as a warm-up.

### T5.2 — Implement cross-session recentering · M ★
~15 lines, no new data or dependencies. The notebook already has three runs, already holds
out runs, and already plots tangent-space PCA *styled by run* — a figure whose whole point
could be "the runs sit in different places." Recenter each run by its own Riemannian mean,
replot, re-run leave-one-group-out before and after.

A null result on three same-session runs is still an honest, valuable lesson — and it makes
the website's headline claim testable rather than asserted.

### T5.3 — Add non-commuting toy examples · S ★
`toy_a`, `toy_b`, and all three `toy_trials` are diagonal, hence commuting, so the
affine-invariant geometry collapses to elementwise log arithmetic. Add a rotated pattern
(`R(30°) @ diag(4, 0.25) @ R(30°).T`) so a geodesic visibly rotates an ellipse. Same fix as
T3.3, same reason.

### T5.4 — Teach the tangent space properly, and move it earlier · M ★
Weakest coverage in either artifact, and it's the *winning* pipeline. Write the log map
explicitly; state that pyRiemann's base point **is the Riemannian mean of the training
set**; show the upper-triangle vectorization with the **√2 off-diagonal weighting**,
explained as the choice that makes the vector's Euclidean norm equal the matrix's Frobenius
norm — an isometry, not bookkeeping. Verify with a 3-line assert against
`TangentSpace().fit_transform`. Move it before the cell where tangent+LR first wins.

**Get the convention right or the assert will fail.** pyRiemann's `tangent_space` returns
`log(C_ref^(−1/2) C C_ref^(−1/2))` — the *whitened* form — **not** the full
`Log_P(Q) = P^(1/2) log(P^(−1/2) Q P^(−1/2)) P^(1/2)`. Both are legitimate and they differ
by a congruence; mixing them silently is a common bug. Pick one, say which, and be
consistent. Also make explicit that this `log` is a **matrix** logarithm —
`log(C) = U log(Λ) Uᵀ` — not an elementwise one. Learners conflate these constantly, and
after a whole website built on diagonal examples (where the two coincide!) this one is
practically booby-trapped.

One more reason the √2 matters practically: without it, every off-diagonal — i.e. every
*connectivity* feature, which is where the motor-imagery signal actually lives — is
silently down-weighted by `1/√2` relative to the variances.

### T5.5 — Fix the SPD verification display and make positivity fail on demand · S
Cell 23 prints `smallest eigenvalue 0.0 / largest eigenvalue 0.0` beside `all eigenvalues
positive: True` — a V²-scaling artifact in the cell whose entire job is to prove the
opposite. Scale to µV² or format `{:.3e}`. Then add two lines that perturb one off-diagonal
until an eigenvalue goes negative: it turns "changing one entry can break positive
definiteness" from assertion into demonstration, and it is the cheapest way to make the
constraint feel real.

### T5.6 — Show the Riemannian mean's iterative algorithm · S
~8 lines: log-map to the tangent space at the current estimate, average, exp-map back,
repeat; plot the objective falling; assert convergence to `mean_riemann`. This is the cell
that unifies mean, log map, and tangent space into one idea — it makes T5.4 land much
harder.

### T5.7 — Implement the Riemannian potato instead of assigning it · S
~6 lines. Distance to the global Riemannian mean, a z-score threshold, and a plot of the
flagged trials' **raw traces** so the learner sees the artifact that got caught. Delivers
the website's "one representation, two jobs" aside as a result.

Implementation detail that is easy to get wrong: the potato z-scores the **log** of the
distance, not the distance itself.

### T5.8 — Make the notebook participatory · M ★
Currently zero interactive moments. Add:
- **5–6 predict-then-run prompts** at the natural cliffhangers ("will the entry-wise
  midpoint be larger, smaller, or equal?" · "will the Riemannian distance change under
  rescaling?" · "same features, different geometry — how much will it matter?" · "which
  model wins with 2 trials?");
- **3 real TODO cells** with solutions folded below: implement `riemannian_distance` from
  `eigvalsh` and assert it matches `distance_riemann`; implement the Fréchet loop (T5.6);
  implement the potato (T5.7);
- mark the two editable knobs (`SUBJECTS`/`RUNS`, `trials_per_class`) as knobs.

### T5.9 — Fix the statistics and report uncertainty honestly · S
Replace seaborn's pooled `errorbar=("ci", 95)` — it treats 3 folds × 10 repeats as 30
independent observations, so the bands in the site's headline figure are too tight. Use
per-fold aggregation or show raw repeat scatter. Add a "differences smaller than one trial
(~6.25 points) are not resolvable here" note.

### T5.10 — Unhide the validation code and re-place the exercises · M
In the Colab variant — the one learners actually open — `build_pipelines` and
`evaluate_leave_one_group_out` are inside a single escaped one-line string. The leakage
discipline the notebook preaches hardest is the one thing the reader cannot see. Split it
into visible cells. Move the seven exercises from behind two optional appendices to
immediately after their relevant sections, and add hints/solutions.

---

## Phase 6 — Re-sequence

Do this after content is built, so you order it once.

### T6.1 — Rebalance Part 1 · M ★
Part 1 is ~3,334px (13.5% of the page) of Euclid → Gauss → Riemann → Einstein plus a
spacetime well, before any EEG. It is beautiful and it earns *some* of that. Cut it to
roughly half, and **retarget the analogy**: the transferable idea is not "space bends,"
it's "**you choose the distance rule, and the choice encodes what you want to ignore.**"

Fix the analogy-boundary card while you're there. It currently stops the analogy on the
axis readers already understand ("this isn't physical spacetime"). It should stop it on the
axis they can't guess: **the curvature here has the opposite sign to the picture above it,
and that is the whole reason the algorithms work.**

| Gravity well / sphere (κ > 0) | SPD manifold with the affine-invariant metric (κ ≤ 0) |
|---|---|
| Geodesics between antipodes are non-unique | **Exactly one** geodesic between any two points |
| Has conjugate points and a cut locus | **Neither** |
| Geodesics reconverge; triangles are fat | Geodesics diverge; triangles are thin |
| Fréchet mean need not be unique | Fréchet mean **always exists and is unique** |
| Compact, finite | Non-compact, infinite extent, no boundary |

Every property that makes this manifold pleasant to compute on — unique geodesics, a
unique mean, a globally valid log map — follows from curvature being **non-positive**, and
the gravity well teaches all of them backwards.

Two precision notes while editing: curvature here is **not constant** (Pennec computes
sectional curvature explicitly: −1/4 in some 2-planes, −1/8 in others, so κ ∈ [−1/4, 0]) —
"constant curvature" is a genuine error that appears in the literature, so don't inherit it.
And the correct causal chain to teach is **invariance requirement → forces this metric →
metric makes the space curved → curvature is non-positive → therefore means and geodesics
are unique → therefore the algorithms are simple and stable.** Curvature is a cost that
turns out to be a benefit, not the mechanism. If a learner leaves thinking "curvature
improves accuracy," the page has failed even if every sentence on it is true.

### T6.2 — Move the concept check before the notebook CTA · S
The 3-question quiz currently sits *after* the Colab call-to-action, so learners who follow
the page's own instruction to go run the notebook never see it. Gate the handoff with it
instead.

### T6.3 — Proposed running order
```
Hero · How to read this guide
Part 1  The math of curves          (halved — T6.1)
        └ geodesic · metric-as-a-choice · where the analogy stops (corrected)
Part 2  How it connects to EEG
        └ covariance explorer (T3.1)  ← restored, off-diagonal, tilting ellipse
        └ signal → covariance
        └ the SPD cone as a real coordinate system (T3.4)
Part 3  Using it: the decoder
        └ Move 1 · distance      (+ non-commuting preset, T3.3)
        └ Move 2 · class center
        └ Move 3 · MDM
        └ ★ Why this metric      (T4.1 invariance demo)   ← NEW, the missing keystone
        └ The bridge to ML: tangent space (+ real distortion, T1.2)
        └ ★ Transfer across sessions (T4.2)               ← NEW, the promised payoff
        Method comparison table · Limits · Potato
Part 4  Do it yourself
        └ concept check (T6.2, moved earlier)
        └ results incl. geometry-vs-features (T4.3) + honest framing (T4.4)
        └ Colab CTA
Capstone video (optional) · Glossary index · References
```
Rationale: invariance sits **after** MDM (so the learner already has something concrete to
be invariant about) and **before** tangent space (because recentering is invariance
applied). Transfer closes Part 3 as the payoff, which is also what sends people to the
notebook motivated.

---

## Phase 7 — Retention, accessibility, and QA

### T7.1 — Add predict-before-reveal to the three main widgets · M ★
Across a 35-minute lesson there are 6 sliders, 12 buttons, 3 collapsed self-checks and one
3-question quiz — all exploratory, none asking the learner to *commit*. Before revealing
the swelling result, the mean comparison, and the invariance result, ask for a prediction
(two or three buttons). Highest retention-per-line-of-code available, and it costs no new
math.

### T7.2 — Expand the concept check to cover the new outcomes · S
Three questions is thin for a 35-minute lesson, and none of them test the two things this
revision adds. Add at minimum: one on affine invariance, one on why the Euclidean average
swells, one on what recentering does. Wire the answer explanations to `<rg-term>` popovers
from T2.2.

### T7.3 — Mobile length pass · M
40,384px is ~48 phone screens. With T2.2 in place you can cut inline definitional prose;
also consider collapsing the method table and the limits list into accordions under 720px,
and check every widget's touch targets.

### T7.4 — Verification · M
- **Run every formula added in Phase 2 against the 20-row correctness checklist** in
  `review-notes/riemannian_eeg_reference.md` §8. Highest-risk rows for this page: #1
  (symmetrized form — `‖log(P₁⁻¹P₂)‖_F` is *not* the distance), #5 (don't mix the full and
  whitened log-map conventions), #7 (non-positive and **non-constant** curvature), #12 (√2),
  #15 (potato z-scores the log-distance).
- Unit test from T3.2: congruence invariance of `distance` (this is the regression test for
  the page's entire thesis).
- `npm run build:all` clean; the Wix custom-element bundle still registers every tag,
  including the new `<rg-term>` and `<rg-formula>`.
- Re-run the notebook end to end and confirm the website's quoted numbers still match after
  T5.x.
- Screenshot diff at 1440px and 390px.
- Keyboard-only pass over every new interactive element.

---

## Suggested execution order if you want the fastest path to "this actually teaches it"

1. **T3.1** — remount the orphaned covariance explorer *(S — the cheapest real win)*
2. **T5.1** — non-diagonal congruence matrix in the notebook *(S — one line)*
3. **T1.1 / T1.2** — fix the false causal claim and the fabricated number *(S)*
4. **T3.2** — generalize the math module to full 2×2 SPD *(L — unblocks everything visual)*
5. **T4.1** — the affine-invariance demo *(M — the missing keystone)*
6. **T2.1 / T2.2** — formulas and the jargon popover *(M)*
7. **T3.3 / T3.4** — rotating geodesic, cone as coordinate system *(M/L)*
8. **T4.2 / T5.2** — transfer/recentering on both sides *(M)*
9. **T4.3 / T4.4** — surface the +0.155 result, fix results framing *(S)*
10. Everything else.

After steps 1–5 the page stops being a beautifully-illustrated pipeline tour and starts
being an explanation of Riemannian geometry.
