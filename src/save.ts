import { remaining } from "./game";
import type { Game, Status } from "./game";
import { expression, modes, ruleFor } from "./math";
import type { Operator, Seed } from "./math";
export const SAVE_KEY = "lumen-orchard.save.v1";
export type Best = { score: number; patch: number };
export type Save = { game: Game; best: Best };
type StoragePort = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
function validSeed(v: unknown): v is Seed | null {
  if (v === null) return true;
  if (
    !record(v) ||
    typeof v.label !== "string" ||
    typeof v.value !== "number" ||
    !Number.isFinite(v.value)
  )
    return false;
  if (String(v.value) === v.label && integer(v.value, 1, 999)) return true;
  const parts = /^(-?\d{1,3}) ([+−×÷]) (-?\d{1,3})$/.exec(v.label);
  return (
    !!parts &&
    expression(Number(parts[1]), parts[2] as Operator, Number(parts[3]))
      .value === v.value
  );
}
function validGame(v: unknown): v is Game {
  if (
    !record(v) ||
    !modes.some((m) => m === v.mode) ||
    !integer(v.level, 1, 6) ||
    !integer(v.seed, 0, 4294967295) ||
    !integer(v.player, 0, 29) ||
    !integer(v.lives, 0, 4) ||
    !integer(v.score, 0, 1000000) ||
    !integer(v.time, 0, 86400000) ||
    !integer(v.invulnerableUntil, 0, 86402000) ||
    typeof v.message !== "string" ||
    v.message.length > 400
  )
    return false;
  if (
    typeof v.status !== "string" ||
    !["ready", "playing", "paused", "hurt", "cleared", "over", "won"].includes(
      v.status,
    )
  )
    return false;
  if (
    !record(v.rule) ||
    v.rule.mode !== v.mode ||
    v.rule.target !== ruleFor(v.mode as Game["mode"], v.level).target
  )
    return false;
  if (
    !Array.isArray(v.cells) ||
    v.cells.length !== 30 ||
    !v.cells.every(validSeed)
  )
    return false;
  if (v.shelter !== null && !integer(v.shelter, 0, 29)) return false;
  if (!Array.isArray(v.enemies) || v.enemies.length !== (v.level >= 4 ? 2 : 1))
    return false;
  if (
    !v.enemies.every(
      (e: unknown, i: number) =>
        record(e) &&
        e.kind === (i === 0 ? "drifter" : "tracker") &&
        integer(e.position, 0, 29) &&
        (e.direction === 1 || e.direction === -1) &&
        typeof e.active === "boolean" &&
        integer(e.spawnAt, 0, 86420000) &&
        integer(e.nextMoveAt, 0, 86420000),
    )
  )
    return false;
  if ((v.status === "over") !== (v.lives === 0)) return false;
  const game = v as unknown as Game;
  const left = remaining(game);
  if (["cleared", "won"].includes(game.status) && left !== 0) return false;
  if (
    (game.status === "cleared" && game.level === 6) ||
    (game.status === "won" && game.level !== 6)
  )
    return false;
  if (
    ["ready", "playing", "paused", "hurt"].includes(game.status) &&
    left === 0
  )
    return false;
  return true;
}
export function encode(game: Game, best: Best): string {
  return JSON.stringify({ version: 1, game, best });
}
export function decode(raw: string): Save | null {
  try {
    if (raw.length > 20000) return null;
    const v: unknown = JSON.parse(raw);
    if (
      !record(v) ||
      v.version !== 1 ||
      !validGame(v.game) ||
      !record(v.best) ||
      !integer(v.best.score, 0, 1000000) ||
      !integer(v.best.patch, 0, 6)
    )
      return null;
    const game = v.game;
    if (game.status === "playing") game.status = "paused" satisfies Status;
    return { game, best: { score: v.best.score, patch: v.best.patch } };
  } catch {
    return null;
  }
}
export function readSave(storage: StoragePort): Save | null {
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? decode(raw) : null;
  } catch {
    return null;
  }
}
export function writeSave(
  storage: StoragePort,
  game: Game,
  best: Best,
): boolean {
  try {
    storage.setItem(SAVE_KEY, encode(game, best));
    return true;
  } catch {
    return false;
  }
}
