import { board, explanation, matches, ruleFor } from "./math";
import type { Mode, Rule, Seed } from "./math";
export type Status =
  | "ready"
  | "playing"
  | "paused"
  | "hurt"
  | "cleared"
  | "over"
  | "won";
export type Command =
  | "start"
  | "left"
  | "right"
  | "up"
  | "down"
  | "eat"
  | "pause"
  | "recover"
  | "next";
export type Enemy = {
  kind: "drifter" | "tracker";
  position: number;
  direction: 1 | -1;
  active: boolean;
  spawnAt: number;
  nextMoveAt: number;
};
export type Game = {
  mode: Mode;
  seed: number;
  level: number;
  rule: Rule;
  cells: (Seed | null)[];
  player: number;
  lives: number;
  score: number;
  status: Status;
  time: number;
  invulnerableUntil: number;
  shelter: number | null;
  enemies: Enemy[];
  message: string;
};
export function createGame(
  mode: Mode = "multiples",
  seed = Date.now() >>> 0,
): Game {
  const rule = ruleFor(mode, 1);
  return {
    mode,
    seed,
    level: 1,
    rule,
    cells: board(rule, seed),
    player: 14,
    lives: 4,
    score: 0,
    status: "ready",
    time: 0,
    invulnerableUntil: 0,
    shelter: 14,
    enemies: enemiesFor(1, 0),
    message: "The orchard is waiting.",
  };
}
function enemiesFor(level: number, time: number): Enemy[] {
  const result: Enemy[] = [
    {
      kind: "drifter",
      position: 0,
      direction: 1,
      active: false,
      spawnAt: time + 8000,
      nextMoveAt: time + 9000,
    },
  ];
  if (level >= 4)
    result.push({
      kind: "tracker",
      position: 29,
      direction: -1,
      active: false,
      spawnAt: time + 14000,
      nextMoveAt: time + 15000,
    });
  return result;
}
export const remaining = (g: Game) =>
  g.cells.filter((s) => s !== null && matches(s, g.rule)).length;
export const interval = (g: Game) => Math.max(550, 1000 - (g.level - 1) * 70);
function hurt(g: Game, message: string): void {
  g.lives--;
  g.message = message;
  g.status = g.lives === 0 ? "over" : "hurt";
}
function collide(g: Game): void {
  if (
    g.status === "playing" &&
    g.time >= g.invulnerableUntil &&
    g.player !== g.shelter &&
    g.enemies.some((e) => e.active && e.position === g.player)
  )
    hurt(g, "A thorn caught your lantern. Watch its path, then try again.");
}
export function command(g: Game, action: Command): void {
  if (action === "start" && g.status === "ready") {
    g.status = "playing";
    g.message = "Move first. Eat only the seeds that match.";
    return;
  }
  if (action === "pause") {
    if (g.status === "playing") g.status = "paused";
    else if (g.status === "paused") g.status = "playing";
    return;
  }
  if (action === "recover" && g.status === "hurt") {
    g.player = 14;
    g.enemies = enemiesFor(g.level, g.time);
    g.invulnerableUntil = g.time + 2000;
    g.status = "playing";
    g.message = "Lantern restored. You have a two-second protective glow.";
    return;
  }
  if (action === "next" && g.status === "cleared") {
    g.level++;
    g.rule = ruleFor(g.mode, g.level);
    g.cells = board(g.rule, (g.seed + g.level * 7919) >>> 0);
    g.player = 14;
    g.time = 0;
    g.shelter = 14;
    g.enemies = enemiesFor(g.level, 0);
    g.invulnerableUntil = 0;
    g.status = "playing";
    g.message = "A fresh patch. Read the rule, then plan your harvest.";
    return;
  }
  if (g.status !== "playing") return;
  const x = g.player % 6,
    y = Math.floor(g.player / 6);
  if (action === "left" && x > 0) g.player--;
  if (action === "right" && x < 5) g.player++;
  if (action === "up" && y > 0) g.player -= 6;
  if (action === "down" && y < 4) g.player += 6;
  collide(g);
  if (action !== "eat" || g.status !== "playing") return;
  const seed = g.cells[g.player];
  if (!seed) {
    g.message = "This cell is empty. Keep looking.";
    return;
  }
  if (!matches(seed, g.rule)) {
    hurt(g, explanation(seed, g.rule));
    return;
  }
  g.cells[g.player] = null;
  g.score += 5 * g.level;
  g.message = "A bright harvest. Keep going!";
  if (remaining(g) === 0) {
    g.status = g.level === 6 ? "won" : "cleared";
    g.message =
      g.status === "won"
        ? "The orchard is glowing. All six patches are restored!"
        : "Every matching seed harvested. Beautiful work.";
  }
}
function candidates(position: number): number[] {
  const x = position % 6,
    y = Math.floor(position / 6);
  return [
    x < 5 ? position + 1 : -1,
    y < 4 ? position + 6 : -1,
    x > 0 ? position - 1 : -1,
    y > 0 ? position - 6 : -1,
  ].filter((p) => p >= 0);
}
function distance(a: number, b: number): number {
  return (
    Math.abs((a % 6) - (b % 6)) +
    Math.abs(Math.floor(a / 6) - Math.floor(b / 6))
  );
}
function depart(e: Enemy, time: number): void {
  e.active = false;
  e.spawnAt = time + 4000;
}
export function tick(g: Game, dt: number): void {
  if (g.status !== "playing" || !Number.isFinite(dt) || dt <= 0) return;
  // Bounded wall-time input prevents background catch-up; simulation advances in small steps.
  const end = g.time + Math.min(dt, 250);
  while (g.time < end && g.status === "playing") {
    g.time = Math.min(end, g.time + 50);
    const cycle = Math.floor(g.time / 7000);
    g.shelter = g.time % 7000 < 5000 ? (14 + cycle * 7) % 30 : null;
    for (const e of g.enemies) {
      if (e.active && e.position === g.shelter) {
        depart(e, g.time);
        continue;
      }
      if (!e.active) {
        if (g.time < e.spawnAt) continue;
        e.position =
          e.kind === "drifter" ? (Math.floor(g.time / 8000) % 5) * 6 : 29;
        // First spawn is the top row; subsequent arrivals cycle rows.
        if (e.kind === "drifter" && e.spawnAt === 8000) e.position = 0;
        if (e.position === g.shelter) {
          e.spawnAt = g.time + 1000;
          continue;
        }
        e.direction = 1;
        e.active = true;
        e.nextMoveAt = g.time + interval(g);
      } else if (g.time >= e.nextMoveAt) {
        e.nextMoveAt = g.time + interval(g);
        if (e.kind === "drifter") {
          const next = e.position + e.direction;
          if (
            next < 0 ||
            next >= 30 ||
            Math.floor(next / 6) !== Math.floor(e.position / 6)
          ) {
            depart(e, g.time);
            continue;
          }
          if (next === g.shelter) e.direction = e.direction === 1 ? -1 : 1;
          else e.position = next;
        } else {
          const choices = candidates(e.position).filter((p) => p !== g.shelter);
          choices.sort((a, b) => distance(a, g.player) - distance(b, g.player));
          if (choices[0] !== undefined) e.position = choices[0];
        }
      }
    }
    collide(g);
  }
}
