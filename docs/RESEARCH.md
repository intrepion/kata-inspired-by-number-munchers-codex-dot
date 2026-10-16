# Gameplay research and fidelity ledger

Researched 2026-10-16 before implementation. No original game code, art, music or manual text is shipped.

## Sources
1. **Primary:** MECC, *Number Munchers User's Guide*, Apple II Version 1.x, January 1987, latest printing June 1991, ISBN 0-87490-398-X. [Archived scan](https://archive.org/details/MECC_a-170_number_munchers), [searchable OCR](https://archive.org/download/MECC_a-170_number_munchers/MECC_a-170_number_munchers_djvu.txt). Downloaded and read the complete OCR. Printed pp. 1–6 establish the rules below.
2. **Observed gameplay account:** Belgin Seymenoglu, [Chalkdust, 11 December 2020](https://chalkdustmagazine.com/blog/review-number-munchers/). Describes the DOS game with screenshots, 5×6 board, arrows and Space, mistakes, pursuit, board changes and completion. Useful independent cross-check, not a timing specification.
3. **Later port description:** MotivCode, [Number Munchers App Store listing](https://apps.apple.com/ua/app/number-munchers/id341982973). Describes touch-to-move/double-touch-to-eat and 250 levels; this is a later mobile port, not evidence for original Apple II controls or difficulty constants.

## What the primary manual actually establishes
- pp. 1–2: explicit movement and eating, wrong-answer/contact loss, four initial lives; extra lives at 1000 and 10,000 points.
- p. 3: arrows (where supported), A/Z/J/K alternatives; Space to eat; time-out freezes the game but costs score.
- pp. 4–5: Multiples, Factors, Primes, Equality and Inequality. The last means expressions **not equal** to the target, not less-than comparison. Equality supports +, −, × and ÷. We calculate structured operands without eval.
- p. 4: safe cells exclude enemies, are corner-marked and temporary; disappearance may be without warning.
- pp. 2–3: Reggies replace occupied answers, Helpers remove answers, Workers fill empty cells, Bashfuls retreat when near, Smarties hunt. The manual's text does not specify a straight-line Reggie motion algorithm; that pattern is reported by secondary accounts. Our Drifter is an original straight-line hazard, not a full Reggie recreation.
- p. 6: clearing all matching cells advances; enemy number/variety/speed increase, shelters decrease; cartoon after three cleared boards.
- p. 4: levels 1–3 give 5 points per correct answer, later point schedule varies.

## Differences and uncertain claims
The DOS account lists a “less than 12” example while the Apple II manual explicitly defines Inequality as not equal. We use the primary manual's definition. DOS controls and artwork differ from earlier Apple II machines; mobile navigation differs again. Do not collapse these into one exact version.

The primary source does **not** provide exact enemy spawn delays, movement intervals, safe-zone lifetimes, levels with 1/2/3 enemies, or all pathfinding details. Secondary summaries claim additional timing/level thresholds and enemy cannibalism; those were not treated as verified primary rules. No frame-accurate comparison was performed.

## Implemented bounded slice
Fixed six columns/five rows; separate directional steps and Space harvest; all five selectable math rules; four lives; wrong-answer explanation/contact loss; clear all matches; six-patch run; increasing threat; temporary corner-marked shelters; straight Drifter and pursuing Tracker. Original timings and save behavior are specified in SPEC.md. Safe-zone preview/countdown is a deliberate readability improvement. Drifter does not rewrite cells. Omitted: other three enemy roles, rewriting, cannibalism, cartoons, teacher options, challenge mix, extra lives, original scoring curve and infinite progression. Free pause, recovery protection and exact local run saving are original conveniences. This is inspired gameplay, not an emulator or authorized remake.
