# Bounded fidelity instead of a broad simulation

Accepted. Preserve the fixed board, independent movement/eating, rule matching, mistakes, roaming threat, safe cells and board completion. Use two enemy behaviors and six patches per run. The manual documents five roles but does not specify exact timings; pretending to reproduce those constants would misrepresent fidelity. A pure simulation separate from the DOM makes time and collision behavior reviewable and repeatable. Saves are versioned and validated, and resume paused to avoid surprise losses.
