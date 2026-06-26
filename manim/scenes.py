from __future__ import annotations

import numpy as np
from manim import (
    Arrow,
    Circle,
    Create,
    Dot,
    DOWN,
    Ellipse,
    FadeIn,
    FadeOut,
    GrowArrow,
    Indicate,
    LaggedStart,
    LEFT,
    Line,
    MathTex,
    MoveAlongPath,
    ORIGIN,
    ParametricFunction,
    Rectangle,
    RIGHT,
    RoundedRectangle,
    Scene,
    Text,
    Transform,
    UP,
    VGroup,
    Write,
    config,
)

from theme import CORAL, CREAM, CYAN, GRID, LEMON, MUTED, NIGHT, PAPER, VIOLET

config.background_color = NIGHT
FONT = "Avenir Next"


def label(
    text: str,
    *,
    color=CREAM,
    size: int = 28,
    weight: str | None = None,
) -> Text:
    options = {
        "font": FONT,
        "color": color,
        "font_size": size,
    }
    if weight is not None:
        options["weight"] = weight
    return Text(text, **options)


class CurvedSpacesHook(Scene):
    """A polished hook from curved space to practical EEG/BCI decisions."""

    def construct(self) -> None:
        progress = VGroup(
            *[
                Circle(
                    radius=0.055,
                    fill_opacity=1,
                    fill_color=LEMON if index == 0 else GRID,
                    stroke_width=0,
                )
                for index in range(3)
            ]
        ).arrange(RIGHT, buff=0.14).to_corner(UP + RIGHT, buff=0.35)

        title = label(
            "What if the shortest path\nis not a straight line?",
            size=52,
            weight="BOLD",
        ).to_edge(UP, buff=0.45)
        subtitle = label(
            "First choose the space. Then choose how distance works.",
            color=MUTED,
            size=24,
        ).next_to(title, DOWN, buff=0.18)

        self.play(FadeIn(progress), Write(title), FadeIn(subtitle, shift=UP * 0.12))
        self.wait(0.7)
        self.play(FadeOut(title), FadeOut(subtitle))

        flat_panel = RoundedRectangle(
            width=5.7,
            height=4.5,
            corner_radius=0.22,
            stroke_color=GRID,
            stroke_width=1.5,
            fill_color="#292E43",
            fill_opacity=1,
        ).shift(LEFT * 3.05 + DOWN * 0.2)
        curved_panel = flat_panel.copy().shift(RIGHT * 6.1)
        flat_title = label("Flat space", size=25, weight="BOLD").next_to(
            flat_panel, UP, buff=-0.48
        )
        curved_title = label("Curved space", size=25, weight="BOLD").next_to(
            curved_panel, UP, buff=-0.48
        )

        flat_grid = VGroup()
        for x in np.linspace(-2.25, 2.25, 7):
            flat_grid.add(
                Line(
                    [x, -1.45, 0],
                    [x, 1.25, 0],
                    color=GRID,
                    stroke_width=1,
                ).shift(LEFT * 3.05 + DOWN * 0.2)
            )
        for y in np.linspace(-1.25, 1.25, 6):
            flat_grid.add(
                Line(
                    [-2.35, y, 0],
                    [2.35, y, 0],
                    color=GRID,
                    stroke_width=1,
                ).shift(LEFT * 3.05 + DOWN * 0.2)
            )

        curved_grid = VGroup()
        for offset in np.linspace(-1.25, 1.25, 6):
            curved_grid.add(
                ParametricFunction(
                    lambda t, y=offset: np.array(
                        [t, y - 0.72 * np.exp(-0.72 * t**2), 0]
                    ),
                    t_range=[-2.35, 2.35],
                    color=GRID,
                    stroke_width=1,
                ).shift(RIGHT * 3.05 + DOWN * 0.2)
            )
        for x_pos in np.linspace(-2.25, 2.25, 7):
            curved_grid.add(
                ParametricFunction(
                    lambda t, x=x_pos: np.array(
                        [
                            x * (1 - 0.08 * np.exp(-0.7 * t**2)),
                            t - 0.52 * np.exp(-0.75 * x**2) * np.exp(-0.4 * t**2),
                            0,
                        ]
                    ),
                    t_range=[-1.45, 1.25],
                    color=GRID,
                    stroke_width=1,
                ).shift(RIGHT * 3.05 + DOWN * 0.2)
            )

        flat_path = Line(
            LEFT * 5.05 + DOWN * 0.45,
            LEFT * 1.05 + UP * 0.38,
            color=LEMON,
            stroke_width=6,
        )
        curved_path = ParametricFunction(
            lambda t: np.array(
                [t, 0.15 - 0.72 * np.exp(-0.7 * t**2) + 0.16 * t, 0]
            ),
            t_range=[-2.0, 2.0],
            color=LEMON,
            stroke_width=6,
        ).shift(RIGHT * 3.05 + DOWN * 0.2)
        flat_traveler = Dot(flat_path.get_start(), color=CORAL, radius=0.11)
        curved_traveler = Dot(curved_path.get_start(), color=CYAN, radius=0.11)

        self.play(
            FadeIn(flat_panel),
            FadeIn(curved_panel),
            FadeIn(flat_title),
            FadeIn(curved_title),
        )
        self.play(
            LaggedStart(
                *[Create(line) for line in flat_grid],
                lag_ratio=0.025,
                run_time=1.0,
            ),
            LaggedStart(
                *[Create(line) for line in curved_grid],
                lag_ratio=0.025,
                run_time=1.0,
            ),
        )
        self.play(
            Create(flat_path),
            Create(curved_path),
            FadeIn(flat_traveler),
            FadeIn(curved_traveler),
        )
        self.play(
            MoveAlongPath(flat_traveler, flat_path),
            MoveAlongPath(curved_traveler, curved_path),
            run_time=1.7,
        )

        plain_term = label(
            "the straightest possible path",
            color=CREAM,
            size=25,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.42)
        formal_term = label(
            "mathematical name: geodesic",
            color=LEMON,
            size=20,
        ).next_to(plain_term, DOWN, buff=0.08)
        self.play(FadeIn(plain_term, shift=UP * 0.1))
        self.play(FadeIn(formal_term))
        self.wait(0.8)

        first_scene = VGroup(
            flat_panel,
            curved_panel,
            flat_title,
            curved_title,
            flat_grid,
            curved_grid,
            flat_path,
            curved_path,
            flat_traveler,
            curved_traveler,
            plain_term,
            formal_term,
        )
        self.play(FadeOut(first_scene))

        self.play(
            progress[0].animate.set_fill(GRID),
            progress[1].animate.set_fill(LEMON),
        )

        history_title = label(
            "Riemann built the language.\nEinstein used it for gravity.",
            size=38,
            weight="BOLD",
        ).move_to(LEFT * 3.05 + UP * 1.28)
        distance_rule = label(
            "A distance rule decides how\nevery small step is measured.",
            color=MUTED,
            size=21,
        ).next_to(history_title, DOWN, buff=0.25)
        metric_name = label(
            "mathematical name: metric",
            color=LEMON,
            size=21,
        ).next_to(distance_rule, DOWN, buff=0.18)

        well = VGroup()
        for radius in np.linspace(0.45, 2.25, 8):
            ring = Ellipse(
                width=radius * 2.1,
                height=radius * 0.66,
                stroke_color=CYAN,
                stroke_opacity=max(0.16, 0.58 - radius * 0.13),
                stroke_width=2,
            ).shift(RIGHT * 3.25 + DOWN * (0.1 + 0.08 * radius))
            well.add(ring)
        mass = Circle(
            radius=0.34,
            fill_color=CORAL,
            fill_opacity=1,
            stroke_color=LEMON,
            stroke_width=2,
        ).move_to(RIGHT * 3.25 + DOWN * 0.25)
        orbit_path = Ellipse(
            width=4.4,
            height=1.55,
            stroke_color=LEMON,
            stroke_width=4,
        ).move_to(RIGHT * 3.25 + UP * 0.15)
        orbiting_dot = Dot(orbit_path.point_from_proportion(0.55), color=CREAM, radius=0.1)

        self.play(Write(history_title))
        self.play(FadeIn(distance_rule), FadeIn(metric_name))
        self.play(
            LaggedStart(*[Create(ring) for ring in well], lag_ratio=0.08),
            FadeIn(mass),
        )
        self.play(Create(orbit_path), FadeIn(orbiting_dot))
        self.play(MoveAlongPath(orbiting_dot, orbit_path), run_time=2.0)

        bci_question = RoundedRectangle(
            width=7.9,
            height=0.82,
            corner_radius=0.18,
            fill_color="#343A54",
            fill_opacity=1,
            stroke_width=0,
        ).to_edge(DOWN, buff=0.35)
        bci_question_text = label(
            "A BCI needs a distance rule too: which brain state is closest?",
            color=CREAM,
            size=22,
            weight="BOLD",
        ).move_to(bci_question)
        self.play(FadeIn(bci_question), FadeIn(bci_question_text))
        self.wait(1.0)

        second_scene = VGroup(
            history_title,
            distance_rule,
            metric_name,
            well,
            mass,
            orbit_path,
            orbiting_dot,
            bci_question,
            bci_question_text,
        )
        self.play(FadeOut(second_scene))
        self.play(
            progress[1].animate.set_fill(GRID),
            progress[2].animate.set_fill(LEMON),
        )

        data_title = label(
            "Now move from physical space to EEG data space.",
            size=40,
            weight="BOLD",
        ).to_edge(UP, buff=0.55)
        self.play(Write(data_title))

        signals = VGroup()
        for index, color in enumerate((CYAN, CORAL, VIOLET)):
            signal = ParametricFunction(
                lambda t, phase=index * 0.75: np.array(
                    [
                        t,
                        0.15 * np.sin(4.2 * t + phase)
                        + 0.06 * np.sin(9.3 * t - phase),
                        0,
                    ]
                ),
                t_range=[-1.25, 1.25],
                color=color,
                stroke_width=3,
            ).shift(LEFT * 4.55 + UP * (0.55 - 0.48 * index))
            signals.add(signal)
        signal_card = RoundedRectangle(
            width=3.2,
            height=2.65,
            corner_radius=0.2,
            fill_color="#2B3046",
            fill_opacity=1,
            stroke_color=GRID,
            stroke_width=1.2,
        ).move_to(LEFT * 4.55)
        signal_text = label("many EEG channels", size=21, weight="BOLD").next_to(
            signal_card, DOWN, buff=0.16
        )

        matrix_card = RoundedRectangle(
            width=2.7,
            height=2.65,
            corner_radius=0.2,
            fill_color="#2B3046",
            fill_opacity=1,
            stroke_color=GRID,
            stroke_width=1.2,
        )
        matrix_cells = VGroup()
        cell_colors = [
            VIOLET,
            CORAL,
            CYAN,
            CORAL,
            VIOLET,
            CORAL,
            CYAN,
            CORAL,
            VIOLET,
        ]
        for index, color in enumerate(cell_colors):
            cell = Rectangle(
                width=0.38,
                height=0.38,
                fill_color=color,
                fill_opacity=0.35 if index not in (0, 4, 8) else 0.9,
                stroke_width=0,
            )
            matrix_cells.add(cell)
        matrix_cells.arrange_in_grid(rows=3, cols=3, buff=0.08).move_to(matrix_card)
        matrix_plain = label("channel-relationship table", size=20, weight="BOLD").next_to(
            matrix_card, DOWN, buff=0.16
        )
        matrix_name = label(
            "covariance matrix",
            color=LEMON,
            size=17,
        ).next_to(matrix_plain, DOWN, buff=0.06)

        space_card = RoundedRectangle(
            width=4.1,
            height=2.65,
            corner_radius=0.2,
            fill_color="#2B3046",
            fill_opacity=1,
            stroke_color=GRID,
            stroke_width=1.2,
        ).move_to(RIGHT * 4.1)
        space_shape = Ellipse(
            width=3.3,
            height=1.55,
            fill_color=VIOLET,
            fill_opacity=0.16,
            stroke_color=VIOLET,
            stroke_width=2,
        ).move_to(space_card)
        class_left = VGroup(
            Dot(LEFT * 0.28 + UP * 0.12, color=CYAN, radius=0.08),
            Dot(LEFT * 0.5 + DOWN * 0.13, color=CYAN, radius=0.08),
            Dot(LEFT * 0.2 + DOWN * 0.24, color=CYAN, radius=0.08),
        ).shift(RIGHT * 3.8)
        class_right = VGroup(
            Dot(RIGHT * 0.28 + UP * 0.16, color=CORAL, radius=0.08),
            Dot(RIGHT * 0.48 + DOWN * 0.08, color=CORAL, radius=0.08),
            Dot(RIGHT * 0.15 + DOWN * 0.23, color=CORAL, radius=0.08),
        ).shift(RIGHT * 4.45)
        test_point = Dot(RIGHT * 4.12 + DOWN * 0.04, color=LEMON, radius=0.1)
        left_mean = Dot(RIGHT * 3.48 + DOWN * 0.08, color=CYAN, radius=0.13)
        right_mean = Dot(RIGHT * 4.82 + DOWN * 0.04, color=CORAL, radius=0.13)
        left_distance = Line(test_point, left_mean, color=CYAN, stroke_width=3)
        right_distance = Line(test_point, right_mean, color=CORAL, stroke_width=3)
        space_plain = label("curved space of valid tables", size=20, weight="BOLD").next_to(
            space_card, DOWN, buff=0.16
        )
        space_name = label("SPD manifold", color=LEMON, size=17).next_to(
            space_plain, DOWN, buff=0.06
        )

        arrow_one = Arrow(
            signal_card.get_right(),
            matrix_card.get_left(),
            color=LEMON,
            buff=0.2,
        )
        arrow_two = Arrow(
            matrix_card.get_right(),
            space_card.get_left(),
            color=LEMON,
            buff=0.2,
        )

        self.play(FadeIn(signal_card), Create(signals), FadeIn(signal_text))
        self.play(GrowArrow(arrow_one))
        self.play(
            FadeIn(matrix_card),
            LaggedStart(*[FadeIn(cell) for cell in matrix_cells], lag_ratio=0.06),
            FadeIn(matrix_plain),
        )
        self.play(FadeIn(matrix_name))
        self.play(GrowArrow(arrow_two))
        self.play(
            FadeIn(space_card),
            FadeIn(space_shape),
            FadeIn(class_left),
            FadeIn(class_right),
            FadeIn(test_point),
            FadeIn(left_mean),
            FadeIn(right_mean),
            FadeIn(space_plain),
        )
        self.play(FadeIn(space_name))
        self.play(Create(left_distance), Create(right_distance))
        self.play(Indicate(left_distance, color=CYAN), run_time=0.8)

        conclusion_box = RoundedRectangle(
            width=8.0,
            height=0.9,
            corner_radius=0.2,
            fill_color="#343A54",
            fill_opacity=1,
            stroke_color=LEMON,
            stroke_width=1.5,
        ).to_edge(DOWN, buff=0.25)
        conclusion = label(
            "Better distance  →  clearer BCI decisions",
            color=LEMON,
            size=27,
            weight="BOLD",
        ).move_to(conclusion_box)
        self.play(FadeIn(conclusion_box), FadeIn(conclusion, shift=UP * 0.1))
        self.wait(1.5)


