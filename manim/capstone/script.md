# Capstone video — narration script + storyboard (deep cut)

**Working title:** *The Shape of a Thought*
**Length target:** ~11–13 min · **Tone:** 3Blue1Brown — every claim *derived*, not asserted.
**Engine:** ManimGL · **Voice:** AI TTS (real-sounding), timed per beat.

How to read this: every **beat** is one TTS clip + one Manim scene. The narration is
*exactly* what the voice says (math spelled out in words so it pastes straight into the
TTS tool). `[VISUAL]` is the storyboard. `[MATH ON SCREEN]` is what's typeset on screen.
Durations come from measuring each generated clip and stretching its scene to match.

### Running example (all numbers validated)
`A = diag(4, 1)`, `B = diag(1, 4)` — both SPD, both **det 4**.
- Euclidean mean ½(A+B) = `diag(2.5, 2.5)`, **det 6.25** → swells above the floor.
- Geometric floor (AM–GM): √(det A · det B) = **4**.
- Riemannian mean = geodesic midpoint = `diag(2, 2)`, **det 4** → sits *on* the floor.
- Generalized eigenvalues of pencil (B, A): **λ = 4 and ¼**.
- Geodesic distance δ(A,B) = √(ln²4 + ln²¼) = √2·ln4 ≈ **1.96**.

