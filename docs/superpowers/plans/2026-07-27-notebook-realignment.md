# Notebook Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the notebook mirror the page's two-decoder fork, and turn it into the place where the advantages of Riemannian geometry are *measured on real EEG* rather than asserted — including two experiments the notebook has never had.

**Architecture:** The notebook is generated from `notebooks/build_notebook.py`; nothing is edited in the `.ipynb` directly. Structural changes move existing cell definitions within that file; two new experiments are added as new cells; then the notebook is rebuilt, executed against the real PhysioNet subset, and the numbers it produces are propagated back to the page.

**Tech Stack:** Python, `rnd_env` conda environment (confirmed present), MNE, pyRiemann, scikit-learn, nbformat.

**Spec:** [`docs/superpowers/specs/2026-07-27-page-flow-redesign-design.md`](../specs/2026-07-27-page-flow-redesign-design.md) §9. **Read §9.3 before writing any copy about CSP** — it names a claim that is false and easy to make by accident.

**Runs after:** `2026-07-27-page-flow-redesign.md`. Task 6 of this plan replaces a block that plan deliberately left provisional.

## Global Constraints

- **All edits go in `notebooks/build_notebook.py`.** The `.ipynb` files are build artefacts. Rebuild with `conda run -n rnd_env python notebooks/build_notebook.py`.
- **Never write a number before the notebook has produced it.** Every figure quoted in notebook prose or on the page comes from an executed cell, read off the output. This applies to the new experiments and to every number already on the page.
- **CSP + LDA is congruence-invariant too.** Spec §9.3. Do not write, imply, or let a figure suggest that E2 shows Riemannian surviving a hardware change while CSP fails. The honest contrast is against the *Euclidean* covariance treatment.
- **Keep every existing honest negative result.** The §5b re-centring null result is one of the best things in the notebook. It is joined, never replaced.
- **Unchanged:** dataset, the leave-one-group-out protocol, the three exercises, the per-fold statistics.
- Rebuild and confirm both `.ipynb` files regenerate cleanly before every commit.

---

## File Structure

**Modified**

| File | Change |
|---|---|
| `notebooks/build_notebook.py` | §4 split into two routes; tangent visualisation moved up; new "what the geometry buys you" part; E2, E3 and the divergence cell added; anchors and map/globe wording. |
| `notebooks/01_riemannian_eeg_motor_imagery.ipynb` | Regenerated and executed. |
| `notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb` | Regenerated. |
| `notebooks/README.md` | Section list updated to the new structure. |
| `index.html` | The provisional `transfer-caveat` block replaced; any quoted number that moved, corrected. |
| `src/glossary.ts` | Notebook anchors in `hrefLabel` where a formula has a notebook counterpart. |

**Created**

| File | Responsibility |
|---|---|
| `docs/wix-port-guide.md` | Ordered, section-by-section list of what to place on the Wix page and what text goes in it. |

---

## Task 1: Split Part 4 into two routes

**Files:**
- Modify: `notebooks/build_notebook.py:1114-1215` (the `## 4. Three complete BCI pipelines` cell and its three sub-headings)
- Modify: `notebooks/build_notebook.py:1880-1926` (the `## 7. Visualize the tangent-space coordinates` cell and its code cell)

**Interfaces:**
- Consumes: `build_pipelines()` from `notebooks/riemannian_eeg_utils.py:200`, unchanged.
- Produces: sections `## 4. Route 1 — measure on the surface` and `## 5. Route 2 — draw a local map first`, and renumbered sections 6 onward. Tasks 2–5 append after these.

The notebook currently *uses* tangent space inside a pipeline at §4 and only
*shows* what tangent space is at §7, twenty cells later. That is the same
ordering defect the page had.

- [ ] **Step 1: Rename §4 and split its sub-headings**

Replace the `## 4. Three complete BCI pipelines` markdown cell with two cells.
The first:

```markdown
## 4. Route 1 — measure on the surface

The page's Route 1. Nothing is flattened and no boundary is fitted: store one
covariance centre per class, and label a new trial by whichever centre is
nearest in Riemannian distance.

Because there is no boundary to fit, there is very little to overfit — which is
why this route is the one that works with almost no calibration data.
```

