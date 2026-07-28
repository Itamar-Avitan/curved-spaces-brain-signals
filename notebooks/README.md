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

The notebook follows the theory page's own order:

- **0** — a two-channel example small enough to draw;
- **1–2** — load the trials and turn each one into a covariance matrix;
- **3** — a distance and an average that stay inside the valid space, ending
  with a measurement of where the flattened map is accurate and where it is not;
- **4** — Route 1, minimum distance to mean, measured on the surface;
- **5** — Route 2, the tangent space plus an ordinary classifier;
- **5b** — which route? Both against CSP + LDA and a Euclidean baseline, with
  run-wise validation and confusion matrices;
- **6** — what the geometry buys you: 6.1 same features under a different
  ruler, 6.2 rewire the recording and watch which ruler notices, 6.3 how little
  calibration you can get away with, 6.4 a session shift injected on purpose,
  6.4b the same move on data that had no shift to remove, 6.5 the distance used
  as a signal-quality gate;
- **7–8** — what the source papers add, and how to reuse the workflow;
- then common mistakes, three runnable exercises, and two optional extensions.

It explains terminology before use, and includes:

- a from-scratch Frechet-mean iteration checked against pyRiemann, so the mean,
  the log map and the tangent space are visibly one idea rather than three;
- a direct measurement of the page's central claim (§3): whiten every trial by
  the Riemannian mean and compare the curved distance with the flat one. The
  flat map overstates the furthest trials more than the nearest, but the honest
  reading is that no real trial sits close enough for the two to agree;
- a congruence test that uses a full invertible mixing matrix, not just
  per-channel gain, because mixing is what volume conduction and re-referencing
  actually do;
- a demonstration that positive-definiteness is a real constraint: push one
  off-diagonal entry and an eigenvalue goes negative;
- a simulated session shift applied to the held-out run alone (§6.4), which
  drops balanced accuracy to chance, and per-run re-centering that recovers most
  but not all of it, with a no-shift control row that splits the residual into
  what the operation costs and what the shift genuinely left behind — an
  orthogonal rotation the training class means never saw;
- run-wise re-centering on the real unshifted runs (§6.4b), with an honest
  reading of why three runs of one session can show the mechanism but not the
  accuracy gain;
- a working Riemannian potato (artifact flagging by distance to the mean);
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
- reuse guidance and common mistakes;
- three runnable exercises that each change one variable against the fixed
  held-out-run protocol, with a marked knob and a folded note on what to look
  for (fewer channels; shrinkage vs the plain sample covariance, which exposes
  that the average reference makes it rank-deficient; and log-Euclidean vs the
  affine-invariant metric).

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
