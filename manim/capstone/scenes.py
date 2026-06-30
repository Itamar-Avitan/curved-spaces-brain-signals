"""Capstone video — "The Shape of a Thought" (ManimGL).

One Scene per act of manim/capstone/script.md. Beat timing is data-driven: each
beat plays its entrance animations, then holds until that beat's narration ends.
Durations come from ``beat_durations.json`` (written by the audio step) and fall
back to the estimates in ``DEFAULT_BEATS`` so the scenes render before any voice
exists.

Render one act (low quality preview):
    conda run -n rnd_env manimgl manim/capstone/scenes.py Act2Covariance -wl

Render all, HD, for the final cut (driven by the sync script):
    conda run -n rnd_env manimgl manim/capstone/scenes.py \
        Act0Cold Act1Signal Act2Covariance Act3Cone Act4Swelling \
        Act5Ruler Act6Decoding Act7Close -w --hd
"""

from __future__ import annotations

import json
import math
import os

import numpy as np
from manimlib import *

# --- palette (matches the page + manimgl_lessons.py) -----------------------
NIGHT = "#24283B"
PANEL = "#2C3147"
PAPER = "#FFFAF1"
CREAM = "#FFFDF8"
MUTED = "#BFC1CE"
GRID = "#4A5068"
CORAL = "#EF6B5B"
CYAN = "#1CA9A0"
VIOLET = "#8063D4"
LEMON = "#FFD36B"
FONT = "Avenir Next"

# --- beat durations (seconds of narration) ---------------------------------
_DUR_PATH = os.path.join(os.path.dirname(__file__), "beat_durations.json")

DEFAULT_BEATS: dict[str, float] = {
    "0.1": 11, "0.2": 10,
    "1.1": 8, "1.2": 9, "1.3": 10, "1.4": 13,
    "2.1": 11, "2.2": 12, "2.3": 9, "2.4": 13, "2.5": 14, "2.6": 11,
    "3.1": 9, "3.2": 13, "3.3": 13, "3.4": 9, "3.5": 16, "3.6": 13,
    "4.1": 7, "4.2": 12, "4.3": 14, "4.4": 10, "4.5": 16, "4.6": 14,
    "5.1": 11, "5.2": 15, "5.3": 13, "5.4": 17, "5.5": 15,
    "6.1": 12, "6.2": 16, "6.3": 14, "6.4": 18,
    "7.1": 14, "7.2": 14,
}


def _load_durations() -> dict[str, float]:
    if os.path.exists(_DUR_PATH):
        with open(_DUR_PATH, encoding="utf-8") as handle:
            return {**DEFAULT_BEATS, **json.load(handle)}
    return DEFAULT_BEATS


DURATIONS = _load_durations()


def text(value: str, *, size: int = 34, color: str = CREAM,
         weight: str = "REGULAR") -> Text:
    return Text(value, font=FONT, font_size=size, color=color, weight=weight)


def label(value: str, *, size: int = 20, color: str = MUTED,
          weight: str = "REGULAR") -> Text:
    t = text(value, size=size, color=color, weight=weight)
    t.set_backstroke(NIGHT, 5)
    return t


# --- SPD geometry helpers (mirrors manimgl_lessons.py) ---------------------
def _power_spd(matrix: np.ndarray, power: float) -> np.ndarray:
    vals, vecs = np.linalg.eigh(matrix)
    return (vecs * (vals ** power)) @ vecs.T


def _logm_spd(matrix: np.ndarray) -> np.ndarray:
    vals, vecs = np.linalg.eigh(matrix)
    return (vecs * np.log(vals)) @ vecs.T


def _geodesic(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    """Affine-invariant geodesic A^1/2 (A^-1/2 B A^-1/2)^t A^1/2."""
    a_half = _power_spd(a, 0.5)
    a_inv_half = _power_spd(a, -0.5)
    middle = _power_spd(a_inv_half @ b @ a_inv_half, t)
    return a_half @ middle @ a_half


def cov_ellipse(diag: tuple[float, float], *, color: str, scale: float = 0.55,
                opacity: float = 0.18) -> Ellipse:
    return Ellipse(
        width=2 * scale * math.sqrt(diag[0]),
        height=2 * scale * math.sqrt(diag[1]),
    ).set_style(fill_color=color, fill_opacity=opacity,
                stroke_color=color, stroke_width=4)


class CapstoneScene(Scene):
    """Base: night background + beat-timed holds."""

    def construct(self) -> None:
        self.camera.background_color = NIGHT
        self._target = 0.0  # cumulative narration time the scene should have reached
        self.body()

    def body(self) -> None:  # overridden per act
        raise NotImplementedError

    def dur(self, key: str) -> float:
        return float(DURATIONS.get(key, 4.0))

    def hold(self, key: str, consumed: float = 0.0) -> None:
        """Wait until the scene clock reaches the end of this beat's narration.

        Drift-free: each beat ends at the cumulative sum of beat durations, so
        the video stays locked to the concatenated audio no matter how long the
        entrance animations actually took. ``consumed`` is ignored (kept for
        call-site compatibility)."""
        self._target += self.dur(key)
        pad = self._target - self.time
        if pad > 0.04:
            self.wait(pad)

    def hold_scroll(self, key: str, tracker, speed: float = 1.0) -> None:
        """Pad the beat by advancing a tracker at constant speed (e.g. to keep a
        live signal scrolling) instead of sitting static."""
        self._target += self.dur(key)
        pad = self._target - self.time
        if pad > 0.2:
            self.play(tracker.animate.set_value(tracker.get_value() + speed * pad),
                      run_time=pad, rate_func=linear)
        elif pad > 0.04:
            self.wait(pad)

    def hold_drift(self, key: str, anim) -> None:
        """Like hold, but spend the remaining beat time on a slow animation
        (usually a gentle camera drift) so long narration never sits static."""
        self._target += self.dur(key)
        pad = self._target - self.time
        if pad > 0.2:
            self.play(anim, run_time=pad, rate_func=linear)
        elif pad > 0.04:
            self.wait(pad)

    def caption(self, value: str, *, color: str = CREAM, size: int = 27,
                weight: str = "REGULAR", edge=DOWN, buff: float = 0.55) -> Text:
        t = text(value, size=size, color=color, weight=weight)
        t.set_backstroke(NIGHT, 6)
        t.fix_in_frame()
        t.to_edge(edge, buff=buff)
        return t

    def formula(self, tex: str, *, color: str = CREAM, size: int = 44,
                edge=UP, buff: float = 0.7) -> Tex:
        f = Tex(tex, font_size=size, color=color)
        f.set_backstroke(NIGHT, 5)
        f.fix_in_frame()
        f.to_edge(edge, buff=buff)
        return f


# --- SPD cone coordinates: a 2x2 SPD matrix [[a,b],[b,c]] maps to a circular
# cone via (q, b, p) = ((a-c)/2, b, (a+c)/2); the region is the interior p > r,
# r = sqrt(q^2+b^2). det = p^2 - q^2 - b^2.  Apex at the origin, opening up (+z).
CONE_S = 0.95
CONE_P = 3.0


def cone_pt(q: float, b: float, p: float) -> np.ndarray:
    return np.array([q, b, p]) * CONE_S


def mat_to_cone(matrix: np.ndarray) -> np.ndarray:
    a, b, c = matrix[0, 0], matrix[0, 1], matrix[1, 1]
    return cone_pt((a - c) / 2.0, b, (a + c) / 2.0)


def make_cone() -> tuple[ParametricSurface, SurfaceMesh]:
    surf = ParametricSurface(
        lambda u, v: cone_pt(u * math.cos(v), u * math.sin(v), u),
        u_range=(0.04, CONE_P), v_range=(0, TAU), resolution=(28, 48),
    )
    surf.set_color(VIOLET)
    surf.set_opacity(0.22)
    mesh = SurfaceMesh(surf, resolution=(11, 25))
    mesh.set_stroke(VIOLET, width=0.6, opacity=0.45)
    return surf, mesh


def cone_boost(xi: float) -> np.ndarray:
    """A Lorentz boost in the (q, p) plane — a congruence W acting on the cone.
    It shears the cone onto itself and preserves the geodesic distance, so it is
    exactly an 'affine-invariance' transform to warp the whole picture by."""
    c, s = math.cosh(xi), math.sinh(xi)
    return np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [s, 0.0, c]])