class SpacetimeMetric(Scene):
    """A follow-up scene that introduces the metric equation after intuition."""

    def construct(self) -> None:
        plain = label(
            "A distance rule measures each tiny step.",
            size=43,
            weight="BOLD",
        ).to_edge(UP)
        formal = label(
            "Mathematical name: metric",
            color=LEMON,
            size=26,
        ).next_to(plain, DOWN, buff=0.22)
        metric = MathTex(
            r"ds^2 = g_{ij}\,dx^i dx^j",
            color=CREAM,
            font_size=58,
        ).shift(UP * 0.2)
        caption = label(
            "Change the distance rule, and the straightest path can change.",
            color=MUTED,
            size=25,
        ).next_to(metric, DOWN, buff=0.42)
        path_flat = Line(LEFT * 3 + DOWN, RIGHT * 3 + DOWN, color=CYAN, stroke_width=6)
        path_curve = ParametricFunction(
            lambda t: np.array([t, -1 + 0.5 * np.cos(t), 0]),
            t_range=[-3, 3],
            color=CORAL,
            stroke_width=6,
        )

        self.play(Write(plain), FadeIn(formal))
        self.play(Write(metric), FadeIn(caption))
        self.play(Create(path_flat))
        self.play(Transform(path_flat, path_curve))
        self.wait(1.5)


