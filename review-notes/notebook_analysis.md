# Pedagogical review — `01_riemannian_eeg_motor_imagery_colab.ipynb`

**Scope.** 52 cells (29 markdown / 23 code), helper module `riemannian_eeg_utils.py` (363 lines), `notebooks/README.md`. Numbers verified against the executed canonical twin `01_riemannian_eeg_motor_imagery.ipynb` (the Colab variant is output-stripped).

**Headline judgment.** This is a well-written, honest, unusually *disciplined* notebook — leakage-safe grouped validation, a real classical baseline, a genuinely clever controlled geometry contrast, and self-checking assertions. But as a *teaching* instrument it is a lecture, not a workshop. The learner reads and runs; they never build, predict, or decide. And the two properties that make Riemannian geometry actually matter for EEG — **affine invariance under a general congruence** and **cross-session recentering / transfer** — are respectively demonstrated only in a degenerate special case and not demonstrated at all, despite the website billing transfer as "the geometry's quiet superpower."

---

## 1. Full cell-by-cell outline

| # | Type | What it does / says |
|---|---|---|
| 0 | MD | Title + framing. Compares three pipelines (CSP+LDA, Riemannian MDM, tangent+LR) plus a deliberately plain Euclidean covariance nearest-mean diagnostic. States goal is understanding, not winning. ~30–45 min. |
| 1 | MD | "What you should be able to explain afterward" — 9 learning objectives + a "define every term before use" vocabulary rule. |
| 2 | MD | Dataset: PhysioNet EEGBCI via MNE. Defines channel / trial / motor imagery / class. 17 channels, 160 Hz, one participant, ~7.4 MB. Explains why MNE's loader is used over EEGDash. |
| 3 | MD | Environment setup preamble (Colab vs local `rnd_env`). |
| 4 | CODE | Conditional `pip install` of mne / pyriemann / scikit-learn / pandas / seaborn. |
| 5 | CODE | Locate-or-create the helper module. **Writes the entire 363-line helper as one escaped single-line string literal.** Inserts its dir on `sys.path`. |
| 6 | CODE | All imports (incl. `distance_riemann`, `geodesic_riemann`, `mean_riemann`, `TangentSpace`, `welch`, `PCA`, `LeaveOneGroupOut`), path setup, seaborn theme, version table. |
| 7 | MD | Section 0 intro: a visible two-channel example. Chain: path → distance → center → MDM. |
| 8 | CODE | `toy_a=diag(.25,4)`, `toy_b=diag(4,.25)`; entry-wise vs `geodesic_riemann` midpoint; `draw_covariance_ellipse`; 4-panel ellipse figure; **3 asserts on determinants** (swelling demonstrated). |
| 9 | MD | **"The geometry in one equation"** — the affine-invariant distance `d_R(C1,C2)=‖log(C1^-1/2 C2 C1^-1/2)‖_F`, read as three operations. |
| 10 | CODE | Hand-written `matrix_inverse_sqrt`; table of relative eigenvalues, their logs, Frobenius vs Riemannian distance; **determinant-along-the-path figure** (swelling); **diagonal channel-gain congruence invariance table + assert**. |
| 11 | MD | Names the **swelling effect**; introduces the Riemannian mean as the minimizer of total squared Riemannian distance. |
| 12 | CODE | Three *diagonal* toy trials; arithmetic vs `mean_riemann` center; total-squared-distance table; 2-panel ellipse figure; assert Riemannian ≤ arithmetic on the objective. |
| 13 | MD | Section 1 preprocessing rationale: 8–30 Hz, average reference, 1–3 s window. Defines "recording run" as the validation unit. |
| 14 | CODE | `load_motor_imagery(subject 1, runs 6/10/14)`; dataset summary + per-run condition counts. → **45 trials, 21 hands / 24 feet, 3 runs, 321 samples.** |
| 15 | CODE | Assertion block: shapes, finiteness, label set, **disjoint LOGO train/test groups**. |
| 16 | MD | Where are the selected channels? |
| 17 | CODE | `mne.viz.plot_sensors` topomap of the 17 channels. |
| 18 | MD | "A trial is a matrix, not a single waveform." |
| 19 | CODE | Class-average voltage at C3 / Cz / C4. Takeaway: no single waveform separates classes. |
| 20 | MD | Defines PSD; stresses it is a descriptive check, not a model input. |
| 21 | CODE | Welch PSD over central channels, per class, 8–30 Hz. |
| 22 | MD | Section 2: covariance defined; `C = XX^T/(n-1)`; OAS shrinkage named; **SPD defined** (all eigenvalues > 0, "form the curved space"). |
| 23 | CODE | `Covariances(estimator="oas")`; eigenvalue sanity table. **Displays "smallest eigenvalue 0.0 / largest eigenvalue 0.0" alongside "all eigenvalues positive: True"** (see §5). |
| 24 | MD | Correlation matrices used *for visualization only*; classifiers still get covariances. |
| 25 | CODE | Two 17×17 correlation heatmaps (one hands trial, one feet trial). |
| 26 | MD | Section 3: entry-wise subtraction can break positive-definiteness; restates `d_R`; defines the Riemannian mean. |
| 27 | CODE | Two class means via `mean_riemann` (on **all** data); distance between means; hands/feet log-variance-ratio topomap. |
| 28 | MD | The MDM rule: `ŷ(C) = argmin_k d_R(C, C̄_k)`. |
| 29 | CODE | Per-trial distances to both means; training-set nearest-mean accuracy (**explicitly caveated as descriptive**); MDM decision scatter with identity line. |
| 30 | MD | Section 4: defines "pipeline", CSP+LDA, MDM, and **tangent space (verbal only, one paragraph)**. |
| 31 | MD | Validation: leave-one-run-out, 3 folds; asserts every data-dependent step is fitted inside the fold; defines balanced accuracy. |
| 32 | CODE | `evaluate_leave_one_group_out` on the 3 pipelines; summary + per-fold pivot. → **all three exactly 0.979 ± 0.036.** |
| 33 | CODE | Stripplot of fold-level balanced accuracy; saves `full-calibration-performance.png`. |
| 34 | CODE | Normalized confusion matrices for all three models. |
| 35 | MD | **"Is the gain from covariance, or from Riemannian geometry?"** — sets up the controlled contrast (same estimator, different geometry). |
| 36 | CODE | Euclidean covariance nearest-mean vs Riemannian MDM under LOGO; summary, stripplot, mean delta. → **0.824 vs 0.979, delta +0.155.** |
| 37 | MD | "Read the result honestly" — geometry is not an automatic accuracy bonus; MDM's value is compactness/interpretability. |
| 38 | MD | Section 5: the low-calibration question; 2/4/6/10 trials per class, 10 repeats. |
| 39 | CODE | `evaluate_low_data_regime` on the 3 pipelines; pivot of mean balanced accuracy. → **the source of the website's 84.2 / 94.5 / 94.9.** |
| 40 | CODE | Learning-curve lineplot with 95% CI; saves `low-calibration-performance.png` (the figure the website embeds). |
| 41 | CODE | Same low-data sweep for the geometry-contrast pair; adds a "Riemannian advantage" column; lineplot. |
| 42 | MD | Interpretation: respecting matrix structure improves **data efficiency**; conclusion deliberately narrowed to this experiment. |
| 43 | MD | Section 6: source-paper map — Barachant 2012 (MDM), Barachant 2013 (tangent/kernel), Congedo 2017 (primer), **Zanini 2018 (transfer/affine alignment)**, **Barthélemy 2019 (potato)**, P300 / SPD-net / means-field. "Not magic accuracy dust." |
| 44 | MD | Section 7: tangent representation has `17·18/2 = 153` features; PCA is for display only. |
| 45 | CODE | `TangentSpace().fit_transform` on **all** covariances + PCA to 2D; scatter coloured by class, styled by run. |
| 46 | MD | Section 8: reusable pipeline snippet + 5-step MNE prep checklist (incl. "keep a group label"). |
| 47 | MD | Common mistakes: leakage, random splitting, singular covariance, unjustified filtering, one-participant conclusions, no baseline. |
| 48 | MD | Optional extension: cross-participant generalization. Code **sketch only, not executed**. |
| 49 | MD | Optional: EEGDash discovery snippet. **Not executed.** |
| 50 | MD | **Exercises** — 7 items, prose only, no starter code, no solutions. |
| 51 | MD | Sources and further reading + dataset citation. |

