# Improvement plan — Curved Spaces, Brain Signals

The shared project checklist for the interactive Riemannian-geometry → EEG/BCI
lesson (a Lit + Vite + TypeScript site, two Manim engines, and an MNE/pyRiemann
notebook). This file is the single source of truth for what is done and what
remains. Keep it accurate — several contributors (including LLMs, across both
Claude Code and Codex) work from it.

**Mission:** the site explains BCI/EEG concepts to newcomers, then hands them a
guided Jupyter notebook as a runnable implementation example. Every section should
serve that arc: concept → intuition → visual → implementation.

> **This page is one component of a larger, general Wix website.** The local
> [index.html](index.html) is a development preview of the Wix narrative; the
> deployable units are the custom-element widgets in [src/widgets/](src/widgets/),
> loaded into a Wix page that owns the surrounding prose and navigation. Anything
> new that must appear on the live site has to be built as a registerable custom
> element, not just added to `index.html` (see Conventions).

## How to use this file

**Status legend**

- `[x]` — done **and** validated. The note points to where it lives / the evidence.
- `[~]` — built, but **must be verified** before it is trusted (a check is named).
- `[ ]` — genuinely not started.

**Working rule:** finish a task → validate it → mark it here → *then* continue.
Never present a code-presence guess as `[x]`; downgrade to `[~]` with a named
check. When you finish a `[~]`, promote it to `[x]` and record the evidence.

**Section groups:** §1–§6 + §4a are the *done baseline* (validated 2026-06-25).
§7–§14 are the *active lesson backlog*. §15 is the local/full validation gate.
§16 publishes the validated page as a temporary public GitHub Pages review site
before the Wix upload.

## Active coordination

- **Codex — §15 automated gate complete (2026-06-26 02:25 Asia/Jerusalem):**
  all executable local checks passed. Actual VoiceOver, hosted Colab, and the
  maintainer's public-GitHub approval/identity remain external gates.
- **Codex — §16 GitHub Pages publishing in progress
  (2026-06-26 10:45 Asia/Jerusalem):** `gh` is authenticated as
  `Itamar-Avitan`; local Git was initialized on `main`; public repo
  `Itamar-Avitan/curved-spaces-brain-signals` was created; candidate commit list
  excludes `node_modules/`, `dist*/`, raw `data/`, render cache `media/`, and
  source PDFs. Next gates: local validation, first push, Actions deployment, and
  public URL validation.
- **Claude — pasted the maintainer Colab URL into the `#notebook` CTA
  (2026-06-26 10:34 Asia/Jerusalem):** at the maintainer's request I edited Codex's
  `notebook-actions` block — set the real Colab href, removed `is-placeholder` /
  `aria-disabled` / `tabindex` / the data marker / the TODO comment, added
  `target=_blank rel=noopener`, and updated the sub-label. CTA verified active +
  keyboard-focusable; link returns HTTP 200; `npm run build` green. The unused
  `.notebook-colab.is-placeholder` CSS is left in place (harmless). Remaining §11
  gate = the maintainer actually running it top-to-bottom in a fresh Colab runtime.
  `gh` is now authenticated as `Itamar-Avitan` (ssh, `repo` scope) → §16 publishing
  is unblocked, but I have NOT pushed/deployed (public release needs explicit
  maintainer go-ahead + §16a content-safety gate). §8/§10/§12 remain done+validated.

## Status at a glance

| §   | Topic                                     | State                               |
| --- | ----------------------------------------- | ----------------------------------- |
| 1   | Educational route & framing               | ✅ done (uniform cue → §10)          |
| 2   | Distance lesson ("two ways")               | ✅ done                              |
| 3   | Mean lesson ("average of several")         | ✅ done                              |
| 4   | Visual design / navigation / a11y          | ✅ baseline (progress bar → §10)     |
| 4a  | ManimGL engine discipline                  | ✅ done                              |
| 5   | Expand & validate content                  | ✅ done                              |
| 6   | Notebook & reproducibility (in rnd_env)    | ✅ done                              |
| 7   | Educational introduction upgrade           | ✅ done                              |
| 8   | Tangent-space lesson buildout              | ✅ done                              |
| 9   | Signal→covariance interactive visual       | ✅ done                              |
| 10  | Cross-section consistency + progress       | ✅ done                              |
| 11  | Guided notebook hand-off (Colab + EEGDash) | 🟨 hosted Colab check pending        |
| 12  | Full revision pass (flow/correctness/style) | ✅ done (re-confirm in §15)          |
| 13  | Newcomer next steps / onboarding hand-off  | ✅ done                              |
| 14  | Quality & accessibility hardening          | 🟨 VoiceOver pass pending            |
| 15  | Final validation                           | 🟨 2 external checks pending         |
| 16  | Free GitHub Pages review deployment        | 🟨 publishing in progress            |

## Project map

- [index.html](index.html) — all prose, headings, sections, references (the page
  structure / Wix narrative preview). Lessons are framed here; widgets embed as tags.
- [src/widgets/](src/widgets/) — eight Lit elements, registered by import in
  [src/main.ts](src/main.ts): `covariance-explorer`, `signal-covariance`,
  `distance-explorer`, `mean-explorer`, `tangent-explorer`, `mdm-playground`,
  `concept-check`, `next-steps`. **These
  are the units deployed to Wix.**
- [src/math/](src/math/) — `covariance.ts` (`syntheticSignals`,
  `covarianceFromParameters`) and `geometry.ts` (`interpolateEntries`,
  `interpolateGeometry`, `arithmeticMean`, `geometricMean`, `riemannianDistance`,
  log/exp maps). **Reuse these; do not reinvent the math.** Tests sit beside them.
