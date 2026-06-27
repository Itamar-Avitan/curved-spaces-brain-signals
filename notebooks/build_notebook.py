"""Build the educational Riemannian EEG notebook.

The notebook is generated from this file so its narrative and code cells remain
reviewable in source control. Execute the generated notebook separately to
embed figures and numerical results.
"""

from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from textwrap import dedent

import nbformat as nbf


NOTEBOOK_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = NOTEBOOK_DIR / "01_riemannian_eeg_motor_imagery.ipynb"
COLAB_OUTPUT_PATH = NOTEBOOK_DIR / "01_riemannian_eeg_motor_imagery_colab.ipynb"
UTILS_PATH = NOTEBOOK_DIR / "riemannian_eeg_utils.py"
UTILS_SOURCE = UTILS_PATH.read_text(encoding="utf-8")


def markdown(source: str) -> nbf.NotebookNode:
    return nbf.v4.new_markdown_cell(dedent(source).strip())


def code(source: str) -> nbf.NotebookNode:
    return nbf.v4.new_code_cell(dedent(source).strip())


cells = [
    markdown(
        r"""
        # Riemannian geometry for EEG BCI

        ## From brain signals to decisions, one concept at a time

        This notebook turns the ideas from the theory webpage into a complete,
        reproducible motor-imagery BCI example. Allow about 30–45 minutes to
        read and run it. You can execute each section in order; every code cell
        starts with its purpose, and every figure ends with one takeaway.

        We will compare three complete ways to classify a short EEG trial:

        1. **CSP + LDA** — a strong, classical motor-imagery baseline.
        2. **Riemannian MDM** — compare each covariance matrix with the average
           matrix of each class.
        3. **Tangent space + logistic regression** — temporarily map the curved
           covariance space to ordinary coordinates, then use a standard
           classifier.

        We will also add one deliberately plain diagnostic baseline: a
        **Euclidean covariance nearest-mean** classifier. It uses covariance
        matrices, but it ignores the curved SPD geometry. That contrast makes
        the advantage of the Riemannian distance visible rather than rhetorical.

        The goal is not to prove that one method always wins. The goal is to
        understand what the geometric representation adds, when it helps, and
        how to use it without data leakage.
        """
    ),
    markdown(
        r"""
        ## What you should be able to explain afterward

        - What an EEG trial, channel, and motor-imagery cue mean.
        - Why a covariance matrix is a useful summary of a multichannel trial.
        - Why valid covariance matrices do not fill an ordinary flat space.
        - How the Riemannian distance turns eigenvalue ratios into a
          scale-aware distance.
        - How minimum distance to mean (MDM) makes a prediction.
        - What a tangent-space representation is used for.
        - How to separate "covariance helped" from "Riemannian geometry helped."
        - Why complete recording runs must be held out during validation.
        - Why a method can be useful even when its final accuracy ties a
          classical baseline.

        > **Vocabulary rule used here:** each technical term is defined before
        > it becomes part of the workflow.
        """
    ),
    markdown(
        r"""
        ## The dataset: imagined movement recorded with EEG

        We use the open **PhysioNet EEG Motor Movement/Imagery Dataset** through
        MNE-Python.

        - **EEG channel:** one voltage measurement location on the scalp.
        - **Trial:** a short recording aligned to one instruction.
        - **Motor imagery:** imagining a movement without physically performing
          it.
        - **Class:** the instruction we want the computer to identify.

        The selected runs ask one participant to imagine moving both hands or
        both feet. The original recordings contain 64 channels sampled at
        160 Hz. We retain 17 channels over the motor cortex to keep every figure
        readable.

        This is a teaching dataset, not a clinical benchmark. The default
        download is about 7.4 MB and contains only one participant.

        **Why use MNE's direct loader here?** It keeps this first run small and
        depends only on the analysis stack used later. EEGDash offers a
        BIDS-first catalogue and loader for scaling to other datasets; an
        optional, tested discovery snippet appears in the final section.
        """
    ),
    markdown(
        """
        ## Environment setup

        Run the next two cells once before the imports.

        - In **Google Colab**, they install the missing analysis packages and
          create the helper module inside the runtime.
        - In the local `rnd_env` environment, they usually report that
          everything is already available and keep using the tracked helper file.

        This makes the notebook self-contained when opened from Drive/Colab
        while preserving the reproducible local `rnd_env` workflow.
        """
    ),
    code(
        """
        import importlib.util
        import subprocess
        import sys

        requirements = {
            "mne": "mne==1.12.1",
            "pyriemann": "pyriemann==0.10",
            "sklearn": "scikit-learn>=1.7",
            "pandas": "pandas>=2.2",
            "seaborn": "seaborn>=0.13",
        }
        missing = [
            package
            for module, package in requirements.items()
            if importlib.util.find_spec(module) is None
        ]
        if missing:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", "--quiet", *missing]
            )
            print("Installed:", ", ".join(missing))
        else:
            print("All required analysis packages are already available.")
        """
    ),
    code(
        f"""
        from pathlib import Path
        import sys

        candidate_paths = [
            Path.cwd() / "riemannian_eeg_utils.py",
            Path.cwd() / "notebooks" / "riemannian_eeg_utils.py",
        ]
        helper_path = next((path for path in candidate_paths if path.exists()), candidate_paths[0])
        if helper_path.exists():
            print(f"Using helper module at {{helper_path}}")
        else:
            helper_path.write_text({UTILS_SOURCE!r}, encoding="utf-8")
            print(f"Created helper module at {{helper_path}}")

        sys.path.insert(0, str(helper_path.parent))
        """
    ),
    code(
        """
        from pathlib import Path
        import sys

        import matplotlib.pyplot as plt
        import mne
        import numpy as np
        import pandas as pd
        import pyriemann
        import seaborn as sns
        import sklearn
        from IPython.display import Markdown, display
        from matplotlib.patches import Ellipse
        from pyriemann.estimation import Covariances
        from pyriemann.tangentspace import TangentSpace
        from pyriemann.utils.distance import distance_riemann
        from pyriemann.utils.geodesic import geodesic_riemann
        from pyriemann.utils.mean import mean_riemann
        from scipy.signal import welch
        from sklearn.decomposition import PCA
        from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix
        from sklearn.model_selection import LeaveOneGroupOut

        # Work whether Jupyter starts in the project root or notebooks folder.
        NOTEBOOK_DIR = Path.cwd()
        if not (NOTEBOOK_DIR / "riemannian_eeg_utils.py").exists():
            NOTEBOOK_DIR = Path.cwd() / "notebooks"
        if NOTEBOOK_DIR.name == "notebooks":
            PROJECT_ROOT = NOTEBOOK_DIR.parent
        else:
            # Colab usually runs from /content with the helper module created
            # in the current directory; keep data/figures under that writable
            # workspace instead of resolving to /data.
            PROJECT_ROOT = NOTEBOOK_DIR
        DATA_PATH = PROJECT_ROOT / "data" / "mne"
        FIGURE_PATH = NOTEBOOK_DIR / "figures"
        FIGURE_PATH.mkdir(parents=True, exist_ok=True)
        sys.path.insert(0, str(NOTEBOOK_DIR))

        from riemannian_eeg_utils import (
            CLASS_NAMES,
            build_geometry_contrast_pipelines,
            build_pipelines,
            evaluate_leave_one_group_out,
            evaluate_low_data_regime,
            load_motor_imagery,
        )

        mne.set_log_level("ERROR")
        sns.set_theme(
            context="notebook",
            style="whitegrid",
            palette=["#5b47f5", "#e75e9b", "#18a999"],
        )
        plt.rcParams.update(
            {
                "figure.figsize": (9, 5),
                "figure.dpi": 110,
                "axes.titleweight": "bold",
                "axes.spines.top": False,
                "axes.spines.right": False,
            }
        )

        versions = pd.Series(
            {
                "MNE": mne.__version__,
                "pyRiemann": pyriemann.__version__,
                "scikit-learn": sklearn.__version__,
                "NumPy": np.__version__,
            },
            name="version",
        )
        display(versions.to_frame())
        """
    ),
    markdown(
        r"""
        ## 0. A visible two-channel example

        Before loading real EEG, reproduce the two website lessons with matrices
        small enough to draw.

        Pattern A and Pattern B are covariance summaries of two hypothetical
        trials. Both have the same determinant and therefore the same relative
        ellipse area, but different channels dominate.

        The decoder needs operations between these observed patterns:

        - a **path** defines what intermediate matrices mean;
        - the path length defines **distance**;
        - distance defines the **center** of a set of training matrices;
        - class centers are used by MDM to predict a new trial.
        """
    ),
    code(
        """
        toy_a = np.diag([0.25, 4.0])
        toy_b = np.diag([4.0, 0.25])
        entry_midpoint = 0.5 * (toy_a + toy_b)
        riemannian_midpoint = geodesic_riemann(toy_a, toy_b, alpha=0.5)


        def draw_covariance_ellipse(axis, covariance, title, color):
            eigenvalues, eigenvectors = np.linalg.eigh(covariance)
            order = np.argsort(eigenvalues)[::-1]
            eigenvalues = eigenvalues[order]
            eigenvectors = eigenvectors[:, order]
            angle = np.degrees(np.arctan2(eigenvectors[1, 0], eigenvectors[0, 0]))
            ellipse = Ellipse(
                (0, 0),
                width=2 * np.sqrt(eigenvalues[0]),
                height=2 * np.sqrt(eigenvalues[1]),
                angle=angle,
                facecolor=f"{color}22",
                edgecolor=color,
                linewidth=3,
            )
            axis.add_patch(ellipse)
            axis.axhline(0, color="#d7d9e2", linewidth=0.8)
            axis.axvline(0, color="#d7d9e2", linewidth=0.8)
            axis.set(xlim=(-2.4, 2.4), ylim=(-2.4, 2.4), aspect="equal", title=title)
            axis.text(
                0,
                -2.15,
                f"relative area = {np.sqrt(np.linalg.det(covariance)):.2f}",
                ha="center",
                color="#5f6677",
            )


        fig, axes = plt.subplots(1, 4, figsize=(14, 3.8))
        examples = [
            (toy_a, "Observed pattern A", "#1ca9a0"),
            (entry_midpoint, "Entry-wise halfway", "#ef6b5b"),
            (riemannian_midpoint, "Riemannian halfway", "#6c4eb9"),
            (toy_b, "Observed pattern B", "#e75e9b"),
        ]
        for axis, (matrix, title, color) in zip(axes, examples, strict=True):
            draw_covariance_ellipse(axis, matrix, title, color)
        fig.suptitle("The path changes what the decoder considers halfway")
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the entry-wise midpoint invents scale in "
            "this example, while the Riemannian midpoint preserves the "
            "endpoints' relative area."
        ))

        assert np.isclose(np.sqrt(np.linalg.det(toy_a)), 1.0)
        assert np.sqrt(np.linalg.det(entry_midpoint)) > 2.0
        assert np.isclose(np.sqrt(np.linalg.det(riemannian_midpoint)), 1.0)
        """
    ),
    markdown(
        r"""
        ### The geometry in one equation

        For two SPD covariance matrices \(C_1\) and \(C_2\), the
        affine-invariant Riemannian distance used by pyRiemann is

        \[
        d_R(C_1,C_2) =
        \left\|\log\left(C_1^{-1/2}C_2C_1^{-1/2}\right)\right\|_F.
        \]

        Read this as three operations:

        1. use \(C_1^{-1/2}\) to express \(C_2\) relative to \(C_1\);
        2. take eigenvalue ratios of that relative transformation;
        3. measure the size of their logarithms.

        So the geometry compares **multiplicative changes in variance**, not raw
        entry differences. That matters for EEG because covariance scale can
        change with electrodes, referencing, sessions, or user state.
        """
    ),
    code(
        """
        def matrix_inverse_sqrt(matrix):
            eigenvalues, eigenvectors = np.linalg.eigh(matrix)
            return eigenvectors @ np.diag(1 / np.sqrt(eigenvalues)) @ eigenvectors.T


        relative_transform = (
            matrix_inverse_sqrt(toy_a) @ toy_b @ matrix_inverse_sqrt(toy_a)
        )
        relative_eigenvalues = np.linalg.eigvalsh(relative_transform)

        distance_breakdown = pd.DataFrame(
            {
                "quantity": [
                    "relative eigenvalue 1",
                    "relative eigenvalue 2",
                    "log relative eigenvalue 1",
                    "log relative eigenvalue 2",
                    "Euclidean Frobenius distance",
                    "Riemannian distance",
                ],
                "value": [
                    relative_eigenvalues[0],
                    relative_eigenvalues[1],
                    np.log(relative_eigenvalues[0]),
                    np.log(relative_eigenvalues[1]),
                    np.linalg.norm(toy_a - toy_b, ord="fro"),
                    distance_riemann(toy_a, toy_b),
                ],
            }
        )
        display(distance_breakdown.style.format({"value": "{:.3f}"}))

        t_values = np.linspace(0, 1, 9)
        path_determinants = pd.DataFrame(
            {
                "path position": t_values,
                "entry-wise determinant": [
                    np.linalg.det((1 - t) * toy_a + t * toy_b) for t in t_values
                ],
                "Riemannian determinant": [
                    np.linalg.det(geodesic_riemann(toy_a, toy_b, alpha=t))
                    for t in t_values
                ],
            }
        )

        fig, axis = plt.subplots(figsize=(8, 4.5))
        sns.lineplot(
            data=path_determinants.melt(
                id_vars="path position",
                var_name="path",
                value_name="determinant",
            ),
            x="path position",
            y="determinant",
            hue="path",
            marker="o",
            ax=axis,
        )
        axis.set(
            xlabel="Position from pattern A to pattern B",
            ylabel="determinant",
            title="The Riemannian path avoids artificial determinant swelling",
        )
        axis.legend(frameon=False)
        fig.tight_layout()
        plt.show()

        channel_gain = np.diag([3.0, 0.4])
        rescaled_a = channel_gain @ toy_a @ channel_gain.T
        rescaled_b = channel_gain @ toy_b @ channel_gain.T
        invariance_check = pd.DataFrame(
            {
                "distance": ["Euclidean Frobenius", "Riemannian"],
                "before channel rescaling": [
                    np.linalg.norm(toy_a - toy_b, ord="fro"),
                    distance_riemann(toy_a, toy_b),
                ],
                "after channel rescaling": [
                    np.linalg.norm(rescaled_a - rescaled_b, ord="fro"),
                    distance_riemann(rescaled_a, rescaled_b),
                ],
            }
        )
        invariance_check["absolute change"] = (
            invariance_check["after channel rescaling"]
            - invariance_check["before channel rescaling"]
        ).abs()
        display(invariance_check.style.format({
            "before channel rescaling": "{:.3f}",
            "after channel rescaling": "{:.3f}",
            "absolute change": "{:.3f}",
        }))
        display(Markdown(
            "> **Math takeaway:** the Riemannian distance is unchanged by this "
            "invertible channel rescaling, while the raw Euclidean matrix "
            "distance changes substantially. This is one reason the geometry "
            "is better matched to covariance matrices."
        ))

        assert np.isclose(
            distance_riemann(toy_a, toy_b),
            distance_riemann(rescaled_a, rescaled_b),
        )
        """
    ),
    markdown(
        r"""
        The entry-wise midpoint is still a valid positive-definite covariance
        matrix. The issue is not validity: its scale has grown beyond both
        endpoints. This is the **swelling effect**.

        Now use the same Riemannian distance to define a class center. The
        Riemannian mean is the candidate with the smallest sum of squared
        Riemannian distances to all training matrices.
        """
    ),
    code(
        """
        toy_trials = np.stack(
            [
                np.diag([0.25, 4.0]),
                np.diag([0.5, 2.0]),
                np.diag([3.2, 1 / 3.2]),
            ]
        )
        arithmetic_center = toy_trials.mean(axis=0)
        riemannian_center = mean_riemann(toy_trials)


        def total_squared_riemannian_distance(center, matrices):
            return sum(distance_riemann(center, matrix) ** 2 for matrix in matrices)


        center_comparison = pd.DataFrame(
            {
                "candidate": ["Arithmetic center", "Riemannian center"],
                "relative ellipse area": [
                    np.sqrt(np.linalg.det(arithmetic_center)),
                    np.sqrt(np.linalg.det(riemannian_center)),
                ],
                "total squared Riemannian distance": [
                    total_squared_riemannian_distance(arithmetic_center, toy_trials),
                    total_squared_riemannian_distance(riemannian_center, toy_trials),
                ],
            }
        )
        display(center_comparison.style.format(
            {
                "relative ellipse area": "{:.3f}",
                "total squared Riemannian distance": "{:.3f}",
            }
        ))

        fig, axes = plt.subplots(1, 2, figsize=(8, 3.8))
        draw_covariance_ellipse(
            axes[0], arithmetic_center, "Arithmetic candidate", "#ef6b5b"
        )
        draw_covariance_ellipse(
            axes[1], riemannian_center, "Stored Riemannian prototype", "#6c4eb9"
        )
        fig.suptitle("One labeled class, two candidate centers")
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the stored prototype is the valid matrix "
            "that best centers these trials under the same curved-space "
            "distance used for prediction."
        ))

        assert (
            total_squared_riemannian_distance(riemannian_center, toy_trials)
            <= total_squared_riemannian_distance(arithmetic_center, toy_trials)
        )
        """
    ),
    markdown(
        r"""
        ## 1. Load and prepare the trials

        The preprocessing choices are intentionally simple:

        - **Band-pass filter, 8–30 Hz:** keep frequencies that include the
          alpha/mu and beta rhythms commonly used in motor-imagery BCI.
        - **Average reference:** express each channel relative to the average
          scalp voltage.
        - **Epoch from 1 to 3 seconds after the cue:** avoid the immediate cue
          response and analyze the sustained imagery period.

        A *recording run* is one continuous experiment block. We preserve its
        identity so an entire run can later be held out for testing.
        """
    ),
    code(
        """
        SUBJECTS = (1,)
        RUNS = (6, 10, 14)

        dataset = load_motor_imagery(
            subjects=SUBJECTS,
            runs=RUNS,
            data_path=DATA_PATH,
            l_freq=8.0,
            h_freq=30.0,
            tmin=1.0,
            tmax=3.0,
        )

        summary = pd.Series(
            {
                "participants": dataset.metadata["subject"].nunique(),
                "recording runs": dataset.metadata[["subject", "run"]]
                .drop_duplicates()
                .shape[0],
                "trials": len(dataset.y),
                "channels": len(dataset.channel_names),
                "samples per trial": dataset.X.shape[-1],
                "sampling frequency (Hz)": dataset.sfreq,
                "hands trials": int(np.sum(dataset.y == 0)),
                "feet trials": int(np.sum(dataset.y == 1)),
            },
            name="value",
        )
        display(summary.to_frame())
        display(dataset.metadata.groupby(["run", "condition"]).size().unstack())
        """
    ),
    code(
        """
        # Reproducibility and leakage checks. These fail loudly if the data
        # layout or grouped validation assumptions are broken.
        assert dataset.X.ndim == 3
        assert dataset.X.shape[0] == len(dataset.y) == len(dataset.groups)
        assert dataset.X.shape[1] == len(dataset.channel_names)
        assert np.isfinite(dataset.X).all()
        assert set(np.unique(dataset.y)) == {0, 1}

        splitter = LeaveOneGroupOut()
        for train_indices, test_indices in splitter.split(
            dataset.X, dataset.y, dataset.groups
        ):
            train_groups = set(dataset.groups[train_indices])
            test_groups = set(dataset.groups[test_indices])
            assert train_groups.isdisjoint(test_groups)

        print("Checks passed: expected shapes, finite data, and disjoint run groups.")
        """
    ),
    markdown(
        r"""
        ### Where are the selected channels?

        The dots below are EEG electrodes viewed from above the head. We focus
        on frontal-central, central, and central-parietal locations because they
        cover the left, middle, and right motor regions.
        """
    ),
    code(
        """
        fig = mne.viz.plot_sensors(
            dataset.epochs.info,
            kind="topomap",
            show_names=True,
            show=False,
        )
        fig.set_size_inches(7, 6)
        fig.suptitle("The 17 EEG channels used in this notebook", fontweight="bold")
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the selected electrodes cover the motor "
            "regions while keeping the covariance matrix small enough to inspect."
        ))
        """
    ),
    markdown(
        r"""
        ### A trial is a matrix, not a single waveform

        Each trial has one row per channel and one column per time sample. The
        plot shows class-average voltage at three central electrodes. It is
        useful context, but a classifier needs a stable way to combine all
        channels rather than relying on one visibly dramatic waveform.
        """
    ),
    code(
        """
        central_channels = ["C3", "Cz", "C4"]
        central_indices = [dataset.channel_names.index(ch) for ch in central_channels]
        times = dataset.epochs.times

        fig, axes = plt.subplots(1, 3, figsize=(13, 3.7), sharey=True)
        for axis, channel, channel_index in zip(
            axes, central_channels, central_indices, strict=True
        ):
            for class_id, class_name in enumerate(CLASS_NAMES):
                average = dataset.X[dataset.y == class_id, channel_index].mean(axis=0)
                axis.plot(times, average * 1e6, label=class_name.title(), linewidth=2)
            axis.axhline(0, color="#777", linewidth=0.8)
            axis.set_title(channel)
            axis.set_xlabel("Time after cue (s)")
        axes[0].set_ylabel("Average voltage (µV)")
        axes[-1].legend(frameon=False)
        fig.suptitle("Class-average EEG is subtle and varies across channels")
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** no single waveform cleanly separates the "
            "classes, which motivates summarizing relationships across channels."
        ))
        """
    ),
    markdown(
        r"""
        ### Check the frequency content

        **Power spectral density (PSD)** estimates how much signal power lies at
        each frequency. Because we already filtered the data to 8–30 Hz, the
        following plot describes the motor-rhythm band used by the classifiers.
        It is a descriptive check, not a separate model input.
        """
    ),
    code(
        """
        frequencies, power = welch(
            dataset.X[:, central_indices, :],
            fs=dataset.sfreq,
            nperseg=256,
            axis=-1,
        )
        frequency_mask = (frequencies >= 8) & (frequencies <= 30)

        fig, axis = plt.subplots(figsize=(9, 4.5))
        for class_id, class_name in enumerate(CLASS_NAMES):
            class_power = power[dataset.y == class_id].mean(axis=(0, 1))
            axis.plot(
                frequencies[frequency_mask],
                10 * np.log10(class_power[frequency_mask]),
                linewidth=2.4,
                label=class_name.title(),
            )
        axis.set(
            title="Motor-band power over C3, Cz, and C4",
            xlabel="Frequency (Hz)",
            ylabel="Power (dB)",
        )
        axis.legend(frameon=False)
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the retained 8–30 Hz band contains the "
            "motor rhythms supplied to every classifier below."
        ))
        """
    ),
    markdown(
        r"""
        ## 2. Turn each trial into a covariance matrix

        **Covariance** measures how two channel signals vary together. Positive
        covariance means they tend to rise and fall together; negative
        covariance means they tend to move in opposite directions.

        For \(p\) channels, one trial becomes a \(p \times p\) matrix:

        \[
        C = \frac{1}{n-1}XX^\mathsf{T}.
        \]

        The diagonal describes each channel's variance. The off-diagonal values
        describe pairwise relationships. We use **OAS shrinkage**, a
        regularized estimate that is more stable when the trial is short.

        Valid full-rank covariance matrices are **symmetric positive definite
        (SPD)**. Positive definite means every direction has positive variance.
        Equivalently, every eigenvalue is greater than zero. SPD matrices form
        the curved space used by the Riemannian methods below.
        """
    ),
    code(
        """
        covariances = Covariances(estimator="oas").fit_transform(dataset.X)
        eigenvalues = np.linalg.eigvalsh(covariances)

        covariance_check = pd.Series(
            {
                "matrix shape": str(covariances.shape[1:]),
                "number of matrices": len(covariances),
                "smallest eigenvalue": eigenvalues.min(),
                "largest eigenvalue": eigenvalues.max(),
                "all eigenvalues positive": bool(np.all(eigenvalues > 0)),
            },
            name="value",
        )
        display(covariance_check.to_frame())
        """
    ),
    markdown(
        r"""
        Raw covariance values depend on signal scale. For visualization only,
        we convert two examples to **correlation matrices**, whose values lie
        between −1 and 1. The classifiers still receive covariance matrices.
        """
    ),
    code(
        """
        def covariance_to_correlation(covariance):
            scale = np.sqrt(np.diag(covariance))
            return covariance / np.outer(scale, scale)


        example_indices = [np.flatnonzero(dataset.y == class_id)[0] for class_id in (0, 1)]
        fig, axes = plt.subplots(1, 2, figsize=(13, 5), sharex=True, sharey=True)
        for axis, trial_index, class_name in zip(
            axes, example_indices, CLASS_NAMES, strict=True
        ):
            sns.heatmap(
                covariance_to_correlation(covariances[trial_index]),
                vmin=-1,
                vmax=1,
                center=0,
                cmap="vlag",
                square=True,
                xticklabels=dataset.channel_names,
                yticklabels=dataset.channel_names,
                cbar=axis is axes[-1],
                ax=axis,
            )
            axis.set_title(f"One {class_name} trial")
            axis.tick_params(axis="x", rotation=90)
            axis.tick_params(axis="y", rotation=0)
        fig.suptitle("Each trial becomes a pattern of channel relationships")
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** a trial is now represented by one symmetric "
            "relationship pattern rather than thousands of separate samples."
        ))
        """
    ),
    markdown(
        r"""
        ## 3. Distance and an average that stay inside the valid space

        Ordinary subtraction treats matrix entries as independent coordinates.
        But changing one covariance entry can break positive definiteness.

        A **Riemannian metric** supplies a distance that respects the SPD
        structure. The affine-invariant distance used here compares the
        relative deformation needed to transform one covariance matrix into
        another:

        \[
        d_R(C_1,C_2) =
        \left\|\log\left(C_1^{-1/2}C_2C_1^{-1/2}\right)\right\|_F.
        \]

        The **Riemannian mean** is the valid covariance matrix that minimizes
        the total squared Riemannian distance to the training matrices. It is
        the curved-space counterpart of an arithmetic average.
        """
    ),
    code(
        """
        class_means = {
            class_name: mean_riemann(covariances[dataset.y == class_id])
            for class_id, class_name in enumerate(CLASS_NAMES)
        }
        mean_distance = distance_riemann(class_means["hands"], class_means["feet"])

        display(
            Markdown(
                f"**Riemannian distance between the two class means: "
                f"{mean_distance:.3f}**"
            )
        )

        # Diagonal entries describe channel variance. Their log ratio gives a
        # readable spatial summary of how the two class means differ.
        log_variance_ratio = np.log(
            np.diag(class_means["hands"]) / np.diag(class_means["feet"])
        )
        fig, axis = plt.subplots(figsize=(7, 5))
        image, _ = mne.viz.plot_topomap(
            log_variance_ratio,
            dataset.epochs.info,
            axes=axis,
            show=False,
            contours=6,
            cmap="vlag",
        )
        axis.set_title("Hands-to-feet log variance ratio in the class means")
        colorbar = fig.colorbar(image, ax=axis, shrink=0.75)
        colorbar.set_label("log variance ratio")
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the two learned class prototypes differ "
            "spatially over the motor electrodes, not by one global amplitude."
        ))
        """
    ),
    markdown(
        r"""
        ## 4. Three complete BCI pipelines

        A **pipeline** is the full sequence from one trial to one prediction.

        ### CSP + LDA

        **Common spatial patterns (CSP)** learns weighted channel combinations
        whose variance separates the two classes. **Linear discriminant
        analysis (LDA)** then draws a linear decision boundary.

        ### Riemannian MDM

        **Minimum distance to mean (MDM)** computes one Riemannian mean for each
        class. A new covariance matrix receives the label of the nearest class
        mean. It has very few fitted quantities, which can be valuable when
        calibration data are scarce.

        ### Tangent space + logistic regression

        A **tangent space** is a flat coordinate system attached near a
        reference point on the curved SPD space. Mapping covariance matrices
        there preserves local geometric relationships and allows a familiar
        linear classifier to be used.
        """
    ),
    markdown(
        r"""
        ### Validation: hold out complete runs

        Randomly splitting nearby trials can make a BCI result look better than
        it will be in a future session because neighboring trials share
        recording conditions.

        We use **leave-one-run-out validation**:

        1. Train on two complete runs.
        2. Test on the untouched third run.
        3. Repeat until every run has been the test set.

        Every data-dependent step, including CSP filters, covariance means, and
        tangent reference points, is fitted inside the training fold.

        **Balanced accuracy** is the average recall across the two classes.
        Chance level is approximately 0.5, and each class contributes equally.
        """
    ),
    code(
        """
        pipelines = build_pipelines()
        with mne.use_log_level("ERROR"):
            scores, predictions = evaluate_leave_one_group_out(
                pipelines,
                dataset.X,
                dataset.y,
                dataset.groups,
            )

        model_summary = (
            scores.groupby("model", sort=False)
            .agg(
                mean_balanced_accuracy=("balanced_accuracy", "mean"),
                standard_deviation=("balanced_accuracy", "std"),
                folds=("fold", "nunique"),
            )
            .reset_index()
            .sort_values("mean_balanced_accuracy", ascending=False)
        )
        display(model_summary.style.format(
            {
                "mean_balanced_accuracy": "{:.3f}",
                "standard_deviation": "{:.3f}",
            }
        ))
        display(scores.pivot(index="held_out_group", columns="model", values="balanced_accuracy"))
        """
    ),
    code(
        """
        fig, axis = plt.subplots(figsize=(10, 5))
        sns.stripplot(
            data=scores,
            x="balanced_accuracy",
            y="model",
            hue="held_out_group",
            size=9,
            jitter=False,
            palette="viridis",
            ax=axis,
        )
        axis.scatter(
            model_summary["mean_balanced_accuracy"],
            model_summary["model"],
            marker="|",
            s=500,
            linewidth=3,
            color="#111827",
            label="Mean",
        )
        axis.axvline(0.5, color="#888", linestyle="--", label="Chance")
        axis.set(
            xlim=(0.45, 1.01),
            xlabel="Balanced accuracy",
            ylabel="",
            title="Full-calibration performance on held-out recording runs",
        )
        axis.legend(title="Held-out group", bbox_to_anchor=(1.02, 1), loc="upper left")
        fig.tight_layout()
        fig.savefig(FIGURE_PATH / "full-calibration-performance.png", bbox_inches="tight")
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** on this participant, all three complete "
            "pipelines remain above chance on recording runs they did not train on."
        ))
        """
    ),
    code(
        """
        fig, axes = plt.subplots(1, len(pipelines), figsize=(14, 4))
        for axis, model_name in zip(axes, pipelines, strict=True):
            model_predictions = predictions[predictions["model"] == model_name]
            matrix = confusion_matrix(
                model_predictions["truth"],
                model_predictions["prediction"],
                labels=[0, 1],
                normalize="true",
            )
            ConfusionMatrixDisplay(
                matrix,
                display_labels=[name.title() for name in CLASS_NAMES],
            ).plot(ax=axis, cmap="Purples", colorbar=False, values_format=".2f")
            axis.set_title(model_name)
        fig.suptitle("Normalized confusion matrices across all held-out runs")
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** inspect both classes separately; one high "
            "average score can otherwise hide a systematic class error."
        ))
        """
    ),
    markdown(
        r"""
        ### Read the result honestly

        On this small, clean, single-participant subset, all three pipelines may
        reach similar full-calibration accuracy. That is useful evidence:

        - Riemannian geometry is **not** an automatic accuracy bonus.
        - A strong classical motor-imagery baseline such as CSP must be included.
        - MDM reaches its decision with a compact and interpretable model: one
          mean covariance matrix per class plus a distance rule.
        - The structured representation becomes especially interesting when
          calibration trials are limited, when multiple sessions or people must
          be aligned, or when a richer multiclass problem is studied.
        """
    ),
    markdown(
        r"""
        ## 5. The low-calibration question

        BCI users should not have to provide a large training set before a
        system becomes useful. We now deliberately restrict training to only
        2, 4, 6, or 10 trials from each class.

        For each held-out run and each training size, the sampling is repeated
        ten times. The test run never changes and is never used to choose the
        training trials.
        """
    ),
    code(
        """
        with mne.use_log_level("ERROR"):
            low_data_scores = evaluate_low_data_regime(
                pipelines,
                dataset.X,
                dataset.y,
                dataset.groups,
                trials_per_class=(2, 4, 6, 10),
                repeats=10,
                random_state=42,
            )

        low_data_summary = (
            low_data_scores.groupby(["trials_per_class", "model"], sort=False)
            ["balanced_accuracy"]
            .agg(["mean", "std"])
            .reset_index()
        )
        display(
            low_data_summary.pivot(
                index="trials_per_class",
                columns="model",
                values="mean",
            ).style.format("{:.3f}")
        )
        """
    ),
    code(
        """
        fig, axis = plt.subplots(figsize=(10, 5.5))
        sns.lineplot(
            data=low_data_scores,
            x="trials_per_class",
            y="balanced_accuracy",
            hue="model",
            marker="o",
            linewidth=2.4,
            markersize=8,
            errorbar=("ci", 95),
            ax=axis,
        )
        axis.axhline(0.5, color="#888", linestyle="--", label="Chance")
        axis.set(
            xticks=[2, 4, 6, 10],
            ylim=(0.45, 1.01),
            xlabel="Training trials available per class",
            ylabel="Balanced accuracy",
            title="Learning with limited BCI calibration data",
        )
        axis.legend(bbox_to_anchor=(1.02, 1), loc="upper left", frameon=False)
        fig.tight_layout()
        fig.savefig(FIGURE_PATH / "low-calibration-performance.png", bbox_inches="tight")
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** in this single-participant demonstration, "
            "the covariance-based pipelines use the smallest calibration sets "
            "more effectively."
        ))
        """
    ),
    markdown(
        r"""
        In this example, the covariance-based methods are often strongest with
        only two trials per class. This supports a practical interpretation:
        respecting the matrix structure can improve **data efficiency**, even
        when all methods converge to similar accuracy after more calibration.

        This conclusion is deliberately narrow. It describes this experiment,
        not every participant, task, preprocessing choice, or BCI dataset.
        """
    ),
    markdown(
        r"""
        ## 6. Visualize the tangent-space coordinates

        The tangent representation has one feature for each unique covariance
        entry. With 17 channels that is \(17(17+1)/2 = 153\) features.

        To draw it on a screen, **principal component analysis (PCA)** compresses
        those features to two display axes. PCA is used only for this figure;
        the classifier above uses the complete tangent representation.
        """
    ),
    code(
        """
        tangent_features = TangentSpace(metric="riemann").fit_transform(covariances)
        coordinates = PCA(n_components=2, random_state=42).fit_transform(tangent_features)
        embedding = pd.DataFrame(
            {
                "PC 1": coordinates[:, 0],
                "PC 2": coordinates[:, 1],
                "class": CLASS_NAMES[dataset.y],
                "run": dataset.metadata["run"].to_numpy(),
            }
        )

        fig, axis = plt.subplots(figsize=(8, 6))
        sns.scatterplot(
            data=embedding,
            x="PC 1",
            y="PC 2",
            hue="class",
            style="run",
            s=90,
            alpha=0.85,
            ax=axis,
        )
        axis.set_title("A 2D view of the covariance matrices in tangent space")
        axis.legend(bbox_to_anchor=(1.02, 1), loc="upper left", frameon=False)
        fig.tight_layout()
        plt.show()
        display(Markdown(
            "> **Figure takeaway:** the tangent map turns covariance matrices "
            "into ordinary feature vectors; this 2D projection is only a view "
            "of the full 153-feature representation."
        ))
        """
    ),
    markdown(
        r"""
        ## 7. Reuse the workflow on your own EEG

        The reusable pattern is short:

        ```python
        # X shape: (trials, channels, time samples)
        # y shape: (trials,)
        # groups: session, run, or participant identity for honest validation

        pipeline = Pipeline([
            ("covariance", Covariances(estimator="oas")),
            ("tangent", TangentSpace(metric="riemann")),
            ("classifier", LogisticRegression(class_weight="balanced")),
        ])

        for train, test in LeaveOneGroupOut().split(X, y, groups):
            pipeline.fit(X[train], y[train])
            predictions = pipeline.predict(X[test])
        ```

        Before this code, your MNE workflow should:

        1. Load `Raw` EEG and set correct channel locations.
        2. Mark or remove artifacts.
        3. Filter for frequencies justified by the task.
        4. Create cue-aligned `Epochs`.
        5. Keep a group label for every participant, session, or run that must
           remain independent at test time.
        """
    ),
    markdown(
        r"""
        ## Common mistakes

        - **Leakage:** fitting CSP, a tangent reference point, or any scaler
          before cross-validation lets test information enter training.
        - **Random trial splitting:** this can mix trials from the same recording
          block across train and test.
        - **Singular covariance matrices:** too many channels or too few samples
          can produce unstable estimates; use regularization and inspect matrix
          rank.
        - **Unjustified filtering:** frequency bands should follow the
          neurophysiology and task, not only the score.
        - **One-participant conclusions:** subject-specific success does not
          establish cross-participant generalization.
        - **No baseline:** geometry should be compared with a credible standard
          method such as CSP for motor imagery.
        """
    ),
    markdown(
        r"""
        ## Optional extension: test generalization across participants

        The default result is intentionally scoped to one participant. It is
        useful for learning the workflow, but it cannot establish that a model
        generalizes to a new person.

        To study that harder question:

        ```python
        dataset = load_motor_imagery(subjects=(1, 2, 3, 4, 5), ...)
        participant_groups = dataset.metadata["subject"].to_numpy()
        scores, predictions = evaluate_leave_one_group_out(
            pipelines, dataset.X, dataset.y, participant_groups
        )
        ```

        This holds out all trials from one participant at a time. Expect lower
        performance: anatomy, electrode placement, strategy, and recording
        conditions differ between people. Alignment and transfer-learning
        methods should be evaluated inside the same held-out-participant
        protocol.
        """
    ),
    markdown(
        r"""
        ## Optional: discover the same dataset through EEGDash

        **Decision for this notebook: complement, not replace.** The direct MNE
        loader above is smaller and simpler for a first run. EEGDash becomes
        useful when you want BIDS metadata, consistent discovery, and a path to
        many other MNE/braindecode-compatible datasets.

        The following snippet was tested with EEGDash 0.8.3. It queries metadata
        first, then downloads only subject 001, run 6 when `raw` is accessed:

        ```python
        # Optional dependency: pip install eegdash
        from eegdash import EEGDash, EEGDashDataset

        records = EEGDash().find(
            dataset="ds004362",
            subject="001",
            run="6",
            limit=1,
        )
        eegdash_dataset = EEGDashDataset(
            cache_dir="./data/eegdash",
            records=records,
        )
        raw = eegdash_dataset.datasets[0].raw
        print(raw.info["sfreq"], len(raw.ch_names))
        ```

        Keep dataset loading separate from the validation logic: subject,
        session, and run identifiers from BIDS metadata should become grouping
        variables rather than being randomly mixed across folds.
        """
    ),
    markdown(
        r"""
        ## Exercises

        1. Change the channel list. What happens if only `C3`, `Cz`, and `C4`
           are retained?
        2. Compare OAS shrinkage with the sample covariance estimator.
        3. Add more participants and use participant identity as the validation
           group. How much harder is cross-participant prediction?
        4. Change the epoch window and explain the choice physiologically.
        5. Plot each trial's distance to both MDM class means.
        6. Add a Euclidean nearest-mean covariance baseline. Does using a
           geometry designed for SPD matrices change the result?
        """
    ),
    markdown(
        r"""
        ## Sources and further reading

        - [MNE EEGBCI dataset loader](https://mne.tools/stable/generated/mne.datasets.eegbci.load_data.html)
        - [MNE motor-imagery CSP example](https://mne.tools/stable/auto_examples/decoding/decoding_csp_eeg.html)
        - [PhysioNet EEG Motor Movement/Imagery Dataset](https://physionet.org/content/eegmmidb/1.0.0/)
        - [pyRiemann MDM documentation](https://pyriemann.readthedocs.io/en/latest/generated/pyriemann.classification.MDM.html)
        - Barachant et al. (2012),
          [Multiclass Brain-Computer Interface Classification by Riemannian Geometry](https://doi.org/10.1109/TBME.2011.2172210)
        - Barachant et al. (2013),
          [Classification of covariance matrices using a Riemannian-based kernel](https://doi.org/10.1016/j.neucom.2012.12.039)
        - Congedo, Barachant & Bhatia (2017),
          [Riemannian geometry for EEG-based brain-computer interfaces; a primer and a review](https://doi.org/10.1080/2326263X.2017.1297192)

        Dataset citation: Schalk et al. (2004), *BCI2000: A General-Purpose
        Brain-Computer Interface (BCI) System*, IEEE Transactions on Biomedical
        Engineering.
        """
    ),
]