# ===========================================================================
# Act 0 — Cold open
# ===========================================================================
class Act0Cold(CapstoneScene):
    def body(self) -> None:
        phase = ValueTracker(0.0)
        colors = (CYAN, VIOLET, CORAL, LEMON)
        rng = np.random.default_rng(5)
        harm = [[(k, rng.uniform(-1, 1), rng.uniform(0, TAU)) for k in range(1, 6)]
                for _ in range(4)]

        def live(i, y0, length=4.6, npts=90):
            def make():
                ph = phase.get_value()
                xs = np.linspace(0, length, npts)
                wave = np.zeros_like(xs)
                for k, a, p in harm[i]:
                    wave += a * np.sin(2 * PI * k * (xs + 1.4 * ph) / length + p)
                wave = 0.34 * wave / (np.max(np.abs(wave)) + 1e-9)
                pts = [np.array([x + 1.1, y0 + w, 0]) for x, w in zip(xs, wave)]
                return VMobject().set_points_smoothly(pts).set_stroke(colors[i], 3)
            return always_redraw(make)

        # 0.1 — silhouette, electrodes, live EEG, then the decoded word
        head = VGroup(
            Circle(radius=1.0, color=MUTED, stroke_width=3),
            Arc(radius=1.0, start_angle=PI * 0.15, angle=PI * 0.7,
                color=LEMON, stroke_width=4),
        ).shift(LEFT * 4.2 + UP * 0.3)
        cap_dots = Group(*[
            GlowDot(head.get_center() + np.array([0.55 * math.cos(a),
                    0.55 * math.sin(a) + 0.45, 0]), color=CYAN,
                    radius=0.07, glow_factor=1.6)
            for a in np.linspace(0.2 * PI, 0.8 * PI, 5)
        ])
        traces = VGroup(*[live(i, 1.45 - i * 0.85) for i in range(4)])
        word = Text("left", font="Menlo", font_size=56, color=CREAM).to_edge(DOWN, buff=0.85)

        self.play(FadeIn(head), LaggedStartMap(FadeIn, cap_dots, lag_ratio=0.1),
                  run_time=1.6)
        self.add(traces)
        self.play(phase.animate.increment_value(1.4), run_time=1.4, rate_func=linear)
        self.play(Write(word), run_time=1.2)
        self.hold_scroll("0.1", phase, speed=1.0)

        # 0.2 — title rises out of the (now faded) signal
        title = text("The Shape of a Thought", size=58, weight="BOLD")
        sub = label("from a wiggling voltage to a working decoder — derived",
                    size=24, color=MUTED)
        sub.next_to(title, DOWN, buff=0.3)
        VGroup(title, sub).move_to(ORIGIN)
        for m in traces:
            m.clear_updaters()
        self.play(
            FadeOut(head), FadeOut(cap_dots), FadeOut(word),
            traces.animate.set_stroke(opacity=0.16).scale(0.8).move_to(UP * 0.1),
            run_time=1.3,
        )
        self.play(Write(title), run_time=1.6)
        self.play(FadeIn(sub, UP), run_time=0.8)
        self.hold("0.2", 0.0)
        self.play(FadeOut(VGroup(title, sub)), FadeOut(traces), run_time=1.0)

    @staticmethod
    def _mini_trace(seed: int, color: str, length: float = 3.2,
                    height: float = 0.5) -> VMobject:
        rng = np.random.default_rng(seed + 7)
        xs = np.linspace(0, length, 220)
        ys = np.zeros_like(xs)
        for k in range(1, 6):
            ys += rng.uniform(-1, 1) * np.sin(2 * PI * k * xs / length + rng.uniform(0, TAU)) / k
        ys = height * ys / (np.max(np.abs(ys)) + 1e-9)
        pts = [np.array([x - length / 2, y, 0]) for x, y in zip(xs, ys)]
        line = VMobject().set_points_smoothly(pts)
        line.set_stroke(color, width=3)
        return line


