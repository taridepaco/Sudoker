// Sudoku grid basics: geometry, parsing, validation and candidates.
// A grid is an Int8Array(81) in row-major order; 0 means an empty cell.
// Candidates are 9-bit masks: bit (d - 1) set means digit d is possible.

export const ALL = 0x1ff;

export const ROW = new Uint8Array(81);
export const COL = new Uint8Array(81);
export const BOX = new Uint8Array(81);
for (let i = 0; i < 81; i++) {
  ROW[i] = (i / 9) | 0;
  COL[i] = i % 9;
  BOX[i] = ((ROW[i] / 3) | 0) * 3 + ((COL[i] / 3) | 0);
}

// Units 0-8 are rows, 9-17 columns, 18-26 boxes.
export const UNITS = [];
for (let r = 0; r < 9; r++) UNITS.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
for (let c = 0; c < 9; c++) UNITS.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
for (let b = 0; b < 9; b++) {
  UNITS.push(Array.from({ length: 9 }, (_, k) => (((b / 3) | 0) * 3 + ((k / 3) | 0)) * 9 + (b % 3) * 3 + (k % 3)));
}

export const PEERS = Array.from({ length: 81 }, (_, i) => {
  const set = new Set([...UNITS[ROW[i]], ...UNITS[9 + COL[i]], ...UNITS[18 + BOX[i]]]);
  set.delete(i);
  return [...set];
});

export const POP = new Uint8Array(512);
for (let m = 1; m < 512; m++) POP[m] = POP[m >> 1] + (m & 1);

export const bit = (d) => 1 << (d - 1);
/** Digit of a single-bit mask. */
export const digitOf = (mask) => 32 - Math.clz32(mask);
export function digits(mask) {
  const out = [];
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) out.push(d);
  return out;
}

/** { type: 'row' | 'col' | 'box', n: 1..9 } for a unit index. */
export function unitInfo(u) {
  if (u < 9) return { type: 'row', n: u + 1 };
  if (u < 18) return { type: 'col', n: u - 8 };
  return { type: 'box', n: u - 17 };
}

export const inUnit = (u, i) => (u < 9 ? ROW[i] === u : u < 18 ? COL[i] === u - 9 : BOX[i] === u - 18);

/** Parses 81 characters (1-9, and 0 or . for empty); whitespace is ignored. Returns null if invalid. */
export function parse(text) {
  const s = String(text).replace(/\s+/g, '');
  if (s.length !== 81) return null;
  const g = new Int8Array(81);
  for (let i = 0; i < 81; i++) {
    const ch = s[i];
    if (ch >= '1' && ch <= '9') g[i] = ch.charCodeAt(0) - 48;
    else if (ch !== '0' && ch !== '.') return null;
  }
  return g;
}

export function serialize(grid, empty = '.') {
  let s = '';
  for (let i = 0; i < 81; i++) s += grid[i] ? String(grid[i]) : empty;
  return s;
}

/** Cells whose digit is repeated in one of their units. */
export function conflicts(grid) {
  const bad = new Set();
  for (const unit of UNITS) {
    const seen = new Map();
    for (const i of unit) {
      const d = grid[i];
      if (!d) continue;
      if (seen.has(d)) {
        bad.add(i);
        bad.add(seen.get(d));
      } else seen.set(d, i);
    }
  }
  return bad;
}

/** Candidates of every empty cell, from the placed digits only (0 for filled cells). */
export function candidates(grid) {
  const cand = new Uint16Array(81);
  for (let i = 0; i < 81; i++) {
    if (grid[i]) continue;
    let m = ALL;
    for (const p of PEERS[i]) if (grid[p]) m &= ~bit(grid[p]);
    cand[i] = m;
  }
  return cand;
}

export const countFilled = (grid) => grid.reduce((n, d) => n + (d ? 1 : 0), 0);
