# Whole-artifact audit — page and notebook read together

Task 8 of `2026-07-27-notebook-realignment.md`. The failure this whole project
exists to fix was two artefacts that were each individually fine, so the point
of this pass is the seam between them, not either one alone.

Audited at `c13b503` + working changes. Notebook re-executed fresh before
reading.

---

## Step 1 — the notebook, read end to end as a learner

**Execution health.** 35 code cells, 34 carrying outputs, **0 error outputs,
0 stderr streams**. The one bare cell is a pure `def` block for the exercises
that legitimately prints nothing.

**Every name is bound before it is used.** Checked statically rather than by
eye: parsed every code cell in order with `ast`, accumulated the names each
cell binds (assignments, imports, defs, comprehension targets, `with` and
`except` bindings, function arguments), and confirmed no cell loads a name that
no earlier cell bound. Zero unbound names top to bottom. This is the check that
would have caught the two execution-order bugs earlier tasks found by hand.

**Every figure has a stated reading.** Checked programmatically: every code
cell whose output includes a PNG is followed by either an in-cell
`display(Markdown(...))` takeaway or a markdown cell. No figure is left for the
reader to interpret alone.

### One defect found and fixed

**A `SyntaxWarning` printed into the reader's own output.**
`notebooks/build_notebook.py:1423` emitted a cell containing
`f"…$\sqrt{2}$…"` — a non-raw f-string with an invalid escape sequence. Python
warned on it every time that cell ran, so a learner following along saw
`SyntaxWarning: invalid escape sequence '\s'` in their notebook with no
explanation and nothing wrong with their own work.

The fix is narrower than it looks. The enclosing builder block is itself a
non-raw triple-quoted string, so simply adding `r` to the emitted string moves
the warning up a level and breaks the builder instead — I did exactly that
first, and `py_compile` with `-W error::SyntaxWarning` caught it. The correct
form keeps `\\sqrt` in the builder *and* adds the `r` prefix to the emitted
string. Both levels now compile warning-free, and the executed notebook has
zero stderr streams.

---

## Step 2 — do the page and the notebook agree?

**Page → notebook.** All 7 folded math boxes carry a `notebook` line, and every
section named exists in the built `.ipynb` (`0, 2, 3, 4, 5, 6.2, 6.4, 6.4b`
against a built inventory of `0–8, 5b, 6.1, 6.2, 6.3, 6.4, 6.4b, 6.5`). Each
also does what the box claims:

| formula box | claims the notebook | it does |
|---|---|---|
| `covariance-matrix` | §2 builds one from every real trial | ✓ §2 is exactly that |
| `geodesic` | §3 walks this path between real class means, and measures where the flattened map is still exact | ✓ both, the second added by Task 5 |
| `affine-invariant` | §6.2 tries to move this number and cannot | ✓ change is exactly 0.0000, asserted |
| `riemannian-mean` | §0 iterates it from scratch against pyRiemann, §3 computes it on real class means | ✓ both |
| `mdm` | §4 is this decision on real EEG, one held-out run at a time | ✓ Route 1 under leave-one-group-out |
| `log-map` | §5 turns every real trial into a vector, then plots the map | ✓ Route 2 + "What the local map actually looks like" |
| `recentering` | §6.4 after an injected shift, §6.4b where there was none | ✓ both, and the pairing is the point |

**Notebook → page.** 14 citations of the form *"On the page: §X, «heading»"*.
All 14 resolve, **and every quoted heading matches the page's real heading**
after whitespace normalisation — checked against the built `.ipynb`, not the
builder source, so what a reader actually sees is what was verified. A number
that exists with the wrong title attached would be worse than a bare number;
none does.

---

## Step 3 — every claim about CSP

Spec §9.3 names a claim that is false and easy to make by accident: that the
rewiring experiment shows Riemannian surviving a hardware change while CSP
fails. It does not. CSP + LDA is congruence-invariant too.

**Page — 4 mentions, all clean.**
- §4.3 introduces CSP + LDA as the strong task-specific baseline a credible
  study reports against. Correct framing.