---

## 2. Narrative arc

The website runs: **Part 1 "The math of curves"** (Riemann, general relativity) → **Part 2 "How it connects to EEG"** → **Part 3 "Using it: the decoder"** (Move 1 distance · Move 2 class center · Move 3 prediction · plus "the other route": tangent space) → **Part 4 "do it yourself."**

The notebook runs: **Section 0 toy geometry (7–12)** → **Sections 1–2 EEG → covariance (13–25)** → **Sections 3–4 distance/mean/MDM/pipelines/validation (26–37)** → **Section 5 low-calibration (38–42)** → **Sections 6–8 literature, tangent viz, reuse (43–49)** → exercises/sources.

It mirrors the website's spine reasonably well, with four notable divergences:

1. **Order inversion at the front.** The notebook front-loads website Part 3's Moves 1–2 (distance, class center) into Section 0, *before* EEG appears. This is a defensible choice — explicitly justified as "reproduce the website lessons with matrices small enough to draw" — and it gives the geometry a clean, uncluttered first exposure.

2. **Part 1 has no notebook analogue at all.** There is no curvature intuition, no manifold picture, no "why is this space curved" moment. The notebook jumps straight to SPD matrices and asserts curvature ("SPD matrices form the curved space"). A learner arriving from the website's Riemann/relativity narrative gets no computational payoff for it. The SPD **cone** is never drawn, even though every toy example is 2×2 diagonal and therefore trivially plottable as a point in the positive quadrant.

