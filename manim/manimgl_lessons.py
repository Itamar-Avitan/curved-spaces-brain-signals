"""ManimGL lessons for the Riemannian EEG learning page.

Render with the 3Blue1Brown version of Manim:

    conda run -n rnd_env manimgl manim/manimgl_lessons.py \
        CovariancePathGL RiemannianMeanGL -w --hd
"""

from __future__ import annotations

import math

import numpy as np
from manimlib import *


NIGHT = "#24283B"
PAPER = "#FFFAF1"
CREAM = "#FFFDF8"
MUTED = "#BFC1CE"
GRID = "#4A5068"
CORAL = "#EF6B5B"
CYAN = "#1CA9A0"
VIOLET = "#8063D4"
LEMON = "#FFD36B"
FONT = "Avenir Next"


def text(
    value: str,
    *,
    size: int = 34,
    color: str = CREAM,
    weight: str = "REGULAR",
) -> Text:
    return Text(
        value,
        font=FONT,
        font_size=size,
        color=color,
        weight=weight,
    )


def covariance_ellipse(
    diagonal: tuple[float, float],
    *,
    color: str,
    scale: float = 1.05,
    opacity: float = 0.16,
) -> Ellipse:
    return Ellipse(
        width=2 * scale * math.sqrt(diagonal[0]),
        height=2 * scale * math.sqrt(diagonal[1]),
    ).set_style(
        fill_color=color,
        fill_opacity=opacity,
        stroke_color=color,
        stroke_width=4,
    )


def panel(width: float, height: float) -> RoundedRectangle:
    return RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.18,
    ).set_style(
        fill_color="#2C3147",
        fill_opacity=1,
        stroke_color=GRID,
        stroke_width=1.5,
    )