CODE_PURPOSES = [
    "Install missing packages when running in Colab or a fresh Python runtime.",
    "Create or locate the helper module so the notebook is self-contained.",
    "Import the analysis tools, define project paths, and report versions.",
    "Reproduce the website's two routes between covariance patterns.",
    "Compare candidate class centers using the Riemannian objective.",
    "Download, filter, and epoch the selected motor-imagery runs.",
    "Verify shapes, finite values, labels, and leakage-safe run groups.",
    "Locate the selected motor-region electrodes on the scalp.",
    "Inspect class-average voltage at three central electrodes.",
    "Check the motor-band frequency content supplied to the models.",
    "Estimate one regularized covariance matrix per EEG trial.",
    "Inspect two trial-level channel-relationship patterns.",
    "Build the two Riemannian class prototypes and compare them.",
    "Fit and evaluate all three pipelines on held-out recording runs.",
    "Plot fold-level full-calibration performance.",
    "Check class-specific errors with normalized confusion matrices.",
    "Repeat validation with deliberately limited calibration data.",
    "Plot how performance changes with available calibration trials.",
    "Map covariance matrices to tangent vectors and display a 2D projection.",
]

code_cells = [cell for cell in cells if cell.cell_type == "code"]
if len(code_cells) != len(CODE_PURPOSES):
    raise RuntimeError(
        f"Expected {len(CODE_PURPOSES)} code cells, found {len(code_cells)}."
    )
for cell, purpose in zip(code_cells, CODE_PURPOSES, strict=True):
    cell.source = f"# Purpose: {purpose}\n\n{cell.source}"


notebook = nbf.v4.new_notebook(
    cells=cells,
    metadata={
        "kernelspec": {
            "display_name": "Python (rnd_env)",
            "language": "python",
            "name": "rnd_env",
        },
        "language_info": {
            "name": "python",
            "pygments_lexer": "ipython3",
        },
    },
)
nbf.write(notebook, OUTPUT_PATH)
print(f"Wrote {OUTPUT_PATH}")

colab_notebook = deepcopy(notebook)
colab_notebook.metadata["kernelspec"] = {
    "display_name": "Python 3",
    "language": "python",
    "name": "python3",
}
nbf.write(colab_notebook, COLAB_OUTPUT_PATH)
print(f"Wrote {COLAB_OUTPUT_PATH}")