3. **The tangent space is structurally demoted.** On the website it is a co-equal route with its own widget (`rg-tangent-explorer`) and carries the transfer-learning claim. In the notebook it gets one verbal paragraph (cell 30), then disappears until cell 44–45 — *after* the results, the literature review, and the honest-reading section. It is used in the winning pipeline long before it is explained.

4. **The notebook adds two things the website does not teach**, and they are its best material: the **Euclidean-vs-Riemannian controlled contrast** (35–36, 41) and the **low-calibration learning curve** (38–42). The contrast is the single most pedagogically valuable idea in the notebook — it converts "geometry is better" from a slogan into a measured, falsifiable claim — and it is invisible on the website.

**Arc weakness.** The emotional peak (cell 36: geometry buys +0.155) lands *before* the tangent space is explained and before the low-data story. The notebook then trails off through a literature review, a late visualization, two un-executed optional snippets, and a prose exercise list. The last third loses momentum.

---

## 3. Conceptual coverage

### SPD manifold / cone structure — **explained thinly, never shown**
Cell 22 defines SPD correctly (symmetric, all eigenvalues > 0) and cell 26 gives the key motivating sentence: "changing one covariance entry can break positive definiteness." That is the right instinct. But nothing *demonstrates* it — no cell perturbs an entry and shows an eigenvalue going negative, and the cone is never visualized. The learner is told the space is curved and must take it on faith.

**Aggravating factor: every toy matrix in the notebook is diagonal.** `toy_a`, `toy_b` (cell 8) and all three `toy_trials` (cell 12) are diagonal, hence **mutually commuting**. For commuting SPD matrices the affine-invariant geodesic collapses to the elementwise geometric mean and the Riemannian mean collapses to the elementwise geometric mean of eigenvalues. So the entire geometric intuition is built in the one degenerate case where "Riemannian" reduces to "take logs, average, exponentiate." A learner could correctly reproduce every figure in Section 0 and still believe Riemannian geometry *is* log-space Euclidean geometry. No example anywhere shows a geodesic **rotating** an ellipse.

### Affine-invariant distance formula — **shown explicitly, twice** ✅
Cell 9 states `d_R(C1,C2) = ‖log(C1^-1/2 C2 C1^-1/2)‖_F` and unpacks it into three named operations; cell 26 restates it. Cell 10 then hand-computes `matrix_inverse_sqrt`, forms the relative transform, and tabulates the relative eigenvalues and their logarithms. This is genuinely good — the formula is not a black box.

### Congruence / affine invariance — **demonstrated, but only in the degenerate diagonal case** ⚠️
This is the property the review was asked to flag, so, precisely: **it is present, not absent.** Cell 10 builds `channel_gain = np.diag([3.0, 0.4])`, forms `G A Gᵀ` and `G B Gᵀ`, tabulates Frobenius vs Riemannian distance before and after, and closes with `assert np.isclose(distance_riemann(toy_a,toy_b), distance_riemann(rescaled_a,rescaled_b))`. The markdown takeaway is correct and well-phrased.