class CovariancePathGL(Scene):
    """Animate two interpolation rules with continuously updated geometry."""

    def construct(self) -> None:
        self.camera.background_color = NIGHT

        title = text(
            "What should “halfway” between two EEG patterns mean?",
            size=42,
            weight="BOLD",
        ).to_edge(UP, buff=0.42)
        subtitle = text(
            "A decoder needs this answer before it can average or compare trials.",
            size=23,
            color=MUTED,
        ).next_to(title, DOWN, buff=0.16)
        self.play(Write(title), FadeIn(subtitle, UP))

        start = (0.25, 4.0)
        end = (4.0, 0.25)
        left = covariance_ellipse(start, color=CYAN, scale=1.18)
        right = covariance_ellipse(end, color=CORAL, scale=1.18)
        left.move_to(LEFT * 4.2 + DOWN * 0.15)
        right.move_to(RIGHT * 4.2 + DOWN * 0.15)

        left_name = text(
            "Pattern A\nchannel 2 dominates",
            size=22,
            color=CYAN,
            weight="BOLD",
        ).next_to(left, DOWN, buff=0.28)
        right_name = text(
            "Pattern B\nchannel 1 dominates",
            size=22,
            color=CORAL,
            weight="BOLD",
        ).next_to(right, DOWN, buff=0.28)
        area_a = Tex(R"\sqrt{\det(A)} = 1.00", font_size=34, color=LEMON)
        area_b = Tex(R"\sqrt{\det(B)} = 1.00", font_size=34, color=LEMON)
        area_a.next_to(left_name, DOWN, buff=0.18)
        area_b.next_to(right_name, DOWN, buff=0.18)

        self.play(
            FadeIn(left, scale=0.6),
            FadeIn(right, scale=0.6),
            FadeIn(left_name),
            FadeIn(right_name),
        )
        self.play(Write(area_a), TransformFromCopy(area_a, area_b))
        self.wait(0.6)

        equal_scale = text(
            "Same total variation. Different shape.",
            size=31,
            color=LEMON,
            weight="BOLD",
        ).move_to(DOWN * 2.9)
        self.play(FadeIn(equal_scale, UP))
        self.wait(0.8)

        endpoint_group = VGroup(
            left,
            right,
            left_name,
            right_name,
            area_a,
            area_b,
            equal_scale,
        )
        comparison_title = text(
            "Now move from A to B and watch the midpoint.",
            size=34,
            weight="BOLD",
        ).to_edge(UP, buff=0.38)
        self.play(
            FadeOut(endpoint_group, DOWN),
            FadeTransform(VGroup(title, subtitle), comparison_title),
        )

        divider = Line(UP * 2.5, DOWN * 3.4, color=GRID, stroke_width=1.5)
        left_panel = panel(5.7, 5.1).shift(LEFT * 3.05 + DOWN * 0.3)
        right_panel = panel(5.7, 5.1).shift(RIGHT * 3.05 + DOWN * 0.3)
        left_heading = text(
            "Average the entries",
            size=25,
            color=CORAL,
            weight="BOLD",
        ).next_to(left_panel.get_top(), DOWN, buff=0.28)
        right_heading = text(
            "Respect covariance scaling",
            size=25,
            color=VIOLET,
            weight="BOLD",
        ).next_to(right_panel.get_top(), DOWN, buff=0.28)
        left_formal = text(
            "Euclidean interpolation",
            size=18,
            color=MUTED,
        ).next_to(left_heading, DOWN, buff=0.1)
        right_formal = text(
            "Riemannian geodesic",
            size=18,
            color=MUTED,
        ).next_to(right_heading, DOWN, buff=0.1)
        self.play(
            FadeIn(left_panel),
            FadeIn(right_panel),
            ShowCreation(divider),
            FadeIn(left_heading),
            FadeIn(right_heading),
            FadeIn(left_formal),
            FadeIn(right_formal),
        )

        t = ValueTracker(0)
        left_center = LEFT * 3.05 + DOWN * 0.28
        right_center = RIGHT * 3.05 + DOWN * 0.28

        def entry_values() -> tuple[float, float]:
            alpha = t.get_value()
            return (
                (1 - alpha) * start[0] + alpha * end[0],
                (1 - alpha) * start[1] + alpha * end[1],
            )

        def geometry_values() -> tuple[float, float]:
            alpha = t.get_value()
            return (
                start[0] ** (1 - alpha) * end[0] ** alpha,
                start[1] ** (1 - alpha) * end[1] ** alpha,
            )

        endpoint_left = VGroup(
            covariance_ellipse(start, color=CYAN, scale=0.92, opacity=0),
            covariance_ellipse(end, color=CORAL, scale=0.92, opacity=0),
        ).move_to(left_center)
        endpoint_right = endpoint_left.copy().move_to(right_center)
        for group in (endpoint_left, endpoint_right):
            group.set_stroke(opacity=0.3, width=2)

        entry_ellipse = always_redraw(
            lambda: covariance_ellipse(
                entry_values(),
                color=CORAL,
                scale=0.92,
                opacity=0.18,
            ).move_to(left_center)
        )
        geometry_ellipse = always_redraw(
            lambda: covariance_ellipse(
                geometry_values(),
                color=VIOLET,
                scale=0.92,
                opacity=0.18,
            ).move_to(right_center)
        )

        entry_area = DecimalNumber(1.0, num_decimal_places=2, color=CORAL)
        geometry_area = DecimalNumber(1.0, num_decimal_places=2, color=CYAN)
        entry_area.add_updater(
            lambda number: number.set_value(
                math.sqrt(np.prod(entry_values()))
            )
        )
        geometry_area.add_updater(
            lambda number: number.set_value(
                math.sqrt(np.prod(geometry_values()))
            )
        )
        entry_area_label = VGroup(
            text("relative area", size=19, color=MUTED),
            entry_area,
            text("×", size=22, color=CORAL),
        ).arrange(RIGHT, buff=0.12).move_to(LEFT * 3.05 + DOWN * 2.45)
        geometry_area_label = VGroup(
            text("relative area", size=19, color=MUTED),
            geometry_area,
            text("×", size=22, color=CYAN),
        ).arrange(RIGHT, buff=0.12).move_to(RIGHT * 3.05 + DOWN * 2.45)

        # The counter changes width as it climbs 0 -> 100, so pin the trailing
        # "%" with an updater that keeps it just right of the live digits — that
        # way it never overlaps the number however many digits it shows.
        progress = DecimalNumber(0, num_decimal_places=0, color=LEMON)
        progress.add_updater(lambda number: number.set_value(100 * t.get_value()))
        position_text = text("position", size=19, color=MUTED)
        percent_text = text("%", size=20, color=LEMON)
        progress_label = VGroup(position_text, progress).arrange(RIGHT, buff=0.18)
        percent_text.next_to(progress, RIGHT, buff=0.12)
        percent_text.add_updater(
            lambda mob: mob.next_to(progress, RIGHT, buff=0.12)
        )
        progress_label.add(percent_text)
        progress_label.to_edge(DOWN, buff=0.28)

        self.play(
            FadeIn(endpoint_left),
            FadeIn(endpoint_right),
            FadeIn(entry_ellipse),
            FadeIn(geometry_ellipse),
            FadeIn(entry_area_label),
            FadeIn(geometry_area_label),
            FadeIn(progress_label),
        )
        self.play(t.animate.set_value(0.5), run_time=3, rate_func=smooth)
        self.wait(0.5)

        midpoint_note = text(
            "At halfway, entry-wise averaging invents extra scale.",
            size=27,
            color=CORAL,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.3)
        self.play(
            FadeOut(progress_label),
            FlashAround(entry_ellipse, color=CORAL, buff=0.18),
            FadeIn(midpoint_note, UP),
        )
        self.wait(1)

        midpoint_note_2 = text(
            "The geodesic changes shape while preserving scale in this example.",
            size=26,
            color=CYAN,
            weight="BOLD",
        ).move_to(midpoint_note)
        self.play(
            FadeTransform(midpoint_note, midpoint_note_2),
            FlashAround(geometry_ellipse, color=CYAN, buff=0.18),
        )
        self.wait(0.8)

        self.play(t.animate.set_value(1), run_time=2.3, rate_func=smooth)
        self.play(t.animate.set_value(0), run_time=2.3, rate_func=smooth)
        self.play(t.animate.set_value(0.5), run_time=1.8, rate_func=smooth)

        dynamic_group = VGroup(
            comparison_title,
            left_panel,
            right_panel,
            divider,
            left_heading,
            right_heading,
            left_formal,
            right_formal,
            endpoint_left,
            endpoint_right,
            entry_ellipse,
            geometry_ellipse,
            entry_area_label,
            geometry_area_label,
            midpoint_note_2,
        )
        conclusion = VGroup(
            text("The path defines distance.", size=38, weight="BOLD"),
            text("Distance defines the class center.", size=38, weight="BOLD"),
            text("The class center affects the BCI prediction.", size=38, weight="BOLD"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        conclusion[0].set_color(CYAN)
        conclusion[1].set_color(VIOLET)
        conclusion[2].set_color(CORAL)
        self.play(FadeOut(dynamic_group), FadeIn(conclusion, UP))
        self.wait(1.7)


class RiemannianMeanGL(Scene):
    """Move a candidate center while its Riemannian objective updates live."""

    def construct(self) -> None:
        self.camera.background_color = NIGHT

        title = text(
            "How do many EEG trials become one class prototype?",
            size=41,
            weight="BOLD",
        ).to_edge(UP, buff=0.42)
        subtitle = text(
            "Each point below is a covariance matrix from the same labeled class.",
            size=22,
            color=MUTED,
        ).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle, UP))

        manifold = Ellipse(width=10.8, height=5.1).set_style(
            fill_color=VIOLET,
            fill_opacity=0.09,
            stroke_color=VIOLET,
            stroke_width=2,
        ).shift(DOWN * 0.35)
        space_name = text(
            "a 2D view of the covariance-matrix space",
            size=18,
            color=MUTED,
        ).next_to(manifold, DOWN, buff=0.12)
        self.play(FadeIn(manifold), FadeIn(space_name))

        log_trials = np.array(
            [
                [math.log(0.25), math.log(4.0)],
                [math.log(0.5), math.log(2.0)],
                [math.log(3.2), math.log(1 / 3.2)],
            ]
        )
        scale = 1.55
        offset = DOWN * 0.35

        def point_from_log(coordinates: np.ndarray) -> np.ndarray:
            return np.array(
                [scale * coordinates[0], scale * coordinates[1], 0]
            ) + offset

        trial_colors = [CYAN, VIOLET, CORAL]
        trial_dots = Group(
            *[
                GlowDot(
                    point_from_log(coordinates),
                    color=color,
                    radius=0.16,
                    glow_factor=2,
                )
                for coordinates, color in zip(log_trials, trial_colors, strict=True)
            ]
        )
        trial_names = VGroup(
            *[
                text(
                    f"feet-imagery trial {index + 1}",
                    size=18,
                    color=color,
                    weight="BOLD",
                ).next_to(dot, UP if index != 1 else DOWN, buff=0.18)
                for index, (dot, color) in enumerate(
                    zip(trial_dots, trial_colors, strict=True)
                )
            ]
        )
        self.play(
            LaggedStartMap(FadeIn, trial_dots, scale=0.4, lag_ratio=0.18),
            LaggedStartMap(FadeIn, trial_names, lag_ratio=0.18),
        )

        arithmetic_matrix = np.mean(
            np.array([[0.25, 4.0], [0.5, 2.0], [3.2, 1 / 3.2]]),
            axis=0,
        )
        arithmetic_log = np.log(arithmetic_matrix)
        riemannian_log = np.mean(log_trials, axis=0)
        candidate_x = ValueTracker(arithmetic_log[0])
        candidate_y = ValueTracker(arithmetic_log[1])

        def candidate_log() -> np.ndarray:
            return np.array([candidate_x.get_value(), candidate_y.get_value()])

        candidate = always_redraw(
            lambda: GlowDot(
                point_from_log(candidate_log()),
                color=LEMON,
                radius=0.2,
                glow_factor=2.5,
            )
        )
        candidate_label = always_redraw(
            lambda: text(
                "candidate center",
                size=20,
                color=LEMON,
                weight="BOLD",
            ).next_to(candidate, RIGHT, buff=0.22)
        )
        distance_lines = always_redraw(
            lambda: VGroup(
                *[
                    Line(
                        candidate.get_center(),
                        dot.get_center(),
                        color=color,
                        stroke_width=3,
                        stroke_opacity=0.72,
                    )
                    for dot, color in zip(trial_dots, trial_colors, strict=True)
                ]
            )
        )

        objective = DecimalNumber(0, num_decimal_places=2, color=LEMON)
        objective.add_updater(
            lambda number: number.set_value(
                np.sum((log_trials - candidate_log()) ** 2)
            )
        )
        objective_label = VGroup(
            text("total squared distance", size=21, color=MUTED),
            objective,
        ).arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.18)

        entry_candidate = text(
            "Start with the entry-wise average.",
            size=26,
            color=CORAL,
            weight="BOLD",
        ).move_to(DOWN * 2.9)
        entry_candidate.set_backstroke(NIGHT, 6)
        self.play(
            FadeIn(candidate),
            FadeIn(candidate_label),
            ShowCreation(distance_lines),
            FadeIn(objective_label),
            FadeIn(entry_candidate, UP),
        )
        self.wait(1)

        minimize = text(
            "Now move the center until this total is as small as possible.",
            size=25,
            color=LEMON,
            weight="BOLD",
        ).move_to(entry_candidate)
        minimize.set_backstroke(NIGHT, 6)
        self.play(
            FadeTransform(entry_candidate, minimize),
            FadeOut(space_name),
        )
        self.play(
            candidate_x.animate.set_value(riemannian_log[0]),
            candidate_y.animate.set_value(riemannian_log[1]),
            run_time=4,
            rate_func=smooth,
        )
        self.play(FlashAround(objective, color=LEMON, buff=0.12))
        self.wait(0.8)

        mean_equation = Tex(
            R"\bar C_R = \arg\min_C \sum_i d_R(C,C_i)^2",
            font_size=42,
            color=CREAM,
        ).to_edge(DOWN, buff=0.32)
        mean_equation.set_color_by_tex(R"\bar C_R", LEMON)
        self.play(
            FadeOut(minimize),
            FadeOut(objective_label),
            FadeIn(mean_equation, UP),
        )
        self.wait(1)

        prototype_label = text(
            "stored feet-imagery prototype",
            size=21,
            color=LEMON,
            weight="BOLD",
        ).move_to(LEFT * 1.35 + DOWN * 1.9)
        prototype_arrow = Arrow(
            prototype_label.get_top(),
            candidate.get_bottom(),
            buff=0.12,
            color=LEMON,
            stroke_width=4,
        )
        self.play(
            FadeOut(candidate_label),
            FadeIn(prototype_label),
            GrowArrow(prototype_arrow),
        )

        new_log = np.array([0.25, 0.48])
        new_trial = GlowDot(
            point_from_log(new_log),
            color=CREAM,
            radius=0.18,
            glow_factor=2,
        )
        new_label = text(
            "new EEG trial",
            size=20,
            color=CREAM,
            weight="BOLD",
        ).next_to(new_trial, UP, buff=0.2)
        comparison_line = always_redraw(
            lambda: Line(
                candidate.get_center(),
                new_trial.get_center(),
                color=CYAN,
                stroke_width=5,
            )
        )
        self.play(FadeIn(new_trial, scale=0.4), FadeIn(new_label))
        self.play(ShowCreation(comparison_line))

        conclusion = text(
            "Repeat for every class. Predict the nearest prototype.",
            size=30,
            color=CYAN,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.35)
        self.play(FadeOut(mean_equation), FadeIn(conclusion, UP))
        self.wait(1.7)