class MDMClassifier(Scene):
    """Class means and a minimum-distance-to-mean BCI decision."""

    def construct(self) -> None:
        title = label(
            "A complete BCI decision in four steps",
            size=44,
            weight="BOLD",
        ).to_edge(UP, buff=0.5)
        subtitle = label(
            "Synthetic two-class example",
            color=MUTED,
            size=22,
        ).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))

        space = Ellipse(
            width=10.5,
            height=4.8,
            fill_color=VIOLET,
            fill_opacity=0.1,
            stroke_color=VIOLET,
            stroke_width=2,
        ).shift(DOWN * 0.35)
        space_label = label(
            "curved space of covariance matrices",
            color=MUTED,
            size=20,
        ).next_to(space, DOWN, buff=0.14)
        self.play(FadeIn(space), FadeIn(space_label))

        left_positions = [
            LEFT * 3.5 + UP * 0.65,
            LEFT * 3.05 + UP * 0.15,
            LEFT * 3.75 + DOWN * 0.25,
            LEFT * 2.65 + DOWN * 0.45,
        ]
        right_positions = [
            RIGHT * 2.75 + UP * 0.5,
            RIGHT * 3.45 + UP * 0.2,
            RIGHT * 2.9 + DOWN * 0.35,
            RIGHT * 3.75 + DOWN * 0.55,
        ]
        left_trials = VGroup(
            *[Dot(position, color=CYAN, radius=0.11) for position in left_positions]
        )
        right_trials = VGroup(
            *[Dot(position, color=CORAL, radius=0.11) for position in right_positions]
        )
        left_name = label("left-hand imagery trials", color=CYAN, size=20).next_to(
            left_trials, UP, buff=0.3
        )
        right_name = label("right-hand imagery trials", color=CORAL, size=20).next_to(
            right_trials, UP, buff=0.3
        )
        step_one = label(
            "1  Each training trial becomes one point",
            color=LEMON,
            size=24,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.45)
        self.play(
            LaggedStart(*[FadeIn(dot) for dot in left_trials], lag_ratio=0.12),
            LaggedStart(*[FadeIn(dot) for dot in right_trials], lag_ratio=0.12),
            FadeIn(left_name),
            FadeIn(right_name),
            FadeIn(step_one),
        )
        self.wait(0.8)

        left_mean = Dot(LEFT * 3.25, color=CYAN, radius=0.2).set_stroke(CREAM, 3)
        right_mean = Dot(RIGHT * 3.2 + DOWN * 0.05, color=CORAL, radius=0.2).set_stroke(
            CREAM, 3
        )
        left_mean_label = label("class mean", color=CYAN, size=19).next_to(
            left_mean, DOWN, buff=0.22
        )
        left_mean_label.add_background_rectangle(color="#1B1E2E", opacity=0.7, buff=0.07)
        right_mean_label = label("class mean", color=CORAL, size=19).next_to(
            right_mean, DOWN, buff=0.22
        )
        right_mean_label.add_background_rectangle(color="#1B1E2E", opacity=0.7, buff=0.07)
        step_two = label(
            "2  Find one curved-space center for each class",
            color=LEMON,
            size=24,
            weight="BOLD",
        ).move_to(step_one)
        self.play(
            Transform(step_one, step_two),
            FadeIn(left_mean, scale=1.5),
            FadeIn(right_mean, scale=1.5),
            FadeIn(left_mean_label),
            FadeIn(right_mean_label),
        )
        self.wait(0.8)

        test_point = Dot(UP * 0.15 + LEFT * 0.15, color=LEMON, radius=0.17).set_stroke(
            CREAM, 3
        )
        test_label = label("new EEG trial", color=LEMON, size=21).next_to(
            test_point, UP, buff=0.25
        )
        step_three = label(
            "3  Measure its distance to both learned centers",
            color=LEMON,
            size=24,
            weight="BOLD",
        ).move_to(step_one)
        self.play(
            Transform(step_one, step_three),
            FadeIn(test_point, scale=1.7),
            FadeIn(test_label),
        )

        left_line = Line(
            test_point.get_center(),
            left_mean.get_center(),
            color=CYAN,
            stroke_width=5,
        )
        right_line = Line(
            test_point.get_center(),
            right_mean.get_center(),
            color=CORAL,
            stroke_width=3,
        )
        left_distance = label("2.9", color=CYAN, size=20).next_to(
            left_line.get_center(), UP, buff=0.1
        )
        right_distance = label("3.4", color=CORAL, size=20).next_to(
            right_line.get_center(), UP, buff=0.1
        )
        self.play(Create(left_line), Create(right_line))
        self.play(FadeIn(left_distance), FadeIn(right_distance))
        self.wait(0.8)

        prediction = RoundedRectangle(
            width=4.7,
            height=0.9,
            corner_radius=0.2,
            fill_color="#314B55",
            fill_opacity=1,
            stroke_color=CYAN,
            stroke_width=2,
        ).to_edge(DOWN, buff=0.3)
        prediction_text = label(
            "Prediction: left-hand imagery",
            color=CREAM,
            size=25,
            weight="BOLD",
        ).move_to(prediction)
        step_four = label(
            "4  Choose the class with the smaller distance",
            color=LEMON,
            size=24,
            weight="BOLD",
        ).move_to(step_one)
        self.play(Transform(step_one, step_four))
        self.play(
            FadeOut(step_one),
            FadeIn(prediction),
            FadeIn(prediction_text),
            Indicate(left_line, color=CYAN),
        )
        self.wait(1.2)

        formal_name = label(
            "Minimum Distance to Mean (MDM)",
            color=LEMON,
            size=27,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.18)
        self.play(
            FadeOut(prediction),
            Transform(prediction_text, formal_name),
        )
        self.wait(1.5)