- `manim/manimgl_lessons.py` — ManimGL 1.7.2 (3b1b/manim) live lessons.
  `manim/scenes.py` — ManimCommunity narrative scenes. `manim/theme.py` — palette.
- `notebooks/` — `01_riemannian_eeg_motor_imagery.ipynb`, `build_notebook.py`
  (notebook is generated from this), `riemannian_eeg_utils.py`,
  `publish_notebook.sh` (rebuild → execute → refresh artifacts).
- `public/media/` — rendered videos + posters. `public/downloads/` — published notebook.
- `dist/riemannian-eeg-widgets.js` — built ES module loaded by the Wix page.
- Planned §16: `dist-pages/` — separate full-page review build for GitHub Pages;
  it must not replace or change the Wix library output in `dist/`.

## Conventions

- **Python always runs in the `rnd_env` conda environment**, installs included:
  `conda run -n rnd_env <cmd>` (or activate it first). *Exception:* the Colab
  notebook variant (§11) must use `pip install` cells, since Colab has no `rnd_env`.
- **Two Manim engines, kept separate (not interchangeable):**
  - **ManimGL** (3b1b/manim, `manim/manimgl_lessons.py`) for live `ValueTracker` /
    `always_redraw` lessons (distance, mean, and the planned tangent lesson).
  - **ManimCommunity** (`manim/scenes.py`) for narrative/hook scenes.
  - Render low-resolution review frames and inspect them before a final 1080p render.
- **Web:** `npm run build` (`tsc --noEmit` + `vite build`), `npm test` (Vitest),
  `npm run dev` for local preview.
- **Wix deployment:** new on-site visuals must be authored as Lit custom elements
  registered in [src/main.ts](src/main.ts) and shipped via `dist/`. Editing only
  `index.html` updates the preview but not the live Wix page.
- **GitHub Pages review deployment:** preserve the Wix `npm run build` output.
  Build the review page separately with the repository base path and publish only
  that application artifact through GitHub Actions (§16).
- **Honesty:** results are single-participant demonstrations — never presented as
  general performance guarantees.

## Tooling & installed skills

Agent Skills (SKILL.md format) are installed at `~/.claude/skills/` (**global** —
available in every project, for Claude Code) and mirrored to `~/.codex/skills/`
(for Codex). They activate at the **start of a new session**, so restart the agent
after install. To scope a skill to this project only, move its folder to
`<project>/.claude/skills/` instead.

| Skill | Source | Supports |
| --- | --- | --- |
| `manimgl-best-practices` | adithya-s-k (945★, MIT) | §8 ManimGL scenes (`manimgl_lessons.py`) |
| `manimce-best-practices` | adithya-s-k (945★, MIT) | ManimCommunity scenes (`scenes.py`) |
| `manim-composer` | adithya-s-k (945★, MIT) | planning new educational scenes (§8) |
| `frontend-design` | Anthropic (official) | §7/§9/§10/§12/§13 UI, design & copy |
| `webapp-testing` | Anthropic (official) | §14/§15 browser + cross-browser validation (Playwright) |
| `wix-design-system` | Wix (first-party) | broader Wix/WDS work — note: assumes a React `@wix/design-system` project, not the Lit embed |

**Gaps (deliberately not installed):** no standalone Jupyter/data-science or
data-viz skill met the "really used and good" bar (top hits were 0-star or
marketplace-only). For §9/§11 rely on `frontend-design` + Claude's native
pandas/numpy/scikit-learn/MNE/D3 capability. Revisit if a reputable one appears.

## Definition of done

- A beginner can explain why covariance matrices appear in EEG BCI before any
  formal geometric term is introduced.
- Every mathematical operation is connected to a specific decoder action.
- Interactive and animated visuals explain a change over time or a comparison;
  they are not decorative, and they respect reduced-motion preferences.
- Claims distinguish demonstrated results from general possibilities.
- The page works on desktop and mobile, across Chromium/Firefox/Safari, with
  keyboard- and touch-accessible controls, readable labels, valid downloads, and
  no browser-console errors.
- The notebook executes from beginning to end in `rnd_env`, and the Colab variant
  runs top-to-bottom on a fresh Colab runtime.
- A reviewer can open the temporary GitHub Pages URL, use every lesson and download,
  and identify the exact reviewed commit without affecting the Wix widget bundle.

---

## 1. Clarify the educational route

