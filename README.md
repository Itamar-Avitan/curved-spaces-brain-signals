# Curved Spaces, Brain Signals

Interactive educational material introducing Riemannian geometry and its use
in EEG-based brain-computer interfaces.

## Development

```bash
npm install
npm run dev
```

The root page is a standalone development preview of the Wix narrative. The
custom elements in `src/widgets/` are the deployable units intended for Wix.

## Wix architecture

The final Wix page owns the prose, headings, references, and page structure.
The generated ES module registers:

- `<rg-covariance-explorer>`
- `<rg-signal-covariance>`
- `<rg-distance-explorer>`
- `<rg-mean-explorer>`
- `<rg-tangent-explorer>`
- `<rg-mdm-playground>`
- `<rg-concept-check>`
- `<rg-next-steps>`

Load `dist/riemannian-eeg-widgets.js` from an HTTPS host, then add the desired
custom-element tag in Wix.

Build and validate the Wix library:

```bash
npm run build
```

## Public review site

The temporary review site is a separate Vite application build. It does not
replace or overwrite the Wix library output.

```bash
PAGES_BASE_PATH=/curved-spaces-brain-signals/ npm run build:pages
npm run preview:pages -- --port 4173
```

- Wix output: `dist/`
- GitHub Pages output: `dist-pages/`
- Combined validation: `npm run build:all`

The review deployment is intentionally public and carries `noindex,nofollow`
metadata plus a visible commit/build label.

- Review URL: <https://itamar-avitan.github.io/curved-spaces-brain-signals/>
- Source repository: <https://github.com/Itamar-Avitan/curved-spaces-brain-signals>

## Manim

Use the existing `rnd_env` environment for all renders. See
[`manim/README.md`](manim/README.md).

## Educational notebook

The executed MNE/pyRiemann tutorial is
[`notebooks/01_riemannian_eeg_motor_imagery.ipynb`](notebooks/01_riemannian_eeg_motor_imagery.ipynb).
It uses the open PhysioNet EEG Motor Movement/Imagery dataset and compares CSP,
Riemannian MDM, and tangent-space classification with complete recording runs
held out for testing.

See [`notebooks/README.md`](notebooks/README.md) for environment and rebuild
instructions.
