# Verification record

## Automated validation

- Strict TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, unused locals/parameters. `npm run typecheck` passed.
- `npm test`: **19 behavioral tests across three files passed**.
- Mathematical worked examples cover divisibility direction, nonprimes including 1 and squares, all four expression operations, and not-equal semantics. Generation checks all five categories over all six patches, exactly ten matches and finite values, plus expanding prime range.
- Game tests cover orthogonal bounded movement without automatic eating; explicit correct eating; wrong-answer life loss/explanation and frozen recovery; completion/progression through six patches; exact 8-second Drifter and 14-second Tracker arrival; movement intervals; pause; both collision directions; four-loss game over; recovery protection; shelter exclusion/expiry/relocation/removal; pursuit; Drifter departure/four-second respawn; bounded frame catch-up and paused input.
- Save tests cover exact board/time/score restoration paused, corrupt JSON/schema/position/value rejection, non-string status rejection, disabled/full storage, completion state and retained best on a fresh run.
- `npm run build` and `git diff --check` passed. Dependency audit: zero reported vulnerabilities at install.

## Independent reviews

Two independent reviewer agents assessed the implementation against the design baseline `9281ffb`, following the Matt Pocock code-review skill. Standards review found malformed save-status acceptance and hidden-overlay Enter interception. Both fixed; added malformed-status regressions and Mac keyboard checks for native buttons. Fidelity review found inaccurate Tracker departure wording and unchanged prime difficulty; clarified departure scope, expanded prime ranges and updated progression copy/tests. Both reviewers rechecked the changes: no remaining material findings, 19 tests and strict types pass.

## Normal-input Mac browser QA

Chrome on the connected Mac, production build at `http://127.0.0.1:5222/`. No game-state injection, debug commands, save editing or simulation clock overrides used.

1. Started Multiples with Enter. Intentionally ate 25 under “multiples of 2” with Space: life dropped 4→3, explanatory overlay appeared, board retained the seed.
2. Recovered with Enter. Used arrows and Space to harvest six matching seeds, paused with P. Reload restored six empty cells, 30 points, three lives, position and paused state.
3. Resumed and harvested the remaining four matches. Completion displayed zero matches, 50 points and next-patch action.
4. Advanced to patch two: target changed to multiples of 3. Moved into the top-left entry lane and allowed the Drifter to arrive: contact reduced lives 3→2, with enemy-contact explanation.
5. Recovered, paused, reloaded: patch two, 50 points, two lives and recovery state persisted paused.
6. Resumed, focused New run and pressed Enter: returned to patch one with four lives and zero current score, retaining personal best 50 points / one completed patch.
7. Focused Pause and pressed Enter during active play: paused successfully. Captured [actual gameplay screenshot](screenshots/mac-chrome.jpg), then left the delivered tab paused.
8. Visual QA caught the original tall desktop layout clipping the board below the fold. Added short-height desktop styling. Verified all five rows visible together at the Mac's existing viewport. No browser/security/lock settings changed.

## Scope and unverified behavior

- Manual browser run completed **one grid**, not a full six-patch campaign. Full progression/win, Tracker pursuit and timing, other-category arithmetic, save corruption and storage failure are automated-test coverage, not claims of manual full playthroughs.
- Windows, Linux, Safari, Firefox, physical touch devices, narrow mobile layout, screen-reader navigation and audible audio output were not independently exercised. Responsive styles and onscreen controls are implemented; desktop Chrome keyboard is the verified primary experience.
- Frame-accurate original timing and the omitted enemy species are outside scope. See RESEARCH.md.
- Only this new workspace and its namespaced save were modified. Existing projects/previews, including Seer, were not opened or edited. Existing listeners were inspected; 5222 was bound successfully with strict-port behavior. The production preview is detached, loopback-only; logs/PID and dependencies/build output are ignored.
- Publication and exact-SHA CI are reported in the final delivery rather than baked into a commit that would change that SHA.