# ===========================================================================
# Act 1 — The signal, and why raw voltage fails
# ===========================================================================
class Act1Signal(CapstoneScene):
    def body(self) -> None:
        names = ["C3", "Cz", "C4", "Pz"]
        colors = [CYAN, VIOLET, CORAL, LEMON]
        ys = [2.0 - i * 1.25 for i in range(4)]
        phase = ValueTracker(0.0)   # scroll position
        gain = ValueTracker(1.0)    # ghost amplitude (drift)

        # fixed harmonic content per channel — deterministic, so it just scrolls
        rng = np.random.default_rng(11)
        harm = [[(k, rng.uniform(-1, 1), rng.uniform(0, TAU)) for k in range(1, 6)]
                for _ in range(4)]

        def trace(i, *, ghost=False, length=8.4, npts=110):
            y0 = ys[i]
            off = 2.6 if ghost else 0.0

            def make():
                ph = phase.get_value() + off
                g = gain.get_value() if ghost else 1.0
                xs = np.linspace(0, length, npts)
                wave = np.zeros_like(xs)
                for k, a, p in harm[i]:
                    wave += a * np.sin(2 * PI * k * (xs + 1.4 * ph) / length + p)
                wave = g * 0.40 * wave / (np.max(np.abs(wave)) + 1e-9)
                pts = [np.array([x - length / 2 + 0.6, y0 + w, 0])
                       for x, w in zip(xs, wave)]
                v = VMobject().set_points_smoothly(pts)
                v.set_stroke(colors[i], 3, opacity=0.5 if ghost else 1.0)
                return v
            return always_redraw(make)

        tags = VGroup(*[text(names[i], size=24, color=colors[i], weight="BOLD")
                        .move_to(np.array([-5.7, ys[i], 0])) for i in range(4)])
        live = Group(*[trace(i) for i in range(4)])

        # 1.1 — four live channels, scrolling
        self.play(FadeIn(tags, lag_ratio=0.1), run_time=1.0)
        self.add(live)
        self.hold_scroll("1.1", phase, speed=1.0)

        # 1.2 — a second recording (ghosts), then live amplitude drift
        ghosts = Group(*[trace(i, ghost=True) for i in range(4)])
        same = label("same intent, recorded twice", size=22, color=MUTED).to_edge(UP, buff=0.5)
        eucl = label("‖ raw difference ‖  large", size=24, color=CORAL).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(same, DOWN), run_time=0.7)
        self.add(ghosts)
        self.play(FadeIn(eucl, UP), run_time=0.7)
        self.play(gain.animate.set_value(1.7), phase.animate.increment_value(2.2),
                  run_time=1.5, rate_func=linear)
        self.play(gain.animate.set_value(0.55), phase.animate.increment_value(2.2),
                  run_time=1.5, rate_func=linear)
        self.play(FlashAround(eucl, color=CORAL, buff=0.15), run_time=0.7)
        self.hold_scroll("1.2", phase, speed=1.0)

        # 1.3 — the real signal is co-movement (channels still scrolling)
        for g in ghosts:
            g.clear_updaters()
        links = always_redraw(lambda: VGroup(
            Line(np.array([-4.4, ys[0], 0]), np.array([-4.4, ys[1], 0]), color=CYAN,
                 stroke_width=4, stroke_opacity=0.4 + 0.35 * math.sin(phase.get_value() * 3)),
            Line(np.array([-4.4, ys[2], 0]), np.array([-4.4, ys[3], 0]), color=CORAL,
                 stroke_width=4, stroke_opacity=0.4 + 0.35 * math.sin(phase.get_value() * 3)),
        ))
        co_msg = text("It's how the channels move together.", size=32,
                      color=LEMON, weight="BOLD")
        co_msg.set_backstroke(NIGHT, 6)
        co_msg.to_edge(DOWN, buff=0.5)
        self.play(FadeOut(same), FadeOut(eucl), FadeOut(ghosts),
                  gain.animate.set_value(1.0), run_time=0.8)
        self.add(links)
        self.play(FadeIn(co_msg, UP), run_time=0.9)
        self.hold_scroll("1.3", phase, speed=1.0)
        for m in (*live, links):
            m.clear_updaters()
        self.play(FadeOut(Group(live, tags, co_msg, links)), run_time=1.0)


