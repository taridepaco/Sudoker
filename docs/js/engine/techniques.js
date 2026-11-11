// Human solving techniques, from easiest to hardest:
//   T1 full house · T2 hidden single · T3 naked single          (place a digit)
//   T4 locked candidates · T5 naked pair/triple · T6 hidden pair/triple   (remove candidates)
// Candidates are always computed from the digits on the board, never from the player's notes.
import { ALL, BOX, COL, PEERS, POP, ROW, UNITS, bit, digitOf, digits, inUnit } from './grid.js';

export const MAX_TECHNIQUE = 6;

// Boxes first: it is where people usually look first.
const UNIT_ORDER = [18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const CONTRADICTION = Object.freeze({ contradiction: true });

export function makeState(grid) {
  const v = Int8Array.from(grid);
  const cand = new Uint16Array(81);
  for (let i = 0; i < 81; i++) cand[i] = v[i] ? 0 : ALL;
  for (let i = 0; i < 81; i++) {
    if (!v[i]) continue;
    const m = ~bit(v[i]);
    for (const p of PEERS[i]) cand[p] &= m;
  }
  return { v, cand };
}

export function place(state, i, d) {
  state.v[i] = d;
  state.cand[i] = 0;
  const m = ~bit(d);
  for (const p of PEERS[i]) state.cand[p] &= m;
}

export function applyElimination(state, e) {
  for (const [i, d] of e.removed) state.cand[i] &= ~bit(d);
}

function presentIn(v, u) {
  let m = 0;
  for (const i of UNITS[u]) if (v[i]) m |= bit(v[i]);
  return m;
}

/**
 * Easiest placement available with techniques up to maxT (1-3).
 * Returns { t, cell, digit, unit } (unit: where to look; the box for T3), CONTRADICTION or null.
 */
export function findPlacement(state, maxT = 3) {
  const { v, cand } = state;
  for (const u of UNIT_ORDER) { // T1 full house
    let empty = -1, n = 0, m = 0;
    for (const i of UNITS[u]) {
      if (v[i]) m |= bit(v[i]);
      else { n++; empty = i; }
    }
    if (n !== 1) continue;
    const missing = ALL & ~m;
    if (POP[missing] !== 1 || !(cand[empty] & missing)) return CONTRADICTION;
    return { t: 1, cell: empty, digit: digitOf(missing), unit: u };
  }
  if (maxT >= 2) {
    for (const u of UNIT_ORDER) { // T2 hidden single
      const present = presentIn(v, u);
      for (let d = 1; d <= 9; d++) {
        const b = bit(d);
        if (present & b) continue;
        let n = 0, pos = -1;
        for (const i of UNITS[u]) if (cand[i] & b) { n++; pos = i; }
        if (n === 0) return CONTRADICTION;
        if (n === 1) return { t: 2, cell: pos, digit: d, unit: u };
      }
    }
  }
  if (maxT >= 3) {
    for (let i = 0; i < 81; i++) { // T3 naked single
      if (v[i]) continue;
      if (!cand[i]) return CONTRADICTION;
      if (POP[cand[i]] === 1) return { t: 3, cell: i, digit: digitOf(cand[i]), unit: 18 + BOX[i] };
    }
  }
  return null;
}

/**
 * Easiest candidate elimination with techniques 4..maxT.
 * Returns { t, kind, cells, digits, unit, unit2?, removed: [[cell, digit], ...] } or null.
 */
export function findElimination(state, maxT = MAX_TECHNIQUE) {
  if (maxT >= 4) {
    const e = lockedCandidates(state);
    if (e) return e;
  }
  if (maxT >= 5) {
    for (const size of [2, 3]) {
      const e = nakedSubset(state, size);
      if (e) return e;
    }
  }
  if (maxT >= 6) {
    for (const size of [2, 3]) {
      const e = hiddenSubset(state, size);
      if (e) return e;
    }
  }
  return null;
}

function lockedCandidates({ cand }) {
  // pointing: inside a box, the digit only fits in one row/column -> remove it from the rest of that line
  for (let b = 18; b < 27; b++) {
    for (let d = 1; d <= 9; d++) {
      const bb = bit(d);
      const cells = UNITS[b].filter((i) => cand[i] & bb);
      if (cells.length < 2) continue;
      const lines = [];
      if (cells.every((i) => ROW[i] === ROW[cells[0]])) lines.push(ROW[cells[0]]);
      if (cells.every((i) => COL[i] === COL[cells[0]])) lines.push(9 + COL[cells[0]]);
      for (const l of lines) {
        const removed = UNITS[l].filter((i) => BOX[i] !== b - 18 && cand[i] & bb);
        if (removed.length) {
          return { t: 4, kind: 'pointing', cells, digits: [d], unit: b, unit2: l, removed: removed.map((i) => [i, d]) };
        }
      }
    }
  }
  // claiming: inside a row/column, the digit only fits in one box -> remove it from the rest of that box
  for (let l = 0; l < 18; l++) {
    for (let d = 1; d <= 9; d++) {
      const bb = bit(d);
      const cells = UNITS[l].filter((i) => cand[i] & bb);
      if (cells.length < 2 || !cells.every((i) => BOX[i] === BOX[cells[0]])) continue;
      const box = 18 + BOX[cells[0]];
      const removed = UNITS[box].filter((i) => !inUnit(l, i) && cand[i] & bb);
      if (removed.length) {
        return { t: 4, kind: 'claiming', cells, digits: [d], unit: l, unit2: box, removed: removed.map((i) => [i, d]) };
      }
    }
  }
  return null;
}

function combinations(arr, k) {
  const out = [];
  const rec = (start, acc) => {
    if (acc.length === k) { out.push(acc.slice()); return; }
    for (let i = start; i < arr.length; i++) { acc.push(arr[i]); rec(i + 1, acc); acc.pop(); }
  };
  rec(0, []);
  return out;
}

function nakedSubset({ v, cand }, size) {
  for (const u of UNIT_ORDER) {
    const empty = UNITS[u].filter((i) => !v[i]);
    if (empty.length <= size) continue;
    const small = empty.filter((i) => POP[cand[i]] >= 2 && POP[cand[i]] <= size);
    for (const combo of combinations(small, size)) {
      let m = 0;
      for (const i of combo) m |= cand[i];
      if (POP[m] !== size) continue;
      const removed = [];
      for (const i of empty) {
        if (combo.includes(i)) continue;
        for (const d of digits(cand[i] & m)) removed.push([i, d]);
      }
      if (removed.length) return { t: 5, kind: 'naked', cells: combo, digits: digits(m), unit: u, removed };
    }
  }
  return null;
}

function hiddenSubset({ v, cand }, size) {
  for (const u of UNIT_ORDER) {
    const missing = digits(ALL & ~presentIn(v, u));
    if (missing.length <= size) continue;
    const where = new Map();
    for (const d of missing) where.set(d, UNITS[u].filter((i) => cand[i] & bit(d)));
    const usable = missing.filter((d) => where.get(d).length >= 2 && where.get(d).length <= size);
    for (const ds of combinations(usable, size)) {
      const cells = [...new Set(ds.flatMap((d) => where.get(d)))];
      if (cells.length !== size) continue;
      let dm = 0;
      for (const d of ds) dm |= bit(d);
      const removed = [];
      for (const i of cells) for (const d of digits(cand[i] & ~dm)) removed.push([i, d]);
      if (removed.length) return { t: 6, kind: 'hidden', cells: cells.sort((a, b) => a - b), digits: ds, unit: u, removed };
    }
  }
  return null;
}

/**
 * Next digit that can be placed on this board, with the easiest technique.
 * Returns one of:
 *   { placement, eliminations, technique }  placement = { t, cell, digit, unit }
 *   { solved: true } | { stuck: true } | { contradiction: true }
 */
export function nextMove(grid, maxT = MAX_TECHNIQUE) {
  const state = makeState(grid);
  if (state.v.every((d) => d)) return { solved: true };
  const eliminations = [];
  for (;;) {
    const p = findPlacement(state, 3);
    if (p && p.contradiction) return { contradiction: true };
    if (p) {
      const technique = Math.max(p.t, ...eliminations.map((e) => e.t));
      return { placement: p, eliminations, technique };
    }
    const e = findElimination(state, maxT);
    if (!e) return { stuck: true };
    applyElimination(state, e);
    eliminations.push(e);
  }
}

/**
 * Solves by logic only, with techniques up to maxT. With stopCell >= 0 it stops as soon as that
 * cell is filled (used while digging: from there on the puzzle was already solvable).
 * Returns { solved, max, contradiction? } where max is the hardest technique used.
 */
export function logicSolve(grid, maxT = MAX_TECHNIQUE, stopCell = -1) {
  const state = makeState(grid);
  let filled = 0;
  for (let i = 0; i < 81; i++) if (state.v[i]) filled++;
  let max = 0;
  while (filled < 81 && !(stopCell >= 0 && state.v[stopCell])) {
    const p = findPlacement(state, Math.min(maxT, 3));
    if (p && p.contradiction) return { solved: false, contradiction: true, max };
    if (p) {
      place(state, p.cell, p.digit);
      filled++;
      if (p.t > max) max = p.t;
      continue;
    }
    const e = findElimination(state, maxT);
    if (!e) return { solved: false, max };
    applyElimination(state, e);
    if (e.t > max) max = e.t;
  }
  return { solved: true, max };
}

/**
 * Logical walk-through from this board: the list of moves (as returned by nextMove), each one
 * applied before looking for the next. Ends with { stuck: true } if logic is not enough.
 */
export function solveSteps(grid, maxT = MAX_TECHNIQUE) {
  const g = Int8Array.from(grid);
  const steps = [];
  for (;;) {
    const m = nextMove(g, maxT);
    if (!m.placement) {
      if (!m.solved) steps.push(m);
      return steps;
    }
    g[m.placement.cell] = m.placement.digit;
    steps.push(m);
  }
}