Keep the existing `### Riemannian MDM` sub-heading content under it. Move the
`### CSP + LDA` sub-heading text down to Task 2's comparison, where the
baseline belongs.

The second:

```markdown
## 5. Route 2 — draw a local map first

The page's Route 2. Whiten every covariance matrix by a reference point, take
the matrix logarithm, and read off the independent entries. Each trial is now a
short vector, and any ordinary classifier can read it.

The reference point is chosen to be the Riemannian mean of the data, and that
choice is the whole trick: a flattened map is exact at the point you centre it
on, so centring on the mean puts every trial as close as possible to the part
of the map that is accurate.
```

Keep the existing `### Tangent space + logistic regression` content under it.

- [ ] **Step 2: Move the tangent-space visualisation up**

Cut the `## 7. Visualize the tangent-space coordinates` markdown cell and its
following code cell (`tangent_features = TangentSpace(...)`) and paste both
directly after the Route 2 pipeline description from Step 1.

Re-title the markdown cell:

```markdown
### What the local map actually looks like

Two coordinates out of the full tangent vector, one point per trial. This is
the space the logistic regression sees — and the reason a straight line is a
sensible thing to draw in it.
```

- [ ] **Step 3: Renumber the sections that follow**

Route 2 has just taken the number `5`, which the low-calibration section
currently occupies. Renumber in one pass, bottom-up, so no two sections ever
share a number:

| Was | Becomes |
|---|---|
| `## 7. Visualize the tangent-space coordinates` | gone — moved into §5 by Step 2 |
| `## 6. What the source papers add beyond this demo` | `## 7. What the source papers add beyond this demo` |
| `## 5c. The same distance, used as a signal-quality check` | `## 6c. …` |
| `## 5b. Re-centering: the transfer result the theory promises` | `## 6b. …` |
| `## 5. The low-calibration question` | `## 6. The low-calibration question` |

Do not renumber `## 0` through `## 3`, or `## 8`.

The final numbering after this whole plan is: 0–3 unchanged, 4 Route 1,
5 Route 2, 6 what the geometry buys you, 7 source papers, 8 reuse. Sections
6, 6b and 6c are temporary homes — Tasks 2 and 4 fold them into Part 6 as
6.3, 6.4b and 6.5.

Search for stale cross-references after renumbering:

```bash
grep -n "§5\|section 5\|§7\|section 7" notebooks/build_notebook.py
```
Every hit must still point at the right place.

- [ ] **Step 4: Rebuild and check the structure**

```bash
conda run -n rnd_env python notebooks/build_notebook.py
conda run -n rnd_env python - <<'PY'
import json
nb = json.load(open("notebooks/01_riemannian_eeg_motor_imagery.ipynb"))
for i, c in enumerate(nb["cells"]):
    src = "".join(c["source"])
    for line in src.split("\n"):
        if line.startswith("## "):
            print(f"{i:3d} {line}")
PY
```

Expected: `## 4. Route 1 …` and `## 5. Route 2 …` appear in order, and no
`## 7. Visualize the tangent-space coordinates` remains.

- [ ] **Step 5: Commit**

```bash
git add notebooks/build_notebook.py notebooks/01_riemannian_eeg_motor_imagery.ipynb notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb
git commit -m "Notebook: two routes, and show the tangent space before using it"
```

---

## Task 2: Gather the advantages into one part

**Files:**
- Modify: `notebooks/build_notebook.py` — move the cells at `:1352-1460` (geometry contrast), `:1461-1663` (low calibration) and `:1797-1849` (potato)

**Interfaces:**
- Consumes: `build_geometry_contrast_pipelines()` (`utils:247`), `evaluate_low_data_regime()` (`utils:313`) — both unchanged.
- Produces: `## 6. What the geometry buys you`, with sub-sections 6.1, 6.3 and 6.5. Tasks 3 and 4 insert 6.2 and 6.4 into the gaps.

The four existing advantage demonstrations are scattered across three
top-level sections and read as incidental. This makes them the notebook's
centre of gravity.

**Order matters here.** Move and re-title the three existing sections *first*,
then add the part opener above them. Adding a second `## 6` before the existing
one has been renamed leaves the notebook briefly holding two sections with the
same number, which is exactly when a cross-reference gets missed.

- [ ] **Step 1: Move and re-title first (Steps 2–4), then return here**