**But `G` is diagonal.** The demonstration therefore only establishes invariance to *per-channel gain rescaling* — which is what the prose claims ("invertible channel rescaling"), so it is not wrong, merely weak. Affine invariance holds for **any** invertible `G`, and the physically interesting cases in EEG are exactly the non-diagonal ones: volume conduction, re-referencing, a change of electrode montage, a linear mixing of sources. A learner who sees only `diag(3.0, 0.4)` will not connect the property to "why this survives a different amplifier or a re-reference." Changing one line to a full invertible mixing matrix would convert a technically-correct footnote into the notebook's most important result. **This is the single highest-leverage one-line fix in the notebook.**

### Swelling effect — **demonstrated numerically, well** ✅
Best-covered concept in the notebook. Cell 8 asserts `sqrt(det(entry_midpoint)) > 2.0` while both endpoints and the Riemannian midpoint have `sqrt(det) = 1.0`; the ellipse figure makes it visible; cell 10 plots determinant along the whole path for both interpolations; cell 11 names it. Exactly the right treatment.

### Riemannian / Fréchet mean — **objective shown, algorithm not** ⚠️
Cell 11 states the objective in words; cell 12 operationalizes it by computing total squared Riemannian distance for two candidate centers and asserting the Riemannian one wins. That is meaningfully better than just calling the function — the learner sees *what is being minimized*.

What is missing is **how**: the iterative fixed-point scheme (project all matrices to the tangent space at the current estimate via `log`, average there, `exp` back, repeat until convergence) is never shown, described, or referenced. Since that loop is ~6 lines and is *the* algorithm that makes the tangent space and the mean one idea rather than two, this is a real gap. Also, comparing two hand-picked candidates does not establish minimality over the manifold; a convergence trace (objective vs iteration) would.

### Tangent space / log map — **weakest coverage in the notebook** ❌
- The **log map formula is never written down.** Not once. Cell 30 offers only "a flat coordinate system attached near a reference point on the curved SPD space"; cell 44 says it "has one feature for each unique covariance entry."
- The **reference point is never identified.** `TangentSpace` uses the Riemannian mean of the fitted data as its base point; the notebook never says so. Cell 30's "a reference point" leaves the learner unable to answer "attached where?" — and this is precisely the quantity that recentering/transfer manipulates.
- The **√2 weighting on off-diagonal entries is never mentioned.** The 153 count is explained via symmetry (`17·18/2`), which is good, but *why* off-diagonals carry a `√2` — so that the Euclidean norm of the vector equals the Frobenius norm of the matrix, i.e. so the vectorization is an isometry — is absent. Without it "map the matrix to a vector" looks like arbitrary bookkeeping rather than a structure-preserving map.
- Ordering problem: tangent+LR is *the winning pipeline* in cells 32–33 and is only explained in cells 44–45.

### Transfer learning / recentering / cross-session alignment — **entirely absent** ❌❌
**The most significant gap, and the sharpest website↔notebook contradiction.** The website (index.html:669–675) says: "The same re-centering on a reference also makes two recordings line up — which is how a decoder transfers to a new session or person with little recalibration, **the geometry's quiet superpower**." The website's limits section also flags "Changing distributions … alignment may help but must be tested."

The notebook **never tests it**. Zanini et al. (2018) is cited in cell 43 prose; cell 48 mentions in passing that "alignment and transfer-learning methods should be evaluated inside the same held-out-participant protocol" — as advice, with no code. There is no recentering, no whitening to a session mean, no `TLCenter`, no before/after comparison.

This is doubly frustrating because **the notebook already has everything needed**. It has three runs, it already holds out runs, and cell 45 already plots tangent-space PCA *styled by run* — a figure whose entire purpose could be "look, the runs sit in different places," immediately motivating recentering. Recentering each run's covariances by that run's own Riemannian mean is ~3 lines, needs no new data or dependencies, and would let the learner *measure* the superpower the website promises. Its absence means the notebook's advertised payoff is asserted on the website and unverified in the code.

### Riemannian potato / artifact rejection — **mentioned only** ❌
The website devotes a styled aside to it ("One representation, two jobs"). The notebook cites Barthélemy et al. (2019) in cell 43 and offers it as **exercise 7** — with no code and no solution. Given that distance-to-global-mean is already computed in spirit at cell 29, a working potato would be ~5 lines.

### Coverage summary