### The five formulas the video earns (not just shows)
1. **Covariance & PD:** Σ = (1/T)·XXᵀ, and vᵀΣv = (1/T)‖Xᵀv‖² ≥ 0.
2. **The metric (the cone's ruler):** ⟨U,V⟩_P = tr(P⁻¹ U P⁻¹ V). At P=I it's plain Frobenius.
3. **The geodesic:** γ(t) = A^½ (A^−½ B A^−½)^t A^½, with det γ(t) = det(A)^{1−t} det(B)^t.
4. **The distance:** δ(A,B) = ‖log(A^−½ B A^−½)‖_F = √(Σ ln²λᵢ).
5. **The mean:** argmin_P Σ δ²(P, Σᵢ), i.e. the P with Σ log(P^−½ Σᵢ P^−½) = 0.

---

## Act 0 — Cold open (~25s)

**Beat 0.1**
> Someone sits still, closes their eyes, and imagines squeezing their left hand. They don't move a muscle. And yet — a computer in the room writes the word "left."

`[VISUAL]` Dark frame. Silhouette, eyes closing. Cut to an electrode cap; four faint voltage traces wiggle in from the right. The word **left** types itself, monospace, bottom center.

**Beat 0.2**
> No magic. Just a few wiggling voltages, and a piece of geometry beautiful enough that I want to derive the whole thing with you — not hand-wave it. Let's build it from nothing.

`[VISUAL]` Traces pull forward and brighten. Title resolves: *The Shape of a Thought.* Hold, dissolve.

---

## Act 1 — The signal, and why raw voltage fails (~70s)

**Beat 1.1**
> An EEG is just this: a handful of electrodes on the scalp, each recording its own voltage over time. Here are four of them.

`[VISUAL]` Four labeled channels stacked (C3, Cz, C4, Pz), each a live scrolling line plot. Clean axes.

**Beat 1.2**
> The tempting first idea is to compare these numbers directly — record "left hand" twice, line the traces up, measure how far apart they are. It fails immediately.

`[VISUAL]` Two recordings of the *same* intent overlaid; clearly different in amplitude, drift, phase. A Euclidean distance bracket lights up red and large.

**Beat 1.3**
> The raw amplitude drifts — with the gel, the day, the person. Two recordings of the exact same thought can look numerically nothing alike. The voltage itself is the wrong thing to measure.

`[VISUAL]` A "gain / drift" slider nudges; both traces slide and rescale while the underlying *pattern* persists. Red bracket flickers, untrustworthy.

**Beat 1.4**
> The information isn't in how big each channel is. It's in how the channels move *together*. Imagine the left hand, and a specific set of regions co-activate — they rise and fall in concert. That pattern of co-movement is the fingerprint of the intent. So let's measure exactly that, and measure nothing else.

`[VISUAL]` Two channels highlighted rising together, two falling together; faint arcs pulse between co-moving pairs. Phrase **"how they move together"** sets.

---

## Act 2 — Covariance, and a proof that it's positive definite (~110s)

**Beat 2.1**
> Stack the channels into a matrix X — rows are channels, columns are time samples. Subtract each channel's mean so we're looking at fluctuations. Then form X times X-transpose, divided by the number of samples.

`[MATH ON SCREEN]` `Σ = (1/T) · X Xᵀ`  with X drawn as a C×T block.

**Beat 2.2**
> That's the covariance matrix. For C channels it's C by C. The diagonal is each channel's own power — its variance. Every off-diagonal entry is how strongly two channels co-vary. The whole spatial structure of the trial, in one small table.

`[VISUAL]` A 4×4 grid fills cell by cell: diagonal glows "power," off-diagonals a second color with signed co-movement.

**Beat 2.3**
> A multi-second, multi-channel recording — thousands of numbers — just collapsed into one matrix. From here on, a trial *is* a single object. The shape of the trial.

`[VISUAL]` Scrolling traces sweep up and pour into the grid; it shrinks to one tile **Σ**.

**Beat 2.4**
> Now, these matrices aren't arbitrary, and this is where it gets good. They're obviously symmetric. But they have a second property that decides everything — they're positive definite. Here's the one-line proof. Take any direction v, and look at v-transpose Sigma v.

`[MATH ON SCREEN]` `vᵀ Σ v  =  (1/T) vᵀ X Xᵀ v`

**Beat 2.5**
> Group the terms: that's one over T times the squared length of X-transpose v. A squared length. It can never be negative. And it's strictly positive unless some direction v makes X-transpose v exactly zero — which only happens if one channel is a perfect linear copy of the others. For real, independent electrodes, it never is.

`[MATH ON SCREEN]` `= (1/T) ‖Xᵀv‖²  ≥  0`, strict `> 0` unless rows of X are linearly dependent.

**Beat 2.6**
> So every covariance matrix is symmetric and positive definite — SPD. That's not a convention we chose. It's forced by what covariance *is*. Hold onto it, because it's about to give these matrices a geometry.

`[VISUAL]` Label **SPD** stamps on the Σ tile; the words "symmetric · positive definite" underline.

---

## Act 3 — These matrices live on a curved cone, with its own ruler (~120s)

**Beat 3.1**
> Each trial is now a point. But a point in what space? The space of all SPD matrices. Let's see its actual shape in the smallest case, two by two.

`[VISUAL]` Camera pulls back from the Σ tile to a single dot in an empty 3D volume.

**Beat 3.2**
> A symmetric two-by-two matrix has three free numbers — a, b on the off-diagonal, and c. Positive-definite pins down a region: a positive, c positive, and a-times-c minus b-squared positive. Plot every matrix obeying those three rules.

`[MATH ON SCREEN]` `[[a, b],[b, c]]`, constraints `a>0, c>0, ac−b²>0`. Axes (a,b,c).

**Beat 3.3**
> They fill the inside of a cone. Open, curved, with a hard boundary where a-c minus b-squared hits zero — there the determinant vanishes, a direction of the signal collapses, and the matrix becomes a degenerate, impossible covariance. That wall should feel infinitely far away. Keep that in mind.

`[VISUAL]` Admissible region renders as the interior of a cone (ManimGL surface). Boundary glows; a point drifts toward it; a `det → 0` readout falls.

**Beat 3.4**
> Here's the subtle part. On a curved space, distance isn't one fixed ruler — the ruler changes from point to point. At a matrix P, the natural way to measure a little step U is this inner product: trace of P-inverse, U, P-inverse, V.

`[MATH ON SCREEN]` `⟨U, V⟩_P = tr(P⁻¹ U P⁻¹ V)`

**Beat 3.5**
> Why that and not the plain dot product? Two reasons. At the identity matrix, P-inverse is the identity, and this collapses to the ordinary Frobenius inner product — the familiar flat ruler. But away from the identity, the P-inverse factors stretch the ruler: the closer you drift toward that collapsing wall, the more every step costs. The geometry itself pushes back as you approach the boundary.

`[VISUAL]` At P=I the metric "ticks" are uniform; as P slides toward the wall the metric ellipse stretches, steps near the boundary visibly cost more.

**Beat 3.6**
> And the length of any path through the cone is just that little ruler, integrated along the path. The shortest such path between two matrices is their geodesic. So the real question becomes: what's the shortest route, and how long is it? But first — let's see why the *naive* route is a disaster.

`[MATH ON SCREEN]` `L(γ) = ∫₀¹ √⟨γ'(t), γ'(t)⟩_{γ(t)} dt`. A wiggly path vs the geodesic.

---

## Act 4 — The swelling effect, as a theorem (~120s) ★ centerpiece

**Beat 4.1**
> Two trials. A is diag four, one. B is diag one, four — same matrix, axes swapped. Both have determinant four.

`[VISUAL]` Two ellipses: A wide-short, B tall-narrow, each tagged det = 4, sitting inside the cone.

**Beat 4.2**
> Average them the obvious way, entry by entry. You get diag two-point-five, two-point-five — and its determinant is six-point-two-five. Bigger than four. The average inflated. We manufactured variance that lived in neither trial.

`[VISUAL]` Straight chord A→B inside the cone; midpoint ellipse balloons into a fat circle; det counter 4 → **6.25** in red. Label **swelling**.

**Beat 4.3**
> And this isn't bad luck with these numbers — it's a theorem. The log-determinant is a concave function on the cone. Concavity says the log-det of an average is at least the average of the log-dets. Exponentiate, and you get this: the determinant of the Euclidean average is always at least the geometric mean of the two determinants — with equality only when the matrices are identical.

`[MATH ON SCREEN]` `det(½A + ½B) ≥ √(det A · det B)`, equality iff `A = B`. (Minkowski / concavity of log-det.)

**Beat 4.4**
> So entry-wise averaging can only inflate the determinant, never shrink it below that floor. Now travel the cone's own way instead — along the geodesic. There's a clean formula for it: whiten by A, raise to the power t, un-whiten.

`[MATH ON SCREEN]` `γ(t) = A^½ (A^−½ B A^−½)^t A^½`,  `γ(0)=A, γ(1)=B`.

**Beat 4.5**
> And watch what its determinant does. Along the geodesic, the determinant interpolates *geometrically* — det of A to the one-minus-t, times det of B to the t. The log-determinant is a straight line. At the midpoint that's exactly the square root of the product — it sits right on the floor. For our example, diag two, two: determinant four. No swelling. The geometry refuses to invent power.

`[MATH ON SCREEN]` `det γ(t) = det(A)^{1−t} · det(B)^{t}`; at t=½ → `√(det A·det B) = 4`. Geodesic midpoint `diag(2,2)`.

**Beat 4.6**
> Put the two side by side. The straight chord bulges up off the cone's surface and overshoots the determinant. The geodesic hugs the surface and lands on the honest floor. That gap — six-point-two-five versus four — is the swelling, and it's exactly what corrupts a classifier built on the wrong average.

`[VISUAL]` Split screen: red chord bowing out (det 6.25) vs cyan geodesic on the surface (det 4). The vertical gap between them is bracketed and labeled "swelling."

---

## Act 5 — The right ruler, and two theorems that make it work (~130s)

**Beat 5.1**
> We have the geodesic; now measure its length with that point-to-point ruler. Integrate, and everything collapses to something shockingly clean. The distance between A and B is the Frobenius norm of the logarithm of A-minus-half, B, A-minus-half.

`[MATH ON SCREEN]` `δ(A,B) = ‖ log(A^−½ B A^−½) ‖_F`

**Beat 5.2**
> Read it left to right. The A-minus-half factors whiten by A — they slide A itself to the identity, so you're always measuring *from* A, looking at how B sits relative to it. The eigenvalues of what's left are the generalized eigenvalues of the pair. Take their logs, and the distance is just the square root of the sum of squared log-eigenvalues.

`[MATH ON SCREEN]` `δ(A,B) = √(Σᵢ ln²λᵢ)`,  λ solves `det(B − λA) = 0`. For our A,B: `λ = 4, ¼` → `δ = √2·ln4 ≈ 1.96`.

**Beat 5.3**
> Now the logarithm earns its place. Remember the collapsing wall, where an eigenvalue runs to zero? Its logarithm runs to minus infinity, so the distance blows up without bound. The boundary really is infinitely far — the ruler builds that in for free. A straight Euclidean ruler never could.

`[VISUAL]` Eigenvalue slider → 0; `log λ` plunges to −∞; δ shoots up. Callback to Act 3's "infinitely far wall."

**Beat 5.4**
> And here's the property that makes this work on real brains — affine invariance. Transform both matrices by any invertible W, sandwich-style: W, A, W-transpose and W, B, W-transpose. The distance doesn't change. The proof is one line: the generalized eigenvalues are the roots of det of B minus lambda A. Factor a W out of each side, and the determinant of W cancels — same equation, same eigenvalues, same distance.

`[MATH ON SCREEN]` `det(WBWᵀ − λ·WAWᵀ) = det(W)·det(B − λA)·det(Wᵀ) = 0` → same λ. So `δ(WAWᵀ, WBWᵀ) = δ(A,B)`.

**Beat 5.5**
> Think about what a W is, physically. Re-referencing the electrodes, rescaling them, the skull linearly mixing sources by volume conduction — all of these are exactly such a transform. The affine-invariant distance is *blind* to every one of them. The nuisances that made raw voltage hopeless at the very start are precisely what this geometry normalizes away, automatically.

`[VISUAL]` Both points hit by a dramatic W; the whole cone warps and shears — but the geodesic-length label between the two points stays pinned at **1.96**.

---

## Act 6 — Decoding: the mean done right, and the classifier (~110s)

**Beat 6.1**
> One piece left — averaging many trials, properly. The right notion of mean isn't entry-wise. It's the point that minimizes the total squared geodesic distance to all the trials. Literally a variance, minimized on the curved space. That's the Riemannian, or Fréchet, mean.

`[MATH ON SCREEN]` `M = argmin_P  Σᵢ δ²(P, Σᵢ)`

**Beat 6.2**
> Because the cone has nonpositive curvature, that minimizer exists and is unique, and it's pinned by a beautifully simple condition: map every trial into the flat tangent space at M, and the arrows have to sum to zero. M is the point with no leftover pull in any direction. And its determinant is the geometric mean of the trials' determinants — so by construction, no swelling.

`[MATH ON SCREEN]` `Σᵢ log(M^−½ Σᵢ M^−½) = 0`. Three point-clouds each collapse to one centroid via this condition.

**Beat 6.3**
> Now decoding is almost embarrassingly simple. For each command — left, right, rest — compute that mean over its training trials. One prototype per class. A new trial arrives; measure its geodesic distance to each prototype; assign it to the nearest. Minimum distance to mean. No deep network. The space did the hard work.

`[VISUAL]` Three centroids (red/blue/grey) in the cone; a new black point appears; three geodesic arcs measure out; the shortest glows; the point recolors; **left** types out — callback to Act 0.

**Beat 6.4**
> And if you want the entire toolbox of ordinary machine learning, you can have it. Whiten everything by the global mean and take the logarithm — the log map sends each matrix to a vector in the flat tangent space. The catch that usually breaks this is gone: at the mean, that curved ruler reduces exactly to the plain Frobenius one. So a *linear* classifier in tangent space — LDA, an SVM, logistic regression — is doing honest Riemannian geometry, not an approximation.

`[MATH ON SCREEN]` `s_i = Log_M(Σᵢ) = M^½ log(M^−½ Σᵢ M^−½) M^½`. Local patch of cone flattens to a plane; points become arrows; ML labels slide in.

---

## Act 7 — Close (~35s)

**Beat 7.1**
> Step back and see the whole path. A signal became a covariance — a shape. The shapes live on a curved cone with its own ruler. That ruler is blind to the noise that fooled us, and it makes the boundary infinitely far. The honest mean on that ruler doesn't swell. And nearest-prototype reads the thought.

`[VISUAL]` Rapid recap, five tiles light in turn: traces → Σ → cone+metric → geodesic → classified point.

**Beat 7.2**
> None of this needed a bigger model. It worked because we found the right geometry — and then let it do the work. The code that runs all of this end to end, on real recordings, is one click away. Go open it, and watch the math become a working decoder.

`[VISUAL]` Tiles settle into the lesson's palette. End card → the Colab notebook: **"Open the notebook → do it yourself."** Hold, fade.

---

## Production notes

- **Per-beat sync.** One audio clip per beat → `ffprobe` duration `dᵢ` → build that beat's
  scene to last exactly `dᵢ` → `ffmpeg concat` clips, overlay concatenated narration.
  Sync is automatic; no manual timestamping.
- **Scenes.** One ManimGL `Scene`/section per act, reusing `manim/theme.py`. 3D acts (3–6)
  use `frame.reorient` orbits; on-screen math via `Tex`, captions `set_backstroke` for
  legibility over the cone.
- **TTS.** Pre-segmented, math spelled in words ("A to the minus one-half"), so each beat
  pastes straight into the voice tool (ElevenLabs-tier).
- **Math validated.** PD via ‖Xᵀv‖²; swelling via concavity of log-det (det 4→6.25 vs floor 4);
  geodesic det(A)^{1−t}det(B)^t; δ=√2·ln4≈1.96; affine-invariance via det(B−λA); Fréchet
  mean as Σ log(M^−½ΣᵢM^−½)=0. All mutually consistent and consistent with the page's cone figure.
