# Riemannian Geometry for EEG / BCI Feature Extraction — Technical & Pedagogical Reference

**Purpose.** A verification reference for reviewing an educational webpage on Riemannian geometry applied to EEG/BCI. Every formula below was checked against a primary source (paper PDF text or pyRiemann source code) or verified numerically. Claims that could NOT be verified are flagged explicitly.

**Verification status legend**
- ✅ = verified verbatim against a primary source (formula text extracted from the paper/source code)
- 🔢 = verified numerically by me (script run, results reproduced below)
- ⚠️ = commonly asserted but I could not verify from a primary source in this session; treat as unconfirmed
- ❗ = a claim that appears in the literature but is **imprecise or wrong**; flagged for the reviewer

---

## 0. Sources actually consulted (and their reliability)

| Source | How obtained | Used for |
|---|---|---|
| **Pennec, X.** "Manifold-valued image processing with SPD matrices," Ch. 3 in *Riemannian Geometric Statistics in Medical Image Analysis* (Elsevier, 2020). [PDF](https://www-sop.inria.fr/asclepios/cours/MVA/chapter3.pdf) | full text extracted | Exp/Log maps, curvature (exact values), Hadamard property, Fréchet mean algorithm, swelling effect, AIRM = Fisher–Rao |
| **Congedo, M., Barachant, A., Andreev, A. (2013)** "A New Generation of Brain-Computer Interface Based on Riemannian Geometry," [arXiv:1310.8115](https://arxiv.org/abs/1310.8115) | full text extracted | MDM, distance formula, Karcher-mean iteration, BCI Comp IV-2a cross-session table |
| **pyRiemann source**, `pyriemann/geometry/{distance,mean,tangentspace,geodesic}.py`, `classification.py`, `tangentspace.py`, `artifact_detection.py`, `transfer/_estimators.py`, `estimation.py` (GitHub master) | raw files | Canonical formulas as *implemented*; √2 weighting; potato z-score; TLCenter/TLScale/TLRotate |
| **Ju, C. et al. (2025)** "SPD Matrix Learning for Neuroimaging Analysis," [arXiv:2504.18882](https://arxiv.org/abs/2504.18882) | full text extracted | AIRM/LEM/LCM/BWM comparison, Hadamard statement, tangent-space vectorization with √2, CSP-as-divergence |
| **Chevallier, S. et al. (2024)** MOABB benchmark, [arXiv:2404.15319](https://arxiv.org/abs/2404.15319) | full text extracted | Largest benchmark result: Riemannian > DL > Raw |
| **Xu, J. et al. (2019)** "Tangent space spatial filters," [arXiv:1909.10567](https://arxiv.org/abs/1909.10567) | full text extracted | CSP as a special case of tangent-space filtering |
| **He, H. & Wu, D. (2019)** Euclidean Alignment, [arXiv:1808.05464](https://arxiv.org/abs/1808.05464) | full text extracted | Zanini recentering formula quoted verbatim; EA contrast |
| **Barachant's competition page**, <https://alexandre.barachant.org/challenges/> | fetched | Competition placements + team counts |

**Blocked/unavailable this session:** HAL (`hal.science`) is behind an Anubis anti-bot wall, so I could **not** obtain the full text of Congedo/Barachant/Bhatia (2017) *primer and review*, Barachant et al. (2012) *IEEE TBME*, Yger/Bérar/Lotte (2017) *review*, or Zanini et al. (2018). Numbers attributed to those are marked ⚠️ and sourced from search snippets or from secondary papers that quote them.

---

## 1. The core problem: why Euclidean treatment of EEG covariance fails

### 1.1 Why covariance is the right feature in the first place
This is the step most explainers skip, and skipping it makes everything downstream look arbitrary.

1. **The BCI-relevant signal is second-order.** Motor-imagery decoding rests on ERD/ERS — event-related de/synchronization — which is a **band-limited power change** in the mu (~8–13 Hz) and beta (~13–30 Hz) rhythms. After band-pass filtering, "power in a channel" is exactly a diagonal entry of the covariance matrix, and "how power co-distributes across the scalp" is the off-diagonal structure. ✅ (MOABB and the SPD review both state ERD/ERS manifests as band-limited power changes.)
2. **The band-passed, epoched EEG segment is well modeled as zero-mean.** Under a zero-mean multivariate Gaussian model, the covariance matrix is a **sufficient statistic** — it captures everything the model says is knowable. Discarding the time-series and keeping `C` is not lossy under that model.
3. **Spatial covariance is where the source-mixing lives.** EEG is a linear instantaneous mixing `X = A S` of cortical sources `S` by a lead-field/mixing matrix `A`. Then `C_X = A C_S Aᵀ`. So the *entire* effect of head geometry, electrode montage, skull conductivity and reference choice enters as a **congruence transformation** `C ↦ A C Aᵀ`. This is the hinge of the whole subject (see §2.5).
4. **For ERP/P300, plain covariance is not enough** — the discriminative information is temporal, not spatial. The standard fix is the **super-trial / "prototype-augmented" covariance** of Barachant & Congedo: average the trials of a class into a prototype `P = (1/m)Σ Xᵢ`, then build `X̃ᵢ = [P ; Xᵢ]` (vertical concatenation) and take the covariance of the stacked matrix. ✅ (verbatim from pyRiemann `ERPCovariances`). `XdawnCovariances` prepends an xDAWN spatial-filtering step to keep the dimension manageable. **A webpage that says "Riemannian BCI = covariance of the trial" without mentioning this is incomplete for ERP.**

### 1.2 Why the naive Euclidean treatment breaks

**(a) The set of covariance matrices is not a vector space — it is an open convex cone.**
`Sym⁺⁺(d)` is closed under addition and *positive* scaling only. Subtraction and negative scaling leave the set. ✅ (SPD review: "as these operations can produce symmetric matrices with non-positive [eigenvalues]"). So the two operations that Euclidean ML is built on — differences and signed linear combinations — are not internal operations. Anything downstream (a mean, a linear classifier's decision surface, an interpolation, a gradient step) can and does land outside the set.

**(b) Under the Euclidean metric the manifold is incomplete; the boundary is at finite distance.**
✅ Pennec: "SPD matrices constitutes a smooth but non-complete manifold with the classical Euclidean metric on matrices. This creates important computational problems for image processing since one easily passes the boundaries to end-up with negative eigenvalues." Under AIRM the opposite is true: "symmetric matrices with null and infinite eigenvalues are both at an infinite distance of any SPD matrix: the cone of SPD matrices is mapped to a homogeneous space of non-constant curvature **without boundaries**." ✅ **This is a great teaching point and is under-used in explainers: AIRM makes the walls of the cone infinitely far away, so no algorithm can ever fall out of the set.**

**(c) The swelling effect.** The Euclidean (arithmetic) mean of SPD matrices inflates the determinant — i.e. it invents variance that is in none of the inputs. See §2.7; verified numerically 🔢.

**(d) The curse of the vectorized upper triangle.**
A `d × d` symmetric matrix has `d(d+1)/2` free parameters:

| channels `d` | `d(d+1)/2` |
|---|---|
| 8 | 36 |
| 16 | 136 |
| 22 (BCI Comp IV-2a) | 253 |
| 32 | 528 |
| 64 | 2080 |
| 128 | 8256 |

🔢 (computed). With a few hundred trials per session, a 64-channel montage gives ~2080 features from ~300 samples. Two consequences worth teaching:
- **Estimation**: the sample covariance matrix (SCM) itself is badly conditioned or singular when `T` (samples per trial) is not ≫ `d`. This is why **shrinkage estimators (Ledoit–Wolf, OAS) are not optional** in practice. MOABB's best pipeline uses OAS-shrunk trial covariances ⚠️ (search snippet; I did not extract the exact sentence from the MOABB PDF).
- **Classification**: after tangent-space mapping you are doing linear classification in `ℝ^{d(d+1)/2}`, so regularization (L2/L1 logistic regression, shrinkage LDA, SVM) is mandatory. Barachant's original TSLDA used an explicit **variable-selection** step before LDA ⚠️ (search snippet).
- ⚠️ The claim "the tangent-space dimension grows quadratically in channels and cubically in compute (EVD)" — stated verbatim in the TSSF paper ✅ — is a real limitation. The paper says "it becomes infeasible to apply Riemannian methods on data sets with a large number of channels." A webpage that presents Riemannian methods as universally superior is overselling; **MOABB found Riemannian pipelines perform *best* in the (0, 25]-channel regime and degrade as channel count rises** ✅.

**(e) Why naive CSP+LDA breaks under shift.**
CSP solves a generalized eigenvalue problem `Σ₊ wᵢ = λᵢ Σ₋ wᵢ` on class-mean covariances ✅ and then feeds log-variances of the projected signals to LDA. The failure modes:
- The filters `W` are estimated on the calibration session's covariance statistics. If the *whole cloud* of covariances translates on the manifold between sessions (new electrode impedances, cap shifted 1 cm, different arousal/baseline power), the filters are now tuned to the wrong subspace and the log-variance features shift their operating point.
- **CSP uses arithmetic class means** — which swell (§2.7), so the "class mean" is a biased summary that is not any actual brain state ✅ (TSSF paper makes exactly this point: "We assume that they are related by the exponential transform, but that is likely not true if `C₍·₎` is computed as the arithmetic mean of the covariance matrices in a given class, **due to the swelling effect**. Since the Fréchet mean is a much better proxy of common activities across trials, the proposed Riemannian CSP is a far better approximation of LDA in the tangent space").
- CSP requires choosing the number of filter pairs — a hyperparameter fit on the calibration set. MDM has **no hyperparameter at all** ✅ (Congedo 2013: "the MDM approach is fully automatic").
- **Nuance for honesty:** in the Congedo 2013 cross-session experiment, MDM did **not** beat CSP+LDA on average for binary classification — it *tied* (see §4.1). Its advantage was **variance**, not mean. A webpage claiming "Riemannian beats CSP" as a blanket statement is overstating the 2013 evidence; the defensible claims are (i) robustness/lower spread, (ii) better on poorly-performing subjects, (iii) zero hyperparameters, and (iv) **tangent space + regularized linear classifier does beat CSP+LDA**, which is a different (and stronger) pipeline than MDM.

---

## 2. The mathematical objects

Notation: `d` = number of channels; `Sym⁺⁺(d)` (or `S⁺⁺`, `P(d)`, `M`) = the manifold of `d × d` real symmetric positive definite matrices. `‖·‖_F` = Frobenius norm. `Log`/`Exp` capitalized = Riemannian maps; `log`/`exp` lowercase = matrix functions.

### 2.1 The SPD manifold

$$\mathcal{S}^{++}_d = \{ P \in \mathbb{R}^{d\times d} : P = P^{\mathsf T},\; x^{\mathsf T} P x > 0 \;\; \forall x \neq 0 \}$$

- **Dimension** `d(d+1)/2`. ✅ Congedo 2013: "developing instead infinitely in all of its ½N(N+1) dimensions." Also ✅ SPD review: "The tangent space at any point consists of all symmetric matrices of dimension n(n+1)/2."
- **It is an open convex cone**, not a vector space: closed under `+` and multiplication by positive scalars, *not* under subtraction or negative scaling.
- **The 2×2 visualization** (the single best picture in the field): a 2×2 SPD matrix `[[x, z],[z, y]]` is a point in `ℝ³` subject to `x > 0`, `y > 0`, `xy − z² > 0`. This is an **open convex second-order (ice-cream) cone** whose boundary surfaces are `z = ±√(xy)`. The identity matrix sits at `(1, 1, 0)`. ✅ verbatim from pyRiemann `examples/simulated/plot_metric_comparison.py`, which notes it reproduces Fig. 3 of Yger/Bérar/Lotte (2017).
- **Matrix functions** are defined spectrally. With the eigendecomposition `C = U Λ Uᵀ`: ✅ (Congedo 2013 eq. after (18))
$$C^{-1} = U\Lambda^{-1}U^{\mathsf T},\quad C^{1/2}=U\Lambda^{1/2}U^{\mathsf T},\quad C^{-1/2}=U\Lambda^{-1/2}U^{\mathsf T},$$
$$\exp(C)=U\exp(\Lambda)U^{\mathsf T},\quad \log(C)=U\log(\Lambda)U^{\mathsf T}.$$

### 2.2 The Affine-Invariant Riemannian Metric (AIRM)

**Metric tensor** at `P`, for tangent vectors `v, w` (symmetric matrices): ✅ verbatim from SPD review
$$g_P^{\text{AIRM}}(v,w) = \left\langle P^{-1/2} v P^{-1/2},\; P^{-1/2} w P^{-1/2} \right\rangle_F = \operatorname{tr}\!\left(P^{-1} v P^{-1} w\right)$$

**Geodesic distance** — the formula the webpage must get right: ✅ verbatim from pyRiemann `distance_riemann` and ✅ Congedo 2013 eq. (17)
$$\delta_R(P_1,P_2) \;=\; \left\| \log\!\left(P_1^{-1/2} P_2 P_1^{-1/2}\right) \right\|_F \;=\; \left(\sum_{i=1}^{d} \log^2 \lambda_i \right)^{1/2}$$

**What the `λᵢ` are — a common source of error.** They are the eigenvalues of `P₁^{-1/2} P₂ P₁^{-1/2}`, equivalently the **generalized eigenvalues** of the pencil `(P₂, P₁)`, equivalently the eigenvalues of `P₁⁻¹P₂` *or* of `P₂⁻¹P₁`. ✅ Congedo 2013 states this explicitly: "`w₁,…,w_N` are the eigenvalues of **either** `C₁⁻¹C₂` **or** `C₂⁻¹C₁`." (Using `C₂⁻¹C₁` inverts each `λᵢ`, which flips the sign of every `log λᵢ` and leaves the sum of squares unchanged — hence the symmetry.) They are **not** the eigenvalues of `P₁` or `P₂` separately, and they are **not** the eigenvalues of `P₂ − P₁`.

🔢 **Numerically verified** (random 4×4 SPD `A`, `B`): all four routes give the identical value `4.7036237766`:
- `‖log(A^{-1/2} B A^{-1/2})‖_F`
- `√(Σ log²(eig(A^{-1/2}BA^{-1/2})))`
- `√(Σ log²(eig(A⁻¹B)))`
- and `δ(A,B) = δ(B,A)` (symmetry).

**Pennec's general family.** ✅ Pennec eq. (0.1): the affine-invariant metrics form a **one-parameter family**
$$\operatorname{dist}^2(P,Q) = \operatorname{tr}(L^2) + \beta\,\operatorname{tr}(L)^2, \qquad L = \log(P^{-1/2} Q P^{-1/2}), \;\; \beta > -1/d$$
All members share the same affine connection and hence the same geodesics; only the scaling direction is measured differently. The BCI-standard AIRM is `β = 0`. Worth knowing so the webpage doesn't claim uniqueness: ✅ Pennec explicitly warns "Although this affine-invariant Riemannian metric is often thought to be unique, a slightly different but still invariant metric was proposed…".

**AIRM is the Fisher–Rao metric.** ✅ Pennec: "In statistics, this metric has been introduced in the 1980ies to model the geometry of the multivariate normal family. **In this field, it is known as the Fisher–Rao metric.**" ⚠️ Precise scaling: restricting the Gaussian Fisher–Rao metric to the zero-mean family reportedly yields the same metric up to a factor of 1/2 (search snippet, not verified from a primary text). **This is the deepest "why this metric" answer available and almost no explainer uses it:** AIRM is not an arbitrary aesthetic choice — it is the *information* metric on the statistical model that generated the data. Distance in AIRM = statistical distinguishability of the two Gaussian source distributions.

### 2.3 Exponential and logarithmic maps

✅ Verbatim from Pennec (eqs. at lines 857/866 and 1020/1024):
$$\operatorname{Exp}_P(W) \;=\; P^{1/2}\, \exp\!\left(P^{-1/2} W P^{-1/2}\right) P^{1/2}$$
$$\overrightarrow{PQ} \;=\; \operatorname{Log}_P(Q) \;=\; P^{1/2}\, \log\!\left(P^{-1/2} Q P^{-1/2}\right) P^{1/2}$$
and the norm identity ✅ Pennec:
$$\operatorname{dist}^2(P,Q) = \left\|\operatorname{Log}_P(Q)\right\|_P^2 = \left\| P^{-1/2}\operatorname{Log}_P(Q) P^{-1/2} \right\|_{\text{Id}}^2$$

**⚠️ CRITICAL IMPLEMENTATION DISCREPANCY — check this on the webpage.**
pyRiemann's default `log_map_riemann` / `tangent_space` returns the **whitened** tangent vector, not `Log_P(Q)`:
```
X_new = log( Cref^{-1/2} X Cref^{-1/2} )            # pyRiemann default, C12=False
X_new = Cref^{1/2} log(Cref^{-1/2} X Cref^{-1/2}) Cref^{1/2}   # "full" map, C12=True
```
✅ verbatim from pyRiemann `geometry/tangentspace.py`. Same for the exponential map (`Cm12` flag). Both conventions are legitimate — the first expresses the tangent vector in the *whitened* coordinate frame at `P` (equivalently, parallel-transported to the identity), which is precisely the frame in which the Frobenius norm equals the Riemannian norm. A webpage may present either, but must not mix them, and must not claim pyRiemann computes `P^{1/2} log(...) P^{1/2}` by default.

### 2.4 Geodesics

✅ Verbatim from pyRiemann `geodesic_riemann` and ✅ Pennec's interpolation formula:
$$\gamma(t) \;=\; P_1 \,\#_t\, P_2 \;=\; P_1^{1/2}\left(P_1^{-1/2} P_2 P_1^{-1/2}\right)^{t} P_1^{1/2}, \qquad t\in[0,1]$$
with `γ(0) = P₁`, `γ(1) = P₂`. Pennec writes it equivalently as `P_Aff(t) = P^{1/2} exp(t log(P^{-1/2} Q P^{-1/2})) P^{1/2}`. The `t = 1/2` point `P₁ # P₂` is the **geometric mean of two matrices**.

Compare with the Euclidean "chord" `(1−t)P + tQ` ✅ (Pennec gives both side by side) and the log-Euclidean `exp((1−t)log P + t log Q)`.

**Determinant behaviour along the geodesic** ✅ Pennec: "For a Euclidean metric, **the trace is linearly interpolated**. With an affine invariant metric, the trace is not linear anymore but **the determinant is geometrically interpolated**." This is the exact mechanism of the swelling effect.

### 2.5 Congruence invariance — the killer property for EEG

**The property.** ✅ verbatim from SPD review: for any invertible `W ∈ GL(d)`,
$$\delta_R\!\left(W P W^{\mathsf T},\; W Q W^{\mathsf T}\right) = \delta_R(P, Q)$$
🔢 verified numerically: `δ(A,B) = δ(WAWᵀ, WBWᵀ) = 4.7036237766` for a random invertible `W`.

**Inversion invariance.** `δ_R(P⁻¹, Q⁻¹) = δ_R(P, Q)`. 🔢 verified numerically (same value). Physiologically: distances between *covariance* matrices equal distances between *precision*/connectivity matrices — a nice bridge to functional-connectivity work.

**Why this is decisive for EEG.** Every one of the following is a congruence `C ↦ W C Wᵀ`, and therefore an **isometry** — a rigid motion of the whole dataset that leaves every pairwise distance unchanged:

| EEG nuisance | The `W` | Effect on `C` |
|---|---|---|
| Volume conduction / linear source mixing | lead-field `A` | `C_S ↦ A C_S Aᵀ` |
| Per-electrode gain / impedance drift | diagonal `D` | `C ↦ D C D` |
| Re-referencing (avg ref, Laplacian, bipolar) | linear operator `R` | `C ↦ R C Rᵀ` (⚠️ note: average-referencing is rank-deficient, so it is *not* invertible — see caveat below) |
| Any spatial filter / whitening / PCA rotation | `W` | `C ↦ W C Wᵀ` |
| Session recentering (§3.3) | `M^{-1/2}` | `C ↦ M^{-1/2} C M^{-1/2}` |

The one-line slogan a good explainer should land: **the sources you actually care about are separated from the electrodes you actually measure by an unknown linear mixing — and AIRM is blind to that mixing.** You get the benefits of source separation *without ever solving the source-separation problem*. ✅ This is exactly the argument Congedo 2013 makes in different words ("The framework … allows extracting the spatial information contained in EEG signals **without using spatial filtering**").

**Caveats a rigorous page should include:**
- `W` must be **invertible**. Average-referencing and CAR are singular (rank `d−1`), so strictly they break the invariance and make `C` rank-deficient. In practice people drop a channel or shrink. A page that says "re-referencing is free" without this caveat is technically wrong.
- Invariance is a double-edged sword. Anything that is *only* expressible as a global congruence is invisible to AIRM — including, e.g., a global amplitude rescale `C ↦ αC`... **no**: careful, `αC = (√α I) C (√α I)ᵀ` is a congruence, so a global gain change *is* an isometry, but it is **not** a zero-distance move — it moves the point but preserves all pairwise distances. It is a *translation along the trace direction*, not an annihilation. Precisely: `δ_R(αP, αQ) = δ_R(P,Q)` but `δ_R(αP, P) = √d · |log α| ≠ 0`. Getting this distinction right matters: **congruence invariance means distances are preserved, not that the transformation is undone.** The *undoing* is what recentering does (§3.3).

### 2.6 Tangent space

- At each `P ∈ S⁺⁺`, the tangent space `T_P S⁺⁺` is the vector space of **all symmetric `d × d` matrices** — dimension `d(d+1)/2`. ✅ SPD review. Note: the tangent space is *symmetric matrices*, not SPD matrices; it is a genuine vector space (subtraction is legal there), which is the entire point.
- The log map is a **local linearization**, exact only at the base point and increasingly distorted away from it. Because of that, the reference point is chosen to be the **Fréchet mean of the data**, minimizing average distortion. ✅ TSSF paper: "the distances and angles derived from the tangent space representation of points are only valid within a small neighborhood around the reference point … to ensure the approximation error is minimized, the Fréchet mean of a set `C` is adopted as the reference point."
- **⚠️ A refinement most explainers get wrong in the *other* direction:** because `S⁺⁺` with AIRM is a **Hadamard** manifold, the exponential map at any point is a **global diffeomorphism** ✅ (SPD review: "the exponential map is a global diffeomorphism"). So the log map is globally well-defined and bijective — it is not "only valid locally" in the sense of *existence*. What is only locally valid is the **isometry**: the log map preserves distances *from the base point exactly* (`‖Log_P(Q)‖_P = δ(P,Q)`) but distorts distances *between two other points*. The correct statement is: **the tangent-space projection is exact radially and approximate laterally.** ⚠️ Pennec quantifies the volume distortion: `dM Exp_P(V) = (1 − (1/6)Ric(V)|_P + O(‖V‖³)) dV`.

### 2.7 The Riemannian (Fréchet / Karcher) mean

**Definition** ✅ verbatim from pyRiemann `mean_riemann` and ✅ TSSF eq. (II.6):
$$\mathfrak{M} = \arg\min_{M \in \mathcal{S}^{++}} \sum_i w_i\, \delta_R^2(M, X_i), \qquad \textstyle\sum_i w_i = 1$$

**Existence and uniqueness are guaranteed.** ✅ Pennec: "Because SPD matrices have a non-positive curvature and an infinite injection radius with an affine invariant metric, there is **one and only one** global minimum: the Fréchet mean `P̄` is unique [Ken90]." ✅ Also SPD review: "Consequently, the Fréchet mean of a finite set of SPD matrices always exists and is unique." **This is a direct payoff of non-positive curvature and is a strong pedagogical beat** — on a sphere (positive curvature) the Fréchet mean is *not* unique (antipodal data has a whole circle of means).

**No closed form for `K > 2`.** It is computed by an iterative fixed-point / gradient descent.

✅ Verbatim algorithm from Congedo 2013 eq. (18):
> Initialize `M` by a smart guess or by the arithmetic mean `(1/K) Σ Cₖ`.
> Repeat: `M ← M^{1/2} exp( (1/K) Σ_k log( M^{-1/2} Cₖ M^{-1/2} ) ) M^{1/2}`
> until the Frobenius norm of `(1/K) Σ_k log(M^{-1/2} Cₖ M^{-1/2})` is small enough.

This is exactly `M ← Exp_M( mean of Log_M(Cₖ) )` — "map everything to the tangent space at the current guess, take the ordinary average there, map back, repeat." That is the sentence a learner should carry away.

✅ pyRiemann implements this with an adaptive step `ν` (starts at 1.0, multiplied by 0.95 on improvement, halved on worsening), `tol = 1e-8`, `maxiter = 50`, initialized at the Euclidean mean:
```
J = Σ_i w_i · logm(M^{-1/2} X_i M^{-1/2});   M ← M^{1/2} expm(ν J) M^{1/2}
```
✅ Pennec gives the same algorithm as Gauss–Newton with step `τ = 1/2` and notes it "may diverge when the SPD matrices are too far away from each other" — hence the adaptive step. **Worth teaching: this is a genuine optimization, it can fail, and step-size control matters. Presenting it as a closed-form "just average" is wrong.**

**Why the arithmetic mean is wrong: the swelling effect.**
✅ Pennec Fig. 0.2 caption: "Linear interpolation of SPD matrices. Left: linear interpolation on coefficients. Right: affine-invariant interpolation. We can notice the characteristic **swelling effect** observed in the Euclidean case, which is not present in the Riemannian framework."
✅ pyRiemann's own example text: "The 'swelling effect' is clearly visible in the Euclidean case: **the volume of associated ellipsoids is parabolically interpolated and reaches a maximum between the two extremities.**"

**The precise mathematical statement** (this is what the page must not garble):
- For the AIRM geometric mean of two matrices, `det(A # B) = √(det A · det B)` — the determinant is the *geometric* mean of the determinants, exactly.
- For the arithmetic mean, `det((A+B)/2) ≥ √(det A · det B)` (Minkowski determinant inequality), with equality only when `A = B`.
- So the Euclidean average **manufactures generalized variance that exists in neither input**. In EEG terms: the "average of two brain states" under Euclidean averaging is a state with *more total power/spread* than either — a physically fabricated state.

🔢 **Numerically verified** (4 random 4×4 pairs):

| `det A` | `det B` | `√(detA·detB)` | `det(arithmetic)` | `det(AIRM mean)` | `det(log-Eucl mean)` |
|---|---|---|---|---|---|
| 7.939 | 2.107 | 4.090 | **16.50** | 4.090 | 4.090 |
| 4.048 | 3.535 | 3.783 | **113.3** | 3.783 | 3.783 |
| 34.08 | 4.140 | 11.88 | **236.0** | 11.88 | 11.88 |
| 31.73 | 5.857 | 13.63 | **75.62** | 13.63 | 13.63 |

Note the arithmetic mean's determinant exceeds the geometric one by factors of 4× to 30×. Both AIRM and log-Euclidean means hit `√(det A det B)` exactly for two matrices.

### 2.8 The Log-Euclidean metric (LEM)

✅ Verbatim from pyRiemann:
$$d_{LE}(A,B) = \left\| \log(A) - \log(B) \right\|_F, \qquad \mathfrak{M}_{LE} = \exp\!\left(\sum_i w_i \log(X_i)\right)$$

**What it is conceptually.** ✅ SPD review: `log : S⁺⁺ → Sym` is a **global diffeomorphism**; LEM is the *pullback of the Euclidean metric through the matrix logarithm*. So log-Euclidean says: take the matrix log once, and from then on do plain Euclidean linear algebra.

**How it differs from AIRM — the honest comparison:**

| | AIRM | Log-Euclidean |
|---|---|---|
| Mean | iterative, no closed form | **closed form** (`exp` of average of `log`s) |
| Cost | matrix inverse-sqrt + log per pair | one `log` per matrix, then linear algebra |
| Swelling | avoided | **also avoided** (🔢 verified above) |
| Invariance | **full affine/congruence invariance** for all `W ∈ GL(d)` | only **orthogonal**/similarity invariance (`W` orthogonal) + scaling; **NOT** invariant to general congruence ✅ SPD review: "at the expense of losing affine invariance" |
| Curvature | non-positive, Hadamard | **flat** (it is a vector space in log coordinates) |

**When it's used:** as a fast approximation when data are tightly concentrated ✅ Pennec: "Log-Euclidean metrics, for instance, provide a very fast approximation **when the data are concentrated with respect to the curvature**"; and inside deep nets (the `LogEig` layer of SPDNet is exactly the log map at the identity ✅). **The single most important pedagogical point: log-Euclidean gives you the cone-respecting behaviour cheaply but sacrifices exactly the invariance that makes AIRM the right choice for EEG.** If a page presents them as interchangeable, that is the error to flag.

### 2.9 Curvature — get this right, most explainers do not

✅ **Pennec computes the sectional curvature explicitly.** In an orthonormal basis `E_ij|P`, the only non-zero sectional curvatures are
$$\kappa(E_{ii}, E_{ij}) = \kappa(E_{ij}, E_{jj}) = -\tfrac14 \quad (j\neq i), \qquad \kappa(E_{ij}, E_{ik}) = \kappa(E_{ij}, E_{kj}) = -\tfrac18 \quad (i\neq j\neq k\neq i)$$
> "The sectional curvature is thus in between `κ_min = −1/4` and `κ_max = 0`. In consequence, the manifold of SPD matrices with any affine-invariant metric has **bounded non-positive curvature and is a Hadamard manifold**." ✅ verbatim.

> "This is **not a constant curvature** since it varies depending on the chosen 2-subspace within the tangent space, but it is comparable at every point up to a rotation. This is a feature of homogeneous manifolds." ✅ verbatim.

**Consequences to teach:**
- **Non-positive curvature ⇒ Hadamard (Cartan–Hadamard) manifold**: complete, simply connected, no cut locus, no conjugate points, `Exp_P` is a global diffeomorphism from `T_P M ≅ ℝ^{d(d+1)/2}` onto the whole manifold. ✅ (both Pennec and SPD review). **Every pair of points is joined by exactly one geodesic.** ✅
- **⇒ the Fréchet mean exists and is unique** (§2.7). ✅
- **⇒ the whole manifold, though curved, is topologically as simple as a Euclidean space.** ✅ Pennec: "the structure obtained has many properties of Euclidean spaces even if it remains a manifold because of the curvature."

❗ **Error to flag: Congedo, Barachant & Andreev (2013) state the SPD manifold is "a regular manifold of constant curvature."** ✅ (verbatim, Appendix A). This is **imprecise** and contradicted by Pennec's explicit computation (`−1/4` in some 2-planes, `−1/8` in others). If the webpage sources that sentence, it is propagating an error. The correct phrasing is: *"homogeneous, non-positively curved, with curvature bounded in `[−1/4, 0]` — but the curvature is not constant across directions."*

⚠️ Note on the bound: I found a secondary claim that "sectional curvatures of SPD matrices are at least `−1/2`" (search snippet). Pennec's `−1/4` is from an explicit derivation in a primary text and Pennec himself notes his results are "consistent with the ones of [Sko84], **up to a factor 2** due [to] the [normalization]." **So the numeric bound is convention-dependent (`−1/4` or `−1/2` depending on metric normalization). A webpage should either use Pennec's `[−1/4, 0]` with attribution, or say "bounded, non-positive" without a number.**

---

## 3. The algorithms actually used in BCI

### 3.1 MDM — Minimum Distance to Mean (a.k.a. MDRM, Minimum Distance to Riemannian Mean)

**Training:** for each class `z`, compute the Riemannian mean `M_z` of the training covariance matrices of that class.
**Prediction:** ✅ Congedo 2013 eq. (3):
$$\hat z = \arg\min_{z} \; \delta_R\!\left(C, M_z\right)$$

Why it matters pedagogically:
- **Genuinely parameter-free.** ✅ Congedo 2013: "the MDM approach is fully automatic" — contrast with CSP (number of filter pairs) and BSS+LR (number of filters). The *only* choices are the band-pass band and the epoch length, which every method needs.
- **Multiclass for free.** ✅ "The MDM handles equally well and in the same way both the binary and the multiclass case." No one-vs-rest scaffolding.
- **A whole trained model is just `Z` matrices and a distance function** ✅ Congedo 2013: "a MDM classifier is defined exhaustively by a set of mean covariance matrices and a distance metric. As a consequence, differently from other kinds of classifiers, several MDM classifiers can be combined easily by combining several distances." — this is why filter-bank/ensemble variants are trivial to build.
- Learns from very little data (each class mean is a well-conditioned statistic long before a 253-dim linear classifier would be identifiable).
- It is the Riemannian analogue of a nearest-centroid classifier, i.e. **the simplest thing that could possibly work** — its selling point is not peak accuracy, it is that it's a *floor* that transfers.

**Sanity check for the page:** MDM's decision boundary between two classes is the set of points equidistant (in `δ_R`) from the two means — a *geodesic bisector*, which is **not** a hyperplane in the ambient matrix space. Drawing it as a straight line in the cone picture is wrong; it's a curved surface.

### 3.2 Tangent Space Mapping (TSM) + linear classifier — the standard modern pipeline

The workhorse. Steps:
1. Estimate trial covariances `Cᵢ` (with shrinkage — OAS or Ledoit–Wolf).
2. Compute the Riemannian mean `M` of **all training** covariances (class-agnostic).
3. Log-map each trial to the tangent space at `M`:
$$S_i = \log\!\left(M^{-1/2} C_i M^{-1/2}\right)$$
(pyRiemann's default whitened form — see the §2.3 warning.)
4. **Vectorize the upper triangle with `√2` off-diagonal weighting:**
$$\mathbf{s}_i = \operatorname{uvec}(S_i) \in \mathbb{R}^{d(d+1)/2}, \qquad \operatorname{uvec}(S) = \left[\,S_{11},\, \sqrt2\,S_{12},\, \dots,\, \sqrt2\,S_{1d},\, S_{22},\, \sqrt2\,S_{23},\, \dots,\, S_{dd}\,\right]$$
✅ verbatim from pyRiemann `upper()`: "it keeps the upper triangular part of the symmetric/Hermitian matrix and vectorizes it by applying **unity weight for diagonal elements and `√2` weight for out-of-diagonal elements**."
5. Feed `sᵢ` to any Euclidean classifier: regularized logistic regression, linear SVM, shrinkage LDA, elastic net.

**Why `√2` — the point most explainers omit or fumble.** ✅ SPD review states the reason exactly: "where `uvec` multiplies off-diagonal elements by `√2` so that `‖z‖₂ = ‖log_P(Q)‖_P`, i.e. **the Frobenius norm of `z` coincides with the affine-invariant Riemannian norm of its tangent representation**."

The elementary reason: for a symmetric `S`, `‖S‖_F² = Σᵢ Sᵢᵢ² + 2 Σ_{i<j} Sᵢⱼ²`. Each off-diagonal entry is *counted twice* in the full matrix but appears *once* in the upper triangle. Weighting it by `√2` makes its squared contribution `2Sᵢⱼ²` again. **Without the `√2`, the vectorization is not an isometry**, off-diagonal (connectivity) features are systematically down-weighted by `1/√2` relative to diagonal (power) features, and every downstream L2-regularized classifier is silently biased toward power features. This is a real, checkable correctness detail — if the page shows a naive `vec(triu(S))` it is wrong.

**Interpretation:** the diagonal entries of `S` are (log-)power-like features; the off-diagonals are (log-)connectivity-like. TSM is thus a principled superset of "band power + coherence features."

**Why TSM beats MDM.** ✅ MOABB: "the Riemannian method based on Tangent space projection **consistently outperforms** the approach centered on the Riemannian surface." MDM's centroid model can't exploit within-class covariance structure or feature-specific weighting; a regularized linear model in the tangent space can.

### 3.3 Riemannian alignment / recentering — the transfer-learning move

**The single most important practical technique on this page, and the one with the cleanest "aha."**

**The transformation** ✅ verbatim (He & Wu, quoting Zanini et al. eq. (5)):
$$\tilde\Sigma_i = \bar R^{-1/2}\, \Sigma_i\, \bar R^{-1/2}$$
where `R̄` is the Riemannian mean of a set of reference matrices from that session/subject (resting-state trials in Zanini's original; in practice, **the Riemannian mean of *all* that session's trials** works and is fully unsupervised).

**What it does, geometrically.** After this transform, the mean of that session's matrices is **the identity matrix**. Every session is *translated along the manifold* until its centroid sits on the same point.

**Why this works — the argument to land** ✅ verbatim from He & Wu quoting Zanini: "different source configurations and electrode positions induce shifts of covariance matrices with respect to a reference (resting) state, but that **when the brain is engaged in a specific task, covariance matrices move over the SPD manifold in the same direction**." And critically ✅: "This transformation would **not change the distance between the covariance matrices belonging to the same session/subject because of the congruence invariance property**, but makes the covariance matrices of different sessions/subjects move over the Riemannian manifold in different directions with respect to the corresponding reference matrices."

**This is the payoff of §2.5 and it should be stated as a two-step syllogism:**
1. Congruence invariance ⇒ recentering is an **isometry**: it does *not* distort the within-session geometry at all. The class structure survives intact.
2. The between-session nuisance *is* (approximately) a congruence ⇒ recentering **removes it**.
Therefore: **a transformation that is free (loses no information) exactly cancels the dominant source of domain shift.** No Euclidean method can make both claims simultaneously. This is not "curvature is cool" — it is a conservation argument.

**Note on the whitening interpretation** ✅ pyRiemann `TLCenter`: "This operation **corresponds to a whitening** when the matrices represent the spatial covariance matrices of multivariate signals." So recentering-to-identity = per-session whitening. The reason to introduce it geometrically rather than as "just whitening" is that only the geometric framing tells you *why it's lossless*.

**RPA — Riemannian Procrustes Analysis** (Rodrigues, Jutten & Congedo, IEEE TBME 66:2390–2401, 2019 ⚠️ bibliographic details from search): matches source and target distributions by three geometric operations, implemented in pyRiemann as three composable transformers ✅:
- `TLCenter` — **translation**: recenter each domain's mean to the identity.
- `TLScale` — **scaling/stretching**: "stretches the matrices from each domain around their mean so that the **dispersion** of the matrices of each domain is equal to one." (Dispersion = Fréchet variance.)
- `TLRotate` — **rotation**: "rotates the matrices from each source domain so to match its **class means** with those from the target domain." (Requires labels in the target — this is the *supervised* step; centering and scaling are unsupervised.)
✅ Order matters and is enforced: "The inputs from each domain must have been centered … before calculating the rotation."

⚠️ RPA reported result (search snippet, unverified from the paper): evaluated on 8 public BCI datasets across 3 paradigms, 243 subjects total; classification accuracy superior to other geometry-aware methods.

**Contrast: Euclidean Alignment (EA)** (He & Wu, 2019) ✅ uses the **arithmetic** mean `R̄ = (1/n) Σ XᵢXᵢᵀ` and aligns the **raw signals** `X̃ᵢ = R̄^{-1/2} Xᵢ` rather than the covariances. Cheaper, unsupervised, and lets you use any downstream pipeline (including CSP or a CNN). Their claim is that EA outperforms RA-MDRM. ✅ Their stated motivation against RA is (i) it needs resting-state or non-target trials, i.e. it is not fully unsupervised for ERP, and (ii) the Riemannian mean is expensive. **A balanced page should mention EA — it is the strongest "you don't strictly need the manifold for the alignment trick" counterpoint, and it is honest to say the geometric framing *explains* why alignment works even when a Euclidean shortcut computes it.**

### 3.4 FgMDM / FGDA — geodesic filtering

✅ verbatim from pyRiemann:
- **FGDA (Fisher Geodesic Discriminant Analysis)**: "projects SPD matrices in tangent space, applies a Fisher linear discriminant analysis (FLDA) to reduce dimension, and **projects filtered tangent vectors back in the manifold**."
- **FgMDM**: "Apply geodesic filtering …, and classify using MDM. The geodesic filtering is achieved in tangent space with a Linear Discriminant Analysis, then data are projected back to the manifold and classified with a regular MDM. This is basically a pipeline of FGDA and MDM."

So the round trip is: manifold → tangent space → *supervised* dimensionality reduction (discard non-discriminative directions) → back to the manifold → MDM. It buys MDM a supervised denoising step while keeping MDM's centroid simplicity. ✅ Congedo 2013 describes this and reports it "improves substantially over the results shown in table 1."

**`tsupdate` — worth a mention.** ✅ Both `FgMDM` and `FGDA` expose `tsupdate`: "Activate tangent space update for **covariate shift correction between training and test** … Performance are better when the number of matrices for prediction is higher." This is recentering-by-another-name applied at test time: recompute the tangent-space reference point from the test data. It is a nice concrete instance of the general principle.

### 3.5 Filter Bank + Riemannian

The idea: instead of one 8–30 Hz band, decompose into several sub-bands, compute covariance per band, and either (a) block-diagonally concatenate them into one larger SPD matrix, or (b) run one Riemannian pipeline per band and ensemble/stack the outputs. Motivation: mu and beta ERD have different topographies and different subject-specific peak frequencies, so a single wide band mixes them.

✅ pyRiemann's `FilterBank` transformer and `examples/biosignal-mi/plot_frequency_band_selection.py` exist and implement this. MOABB includes filter-bank pipelines. ⚠️ I did **not** verify specific accuracy numbers for FB-Riemannian versus single-band Riemannian in this session — do not let the page quote a delta without a citation.

Note the composability point again: because an MDM model is "a set of means + a distance," ✅ Congedo 2013 explicitly frames multi-band as combining distances.

### 3.6 Relationship to CSP

Three distinct, correct statements — the page should not blur them.

**(a) CSP is the classic method it replaces.** CSP solves `Σ₊ w = λ Σ₋ w` ✅ on class-mean covariances, projects, and uses log-variances. It compresses the covariance to `2k` numbers.

**(b) CSP is a *special case* of tangent-space filtering.** ✅ Xu et al. (TSSF, arXiv:1909.10567) prove: "**CSP is the representation of TSSF when LDA is chosen as the classifier on the tangent space, and the within-class scatter matrix is assumed to be the identity.**" Their chain is `F_TSSF ⇒ GED(C_w, C_m) ⇒ GED(C₊ − C₋, C₊ + C₋) ≡ GED(C_d, C_c) ⇒ F_CSP`. ⚠️ They also state a caveat: the derivation assumes class means and their tangent images are related by the exponential transform, "which is not necessarily true."

**Consequence for the page's framing:** the honest story is not "Riemannian replaces CSP with something exotic," it is **"CSP is what you get when you do the Riemannian thing and then throw away information — specifically, when you assume isotropic within-class scatter and keep only a few directions."** Tangent-space + a *properly regularized* classifier keeps what CSP discards. That reframing is far more satisfying and is defensible from a primary source.

**(c) Riemannian CSP.** ✅ Barachant et al. replaced the arithmetic class means inside CSP with Fréchet means, and (per the TSSF paper) "show increased performance and robustness with this alteration" — because the arithmetic means swell.

**(d) Information-geometric view of CSP.** ✅ SPD review: the top-`d` CSP filters maximize the **symmetric KL divergence** between Gaussian models of the projected signals; the `divCSP` framework generalizes this with `β`-divergences.

### 3.7 Riemannian Potato — artifact rejection

✅ From pyRiemann `artifact_detection.Potato` (Barachant, Andreev & Congedo, TOBI Workshop IV, 2013):
> "a clustering method used to detect artifact in multichannel signals. Processing SPD matrices, the algorithm **iteratively estimates the centroid of clean matrices by rejecting every matrix that is too far from it**."

**Algorithm:**
1. Compute the Riemannian mean `M` of the current "clean" set.
2. Compute `dᵢ = δ_R(Cᵢ, M)` for all trials.
3. Compute a **z-score** and reject `z ≥ threshold` (pyRiemann default `threshold = 3`, i.e. 3 SDs).
4. Recompute the mean on the surviving set; iterate to convergence (`n_iter_max = 100`).

**❗ IMPLEMENTATION DETAIL THE PAGE WILL PROBABLY GET WRONG.** pyRiemann z-scores the **logarithm** of the distance, not the distance:
```python
d = np.squeeze(np.log(self._mdm.transform(X[ix])))
self._mean = np.mean(d);  self._std = np.std(d)
y[ix] = self._get_z_score(d) < self.threshold
```
✅ verbatim. And the docstring for `transform` reads: "Return the **standardized log-distance** to the centroid … ie **geometric z-scores** of distances." Rationale: distances are positive and right-skewed, roughly log-normal; taking the log makes a Gaussian z-score meaningful. So the correct formula is
$$z_i = \frac{\log \delta_R(C_i, M) - \mu_{\log d}}{\sigma_{\log d}}$$
Saying "z-score of the distance to the mean" is *approximately* right in spirit but *literally* wrong as implemented.

**Why it works:** an artifact (blink, jaw clench, electrode pop, movement) changes the *spatial covariance structure*, not just the amplitude — and a change in covariance structure is exactly what `δ_R` measures. Because `δ_R` is affine-invariant, the detector doesn't need per-subject amplitude calibration.

**Potato Field** (Barthélemy, Mayaud, Ojeda & Congedo, IEEE TNSRE 27(2):244–255, 2019) ✅: "combines several potatoes of low dimension, each one being designed to capture specific artifact typically affecting specific subsets of channels and/or specific frequency bands," combining per-potato probabilities into one signal-quality index. Motivation ✅: the single high-dimensional potato loses sensitivity as channel count grows; small specialized potatoes each stay sensitive. pyRiemann defaults: `p_threshold = 0.01`, `z_threshold = 3`. ⚠️ I did not verify the paper's reported sensitivity/specificity figures.

### 3.8 Beyond: SPDNet / geometric deep learning (context, if the page mentions it)
✅ From the SPD review — SPDNet has three layer types:
- **BiMap**: `S ↦ W S Wᵀ` with `W` full-row-rank (typically constrained to the Stiefel manifold) — a *learned congruence*.
- **ReEig**: `U max(εI, Σ) Uᵀ` — eigenvalue rectification, the SPD analogue of ReLU.
- **LogEig**: `U log(Σ) Uᵀ` — the log map at the identity; embeds into the tangent space so ordinary Euclidean layers can follow.
- **RieBN** (Brooks et al.): batch-norm on the manifold — center via `Γ_{B→e}(Sᵢ) = B^{-1/2} Sᵢ B^{-1/2}` (batch Fréchet mean `B`, approximated by a few Karcher-flow steps), then a learnable re-bias `Γ_{e→G}(S̄ᵢ) = G^{1/2} S̄ᵢ G^{1/2}`. ✅ These congruences "coincide with **parallel transport** along geodesics under the affine-invariant Riemannian metric."
**Note the elegant closure:** RieBN is *literally the recentering trick of §3.3, learned and applied per batch.* Same operation, three names (whitening / recentering / manifold batch-norm).

---

## 4. Concrete empirical results

### 4.1 Congedo, Barachant & Andreev (2013), BCI Competition IV dataset 2a ✅ (table extracted verbatim)

**Setup:** 9 subjects, 4 classes (left hand, right hand, feet, tongue), 22 electrodes, 8–30 Hz band-pass, 2 s of data per trial. **Cross-session** evaluation: train on session 1 → test on session 2, and vice versa (18 session-pairs). Chance = 25% for 4-class.

| | MDM (mean ± sd) | Competitor (mean ± sd) |
|---|---|---|
| Binary (avg over 6 class pairs) | **79.71 ± 9.44** | CSP+LDA: **80.45 ± 12.30** |
| 4-class | **61.42 ± 13.15** | BSS+LR: **58.26 ± 18.80** |

**Statistics as reported** ✅:
- 4-class: MDM "marginally superior" — paired *t*(17) = 1.9, **p = 0.074**, two-tailed. **Not significant at 0.05.**
- Binary: "there was **no difference** between the MDM and the CSP+LDA method."

**❗ How to use these numbers honestly.** They do **not** support "Riemannian beats CSP." They support:
- **Equal accuracy with zero hyperparameters** (CSP needed 3 filter pairs chosen; BSS+LR needed 8 filters chosen).
- **Substantially lower variance across sessions**: sd 9.44 vs 12.30 (binary) and 13.15 vs 18.80 (4-class). That is a ~30% reduction in spread — the robustness claim is the one the data actually supports.
- ✅ The paper's own qualitative finding: "the performance of the MDM approach is more or less equivalent for subjects performing well, **while it is better for subjects performing poorly**." → **Riemannian methods compress the bad tail.** For a real-world BCI, reducing the BCI-illiteracy rate matters more than raising the ceiling. This is the correct headline.

### 4.2 Barachant et al. (2012), IEEE TBME — TSLDA
⚠️ From a search snippet (HAL blocked; **not** verified against the paper): "The TSLDA method outperforms the reference method, increasing the mean classification accuracy **from 65.1% to 70.2%**." A `+5.1` point gain. **Flag: if the webpage cites this, it should cite it as Barachant, Bonnet, Congedo & Jutten, IEEE TBME 59(4):920–928, 2012, and I could not independently confirm the numbers.**

### 4.3 Competition wins ✅ (from Barachant's own site, with team counts)

| Competition | Year | Place | Teams |
|---|---|---|---|
| DecMeg2014 — Decoding the Human Brain | 2014 | **1st** | 267 |
| BCI Challenge @ NER 2015 (Kaggle/Inria) | 2015 | **1st** | 260 |
| Grasp-and-Lift EEG Detection (Kaggle) | 2015 | **1st** | 379 |
| Microsoft Decoding Brain Signals | 2016 | **1st** | 688 |
| Biomag 2016 — Competition 3 | 2016 | **1st** | 6 |
| Melbourne Univ. AES/MathWorks/NIH Seizure Prediction | 2016 | **1st** | 478 |

⚠️ The page listing does not state which method was used per competition. The claim that Riemannian methods drove these wins is well established in the literature (Congedo/Barachant/Bhatia 2017 report "winning scores in five recent international predictive modeling BCI data competitions" ⚠️ search snippet), and Barachant's public repo for the NER 2015 challenge is explicitly Riemannian. **The precise, defensible sentence is: "Alexandre Barachant, using Riemannian pipelines, placed 1st in five/six international BCI-and-neural-decoding data competitions between 2014 and 2016, against fields of 260–688 teams."** Note the Biomag entry had only 6 teams — do not cherry-pick it. ❗ Also note the seizure-prediction win is not a BCI task; be careful with "five BCI competitions."

### 4.4 MOABB — the largest benchmark ✅

Chevallier et al. (2024), [arXiv:2404.15319](https://arxiv.org/abs/2404.15319): **30 pipelines** (11 raw, 13 Riemannian, 6 deep-learning) × **36 public datasets** (14 MI, 15 P300, 7 SSVEP), with nested CV hyperparameter tuning for raw and Riemannian pipelines, meta-analytic statistics, plus runtime and carbon cost.

Verbatim findings ✅:
- "The Riemannian distance-based classification pipeline **consistently outperforms results obtained through DL and Raw pipelines across all datasets, on all paradigms**."
- "The Riemannian pipelines demonstrate the **highest accuracy**, whereas DL pipelines, while achieving admirable accuracy with extensive trial data, show limitations across most datasets."
- "the Riemannian method based on **Tangent space projection consistently outperforms** the approach centered on the Riemannian surface [MDM]."
- "Riemannian pipelines **perform best in scenarios involving a reduced number of channels** … the Riemannian pipelines excel in performance with datasets containing [0, 25] electrodes. Notably, their performances tend to **decrease as the number of channels increases**."
- Riemannian pipelines compared in Fig. 4b: `MDM`, `FgMDM`, `TS+SVM`, `TS+LR`, `TS+EL`, `ACM+TS+SVM`.

**Caveat the page must include for honesty** ✅: DL pipelines were run **off-the-shelf** with original-paper hyperparameters and **no data augmentation**, while raw and Riemannian pipelines got nested-CV tuning. The authors say so plainly. So "Riemannian beats deep learning" is true *as an off-the-shelf claim on typical BCI data volumes*, not as an architectural verdict.

⚠️ **I did not extract per-pipeline numeric scores from the MOABB PDF** (they are in appendix tables/figures I did not parse). Do not let the page quote a specific MOABB accuracy number without checking the source.

### 4.5 Cross-session/cross-subject transfer — why it wins *there* specifically
The mechanism (§3.3) predicts the empirical pattern: the advantage should be largest exactly where the *nuisance* is a congruence and smallest where the classes genuinely overlap. ✅ Congedo 2013's cross-session table shows the variance reduction. ✅ He & Wu report RA-MDRM outperformed MDRM in MI and ERP under transfer settings. ⚠️ Specific transfer deltas from Zanini et al. (2018) could not be retrieved.

### 4.6 "Clinical-grade" claims
⚠️ I could **not** verify any specific clinical-grade accuracy result for Riemannian EEG classification in this session. Congedo/Barachant/Bhatia's abstract makes qualitative claims ("simplicity, accuracy, robustness and transfer learning capabilities," "suitable for real-world operation in adverse conditions"). **If the webpage asserts clinical-grade numbers, ask for the citation — I have no primary source for it.**

---

## 5. Common pedagogical pitfalls and misconceptions

### 5.1 ❗ The sphere analogy — where it helps and where it actively misleads
The most common visual crutch: "the space is curved, like a sphere; the shortest path is a great circle, not a straight line."

**Where it helps:** it conveys (a) geodesic ≠ chord, (b) the naive straight-line interpolant leaves the space, (c) a tangent plane is a local flat approximation.

**Where it MISLEADS — and the page should say so explicitly:**

| Sphere (K > 0) | SPD manifold with AIRM (K ≤ 0) |
|---|---|
| Geodesics between antipodal points are **non-unique** (infinitely many) | **Exactly one geodesic** between any two points ✅ |
| Has **conjugate points** and a **cut locus** | **No conjugate points, no cut locus** ✅ Pennec: "a space without cut-locus globally diffeomorphic to a Euclidean space" |
| Geodesics **reconverge**; triangles are **fat** (angle sum > π) | Geodesics **diverge**; triangles are **thin** (angle sum < π) — CAT(0) |
| `Exp_P` is **not** injective | `Exp_P` is a **global diffeomorphism** ✅ |
| **Compact, finite volume, closed** | **Non-compact, infinite extent, no boundary** ✅ |
| Fréchet mean **need not be unique** | Fréchet mean **always exists and is unique** ✅ |

A sphere is the *canonical example of the wrong sign of curvature.* Every property that makes the SPD manifold pleasant to compute on — unique geodesics, unique means, globally valid log map — is a consequence of curvature being **non-positive**, which the sphere picture teaches backwards.

**What to use instead:**
- **The cone picture** (§2.1) — geometrically accurate for `d = 2`, shows the boundary, shows the identity as a distinguished point, and can carry a geodesic vs chord overlay. This is what pyRiemann actually plots.
- **The hyperbolic/saddle picture** or a Poincaré-disk sketch, if a curvature analogy is really wanted — right sign of curvature, right divergence behaviour. (`P(2)` decomposes as a flat scaling direction × a hyperbolic plane, which is *why* the disk analogy is apt for the smallest case; ⚠️ I verified `P(n)` splits as `USym⁺ ⊗ ℝ⁺*` (unit-determinant part × scaling) in Pennec ✅, but did not verify the "`= ℝ × H²` for `n = 2`" statement from a primary source — don't assert it without checking.)
- **Best of all: the ellipse picture.** An SPD matrix *is* an ellipse/ellipsoid. Interpolating two ellipses and watching the Euclidean path balloon while the Riemannian path rotates and stretches smoothly is the single most information-dense image in the subject.

### 5.2 "Curved space" hand-waving instead of actual structure
Symptoms: the page says "EEG data lives on a curved manifold" and then jumps to results. What's missing is that **"manifold" here means something completely concrete**: a specific set (SPD matrices), with a specific inner product at each point (§2.2), from which a specific distance (§2.2), specific geodesics (§2.4), and a specific mean (§2.7) are *derived*. Everything else follows mechanically. A learner should be able to answer "what exactly is curved, and how do you know?" — the answer is Pennec's explicit `κ ∈ [−1/4, 0]` computation, not vibes.

### 5.3 Failing to justify covariance as the feature
See §1.1. If the page opens with "we take the covariance matrix" and never says *why* (ERD/ERS is second-order; covariance is the Gaussian sufficient statistic; source mixing acts on covariance as congruence), then the whole edifice looks like mathematics in search of an application. **The congruence point in particular is what makes covariance the *uniquely* right object — not just a convenient one.**

### 5.4 Presenting the log map as magic
Symptoms: "we apply the logarithmic map to get to the tangent space, where we can use normal machine learning." Missing:
- **What the tangent space *is*:** the vector space of symmetric matrices at a point — where subtraction and signed combination become legal again.
- **That it's a linearization** with error growing away from the base point — hence choosing the Fréchet mean as base.
- **The refinement of §2.6:** it's exact radially, approximate laterally. Because the manifold is Hadamard, the map is globally defined and bijective, so "only locally valid" is itself an over-correction.
- **That `log` here is a *matrix* function** (eigendecompose, log the eigenvalues, rotate back) — not an elementwise log. Learners conflate these constantly. Worth showing `log(C) = U log(Λ) Uᵀ` explicitly ✅.
- **Where the `√2` comes from** (§3.2) — omitting it makes the vectorization look like an arbitrary bookkeeping step rather than an isometry.

### 5.5 Not conveying that the point is *invariance*, not curvature
This is the deepest failure mode. The value proposition is **not** "we use fancy geometry." It is:

> There is a large group of transformations (`GL(d)` acting by congruence) that (i) EEG nuisance factors live in, and (ii) we want our analysis to ignore. AIRM is *defined* to be the metric that ignores exactly that group. Curvature is a **consequence** of demanding that invariance, not a goal.

If a learner walks away thinking "curvature improves accuracy," they've missed it. The correct causal chain is: **invariance requirement → forces this metric → this metric happens to make the space curved → curvature is non-positive → therefore means are unique and geodesics are unique → therefore the algorithms are simple and stable.** Curvature is a *cost that turns out to be a benefit*, not the mechanism.

### 5.6 Other specific errors to check for
- ❗ **"Constant curvature."** See §2.9. Appears verbatim in Congedo et al. 2013, is wrong.
- ❗ **Claiming Riemannian methods universally dominate.** MOABB says they degrade with high channel counts ✅; the TSSF paper calls large-channel application "infeasible" ✅; Congedo 2013's own table shows MDM ≈ CSP+LDA for binary ✅.
- ❗ **Confusing AIRM with log-Euclidean.** They give the same 2-matrix determinant behaviour (🔢) but different invariances. Do not say "log-Euclidean is just a faster AIRM" — it loses affine invariance ✅.
- ❗ **`δ_R` written with `log` of a ratio of matrices**, e.g. `‖log(P₂/P₁)‖`. Matrix "division" is ambiguous; `P₁⁻¹P₂` is generally **not symmetric**, so `log` of it is fine spectrally (its eigenvalues are real positive) but `‖log(P₁⁻¹P₂)‖_F ≠ δ_R` in general. The **symmetrized** form `P₁^{-1/2}P₂P₁^{-1/2}` is what makes the Frobenius norm correct. This is a real and common error.
- ❗ **Naive `vec(triu(·))`** without `√2` (§3.2).
- ❗ **Z-scoring the raw distance** in the potato rather than the log-distance (§3.7).
- ❗ **Claiming the log map is "only locally valid"** without the Hadamard refinement (§2.6).
- ❗ **Claiming recentering "removes" the shift while also distorting the data.** It is an isometry — it distorts *nothing* within a session. That's the whole point.
- ❗ **Skipping shrinkage.** With `d` comparable to `T`, the SCM is ill-conditioned and every log/inverse-sqrt is numerically unstable. Real pipelines use OAS/Ledoit–Wolf.
- ⚠️ **Drawing the MDM decision boundary as a straight line.** It's a geodesic bisector, a curved surface.

---

## 6. The 8 "aha" moments a good explainer MUST land

Opinionated and ordered. If a learner can state all eight in their own words, they understand the subject and can apply it.

**1. The feature is the covariance matrix, and that is forced, not chosen.**
The BCI signal is band-limited power modulation (ERD/ERS). Under a zero-mean Gaussian model of a band-passed epoch, covariance is the *sufficient statistic*. Nothing is thrown away that the model says exists.

**2. Covariance matrices form an open convex cone, not a vector space — and Euclidean tools are internal-operation violations.**
`A − B` isn't a covariance. `(A+B)/2` is, but it's the wrong one (see #4). The set has a shape, and the shape has consequences. *Test: can they draw the 2×2 cone and say what the constraint `xy − z² > 0` means?*

**3. All the EEG nuisance you hate is a congruence `C ↦ WCWᵀ`.**
Volume conduction, lead field, electrode gain, referencing, whitening, spatial filtering, session drift — all the same algebraic form. *This is the observation the entire field is built on.* **If a learner takes away one thing, it's this.**

**4. AIRM is the metric that is blind to congruence — and therefore the only sensible ruler for EEG covariance.**
`δ(WPWᵀ, WQWᵀ) = δ(P,Q)`. You get the benefit of solving the inverse problem without solving it. Bonus depth: this metric is the **Fisher–Rao information metric** on zero-mean Gaussians — so "distance" literally means "statistical distinguishability of the underlying source distributions." *Test: can they say why this is better than "Riemannian geometry is more expressive"?*

**5. The arithmetic mean of covariance matrices is a lie: it swells.**
`det((A+B)/2) ≥ √(det A det B)`, with the AIRM mean achieving equality. The Euclidean average of two brain states is a state with more generalized variance than either — a fabricated state. *This retroactively explains why CSP's arithmetic class means are a weak point.* **Show the ellipse-interpolation figure; it makes the point in one second.**

**6. Curvature is a consequence of demanding invariance — and its sign is the good one.**
Non-positive curvature (Hadamard) ⇒ exactly one geodesic between any two points ⇒ the Fréchet mean **exists and is unique** ⇒ the iterative algorithm converges to the right answer. **The sphere analogy teaches the opposite sign and should be retired.** *Test: can they say why the mean is unique here but not on a sphere?*

**7. The tangent space is a change of coordinates, not a new idea — and it's why the pipeline is boring by design.**
Pick the Fréchet mean as origin, log-map everything, and you're back in `ℝ^{d(d+1)/2}` where logistic regression works. Two subtleties they must hold: the `√2` off-diagonal weight makes it an **isometry**, and the linearization is exact radially but approximate laterally. *The punchline: the geometry does its work at the feature-extraction step, and then ordinary ML takes over. There is no exotic classifier.*

**8. Recentering is the payoff, and it's free.**
`C ↦ M^{-1/2} C M^{-1/2}` slides each session's centroid onto the identity. Because congruence is an isometry, **within-session structure is preserved exactly**; because the between-session shift *is* a congruence, it is **cancelled exactly**. One transformation, zero information lost, dominant domain shift removed. **No Euclidean method can claim both halves.** This is why Riemannian methods win specifically at cross-session and cross-subject transfer, why they enable calibration-free BCI, and why they won competitions where the test set was a held-out subject. *Test: can they explain why this doesn't distort the data?*

*(Optional 9th, for depth): The whole family is one idea in three costumes — per-session whitening, Riemannian recentering, and SPD batch-norm (RieBN) are the same congruence, and RPA just adds scaling and rotation to it.*

---

## 7. Best existing explainers and visualizations worth emulating

### 7.1 pyRiemann's example gallery — the best free visual assets ✅
All under `pyRiemann/examples/` on GitHub, rendered in the docs.

**`simulated/plot_metric_comparison.py`** — the single most useful file. Four figures:
1. **"Cone of 2×2 SPD matrices"** — 3-D wireframe of `z = ±√(xy)` over `x,y ∈ [0,3]`, with the identity marked at `(1,1,0)`. ✅ Reproduces **Fig. 3 of Yger, Bérar & Lotte (2017)**. *This is THE canonical SPD-cone picture.*
2. **"Geodesics between 2×2 SPD matrices"** — three curves from `A = [[350,−50],[−50,45]]` to `B = [[200,10],[10,1]]`: Euclidean (straight chord), log-Euclidean, and affine-invariant Riemannian, plotted in the same `(x,y,z)` cone coordinates with 2-D shadow projections on each wall. ✅ The comment notes matrices are chosen "away from identity **to reinforce differences** between log-Euclidean and affine-invariant Riemannian geodesics" — a deliberate pedagogical choice worth copying. *This is the geodesic-vs-chord picture.*
3. **Bilinear interpolation of four SPD matrices as ellipses**, rendered three times (Euclidean / log-Euclidean / AIRM). ✅ Reproduces **Fig. 4.2 of Arsigny, Fillard, Pennec & Ayache (SIAM J. Matrix Anal. Appl., 2007)**. ✅ Doc text: "The 'swelling effect' is clearly visible in the Euclidean case: the volume of associated ellipsoids is parabolically interpolated and reaches a maximum between the two extremities." *This is THE swelling-effect picture.*
4. **"TraDe plot"** — log-trace vs log-determinant scatter of 100 SPD matrices with the five different means (`riemann`, `euclid`, `harmonic`, `logeuclid`, `wasserstein`) overlaid as distinct markers. ✅ Reproduces **Fig. 7 of Chevallier, Kalunga, Barthélemy & Monacelli, *Neuroinformatics*, 2021**. *Brilliant, under-used idea: it makes "which mean you pick actually moves the answer" visible in 2-D, and shows the Euclidean mean sitting at higher log-det (swelling) than the others.*

**`transfer/plot_rpa_steps.py`** — "Data transformations in the Riemannian Procrustes Analysis." ✅ Uses `SpectralEmbedding(n_components=2, metric="riemann")` to plot source and target domains in 2-D **at each RPA stage**: original → after `TLCenter` → after `TLRotate`, with the identity matrix stacked in and used as the origin. ✅ Reproduces **Fig. 1 of the RPA paper**. *This is the best available "watch the domain shift disappear" animation-in-three-panels. If the page wants one transfer-learning figure, it is this one.*

**Other relevant examples** ✅: `artifacts/plot_detect_riemannian_potato_EEG.py` and `..._potato_field_EEG.py` (online artifact detection); `simulated/plot_riemannian_gaussian.py` (spectral embedding of Riemannian Gaussian samples at different `ε` centering and `σ` dispersion — a clean way to visualize *what dispersion means* before introducing `TLScale`); `simulated/plot_classifier_comparison.py`; `biosignal-ssvep/plot_classify_ssvep_pga.py` (principal geodesic analysis); `biosignal-erp/plot_embedding_MEG.py`.

### 7.2 Key papers as explainers
- **Pennec, Ch. 3, "Manifold-valued image processing with SPD matrices"** — the most mathematically complete open-access treatment. Has the explicit curvature computation, the full affine-invariant family, the Fréchet-mean algorithm with convergence discussion, and the swelling figure. **Use it to check any formula.** [PDF](https://www-sop.inria.fr/asclepios/cours/MVA/chapter3.pdf)
- **Congedo, Barachant & Bhatia (2017), "Riemannian geometry for EEG-based brain–computer interfaces; a primer and a review,"** *Brain-Computer Interfaces* 4(3):155–174, [doi:10.1080/2326263X.2017.1297192](https://doi.org/10.1080/2326263X.2017.1297192). ⚠️ Could not retrieve full text (HAL/T&F blocked). Universally cited as *the* entry point; its abstract explicitly promises to "elucidate the link between a simple Riemannian classifier and a state-of-the-art spatial filtering approach."
- **Yger, Bérar & Lotte (2017), "Riemannian approaches in Brain-Computer Interfaces: a review,"** IEEE TNSRE. Source of the canonical SPD-cone figure (Fig. 3). ⚠️ HAL-blocked.
- **Congedo, Barachant & Andreev (2013)**, [arXiv:1310.8115](https://arxiv.org/abs/1310.8115) — **freely accessible, and the best source for the *rhetoric***. Contains the "biased ruler" analogy: ✅ *"we have started a long time ago measuring distances with a biased ruler. Then we have developed [complex instruments to compensate] … Providing the valid ruler to measure distances is the main achievement of the Riemannian framework."* **That metaphor is excellent and directly reusable** — it frames CSP/spatial filtering as compensating machinery that becomes unnecessary once the ruler is fixed. Also has Fig. 2, a clean MDM schematic (spheres vs pyramids around two class means).
- **SPD Matrix Learning for Neuroimaging Analysis (2025)**, [arXiv:2504.18882](https://arxiv.org/abs/2504.18882) — the most current and most rigorous free survey; Fig. 1 shows the manifold with tangent space at the Fréchet mean, a tangent vector, and a geodesic through it. Best source for the AIRM/LEM/LCM/BWM comparison table.
- **MOABB benchmark (2024)**, [arXiv:2404.15319](https://arxiv.org/abs/2404.15319) — for evidence, not exposition. Raincloud plots (Fig. 3) comparing Raw/Riemannian/DL distributions per paradigm are a nice format for "the whole distribution shifts, not just the mean."

### 7.3 Other resources
- **`lkorczowski/BCI-2021-Riemannian-Geometry-workshop`** (GitHub) — materials from Workshop W13 at the 8th International BCI Meeting, June 2021. ✅ Has `notebooks/`, `slides/`, `timeflux/` directories; covers history, math/computational properties, artifact removal, classification, transfer learning, cross-dataset evaluation, and a real-time ERP speller. ⚠️ I did not inspect individual notebooks.
- **`alexandrebarachant/bci-challenge-ner-2015`** (GitHub) — documented winning solution; good for "what a real competition pipeline looks like."
- **MOABB docs** (`moabb.neurotechx.com`) — runnable cross-session MI examples.

### 7.4 Visualization checklist for the webpage
A page that includes these five images, in this order, will land the story:
1. **Ellipse = SPD matrix**, and a scalp-covariance heatmap next to its ellipsoid. *(Grounds the abstraction.)*
2. **The 2×2 cone** with the identity marked and the boundary drawn. *(The set has a shape.)*
3. **Geodesic vs. chord in the cone**, with the chord visibly bulging. *(The ruler matters.)*
4. **The ellipse-interpolation swelling triptych** (Euclidean / log-Euclidean / AIRM). *(The arithmetic mean is a lie.)* — most information-dense image in the subject.
5. **The RPA three-panel embedding** (before / recentered / rotated), two domains in two colours. *(The payoff.)*
Optionally: **the tangent-plane picture** — manifold, base point at the Fréchet mean, flat plane touching it, a few points projected up with arrows. But only if it also shows *distortion growing with distance*, otherwise it teaches that the tangent space is free.

---

## 8. Quick correctness checklist for reviewing the page

| # | Check | Correct form |
|---|---|---|
| 1 | Distance formula | `δ = ‖log(P₁^{-1/2}P₂P₁^{-1/2})‖_F = √(Σ log²λᵢ)`; **symmetrized**, not `log(P₁⁻¹P₂)` inside a Frobenius norm |
| 2 | What `λᵢ` are | generalized eigenvalues of `(P₂, P₁)`, i.e. eigenvalues of `P₁^{-1/2}P₂P₁^{-1/2}` (= those of `P₁⁻¹P₂`) |
| 3 | Manifold dimension | `d(d+1)/2` |
| 4 | Geodesic | `P₁^{1/2}(P₁^{-1/2}P₂P₁^{-1/2})^t P₁^{1/2}` |
| 5 | Log map | `Log_P(Q) = P^{1/2} log(P^{-1/2}QP^{-1/2}) P^{1/2}` (full) **or** `log(P^{-1/2}QP^{-1/2})` (whitened, pyRiemann default) — not mixed |
| 6 | Exp map | `Exp_P(W) = P^{1/2} exp(P^{-1/2}WP^{-1/2}) P^{1/2}` |
| 7 | Curvature | non-positive, **non-constant**, bounded (`[−1/4, 0]` in Pennec's normalization); Hadamard manifold |
| 8 | Sphere analogy | either absent, or explicitly flagged as the wrong sign of curvature |
| 9 | Fréchet mean | iterative, no closed form; unique because Hadamard; `M ← Exp_M(mean of Log_M(Cᵢ))` |
| 10 | Log-Euclidean | `‖log A − log B‖_F`; mean `exp(Σ wᵢ log Xᵢ)`; **not** affine-invariant |
| 11 | Swelling | `det` statement, not a vague "gets bigger"; `det((A+B)/2) ≥ √(detA·detB) = det(A#B)` |
| 12 | TSM vectorization | `√2` on off-diagonals, so the vectorization is an isometry |
| 13 | Invariance | `δ(WPWᵀ, WQWᵀ) = δ(P,Q)` for **invertible** `W`; note avg-ref is singular |
| 14 | Recentering | `M^{-1/2} C M^{-1/2}`; isometry ⇒ lossless; sends the session mean to `I` |
| 15 | Potato | z-score of **log**-distance, default threshold 3 |
| 16 | CSP relation | CSP = special case of tangent-space filtering under identity within-class scatter (Xu et al.); CSP's arithmetic class means swell |
| 17 | 2013 numbers | MDM 79.71±9.44 vs CSP+LDA 80.45±12.30 (binary, **no significant difference**); MDM 61.42±13.15 vs BSS+LR 58.26±18.80 (4-class, p = 0.074) |
| 18 | MOABB claim | Riemannian > DL, **but** DL was untuned and un-augmented; Riemannian best at ≤25 channels and degrades above |
| 19 | Competitions | 1st place ×6 (2014–2016), fields of 260–688 teams (except Biomag: 6); one of them is seizure prediction, not BCI |
| 20 | ERP covariance | plain trial covariance is insufficient; needs prototype-augmented "super-trial" `X̃ = [P ; X]` |

---

*Compiled 2026-07-24. Formulas cross-checked against Pennec (Ch. 3), Congedo–Barachant–Andreev (2013), the pyRiemann master source tree, and arXiv:2504.18882; invariance, swelling, and eigenvalue-form identities verified numerically.*
