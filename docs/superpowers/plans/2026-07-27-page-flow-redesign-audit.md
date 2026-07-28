# Whole-page audit — page flow redesign

Task 14 of [`2026-07-27-page-flow-redesign.md`](./2026-07-27-page-flow-redesign.md).
Read as a reader, not as a diff, in a sitting separate from Task 13.

This document is the record of the audit: what the greps returned, what the
heading-spine test answered, what was fixed, and what is being raised rather
than fixed.

---

## Step 1 — The heading-spine test

### The spine as extracted

`grep -oE '<h[12][^>]*>[^<]*' index.html | sed 's/<[^>]*>//g'`

The first line is empty because the `<h1>` opens on its own line; the hero
headline reads **"What if a recording is *not* a waveform, but a shape?"**

| # | Heading | Section |
|---|---|---|
| — | *What if a recording is not a waveform, but a shape?* | hero (h1) |
| 1 | From the math of curves to your own BCI. | `.learning-route` |
| 2 | Curved things break flat arithmetic | `#part-math` |
| 3 | Gauss found this problem while surveying land. | `#story` 1.1 |
| 4 | A flat map is exact where you centre it, and wrong by more the further you go. | `#flat-map` 1.2 |
| 5 | Einstein's gravity is the most famous case of choosing a distance rule. | `#relativity` 1.3 |
| 6 | Where the analogy stops: our surface bends the other way, and that is lucky. | `#boundary` 1.4 |
| 7 | An EEG trial is a shape, not a squiggle | `#part-eeg` |
| 8 | One trial becomes a table of which electrodes moved together. | `#eeg` 2.1 |
| 9 | Not every table is possible, so they fill a curved cone. | `#cone` 2.2 |
| 10 | Which ruler, and why that one | `#part-use` |
| 11 | The straight average invents strength that was in neither trial. | `#distance` 3.1 |
| 12 | Rewire the amplifier and the straight ruler changes its mind. This one does not. | `#invariance` 3.2 |
| 13 | Two ways to build a decoder | `#part-routes` |
| 14 | Same covariance matrix, two ways out. | `#routes` 4.0 |
| 15 | **Route 1:** a class centre is whatever sits at the smallest total distance from its examples. | `#mean` 4.1a |
| 16 | To label a new trial, measure it against each centre and take the nearest. | `#classifier` 4.1b |
| 17 | **Route 2:** flatten a local map first, and any ordinary classifier can read it. | `#tangent` 4.2 |
| 18 | Which route? It depends on how much calibration you can ask for. | `#which` 4.3 |
| 19 | Tomorrow's session breaks both — until you redraw the map around it. | `#transfer` 4.4 |
| 20 | A better ruler cannot repair a bad measurement. | `#limits` 4.5 |
| 21 | **Everything above, derived on screen in five minutes.** | `#capstone` |
| 22 | You have the whole pipeline. Now run it on real brains. | `#notebook` |
| 23 | Every term, in plain words first. | glossary |
| 24 | Read beyond the visuals. | `#references` |

Bold marks text changed by this task. Rows 15, 17 and 21 are as-shipped after
the fixes below; the "before" text is recorded with each defect.

### Q1 — Do these alone answer "what is Riemannian geometry doing in a BCI?"

**Yes, after the fixes; no, before them.**

Read alone the spine now argues: curvature breaks ordinary arithmetic (2–3) →
a flat map is exact at exactly one point, the one you choose (4) → measuring
distance is therefore a *choice* (5) → and this space's choice bends the
favourable way (6) → the thing being measured is an EEG trial, which is a table
of co-movement (7–8) → those tables occupy a curved cone (9) → so a ruler must
be chosen (10) → the flat one invents strength (11) and moves when you rewire
the amplifier, while this one does not (12) → from one representation and one
ruler, two decoders follow (13–17) → each suits a different calibration budget
(18) → and both break tomorrow unless you re-centre (19).

