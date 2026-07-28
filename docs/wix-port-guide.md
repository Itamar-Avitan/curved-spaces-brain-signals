# Porting this page to Wix

This page lives in two places. `index.html` is the development preview — the
whole thing in one file, deployed to GitHub Pages so you can share a link. The
Wix page is the real destination: it owns every heading and every paragraph,
and it embeds the interactive pieces from a built JavaScript bundle.

This guide turns that port into a mechanical job. Work down the table with
`index.html` open beside you. Each row is one page section, in order.

---

## Two things that are easy to get wrong

**1. The bundle loads once, for the whole page — not once per widget.**

Build it with `npm run build`. That writes `dist/riemannian-eeg-widgets.js`
(~250 KB). Upload that file to an HTTPS host and load it **once**, from a
single site-wide or page-level custom-code slot, as a module:

```html
<script type="module" src="https://YOUR-HOST/riemannian-eeg-widgets.js"></script>
```

It must be `type="module"` — the bundle is an ES module and a plain `<script>`
tag will fail silently. Load it in the page `<head>` or at body start; the
custom elements upgrade whenever they appear, so load order relative to the
tags does not matter.

Do **not** add the script to every embed. Loading it twice makes the browser
try to register the same custom-element names twice, which throws and can leave
later widgets dead.

**2. `dist/riemannian-eeg-riemannian-eeg-widgets.css` is not the widgets' CSS.**

Despite the name, that 37 KB file is the *preview page's* stylesheet — the
fonts, colours, and layout of `index.html`. It contains zero `rg-` selectors.
Every widget carries its own styles inside its shadow DOM, in the JS bundle.

So: **do not upload that CSS to Wix.** The widgets will look correct without
it, and Wix owns the page's own typography and colour. If you want the palette
to match, take the values from `:root` at the top of `src/styles.css` and set
them in Wix's theme editor by hand:

| token | value | used for |
|---|---|---|
| `--ink` | `#20283a` | body text |
| `--muted` | `#656c7c` | captions, secondary text |
| `--cream` | `#fffaf1` | page background |
| `--paper` | `#fffdf8` | card background |
| `--coral` | `#ef6b5b` | Part-2 accent |
| `--cyan` | `#1ca9a0` | Part-3 accent |
| `--violet` | `#6c4eb9` | Part-4 accent |
| `--lemon` | `#ffd36b` | highlights |

---

## How to read the table

**Wix element** — what to add in the Wix editor. "Text" is an ordinary text
element. "Embed" is Wix's *Embed a Widget → Custom Element* (or an HTML iframe
embed if custom elements are unavailable on your plan; see *If custom elements
are not available* below).

**Heading** — paste verbatim. These are the page's spine, and the numbering
(1.1, 1.2, …) is load-bearing: the notebook cites these numbers back, and the
glossary's cross-references assume this order. Do not renumber.

**Body copy** — where to find the prose in `index.html`. Copy the rendered
text, not the HTML.

**Widgets** — the `<rg-*>` tags to embed, in the order given. Attributes are
verbatim; every attribute that appears in the table is required, and there are
no others to configure.

### Four pieces of furniture the table does not have a column for

I built §1.2 on paper following this table and hit four things it did not
answer. Handle each the same way in every section.

**1. The section number is a visible element, not just a row label.** Each
lesson section opens with the number in its own small text element above the
heading (`<p class="section-index">1.2</p>`). Style it once — small, muted,
letter-spaced — and reuse. Readers navigate by these and the notebook cites
them.

**2. Some sections open with an eyebrow.** Ten do: a short coloured kicker
above the heading, in place of or beside the number — e.g. §4.5's *"What
geometry does not solve"*, the capstone's *"Optional deep dive · watch it
derived"*, Part 5's *"Part 5 of 5 · do it yourself"*, and the references'
*"Sources behind the story"*. Copy them from `class="eyebrow"` in
`index.html`; they carry the part's accent colour.

**3. Three sections close with a takeaway callout.** `class="section-takeaway"`
is a visually distinct block, not another paragraph — a bordered or tinted box
that says what to carry forward. §1.2's is the clearest example. Make it a
distinct Wix element, or the section reads as ending mid-thought.

**4. Widget position within the prose is load-bearing.** The table gives widget
*order*, not where they sit among the paragraphs. Read the section in
`index.html` and match it. §1.2 is the example: its second paragraph says
*"Drag the second point away from the centre below"*, so `<rg-flat-map>` must
come after that paragraph and before the takeaway. Several sections instruct
the reader immediately before the thing they are meant to touch.