class CovariancePathLesson(Scene):
    """Why the path between two EEG covariance patterns matters."""

    def construct(self) -> None:
        title = label(
            "What should “halfway” between\ntwo EEG patterns mean?",
            size=38,
            weight="BOLD",
        ).to_edge(UP, buff=0.42)
        subtitle = label(
            "Two real trial summaries · same total variation · different dominant channels",
            color=MUTED,
            size=20,
        ).next_to(title, DOWN, buff=0.14)
        self.play(Write(title), FadeIn(subtitle))

        endpoint_a = Ellipse(
            width=1.1,
            height=3.5,
            fill_color=CYAN,
            fill_opacity=0.16,
            stroke_color=CYAN,
            stroke_width=4,
        ).move_to(LEFT * 4.7 + UP * 0.25)
        endpoint_b = Ellipse(
            width=3.5,
            height=1.1,
            fill_color=CORAL,
            fill_opacity=0.16,
            stroke_color=CORAL,
            stroke_width=4,
        ).move_to(RIGHT * 4.7 + UP * 0.25)
        endpoint_a_name = label(
            "Pattern A\nchannel 2 dominates",
            color=CYAN,
            size=20,
            weight="BOLD",
        ).next_to(endpoint_a, DOWN, buff=0.28)
        endpoint_b_name = label(
            "Pattern B\nchannel 1 dominates",
            color=CORAL,
            size=20,
            weight="BOLD",
        ).next_to(endpoint_b, DOWN, buff=0.28)
        same_size = label(
            "relative area 1.00",
            color=LEMON,
            size=18,
        )
        size_a = same_size.copy().next_to(endpoint_a_name, DOWN, buff=0.12)
        size_b = same_size.copy().next_to(endpoint_b_name, DOWN, buff=0.12)
        self.play(
            FadeIn(endpoint_a, scale=0.8),
            FadeIn(endpoint_b, scale=0.8),
            FadeIn(endpoint_a_name),
            FadeIn(endpoint_b_name),
            FadeIn(size_a),
            FadeIn(size_b),
        )

        question = label(
            "A decoder needs averages and distances.\nWhich route should connect A and B?",
            size=25,
            weight="BOLD",
        ).move_to(UP * 0.35)
        arrow_a = Arrow(
            endpoint_a.get_right(),
            question.get_left() + LEFT * 0.15,
            color=GRID,
            buff=0.18,
        )
        arrow_b = Arrow(
            endpoint_b.get_left(),
            question.get_right() + RIGHT * 0.15,
            color=GRID,
            buff=0.18,
        )
        self.play(GrowArrow(arrow_a), GrowArrow(arrow_b), FadeIn(question))
        self.wait(0.8)

        first_group = VGroup(
            endpoint_a,
            endpoint_b,
            endpoint_a_name,
            endpoint_b_name,
            size_a,
            size_b,
            question,
            arrow_a,
            arrow_b,
        )
        self.play(FadeOut(first_group), FadeOut(title), FadeOut(subtitle))

        flat_panel = RoundedRectangle(
            width=5.7,
            height=4.6,
            corner_radius=0.22,
            fill_color="#2B3046",
            fill_opacity=1,
            stroke_color=GRID,
            stroke_width=1.2,
        ).shift(LEFT * 3.05 + DOWN * 0.2)
        geometry_panel = flat_panel.copy().shift(RIGHT * 6.1)
        flat_name = label(
            "Average matrix entries",
            color=CORAL,
            size=23,
            weight="BOLD",
        ).next_to(flat_panel, UP, buff=-0.48)
        geometry_name = label(
            "Follow covariance geometry",
            color=VIOLET,
            size=23,
            weight="BOLD",
        ).next_to(geometry_panel, UP, buff=-0.48)
        flat_formal = label(
            "Euclidean interpolation",
            color=MUTED,
            size=17,
        ).next_to(flat_name, DOWN, buff=0.08)
        geometry_formal = label(
            "Riemannian geodesic",
            color=MUTED,
            size=17,
        ).next_to(geometry_name, DOWN, buff=0.08)

        endpoint_outline_a = Ellipse(
            width=0.85,
            height=3.15,
            stroke_color=CYAN,
            stroke_opacity=0.42,
            stroke_width=2,
        )
        endpoint_outline_b = Ellipse(
            width=3.15,
            height=0.85,
            stroke_color=CORAL,
            stroke_opacity=0.42,
            stroke_width=2,
        )
        flat_outlines = VGroup(
            endpoint_outline_a.copy(),
            endpoint_outline_b.copy(),
        ).move_to(flat_panel.get_center() + DOWN * 0.05)
        geometry_outlines = VGroup(
            endpoint_outline_a.copy(),
            endpoint_outline_b.copy(),
        ).move_to(geometry_panel.get_center() + DOWN * 0.05)
        flat_midpoint = Ellipse(
            width=2.75,
            height=2.75,
            fill_color=CORAL,
            fill_opacity=0.18,
            stroke_color=CORAL,
            stroke_width=5,
        ).move_to(flat_panel.get_center() + DOWN * 0.05)
        geometry_midpoint = Ellipse(
            width=1.72,
            height=1.72,
            fill_color=VIOLET,
            fill_opacity=0.18,
            stroke_color=VIOLET,
            stroke_width=5,
        ).move_to(geometry_panel.get_center() + DOWN * 0.05)

        self.play(
            FadeIn(flat_panel),
            FadeIn(geometry_panel),
            FadeIn(flat_name),
            FadeIn(geometry_name),
            FadeIn(flat_formal),
            FadeIn(geometry_formal),
            FadeIn(flat_outlines),
            FadeIn(geometry_outlines),
        )
        self.play(
            FadeIn(flat_midpoint, scale=0.4),
            FadeIn(geometry_midpoint, scale=0.4),
            run_time=1.2,
        )

        flat_readout = label(
            "halfway area 2.13×\nvalid, but enlarged",
            color=CORAL,
            size=22,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.52).shift(LEFT * 3.05)
        geometry_readout = label(
            "halfway area 1.00×\nshape changes, scale does not",
            color=CYAN,
            size=22,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.52).shift(RIGHT * 3.05)
        self.play(FadeIn(flat_readout), FadeIn(geometry_readout))
        self.play(Indicate(flat_midpoint, color=CORAL), run_time=0.8)
        self.play(Indicate(geometry_midpoint, color=CYAN), run_time=0.8)
        self.wait(0.8)

        comparison = VGroup(
            flat_panel,
            geometry_panel,
            flat_name,
            geometry_name,
            flat_formal,
            geometry_formal,
            flat_outlines,
            geometry_outlines,
            flat_midpoint,
            geometry_midpoint,
            flat_readout,
            geometry_readout,
        )
        self.play(FadeOut(comparison))

        conclusion = label(
            "The route defines distance.\nDistance defines the class center.\nThe class center affects the prediction.",
            size=36,
            weight="BOLD",
        ).move_to(UP * 0.45)
        chain = VGroup(
            label("path", color=CYAN, size=24, weight="BOLD"),
            label("→", color=LEMON, size=30),
            label("distance", color=CYAN, size=24, weight="BOLD"),
            label("→", color=LEMON, size=30),
            label("prototype", color=VIOLET, size=24, weight="BOLD"),
            label("→", color=LEMON, size=30),
            label("BCI label", color=CORAL, size=24, weight="BOLD"),
        ).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.75)
        self.play(Write(conclusion))
        self.play(LaggedStart(*[FadeIn(item) for item in chain], lag_ratio=0.12))
        self.wait(1.5)