That is a complete answer, and it is complete at heading level. The specific
thing Riemannian geometry supplies — a distance that survives the recording
chain — is stated in row 12 rather than merely gestured at.

The one gap the spine still has: no heading ever *names* the ruler. Row 12's
"This one does not" is the claim, and rows 10 and 12 together let the reader
recover the referent, but "affine-invariant" appears nowhere in the spine. This
is judged acceptable — it is a proper noun, the spine's job is the argument,
and naming it would trade a claim for a label — and it is recorded here rather
than fixed.

### Q2 — Is any heading a topic rather than a claim?

**Yes: three, of which one was a defect and two are not.**

- **Row 21, `#capstone`, was "Want to see the whole idea get built?"** — a
  question, and the constraint's only sanctioned question is the hero. It is
  also the one heading in the spine that carries no argument. **Fixed** →
  "Everything above, derived on screen in five minutes." The section keeps its
  "Optional deep dive · watch it derived" eyebrow, so the opt-in framing is not
  lost.
- **Rows 10 and 13** ("Which ruler, and why that one", "Two ways to build a
  decoder") are noun phrases, and therefore topics. **Not a defect.** These are
  part-divider titles, not teaching-section headings; spec §5 fixes their text
  verbatim, and the global constraint "headings state the answer" is scoped to
  the teaching-section template of spec §4. Each is followed immediately by a
  paragraph that states the claim. Changing them would break spec §5.
- Rows 1 and 23–24 are structural (route map, glossary, references) and are not
  argument steps.

### Q3 — Any adjacent pair where the second does not follow from the first?

**Yes, one — and it was the most serious finding of this audit.**

Before the fix, rows 14–18 read:

```
Same covariance matrix, two ways out.
A class centre is whatever sits at the smallest total distance from its examples.
To label a new trial, measure it against each centre and take the nearest.
Flatten a local map first, and any ordinary classifier can read it.
Which route? It depends on how much calibration you can ask for.
```

Nothing in the spine says which of those three procedure headings belongs to
which route. Row 18 then asks "which route?" about a pair the spine never
labelled. Worse, the 16→17 transition actively misleads: row 16 completes a
decision procedure ("take the nearest"), and row 17 opens with **"Flatten a
local map *first*"** — read adjacently, "first" parses as the next step in the
same pipeline rather than the opening move of the alternative one. Two headings
that are individually correct describe a single wrong procedure when placed
next to each other.

The cause is Task 11's split of spec §5's single §4.1 into `#mean` (4.1a) and
`#classifier` (4.1b) to preserve section ids. Spec §5's own heading text was
"Route 1 — keep one centre per class…" and "Route 2 — flatten a local map
first…"; the route labels were dropped in the split. The compact
`<rg-route-fork active="1|2">` above §4.1a and §4.2 carries the labelling
visually, but `#classifier` has no fork at all, and the spine has none anywhere.

**Fixed** by restoring the spec's route labels to the headings:

- §4.1a → "Route 1: a class centre is whatever sits at the smallest total distance from its examples."
- §4.2 → "Route 2: flatten a local map first, and any ordinary classifier can read it."

§4.1b needs no label: it now sits between an explicit "Route 1:" and an
explicit "Route 2:", so its membership is unambiguous. Lower-case after the
colon matches the page's existing style (row 6).

Every other adjacent pair follows. 3→4 is carried by "this problem"; 4→5 by
"two rulers disagree, so distance is a choice"; 11→12 by "ruled out the
straight one, so which curved one"; 19→20 by "and here is what no ruler fixes".

---

## Step 2 — The chrome-to-prose count

| Check | Expected | Actual |
|---|---|---|
| `grep -c 'class="lesson-purpose\|class="term-ladder' index.html` | 0 | **0** ✓ |
| `grep -c '<rg-formula' index.html` | 7 | **7** ✓ |
| `grep -c '<rg-case-file' index.html` | 5 | **5** ✓ |

---

## Step 3 — The §3.1 claim audit

`grep -n -i "flat map\|local map\|exact at\|exact where" index.html` — 8 hits,
every one consistent with spec §3.1's copy requirement (*name the point*):

| Line | Text | Verdict |
|---|---|---|
| 147 | "Say exactly where a flat map is right, and why it goes wrong the further you stray from there." | names the point ✓ |
| 206 | "no flat map of a curved surface can keep all its distances right" | Gauss, not a locality claim ✓ |
| 246 | "every flat map must lie" | history card, same ✓ |
| 274 | §1.2 heading: "exact **where you centre it**" | ✓ |
| 530 | "exact only at the point you centre it and wrong by more the further you stray" | ✓ |
| 602 | §4.0: "flattens the neighbourhood into a local map first" | procedural ✓ |
| 661 | §4.2 heading: "flatten a local map first" | procedural ✓ |
| 686 | "a flat map is exact only at the point you centre it, and wrong by more the further you stray" | ✓ |

No phrasing implies the raw Euclidean treatment is locally accurate at an
arbitrary point. `flatMapReadout` whitens by the base before measuring
(`src/widgets/flat-map.ts:47`), and the browser pass below confirms the two
readouts print `0.00 / 0.00` at separation 0 and `4.00 / 23.47` at the maximum,
matching spec §3.1's verified sweep.

---

## Step 4 — Dead CSS sweep

Every class removed by Tasks 9, 11 and 12, in `index.html` and `src/styles.css`:

```
pipe-icon              html:0 css:0      notebook-scope         html:0 css:0
method-guide           html:0 css:0      guide-parts            html:0 css:0
method-table           html:0 css:0      bci-lens               html:0 css:0
method-row             html:0 css:0      analogy-boundary       html:0 css:0
method-purpose         html:0 css:0      bridge-section         html:0 css:0
notebook-path          html:0 css:0      bridge-question        html:0 css:0
concept-to-code        html:0 css:0      bridge-arrow           html:0 css:0
```

**One recorded exception.** `pipeline` reports `html:4 css:0`. All four are the
English word in prose (`index.html:427, 837, 841, 1059`) — "pipelines built on
it took first place", "You have the whole pipeline", "that exact pipeline",
and a reference subtitle. There is no `.pipeline` class and no CSS rule. Not a
survivor.

**One dead rule found and removed.** `.part-divider.do` existed in
`src/styles.css` with no markup using it — see fix F9.

---

## Step 5 — Keyboard and reading pass

Run against `npm run dev` in Chromium at 1440×900 (and 820px for the mobile
disclosure). Probe script was throwaway; results:

| Check | Result |
|---|---|
| All 7 `<rg-formula folded>` render closed by default | ✓ 7/7 `details.open === false` |
| Each opens **and re-closes** with Enter, focus on `<summary>` | ✓ 7/7 |
| `<rg-flat-map>` slider responds to arrow keys | ✓ `0 → 0.02`, readouts track |
| Flat-map readouts agree at the centre | ✓ `0.00 / 0.00` at separation 0 |
| Flat-map readouts diverge at the far end | ✓ `4.00 / 23.47` at separation 4 |
| `<rg-method-compare>` disclosure closed at 820px, opens with Enter | ✓ |
| Focus visible on every stop | ✓ 3px solid outline on all widget/link stops |
| Tab order from the top | ✓ skip link → brand → 5 nav links → 2 hero CTAs → 5 chapter-map links → content, in document order |
| Console / page errors | ✓ none |
| `aria-labelledby` targets resolve | ✓ both (after fix F3 — they did **not** before) |
| Part-divider kicker colours | ✓ four distinct (after fix F9 — Parts 3 and 4 were identical before) |

### Reading the page end to end at 1440px

Three places the argument stalled or repeated. All three are recorded below as
fixes F1, F2 and F10; the rest of the page reads as one argument. Specifically:

- The §1.2 → §3.1 → §4.2 → §4.4 callback chain lands. Each of the three later
  sections says out loud that it is re-using §1.2's sentence, and §1.2's
  takeaway promises exactly that. This is the page's strongest thread.
- The `<rg-case-file>` strip does carry one decision through five beats, and
  beats 3 and 4 quote live numbers from `src/math/spd.ts` rather than prose.
- §3.2's placement as the answer to §3.1's open question works. The takeaway at
  the end of §3.1 explicitly hands off ("does not tell us which ruler to use
  instead"), and §3.2 opens by picking that up.
- §4.5 and the potato aside are the right closing move for Part 4: they cost
  the argument nothing and stop the reader over-claiming.

---

## Check A — Two findings deferred from an earlier task

Verified against the current tree, not assumed.

**A1. `.guide-parts` overview vs. the chapter-map nav.** ✓ **Resolved by Task
13.** `grep -c guide-parts` returns `0` in both `index.html` and
`src/styles.css`. The surviving `<nav class="chapter-map">` lists five parts in
the new order (`index.html:121–130`), matching the topbar's five `nav-links`
and the `.learning-route` copy "Five parts, in order". No stale four-part
description remains anywhere.

**A2. Orphaned "Move 2" / "Move 3" eyebrows on `#mean` and `#classifier`.** ✓
**Resolved by Task 11.** Neither section contains a `<p class="eyebrow">`; both
now open with `<p class="section-index">` (`4.1a`, `4.1b`) followed directly by
the `<h2>`. `grep -c 'Move [123]' index.html` returns `0`, and no "three moves"
framing survives.

---

## Check B — All seven `<rg-formula>` carry `folded`

**✓ 7 of 7.** Counted statically and confirmed in the browser (all seven render
as closed `<details>`).

| Line | Key | `folded` |
|---|---|---|
| 465 | `covariance-matrix` | ✓ |
| 542 | `geodesic` | ✓ |
| 582 | `affine-invariant` | ✓ |
| 629 | `riemannian-mean` | ✓ |
| 654 | `mdm` | ✓ |
| 691 | `log-map` | ✓ |
| 735 | `recentering` | ✓ |

`grep -c '<rg-formula' index.html` = 7 and
`grep -c '<rg-formula[^>]*folded' index.html` = 7 — no unfolded box renders its
steps and worked example permanently open.

---

## Check C — Triage of the deferred minors

Every item is dispositioned. Nothing dropped.

| # | Item | Disposition |
|---|---|---|
| C1 | `formula.ts` `.steps dd` near-duplicates bare `dd` | **Fixed** (F4) |
| C2 | No render test for the formula disclosure | **Not fixed, with reason** |
| C3 | `recentering` identity block not tied to the worked text | **Fixed** (F6) |
| C4 | `glossary.worked.test.ts` log-map `d4` loop is unscoped | **Fixed** (F5) |
| C5 | `flat-map.ts` pixel-proportionality invariant untested | **Fixed** (F7) |
| C6 | `case-file.ts:63,70` straight double quotes | **Fixed** (F8) |
| C7 | §3.2 prose tells the reader to switch presets alone | **Fixed** (F10) |
| C8 | "centre" vs "center" mixed page-wide | **Fixed** (F11) — decision recorded |
| C9 | `#part-routes` shares `.use`; `.part-divider.do` dead | **Fixed** (F9) |

### C2 — why the disclosure render test is *not* added

The reason given ("matches codebase convention") is true but is not the binding
one. The binding one is that **this repo has no DOM test environment**:
`package.json` declares no `jsdom` or `happy-dom`, and `vitest` runs with the
default `node` environment. A render test for `<rg-formula folded>` would
require a new devDependency, and the plan's Tech Stack line is "No new
dependencies". Adding one inside an audit task is out of scope and would be a
test-infrastructure decision, not an audit fix.

The behaviour is not unverified, however — it is verified in the browser by
Step 5 above, for all seven boxes, including open, re-close and focus. Recorded
as a follow-up in "Raised, not fixed" below.

---

## What was fixed

### F1 — Route labels restored to the §4.1a and §4.2 headings *(Q3 defect)*

`index.html:611, 661`. See Q3 above for the full reasoning.

- Was: "A class centre is whatever sits at the smallest total distance from its examples."
- Now: "Route 1: a class centre is whatever sits at the smallest total distance from its examples."
- Was: "Flatten a local map first, and any ordinary classifier can read it."
- Now: "Route 2: flatten a local map first, and any ordinary classifier can read it."

`2026-07-27-page-flow-redesign.md:2251, 2296` still contain the old strings.
Those are Task 11's step instructions and are deliberately **not** edited — the
plan is the record of what each task was told to do, and this document is the
record of what the audit changed afterwards. Rewriting the former would
falsify it.

### F2 — The capstone heading states a claim *(Q2 defect)*

`index.html:813`. "Want to see the whole idea get built?" → "Everything above,
derived on screen in five minutes."

The section's lead paragraph then repeated both the new heading's "five
minutes" and its "derives the whole chain", so its opening was retrimmed:
"A five-minute film for anyone who would rather watch the argument built than
read it. It derives the whole chain on screen: …" → "For anyone who would
rather watch the argument built than read it. The film runs the whole chain: …"

### F3 — `aria-labeledby` → `aria-labelledby`

`index.html:133, 1006`. Both were misspelled with one `l`. `aria-labeledby` is
not a real ARIA attribute, so it is silently ignored: the `.learning-route` and
`.glossary-section` landmarks had no accessible name at all. This fix covered
only `index.html` — `src/` was never checked here, and it turned out to carry
the same misspelling in five more places (`next-steps.ts` ×4,
`signal-covariance.ts` ×1), fixed later in the final review pass. Confirmed
resolved in the browser: both `index.html` `aria-labelledby` targets now
resolve to their `<h2>`.

### F4 — Redundant `.steps dd` rule deleted *(C1)*

`src/widgets/formula.ts`. `.steps dd` set `margin`, `line-height` and `color`
identical to the bare `dd` rule 90 lines above it, differing only in
`font-size` (0.85rem vs 0.84rem) — a 0.16px difference at a 16px root, i.e. not
a difference. Deleted; `dd` inside `.steps` now inherits the bare rule.

### F5 — The log-map worked-example loop is no longer vacuous *(C4)*

`src/glossary.worked.test.ts`. This was the same defect shape that was fixed
nine times elsewhere in this run, and it survived because it was found as an
out-of-scope observation.

```ts
for (const value of [...recenter(M, C), ...logMap(M, C), ...v]) {
  expect(text).toContain(d4(value));
}
```

`v = tangentVector(M, C)` scales only the off-diagonal by √2, so
`logMap(M, C)[0] === v[0]` and `logMap(M, C)[2] === v[2]` are the *same float*.
Against the whole block as one string, the assertions for the displayed vector's
first and third components were satisfied by the `log` matrix rows two lines
above them.

**Demonstrated, not assumed:** with the old loop in place, corrupting the
displayed vector's first entry from `0.2958` to `0.2000` in `src/glossary.ts`
left the suite **green (8 passed)**. With the replacement, the same corruption
turns it **red**.

Replaced with a per-block check that scopes each set of values to the two rows
that actually display it (`  whitened`, `  log`, `  vector`).

### F6 — The re-centring identity block is tied to the computed value *(C3)*

`src/glossary.worked.test.ts`. The test asserted `recenter(M, M) ≈ [1, 0, 1]`
but never asserted that the block the reader sees says so; the displayed
`[1  0] / [0  1]` was free to drift. Now the displayed rows are checked against
`Math.round` of the computed entries. Verified: editing the glossary block to
`[2  0]` turns the test red.

### F7 — The flat-map picture is pinned to the flat-map numbers *(C5)*

`src/widgets/flat-map.ts`, `src/widgets/flat-map.test.ts`. The widget's whole
correctness claim — both panels drawn at one shared `PX_PER_UNIT` so the
visibly longer gap is the numerically larger one — was carried by module-private
constants and verified only by an uncommitted ad hoc script. This file has
already shipped a picture-contradicts-numbers defect once.

The layout arithmetic was extracted from `render()` into an exported pure
function `flatMapLayout(readout)` returning `{ leftX, rightX, leftArcHeight,
overflowing }`, and `render()` now calls it — so the test exercises the same
code the widget draws with, rather than re-deriving it (which would only assert
that the test can do arithmetic). Five invariants added:

1. both panels are laid out at one shared pixels-per-unit, across a sweep;
2. the smaller number is never drawn as the longer gap;
3. the flat track is filled exactly at `MAX_SEPARATION` and never overflows;
4. the globe point stays inside its own track, so the panels never collide;
5. at separation 0 both points sit on their anchors and the arc collapses.

**Mutation-tested.** `LEFT_ANCHOR_X 45 → 120` → red. Deriving `MAX_FLAT` at
separation 3 instead of `MAX_SEPARATION` → red (2 tests). Giving the globe
panel its own scale — the actual shipped defect — → red (3 tests). The suite is
green unmutated.

### F8 — Curly quotes in `case-file.ts` *(C6)*

`src/widgets/case-file.ts:63, 70`. `"left"`, `"right"`, `"real"` → `“left”`,
`“right”`, `“real”`, matching sibling widgets and the page.

The same sweep found 14 straight apostrophes and one straight quote pair in
`index.html` — all of them inside §4.1a, §4.1b, §4.2, §4.4, §4.0 and the
notebook stages, i.e. exactly the copy written by Tasks 11 and 12, while every
older paragraph used `’`. Normalised.

### F9 — Part 4 gets its own divider colour; dead `.do` rule removed *(C9)*

`index.html:586`, `src/styles.css:838`. `#part-routes` carried
`class="part-divider use"`, so Part 4's kicker rendered in Part 3's violet —
two consecutive parts, indistinguishable. Meanwhile `.part-divider.do` was
defined and never used (Part 5 is not a `.part-divider`; it uses an
`.eyebrow violet` instead).

Both resolved together: `#part-routes` → `class="part-divider routes"`, and
`.part-divider.do` → `.part-divider.routes`, keeping `var(--coral)`. Verified in
the browser — the four dividers now compute to four distinct backgrounds
(`b08316`, `1ca9a0`, `6c4eb9`, `ef6b5b`).

### F10 — §3.2's instruction now matches what the widget does *(C7)*

`index.html:577`. The prose said "Try each preset below and see which of the two
numbers moves." `<rg-invariance-explorer>` initialises `amount = 0`, and at
`amount = 0` `lerpMixing(target, 0)` is the identity for every preset — so
switching presets alone changes the label and the blurb and nothing else. A
reader following the instruction literally sees both numbers hold still and
concludes the section's claim is trivial.

Now: "Pick a preset below, then push the slider up — the recording changes, the
brain does not. Watch which of the two numbers moves."

### F11 — "centre" / "center" normalised *(C8)* — **a decision, recorded**

This one required choosing a house spelling rather than applying an obvious
fix, so the reasoning is recorded in full.

The mixture was not cosmetic. It collided at three seams a reader meets in one
screen: §3.1's "class center" against §4.1a's heading "A class centre"; §4.4's
"re-centre each session on its own mean" directly above
`<rg-transfer-explorer>`'s button reading "Re-center each session"; and §4.1a's
heading directly above `<rg-mean-explorer>`'s "Riemannian center" /
"compare centers".

**Decision: British `centre` for all reader-visible text; American identifiers
untouched in code.** The deciding argument is that spec §5 fixes the section
heading text verbatim and the global constraints forbid changing it — and those
frozen headings are British ("exact where you **centre** it", "one **centre**
per class"). The headings cannot move, so everything else must move to them.
Supporting: `index.html` prose was already 24:5 British, the spec document is
British throughout, and the four widgets written by this plan (`flat-map`,
`case-file`, `route-fork`, `method-compare`) are British.

Applied to `index.html` and to reader-visible strings in `glossary.ts`,
`predictions.ts`, `concept-check.ts`, `distance-explorer.ts`, `mean-explorer.ts`,
`mdm-playground.ts`, `transfer-explorer.ts`. Code identifiers are deliberately
**not** touched — `recenter()` in `src/math/spd.ts`, `yCenter`, `centers[]`,
`center: DiagonalMatrix2`, and every CSS `align-items: center` — because they
mirror the maths library, not the prose.

Two knock-on changes were required and made:

- `src/glossary.ts` `recentering.term`: `"Re-centering"` → `"Re-centring"`, so
  the term popover's title matches the page text that opens it.
- `index.html:150`: the outcomes bullet's bare "re-centring" is now wrapped in
  `<rg-term key="recentering">`. Required because `audit:terms` searches for the
  glossary `term` string in prose and would otherwise have flagged it as used
  before it is introduced. This is an improvement independently — the reader now
  meets the term with its definition one click away, matching the
  `covariance-matrix` bullet directly above it.

`npm run audit:terms` is clean after the change.

**Reversible.** If the human prefers American spelling, the correct move is to
change spec §5's heading text first and then re-run the sweep in the other
direction — not to revert this commit piecemeal.

### F12 — `"✓ Re-centerd"` typo on a live button

`src/widgets/transfer-explorer.ts:485`. Found during F11's sweep, not on the
deferred list. The button's pressed state read **"✓ Re-centerd"** — a
misspelling shown to every reader who used the widget. Now "✓ Re-centred".

### F13 — Hero lede no longer repeats the hero headline

`index.html:66`. The `<h1>` asks "What if a recording is *not* a waveform, but
a shape?" and the lede's first clause answered it by restating it word for
word: "A recording is not a waveform, but a shape — and …". The page's first
two lines said the same thing twice, and the lede spent its opening on an echo
instead of on content.

Now: "Which electrodes moved together, not what any one of them did. Shapes
like that live on a curved surface, where flat arithmetic gives wrong answers —
and the geometry that measures them is the one thing that survives a change of
hardware."

This answers the headline with the actual object and states spec §2's spine
sentence in the first paragraph of the page, which it previously did not.

### F14 — Part 2's competition claim is now checkable *(closes R1, fix round 1)*

`index.html:427`. Added in fix round 1, after the coordinator supplied the
source I had not found: `review-notes/riemannian_eeg_reference.md` §4.3, which
carries the full table fetched from Barachant's own competition page.

**The sentence was verified against the table before anything was changed, and
every element of it holds.** The table lists six first places; the page says
five, and the excluded one is exactly the one that should be excluded:

| Competition | Year | Place | Teams | In the claim? |
|---|---|---|---|---|
| DecMeg2014 — Decoding the Human Brain | 2014 | 1st | 267 | ✓ |
| BCI Challenge @ NER 2015 (Kaggle/Inria) | 2015 | 1st | 260 | ✓ (the floor) |
| Grasp-and-Lift EEG Detection (Kaggle) | 2015 | 1st | 379 | ✓ |
| Microsoft Decoding Brain Signals | 2016 | 1st | 688 | ✓ (the ceiling) |
| Melbourne Univ. AES/MathWorks/NIH Seizure Prediction | 2016 | 1st | 478 | ✓ |
| Biomag 2016 — Competition 3 | 2016 | 1st | **6** | ✗ correctly excluded |

- **"five", not six** — the reference file says explicitly of the Biomag entry,
  "do not cherry-pick it". Excluding it is what makes "260 to 688 teams" true.
- **"260 to 688"** — the exact min and max of the five included fields.
- **"between 2014 and 2016"** — the exact span.
- **"neural-decoding", not "BCI"** — the reference file flags that the seizure
  -prediction win is not a BCI task and warns against "five BCI competitions".
  The page already says neural-decoding.

So the wording was already the defensible form and was **not** softened, per
instruction. Only the citation was missing.

Two changes, because the page had no in-prose citation pattern to follow —
before this, `index.html` contained zero prose links outside the nav and the
references list itself:

1. **A tenth reference entry**, placed fifth so it sits with the four
   Riemannian papers rather than among the tooling links, and
   `data-collapse-mobile` updated from "the nine sources" to "the ten sources".
2. **The claim itself now links to the source**, wrapping the phrase "five
   international neural-decoding competitions". Linking the phrase rather than
   the whole sentence puts the reader one click from the actual table.

`.part-divider > p a` is a new rule and is deliberately quiet: it inherits the
paragraph colour, borrows `text-underline-offset: 4px` from
`.references-inner a`, and introduces no new colour — the global constraint is
"no visual redesign". `:focus-visible` was added to the existing shared
page-CTA focus rule rather than given its own.

Verified in Chromium: exactly one in-prose citation, link text is the intended
phrase, the sentence is byte-identical to before (the reflow did not eat a
space), the link computes to the same colour as its paragraph
(`rgb(101, 108, 124)`), the focus ring is the page's shared 3px cyan, ten
references render in the intended order, and no console errors.

---

## Raised, not fixed

Each of these is a decision or a scope call rather than a fix, and is recorded
here rather than guessed at. R1 was in this list after the first pass and has
since been closed — see F14.

### R1 — Part 2's competition claim was uncheckable — **resolved, see F14**

Raised in the first pass, closed in fix round 1. The finding was right about the
gap and wrong about the remedy: the claim is not unsourced, only uncited. It
needed a citation, not a decision. Moved to "What was fixed" as F14.

### R2 — Widget disclosure behaviour is browser-verified but not test-guarded

Per C2 above. Adding it needs a DOM test environment (`jsdom` or `happy-dom`),
which is a new devDependency and therefore a decision for the human, not an
audit fix. If taken up, the same harness would also cover
`<rg-method-compare>`'s mobile disclosure and `<rg-term>`'s popover.

### R3 — `-ise` / `-ize` is still mixed page-wide

Distinct from C8 and deliberately out of scope. `index.html` has "summarise"
(439) next to "summarizes" (966), "generalised" (211) next to "modeling" (976).
Unlike "centre", these are ordinary verbs, not terms of art: no two spellings
of the same word appear at a seam, no heading is affected, and none of them
names a concept the page teaches. Sweeping them would touch prose in every
section for no comprehension gain. Recorded so the next copy pass can settle it
in one move.

### R4 — The `transfer-caveat` block was left untouched, including its spelling

`index.html:736–752`. Marked `<!-- PROVISIONAL -->` and rewritten by
`2026-07-27-notebook-realignment.md` Task 6 once E2/E3 produce real numbers.
Deliberately not edited here, per spec §9.4 and the standing instruction.

**One consequence to hand forward:** it is now the only block in `index.html`
still using American "centers" / "re-centering" (lines 743, 746). The rewrite
should use "centres" / "re-centring" to match the rest of the page after F11.

### R5 — No heading names the ruler

Per Q1 above. Judged acceptable, recorded for visibility.

---

## Step 7 — Final verification

| Command | Result |
|---|---|
| `npm run test` | **6 files, 63 tests passed** (was 58 — F5, F6 and F7 added 5) |
| `npm run build:all` | **clean** — `tsc --noEmit` clean, both targets built, `validate-pages-build.mjs` and `validate-build-targets.mjs` pass |
| `npm run audit:terms` | **clean** — "No term is used before it is introduced, and every link resolves. ✓" (19 terms) |

`grep -o 'rg-[a-z-]*' dist/riemannian-eeg-widgets.js | sort -u` registers 21
matches, but two are not custom elements — `rg-interaction` (a CSS class) and
`rg-term-open` (an event name). The actual count of `@customElement`
definitions is **19**, including all four new ones — `rg-flat-map`,
`rg-case-file`, `rg-route-fork`, `rg-method-compare`.