# ---------------------------------------------------------------------------
# Tangent-space lesson (§8) — log map of an SPD neighborhood onto a flat plane.
# The SPD covariance manifold has non-positive curvature, so the exponential
# map *expands* distances: a geodesic between two nearby covariance matrices is
# never shorter than the straight line between their tangent vectors. The gap
# shrinks toward zero as the neighborhood around the reference shrinks — that is
# the precise sense in which "near a reference, the curved space looks flat".
# ---------------------------------------------------------------------------


def _logm_spd(matrix: np.ndarray) -> np.ndarray:
    eigvals, eigvecs = np.linalg.eigh(matrix)
    return (eigvecs * np.log(eigvals)) @ eigvecs.T


def _expm_sym(matrix: np.ndarray) -> np.ndarray:
    eigvals, eigvecs = np.linalg.eigh(matrix)
    return (eigvecs * np.exp(eigvals)) @ eigvecs.T


def _power_spd(matrix: np.ndarray, power: float) -> np.ndarray:
    eigvals, eigvecs = np.linalg.eigh(matrix)
    return (eigvecs * (eigvals ** power)) @ eigvecs.T


def _geodesic_distance(a: np.ndarray, b: np.ndarray) -> float:
    a_inv_half = _power_spd(a, -0.5)
    return float(np.linalg.norm(_logm_spd(a_inv_half @ b @ a_inv_half)))