**And one thing to convert:** the prose contains cross-references — "§1.2"
appears five times, plus §1.4, §3.1 and §4.4 — which are live anchor links on
the preview page. In Wix, make each one an anchor link to that section. Left as
plain text they still read correctly, so this is a polish item, not a blocker.

---

## The sections, in order

### Part 1 — Curved things break flat arithmetic

Part openers (`#part-math`, `#part-eeg`, `#part-use`, `#part-routes`) are
divider bands: a short heading and one or two sentences, no widgets. They are
what makes the page read as five parts rather than one long scroll — keep them.

| § | Wix element | Heading | Body copy from | Widgets |
|---|---|---|---|---|
| — | Text (divider band) | Curved things break flat arithmetic | `#part-math` | — |
| 1.1 | Text | Gauss found this problem while surveying land. | `#story` | — |
| 1.2 | Text + **Embed** | A flat map is exact where you centre it, and wrong by more the further you go. | `#flat-map` | `<rg-flat-map>` |
| 1.3 | Text | Einstein's gravity is the most famous case of choosing a distance rule. | `#relativity` | — |
| 1.4 | Text | Where the analogy stops: our surface bends the other way, and that is lucky. | `#boundary` | — |

§1.1 contains the four-portrait timeline (Euclid, Gauss, Riemann, Einstein) as
four `<h3>` blocks. Rebuild it with a Wix repeater or four columns — it is
plain content, not a widget.

### Part 2 — An EEG trial is a shape, not a squiggle

| § | Wix element | Heading | Body copy from | Widgets |
|---|---|---|---|---|
| — | Text (divider band) | An EEG trial is a shape, not a squiggle | `#part-eeg` | — |
| 2.1 | Text + **3 Embeds** | One trial becomes a table of which electrodes moved together. | `#eeg` | `<rg-covariance-explorer>`, then `<rg-signal-covariance>`, then `<rg-formula key="covariance-matrix" folded summary="the table, built from five samples by hand">` |
| 2.2 | Text + **2 Embeds** | Not every table is possible, so they fill a curved cone. | `#cone` | `<rg-cone-explorer>`, then `<rg-case-file step="1">` |

### Part 3 — Which ruler, and why that one

| § | Wix element | Heading | Body copy from | Widgets |
|---|---|---|---|---|
| — | Text (divider band) | Which ruler, and why that one | `#part-use` | — |
| 3.1 | Text + **3 Embeds** | The straight average invents strength that was in neither trial. | `#distance` | `<rg-predict key="swelling">`, then `<rg-distance-explorer>`, then `<rg-formula key="geodesic" folded summary="the path you dragged, with real numbers">` |
| 3.2 | Text + **4 Embeds** | Rewire the amplifier and the straight ruler changes its mind. This one does not. | `#invariance` | `<rg-predict key="invariance">`, then `<rg-invariance-explorer>`, then `<rg-formula key="affine-invariant" folded summary="the ruler that would not move, in numbers">`, then `<rg-case-file step="2">` |

§3.2 has a paragraph of prose between the explorer and the formula, quoting the
notebook's rewiring result on real EEG. Keep it in that position — it is what
tells the reader the widget above it is synthetic.

### Part 4 — Two ways to build a decoder

| § | Wix element | Heading | Body copy from | Widgets |
|---|---|---|---|---|
| — | Text (divider band) | Two ways to build a decoder | `#part-routes` | — |
| 4.0 | Text + **Embed** | Same covariance matrix, two ways out. | `#routes` | `<rg-route-fork>` |
| 4.1a | **Embed** + Text + **2 Embeds** | Route 1: a class centre is whatever sits at the smallest total distance from its examples. | `#mean` | `<rg-route-fork compact active="1">` *above the heading*, then `<rg-mean-explorer>`, then `<rg-formula key="riemannian-mean" folded summary="what 'the centre' actually minimises">` |
| 4.1b | Text + **3 Embeds** | To label a new trial, measure it against each centre and take the nearest. | `#classifier` | `<rg-mdm-playground>`, then `<rg-formula key="mdm" folded summary="the decision, and the two distances it compares">`, then `<rg-case-file step="3">` |
| 4.2 | **Embed** + Text + **4 Embeds** | Route 2: flatten a local map first, and any ordinary classifier can read it. | `#tangent` | `<rg-route-fork compact active="2">` *above the heading*, then `<rg-predict key="tangent">`, then `<rg-tangent-explorer>`, then `<rg-formula key="log-map" folded summary="the step that turns a trial into a vector">`, then `<rg-case-file step="4">` |
| 4.3 | Text + **Embed** | Which route? It depends on how much calibration you can ask for. | `#which` | `<rg-method-compare>` |
| 4.4 | Text + **3 Embeds** | Tomorrow's session breaks both — until you redraw the map around it. | `#transfer` | `<rg-predict key="transfer">`, then `<rg-transfer-explorer>`, then `<rg-formula key="recentering" folded summary="one line, and it needs no labels">` |
| 4.5 | Text | A better ruler cannot repair a bad measurement. | `#limits` | — |

