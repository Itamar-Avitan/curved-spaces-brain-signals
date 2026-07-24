# Curved Spaces, Brain Signals — a critical review

**Question asked:** at the end of the day, does the person who reads this page and runs
its notebook genuinely understand Riemannian geometry for EEG — can they explain it,
use it, see its benefits — and did they learn something real about Riemannian geometry
along the way?

> **Status note, added after the revision work.** This document records the page
> as it stood before any changes; it is kept as-is so the reasoning stays
> auditable. Most of what it describes has since been addressed — see
> [`REVISION_PLAN.md`](REVISION_PLAN.md) for the task-by-task state and the git
> log for the changes themselves. In short: F1, F2, F3, F5, F6, F8 and F9 are
> fixed; F4 is half fixed (the analogy now stops on the curvature sign; Part 1 is
> shorter but still the longest run of set-up on the page); F7 is partly fixed
> (the MDM axes are still mislabeled and the SPD cone is still decorative — that
> is T3.4, still open); F10 needed a correction, noted inline below.

**Reviewed:** the live dev build at 1440px and 390px, every section screenshotted and
read visually; all widget source in `src/`; the math modules in `src/math/`; the
companion Colab notebook; the page copy in `index.html`.

---

## Verdict in one paragraph

This is a genuinely well-made piece of educational design — the structure is right, the
prose is careful, the honesty about limitations is better than most published tutorials,
and the visual craft is professional. A motivated newcomer will finish it able to
**narrate the pipeline** accurately: an EEG trial becomes a covariance matrix, matrices
need a distance rule, averaging entry-wise inflates scale, a class center plus a distance
gives you a classifier. That is real learning and it is not nothing.

But they will **not** understand Riemannian geometry, and they will not be able to defend
why it beats the Euclidean alternative under any pushback. The reason is specific and
fixable: **every interactive demonstration on the page runs on a space that is
mathematically flat**, and the one property that actually makes this method work for EEG —
affine invariance — is never stated, never shown, and never used. The page teaches the
*workflow* faithfully and the *geometry* as atmosphere. A sharp reader could finish it,
conclude "so this is just taking logarithms before you average," and be entirely correct
about everything they were shown.

---

## What works, and works well

These are real strengths. They should survive any revision.

**The four-part spine is the right decomposition.** Math → EEG → decoder → do it yourself,
with a persistent progress rail and a "how to read this guide" contract up front that
states outcomes, audience, time, and prerequisites. Most technical explainers never tell
you what you're going to be able to do afterwards. This one does, on the first screen.

**The "term ladder" is an excellent invention.** Every concept is introduced twice — once
as a plain idea ("choose the nearest learned class center"), once as the formal name
("Minimum Distance to Mean (MDM)"). This lowers the intimidation cost of jargon without
hiding it, so the learner can later read a paper. More explainers should steal this
pattern. It is the single best pedagogical device on the page.

**The swelling demonstration is correct and well-staged.** Two patterns with equal total
variation, `diag(4, 0.25)` and `diag(0.25, 4)`. The entry-wise midpoint balloons to a
circle with relative area 2.13×; the geodesic midpoint holds at 1.00×. This is the real
determinant-swelling effect and the widget lands it.

**The caveats inside the widgets are exemplary.** The distance explorer volunteers that
"its relative area stays at 1.00 because *this example's* endpoints have equal
determinant," and the self-check answers "is the arithmetic halfway matrix invalid?" with
"No. In this example it is still positive definite and therefore valid. The problem is
subtler." That is scrupulous teaching. Most tutorials would have let the learner walk away
with the wrong, stronger belief.

**The mean explorer is the best teaching moment on the page.** Side by side: arithmetic
candidate (relative area 1.66×, total squared distance 8.54) versus Riemannian center
(1.00×, 6.95), with the note "*why this is called a mean*: it is the matrix that minimizes
the sum of squared distances to the training matrices, just as an ordinary mean does on a
flat number line." That single sentence teaches the Fréchet-mean idea properly, and the
numbers make it checkable rather than assertable.