- Part 5's panel says the covariance methods led *here* at two trials per class,
  that the ordering **flips** at ten, and that "the honest summary is not
  'Riemannian wins'". Verified against the notebook's own table: at 10
  trials/class CSP 0.978 vs MDM 0.967 vs tangent 0.972 — CSP does edge ahead.
- **The new §3.2 rewiring paragraph does not mention CSP at all**, so no
  juxtaposition can produce the forbidden reading. This was the one place the
  claim could have crept in by adjacency rather than by assertion.

**Notebook — 13 mentions, all clean**, and better than merely clean. §6.2
carries an explicit "One thing this does not show" paragraph stating that CSP +
LDA is congruence-invariant because its generalised eigenvalues are unchanged
by `C ↦ GCGᵀ`, and naming the honest contrast as the naive Euclidean treatment.

It also draws a distinction I want to record because it is subtle and correct:
CSP's *own component selection* is rank-reducing and therefore **not**
invertible, so it is not in the congruence family — alongside the common
average reference, which is rank `n−1` with determinant zero. Both change the
covariance's rank, not just its scale. So "CSP + LDA is congruence-invariant"
and "a CSP rank-reduction is not a congruence" are both true and the notebook
says both, in the right places.

---

## Step 4 — is any number on the page unsourced?

Extracted every numeral from the page's reader-visible text and traced each.
Excluding SVG path coordinates, font weights, part numbers, section indices and
historical dates, every substantive number resolves:

| page | claim | source |
|---|---|---|
| §3.1 | relative area climbs past 1.00, holds at 1.00 | `rg-distance-explorer` computes it live; `det = 1.00` also pinned in `glossary.worked.test.ts` |
| §3.2 | 97.9% before, 97.9% after; 82.4% → 84.5% | executed cell 55 (0.9792/0.9792, 0.8244→0.8452) |
| §4.4 | 97.9% → 54.2% → 92.9%, 88% recovered | executed cell 64 |
| §4.4 | 0.7702 → 0.0000; 97.9 ± 3.6 → 95.5 ± 7.7 | executed cell 67 |
| Part 5 | 84.2 / 94.5 / 94.9 | executed cell 59, `trials_per_class = 2` |
| Part 5 | 82.4 ± 10.4 → 97.9 ± 3.6, +15.5 | executed cell 52 |

**Absent, correctly:** `0.0238` and `0.0268`, §6.4's residual decomposition.
Each is one flipped trial, below the resolution of a 3-fold design whose
re-centred condition has std 0.077. The notebook prints them with an explicit
"read the direction, not the sizes" caveat; the page does not quote them at
all. That is the right split — the notebook can show its working, the page
cannot afford to.

### One defect found and fixed

**The page understated its own noise floor, in the direction that flatters the
result.** `index.html`'s Part 5 caveat said "a single flipped trial moves the
score about 6 points". Each held-out run has 7 trials of one class and 8 of the
other, so a flip moves that fold's balanced accuracy by **6.25 or 7.14 points**
depending on which class. "About 6" is the low end quoted as the whole range —
and since the sentence's job is to tell the reader which gaps to dismiss as
noise, understating it makes small gaps look more meaningful than they are.
Rewritten to state the composition and give 6 to 7 points.

---

## Step 5 — final verification

| check | result |
|---|---|
| `npm run test` | 63/63 pass |
| `npm run build:all` | both targets built and validated independent |
| `npm run audit:terms` | 19 terms, no term used before introduction, every link resolves |
| notebook error outputs | 0 |
| notebook stderr streams | 0 |
| `git status --porcelain data/` | empty |
| builder `SyntaxWarning` under `-W error` | none |

---

## Carried forward

- The Colab CTA points at
  `colab.research.google.com/github/Itamar-Avitan/curved-spaces-brain-signals/blob/main/notebooks/01_riemannian_eeg_motor_imagery_colab.ipynb`.
  **This 404s until the branch is merged to `main`** — expected, and the reason
  the link never goes stale afterwards.
- `docs/wix-port-guide.md` records what only a live Wix session can settle:
  embed sizing, whether the plan allows `type="module"` in a custom-code slot,
  and whether Wix's sanitiser strips unknown tags.
- Rebuilding regenerates fresh random per-cell `id` fields, so every future
  `.ipynb` diff carries ~80 lines of noise per file. Pre-existing and cosmetic.
