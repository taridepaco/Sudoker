// Generates puzzles off the main thread so the page never freezes.
import { generate } from './engine/generator.js';

self.onmessage = (e) => {
  const { id, level } = e.data;
  const r = generate(level);
  self.postMessage({ id, level, puzzle: Array.from(r.puzzle), solution: Array.from(r.solution), technique: r.technique });
};