| Concept | Status |
|---|---|
| Affine-invariant distance formula | ✅ explicit, unpacked, hand-computed |
| Swelling effect (numeric) | ✅ asserted + plotted along the path |
| Congruence invariance | ⚠️ demonstrated, but diagonal `G` only |
| Riemannian mean | ⚠️ objective shown; iterative algorithm absent |
| SPD manifold / cone | ⚠️ defined in words; never shown; all toys commute |
| Tangent space / log map | ❌ verbal only; no formula, no base point, no √2 |
| Transfer / recentering | ❌ absent (website's headline claim) |
| Riemannian potato | ❌ prose + unsolved exercise |

---

## 4. Does the learner DO anything?

**Essentially nothing. Count of genuinely interactive moments in the notebook body: zero.**

- **TODO cells / blanks to fill: 0.** Every code cell is complete and runs to completion on "Run all."
- **Predict-before-you-run prompts: 0.** No cell asks the learner to commit to an answer first — despite several perfect opportunities (Will the entry-wise midpoint be bigger or smaller? Will the Riemannian distance change under rescaling? Which model wins with 2 trials?).
- **Active recall / self-check: 0.** Notably, **the website has an `rg-concept-check` widget and five interactive explorers** (`distance-explorer`, `mean-explorer`, `tangent-explorer`, `mdm-playground`, `covariance-explorer`). The notebook — the medium where interaction is *free* — has none. The interactivity gradient runs backwards.
- **Parameters inviting change: 2, unmarked.** `SUBJECTS`/`RUNS` (cell 14) and `trials_per_class` (cell 39) are editable but never flagged as knobs. No "try changing this" callouts.
- **Exercises: 7 (cell 50), prose only.** No starter code, no expected output, no solutions, no hints. They are also **positioned after the reuse guide, the common-mistakes list, and two optional appendices** — i.e. past the point most readers stop. Exercises 3, 6, and 7 (cross-participant, Log-Euclidean, potato) are the most valuable content in the notebook and are the least likely to be attempted.
- **Assertions: 6 across cells 8, 10, 12, 15.** These are a real strength — they encode the claims as executable checks. But they are pre-written and pre-passing, so they function as reassurance, not as learning. Turning even two into "fix the broken assertion" would be transformative.

**Verdict.** The notebook is a well-narrated demonstration film. A learner who runs every cell will have *seen* Riemannian geometry work and will be able to *describe* it. Whether they can *apply* it is untested by the notebook itself — the only thing they are asked to produce is a mouse click on "Run all."

---

## 5. Correctness / rigor issues

Ordered by severity.

**5.1 — The SPD verification cell displays `0.0` for both eigenvalue bounds.** (cell 23, high severity, trivially fixable)
The executed output reads:
```
smallest eigenvalue            0.0
largest eigenvalue             0.0
all eigenvalues positive      True
```
EEG covariances are in V², so eigenvalues are ~1e-10 and the mixed-dtype `pd.Series` renders them as `0.0`. The cell whose entire job is to convince the learner that "every eigenvalue is greater than zero" therefore **displays evidence that appears to contradict its own conclusion**. A learner who reads carefully will be confused; one who reads carelessly will conclude the matrices are singular. Fix: scale to µV² or format with `{:.3e}`.

**5.2 — Sample size is far too small for the precision being reported.** (cells 32–42, and the website)
The dataset is **45 trials total** (21 hands / 24 feet) across 3 runs, so each LOGO test fold has ~15 trials. One flipped trial moves balanced accuracy by ~6.25 points. All three pipelines score *identically* (1.0, 0.9375, 1.0 → 0.979 ± 0.036) because they all make the same single error. Reporting a standard deviation over **3 folds** is not meaningful, and no significance test is performed anywhere. The notebook is admirably honest about *scope* ("one participant", "deliberately narrow") but never about *resolution* — it never says "differences smaller than one trial are not resolvable here."

**5.3 — Seaborn 95% CIs in cells 40 and 41 are statistically invalid (too narrow).** `errorbar=("ci", 95)` pools 3 folds × 10 repeats = 30 observations as if independent. They are not: the 10 repeats within a fold share the *same test set*, and the folds share the same participant. The resulting bands will look far tighter than the evidence warrants, which visually overstates the separation between the curves — in the very figure the website embeds as its headline result. Should be a per-fold CI, or repeats shown as raw scatter.

**5.4 — All geometric intuition is built on commuting (diagonal) matrices.** (cells 8, 10, 12) See §3. Not an error, but a genuine conceptual hazard: the affine-invariant geometry is only *distinguishable* from log-Euclidean bookkeeping in the non-commuting case, which never appears.

**5.5 — Congruence invariance shown only for diagonal `G`.** (cell 10) See §3. The prose is accurate but the demonstration is much weaker than the property.

**5.6 — Tangent-space visualization fits its reference on all data.** (cell 45) `TangentSpace().fit_transform(covariances)` uses every trial, including those that are test data in the validation sections. It is genuinely visualization-only and the *classifiers* are clean (fitted inside folds via `Pipeline` + `LeaveOneGroupOut`, verified in cell 15). But a notebook that lectures on leakage in cells 31 and 47 should state the exemption explicitly, as it does elsewhere. Compare cell 29, which handles the identical situation *correctly and explicitly* ("This is descriptive only; validation below rebuilds the means inside each training fold") — cell 45 simply omits the equivalent sentence. Same for cell 27's all-data class means.

**5.7 — OAS shrinkage is named but never explained or justified.** (cell 22) The markdown presents the sample formula `C = XX^T/(n-1)` and then says "We use OAS shrinkage, a regularized estimate that is more stable when the trial is short." What OAS *does* (shrink toward a scaled identity, `(1-α)S + α·(tr S/p)·I`) is never stated, and the shrinkage coefficient is never displayed. Moreover the stated justification is weak here: with **17 channels and 321 samples**, `n ≫ p` and the sample covariance is already comfortably full-rank — so OAS is doing very little, and the learner is given a regularization habit without the diagnostic that would tell them when it actually matters. Exercise 2 asks them to compare estimators but offers no guidance on what to look for.

**5.8 — The helper module is delivered as an unreadable one-line string.** (cell 5) In the Colab variant — *the one learners actually open* — `build_pipelines`, `evaluate_leave_one_group_out`, and `evaluate_low_data_regime` are embedded in a single escaped string literal. The learner cannot read them in the notebook. So the **leakage-safe validation logic — the notebook's most-preached and most transferable lesson — is the one piece of code hidden from view.** They must separately open the written-out file to see it. Cell 31's promise ("Every data-dependent step … is fitted inside the training fold") is therefore unverifiable by the reader at the point it is made.

**5.9 — Two "optional" sections are never executed.** (cells 48, 49) The cross-participant extension and the EEGDash snippet are markdown code blocks. The EEGDash one is claimed "tested with EEGDash 0.8.3" but nothing in the notebook verifies it, and it will silently rot.

**5.10 — Minor.** Cell 43's "P300 and recent deep/SPD extensions" bullet cites no specific work inline (the means-field paper is in cell 51's list only). Cell 29's descriptive training-set accuracy is correctly caveated but sits visually adjacent to the validated numbers, inviting confusion.

