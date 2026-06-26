# Educational notebook

`01_riemannian_eeg_motor_imagery.ipynb` is the practical continuation of the
theory website.

`01_riemannian_eeg_motor_imagery_colab.ipynb` is the self-contained upload
variant. It installs only missing packages and writes the helper module inside
the runtime, so no conda environment or second uploaded file is required.

It downloads a small open subset of the PhysioNet EEG Motor
Movement/Imagery dataset through MNE and compares:

1. CSP + LDA;
2. covariance matrices + Riemannian MDM;
3. covariance matrices + tangent-space logistic regression.

The default configuration uses subject 1 and runs 6, 10, and 14
(imagined hands versus imagined feet). Validation leaves one complete recording
run out at a time. A second experiment restricts training to 2, 4, 6, or 10
trials per class to demonstrate how the methods behave when BCI calibration
data are limited.

The notebook explains terminology before use and includes:

- sensor and signal figures;
- motor-band power spectra;
- covariance and correlation matrices;
- Riemannian class means and distance;
- run-wise model evaluation and confusion matrices;
- a low-calibration learning curve;
- a two-dimensional view of tangent-space features;
- reuse guidance, common mistakes, and exercises.

## Run

```bash
conda activate rnd_env
jupyter lab notebooks/01_riemannian_eeg_motor_imagery.ipynb
```

The first execution downloads approximately 7.4 MB of EEG data into
`data/mne/`.

To rebuild the `.ipynb` from its tracked cell specification:

```bash
conda run -n rnd_env python notebooks/build_notebook.py
```

This command rebuilds both the canonical `rnd_env` notebook and the Colab
variant. The website's Colab URL remains a deliberate placeholder until the
maintainer uploads the generated Colab notebook.

To execute all cells and embed fresh outputs:

```bash
conda run -n rnd_env jupyter nbconvert \
  --to notebook \
  --execute \
  --inplace notebooks/01_riemannian_eeg_motor_imagery.ipynb \
  --ExecutePreprocessor.kernel_name=rnd_env \
  --ExecutePreprocessor.timeout=1200
```

To rebuild, execute, and refresh both website artifacts in one command:

```bash
bash notebooks/publish_notebook.sh
```
