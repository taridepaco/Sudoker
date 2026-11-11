// Puzzle generator.
// 1. A random full grid, by backtracking with a random digit order.
// 2. Digging: cells are visited in random order and emptied only if the puzzle can still be
//    solved by logic with the techniques allowed for the level. That guarantees a unique
//    solution without any search. Each cell is tried once: if it cannot go now, it never can.
//    The check stops as soon as the emptied cell is deduced again (same result, faster).
// 3. Rating: the hardest technique needed. If it does not match the level, try again.
import { solve } from './search.js';
import { logicSolve } from './techniques.js';

export const LEVELS = {
  easy: { maxT: 2, floor: 36, accept: (t) => t <= 2 },
  medium: { maxT: 3, floor: 0, accept: (t) => t === 3 },
  hard: { maxT: 6, floor: 0, accept: (t) => t >= 4 },
};

/** Small seedable random generator, for tests and reproducible puzzles. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n, rng) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function fullGrid(rng = Math.random) {
  return solve(new Int8Array(81), 1, rng).solutions[0];
}

export function dig(solution, maxT, floor = 0, rng = Math.random) {
  const p = Int8Array.from(solution);
  let givens = 81;
  for (const c of shuffled(81, rng)) {
    if (givens <= floor) break;
    const d = p[c];
    p[c] = 0;
    if (logicSolve(p, maxT, c).solved) givens--;
    else p[c] = d;
  }
  return p;
}

/** Returns { puzzle, solution, level, technique, tries }. */
export function generate(level = 'medium', rng = Math.random, maxTries = 500) {
  const L = LEVELS[level] || LEVELS.medium;
  let last = null;
  for (let k = 1; k <= maxTries; k++) {
    const solution = fullGrid(rng);
    const puzzle = dig(solution, L.maxT, L.floor, rng);
    const { max } = logicSolve(puzzle);
    last = { puzzle, solution, level, technique: max, tries: k };
    if (L.accept(max)) return last;
  }
  return last;
}
