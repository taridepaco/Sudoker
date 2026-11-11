import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conflicts, countFilled, parse, serialize } from '../../docs/js/engine/grid.js';
import { solve } from '../../docs/js/engine/search.js';
import { logicSolve, nextMove, solveSteps } from '../../docs/js/engine/techniques.js';
import { generate, LEVELS, mulberry32 } from '../../docs/js/engine/generator.js';

// The puzzle saved by the original Python script (22 givens, unique solution).
const LEGACY = '1........'
  + '.5..3..8.' + '....7.3..' + '.....8..9' + '5.6..2.3.' + '3....54..' + '.....7..2' + '......67.' + '98..6....';
// A well-known very hard puzzle: needs trial and error.
const HARD = '800000000003600000070090200050007000000045700000100030001000068008500010090000400';

const isValidSolution = (g) => g.length === 81 && countFilled(g) === 81 && conflicts(g).size === 0;

test('parse and serialize round trip, with dots, zeros and whitespace', () => {
  const g = parse(LEGACY);
  assert.equal(countFilled(g), 22);
  assert.equal(serialize(g), LEGACY);
  assert.deepEqual(parse(serialize(g, '0').replace(/(.{9})/g, '$1\n')), g);
  assert.equal(parse('123'), null);
  assert.equal(parse('x'.repeat(81)), null);
});

test('conflicts finds repeated digits in a unit', () => {
  const g = parse(LEGACY);
  assert.equal(conflicts(g).size, 0);
  g[1] = 1; // same row as cell 0
  assert.deepEqual([...conflicts(g)].sort((a, b) => a - b), [0, 1]);
});

test('search: unique, multiple and no solution', () => {
  const unique = solve(parse(LEGACY));
  assert.equal(unique.count, 1);
  assert.ok(isValidSolution(unique.solutions[0]));
  assert.equal(solve(new Int8Array(81)).count, 2);
  const bad = parse(LEGACY);
  bad[1] = 1;
  assert.equal(solve(bad).count, 0);
  const hard = solve(parse(HARD));
  assert.equal(hard.count, 1);
  assert.ok(isValidSolution(hard.solutions[0]));
});

test('logic: the legacy puzzle is solved; the very hard one gets stuck', () => {
  assert.equal(logicSolve(parse(LEGACY)).solved, true);
  const r = logicSolve(parse(HARD));
  assert.equal(r.solved, false);
  assert.equal(r.contradiction, undefined);
  assert.ok(nextMove(parse(HARD)).stuck);
});

test('logic: full house and naked single', () => {
  const sol = solve(parse(LEGACY)).solutions[0];
  const g = Int8Array.from(sol);
  g[40] = 0;
  const m = nextMove(g);
  assert.equal(m.placement.t, 1);
  assert.equal(m.placement.cell, 40);
  assert.equal(m.placement.digit, sol[40]);
  // empty one cell in each of row 0, column 0 and box 0 around cell 0 so that only T3 sees it first
  const h = Int8Array.from(sol);
  for (const i of [0, 1, 9, 10]) h[i] = 0;
  const n = nextMove(h);
  assert.ok(n.placement);
  assert.equal(n.placement.digit, sol[n.placement.cell]);
});

test('logic steps are sound: every placement and elimination agrees with the solution', () => {
  const rng = mulberry32(7);
  for (let k = 0; k < 12; k++) {
    const level = ['easy', 'medium', 'hard'][k % 3];
    const { puzzle, solution } = generate(level, rng);
    const steps = solveSteps(puzzle);
    assert.ok(steps.length > 0);
    for (const s of steps) {
      assert.ok(s.placement, `${level}: logic should finish`);
      assert.equal(s.placement.digit, solution[s.placement.cell]);
      for (const e of s.eliminations) for (const [i, d] of e.removed) assert.notEqual(solution[i], d);
    }
  }
});

test('generator: each level has a unique solution and the right difficulty', () => {
  const rng = mulberry32(42);
  for (const level of Object.keys(LEVELS)) {
    for (let k = 0; k < 4; k++) {
      const { puzzle, solution, technique } = generate(level, rng);
      const s = solve(puzzle);
      assert.equal(s.count, 1, `${level} must be unique`);
      assert.deepEqual(s.solutions[0], solution);
      assert.ok(LEVELS[level].accept(technique), `${level} got T${technique}`);
      if (level === 'easy') assert.ok(countFilled(puzzle) >= 36);
    }
  }
});