# ===========================================================================
# Act 2 — Covariance, and a proof it's positive definite
# ===========================================================================
class Act2Covariance(CapstoneScene):
    def body(self) -> None:
        # 2.1 — X block + formula
        x_block = Rectangle(width=3.4, height=2.0, fill_color=PANEL, fill_opacity=1,
                            stroke_color=GRID, stroke_width=1.5).shift(LEFT * 3.4 + UP * 0.6)
        x_lines = VGroup(*[
            Act0Cold._mini_trace(seed=i + 50, color=c, length=3.0, height=0.18)
            .move_to(x_block.get_center() + UP * (0.6 - i * 0.4))
            for i, c in enumerate((CYAN, VIOLET, CORAL, LEMON))
        ])
        x_tag = Tex(R"X", font_size=40, color=CREAM).next_to(x_block, UP, buff=0.15)
        x_dims = label("channels × time", size=18, color=MUTED).next_to(x_block, DOWN, buff=0.15)
        formula = Tex(R"\Sigma = \tfrac{1}{T}\, X X^{\top}", font_size=52, color=CREAM)
        formula.shift(RIGHT * 2.8 + UP * 0.6)
        formula.set_color_by_tex(R"\Sigma", LEMON)
        self.play(FadeIn(x_block), LaggedStartMap(lambda m: ShowCreation(m), x_lines,
                  lag_ratio=0.1), FadeIn(x_tag), FadeIn(x_dims), run_time=2.2)
        self.play(Write(formula), run_time=2.0)
        self.hold("2.1", 4.5)

        # 2.2 — the 4x4 matrix fills
        grid = self._cov_grid().shift(RIGHT * 2.8 + UP * 0.4)
        self.play(FadeOut(formula), run_time=0.6)
        self.play(LaggedStartMap(FadeIn, grid, lag_ratio=0.03), run_time=2.4)
        diag_key = label("diagonal = power", size=19, color=CYAN).next_to(grid, DOWN, buff=0.2)
        off_key = label("off-diagonal = co-movement", size=19, color=VIOLET)
        off_key.next_to(diag_key, DOWN, buff=0.1)
        self.play(FadeIn(diag_key), FadeIn(off_key), run_time=1.0)

        # 2.2 (cont.) — recording pours into one tile
        self.play(VGroup(x_block, x_lines, x_tag, x_dims).animate.scale(0.7)
                  .shift(RIGHT * 1.2), run_time=1.0)
        sigma_tile = VGroup(
            Square(side_length=1.1, fill_color=PANEL, fill_opacity=1,
                   stroke_color=LEMON, stroke_width=2),
            Tex(R"\Sigma", font_size=46, color=LEMON),
        )
        self.play(
            ReplacementTransform(grid, sigma_tile),
            FadeOut(diag_key), FadeOut(off_key),
            run_time=1.6)
        shape = label("the shape of the trial — one object", size=22, color=CREAM)
        shape.next_to(sigma_tile, DOWN, buff=0.3)
        self.play(FadeIn(shape, UP), run_time=0.8)
        self.hold("2.2", 0.0)
        self.play(FadeOut(VGroup(x_block, x_lines, x_tag, x_dims, shape)),
                  sigma_tile.animate.scale(0.9).to_corner(UL, buff=0.7), run_time=1.0)

        # 2.3 — positive definite, shown live: spin v, watch vᵀΣv stay above zero
        title = text("Why positive definite?", size=32, weight="BOLD").to_edge(UP, buff=0.5)
        ident = Tex(R"v^\top \Sigma v = \frac{1}{T}\lVert X^\top v\rVert^2 \ge 0",
                    font_size=40, color=CREAM).next_to(title, DOWN, buff=0.28)
        ctr = LEFT * 3.3 + DOWN * 0.9
        ell = cov_ellipse((3.0, 1.0), color=VIOLET, scale=0.95).move_to(ctr)
        theta = ValueTracker(0.0)

        def qform(th):
            return 3.0 * math.cos(th) ** 2 + 1.0 * math.sin(th) ** 2

        vvec = always_redraw(lambda: Arrow(
            ctr, ctr + 1.5 * np.array([math.cos(theta.get_value()),
                                       math.sin(theta.get_value()), 0]),
            buff=0, color=LEMON, stroke_width=6))
        vlbl = always_redraw(lambda: Tex("v", font_size=30, color=LEMON)
                             .next_to(vvec.get_end(), UR, buff=0.04))
        base = RIGHT * 2.5 + DOWN * 2.0
        zero = Line(base + LEFT * 0.6, base + RIGHT * 1.7, color=GRID, stroke_width=2)
        zlbl = text("0", size=18, color=MUTED).next_to(zero, LEFT, buff=0.18)
        bar = always_redraw(lambda: Line(
            base, base + UP * 0.62 * qform(theta.get_value()),
            color=CYAN, stroke_width=22))
        qnum = DecimalNumber(3.0, num_decimal_places=2, color=CYAN, font_size=30)
        qnum.add_updater(lambda m: m.set_value(qform(theta.get_value())))
        qnum.add_updater(lambda m: m.next_to(
            base + UP * 0.62 * qform(theta.get_value()), UP, buff=0.12))
        qcap = label("variance along v", size=19, color=MUTED).next_to(zero, DOWN, buff=0.3)

        self.play(FadeIn(title, DOWN), Write(ident), run_time=1.6)
        self.add(vvec, vlbl)
        self.play(FadeIn(ell), ShowCreation(zero), FadeIn(zlbl), FadeIn(qcap),
                  run_time=1.1)
        self.add(bar, qnum)
        self.play(theta.animate.set_value(TAU), run_time=3.6, rate_func=linear)
        note = label("a squared length — it never dips to zero", size=20, color=CYAN).move_to(qcap)
        self.play(FadeOut(qcap), FadeIn(note), run_time=0.6)
        stamp = VGroup(
            text("S P D", size=38, color=LEMON, weight="BOLD"),
            text("symmetric · positive definite", size=18, color=CREAM),
        ).arrange(DOWN, buff=0.16).to_corner(UR, buff=0.6)
        self.play(FadeIn(stamp[0], scale=1.2), FadeIn(stamp[1]), run_time=0.8)
        for m in (vvec, vlbl, bar, qnum):
            m.clear_updaters()
        self.hold("2.3", 0.0)
        self.play(FadeOut(VGroup(title, ident, ell, vvec, vlbl, zero, zlbl, note,
                                 bar, qnum, stamp, sigma_tile)), run_time=1.0)

    @staticmethod
    def _cov_grid() -> VGroup:
        n = 4
        cell = 0.62
        rng = np.random.default_rng(3)
        grid = VGroup()
        for r in range(n):
            for c in range(n):
                on_diag = r == c
                col = CYAN if on_diag else VIOLET
                val = (rng.uniform(0.6, 1.0) if on_diag
                       else rng.uniform(-0.5, 0.5))
                sq = Square(side_length=cell, fill_color=col,
                            fill_opacity=0.85 if on_diag else 0.18 + 0.5 * abs(val),
                            stroke_color=GRID, stroke_width=1)
                sq.move_to(np.array([(c - 1.5) * cell, (1.5 - r) * cell, 0]))
                num = Tex(f"{val:.1f}", font_size=20,
                          color=NIGHT if on_diag else CREAM).move_to(sq)
                grid.add(VGroup(sq, num))
        return grid