**The `compact` route-fork placement is deliberate.** In §4.1a and §4.2 it sits
*above* the section heading, not below it, and shows which branch of the fork
the reader is on. Put it anywhere else and the two routes stop reading as two
routes — which is the single thing Part 4 exists to convey.

§4.4 ends with a four-paragraph aside quoting two opposite notebook results.
Both halves must ship. The positive result alone would misrepresent what
re-centring does.

§4.5 is four `<h3>` blocks (Artifacts / Changing distributions / Weak
validation / Missing neurophysiology). Plain content — rebuild as a four-card
grid.

### Part 5 — Do it yourself

| § | Wix element | Heading | Body copy from | Widgets |
|---|---|---|---|---|
| — | Text | Everything above, derived on screen in five minutes. | `#capstone` | video embed (see below) |
| — | Text + **3 Embeds** + link | You have the whole pipeline. Now run it on real brains. | `#notebook` | `<rg-concept-check>`, then `<rg-case-file step="5">`, then `<rg-next-steps>` |
| — | **Embed** | Every term, in plain words first. | end of `#notebook` | `<rg-glossary>` |
| — | Text | Read beyond the visuals. | `#references` | — |

The capstone video is an ordinary Wix video element. The source is
`public/media/capstone.mp4` with poster `public/media/capstone-poster.jpg` —
upload both to Wix's media manager rather than hotlinking the Pages build.

---

## The Colab link

The notebook button in Part 5 must point at:

```
https://colab.research.google.com/github/Itamar-Avitan/curved-spaces-brain-signals/blob/main/notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb
```

**This is the canonical link and the one to keep current.** It serves whatever
is committed on `main`, so it never goes stale: rebuild the notebook, merge to
`main`, and the link is already correct. There is nothing to re-upload, ever.

Two things about it worth knowing:

- It opens the **`_colab` variant**, not the executed one. That variant carries
  the `python3` kernelspec and the pip-install setup cells Colab needs. The
  `rnd_env`-kernel notebook will not run in Colab.
- It opens a *fresh copy* each time. The reader's edits save to their own
  Drive; nothing they do touches yours.

If you keep a personal Drive copy of the notebook for your own annotated
edits — that copy is yours, and it is **not** what readers get. Do not point
the page at it: a Drive copy goes stale the moment the notebook changes, which
is exactly the problem this link removes.

There is also a download link beside it, `downloads/01_riemannian_eeg_motor_imagery.ipynb`,
served from the Pages build. On Wix, either upload that file to Wix's media
manager and link it, or drop the download link entirely — the Colab route is
the one that matters.

---

## Sizing the embeds

Widget height is not fixed, and there is no number this guide can honestly give
you: Wix sizes an embed box itself, and the widgets reflow to the width they
are given. Set each box against a live Wix preview.

What to expect, by kind:

| kind | behaviour |
|---|---|
| `<rg-formula …folded>` | Starts as a single clickable summary line — short. Grows several hundred pixels when opened. **Give it room to expand, or set the box to auto-height.** This is the one most likely to be clipped. |
| `<rg-term>` | Inline, inside a sentence. See below — this one needs a decision. |
| Explorers (`covariance`, `cone`, `distance`, `mean`, `tangent`, `invariance`, `transfer`), `rg-mdm-playground`, `rg-flat-map`, `rg-signal-covariance` | Tall and interactive; roughly square to landscape. Size against preview. |
| `<rg-route-fork>` | Full-width, short. The `compact` variant is shorter still. |
| `<rg-predict>`, `<rg-case-file>`, `<rg-concept-check>` | Short until the reader answers, then grows. Auto-height. |
| `<rg-method-compare>`, `<rg-glossary>`, `<rg-next-steps>` | Tall, reference-style. |

**`<rg-term>` is the awkward one.** On the preview page it is an inline element
inside running prose — a term you can click to open a definition. A Wix embed
is a block-level box, so you cannot drop it mid-sentence the way `index.html`
does. Two options, both acceptable:

