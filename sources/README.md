# Riemannian Geometry for EEG/BCI — Source Library

This folder contains an initial, legally accessible reading set for building a
beginner-oriented website about Riemannian methods in EEG and BCI.

## Suggested reading order

1. **Congedo, Barachant, and Bhatia (2017)** — Start here. It explains why EEG
   covariance matrices are symmetric positive definite (SPD), why Euclidean
   operations are problematic, and how Riemannian distance, means, tangent
   spaces, and classifiers fit together.
2. **Barachant et al. (2012)** — The classic minimum-distance-to-mean (MDM)
   classification pipeline for motor-imagery BCI.
3. **Yger, Berar, and Lotte (2017)** — A compact review that compares the main
   Riemannian approaches used in BCI.
4. **Barachant et al. (2013)** — Tangent-space/kernel classification of
   covariance matrices.
5. **Barachant and Congedo (2014)** — Extends the covariance approach from
   oscillatory motor-imagery data to event-related potentials/P300.
6. **Zanini et al. (2018)** — Shows how geometric alignment supports transfer
   across sessions and subjects.
7. **Barthélemy et al. (2019)** — A practical geometric method for detecting
   poor-quality EEG segments.
8. **Recent extensions** — Use these after the basic pipeline is clear.

## Folder guide

### `01_reviews`

- `2017_Congedo_Riemannian_geometry_EEG_BCI_primer_review.pdf`
  - Best conceptual introduction.
  - DOI: <https://doi.org/10.1080/2326263X.2017.1297192>
  - Open source: <https://hal.science/hal-01570120>
- `2017_Yger_Riemannian_approaches_BCI_review.pdf`
  - Shorter survey of methods and applications.
  - DOI: <https://doi.org/10.1109/TNSRE.2016.2627016>
  - Open source: <https://inria.hal.science/hal-01394253>
- `2024_Tibermacine_Riemannian_geometry_EEG_literature_review.pdf`
  - Recent overview, especially useful for Riemannian/deep-learning hybrids.
  - Preprint: <https://arxiv.org/abs/2407.20250>

### `02_core_methods`

- `2012_Barachant_Multiclass_BCI_Riemannian_geometry.pdf`
  - Introduces direct classification of EEG covariance matrices with
    Riemannian MDM.
  - DOI: <https://doi.org/10.1109/TBME.2011.2172210>
  - Open source: <https://hal.science/hal-00681328>
- `2013_Barachant_Riemannian_kernel_BCI.pdf`
  - Introduces tangent-space/kernel methods for covariance matrices.
  - DOI: <https://doi.org/10.1016/j.neucom.2012.12.039>
  - Open source: <https://hal.science/hal-00820475>
- `2018_Zanini_Transfer_learning_Riemannian_framework.pdf`
  - Geometric transfer learning and covariance-matrix alignment.
  - DOI: <https://doi.org/10.1109/TBME.2017.2742541>
  - Open source: <https://hal.science/hal-01923278>

### `03_eeg_bci_applications`

- `2014_Barachant_Plug_and_Play_P300_BCI.pdf`
  - Calibration-light ERP/P300 classification using augmented covariance
    matrices.
  - Preprint: <https://arxiv.org/abs/1409.0107>
- `2019_Barthelemy_Riemannian_Potato_Field_EEG_quality.pdf`
  - Online artifact and signal-quality detection on the SPD manifold.
  - DOI: <https://doi.org/10.1109/TNSRE.2019.2893113>
  - Open source: <https://hal.science/hal-02015909>
- `2022_Barthelemy_End_to_end_P300_Riemannian_probabilities.pdf`
  - Probabilistic Riemannian classification in a full P300 spelling pipeline.
  - Preprint: <https://arxiv.org/abs/2203.07807>

### `04_recent_extensions`

- `2023_Carrara_Augmented_SPDNet_motor_imagery_BCI.pdf`
  - Short conference paper on combining augmented covariance matrices with
    SPD neural networks.
  - Open source: <https://inria.hal.science/hal-04308549>
- `2024_Carrara_Phase_SPDNet_BCI_EEG_decoding.pdf`
  - Full paper on an SPD neural network using phase-space/augmented covariance
    representations for motor imagery.
  - DOI: <https://doi.org/10.1088/1741-2552/ad88a2>
  - Preprint: <https://arxiv.org/abs/2403.05645>
- `2025_Andreev_Riemannian_Means_Field_classifier.pdf`
  - A recent extension of MDM using several matrix power means.
  - Preprint: <https://arxiv.org/abs/2504.17352>

## Core concepts these papers cover

`EEG epochs` → `covariance matrices` → `SPD manifold` → `Riemannian
distance/mean` → either `MDM classification` or `tangent-space features` →
optional `alignment`, `transfer learning`, or `SPD neural networks`.

Bibliographic records are available in [`references.bib`](references.bib).

## Additional visual source

- ScienceClic English, *The Maths of General Relativity* video series:
  <https://www.youtube.com/watch?v=xodtfM1r9FA&list=PLu7cY2CPiRjVY-VaUZ69bXHZr5QslKbzo>
  - Used as visual inspiration for the high-level spacetime and worldline hook.
  - The website credits and links the series directly; no video content is
    copied into this repository.