# Reference covariance and an orthonormal pair of tangent directions: one that
# stretches the ellipse (anisotropy) and one that rotates it (correlation).
_REF = np.array([[1.25, 0.0], [0.0, 0.8]])
_REF_HALF = _power_spd(_REF, 0.5)
_DIR_SHAPE = np.array([[1.0, 0.0], [0.0, -1.0]]) / math.sqrt(2.0)
_DIR_CORR = np.array([[0.0, 1.0], [1.0, 0.0]]) / math.sqrt(2.0)
_N_SAT = 6
_THETAS = [index * TAU / _N_SAT for index in range(_N_SAT)]


def _satellite(scale: float, theta: float) -> np.ndarray:
    """Covariance matrix a geodesic distance ``scale`` from the reference."""
    tangent = scale * (math.cos(theta) * _DIR_SHAPE + math.sin(theta) * _DIR_CORR)
    return _REF_HALF @ _expm_sym(tangent) @ _REF_HALF


def _flat_gap(scale: float) -> float:
    """Straight-line tangent distance between adjacent satellites."""
    return 2.0 * scale * math.sin((TAU / _N_SAT) / 2.0)


def _distortion_pct(scale: float) -> float:
    if scale < 1e-4:
        return 0.0
    points = [_satellite(scale, theta) for theta in _THETAS]
    flat = _flat_gap(scale)
    excess = [
        _geodesic_distance(points[i], points[(i + 1) % _N_SAT]) / flat - 1.0
        for i in range(_N_SAT)
    ]
    return 100.0 * sum(excess) / len(excess)