# ===========================================================================
# Act 3 — The curved cone and its ruler
# ===========================================================================
class Act3Cone(CapstoneScene):
    def body(self) -> None:
        frame = self.camera.frame
        frame.reorient(-36, 70, 0, cone_pt(0, 0, 1.45), 8.2)

        # 3.1 — one point in an empty space
        dot0 = Sphere(radius=0.10).set_color(LEMON).move_to(cone_pt(0.5, 0.3, 1.8))
        cap = self.caption("Each trial is one point — but a point in what space?")
        self.play(FadeIn(dot0, scale=0.4), FadeIn(cap), run_time=1.4)

        # 3.1 (cont.) — constraints + cone grows
        cons = self.formula(R"a > 0 \quad c > 0 \quad ac - b^2 > 0", size=36)
        surf, mesh = make_cone()
        cap2 = self.caption("All symmetric positive-definite 2×2 matrices.")
        self.play(FadeOut(cap), FadeIn(cons), run_time=0.8)
        self.play(ShowCreation(surf), ShowCreation(mesh), FadeOut(dot0),
                  FadeIn(cap2), run_time=2.6)
        self.play(frame.animate.reorient(-18, 74, 0, cone_pt(0, 0, 1.45), 8.2),
                  run_time=2.0)
        self.hold_drift("3.1", frame.animate.reorient(-8, 76, 0, cone_pt(0, 0, 1.45), 8.2))

        # 3.3 — the wall: det -> 0
        drift = ValueTracker(0.0)
        probe = always_redraw(lambda: Sphere(radius=0.10).set_color(LEMON).move_to(
            cone_pt(0.15 + drift.get_value() * 1.30, 0.0, 1.5)))
        det_val = DecimalNumber(0, num_decimal_places=2, color=LEMON)
        det_val.add_updater(lambda d: d.set_value(
            1.5 ** 2 - (0.15 + drift.get_value() * 1.30) ** 2))
        det_lbl = VGroup(text("det", size=24, color=MUTED), det_val).arrange(RIGHT, buff=0.18)
        det_lbl.set_backstroke(NIGHT, 5)
        det_lbl.fix_in_frame().to_corner(UR, buff=0.7)
        cap3 = self.caption("On the boundary the determinant hits zero — the matrix "
                            "collapses. That wall should feel infinitely far.",
                            color=CORAL, size=24)
        self.play(FadeOut(cap2), FadeIn(probe), FadeIn(det_lbl), FadeIn(cap3),
                  run_time=1.0)
        self.play(drift.animate.set_value(1.0), run_time=2.6, rate_func=smooth)
        self.hold_drift("3.2", frame.animate.reorient(-28, 71, 0, cone_pt(0, 0, 1.45), 8.2))
        self.play(drift.animate.set_value(0.0), run_time=1.0)
        # Freeze the live updaters before fading, else the redraw/decimal point
        # counts shift mid-interpolation and numpy can't broadcast the frames.
        probe.clear_updaters()
        det_val.clear_updaters()
        self.play(FadeOut(cap3), FadeOut(det_lbl), FadeOut(probe), run_time=1.0)

        # 3.4 — the metric tensor
        metric = self.formula(R"\langle U, V\rangle_P = \mathrm{tr}\left(P^{-1} U P^{-1} V\right)",
                              size=40)
        cap4 = self.caption("The ruler changes from point to point.")
        self.play(FadeOut(cons), FadeIn(metric), FadeIn(cap4), run_time=1.2)

        # 3.3 (cont.) — Frobenius at I, stretched near the wall
        gauge_near = VGroup(
            text("near the identity", size=20, color=CYAN),
            Line(ORIGIN, RIGHT * 0.55, color=CYAN, stroke_width=6),
            text("cheap step", size=18, color=MUTED),
        ).arrange(RIGHT, buff=0.22)
        gauge_far = VGroup(
            text("near the wall", size=20, color=CORAL),
            Line(ORIGIN, RIGHT * 2.0, color=CORAL, stroke_width=6),
            text("costly step", size=18, color=MUTED),
        ).arrange(RIGHT, buff=0.22)
        gauges = VGroup(gauge_near, gauge_far).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        gauges.set_backstroke(NIGHT, 5)
        gauges.fix_in_frame().to_edge(LEFT, buff=0.7)
        cap5 = self.caption("At the identity it's the plain Frobenius ruler; toward the "
                            "wall every step costs more.", size=23)
        self.play(FadeOut(cap4), FadeIn(gauges), FadeIn(cap5), run_time=1.2)
        self.play(frame.animate.reorient(-30, 72, 0, cone_pt(0, 0, 1.45), 8.2),
                  run_time=3.0)
        self.hold_drift("3.3", frame.animate.reorient(-18, 74, 0, cone_pt(0, 0, 1.45), 8.2))

        # 3.6 — path length: wiggly path vs geodesic
        A = np.diag([3.2, 0.6])
        B = np.diag([0.7, 3.0])
        geo = VMobject().set_points_smoothly(
            [mat_to_cone(_geodesic(A, B, t)) for t in np.linspace(0, 1, 40)])
        geo.set_stroke(CYAN, 5)
        wiggle_pts = []
        for t in np.linspace(0, 1, 40):
            base = mat_to_cone(_geodesic(A, B, t))
            wiggle_pts.append(base + np.array([0, 0.9 * math.sin(t * PI) * math.sin(t * 14), 0]))
        wig = VMobject().set_points_smoothly(wiggle_pts).set_stroke(MUTED, 3)
        ends = Group(Sphere(radius=0.09).set_color(LEMON).move_to(mat_to_cone(A)),
                     Sphere(radius=0.09).set_color(LEMON).move_to(mat_to_cone(B)))
        pathf = self.formula(R"L(\gamma) = \int_0^1 \sqrt{\langle \gamma', \gamma' \rangle_\gamma}\, dt",
                             size=36, edge=UP, buff=0.7)
        cap6 = self.caption("Length is that little ruler, integrated. The shortest route "
                            "is the geodesic.", size=23, color=CYAN)
        self.play(FadeOut(metric), FadeOut(gauges), FadeOut(cap5),
                  FadeIn(ends), FadeIn(pathf), FadeIn(cap6), run_time=1.2)
        self.play(ShowCreation(wig), run_time=1.4)
        self.play(ShowCreation(geo), run_time=1.4)
        self.hold_drift("3.4", frame.animate.reorient(-6, 77, 0, cone_pt(0, 0, 1.45), 8.2))
        self.play(*[FadeOut(m) for m in (surf, mesh, geo, wig, ends, pathf, cap6)],
                  run_time=1.0)