**What is done right (worth preserving):** grouped LOGO validation with an explicit disjointness assertion (cell 15); every transform inside `Pipeline` so nothing leaks; a strong classical baseline rather than a strawman; the paired low-data design (same sampled training sets shared across models within a repeat, same seed reused in cell 41, so the geometry contrast is genuinely paired); balanced accuracy for mildly imbalanced classes; and the repeated, sincere refusal to oversell (cells 37, 42, 43, 47).

---

## 6. Website ↔ notebook coherence

### The four "concept-to-code" mappings — **all four exist** ✅

| Website claim | Notebook reality | Verdict |
|---|---|---|
| "halfway and distance" → **two-channel path comparison**<br><small>"Reproduce the swelling effect numerically and verify both midpoint determinants."</small> | Cells 7–10. Both midpoints computed; `assert sqrt(det(toy_a))≈1`, `assert sqrt(det(entry_midpoint))>2`, `assert sqrt(det(riemannian_midpoint))≈1`. | ✅ **Exact.** Description matches line for line. |
| "class prototype" → **Riemannian mean objective**<br><small>"Compare total squared Riemannian distance for two candidate centers."</small> | Cell 12. `total_squared_riemannian_distance` evaluated for the arithmetic and Riemannian centers, tabulated, asserted. | ✅ **Exact.** |
| "tangent space" → **full feature pipeline**<br><small>"Map real covariance matrices to vectors and train logistic regression inside each fold."</small> | `build_pipelines` → `Covariances → TangentSpace → LogisticRegression`, evaluated under LOGO in cell 32; standalone map + PCA in cell 45. | ✅ **Code claim true** (the LR genuinely trains inside each fold). ⚠️ But the *concept* it points at is the notebook's least-explained topic (§3), and the pipeline code itself is hidden in cell 5's string blob. |
| "MDM prediction" → **held-out-run validation**<br><small>"Measure whether the complete decision rule generalizes to an unseen recording run."</small> | Cells 31–34: LOGO over 3 runs, per-fold table, stripplot, confusion matrices. | ✅ **Exact.** |

