"""Utilities for the educational Riemannian EEG notebook.

The functions intentionally keep the workflow explicit. They are not intended
to replace a production preprocessing or model-selection pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
import warnings

import mne
import numpy as np
import pandas as pd
from mne.channels import make_standard_montage
from mne.datasets import eegbci
from mne.decoding import CSP
from mne.io import read_raw_edf
from pyriemann.classification import MDM
from pyriemann.estimation import Covariances
from pyriemann.tangentspace import TangentSpace
from sklearn.base import clone
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, balanced_accuracy_score
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.pipeline import Pipeline


DEFAULT_CHANNELS = (
    "FC5",
    "FC3",
    "FC1",
    "FCz",
    "FC2",
    "FC4",
    "FC6",
    "C5",
    "C3",
    "C1",
    "Cz",
    "C2",
    "C4",
    "C6",
    "CP3",
    "CPz",
    "CP4",
)

CLASS_NAMES = np.array(["hands", "feet"])


@dataclass
class MotorImageryDataset:
    """Container returned by :func:`load_motor_imagery`."""

    epochs: mne.Epochs
    X: np.ndarray
    y: np.ndarray
    groups: np.ndarray
    metadata: pd.DataFrame
    channel_names: list[str]
    sfreq: float


def load_motor_imagery(
    *,
    subjects: Iterable[int] = (1,),
    runs: Iterable[int] = (6, 10, 14),
    data_path: str | Path = "../data/mne",
    channels: Iterable[str] = DEFAULT_CHANNELS,
    l_freq: float = 8.0,
    h_freq: float = 30.0,
    tmin: float = 1.0,
    tmax: float = 3.0,
    verbose: bool | str = False,
) -> MotorImageryDataset:
    """Download, filter, and epoch PhysioNet EEGBCI motor-imagery data.

    Runs 6, 10, and 14 contain imagined movement of both hands versus both
    feet. Each subject-run pair becomes one validation group.
    """

    subjects = tuple(subjects)
    runs = tuple(runs)
    channels = tuple(channels)
    data_path = Path(data_path).expanduser().resolve()
    data_path.mkdir(parents=True, exist_ok=True)
    montage = make_standard_montage("standard_1005")

    all_epochs: list[mne.Epochs] = []
    group_values: list[int] = []
    metadata_rows: list[dict[str, int | str]] = []
    group_id = 0

    for subject in subjects:
        file_paths = eegbci.load_data(
            subject,
            runs,
            path=data_path,
            update_path=False,
            verbose=verbose,
        )
        for run, file_path in zip(runs, file_paths, strict=True):
            raw = read_raw_edf(file_path, preload=True, verbose=verbose)
            eegbci.standardize(raw)
            raw.set_montage(montage, on_missing="ignore", verbose=verbose)
            missing = sorted(set(channels) - set(raw.ch_names))
            if missing:
                raise ValueError(f"Requested channels missing from EEGBCI data: {missing}")
            raw.pick(channels)
            raw.annotations.rename({"T1": "hands", "T2": "feet"})
            raw.set_eeg_reference("average", projection=False, verbose=verbose)
            raw.filter(
                l_freq,
                h_freq,
                fir_design="firwin",
                skip_by_annotation="edge",
                verbose=verbose,
            )

            epochs = mne.Epochs(
                raw,
                event_id=["hands", "feet"],
                tmin=tmin,
                tmax=tmax,
                baseline=None,
                preload=True,
                reject_by_annotation=True,
                verbose=verbose,
            )
            all_epochs.append(epochs)

            inverse_event_id = {
                value: name for name, value in epochs.event_id.items()
            }
            for trial_index, event_code in enumerate(epochs.events[:, -1]):
                label_name = inverse_event_id[int(event_code)]
                metadata_rows.append(
                    {
                        "subject": subject,
                        "run": run,
                        "trial": trial_index,
                        "condition": label_name,
                    }
                )
                group_values.append(group_id)
            group_id += 1

    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore",
            message="Concatenation of Annotations within Epochs is not supported",
        )
        combined = mne.concatenate_epochs(
            all_epochs,
            on_mismatch="warn",
            verbose=verbose,
        )
    metadata = pd.DataFrame(metadata_rows)
    y = metadata["condition"].map({"hands": 0, "feet": 1}).to_numpy(dtype=int)
    groups = np.asarray(group_values, dtype=int)

    return MotorImageryDataset(
        epochs=combined,
        X=combined.get_data(copy=True),
        y=y,
        groups=groups,
        metadata=metadata,
        channel_names=list(combined.ch_names),
        sfreq=float(combined.info["sfreq"]),
    )


def build_pipelines(random_state: int = 42) -> dict[str, Pipeline]:
    """Create three educational decoding pipelines."""

    return {
        "CSP + LDA": Pipeline(
            [
                (
                    "csp",
                    CSP(
                        n_components=6,
                        reg="ledoit_wolf",
                        log=True,
                        norm_trace=False,
                    ),
                ),
                (
                    "lda",
                    LinearDiscriminantAnalysis(
                        solver="lsqr",
                        shrinkage="auto",
                    ),
                ),
            ]
        ),
        "Riemannian MDM": Pipeline(
            [
                ("covariance", Covariances(estimator="oas")),
                ("classifier", MDM(metric="riemann")),
            ]
        ),
        "Tangent space + logistic regression": Pipeline(
            [
                ("covariance", Covariances(estimator="oas")),
                ("tangent", TangentSpace(metric="riemann")),
                (
                    "classifier",
                    LogisticRegression(
                        max_iter=2_000,
                        class_weight="balanced",
                        random_state=random_state,
                    ),
                ),
            ]
        ),
    }


def evaluate_leave_one_group_out(
    pipelines: dict[str, Pipeline],
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Evaluate each pipeline with one held-out subject-run group."""

    splitter = LeaveOneGroupOut()
    score_rows: list[dict[str, float | int | str]] = []
    prediction_rows: list[dict[str, int | str]] = []

    for fold, (train, test) in enumerate(splitter.split(X, y, groups), start=1):
        held_out_group = int(np.unique(groups[test]).item())
        for model_name, pipeline in pipelines.items():
            estimator = clone(pipeline)
            estimator.fit(X[train], y[train])
            predictions = estimator.predict(X[test])

            score_rows.append(
                {
                    "model": model_name,
                    "fold": fold,
                    "held_out_group": held_out_group,
                    "accuracy": accuracy_score(y[test], predictions),
                    "balanced_accuracy": balanced_accuracy_score(
                        y[test],
                        predictions,
                    ),
                    "n_train": len(train),
                    "n_test": len(test),
                }
            )
            prediction_rows.extend(
                {
                    "model": model_name,
                    "fold": fold,
                    "held_out_group": held_out_group,
                    "truth": int(truth),
                    "prediction": int(prediction),
                }
                for truth, prediction in zip(y[test], predictions, strict=True)
            )

    return pd.DataFrame(score_rows), pd.DataFrame(prediction_rows)