# ===========================================================================
# Act 4 — The swelling effect, as a theorem (centerpiece)
# ===========================================================================
class Act4Swelling(CapstoneScene):
    """Swelling shown as one continuous, live demonstration: a single sweep
    inflates the entry-wise determinant in real time while the geodesic holds."""

    def body(self) -> None:
        frame = self.camera.frame
        frame.reorient(-26, 72, 0, cone_pt(0, 0, 1.5), 8.4)
        surf, mesh = make_cone()
        surf.set_opacity(0.14)
        mesh.set_stroke(opacity=0.26)
        self.add(surf, mesh)

        # diagonal matrices: Euclidean and geodesic interpolants A->B
        def edg(t):  # entry-wise (straight) average diag
            return (4.0 - 3.0 * t, 1.0 + 3.0 * t)

        def gdg(t):  # geodesic (geometric) diag
            return (4.0 ** (1 - t), 4.0 ** t)

        def to_cone(d):
            return cone_pt((d[0] - d[1]) / 2.0, 0.0, (d[0] + d[1]) / 2.0)

        a_pt, b_pt = to_cone(edg(0)), to_cone(edg(1))
        dotA = Sphere(radius=0.10).set_color(LEMON).move_to(a_pt)
        dotB = Sphere(radius=0.10).set_color(LEMON).move_to(b_pt)
        legend = VGroup(
            VGroup(Dot(color=LEMON), text("A = diag(4, 1)", size=20, color=CREAM)).arrange(RIGHT, buff=0.16),
            VGroup(Dot(color=LEMON), text("B = diag(1, 4)", size=20, color=CREAM)).arrange(RIGHT, buff=0.16),
            text("both det 4", size=16, color=MUTED),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.13)
        legend.set_backstroke(NIGHT, 5)
        legend.fix_in_frame().to_corner(UL, buff=0.5)

        te = ValueTracker(0.0)  # Euclidean sweep
        tg = ValueTracker(0.0)  # geodesic sweep

        # live travelling points on the cone
        euc_dot = always_redraw(
            lambda: Sphere(radius=0.12).set_color(CORAL).move_to(to_cone(edg(te.get_value()))))
        geo_dot = always_redraw(
            lambda: Sphere(radius=0.12).set_color(CYAN).move_to(to_cone(gdg(tg.get_value()))))

        # live comparison module (fixed in frame, bottom-right): two covariance
        # ellipses whose AREA tracks det, with live determinant readouts.
        EUC_C = np.array([2.7, -1.5, 0.0])
        GEO_C = np.array([5.0, -1.5, 0.0])

        def _ell(center, diag_fn, tracker, color, opacity):
            def make():
                e = cov_ellipse(diag_fn(tracker.get_value()), color=color,
                                scale=0.52, opacity=opacity)
                e.move_to(center)
                e.fix_in_frame()
                return e
            return always_redraw(make)

        euc_ell = _ell(EUC_C, edg, te, CORAL, 0.22)
        geo_ell = _ell(GEO_C, gdg, tg, CYAN, 0.22)

        def _det_num(diag_fn, tracker, color, center):
            n = DecimalNumber(4.0, num_decimal_places=2, color=color, font_size=30)
            n.add_updater(lambda m: m.set_value(
                diag_fn(tracker.get_value())[0] * diag_fn(tracker.get_value())[1]))
            n.fix_in_frame()
            n.add_updater(lambda m: m.move_to(center + DOWN * 1.02))
            return n

        det_e_num = _det_num(edg, te, CORAL, EUC_C)
        det_g_num = _det_num(gdg, tg, CYAN, GEO_C)
        lbl_e = text("straight mean", size=16, color=CORAL)
        lbl_e.set_backstroke(NIGHT, 5); lbl_e.fix_in_frame(); lbl_e.move_to(EUC_C + UP * 1.25)
        lbl_g = text("geodesic mean", size=16, color=CYAN)
        lbl_g.set_backstroke(NIGHT, 5); lbl_g.fix_in_frame(); lbl_g.move_to(GEO_C + UP * 1.25)

        # 4.1 — set the stage; both means sit on A, det 4
        self.add(euc_ell, det_e_num, lbl_e)
        self.play(FadeIn(dotA, scale=0.4), FadeIn(dotB, scale=0.4), FadeIn(legend),
                  run_time=1.4)
        self.hold_drift("4.1", frame.animate.reorient(-20, 72, 0, cone_pt(0, 0, 1.5), 8.4))

        # 4.2 — the straight average inflates live, and it's forced (theorem)
        chord = Line3D(a_pt, b_pt, width=0.035, color=CORAL)
        self.add(euc_dot)
        self.play(ShowCreation(chord), run_time=1.1)
        self.play(te.animate.set_value(0.5), run_time=3.0, rate_func=smooth)
        thm = self.formula(R"\det\left(\frac{A+B}{2}\right) \ge \sqrt{\det A \cdot \det B}",
                           size=34)
        self.play(FadeIn(thm), FlashAround(det_e_num, color=CORAL, buff=0.18), run_time=1.3)
        self.hold_drift("4.2", frame.animate.reorient(-6, 74, 0, cone_pt(0, 0, 1.5), 8.4))

        # 4.3 — geodesic holds det 4 (log-det linear); that gap is the swelling
        self.play(FadeOut(thm), run_time=0.6)
        geo = VMobject().set_points_smoothly(
            [to_cone(gdg(t)) for t in np.linspace(0, 1, 48)]).set_stroke(CYAN, 5)
        interp = self.formula(R"\det \gamma(t) = (\det A)^{1-t}(\det B)^{t} = 4", size=34)
        self.add(geo_ell, det_g_num, lbl_g, geo_dot)
        self.play(FadeIn(interp), ShowCreation(geo), run_time=1.6)
        self.play(tg.animate.set_value(0.5), run_time=2.8, rate_func=smooth)
        swell = text("← swelling →", size=18, color=CORAL, weight="BOLD")
        swell.set_backstroke(NIGHT, 5); swell.fix_in_frame()
        swell.move_to((EUC_C + GEO_C) / 2 + UP * 0.55)
        cap = self.caption("The straight chord overshoots; the geodesic hugs the cone. "
                           "That gap is the swelling.", size=23)
        self.play(FlashAround(det_g_num, color=CYAN, buff=0.18), FadeIn(swell), FadeIn(cap),
                  frame.animate.reorient(10, 80, 0, cone_pt(0, 0, 1.55), 8.4), run_time=2.6)
        self.hold_drift("4.3", frame.animate.reorient(22, 82, 0, cone_pt(0, 0, 1.6), 8.4))

        for m in (euc_dot, geo_dot, euc_ell, geo_ell, det_e_num, det_g_num):
            m.clear_updaters()
        self.play(*[FadeOut(m) for m in (surf, mesh, dotA, dotB, euc_dot, geo_dot,
                    chord, geo, interp, legend, euc_ell, geo_ell, det_e_num, det_g_num,
                    lbl_e, lbl_g, swell, cap)], run_time=1.0)


