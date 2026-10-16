# Lumen Orchard — settled design

User delegates recommended defaults. Grill frontier resolved before implementation:
- Reference: Apple II v1.x manual rules; modern arrow/WASD and Space controls; fixed top-down 6×5 grid, no camera scrolling, no click-to-answer.
- Original garden setting, keeper character, thorn silhouettes, interface and synthesized sounds.
- Five selectable categories. Default Multiples; each run has six patches. Rules grow after each patch. Other categories can be started from the menu.
- A run starts with four lives. Correct harvest = 5 points per patch number. Wrong harvest loses a life, leaves seed untouched and explains the mistake. Thorn contact loses a life. Both stop play until explicit recovery. Recovery resets enemies and gives 2 seconds of protection.
- Clear all matching cells to complete a patch. Explicit next-patch action; six patches finish a run. No teacher settings, high-score names, extra lives or cartoons.
- Two enemy roles: straight horizontal Drifter from patch 1, pursuing Tracker from patch 4. Both block at shelters. One Drifter arrives after 8 active seconds, Tracker after 14; movement interval 1 second decreasing 70ms per patch, floor 550ms. Enemies depart at edges and reappear after 4s. No board rewriting, helpers, workers, bashfuls or cannibalism.
- One shelter moves every 7 active seconds, remains for 5 seconds, marked with corners/countdown. If it appears under a thorn, remove that thorn. Timings are original design choices, not verified original constants.
- Pause freezes simulation; hidden tab/window blur pauses. No elapsed-time catch-up. Restart starts a new run in selected category. Local save resumes exact patch, cleared cells, lives, score, timers, enemies and progression, paused on reload. Best completed patch/score retained independently. Bad/unavailable storage must not prevent play.
- Touch direction pad and Eat support basic use; keyboard desktop is primary.

## Test seams (authorized by requested behavioral coverage)
Pure math evaluation/generation; public game commands (move, harvest, advance, recover, pause, tick); save encode/decode and storage adapter. Tests observe player-visible state transitions. Independent reviews cover code standards and this spec/fidelity. Browser QA uses normal inputs only.