def evaluate_low_data_regime(
    pipelines: dict[str, Pipeline],
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray,
    *,
    trials_per_class: Iterable[int] = (2, 4, 6, 10),
    repeats: int = 10,
    random_state: int = 42,
) -> pd.DataFrame:
    """Measure performance when only a few calibration trials are available."""

    rng = np.random.default_rng(random_state)
    splitter = LeaveOneGroupOut()
    rows: list[dict[str, float | int | str]] = []

    for fold, (train, test) in enumerate(splitter.split(X, y, groups), start=1):
        for n_trials in trials_per_class:
            for repeat in range(repeats):
                sampled = np.concatenate(
                    [
                        rng.choice(
                            train[y[train] == class_id],
                            size=min(
                                n_trials,
                                int(np.sum(y[train] == class_id)),
                            ),
                            replace=False,
                        )
                        for class_id in np.unique(y)
                    ]
                )
                for model_name, pipeline in pipelines.items():
                    estimator = clone(pipeline)
                    with mne.use_log_level("ERROR"):
                        estimator.fit(X[sampled], y[sampled])
                    predictions = estimator.predict(X[test])
                    rows.append(
                        {
                            "model": model_name,
                            "fold": fold,
                            "repeat": repeat,
                            "trials_per_class": n_trials,
                            "balanced_accuracy": balanced_accuracy_score(
                                y[test],
                                predictions,
                            ),
                        }
                    )

    return pd.DataFrame(rows)
