// Complete solver by backtracking ("trial and error"): bit masks per row, column and box,
// always branching on the empty cell with the fewest options. Used to check uniqueness,
// to solve any puzzle in Solve mode and, with a random digit order, to build full grids.
import { ALL, BOX, COL, POP, ROW, bit, digitOf } from './grid.js';

/**
 * Finds up to `limit` solutions. With `rng`, digits are tried in random order.
 * Returns { count, solutions } where count = solutions.length (so 2 means "two or more").
 */
export function solve(grid, limit = 2, rng = null) {
  const g = Int8Array.from(grid);
  const rows = new Uint16Array(9), cols = new Uint16Array(9), boxes = new Uint16Array(9);
  for (let i = 0; i < 81; i++) {
    const d = g[i];
    if (!d) continue;
    const b = bit(d);
    if ((rows[ROW[i]] | cols[COL[i]] | boxes[BOX[i]]) & b) return { count: 0, solutions: [] };
    rows[ROW[i]] |= b; cols[COL[i]] |= b; boxes[BOX[i]] |= b;
  }
  const solutions = [];

  function rec() {
    let best = -1, bestMask = 0, bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const m = ALL & ~(rows[ROW[i]] | cols[COL[i]] | boxes[BOX[i]]);
      const n = POP[m];
      if (n === 0) return false;
      if (n < bestCount) {
        best = i; bestMask = m; bestCount = n;
        if (n === 1) break;
      }
    }
    if (best < 0) {
      solutions.push(Int8Array.from(g));
      return solutions.length >= limit;
    }
    const order = [];
    for (let m = bestMask; m; m &= m - 1) order.push(m & -m);
    if (rng) {
      for (let k = order.length - 1; k > 0; k--) {
        const j = Math.floor(rng() * (k + 1));
        [order[k], order[j]] = [order[j], order[k]];
      }
    }
    const r = ROW[best], c = COL[best], x = BOX[best];
    for (const b of order) {
      g[best] = digitOf(b);
      rows[r] |= b; cols[c] |= b; boxes[x] |= b;
      if (rec()) return true;
      rows[r] &= ~b; cols[c] &= ~b; boxes[x] &= ~b;
    }
    g[best] = 0;
    return false;
  }

  rec();
  return { count: solutions.length, solutions };
}
