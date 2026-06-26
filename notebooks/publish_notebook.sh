#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOTEBOOK="$PROJECT_ROOT/notebooks/01_riemannian_eeg_motor_imagery.ipynb"
COLAB_NOTEBOOK="$PROJECT_ROOT/notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb"

cd "$PROJECT_ROOT"

conda run -n rnd_env python notebooks/build_notebook.py
conda run -n rnd_env jupyter nbconvert \
  --to notebook \
  --execute \
  --inplace "$NOTEBOOK" \
  --ExecutePreprocessor.kernel_name=rnd_env \
  --ExecutePreprocessor.timeout=1200

mkdir -p public/downloads public/media
cp "$NOTEBOOK" public/downloads/01_riemannian_eeg_motor_imagery.ipynb
cp "$COLAB_NOTEBOOK" \
  public/downloads/01_riemannian_eeg_motor_imagery_colab.ipynb
cp notebooks/figures/low-calibration-performance.png \
  public/media/low-calibration-performance.png

echo "Published executed notebook and website figure."