**"A better ruler cannot repair a bad measurement."** The limits section names artifacts,
distribution shift, validation leakage, and neurophysiological relevance. It warns that
CSP and tangent-space reference points must be fitted inside the training fold. The
results are caveated honestly ("one participant… demonstrate the workflow, not a universal
performance guarantee"). This methodological seriousness is rare and valuable — keep every
word of it.

**The Riemannian potato earns its place.** "One representation, two jobs: make the call,
and know when not to" is a genuinely elegant way to show that the geometry pays off twice.

---

## Findings, in severity order

### F1 — The space you demonstrate is flat. The central claim is never actually shown. *(critical)*

Every interactive on the page computes on this type:

```ts
// src/math/geometry.ts
export type DiagonalMatrix2 = [number, number];
```

Two positive numbers. No off-diagonal term anywhere. `riemannianDistance`,
`geometricMean`, `interpolateGeometry`, `logMapCoordinates` all operate on this.

The mathematics here is *correct* — for diagonal matrices these are exactly the
affine-invariant distance, the Riemannian mean, and the geodesic. That is the problem.
Restricted to diagonal matrices, the SPD manifold under the affine-invariant metric is
**isometric to flat Euclidean space** via `(a, b) ↦ (log a, log b)`:

```
δ(P, Q) = ‖log(P^(−1/2) Q P^(−1/2))‖_F
        = √( log²(q₁/p₁) + log²(q₂/p₂) )       ← for diagonal P, Q
        = ordinary Euclidean distance between (log p₁, log p₂) and (log q₁, log q₂)
```

Zero curvature. Straight lines in log coordinates. The MDM playground makes this literal —
it plots `leftLogPoints`, `rightLogPoints` and draws straight dashed lines between them,
because in the coordinates it uses, the geodesics *are* straight lines.

This isn't a quirk of the 2×2 case, and it has a name. As a symmetric space the SPD
manifold has rank *n*, and the diagonal matrices are precisely a **maximal flat** — the
standard term for a totally geodesic, genuinely zero-curvature submanifold. The page has,
entirely by accident, restricted every demonstration to the one submanifold on which the
curvature it is trying to teach is exactly zero.

So the page promises curvature and delivers log-scaling. Everything demonstrated —
swelling, the geometric mean, the "geodesic" — follows from a single fact that needs no
Riemannian geometry at all: **variance is multiplicative and positive, so average it in
log space.** Curvature never does any work.

Curvature on the SPD manifold lives entirely in the *non-commuting* directions — the
off-diagonal terms. And the off-diagonal is precisely where EEG lives: motor imagery
changes the **spatial correlation between electrodes**, not just per-channel band power.
Confirming this visually: every ellipse in every widget on the page is axis-aligned. None
of them ever tilts.

**Corroborating evidence — the fix is already written and switched off.** The one widget
that models a real 2×2 covariance with a correlation term, `rg-covariance-explorer`
(380 lines, uses `covarianceFromParameters`, has a *"channel relationship"* slider, draws
a tilted ellipse, shows off-diagonal entries `0.67`), is **defined, exported, advertised in
the README as a deployable Wix element — and is not on the page.** It is not imported in
`src/main.ts` and its tag appears nowhere in `index.html`. It is the best "what is
covariance, really" explainer in the repository and it is dead code.

### F2 — Affine invariance, the actual reason this works for EEG, is absent *from the page*. *(critical)*

The string "affine-invariant" appears exactly twice in `index.html`: once inside the
capstone video blurb, and once in the glossary as a bare term. The *property* is never
stated, demonstrated, or motivated on the page.

*(The notebook does considerably better here — it writes the formula out and tests the
property. See the notebook section below. That asymmetry is itself a finding: the page is
the part everyone reads, and it is the weaker of the two.)*

This is the heart of the subject. The reason Riemannian geometry beats Euclidean for EEG
is not "the space is curved so use a curved ruler." It is:

```
δ(A P₁ Aᵀ, A P₂ Aᵀ) = δ(P₁, P₂)   for any invertible A
```

Volume conduction, electrode gain and impedance drift, re-referencing, spatial filtering,
whitening — to first order these all act as congruence transforms `P ↦ A P Aᵀ`, and the
affine-invariant distance is **completely blind to all of them**. That is why the same
decoder survives a new session. That is why you can recenter a recording to the identity
and reuse a model trained on someone else. It is the whole game, and it is the one thing
that cannot be explained away as "just use logs."

Worse, the page **asserts the payoff without showing it**. From the tangent section:

> The same re-centering on a reference also makes two recordings line up — which is how a
> decoder transfers to a new session or person with little recalibration, the geometry's
> quiet superpower.

That is the single most valuable practical benefit of the entire method, and it gets one
sentence buried in a purpose box. No visual. No widget. No number. No demonstration. The
learner is told to take the field's biggest selling point on faith.

### F3 — The stated cause of the curvature is wrong. *(high)*

From the cone figure caption:

> Variances can't be negative, and that one rule bends the space of matrices into a cone
> that narrows toward zero. Inside a curved space like this, a flat ruler misjudges
> distance.

Positive-definiteness makes the set an **open convex cone** — and a convex cone sitting in
ℝ³ is a perfectly flat subset of it. The constraint alone bends nothing. What creates the
curvature is the **choice of metric**: we adopt the affine-invariant inner product
`⟨A, B⟩_P = tr(P⁻¹ A P⁻¹ B)`, chosen so that congruences are isometries and the boundary
of singular matrices sits at infinite distance. *That choice* is what makes the space
curved and Euclidean averaging wrong.

The page's causal chain (constraint → curvature → flat ruler fails) is a plausible-sounding
shortcut that the learner cannot defend and that a knowledgeable reader will flag
immediately. It also robs them of the genuinely beautiful insight: **the metric is a design
decision, and it was designed on purpose, for reasons you can state.**

### F4 — The general-relativity framing is over-invested and points the wrong way. *(high)*

Part 1 spends roughly 3,300px — about 13% of the page — on Euclid → Gauss → Riemann →
Einstein plus a full spacetime-well illustration, before any EEG appears. It is beautiful
and it does earn attention. But it has two costs.

**It teaches the wrong curvature.** The gravity-well picture primes positive curvature —
geodesics that converge, a sphere-like intuition. The SPD manifold is a **Hadamard
manifold**: non-positive sectional curvature, a unique geodesic between any two points, no
conjugate points, and an exponential map that is a global diffeomorphism. It behaves like
hyperbolic space, not like a gravity well. Nothing on the page says so, and the visual
actively suggests the opposite.

**The "where the analogy stops" card stops it on the wrong axis.** It currently says: this
isn't physical spacetime, we're not applying field equations to the brain. Readers already
assume that. What it needs to say is the thing they *can't* guess: the curvature here is of
the opposite character to the picture you were just shown, and — more importantly — the
useful shared idea is not "space bends" but "**you get to choose the distance rule, and the
right choice is the one that ignores the distortions your measurement introduces.**"

Right now the relativity section is longer than any single decoder concept. That ratio is
inverted for a page whose payoff is the decoder.

### F5 — No mathematical notation at all, for an audience told to bring matrices. *(high)*

There is not one formula on the page. Not the definition of covariance, not
`δ(P₁,P₂) = ‖log(P₁^(−1/2) P₂ P₁^(−1/2))‖_F`, not the geodesic, not the log map, not the
Fréchet-mean objective. KaTeX is a declared dependency in `package.json` and is **never
imported anywhere in `src/`** — the machinery to render math was installed and never used.

Meanwhile the prerequisites box says "comfort with vectors and matrices," and the stated
outcome is that the learner can *explain* this. You cannot explain a metric you have never
seen written down. Right now the page's ceiling is recognition, not reconstruction.

To be clear: this is not a request for a wall of LaTeX. The plain-language-first instinct
is correct and should stay. But the term ladder currently has two rungs and needs three —
**plain idea → the formula → the formal name** — with every symbol labeled underneath. One
boxed formula per concept, five lines each, converts "I followed a story" into "I could
reproduce this."

### F6 — One widget reports a fabricated number. *(medium-high, but it's the one integrity issue)*

The tangent explorer displays **"shape distortion vs. flat 3.2%"** with a verdict ("Close
to the reference — the flat copy is faithful"). That number is:

```ts
// src/widgets/tangent-explorer.ts:264
const distortion = Math.min(0.2, 0.075 * r * r); // grows with neighborhood
```

A hard-coded quadratic in the slider position. It is not derived from a log map, a
curvature, or any covariance matrix. The widget imports nothing from `src/math/`. The
pentagon it draws is a generic manifold cartoon, not the SPD manifold.

On a page that is otherwise scrupulously honest, presenting an invented quantity to two
significant figures is the one place I'd call it misleading rather than merely incomplete.
Either compute a real distortion (e.g. mean relative error between true geodesic distances
and tangent-space Euclidean distances over the sampled points — genuinely easy for 2×2) or
drop the number and keep the qualitative message.

Separately, the section promises the bridge to machine learning and never shows it. The
learner never sees that `Log_P(S)` is a **symmetric matrix**, that you take its upper
triangle with √2 weighting on the off-diagonals, and that this yields a vector of length
`d(d+1)/2` which is literally the input to logistic regression. That vectorization *is* the
bridge, and it's the concrete thing the section owes them.

### F7 — The two hero visuals are decorative, not functional. *(medium)*

The SPD cone is a lovely drawing with unlabeled axes. A learner cannot answer "where would
*my* matrix go in there?" — and the ellipses floating inside it mix two different
representations (a matrix as a *point* in the cone versus a matrix as an *ellipse*) without
ever reconciling them. For 2×2 the cone is genuinely three-dimensional and genuinely
drawable with real axes: `σ₁₁`, `σ₂₂`, `σ₁₂`, with the boundary surface `σ₁₁σ₂₂ = σ₁₂²`.
Making it a real, labeled, populated coordinate system would convert the page's signature
image from decoration into the map the rest of the lesson navigates.

The same applies to the MDM playground's axes, currently labeled "Channel-pattern direction
1 / 2." They are not channel-pattern directions — they are `log σ₁₁` and `log σ₂₂`. The
label obscures rather than simplifies.

### F8 — Almost no active recall, and the quiz is behind the exit. *(medium)*

Across a stated 35-minute lesson: **6 sliders, 12 buttons, 3 collapsed `<details>`
self-checks, and one 3-question quiz.** Every interaction is exploratory; the learner is
never asked to *commit to a prediction before seeing the answer*, which is the single
highest-yield retention mechanic available and costs almost nothing to add.

The 3-question quiz sits **after** the Colab call-to-action, so most learners who follow
the page's own instruction to go run the notebook will never reach it.

### F9 — The competition claim is unsourced and uncashed. *(low-medium)*

> Decoders built on it have won a string of international BCI competitions

True, and a great hook — but the page never says which competitions, what margin, or
against what. The references list Barachant's foundational papers but never connects them
to the claim. One sentence with a number and a citation would turn an assertion into
evidence.

### F10 — Mobile: the part-navigation is clipped, and the page is ~48 screens long. *(medium)*

At 390px the sticky chapter-map is cut off mid-word after "Part 3" — Parts 3 and 4 are
unreachable and the strip visually collides with the content scrolling behind it. The page
is **40,384px tall on mobile** versus 24,776px on desktop: roughly 48 phone screens of
continuous scrolling with no collapse, no jump-back, and a broken part-nav. There is no
horizontal document overflow, so this is contained to the nav component.

---

---

## The notebook

The notebook is the stronger of the two artifacts on rigor and the weaker on engagement.
It is an honest, disciplined piece of work — and it is a **film, not a workshop**.

**What it does better than the page.** It writes the affine-invariant distance out
explicitly — `d_R(C₁,C₂) = ‖log(C₁^(−1/2) C₂ C₁^(−1/2))‖_F` — twice, and unpacks it into
named steps with the relative eigenvalues and their logarithms hand-computed. It *tests*
congruence invariance with a real assertion. Its validation discipline is genuinely good:
leave-one-group-out over recording runs, every transform inside a `Pipeline` so nothing
leaks, an explicit disjointness assertion, a strong CSP baseline rather than a strawman,
balanced accuracy, and a paired low-data design. Six executable assertions encode the
claims as checks rather than prose.

**The same flatness problem, inherited.** Every toy matrix in the notebook — `toy_a`,
`toy_b`, all three `toy_trials` — is diagonal, hence mutually commuting, so the
affine-invariant geometry again collapses to elementwise log arithmetic. And the congruence
demo uses `channel_gain = np.diag([3.0, 0.4])` — a *diagonal* `G`, which only proves
invariance to per-channel gain. The prose is accurate, but the physically interesting cases
in EEG are exactly the non-diagonal ones: volume conduction, re-referencing, a montage
change, linear source mixing. **No geodesic anywhere in either artifact ever rotates an
ellipse.** Changing that one line to a full invertible mixing matrix is the highest-leverage
edit in the entire project.

**The website's headline promise is never tested.** Transfer learning / recentering —
"the geometry's quiet superpower" — has no implementation. No recentering, no whitening to
a session mean, no before/after. This is doubly frustrating because the notebook already
has three runs, already holds out runs, and already plots tangent-space PCA *styled by
run* — a figure whose whole point could be "look, the runs sit in different places." The
demo is roughly fifteen lines away. The Riemannian potato is likewise a styled aside on the
page and an unsolved exercise in the notebook.

**Tangent space is the weakest coverage in either artifact** — no log-map formula, the base
point never identified as the training Riemannian mean, no mention of the √2 off-diagonal
weighting, and the tangent+LR pipeline *wins* in cell 32 but is only explained around cell
44. The Fréchet mean's iterative algorithm is never shown either, though the objective is.

**Zero interactivity.** No TODO cells, no predict-before-you-run prompts, no self-checks.
Two editable knobs, both unmarked. Seven prose exercises with no starter code and no
solutions, stranded after two optional appendices — past the point most readers stop. The
interactivity gradient runs backwards: the website has five explorers and a quiz, and the
notebook, where interaction is free, has none.

**Correctness and rigor issues worth fixing:**

- **The SPD verification cell contradicts itself on screen.** Cell 23 prints `smallest
  eigenvalue 0.0 / largest eigenvalue 0.0` next to `all eigenvalues positive: True` — a
  V²-scaling formatting artifact. The one cell whose job is to convince you every
  eigenvalue exceeds zero displays what looks like evidence that they are zero.
- **Precision far exceeds resolution.** 45 trials total, ~15 per fold; one flipped trial
  moves balanced accuracy ~6.25 points. All three pipelines score identically at full
  calibration (0.979 ± 0.036) because they make the same single error. Quoting "94.5% vs
  94.9%" is a distinction of well under one trial, and no significance test appears
  anywhere.
- **The confidence bands in the site's headline figure are invalid.** Cells 40–41 pool
  3 folds × 10 repeats as 30 independent observations; repeats within a fold share a test
  set. The bands render tighter than the evidence warrants, visually overstating the
  separation between curves.
- **The most-preached lesson is the one hidden piece of code.** In the Colab variant — the
  one learners actually open — `build_pipelines` and `evaluate_leave_one_group_out` are
  embedded in a single escaped one-line string. The leakage-safe validation logic the
  notebook lectures about twice is unreadable at the point it is promised.
- OAS shrinkage is named but never explained, and with 17 channels × 321 samples it is
  barely doing anything — a regularization habit taught without the diagnostic for when it
  matters.

**Website↔notebook coherence is good where it's claimed.** All four "concept-to-code"
mappings are real and accurate. The quoted 84.2 / 94.5 / 94.9 are genuinely computed, match
cell 39's `trials_per_class = 2` row exactly, and "one participant / two trials per class"
is accurate. Two framing caveats: that row is **the most Riemannian-favourable one in the
table** — at 10 trials/class the ordering reverses and CSP+LDA leads (0.978 vs 0.967 /
0.972) — and the page's "all three methods performed similarly" is a soft rendering of a
crossover the reader never sees. The notebook's own text is more careful than the page's.

**The best result in the project is missing from the page.** The notebook runs a controlled
contrast — *same covariance features, different geometry* — and gets Euclidean covariance
mean **0.824 ± 0.104** versus Riemannian MDM **0.979 ± 0.036**, a delta of **+0.155**. That
is the cleanest evidence either artifact produces, and it is the only experiment that
separates "covariance features help" from "**the geometry** helps" — which is precisely the
question finding F1 says the page leaves unanswerable. It appears nowhere on the website.

---

## Scored against the eight things a learner must actually take away

Independent of this page, here is what the literature says a learner must be able to state
in their own words to genuinely understand and apply this. I checked each against what the
page + notebook deliver.

| # | The takeaway | Delivered? |
|---|---|---|
| 1 | **The feature is covariance, and that's forced, not chosen** — the BCI signal is band-power modulation (ERD/ERS), which is second-order; covariance is the sufficient statistic of a band-passed zero-mean Gaussian epoch. | **Partly.** The page says *what* covariance is, clearly. It never says *why it is the right object* — so the whole edifice can read as maths in search of an application. |
| 2 | **Covariance matrices form an open convex cone, not a vector space** — `A − B` isn't a covariance; `(A+B)/2` is, but it's the wrong one. | **Partly.** Asserted and drawn, never demonstrated. Nobody ever perturbs an entry and watches positive-definiteness break. |
| 3 | **Every EEG nuisance you hate is a congruence `C ↦ W C Wᵀ`** — volume conduction, lead field, electrode gain, referencing, whitening, spatial filtering, session drift are all the same algebraic form. *This is the observation the entire field is built on.* | **No.** Absent from the page entirely. This is the single most important sentence in the subject and it does not appear. |
| 4 | **AIRM is the metric that is blind to congruence**, which is why it's the right ruler for EEG. (Bonus depth: it *is* the Fisher–Rao information metric on zero-mean Gaussians — so "distance" means "how statistically distinguishable are the underlying sources.") | **No** on the page; **weakly** in the notebook (diagonal `G` only). |
| 5 | **The arithmetic mean swells** — `det((A+B)/2) ≥ √(det A · det B)`, with the Riemannian mean achieving equality. The Euclidean average of two brain states is a fabricated state with more generalized variance than either. | **Yes.** Well delivered in both artifacts. The page's best work. |
| 6 | **Curvature is a *consequence* of demanding invariance, and its sign is the good one** — non-positive ⇒ exactly one geodesic between any two points ⇒ the Fréchet mean exists and is unique ⇒ the iterative algorithm converges. | **No, and inverted.** The page presents curvature as the *cause* (F3) and primes the wrong sign via the gravity well (F4). |
| 7 | **The tangent space is a change of coordinates, not a new idea** — pick the Fréchet mean as origin, log-map, and you're in `ℝ^{d(d+1)/2}` where logistic regression works. The punchline is that the geometry does its work at feature extraction and then *ordinary* ML takes over; there is no exotic classifier. | **Partly.** The punchline is stated. The mechanics (matrix log ≠ elementwise log, base point = training mean, √2 isometry) are missing from both. |
| 8 | **Recentering is the payoff, and it's free** — `C ↦ M^(−1/2) C M^(−1/2)` slides each session onto the identity. Within-session structure is preserved *exactly* (congruence is an isometry) while the between-session shift is cancelled *exactly* (the shift is itself a congruence). No Euclidean method can claim both halves. | **No.** Asserted on the page as "the quiet superpower," never implemented anywhere. |

**Three of eight land. Two land partly. Three — including the two most important
(numbers 3 and 8) — do not land at all.**

Note the pattern: the takeaways the project delivers are the ones about *positivity and
scale*; the ones it misses are all about *invariance*. That is the same finding as F1/F2
arriving from a different direction.

### One consequence worth flagging separately

The literature's honest empirical story is **better** than the one the page tells, and the
page is leaving credibility on the table. On BCI Competition IV-2a cross-session
(Congedo, Barachant & Andreev 2013), MDM did **not** beat CSP+LDA on binary accuracy —
79.71 ± 9.44 vs 80.45 ± 12.30, explicitly "no difference." What it did do was:

- match that accuracy with **zero hyperparameters** (CSP needed a filter count chosen);
- cut the cross-session standard deviation by ~25–30% (9.44 vs 12.30; 13.15 vs 18.80 on
  4-class);
- and — the paper's own qualitative finding — perform "more or less equivalent for subjects
  performing well, **while it is better for subjects performing poorly.**"

**Riemannian methods compress the bad tail.** For a real BCI, reducing the
BCI-illiteracy rate matters more than raising the ceiling. That is a more defensible, more
interesting, and more *useful* headline than "94.5% vs 84.2% on one participant" — and it
survives scrutiny, which the current framing (F4.4, the cherry-picked row) does not.

---

## Scored against your four questions

Judging the learner who reads the whole page **and** works through the notebook — the
best case.

| | Verdict |
|---|---|
| **Do they understand the idea?** | **Partly.** They understand the *pipeline* well and could draw it from memory. They do not understand Riemannian geometry — they understand "use logs when averaging positive quantities," which is true, useful, and not the subject. Every worked example in both artifacts is diagonal, so nothing they were shown distinguishes affine-invariant geometry from elementwise log arithmetic. |
| **Do they understand the visualization?** | **Yes for the working widgets** (distance, mean, MDM) — clear, labeled, honest. **No for the two signature images** (the SPD cone, the tangent pentagon), which are illustrations they cannot map their own data into; one of them reports a fabricated number. |
| **Can they explain it, use it, and see the benefits?** | **They can narrate MDM** end to end and set up honest validation — that last part better than most tutorials teach. **They can state** affine invariance *if they did the notebook*, but only in its weak per-channel-gain form, which doesn't connect to volume conduction or re-referencing. **They cannot** account for the cross-session transfer benefit — the field's headline result, promised on the page and never implemented anywhere. Asked "why not just use Euclidean distance?", they have one answer (swelling) and no second line of defense — even though the notebook computed the perfect second answer (+0.155) and neither artifact surfaces it. |
| **Did they learn some Riemannian geometry generally?** | **Vocabulary, yes** — manifold, geodesic, metric, tangent space, log/exp map, Fréchet mean — plus one genuinely transferable principle: *a distance rule is a choice, and the mean is whatever minimizes summed squared distance under it.* **Concepts, thinly** — the notebook shows them the metric written down (the page never does), but neither explains what curvature is or measures, and the page's gravity-well imagery leaves an intuition (positive curvature) opposite to the truth (the SPD manifold is non-positively curved). |

**Net:** the project currently delivers an excellent *BCI pipeline* lesson with a
*Riemannian geometry* skin. The gap between those two is exactly the revision opportunity —
and closing it does not require tearing anything down. The structure, tone, craft, and
methodological honesty are already right, the orphaned widget already models real
covariance, and the notebook has already computed the missing evidence. Most of the fix is
connecting things that exist.

---

## Evidence appendix

| Claim | Evidence |
|---|---|
| All interactive math is diagonal | `src/math/geometry.ts` — `type DiagonalMatrix2 = [number, number]`, 95 lines, no off-diagonal anywhere |
| Diagonal SPD is flat | `δ = √(Σ log²(qᵢ/pᵢ))` = Euclidean distance in log coordinates; MDM widget plots `leftLogPoints` and joins them with straight lines |
| Real-covariance widget is orphaned | `rg-covariance-explorer` defined in `src/widgets/covariance-explorer.ts:8`; absent from `src/main.ts` imports and from every `rg-*` tag in `index.html` |
| No formulas / KaTeX unused | `grep -rn katex src/` → no matches; `katex@^0.16.22` present in `package.json` |
| "affine-invariant" appears twice | `index.html:793` (video blurb), `index.html:979` (glossary) |
| Fabricated distortion metric | `src/widgets/tangent-explorer.ts:264` — `Math.min(0.2, 0.075 * r * r)` |
| Interaction inventory | 6 `input[type=range]`, 12 `button`, 3 `details`, 3 quiz questions across all 7 mounted widgets |
| Page heights | 24,776px desktop @1440 · 40,384px mobile @390 |
| Section budget | Part 1 ≈ 3,334px (13.5%); relativity block alone ≈ 1,033px |