- [x] Learning map near the beginning — chapter map ([index.html:69-78](index.html#L69))
  and the "Six questions. One complete BCI decoder." route ([index.html:80-114](index.html#L80)).
- [x] Plain definitions before jargon — EEG trial, BCI decoder, class prototype
  ([index.html:115-128](index.html#L115)); covariance + SPD in plain language
  ([index.html:320-333](index.html#L320)).
- [x] General-relativity hook framed as an analogy about choosing a distance rule —
  "BCI lens" ([index.html:250-258](index.html#L250)) and "Where the analogy stops"
  ([index.html:259-267](index.html#L259)).
- [x] Section-level "Question answered / why the BCI needs this" cue **pattern
  established** on the distance and mean lessons ([index.html:492](index.html#L492),
  [558](index.html#L558)). Extending the cue to the remaining sections is §10.
- [x] Copy reviewed for undefined terms, broad claims, and avoidable jargon
  (2026-06-25 validation pass). Re-checked in §12 after new content lands.

## 2. Rebuild "two ways to travel" (distance)

- [x] Reframed around "What should *halfway* between two EEG patterns look like?"
  ([index.html:478-502](index.html#L478)).
- [x] Pattern A / B explained in EEG terms; equal total variation stated before
  routes are compared (`src/widgets/distance-explorer.ts`).
- [x] Guided start/halfway/end states + automatic replay ("Replay the journey").
- [x] Endpoints visually retained while the intermediate pattern changes.
- [x] "Matrix volume indicator" replaced by a defined **relative-area** comparison.
- [x] Swelling effect explained without implying the arithmetic mean is invalid
  (`distance-explorer.ts:753-762`).
- [x] Focused ManimGL animation linking interpolation to a decoder (`covariance-path.mp4`).
- [x] Comprehension checkpoint (`distance-explorer.ts:753-762`).

## 3. Rebuild "average of several EEG patterns" (mean)

- [x] Opens with the decoder's task: compress trials into one prototype
  ([index.html:539-568](index.html#L539)).
- [x] Distinguishes averaging raw waveforms from averaging covariance patterns
  ([index.html:550-558](index.html#L550)).
- [x] Full chain trials → candidate center → total distance → prototype, with
  comparable arithmetic vs. Riemannian objective values (`src/widgets/mean-explorer.ts`).
- [x] Test-trial preview showing later MDM use (`mean-explorer.ts:700`).
- [x] Guided animation / replay ("Replay construction") and clearer labels.
- [x] Focused ManimGL animation for class-center construction (`riemannian-mean.mp4`).
- [x] Comprehension checkpoint (`mean-explorer.ts:696-704`).

## 4. Improve visual design and navigation

- [x] Captions/transcripts for all four videos — "Read the animation instead"
  ([index.html:177](index.html#L177), 524, 589, 671).
- [x] Reduced-motion respected — global ([src/styles.css:2462](src/styles.css#L2462))
  + per-widget guards (distance, mean explorers).
- [x] Page-level focus styles — skip link, chapter map, transcript summaries
  ([src/styles.css:55](src/styles.css#L55), 376-381, 597).
- [x] Heading rhythm, callout spacing, comparison hierarchy, contrast, alt text,
  semantic headings, horizontal overflow (2026-06-25 validation pass: 1280 px and
  390 px, no overflow).
- [ ] Persistent visual chapter/progress system without obstructing mobile —
  **moved to §10** (a genuine enhancement beyond the baseline).

## 4a. Use 3Blue1Brown ManimGL intentionally

- [x] `manimgl==1.7.2` installed from `3b1b/manim` in `rnd_env`.
- [x] Dedicated `manim/manimgl_lessons.py`, separate from ManimCommunity `scenes.py`.
- [x] Live `ValueTracker` interpolation + `always_redraw` geometry in the distance lesson.
- [x] Live-updating squared-distance objective in the mean lesson.
- [x] Mathematical notation introduced only after the visual operation is established.
- [x] Low-resolution review frames inspected before final output.
- [x] Final 1080p videos rendered and website poster frames created.

## 5. Expand and validate educational content

- [x] Compact glossary linking plain ideas to formal terms ([index.html:766-797](index.html#L766)).
- [x] "What geometry does not solve" content ([index.html:727-764](index.html#L727)).
- [x] Honest comparison guide: MDM, tangent-space, CSP ([index.html:687-725](index.html#L687)).
- [x] Each website concept connected to a notebook step ([index.html:908-929](index.html#L908)).
- [x] Math/BCI claims validated against the collected literature and MNE/pyRiemann
  docs (2026-06-25 pass).
- [x] External references checked; core papers relinked to open HAL records
  ([index.html:956-1024](index.html#L956)).

## 6. Strengthen the notebook and reproducibility

- [x] Toy two-channel section mirroring the distance and mean lessons (Section 0,
  with determinant/swelling assertions).
- [x] Assertions for covariance positivity, disjoint grouped splits, and shapes.
- [x] One-participant scope made prominent before performance is reported
  ([index.html:862-866](index.html#L862)).
- [x] Clearly labeled optional multi-participant extension.
- [x] Artifact rebuild/publish automated — `notebooks/build_notebook.py` +
  `notebooks/publish_notebook.sh`.
- [ ] Evaluate **EEGDash** as an additional/alternative dataset source — see §11.

---

## 7. Educational introduction upgrade *(new)*

**Why:** a learner should immediately know what they will gain, what it costs, and
that they are qualified to start. Pure copy/HTML in the learning-route block
([index.html:80-129](index.html#L80)). *Skill:* `frontend-design` for layout/copy.

- [x] "By the end you'll be able to…" outcomes block — four concrete capabilities
  (e.g. *explain why EEG trials become covariance matrices*; *say why a Riemannian
  mean beats an entry-wise average for a class prototype*; *describe how MDM predicts*)
  in the `route-brief` outcomes panel ([index.html](index.html)).
- [x] Estimated time-to-complete + light prerequisites (comfort with vectors and
  matrices; **no prior Riemannian geometry needed**) in the adjacent route facts.
- [x] One-line "who this is for" aimed at BCI/EEG newcomers.
- **Done when:** the intro states outcomes, time, prerequisites, and audience above
  the fold, and reads as a deliberate design choice (not a templated banner).

Validated 2026-06-26: responsive `route-brief` field-guide layout added to
`index.html` / `src/styles.css`; `npm run build` passed.

## 8. Tangent-space lesson buildout *(new)*

**Why:** bring the tangent-space section ([index.html:613-629](index.html#L613)) —
currently intro copy + the `rg-tangent-explorer` widget — to parity with the
distance and mean lessons. *Skills:* `manim-composer` to plan the scene, then
`manimgl-best-practices` to implement it.

- [x] ManimGL scene `TangentProjectionGL` in `manim/manimgl_lessons.py`: a ring of
  six SPD covariance matrices at a fixed geodesic distance from a reference is
  log-mapped to a flat tangent plane; a live `ValueTracker` shrinks/grows the
  neighborhood while a `DecimalNumber` reports the geodesic-vs-flat **shape
  distortion %** (→0 as the neighborhood shrinks — the honest sense of "looks
  flat"; SPD is non-positively curved so geodesics ≥ chords). Standalone numpy
  check confirmed radial isometry exact + distortion monotone (0.02%→5.47%). Low-res
  frames inspected (giant-`%` unit bug found+fixed), then HD 1920×1080. Rendered to
  `public/media/tangent-space.mp4` (+ `tangent-space-poster.jpg`).
- [x] "Question answered" `.lesson-purpose` cue + term-ladder (plain idea: flatten
  the neighborhood → "tangent space, reached by the log map") added to the `#tangent`
  block, matching the sibling lessons; dark-section CSS overrides added.
- [x] Comprehension checkpoint added **inside** `rg-tangent-explorer`
  (`.check` `<details>`), same in-lesson pattern as distance/mean — ships to Wix via
  `dist/`. Verified expandable + focus-styled in Playwright.
- [x] Navigation: kept the six numbered chapters intact ("six questions" framing
  preserved); added a slim non-numbered **bridge** link to `#tangent` between 04 and
  05 in the sticky chapter map (`grid` template + `.chapter-bridge` CSS, mobile
  template updated). Renders correctly desktop + mobile.
- **Done when:** the tangent section has a video (with transcript), a question cue,
  a term-ladder, and a comprehension check — indistinguishable in completeness from
  the distance/mean lessons.

Validated 2026-06-26: HD scene rendered in `rnd_env`; `npm run build` + `npm test`
(11 tests) green; Playwright desktop+mobile shots of chapter-map bridge, full tangent
section, and the opened comprehension check — no console errors.

## 9. Signal→covariance interactive visualization *(new)*

**Why:** the EEG pipeline ([index.html:335-374](index.html#L335)) is static CSS.
Let learners watch the first conceptual jump — raw multichannel signal *becoming*
one covariance matrix. *Skills:* `frontend-design` (visual direction), `webapp-testing`
(verify behavior).

- [x] New Lit widget (`rg-signal-covariance`) registered in
  [src/main.ts](src/main.ts), **reusing** `syntheticSignals` and
  `covarianceFromParameters` from [src/math/covariance.ts](src/math/covariance.ts).
  It ships in the production `dist/` bundle and renders from that bundle directly.
- [x] Animate multichannel traces collapsing into a covariance matrix / ellipse.
  Keep it **distinct** from `rg-covariance-explorer` (parameters→ellipse); this one
  is time-series→matrix construction with play and sample-prefix scrubbing.
- [x] Respect reduced-motion and provide a static fallback with a short text equivalent.
- [x] Add a Vitest unit test for the widget's covariance computation path
  (`src/widgets/signal-covariance-model.test.ts`).
- **Done when:** a learner can scrub/play the construction, it has a static fallback,
  it passes `npm test`, and it renders inside the Wix embed.

Validated 2026-06-26: `npm test` passed 11 tests; `npm run build` passed;
Playwright verified playback (45→54 samples), full scrub (160/160),
reduced-motion static mode, 390 px touch layout without overflow, zero page
errors, and direct rendering from `dist/riemannian-eeg-widgets.js`.

## 10. Cross-section consistency & progress indicator *(new)*

Absorbs the uniform-cue item from §1 and the progress item from §4. *Skill:*
`frontend-design`.

- [x] Applied the "Question answered / why the BCI needs this" cue uniformly:
  `.lesson-purpose` added to `#explore`, `#classifier`, and the method guide
  (`#tangent` got its cue in §8). All six lesson sections — explore, distance, mean,
  tangent, classifier, method guide — now carry the same pattern. Fixed a
  negative-margin overlap on the method guide (`.method-purpose { margin-top: 36px }`).
- [x] Persistent indicator: the sticky chapter map now has (a) an active-chapter
  highlight via a framework-free IntersectionObserver scroll-spy in new
  `src/chapter-progress.ts` (sets `is-active` + `aria-current`; exactly one active —
  verified `#mean` active at the mean section) and (b) a thin cyan→violet
  scroll-progress bar (`.chapter-progress`) tracking scroll fraction (verified 0.54
  at mid-page). Links stay native keyboard-focusable; mobile keeps the horizontal
  scroll; `prefers-reduced-motion` disables the bar transition (verified 0s). On Wix
  the same markup activates the bundled script.
- **Done when:** every lesson section carries the same cue pattern, and the reader
  always sees where they are in the six-chapter arc.

Validated 2026-06-26: `npm run build` + `npm test` (11) green; Playwright confirmed
scroll-spy (one active link), progress fraction, reduced-motion 0s, and no console
errors; desktop screenshots of all three new cues + the active-highlight bar.

## 11. Guided implementation hand-off — notebook + Colab placeholder *(new)*

**Why (mission):** the site explains the concepts, then hands newcomers a **guided
Jupyter notebook** as the implementation example. The maintainer hosts that notebook
on Google Colab and supplies the link; the page's job is to give it an obvious home.
*Skills:* native data-science capability (no reputable data-science skill met the
bar) + `frontend-design` for the page entry point.

- [x] **Page placeholder (priority).** Added a clear, well-marked "Run the guided
  notebook" call-to-action in the implementation/notebook area next to the existing
  download link ([index.html:812-819](index.html#L812)). The Colab URL is provided by
  the maintainer — leave an unmistakable `TODO: paste Colab URL` marker so there is
  zero ambiguity about where it goes. Keep the offline download as the secondary option.
- [x] Revised the notebook ([notebooks/01_riemannian_eeg_motor_imagery.ipynb](notebooks/01_riemannian_eeg_motor_imagery.ipynb))
  to read as a *guided* example for newcomers: explicit purpose per cell, a takeaway
  sentence per figure, tightened section intros. Edit via the generator
  [notebooks/build_notebook.py](notebooks/build_notebook.py), then rebuild. The
  generated notebook has purpose comments in all 17 code cells and takeaways for
  all 11 figures.
- [~] Made it **Colab-runnable**: a guarded `pip install` cell (mne, pyriemann,
  scikit-learn, …) instead of `rnd_env`, since Colab has no conda env; confirm the
  dataset download works on a clean Colab runtime. The downloadable `rnd_env` notebook
  stays the canonical reproducible version. The self-contained generated variant is
  `notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb`; it embeds the helper module.
  Isolated local execution from an empty directory passed all 19 code cells and
  downloaded three EDF files. **Pending check:** upload/run in an actual fresh Colab
  runtime after the maintainer supplies the URL.
- [x] **Evaluated EEGDash** ([eegdash.org](https://eegdash.org), `pip install eegdash`,
  Python 3.10+) as a data source: it mirrors 700+ BIDS-first EEG/MEG datasets and
  integrates with MNE-Python and braindecode, so `EEGDash().find(...)` could load a
  motor-imagery dataset in place of (or alongside) the current PhysioNet/MNE loader.
  It is pip-installable (Colab-friendly) and co-supported by UCSD and **Ben-Gurion
  University**. Decide adopt vs. complement vs. skip, and record the reason + a working
  snippet here.

  **Decision: complement.** EEGDash 0.8.3 successfully queried and loaded the same
  OpenNeuro motor-imagery source (`ds004362`, subject `001`, run `6`: 64 channels,
  160 Hz, 20,000 samples). Keep MNE's direct EEGBCI loader as the default because
  it is a much smaller dependency path for newcomers; use EEGDash for BIDS-first
  discovery and expansion to other datasets. Installation required matching
  `torchaudio==2.9.1` to the existing `torch==2.9.1`.

  ```python
  from eegdash import EEGDash, EEGDashDataset

  records = EEGDash().find(
      dataset="ds004362", subject="001", run="6", limit=1
  )
  dataset = EEGDashDataset(cache_dir="./data/eegdash", records=records)
  raw = dataset.datasets[0].raw
  ```
- **Done when:** the page has an obvious, correctly-placed home for the Colab link
  (URL pending from the maintainer), the notebook runs top-to-bottom on a fresh Colab
  runtime, and the EEGDash evaluation is recorded.

Validation 2026-06-26: canonical notebook executed 17/17 code cells with zero
errors and published artifact hashes match; isolated Colab variant executed
19/19 code cells with zero errors and a fresh data download; `npm run build`
passed. Actual hosted Colab verification remains pending.

## 12. Full revision pass — flow, correctness, style *(new)*

**Why:** after §7–§11 land, the whole experience needs one coherent editorial pass so
nothing reads thinner, wronger, or less consistent than its neighbors. Project-wide
review, not a single edit. *Skills:* `frontend-design` (copy + design consistency),
`webapp-testing` (confirm nothing regressed).

- [x] **Flow** — read all ~1180 lines end-to-end. Arc is coherent: hero → history →
  relativity → bridge → SPD reveal → why-in-a-BCI → benefits → covariance widget →
  distance → mean → tangent (bridge) → MDM classifier → method guide → limits →
  glossary → notebook → next steps → references. The tangent bridge sits naturally
  between "build a center" and "make a prediction" as the ML alternative. No dead-ends.
- [x] **Correctness** — re-verified: SPD/covariance plain-language, geodesic, Riemannian
  mean (argmin total squared distance), MDM, tangent space/log map ("looks flat nearby"
  — and the new §8 scene is mathematically honest: SPD is non-positively curved so
  geodesics ≥ chords), swelling/determinant, single-participant caveat all present and
  correct. Method-guide "Watch for" notes agree with the lessons.
- [x] **Style** — headings all sentence-case (acronyms/proper nouns aside; checked by
  extracting every `<h2>/<h3>`); active voice; terminology consistent. Fixed the one
  real contradiction: classifier transcript said "hand-imagery / foot-imagery" while the
  rendered `mdm-classifier.mp4` (scenes.py) and `rg-mdm-playground` both use
  **left-hand / right-hand** → transcript corrected to match. (Mean lesson consistently
  uses "feet" across widget + ManimGL scene — left intact.)
- [x] **Expansion** — no thin sections: explore, distance, mean, tangent, classifier,
  and the method guide each have a plain-language lead, a visual, and a "why the BCI
  needs this" cue (the last three completed in §8/§10).
- [x] **Consistency** — six numbered chapters + the tangent bridge are consistent in the
  map and the "six questions" route; Q3=distance / Q4=mean eyebrows match the map;
  concept-to-code cross-refs (tangent→feature pipeline, MDM→held-out validation) agree.
- [x] Fresh-reader test — the signal → covariance → distance → center → prediction →
  validation chain is traceable top-to-bottom with each term defined before use.
- **Done when:** the page reads as one coherent, correct, consistent piece; no section
  is an outlier in depth or polish; all links and claims re-checked.

Validated 2026-06-26: full read-through; all 9 external reference URLs re-checked live
(HTTP 200); `npm run build` + `npm test` (11) green. **Re-confirm in §15** once Codex's
in-flight §14 (a11y/styles) and §11 (Colab) land, since those may shift copy.

## 13. Newcomer next steps / onboarding hand-off *(new)*

**Why (mission):** after the concepts and the guided notebook, give newcomers a curated
path to start their own BCI/EEG work — the site's reason for existing. Page content
(and Wix). *Skill:* `frontend-design`.

- [x] "Where to go next" block after the implementation/notebook area: run and extend
  the guided notebook (§11), then branch out.
- [x] **Datasets to explore** — EEGDash (700+ BIDS datasets; MNE/braindecode; BGU-
  supported), MOABB, PhysioNet EEGMMI — one line each on what they offer.
- [x] **Core tools** — MNE-Python, pyRiemann, braindecode — one line each on their role.
- [x] **Further learning / community** — link the existing reading library/references
  plus 1–2 vetted entry points; keep it honest and non-promotional.
- **Done when:** a motivated newcomer has a clear, working-link path from "I understand
  the concepts" to "I can start my own project."

Validated 2026-06-26: deployable `rg-next-steps` element added and registered;
all eight external resource URLs returned HTTP 200; `npm run build` and all 11
tests passed; Playwright verified 390 px layout without overflow, zero page
errors, 10 working anchors, and direct registration/rendering from `dist/`.

## 14. Quality & accessibility hardening *(new)*

**Why:** the page is public and embedded in a live Wix site; it must work beyond
Chromium and meet a real accessibility bar. *Skills:* `webapp-testing` (Playwright
cross-browser automation), `frontend-design` for fixes.

- [x] **Cross-browser** — verified the page + all eight widgets render and behave in Chromium,
  Firefox, and Safari (incl. mobile Safari/Chrome); fix Lit/D3/CSS differences.
- [x] **Mobile-touch** — range sliders and interactive controls respond to touch/pointer
  events (not just mouse); tap targets ≥ 44 px; test on a real or emulated touch device.
- [x] **Performance / media** — all five offscreen videos use `preload="none"`,
  offscreen images use native lazy loading, poster sizes are 40–128 KB, and the
  production widget bundle is 118 KB / 27.26 KB gzip. Recorded production-app
  Lighthouse performance score: **88** (FCP 1.4 s, LCP 3.7 s, TBT 0 ms,
  CLS 0.067).
- [~] **Formal accessibility audit** — axe WCAG A/AA reports **0 violations**
  (33 passing rules; 3 checks require manual review), Lighthouse accessibility
  is **100**, contrast failures were reduced from 72 nodes to zero, and all
  audited controls meet the 44 px target. **Pending check:** a real VoiceOver
  pass over the lessons.
- **Done when:** widgets work on Chromium/Firefox/Safari + touch; Lighthouse performance
  and accessibility scores are recorded with no critical issues.

Validation 2026-06-26: desktop Chromium/Firefox/WebKit and emulated Pixel 7 /
iPhone 13 passed with all eight shadow roots, interactions, zero overflow, zero
page errors, and no application console errors. Touch changed the signal scrubber
from 45/160 to 134/160 (Chrome) and 136/160 (Safari). Automated accessibility
and performance evidence is recorded above; VoiceOver remains manual.

---

## 15. Final validation

Re-run after §7–§14 land; the original scope already passed on 2026-06-25 (below).
*Skill:* `webapp-testing` (Playwright) for the browser checks.

- [x] TypeScript compilation, production build, and all unit tests (`npm run build`,
  `npm test`) — including any tests added for the new signal→covariance widget.
- [x] Render and inspect the new tangent-space Manim video in `rnd_env`: source
  compiled; final H.264 is 1920×1080, 30 fps, 20 s; four representative frames
  inspected across reference selection, low/high distortion, and final hand-off.
- [~] Execute every notebook cell in the `rnd_env` kernel with no errors, **and**
  run the Colab variant top-to-bottom on a fresh runtime. Canonical notebook
  passed 17/17 cells; the self-contained Colab variant passed 19/19 cells from
  an empty directory and downloaded three EDF files. **Pending:** repeat in a
  real hosted Colab runtime after the maintainer supplies/uploads the URL.
- [x] Verify desktop and mobile layouts across Chromium/Firefox/Safari, including the
  new visuals, and the recorded Lighthouse performance + accessibility scores (§14).
- [~] Verify keyboard + touch interaction, the new progress indicator, the "run online"
  link, downloadable notebook, media loading, and the absence of browser-console errors.
  Everything passed except the real "run online" destination: the disabled Colab
  placeholder and exact `TODO: paste Colab URL` marker were verified; the live URL
  remains maintainer-supplied.
- [x] Confirm all eight widgets register and render inside the Wix embed from the
  built `dist/` JavaScript/CSS.
- [x] Record final validation results below.

## 16. Free GitHub Pages review deployment *(new — before Wix)*

**Feasibility decision: proceed.** The current experience is transferable to
GitHub Pages because it is a client-only Lit/Vite page with static media and
downloads; it needs no server, database, authentication, or runtime secrets.
However, the existing production build is intentionally **Wix library mode**:
`npm run build` creates the custom-element bundle in `dist/` and does not create
`dist/index.html`. The review site therefore requires a separate Vite application
build. Do not repurpose or break the Wix build.

GitHub Pages is free for a **public** repository on GitHub Free. The review URL
will also be public and has no password protection. Use a project site such as
`https://<owner>.github.io/<repository>/`, not the account-root site, unless the
maintainer deliberately chooses a repository named `<owner>.github.io`.

Official implementation references:

- [Vite static deployment / GitHub Pages](https://vite.dev/guide/static-deploy)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

### 16a. Public-repository and content-safety gate

- [x] Confirm the GitHub owner and public repository slug:
  `Itamar-Avitan/curved-spaces-brain-signals`; review URL:
  `https://itamar-avitan.github.io/curved-spaces-brain-signals/`.
- [x] Confirm explicitly that a public URL and public source repository are
  acceptable. If the material must remain private, stop: free GitHub Pages is not
  the appropriate review host. Proceeding because the user explicitly requested a
  free `github.io` review site.
- [x] Run `gh auth status` and confirm the authenticated account has permission to
  create a public repository and configure Pages. `gh` 2.95.0 is authenticated as
  `Itamar-Avitan` over SSH with `repo` scope; `gh repo create` succeeded.
- [x] Audit the future Git commit for secrets, personal data, institutional tokens,
  and files that cannot legally be redistributed. The local `data/` recordings,
  `node_modules/`, render cache `media/`, and generated build folders are already
  ignored and must remain untracked.
- [x] Decide whether the collected PDFs under `sources/` may be redistributed.
  Default-safe choice: do **not** commit the PDFs; keep `sources/README.md` and
  `sources/references.bib` or replace PDFs with lawful source links. `.gitignore`
  excludes `sources/**/*.pdf`.
- [x] Confirm no file relies on Git LFS. Git LFS is not supported by GitHub Pages.
  Current public site assets are suitable for ordinary Git: `public/` is about
  5.4 MB and the largest site asset is about 1.1 MB, far below Pages' 1 GB site
  limit and GitHub's 100 MB single-object hard limit.

### 16b. Add a Pages build without changing the Wix build

- [x] Keep `npm run build` and `vite.config.ts` as the Wix/library build producing
  `dist/riemannian-eeg-widgets.js` and its CSS.
- [x] Add a separate Pages config (`vite.pages.config.ts`) and npm
  scripts such as `build:pages` and `preview:pages`. Output to `dist-pages/` so
  Pages work cannot overwrite or masquerade as the Wix artifact.
- [x] Configure the Pages build as a normal Vite application with `index.html` as
  its entry. Its artifact must contain `dist-pages/index.html` at the top level.
- [x] Set Vite `base` correctly:
  - project site: `/<repository>/`;
  - account-root `<owner>.github.io` site: `/`.
  Prefer deriving the project-site base from an explicit `PAGES_BASE_PATH`
  environment variable so local and CI builds are deterministic. Default is
  `/curved-spaces-brain-signals/`; CI sets it from the repository name.
- [x] Make every root-absolute asset portable under that base. Verify all five MP4
  files, posters, the result image, the executed notebook download, the Colab
  notebook artifact, fonts, the module entry, and internal anchors. No request on
  the deployed page may accidentally target `https://<owner>.github.io/media/...`
  when the site lives under `/<repository>/`.
- [x] Add review-only metadata without changing Wix behavior: a visible
  “Review build” label with the commit SHA/build date and
  `<meta name="robots" content="noindex,nofollow">` for the Pages application.
- [x] Build locally with the exact project base and serve the built artifact under
  that same subpath. Verify `index.html`, media, downloads, and module scripts return
  HTTP 200 with no console errors. Local gate passed at
  `http://127.0.0.1:5205/curved-spaces-brain-signals/`: eight widgets, 15 checked
  local URLs, signal playback 45/160→54/160, no page errors, no real failed requests.
- [x] Add an automated Pages-build check that fails if `dist-pages/index.html` is
  absent, any emitted HTML still contains unhandled root-absolute project assets,
  or the Wix bundle build changes unexpectedly.

### 16c. Create the GitHub repository safely

- [x] This workspace is not currently a Git repository. Initialize it on `main`,
  review `.gitignore`, and inspect the full staged file list before the first commit.
  Evidence: `git init -b main`; fixed `.gitignore` so root `/media/` stays ignored
  while required `public/media/` assets are commit candidates; dry-run add lists only
  source, notebooks, public assets, config, docs, scripts, and workflow files.
- [x] Create the public repository through `gh repo create` (or the connected GitHub
  app) only after the public-content gate above is approved. Add it as `origin`.
  Evidence: `gh repo create Itamar-Avitan/curved-spaces-brain-signals --public
  --source . --remote origin` returned
  `https://github.com/Itamar-Avitan/curved-spaces-brain-signals`.
- [ ] Commit the source, generated public media/downloads required by the site,
  Pages configuration, workflow, README, and validation evidence. Do not commit
  `node_modules/`, `dist/`, `dist-pages/`, private data, render caches, or temporary
  audit files.
- [x] Update `README.md` with local commands for both targets:
  Wix/library (`npm run build`) and review site (`npm run build:pages`), plus the
  final GitHub Pages URL and the public-review warning.
  Evidence: README includes `npm run build`, `PAGES_BASE_PATH=/curved-spaces-brain-signals/
  npm run build:pages`, `npm run build:all`,
  `https://itamar-avitan.github.io/curved-spaces-brain-signals/`, and the public
  `noindex,nofollow` review warning.

### 16d. Add the GitHub Actions Pages workflow

- [x] Add `.github/workflows/deploy-pages.yml` with:
  - push to `main` and manual `workflow_dispatch`;
  - optional pull-request build/test job with no deployment;
  - `contents: read`, `pages: write`, and `id-token: write` permissions;
  - `pages` concurrency so superseded deployments are cancelled;
  - `actions/checkout`, Node LTS setup with npm cache, `npm ci`, `npm test`,
    `npm run build:pages`, Pages configuration, artifact upload from
    `./dist-pages`, and Pages deployment;
  - the `github-pages` environment and deployed URL output.
- [x] Use the current official action major versions available at implementation time:
  `actions/checkout@v6`, `actions/setup-node@v4`,
  `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`,
  `actions/deploy-pages@v5`.
- [ ] In repository **Settings → Pages**, set the publishing source to
  **GitHub Actions**. Add a deployment protection rule so only `main` can deploy.
- [ ] Push `main`, monitor the workflow to completion, and record the successful
  Actions run URL, deployed commit SHA, deployment timestamp, and public page URL.

### 16e. Validate the public review site

- [ ] Fetch the public URL and every local media/download URL; require HTTP 200 and
  correct MIME types. Confirm HTTPS is active.
- [ ] Run the §14/§15 Playwright checks against the public URL in Chromium, Firefox,
  WebKit, mobile Chrome, and mobile Safari—not only against localhost.
- [ ] Verify the complete reviewer path: skip link, sticky chapter progress,
  signal→covariance play/scrub, distance/mean/tangent controls and checks, MDM,
  notebook download, disabled Colab placeholder (until its real URL exists),
  next-steps links, transcripts, and all five videos.
- [ ] Run Lighthouse against the public URL and compare performance/accessibility
  with the local §14 record. Treat new 404s, mixed-content warnings, console errors,
  or a material score regression as deployment failures.
- [ ] Verify the Wix deliverable independently after Pages work:
  `npm run build` still produces the expected library bundle, and all eight custom
  elements register from `dist/`.
- [ ] Send reviewers the URL together with the reviewed commit SHA and a short
  feedback checklist. Make clear that this is a public temporary review build and
  that the final Wix page may supply surrounding navigation/copy differently.

### 16f. Updates, rollback, and retirement

- [ ] Document that accepted changes deploy automatically after validation and a
  push to `main`; use `workflow_dispatch` for a manual redeploy.
- [ ] Test rollback by redeploying a known-good commit or reverting a review change.
- [ ] Before Wix launch, decide whether to retain the Pages site as a public demo or
  unpublish it in **Settings → Pages**. If retained, remove the review/noindex banner
  only after the Wix/publication decision is explicit.

**Done when:** a public `github.io` project URL is deployed from a reproducible
GitHub Actions workflow; the public site passes §14/§15 checks with no asset-path
failures; the reviewed commit is visible; and the original Wix widget build remains
unchanged and validated.

## Validation record

### Baseline — original scope (§1–§6, §4a) · 2026-06-25

- TypeScript production build passed.
- 9 Vitest tests passed, including explicit checks for covariance swelling,
  midpoint validity, determinant preservation, and the Riemannian-mean objective.
- `manimgl==1.7.2` installed in `rnd_env`; both new scenes rendered at 1920×1080, 30 fps.
- Review frames inspected at the introduction, live interpolation, objective
  minimization, and final prediction stages.
- The notebook executed all 17 code cells with no errors and contains 10 executable
  assertions; the published notebook matches the executed source.
- Desktop 1280 px and mobile 390 px checked in Chromium with no horizontal overflow.
- All four videos loaded with `readyState=4`; the two new MP4s and the notebook
  download returned HTTP 200.
- Keyboard activation verified for guided lesson controls and transcript disclosure;
  reduced-motion verified for the replay control.
- Browser page-error log empty (only Lit's expected dev-mode notice).
- All reference URLs checked; the four core papers link to open HAL records.

### New scope (§7–§14) — automated validation complete; external gates pending

Automated validation completed 2026-06-26:

- `npm run build` passed; all 11 Vitest tests passed.
- Tangent ManimGL source compiled; final video verified at 1920×1080 H.264,
  30 fps, 20 seconds, with representative frames visually inspected.
- Canonical notebook executed 17/17 code cells with zero errors; published copy
  hash matches. Self-contained Colab variant executed 19/19 code cells with zero
  errors from an empty directory, created its helper module, and downloaded three
  EDF files; its published hash also matches.
- Chromium, Firefox, and WebKit passed at 1280 px with all eight widgets and no
  horizontal overflow. Pixel 7 and iPhone 13 emulations passed touch and overflow
  checks (signal scrubber moved from 45/160 to 131/160 in both).
- Keyboard activation passed for the skip link, transcript disclosure, and
  concept-check choice. Chapter progress identified `#mean` as the sole active
  chapter and reported `scaleX(0.535036)`.
- Both notebook downloads returned HTTP 200 (965,517 and 59,473 bytes).
- All five MP4 files returned HTTP 200 and reached `readyState=4`.
- All eight custom elements registered and rendered directly from the Wix
  `dist/` bundle. Browser page-error and application console-error logs were empty.
- Axe WCAG A/AA: 0 violations; Lighthouse accessibility: 100; no audited target
  below 44 px. Production Lighthouse performance: 88 (FCP 1.4 s, LCP 3.7 s,
  TBT 0 ms, CLS 0.067). Videos defer loading; offscreen images lazy-load.

Claude independent Chromium re-validation 2026-06-26 (corroborates the above,
focused on §8/§10/§12 features): all 8 custom elements defined + 1 each in DOM;
0 horizontal overflow at 1280 px and 390 px; 5 `<video>` sources present incl.
`/media/tangent-space.mp4`; Colab CTA still `aria-disabled=true` / `tabindex=-1`
with the `TODO: paste Colab URL` marker intact; notebook download href correct;
**tangent comprehension check opens via keyboard (Enter)**; 7 chapter links
(6 numbered + bridge); scroll-spy marked `#mean` sole active at `scaleX(0.537)`
(matches Codex's 0.535); console-problem log empty. §12 classifier-transcript fix
confirmed consistent with the rendered MDM video + widget.

External/manual gates before §15 can be fully `[x]`:

1. Run a real VoiceOver pass over the lesson sequence (§14).
2. Upload the generated Colab notebook, paste the maintainer-provided URL, and
   run it top-to-bottom in a fresh hosted Colab runtime (§11/§15).

After those gates pass, execute §16 to create the public GitHub Pages review site.