# ===========================================================================
# Act 5 — The right ruler, and two theorems
# ===========================================================================
class Act5Ruler(CapstoneScene):
    def body(self) -> None:
        # 5.1 — the distance
        d1 = self.formula(R"\delta(A,B) = \left\lVert \log\left(A^{-1/2} B A^{-1/2}\right) \right\rVert_F",
                          size=42, edge=UP, buff=1.2)
        cap = self.caption("Measure the geodesic with that ruler, and it collapses to "
                           "something clean.")
        self.play(Write(d1), FadeIn(cap), run_time=2.0)

        # 5.2 — sum of squared log-eigenvalues
        d2 = Tex(R"\delta(A,B) = \sqrt{\sum_i \log^2 \lambda_i}", font_size=46, color=CREAM)
        d2.move_to(ORIGIN + UP * 0.3)
        ev = Tex(R"\lambda = 4, \tfrac{1}{4} \Rightarrow \delta = \sqrt{2}\,\log 4 \approx 1.96",
                 font_size=34, color=LEMON)
        ev.next_to(d2, DOWN, buff=0.5)
        cap2 = self.caption("Whiten by A, take the log of the eigenvalues, measure.", size=24)
        self.play(FadeOut(cap), TransformFromCopy(d1, d2), run_time=1.6)
        self.play(FadeIn(ev), FadeIn(cap2), run_time=1.0)
        self.hold("5.1", 0.0)

        # 5.3 — log sends the wall to -infinity
        axes = Axes(x_range=(0, 4, 1), y_range=(-3, 2, 1), width=6.2, height=3.4,
                    axis_config={"stroke_color": GRID, "stroke_width": 2})
        axes.to_edge(DOWN, buff=0.9).shift(LEFT * 0.2)
        graph = axes.get_graph(lambda x: math.log(max(x, 1e-3)), x_range=(0.02, 4),
                               color=CYAN)
        glabel = Tex(R"\log \lambda \to -\infty", font_size=30, color=CORAL)
        glabel.next_to(axes.c2p(0.15, -2.4), RIGHT, buff=0.2)
        cap3 = self.caption("As an eigenvalue runs to zero, its log runs to minus "
                            "infinity — the boundary really is infinitely far.",
                            color=CYAN, size=23)
        self.play(FadeOut(d2), FadeOut(ev), FadeOut(cap2),
                  ShowCreation(axes), run_time=1.2)
        self.play(ShowCreation(graph), FadeIn(glabel), FadeIn(cap3), run_time=1.8)
        self.hold("5.2", 0.0)
        self.play(FadeOut(axes), FadeOut(graph), FadeOut(glabel), FadeOut(cap3),
                  d1.animate.to_edge(UP, buff=0.7), run_time=1.0)

        # 5.3 — affine invariance: the whole cone warps under W, distance unchanged
        proof = Tex(R"\det(WBW^\top - \lambda WAW^\top) = \det(W)\det(B-\lambda A)\det(W^\top)",
                    font_size=28, color=CREAM)
        proof.fix_in_frame().move_to(UP * 0.5)
        cap4 = self.caption("Same eigenvalues under any invertible W — so the same distance.",
                            size=23)
        self.play(FadeOut(d1), FadeIn(proof), FadeIn(cap4), run_time=1.4)

        frame = self.camera.frame
        surf, mesh = make_cone()
        surf.set_opacity(0.16)
        mesh.set_stroke(opacity=0.3)
        A = np.diag([4.0, 1.0])
        B = np.diag([1.0, 4.0])
        dotA = Sphere(radius=0.10).set_color(CYAN).move_to(mat_to_cone(A))
        dotB = Sphere(radius=0.10).set_color(CORAL).move_to(mat_to_cone(B))
        geo = VMobject().set_points_smoothly(
            [mat_to_cone(_geodesic(A, B, t)) for t in np.linspace(0, 1, 40)]).set_stroke(LEMON, 5)
        warp = Group(surf, mesh, dotA, dotB, geo)
        dlabel = VGroup(text("δ =", size=26, color=MUTED),
                        text("1.96", size=26, color=LEMON, weight="BOLD")).arrange(RIGHT, buff=0.14)
        dlabel.set_backstroke(NIGHT, 5)
        dlabel.fix_in_frame().to_corner(UR, buff=0.7)
        self.play(FadeOut(proof),
                  frame.animate.reorient(-26, 72, 0, cone_pt(0, 0, 1.5), 8.6),
                  FadeIn(surf), FadeIn(mesh), FadeIn(dotA), FadeIn(dotB),
                  ShowCreation(geo), FadeIn(dlabel), run_time=2.0)
        cap5 = self.caption("Re-reference, rescale, volume conduction — all just a W. "
                            "The distance never moves.", color=CYAN, size=23)
        self.play(FadeOut(cap4), FadeIn(cap5), run_time=0.6)
        self.play(*[m.animate.apply_matrix(cone_boost(0.45), about_point=ORIGIN) for m in warp],
                  FlashAround(dlabel, color=LEMON, buff=0.15), run_time=2.3)
        self.play(*[m.animate.apply_matrix(cone_boost(-0.85), about_point=ORIGIN) for m in warp],
                  run_time=2.4)
        self.hold_drift("5.3", frame.animate.reorient(-12, 75, 0, cone_pt(0, 0, 1.5), 8.6))
        self.play(*[FadeOut(m) for m in (surf, mesh, dotA, dotB, geo, dlabel, cap5)],
                  run_time=1.0)


