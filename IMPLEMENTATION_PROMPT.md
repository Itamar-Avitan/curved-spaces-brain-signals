# Implementation session prompt

Hand this to a fresh agent session that will execute the backlog in
[`plan.md`](plan.md).

**Before you start:**
- Open a **new** Claude Code session (or Codex — the skills are shared to both) in
  this project folder, so the installed Agent Skills are active. They only load at
  session start.
- That session will render Manim and execute notebooks in the `rnd_env` conda env
  and run `npm` builds — make sure that environment is available where you run it.
- The Colab notebook URL (§11) is intentionally a placeholder; paste it in once you
  have it (search the codebase for `TODO: paste Colab URL`).

Copy everything in the block below as the first message:

```
You are implementing the "Curved Spaces, Brain Signals" project — an interactive
Riemannian-geometry → EEG/BCI lesson (Lit + Vite + TypeScript site, two Manim
engines, an MNE/pyRiemann notebook) that is embedded as widgets into a larger Wix
website. Its mission: explain BCI/EEG concepts to newcomers, then hand them a
guided Jupyter notebook as a runnable implementation example.

SOURCE OF TRUTH: plan.md in the project root. Read it fully first. Multiple agents
edit it, so re-read the relevant section before you start it, and the moment you
finish + validate a task, mark it [x] in plan.md with a short evidence note, then
continue. Use the legend: [x] done+validated, [~] built-but-unverified, [ ] not started.

SCOPE: the active backlog is §7–§14; §15 is the final-validation gate. Sections
1–6 and 4a are a validated baseline — don't redo them, only fix defects.
Suggested order (each section ships independently): §7 → §9 → §8 → §10 → §11 →
§13 → §12 → §14 → §15.

CONVENTIONS (also in plan.md):
- Run all Python in the rnd_env conda env: `conda run -n rnd_env <cmd>`. Exception:
  the Colab notebook variant uses `pip install` cells (Colab has no rnd_env).
- Two Manim engines, NOT interchangeable: ManimGL (manim/manimgl_lessons.py) for
  live ValueTracker/always_redraw lessons; ManimCommunity (manim/scenes.py) for
  narrative scenes. Render low-res review frames before final 1080p.
- Web: `npm run build` (tsc --noEmit + vite build), `npm test` (Vitest), `npm run dev`.
- New on-site visuals MUST be Lit custom elements registered in src/main.ts and
  shipped via dist/ — editing only index.html updates the preview, not the live Wix
  page. Reuse src/math/covariance.ts and geometry.ts; don't reinvent the math.
- Respect prefers-reduced-motion and keyboard/touch accessibility in everything new.
- Honesty: results are single-participant demos; never present them as general.

USE THE INSTALLED SKILLS: manimgl-best-practices & manim-composer for the §8
tangent-space ManimGL scene; frontend-design for §7/§9/§10/§12/§13 UI and copy;
webapp-testing (Playwright) for §14/§15 browser + cross-browser checks.

SPECIFIC NOTES:
- §11 Colab link is a PLACEHOLDER — leave the `TODO: paste Colab URL` marker; the
  maintainer hosts the notebook and supplies the URL. Do NOT invent a URL.
- §11 also: evaluate EEGDash (pip install eegdash, Python 3.10+, BIDS, MNE/braindecode)
  as a notebook data source and record adopt/complement/skip with a working snippet.
- No data-science skill is installed (none met the quality bar); rely on native
  capability for notebook/data work.

Begin: read plan.md, pick the first unchecked section in the suggested order,
confirm the current state in the code before editing, implement it, validate it
per its "Done when", mark it [x] with evidence, then move on.
```