Complete Steps 2, 3 and 4 below, then come back and insert this cell
immediately after Route 2's last cell and above the relocated `### 6.1`:

```markdown
## 6. What the geometry buys you

The webpage can only claim that this geometry earns its keep — its widgets are
synthetic by necessity, and a synthetic demonstration proves nothing about EEG.
This section is where the claims get measured, on recorded brain data, with
whole recording runs held out.

Five experiments. Two of them the webpage cannot show you at all.
```

- [ ] **Step 2: Move the geometry contrast in as 6.1**

Move the `### Is the gain from covariance, or from Riemannian geometry?` cell,
its code cell, and the `### Read the result honestly` cell to sit directly
under the part opener. Re-title:

```markdown
### 6.1 Same features, different ruler

Every comparison so far changed two things at once — the features *and* the
geometry — so none of them can say which did the work. This one changes exactly
one thing: identical covariance matrices, identical validation, only the mean
and the distance swapped.
```

Keep `### Read the result honestly` immediately after it, unchanged.

- [ ] **Step 3: Move the low-calibration experiment in as 6.3**

Move `## 6. The low-calibration question` (renamed from `## 5.` in Task 1), its
predict-first cell, and its three code cells. Re-title to `### 6.3 How little
calibration can you get away with?` and keep the body, the prediction prompt
and the honest reading.

- [ ] **Step 4: Move the potato in as 6.5**

Move `## 6c. The same distance, used as a signal-quality check` and its code
cell. Re-title to `### 6.5 The same distance, used as a quality gate`.

`## 6b. Re-centering…` stays where it is for now — Task 4 Step 4 moves it in
as 6.4b, after the experiment it belongs beside exists.

- [ ] **Step 5: Rebuild and verify order**

```bash
conda run -n rnd_env python notebooks/build_notebook.py
conda run -n rnd_env python - <<'PY'
import json
nb = json.load(open("notebooks/01_riemannian_eeg_motor_imagery.ipynb"))
for c in nb["cells"]:
    for line in "".join(c["source"]).split("\n"):
        if line.startswith("## ") or line.startswith("### 6"):
            print(line)
PY
```

Expected: `## 6. What the geometry buys you` followed by `### 6.1`, `### 6.3`,
`### 6.5` in that order, with 6.2 and 6.4 not yet present.

- [ ] **Step 6: Commit**

```bash
git add notebooks/build_notebook.py notebooks/*.ipynb
git commit -m "Notebook: put the advantages in one place, where they can be read together"
```

---

## Task 3: E2 — the recording chain changes and the ruler does not notice

**Files:**
- Modify: `notebooks/build_notebook.py` — insert between 6.1 and 6.3