- Put the whole paragraph containing the term into one HTML embed, so the term
  stays inline. Most faithful, but that paragraph then lives in HTML rather
  than in a Wix text element, so it will not pick up Wix's theme typography.
- Drop `<rg-term>` and rely on `<rg-glossary>` at the end of Part 5, which
  defines every term in one place.

The keys used per section, if you take the first option:

| § | `<rg-term key="…">` |
|---|---|
| hero | `covariance-matrix`, `recentering` |
| part-math, 1.1 | `curvature` |
| 1.3 | `geodesic`, `metric` |
| 2.1 | `covariance-matrix`, `off-diagonal`, `spd` |
| 2.2 | `spd-manifold` |
| 3.1 | `swelling` |
| 3.2 | `affine-invariant`, `congruence` |
| 4.1a | `riemannian-mean` |
| 4.1b | `mdm` |
| 4.2 | `log-map`, `tangent-space` |
| 4.3 | `csp` |
| 4.4 | `recentering` |
| 4.5 | `leave-one-group-out`, `potato`, `recentering` |

---

## What does not come across

Three things in the bundle are page-level scripts, not widgets. They look for
specific markup in `index.html` and are written to no-op when it is absent, so
they will not break anything on Wix — but they will not do anything either:

- **`chapter-progress`** — the sticky chapter map with a scroll-progress bar and
  an active-section highlight. Looks for `.chapter-map`. Rebuild with Wix's own
  anchor menu if you want it.
- **`mobile-collapse`** — folds reference-heavy blocks on phones. Looks for
  `data-collapse-mobile`. Wix has its own mobile editor; use that.
- **`review-build`** — the commit/date banner on the GitHub Pages preview. It is
  build-gated and never renders outside the review deployment. Ignore it.

---

## If custom elements are not available

Some Wix plans restrict the Custom Element embed. The fallback is an HTML
iframe embed per widget, each carrying its own copy of the script tag:

```html
<script type="module" src="https://YOUR-HOST/riemannian-eeg-widgets.js"></script>
<rg-mean-explorer></rg-mean-explorer>
```

This works because each iframe is its own document, so the double-registration
problem does not arise. The costs: the bundle downloads once per iframe, iframe
height must be set manually, and the widgets cannot inherit page typography.
Prefer real custom elements when you can.

---

## Verifying the port

Work down this list on the live Wix page, not in the editor preview:

1. **Every widget rendered.** An unrendered custom element shows as blank space,
   not an error — so count, do not scan. The page has **33 embeds**, plus 24
   `<rg-term>` depending on which option you took above:

   | tag | count | | tag | count |
   |---|---|---|---|---|
   | `rg-formula` | 7 | | `rg-flat-map` | 1 |
   | `rg-case-file` | 5 | | `rg-covariance-explorer` | 1 |
   | `rg-predict` | 4 | | `rg-signal-covariance` | 1 |
   | `rg-route-fork` | 3 | | `rg-cone-explorer` | 1 |
   | `rg-distance-explorer` | 1 | | `rg-invariance-explorer` | 1 |
   | `rg-mean-explorer` | 1 | | `rg-tangent-explorer` | 1 |
   | `rg-mdm-playground` | 1 | | `rg-transfer-explorer` | 1 |
   | `rg-method-compare` | 1 | | `rg-concept-check` | 1 |
   | `rg-next-steps` | 1 | | `rg-glossary` | 1 |
2. **Open every folded formula.** Seven of them (`covariance-matrix`,
   `geodesic`, `affine-invariant`, `riemannian-mean`, `mdm`, `log-map`,
   `recentering`). Each should expand without being clipped by its box, and
   each ends with a line naming where the notebook does the same thing on real
   data.
3. **The section numbers are unchanged** — 1.1 through 4.5, in order, with 4.1a
   before 4.1b. The notebook cites these numbers back; renumbering silently
   breaks fourteen cross-references.
4. **The route-fork appears three times**: full at §4.0, `compact active="1"`
   above §4.1a, `compact active="2"` above §4.2.
5. **The Colab button opens the notebook**, and the notebook's first cells run.
6. **Both halves of §4.4's aside are present** — the shift-and-repair result and
   the null result beside it.

---

## When the page changes

The bundle and the prose version independently. If you edit a widget in
`src/widgets/`, run `npm run build` and re-upload `dist/riemannian-eeg-widgets.js`;
the Wix page needs no edit. If you edit prose in `index.html`, update the Wix
text element — nothing needs rebuilding.

`npm run build:all` builds both targets and validates they stay independent.
Run it before any upload.