No broken mappings. The concept-to-code section is honest.

### The quoted numbers — **all verified, computed not hard-coded** ✅

From the executed canonical notebook, cell 39 (`low_data_summary`):

| trials/class | CSP + LDA | Riemannian MDM | Tangent + LR |
|---|---|---|---|
| **2** | **0.842** | **0.945** | **0.949** |
| 4 | 0.948 | 0.961 | 0.963 |
| 6 | 0.950 | 0.965 | 0.969 |
| 10 | 0.978 | 0.967 | 0.972 |

- **84.2% / 94.5% / 94.9%** → exactly the `trials_per_class = 2` row. ✅
- **"two training trials per class"** → accurate. ✅
- **"one participant"** → accurate (subject 1, runs 6/10/14). ✅
- **"mean balanced accuracies"** → accurate; that is what cell 39 aggregates. ✅
- The embedded figure `/media/low-calibration-performance.png` is the genuine artifact saved by cell 40 (present in `public/media/`, `notebooks/figures/`, and both dist trees). ✅

**Two framing caveats:**

1. **The quoted row is the most Riemannian-favourable one in the table.** At 10 trials/class the ordering *reverses* and CSP+LDA leads (0.978 vs 0.967 / 0.972). The website's sentence "With fuller calibration, all three methods performed similarly" is defensible — and the full-calibration LOGO result really is identical (0.979 across the board) — but a reader sees three headline percentages and one hedge, not the crossover. The notebook's own cell 42 is more careful than the website is.
2. **Spurious precision.** With ~15-trial test folds, quoting 0.1%-resolution differences implies a precision the design cannot support (§5.2). "94.5% vs 94.9%" is a distinction of well under one trial.

### Coherence gaps in the other direction

- **Transfer learning.** Website: "the geometry's quiet superpower." Notebook: no implementation (§3). This is the largest incoherence in the pair.
- **Riemannian potato.** Website: a dedicated styled aside. Notebook: an unsolved exercise.
- **Curvature intuition.** Website Part 1 spends a whole act on it. Notebook: no analogue.
- **Interactivity inverted.** Website: 5 explorer widgets + a concept check. Notebook: nothing.
- **The notebook's best idea is missing from the website.** The Euclidean-vs-Riemannian controlled contrast (cells 35–36: +0.155, and the strongest, cleanest evidence either artifact produces) appears nowhere on the site.

---

## 7. Top 10 improvements, ranked by pedagogical impact

**1. Demonstrate congruence invariance with a *non-diagonal* mixing matrix.** (cell 10, ~2 lines)
Replace `channel_gain = np.diag([3.0, 0.4])` with a full invertible `G` (e.g. `np.array([[1.2, 0.7],[-0.4, 0.9]])`), keep the existing table and assert, and reframe the prose: this `G` is what volume conduction, a re-reference, or a different amplifier *does* to your covariances — and the Riemannian distance does not notice. Highest impact per character in the whole notebook: it upgrades the notebook's key property from a technicality to the reason the method exists. Keep the diagonal case as a warm-up if desired.

**2. Add a cross-session recentering demo — deliver the website's promised superpower.** (new cells after 45, ~15 lines)
Reuse cell 45's tangent-PCA figure to *show* that the three runs occupy different regions; then recenter each run by its own Riemannian mean (whiten: `M_run^{-1/2} C M_run^{-1/2}`), replot, and re-run LOGO before/after. This closes the single biggest website↔notebook gap, needs no new data or dependencies, and turns Zanini et al. from a citation into a result. Even a null or negative result on 3 same-session runs is a valuable, honest lesson.

**3. Introduce at least one non-commuting toy example.** (cells 8 and 12, ~3 lines)
Add a rotated pattern (e.g. `R(30°) @ diag(4, 0.25) @ R(30°).T`) so the geodesic visibly *rotates* the ellipse rather than only rescaling its axes. Without this the learner cannot distinguish affine-invariant geometry from elementwise log-space arithmetic, and every current figure is consistent with the wrong mental model.