**Interfaces:**
- Consumes: `covariances` (from §2's `Covariances(estimator="oas").fit_transform(dataset.X)`), `dataset.y`, `dataset.groups`, `evaluate_leave_one_group_out` (`utils:266`), `EuclideanCovarianceNearestMean` (`utils:55`).
- Produces: variables `MIXING`, `covariances_rewired`, `invariance_scores`. Task 4 reuses `MIXING`.

`evaluate_leave_one_group_out` calls `fit`/`predict` on whatever array it is
given, so passing precomputed covariance matrices with covariance-free
pipelines works without touching the utils module.

- [ ] **Step 1: Add the markdown cell**

```markdown
### 6.2 Rewire the recording, and watch which ruler notices

Volume conduction, electrode gain, your choice of reference, whitening, a
spatial filter, a headset that sat differently today — every one of them does
the same thing to a covariance matrix:

$$C \mapsto G\,C\,G^{\top}$$

for some invertible $G$. The affine-invariant distance is *defined* to be blind
to that whole family. Here that stops being a definition and becomes a
measurement: apply one fixed, non-diagonal $G$ to every covariance matrix —
training and test alike — and re-run the whole evaluation.

**What to expect.** The Riemannian predictions should be *identical*, not
merely similar. The Euclidean treatment of the same matrices should move.

**One thing this does not show.** CSP + LDA is congruence-invariant too — the
generalised eigenvalues it solves for are unchanged by $C \mapsto GCG^{\top}$,
and so are its log-variance features. So this is not "Riemannian survives and
CSP does not." It is narrower and more useful: **the naive Euclidean treatment
of these matrices is not blind to the recording chain, and the Riemannian one
is.** That difference is the entire reason for the machinery.
```

- [ ] **Step 2: Add the code cell**

```python
from sklearn.pipeline import Pipeline
from pyriemann.classification import MDM

# A deliberately non-diagonal, invertible mixing matrix. Per-channel gain alone
# would be a much weaker test: mixing is what volume conduction and
# re-referencing actually do.
rng = np.random.default_rng(0)
n_channels = covariances.shape[-1]
MIXING = np.eye(n_channels) + 0.35 * rng.standard_normal((n_channels, n_channels))
assert np.abs(np.linalg.det(MIXING)) > 1e-6, "mixing matrix must be invertible"

covariances_rewired = np.einsum("ij,njk,lk->nil", MIXING, covariances, MIXING)

# Pipelines that consume covariance matrices directly, so the congruence is
# applied to exactly the objects the theory talks about.
covariance_pipelines = {
    "Riemannian MDM": Pipeline([("classifier", MDM(metric="riemann"))]),
    "Euclidean covariance mean": Pipeline(
        [("classifier", EuclideanCovarianceNearestMean())]
    ),
}

before_scores, before_predictions = evaluate_leave_one_group_out(
    covariance_pipelines, covariances, dataset.y, dataset.groups
)
after_scores, after_predictions = evaluate_leave_one_group_out(
    covariance_pipelines, covariances_rewired, dataset.y, dataset.groups
)

invariance_scores = (
    before_scores.groupby("model")["balanced_accuracy"].mean().rename("before")
    .to_frame()
    .join(after_scores.groupby("model")["balanced_accuracy"].mean().rename("after"))
)
invariance_scores["change"] = invariance_scores["after"] - invariance_scores["before"]
print(invariance_scores.round(4))

# The claim, asserted rather than eyeballed: MDM's predictions are unchanged.
mdm_before = before_predictions.query("model == 'Riemannian MDM'")["prediction"].to_numpy()
mdm_after = after_predictions.query("model == 'Riemannian MDM'")["prediction"].to_numpy()
assert np.array_equal(mdm_before, mdm_after), (
    "Riemannian MDM changed its mind under a congruence. That should be "
    "impossible — if this fires, the metric or the mean is not the "
    "affine-invariant one."
)
print("\nRiemannian MDM: every prediction identical after rewiring. ✓")
```

- [ ] **Step 3: Add the reading cell**

```markdown
The assertion is the result. Not "close", not "within noise" — the same
labels, trial for trial, because the distance the classifier uses cannot see
the transformation at all.

The Euclidean row is the control: same matrices, same validation, same folds,
one ruler swapped, and now the recording chain moves the answer.

Two honest limits. First, the congruence was applied to the covariance
matrices, where the invariance is exact. Applying it to the raw signals and
re-estimating with `Covariances(estimator="oas")` breaks exactness, because
shrinkage toward a scaled identity is not congruence-equivariant — the
Riemannian result stays very stable, but it stops being bit-identical. Second,
this shows robustness to a change applied to *everything*. A change that hits
only your new session is a different and harder problem, which is 6.4.
```

- [ ] **Step 4: Rebuild and execute just far enough to check**

```bash
conda run -n rnd_env python notebooks/build_notebook.py
conda run -n rnd_env jupyter nbconvert --to notebook --execute --inplace \
  notebooks/01_riemannian_eeg_motor_imagery.ipynb \
  --ExecutePreprocessor.kernel_name=rnd_env \
  --ExecutePreprocessor.timeout=1800
```

Expected: executes without error, and the assertion prints its ✓ line. **If the
assertion fires, stop.** It means the pipeline is not using the
affine-invariant metric, and that is a real finding to investigate, not a test
to relax.

- [ ] **Step 5: Record the numbers**

Read the printed `invariance_scores` table and write the actual `before`,
`after` and `change` values into this plan file under Task 6, Step 2, so the
page-copy task has them. Do not carry them in your head.

- [ ] **Step 6: Commit**

```bash
git add notebooks/build_notebook.py notebooks/*.ipynb
git commit -m "Notebook: measure the invariance instead of asserting it"
```

---

## Task 4: E3 — a session shift, injected on purpose and repaired

**Files:**
- Modify: `notebooks/build_notebook.py` — insert between 6.3 and 6.5
- Move: the existing `## 5b. Re-centering…` cells to sit immediately after

**Interfaces:**
- Consumes: `MIXING` and `covariances` from Task 3; `mean_riemann` from `pyriemann.utils.mean`; `invsqrtm` from `pyriemann.utils.base`.
- Produces: `shift_results`, a three-row DataFrame. Task 6 quotes it on the page.

This is the experiment §5b has been missing. §5b correctly reports that
re-centring does nothing on this data — because the three runs came from one
sitting and there was no shift to remove. That null result stays. This one
sits beside it, with a shift that genuinely exists.

- [ ] **Step 1: Add the markdown cell**

```markdown
### 6.4 A session shift, injected on purpose — and repaired

6.2 changed the recording for *everything*. Real life is crueller: you train on
Monday and the headset sits differently on Tuesday, so the change hits only the
data you have no labels for.

Here that is simulated exactly — the held-out run, and only the held-out run,
gets the same kind of congruence 6.2 used. Then re-centring: whiten each run by
its own Riemannian mean, so every run starts from the identity.

Re-centring uses **no labels from the held-out run**. It only needs the trials,
which you have the moment the session starts.

**Predict first.** Three numbers below: no shift, shifted, shifted then
re-centred. Where does the middle one land, and how much of it does the third
recover?
```

- [ ] **Step 2: Add the code cell**

```python
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.metrics import balanced_accuracy_score
from pyriemann.utils.base import invsqrtm
from pyriemann.utils.mean import mean_riemann


def whiten_to_identity(matrices):
    """Re-centre a set of covariance matrices on their own Riemannian mean."""
    reference = invsqrtm(mean_riemann(matrices))
    return reference @ matrices @ reference


def run_condition(*, shift: bool, recentre: bool) -> float:
    """Mean balanced accuracy of Riemannian MDM under one condition."""
    splitter = LeaveOneGroupOut()
    fold_scores = []
    for train, test in splitter.split(covariances, dataset.y, dataset.groups):
        train_covariances = covariances[train]
        test_covariances = covariances[test]

        if shift:
            test_covariances = np.einsum(
                "ij,njk,lk->nil", MIXING, test_covariances, MIXING
            )
        if recentre:
            train_covariances = whiten_to_identity(train_covariances)
            test_covariances = whiten_to_identity(test_covariances)

        classifier = MDM(metric="riemann").fit(train_covariances, dataset.y[train])
        fold_scores.append(
            balanced_accuracy_score(
                dataset.y[test], classifier.predict(test_covariances)
            )
        )
    return float(np.mean(fold_scores))


shift_results = pd.DataFrame(
    [
        {"condition": "no shift", "balanced_accuracy": run_condition(shift=False, recentre=False)},
        {"condition": "shifted", "balanced_accuracy": run_condition(shift=True, recentre=False)},
        {"condition": "shifted, then re-centred", "balanced_accuracy": run_condition(shift=True, recentre=True)},
    ]
)
print(shift_results.round(4).to_string(index=False))
```

- [ ] **Step 3: Add the reading cell — after execution, not before**

Leave this cell's body until Task 5 has executed the notebook. Write it from
the printed numbers, and make it say all three of:

- what the shift cost,
- how much re-centring recovered,
- and that this is a *simulated* shift, chosen because it is exactly the transform re-referencing and gain change apply — not a claim about how large real session shifts are.

- [ ] **Step 4: Move §5b to sit immediately after**

Move the `## 6b. Re-centering: the transfer result the theory promises` cells
(renamed from `## 5b.` in Task 1) here and re-title:

```markdown
### 6.4b …and the same move on data that had no shift to remove

6.4 was a shift we injected. This is the same operation on the three real
recording runs, which came from a single sitting — so there was no session
change to cancel.

Re-centring does what it says: the run means collapse onto each other. The
accuracy does not improve, and it should not. Alignment is a hypothesis about
your data, not a free upgrade. It pays when what separates your recordings
really is a change of hardware. Measure it; do not assume it.
```

Keep the existing code and its output. Update its surrounding prose to use the
map wording: *we redrew the map centred on each run; the runs were already in
the same place, so nothing moved.*

- [ ] **Step 5: Rebuild**

```bash
conda run -n rnd_env python notebooks/build_notebook.py
```
Expected: both `.ipynb` files regenerate without error.

- [ ] **Step 6: Commit**

```bash
git add notebooks/build_notebook.py notebooks/*.ipynb
git commit -m "Notebook: give re-centring a shift worth removing, next to one that isn't"
```

---

## Task 5: The divergence cell, and full execution

**Files:**
- Modify: `notebooks/build_notebook.py` — insert into §3, after the existing distance/mean material
- Modify: `notebooks/README.md`

**Interfaces:**
- Consumes: `covariances`, `distance_riemann` and `mean_riemann` from pyRiemann.
- Produces: the figure the page's §1.2 points at.

This measures the page's central intuition on real data: a flat map is exact
where you centre it and wrong by more the further you go.

- [ ] **Step 1: Add the markdown cell**

```markdown
### The page's central claim, measured

The webpage's Part 1 says a flattened map is exact at the point you centre it
on and wrong by more the further you travel. That is checkable, and here is the
check on real trials.

Take the Riemannian mean of every trial as the reference. Whiten each trial by
it — which is exactly what the tangent-space route does — then compare, for
each trial, the Riemannian distance to the reference against the plain
Frobenius distance in whitened coordinates.

Close to the reference the two agree. Far from it they do not, and the gap
grows with distance. That is the whole reason the reference is chosen to be the
mean: it puts as many trials as possible into the part of the map that is
accurate.
```

- [ ] **Step 2: Add the code cell**

```python
from pyriemann.utils.distance import distance_riemann

reference_point = mean_riemann(covariances)
whitening = invsqrtm(reference_point)
whitened = whitening @ covariances @ whitening
identity = np.eye(covariances.shape[-1])

riemannian_gap = np.array(
    [distance_riemann(reference_point, c) for c in covariances]
)
flat_gap = np.linalg.norm(whitened - identity, axis=(-2, -1))

order = np.argsort(riemannian_gap)
figure, axis = plt.subplots(figsize=(7, 4.5))
axis.plot(riemannian_gap[order], riemannian_gap[order], label="measured on the surface")
axis.plot(riemannian_gap[order], flat_gap[order], label="measured on the flat map")
axis.set_xlabel("Riemannian distance from the reference")
axis.set_ylabel("reported distance")
axis.set_title("A flat map is exact where you centre it")
axis.legend()
figure.tight_layout()

near = riemannian_gap < np.quantile(riemannian_gap, 0.1)
far = riemannian_gap > np.quantile(riemannian_gap, 0.9)
print(f"closest 10% of trials  — flat/curved ratio {np.mean(flat_gap[near] / riemannian_gap[near]):.3f}")
print(f"furthest 10% of trials — flat/curved ratio {np.mean(flat_gap[far] / riemannian_gap[far]):.3f}")
```

- [ ] **Step 3: Execute the whole notebook**

```bash
conda run -n rnd_env bash notebooks/publish_notebook.sh
```

Expected: rebuild, full execution, and both website artefacts refreshed. First
execution downloads ~7.4 MB of EEG into `data/mne/`.

If `publish_notebook.sh` does anything this plan does not expect, read it
before running it again.

- [ ] **Step 4: Write the reading cells that were deferred**

Task 4 Step 3's reading cell is still empty. Write it now from the executed
output. Same for any prose in 6.2 or the divergence cell that referenced a
number.

Then rebuild and re-execute so those cells ship with their outputs.

- [ ] **Step 5: Verify the ratios behave**

The printed near/far ratios must show the near value close to 1 and the far
value meaningfully larger. If the near ratio is not close to 1, the whitening
step is wrong — check that `whitened` uses `invsqrtm(reference_point)` on both
sides, and see spec §3.1, which documents exactly this failure.

- [ ] **Step 6: Update the notebook README**

Rewrite the section list in `notebooks/README.md` to the new structure, and add
the two new experiments to the bullet list of what the notebook includes.

- [ ] **Step 7: Commit**

```bash
git add notebooks/
git commit -m "Notebook: measure the flat-map claim, and execute the whole thing"
```

Downloaded EEG lands in `data/mne/`. Confirm it is not being committed —
`git status --porcelain data/` should be empty. If it is not, `.gitignore`
needs a `data/mne/` entry before this commit.

---

## Task 6: Propagate the results back to the page

**Files:**
- Modify: `index.html` — the provisional `transfer-caveat` block, `.notebook-grid`, `.geometry-contrast`
- Modify: `src/glossary.ts` — `hrefLabel` values where a formula has a notebook counterpart

**Interfaces:**
- Consumes: the executed outputs from Tasks 3, 4 and 5.

The page plan deliberately left one block provisional because the page must
not quote a result the notebook has not produced.

- [ ] **Step 1: Re-verify every number the page already quotes**

The page quotes 84.2 / 94.5 / 94.9 in `.score-row`, and 82.4 → 97.9 with
+15.5 in `.contrast-scores`. Re-ordering cells should not have changed any
computation — but check, do not assume:

```bash
conda run -n rnd_env python - <<'PY'
import json
nb = json.load(open("notebooks/01_riemannian_eeg_motor_imagery.ipynb"))
for i, c in enumerate(nb["cells"]):
    for out in c.get("outputs", []):
        text = "".join(out.get("text", "")) or "".join(
            out.get("data", {}).get("text/plain", "")
        )
        if any(k in text for k in ("balanced_accuracy", "Euclidean", "Riemannian", "Tangent")):
            print(f"--- cell {i} ---\n{text}\n")
PY
```

Correct any page number that moved. If one moved materially, say so in the
commit message — it is a finding, not a chore.

- [ ] **Step 2: Replace the provisional transfer caveat**

Find the block marked `<!-- PROVISIONAL: … -->` in `index.html` and replace the
`transfer-caveat` aside. It must now say both things:

- The notebook injects a session shift of exactly the kind re-centring is designed to remove, and re-centring recovers *(quote the measured recovery from Task 4)*.
- On the three real runs, which came from one sitting, re-centring changes nothing — correctly, because there was no shift there.
- The conclusion: alignment is a hypothesis about your data. It pays when what separates your recordings really is a change of hardware. Measure it; do not assume it.

Remove the `PROVISIONAL` comment.

- [ ] **Step 3: Add the invariance result to §3.2**

The page's invariance section currently rests entirely on a synthetic widget.
Add one short paragraph quoting E2: on real EEG, every Riemannian MDM
prediction was identical after rewiring, while the Euclidean treatment of the
same matrices moved *(quote the measured change)*.

- [ ] **Step 4: Add the notebook anchors**

For each glossary entry with a formula, set `hrefLabel` to name where the
notebook does the same thing with real data — e.g. `recentering` →
`"Run it on real EEG in §6.4"`. Then, in the notebook, add a line to each
corresponding section naming its page section. Bidirectional, per spec §9.

- [ ] **Step 5: Verify**

```bash
npm run test && npm run build:all && npm run audit:terms
```
Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add index.html src/glossary.ts notebooks/
git commit -m "Quote the notebook's real results on the page, including the awkward one"
```

---

## Task 7: The Wix port guide

**Files:**
- Create: `docs/wix-port-guide.md`

**Interfaces:**
- Consumes: the finished `index.html`.

The deployable units for Wix are the widget tags in
`dist/riemannian-eeg-widgets.js`; the Wix page owns the prose and headings.
This guide makes the port mechanical instead of a diff-by-hand exercise.

- [ ] **Step 1: Generate the section inventory**

```bash
conda run -n rnd_env python - <<'PY'
import re
html = open("index.html", encoding="utf-8").read()
for m in re.finditer(r'<section[^>]*id="([^"]+)"|<h([12])[^>]*>(.*?)</h\2>|<(rg-[a-z-]+)', html, re.S):
    if m.group(1):
        print(f"\n== SECTION #{m.group(1)}")
    elif m.group(3):
        print(f"   H{m.group(2)}: {re.sub(r'<[^>]+>', '', m.group(3)).strip()[:100]}")
    else:
        print(f"   WIDGET: <{m.group(4)}>")
PY
```

- [ ] **Step 2: Write the guide**

Structure it as one row per page section, in order, with four columns: the Wix
element type to add, the heading text to paste, where the body copy comes from
in `index.html`, and which `<rg-*>` tags to embed and in what order.

Open with the two things that are easy to get wrong:

- The widget bundle must be loaded once from an HTTPS host before any tag will render.
- Every `<rg-*>` tag is self-contained: no attributes to configure except `key`, `step`, `folded`, `summary`, `compact` and `active`, which the table gives verbatim per placement.

- [ ] **Step 3: Verify the guide against a real page**

Follow your own guide for one section — Part 1 §1.2 — on the Wix page. If any
step needs a decision the guide does not answer, the guide is incomplete. Fix
it.

- [ ] **Step 4: Commit**

```bash
git add docs/wix-port-guide.md
git commit -m "Make the Wix port mechanical"
```

---

## Task 8: Whole-artifact audit

**Files:**
- Create: `docs/superpowers/plans/2026-07-27-notebook-realignment-audit.md`

Do not run this in the same sitting as Task 7. Read the notebook and the page
fresh, and read them *together* — the failure this whole project exists to fix
was two artefacts that were each individually fine.

- [ ] **Step 1: Read the notebook end to end as a learner**

Execute it fresh and read every cell in order. Record: any section that assumes
something not yet introduced, any figure without a stated reading, any claim
without a number behind it.

- [ ] **Step 2: Check the page and notebook agree**

For each of the 7 folded math boxes on the page, confirm the notebook section
it names exists and does what the box says. For each notebook section with a
page anchor, confirm the page section exists and matches.

```bash
grep -o 'rg-formula key="[a-z-]*"' index.html | sort -u
grep -oE '§[0-9]+(\.[0-9]+[a-z]?)?' docs/wix-port-guide.md | sort -u
```

- [ ] **Step 3: Audit every claim about CSP**

Spec §9.3. Search both artefacts:

```bash
grep -n -i "csp" index.html notebooks/build_notebook.py
```

Every hit must be consistent with: CSP + LDA is a strong baseline, it is
congruence-invariant too, and the E2 contrast is against the *Euclidean*
treatment. Any sentence implying CSP fails the rewiring test is a defect.

- [ ] **Step 4: Confirm no number is unsourced**

Every numeric claim on the page must trace to either a widget computing it live
from `src/math/spd.ts`, a `worked` example pinned by
`src/glossary.worked.test.ts`, or an executed notebook output. List any that
does not, and fix it.

- [ ] **Step 5: Final verification**

```bash
npm run test && npm run build:all && npm run audit:terms
conda run -n rnd_env python notebooks/build_notebook.py
git status --porcelain
```
Expected: all clean, and rebuilding the notebook produces no diff — meaning the
committed `.ipynb` matches its source.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Audit page and notebook as one artefact, and fix what that found"
```

---

## Self-Review

**Spec coverage.** §9.1 structural changes → Tasks 1, 2, 5, 6. §9.2 E1 → Task 2
Step 2; E2 → Task 3; E3 → Task 4; E4 → Task 2 Step 3; E5 → Task 2 Step 4.
§9.3 the forbidden claim → Task 3 Step 1's markdown states it explicitly, and
Task 8 Step 3 audits both artefacts for it. §9.4 page consequences → Task 6.
§11 deliverable 4 → Tasks 1–5; deliverable 5 → Task 7.

**Placeholder scan.** One step defers its content deliberately — Task 4 Step 3
leaves a reading cell unwritten until Task 5 has executed the notebook. That is
not a placeholder but a sequencing requirement from the global constraint that
no number is written before it is produced; Task 5 Step 4 closes it explicitly.
Task 3 Step 5 likewise requires recording real output into this file before
Task 6 can use it.

**Type consistency.** `MIXING` is created in Task 3 Step 2 and consumed in
Task 4 Step 2. `covariance_pipelines` uses `MDM` and
`EuclideanCovarianceNearestMean`, both imported in the cells that use them.
`evaluate_leave_one_group_out(pipelines, X, y, groups)` matches `utils:266`.
`whiten_to_identity` and `run_condition` are defined and used in the same cell.
`invsqrtm` and `mean_riemann` are imported in Task 4 Step 2 and reused in
Task 5 Step 2, which is a later cell in the same notebook — imports persist,
but Task 5's cell re-imports `distance_riemann` only, so confirm at execution
that `invsqrtm` is in scope; if the cell order ever changes, re-import it.
