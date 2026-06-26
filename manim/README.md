# ManimGL scenes

New explanatory animations use
[3b1b/manim](https://github.com/3b1b/manim), whose package and command names
are `manimgl`. All commands run through the `rnd_env` conda environment.

```bash
conda run -n rnd_env python -m pip install -r manim/requirements.txt

# Fast review render
conda run -n rnd_env manimgl \
  manim/manimgl_lessons.py \
  CovariancePathGL RiemannianMeanGL \
  -w -l

# Final 1080p render
conda run -n rnd_env manimgl \
  manim/manimgl_lessons.py \
  CovariancePathGL RiemannianMeanGL \
  -w --hd
```

The ManimGL scenes use `ValueTracker`, `always_redraw`, live numeric updaters,
glowing points, and LaTeX equations so the mathematical quantities change
continuously with the geometry.

`scenes.py` contains earlier Manim Community scenes retained for the existing
hook and MDM videos. New lesson work should be added to
`manimgl_lessons.py`.

Final videos are copied to `public/media/` after frame-by-frame review.