**4. Teach the tangent space properly, and move it before cell 32.** (rewrite cell 30; new code cell)
Write the log map `Log_C̄(C) = log(C̄^{-1/2} C C̄^{-1/2})` explicitly; state that pyRiemann's base point **is the Riemannian mean of the training set**; and show the upper-triangle vectorization with the **√2 off-diagonal weighting**, explaining it as the choice that makes the vector's Euclidean norm equal the matrix's Frobenius norm (i.e. an isometry, not bookkeeping). Verify with a 3-line assert against `TangentSpace().fit_transform`. Currently the winning pipeline is used ~14 cells before it is explained.

**5. Fix the eigenvalue display in the SPD check.** (cell 23, 1 line)
Scale to µV² or format `{:.3e}`. Additionally, add two lines that perturb one off-diagonal entry until an eigenvalue goes negative — this makes cell 26's central claim ("changing one covariance entry can break positive definiteness") *demonstrated* instead of asserted, and is the cheapest way to make the manifold feel real.

**6. Convert the notebook from read-only to participatory: add 5–6 predict-then-run prompts and 3 real TODO cells.** (throughout)
Concretely: before cell 8, "will the entry-wise midpoint's area be larger, smaller, or equal?"; before cell 10, "will the Riemannian distance change under rescaling?"; before cell 36, "same features, different geometry — how much will it matter?"; before cell 39, "which model wins with 2 trials?". Then make three cells genuine TODOs with the solution folded below: implement `riemannian_distance` from `eigvalsh` (and assert it matches `distance_riemann`), implement the Fréchet mean loop (see #7), implement the potato (see #8). This is the difference between a film and a workshop.

**7. Show the Riemannian mean's iterative algorithm.** (new cell after 12, ~8 lines)
Implement the fixed-point loop — log-map all matrices to the tangent space at the current estimate, average, exp-map back, repeat — plot the objective decreasing per iteration, and assert convergence to `mean_riemann`. This is the cell that unifies mean, log map, and tangent space into one idea, and it makes #4 land much harder.

**8. Implement the Riemannian potato instead of assigning it.** (new cell, ~6 lines)
Distance from each trial covariance to the global Riemannian mean, a z-score threshold, and a plot of the flagged trials' raw traces so the learner *sees* the artifact that was caught. Delivers the website's "one representation, two jobs" aside, and is a natural, satisfying capstone.

**9. Report uncertainty honestly and fix the invalid CIs.** (cells 32, 39, 40, 41)
State plainly that 45 trials / ~15 per fold means one trial ≈ 6.25 points and that sub-trial differences are noise. Replace seaborn's pooled `ci=95` with per-fold aggregation or raw repeat scatter. Add a permutation test or at minimum a "differences smaller than X are not resolvable" note. This protects the learner from the exact over-reading the website's three headline percentages encourage — and it is squarely in the spirit of the notebook's own "Common mistakes" section.

**10. Restructure the ending and inline the helper.** (cells 5, 43–51)
Move the exercises (cell 50) up to immediately follow the relevant sections rather than stranding them after two optional appendices, and add solutions/hints. Split cell 5's one-line string blob so that at minimum `build_pipelines` and `evaluate_leave_one_group_out` are **visible, readable code in the notebook** — the leakage discipline the notebook preaches hardest is currently the only code the Colab learner cannot see. Consider also surfacing the Euclidean-vs-Riemannian contrast (cells 35–36) on the website, since it is the strongest evidence either artifact produces.

---

## Appendix — verified figures

- Dataset: 45 trials (21 hands / 24 feet), 3 runs × 15, 17 channels, 321 samples @ 160 Hz, subject 1.
- Full-calibration LOGO: CSP+LDA = Riemannian MDM = Tangent+LR = **0.979 ± 0.036**; per fold (1.0, 0.9375, 1.0).
- Geometry contrast LOGO: Euclidean covariance mean **0.824 ± 0.104** vs Riemannian MDM **0.979 ± 0.036** → delta **+0.155**.
- Low calibration (2 trials/class): **0.842 / 0.945 / 0.949** — the website's quoted numbers, confirmed.
- Crossover at 10 trials/class: CSP+LDA **0.978** overtakes MDM 0.967 and tangent 0.972.