# ===========================================================================
# Act 6 — Decoding: the Frechet mean and the classifier (log-domain 2D view)
# ===========================================================================
class Act6Decoding(CapstoneScene):
    def body(self) -> None:
        manifold = Ellipse(width=11.6, height=5.6).set_style(
            fill_color=VIOLET, fill_opacity=0.08, stroke_color=VIOLET, stroke_width=2)
        manifold.shift(DOWN * 0.2)
        space = label("covariance space (log-domain view)", size=18, color=MUTED)
        space.next_to(manifold, DOWN, buff=0.12)

        rng = np.random.default_rng(4)
        centers = {CYAN: np.array([-3.0, 0.8]), CORAL: np.array([3.0, 1.1]),
                   MUTED: np.array([0.2, -1.4])}
        cloud_dots = {}
        dots_all = Group()
        for col, ctr in centers.items():
            pts = ctr + rng.normal(0, 0.55, size=(7, 2))
            g = Group(*[GlowDot(np.array([p[0], p[1], 0]) + DOWN * 0.2, color=col,
                                radius=0.10, glow_factor=1.5) for p in pts])
            cloud_dots[col] = g
            dots_all.add(*g)

        # 6.1 — define the mean
        mean_f = self.formula(R"M = \arg\min_P \sum_i \delta^2(P, \Sigma_i)", size=40)
        self.play(FadeIn(manifold), FadeIn(space), run_time=0.8)
        self.play(LaggedStartMap(FadeIn, dots_all, lag_ratio=0.04), FadeIn(mean_f),
                  run_time=2.0)

        # 6.1 (cont.) — collapse each class to its Riemannian mean
        cond = self.caption("each class collapses to its Riemannian mean — one prototype "
                            "per command", size=22)
        centroids = {}
        pulls = []
        grows = []
        for col, ctr in centers.items():
            cpos = np.array([ctr[0], ctr[1], 0]) + DOWN * 0.2
            c = GlowDot(cpos, color=col, radius=0.22, glow_factor=2.6)
            ring = Circle(radius=0.32, color=col, stroke_width=3).move_to(cpos)
            centroids[col] = (c, ring)
            grows += [FadeIn(c, scale=0.3), ShowCreation(ring)]
            for d in cloud_dots[col]:  # clouds pull inward toward their mean
                pulls.append(d.animate.move_to(d.get_center() * 0.5 + cpos * 0.5))
        self.play(FadeIn(cond), *pulls, *grows, run_time=2.2)
        self.hold("6.1", 0.0)

        # 6.3 — classify a new trial by nearest prototype
        self.play(FadeOut(mean_f), FadeOut(cond), FadeOut(space), run_time=0.6)
        new = GlowDot(np.array([-1.4, 0.2, 0]) + DOWN * 0.2, color=CREAM,
                      radius=0.16, glow_factor=2.0)
        new_lbl = label("new trial", size=20, color=CREAM).next_to(new, UP, buff=0.2)
        lines = VGroup(*[
            Line(new.get_center(), centroids[col][0].get_center(), color=col,
                 stroke_width=3, stroke_opacity=0.7)
            for col in centers])
        self.play(FadeIn(new, scale=0.4), FadeIn(new_lbl), run_time=0.8)
        self.play(ShowCreation(lines), run_time=1.2)
        winner = Line(new.get_center(), centroids[CYAN][0].get_center(), color=CYAN,
                      stroke_width=7)
        word = VGroup(
            text("decoded", size=20, color=MUTED),
            Text("left", font="Menlo", font_size=46, color=CYAN),
        ).arrange(RIGHT, buff=0.25).to_edge(UP, buff=0.5)
        word.set_backstroke(NIGHT, 6)
        cap63 = self.caption("Nearest prototype wins. Minimum distance to mean — that's "
                             "the whole classifier.", color=CYAN, size=23, buff=1.3)
        self.play(ShowCreation(winner), new.animate.set_color(CYAN),
                  FadeIn(cap63), run_time=1.2)
        self.play(Write(word), run_time=0.8)
        self.hold("6.2", 0.0)

        # 6.3 — tangent space bridge
        self.play(FadeOut(Group(lines, winner, new, new_lbl, word, cap63)), run_time=0.8)
        tan_f = self.formula(R"s_i = \mathrm{Log}_M(\Sigma_i) = M^{1/2}\log\left(M^{-1/2}\Sigma_i M^{-1/2}\right)M^{1/2}",
                             size=30)
        plane = Square(side_length=3.2, fill_color=PANEL, fill_opacity=0.6,
                       stroke_color=GRID, stroke_width=1.5).shift(DOWN * 0.4)
        vecs = VGroup(*[Arrow(plane.get_center(),
                              plane.get_center() + np.array([math.cos(a) * 1.2, math.sin(a) * 1.0, 0]),
                              buff=0, color=CYAN, stroke_width=3)
                        for a in np.linspace(0.3, TAU - 0.3, 6)])
        tools = label("LDA · SVM · logistic regression · neural nets", size=22, color=VIOLET)
        tools.next_to(plane, DOWN, buff=0.4)
        cap64 = self.caption("Flatten at the mean — the curved ruler becomes Frobenius, so "
                             "linear models are honest geometry.", size=22, buff=1.4)
        self.play(FadeOut(Group(manifold, space, dots_all,
                  *[centroids[c][0] for c in centers],
                  *[centroids[c][1] for c in centers])),
                  FadeIn(tan_f), run_time=1.0)
        self.play(FadeIn(plane), LaggedStartMap(GrowArrow, vecs, lag_ratio=0.1),
                  FadeIn(tools), FadeIn(cap64), run_time=2.0)
        self.hold("6.3", 0.0)
        self.play(*[FadeOut(m) for m in (tan_f, plane, vecs, tools, cap64)], run_time=1.0)


# ===========================================================================
# Act 7 — Close
# ===========================================================================
class Act7Close(CapstoneScene):
    def body(self) -> None:
        # A clean closing statement — one idea to remember, then a clear pointer
        # to the notebook (which sits right below the video on the page).
        punch = VGroup(
            text("Not a bigger model.", size=44, color=CREAM, weight="BOLD"),
            text("The right geometry.", size=44, color=LEMON, weight="BOLD"),
        ).arrange(DOWN, buff=0.22).shift(UP * 0.55)
        sub = text("It runs end to end, on a real recording.",
                   size=24, color=MUTED)
        sub.next_to(punch, DOWN, buff=0.7)
        cta = text("Open the guided notebook  ↓", size=27, color=CYAN, weight="BOLD")
        cta.next_to(sub, DOWN, buff=0.4)
        self.play(FadeIn(punch[0], UP), run_time=1.1)
        self.play(FadeIn(punch[1], UP), run_time=1.0)
        self.play(FadeIn(sub), run_time=0.8)
        self.play(FadeIn(cta, UP), run_time=0.9)
        self.hold("7.1", 0.0)
        self.play(FadeOut(VGroup(punch, sub, cta)), run_time=1.2)