class TangentProjectionGL(Scene):
    """Flatten a curved covariance neighborhood with the log map and watch the
    flat approximation tighten as the neighborhood shrinks."""

    def construct(self) -> None:
        self.camera.background_color = NIGHT

        title = text(
            "When does a curved covariance space act flat?",
            size=40,
            weight="BOLD",
        ).to_edge(UP, buff=0.42)
        subtitle = text(
            "Each point is a covariance matrix near a reference; the log map "
            "turns it into a vector.",
            size=20,
            color=MUTED,
        ).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle, UP))

        left_center = LEFT * 3.45 + DOWN * 0.35
        right_center = RIGHT * 3.45 + DOWN * 0.35
        screen_k = 1.85  # neighborhood scale -> screen radius

        left_patch = Ellipse(width=4.7, height=4.0).set_style(
            fill_color=VIOLET,
            fill_opacity=0.1,
            stroke_color=VIOLET,
            stroke_width=2.5,
        ).move_to(left_center)
        right_grid = VGroup(
            *[
                Line(
                    right_center + LEFT * 2.3 + UP * offset,
                    right_center + RIGHT * 2.3 + UP * offset,
                    stroke_color=GRID,
                    stroke_width=1,
                    stroke_opacity=0.55,
                )
                for offset in np.linspace(-1.9, 1.9, 7)
            ],
            *[
                Line(
                    right_center + UP * 1.9 + RIGHT * offset,
                    right_center + DOWN * 1.9 + RIGHT * offset,
                    stroke_color=GRID,
                    stroke_width=1,
                    stroke_opacity=0.55,
                )
                for offset in np.linspace(-2.3, 2.3, 9)
            ],
        )
        left_label = text("curved covariance space", size=21, color=CREAM).move_to(
            left_center + UP * 2.35
        )
        right_label = text("flat tangent space", size=21, color=CREAM).move_to(
            right_center + UP * 2.35
        )
        self.play(
            FadeIn(left_patch),
            ShowCreation(right_grid, lag_ratio=0.02),
            FadeIn(left_label),
            FadeIn(right_label),
        )

        scale_tracker = ValueTracker(0.85)

        def left_point(theta: float) -> np.ndarray:
            radius = screen_k * scale_tracker.get_value()
            return left_center + radius * np.array(
                [math.cos(theta), math.sin(theta), 0.0]
            )

        def right_point(theta: float) -> np.ndarray:
            radius = screen_k * scale_tracker.get_value()
            return right_center + radius * np.array(
                [math.cos(theta), math.sin(theta), 0.0]
            )

        reference_left = GlowDot(left_center, color=LEMON, radius=0.17, glow_factor=2.5)
        reference_right = GlowDot(right_center, color=LEMON, radius=0.17, glow_factor=2.5)
        reference_tag = text("reference", size=17, color=LEMON, weight="BOLD").next_to(
            reference_left, DOWN, buff=0.16
        )

        neighborhood = always_redraw(
            lambda: Circle(radius=screen_k * scale_tracker.get_value())
            .move_to(left_center)
            .set_stroke(LEMON, width=1.6, opacity=0.5)
            .set_fill(opacity=0)
        )

        # Curved panel: satellites joined by geodesic arcs that bow outward by the
        # true geodesic excess over the straight chord.
        def curved_group() -> VGroup:
            scale = scale_tracker.get_value()
            points = [_satellite(scale, theta) for theta in _THETAS]
            flat = max(_flat_gap(scale), 1e-6)
            arcs = VGroup()
            for i in range(_N_SAT):
                j = (i + 1) % _N_SAT
                ratio = _geodesic_distance(points[i], points[j]) / flat
                # arc_length / chord = (angle/2) / sin(angle/2); invert for angle.
                bulge = min(2.4 * math.sqrt(max(ratio - 1.0, 0.0)), 1.25)
                arcs.add(
                    ArcBetweenPoints(
                        left_point(_THETAS[i]),
                        left_point(_THETAS[j]),
                        angle=-bulge,
                        stroke_color=VIOLET,
                        stroke_width=4,
                    )
                )
            dots = Group(
                *[GlowDot(left_point(theta), color=CYAN, radius=0.12, glow_factor=1.6)
                  for theta in _THETAS]
            )
            return Group(arcs, dots)

        # Flat panel: the same satellites as honest vectors joined by straight chords.
        def flat_group() -> VGroup:
            spokes = VGroup(
                *[Line(right_center, right_point(theta), stroke_color=GRID,
                       stroke_width=1.5, stroke_opacity=0.7)
                  for theta in _THETAS]
            )
            chords = VGroup(
                *[Line(right_point(_THETAS[i]), right_point(_THETAS[(i + 1) % _N_SAT]),
                       stroke_color=CYAN, stroke_width=4)
                  for i in range(_N_SAT)]
            )
            dots = Group(
                *[GlowDot(right_point(theta), color=CYAN, radius=0.12, glow_factor=1.6)
                  for theta in _THETAS]
            )
            return Group(spokes, chords, dots)

        curved = always_redraw(curved_group)
        flat = always_redraw(flat_group)

        log_arrow = Arrow(
            left_center + RIGHT * 2.45,
            right_center + LEFT * 2.45,
            buff=0.1,
            color=LEMON,
            stroke_width=5,
        )
        log_label = Tex(R"\log_R", font_size=34, color=LEMON).next_to(
            log_arrow, UP, buff=0.12
        )

        self.play(
            FadeIn(reference_left),
            FadeIn(reference_right),
            FadeIn(reference_tag),
            FadeIn(neighborhood),
            FadeIn(curved),
            FadeIn(flat),
            GrowArrow(log_arrow),
            FadeIn(log_label, UP),
        )

        distortion = DecimalNumber(0, num_decimal_places=1, color=LEMON)
        distortion.add_updater(
            lambda number: number.set_value(_distortion_pct(scale_tracker.get_value()))
        )
        distortion_label = VGroup(
            text("shape distortion vs. flat", size=20, color=MUTED),
            distortion,
            text("%", size=20, color=LEMON),
        ).arrange(RIGHT, buff=0.12).to_edge(DOWN, buff=0.28)

        status = always_redraw(
            lambda: text(
                "Far from the reference — the flat map distorts the shape."
                if _distortion_pct(scale_tracker.get_value()) > 4.0
                else "Close to the reference — flat enough for linear models.",
                size=23,
                color=(CORAL if _distortion_pct(scale_tracker.get_value()) > 4.0 else CYAN),
                weight="BOLD",
            ).to_edge(DOWN, buff=0.95)
        )

        self.play(FadeIn(distortion_label), FadeIn(status))
        self.wait(0.6)

        # Shrink the neighborhood: the curved arcs straighten and distortion falls.
        self.play(scale_tracker.animate.set_value(0.2), run_time=3.4, rate_func=smooth)
        self.wait(0.6)
        self.play(FlashAround(distortion, color=LEMON, buff=0.12))
        self.wait(0.4)
        # Widen it again: the geodesic arcs bow out and the flat picture breaks down.
        self.play(scale_tracker.animate.set_value(0.95), run_time=3.0, rate_func=smooth)
        self.wait(0.6)
        self.play(scale_tracker.animate.set_value(0.4), run_time=2.2, rate_func=smooth)
        self.wait(0.4)

        dynamic_group = Group(
            left_patch, right_grid, left_label, right_label,
            reference_left, reference_right, reference_tag, neighborhood,
            curved, flat, log_arrow, log_label, distortion_label, status,
        )
        conclusion = VGroup(
            text("Pick a reference covariance.", size=33, weight="BOLD"),
            text("Log-map nearby trials into one flat space.", size=33, weight="BOLD"),
            text("Feed those vectors to LDA, SVM, or logistic regression.", size=33, weight="BOLD"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        conclusion[0].set_color(LEMON)
        conclusion[1].set_color(CYAN)
        conclusion[2].set_color(VIOLET)
        self.play(FadeOut(dynamic_group), FadeIn(conclusion, UP))
        self.wait(1.8)
