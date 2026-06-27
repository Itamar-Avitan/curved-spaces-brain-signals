# Educational notebook

`01_riemannian_eeg_motor_imagery.ipynb` is the practical continuation of the
theory website. It is generated as an adaptive notebook: it runs in the local
`rnd_env` environment and also includes a Colab-safe setup block that installs
missing packages and creates the helper module when opened in Google Colab.

`01_riemannian_eeg_motor_imagery_colab.ipynb` is the self-contained upload
variant with a Python 3 kernelspec. It installs only missing packages and writes
the helper module inside the runtime, so no conda environment or second uploaded
file is required.

It downloads a small open subset of the PhysioNet EEG Motor
Movement/Imagery dataset through MNE and compares:

1. CSP + LDA;
2. covariance matrices + Riemannian MDM;
3. covariance matrices + tangent-space logistic regression.

It also includes a diagnostic Euclidean covariance nearest-mean baseline so the
learner can separate "covariance features help" from "Riemannian geometry helps."

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
- a raw Euclidean-vs-Riemannian covariance geometry contrast;
- run-wise model evaluation and confusion matrices;
- a low-calibration learning curve;
- a two-dimensional view of tangent-space features;
- a short source-library map connecting the demo to MDM, tangent-space kernels,
  transfer learning, signal-quality detection, P300 extensions, SPD neural
  networks, and means-field classifiers;
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

This command rebuilds both the adaptive canonical notebook and the clean Colab
upload variant. The live website points to the maintainer-hosted Colab notebook
in Drive; after notebook changes, replace that Drive file with
`01_riemannian_eeg_motor_imagery_colab.ipynb`.

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