class RiemannianMeanLesson(Scene):
    """How several training trials become one class prototype."""

    def construct(self) -> None:
        title = label(
            "Many EEG trials → one class prototype",
            size=44,
            weight="BOLD",
        ).to_edge(UP, buff=0.45)
        subtitle = label(
            "Each point is already a covariance summary of one labeled trial.",
            color=MUTED,
            size=21,
        ).next_to(title, DOWN, buff=0.14)
        self.play(Write(title), FadeIn(subtitle))

        space = Ellipse(
            width=10.3,
            height=4.5,
            fill_color=VIOLET,
            fill_opacity=0.09,
            stroke_color=VIOLET,
            stroke_width=2,
        ).shift(DOWN * 0.35)
        trials = VGroup(
            Dot(LEFT * 3.6 + UP * 0.35, color=CYAN, radius=0.13),
            Dot(LEFT * 2.25 + DOWN * 0.8, color=VIOLET, radius=0.13),
            Dot(RIGHT * 2.55 + UP * 0.75, color=CORAL, radius=0.13),
        )
        trial_labels = VGroup(
            label("trial 1", color=CYAN, size=18).next_to(trials[0], UP, buff=0.18),
            label("trial 2", color=VIOLET, size=18).next_to(trials[1], DOWN, buff=0.18),
            label("trial 3", color=CORAL, size=18).next_to(trials[2], UP, buff=0.18),
        )
        class_name = label(
            "all labeled: feet imagery",
            color=LEMON,
            size=21,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(space))
        self.play(
            LaggedStart(*[FadeIn(point, scale=1.6) for point in trials], lag_ratio=0.18),
            LaggedStart(*[FadeIn(name) for name in trial_labels], lag_ratio=0.18),
            FadeIn(class_name),
        )
        self.wait(0.7)

        arithmetic = Dot(LEFT * 0.3 + UP * 0.55, color=CORAL, radius=0.18).set_stroke(
            CREAM, 3
        )
        riemannian = Dot(LEFT * 0.65 + DOWN * 0.05, color=LEMON, radius=0.2).set_stroke(
            CREAM, 3
        )
        arithmetic_name = label(
            "entry-wise candidate",
            color=CORAL,
            size=18,
        ).next_to(arithmetic, UP, buff=0.2)
        riemannian_name = label(
            "distance-minimizing candidate",
            color=LEMON,
            size=18,
        ).next_to(riemannian, DOWN, buff=0.2)
        self.play(
            FadeOut(class_name),
            FadeIn(arithmetic, scale=1.5),
            FadeIn(riemannian, scale=1.5),
            FadeIn(arithmetic_name),
            FadeIn(riemannian_name),
        )

        arithmetic_lines = VGroup(
            *[
                Line(arithmetic.get_center(), point.get_center(), color=CORAL, stroke_width=2)
                for point in trials
            ]
        )
        riemannian_lines = VGroup(
            *[
                Line(riemannian.get_center(), point.get_center(), color=LEMON, stroke_width=3)
                for point in trials
            ]
        )
        objective = label(
            "Add the squared Riemannian distances to every training trial.",
            size=24,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.38)
        self.play(Create(arithmetic_lines), FadeIn(objective))
        arithmetic_score = label(
            "higher total distance²",
            color=CORAL,
            size=22,
            weight="BOLD",
        ).to_edge(RIGHT, buff=0.55).shift(DOWN * 1.6)
        self.play(FadeIn(arithmetic_score))
        self.play(FadeOut(arithmetic_lines), Create(riemannian_lines))
        riemannian_score = label(
            "lowest total distance²",
            color=LEMON,
            size=22,
            weight="BOLD",
        ).next_to(arithmetic_score, UP, buff=0.18)
        self.play(FadeIn(riemannian_score))
        self.play(Indicate(riemannian, color=LEMON))
        self.wait(0.7)

        self.play(
            FadeOut(arithmetic),
            FadeOut(arithmetic_name),
            FadeOut(arithmetic_score),
            FadeOut(riemannian_score),
            FadeOut(riemannian_lines),
            FadeOut(objective),
        )
        prototype_label = label(
            "stored class prototype",
            color=LEMON,
            size=22,
            weight="BOLD",
        ).next_to(riemannian, DOWN, buff=0.24)
        self.play(Transform(riemannian_name, prototype_label))

        new_trial = Dot(RIGHT * 3.5 + DOWN * 0.7, color=CREAM, radius=0.17).set_stroke(
            CYAN, 3
        )
        new_name = label("new EEG trial", color=CREAM, size=21).next_to(
            new_trial, DOWN, buff=0.2
        )
        distance_line = Line(
            new_trial.get_center(),
            riemannian.get_center(),
            color=CYAN,
            stroke_width=5,
        )
        prediction_note = label(
            "During MDM classification,\nmeasure the new trial to every class prototype.",
            color=CREAM,
            size=27,
            weight="BOLD",
        ).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(new_trial, scale=1.6), FadeIn(new_name))
        self.play(Create(distance_line))
        self.play(FadeIn(prediction_note))
        self.wait(1.5)
