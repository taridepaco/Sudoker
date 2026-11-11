# Sudoker

Sudoku generator, solver and play table, as a static web app in Spanish and English.

- **Play:** sudokus generated in three levels (easy, medium, hard). Paper-style notes (possible and ruled-out digits), and hints that get more obvious each time you ask, ending with the rule that justifies the move.
- **Solve:** type or paste any sudoku. It tells you whether it has no solution, one or several, rates its difficulty, and solves it step by step with explanations or all at once.

The functional spec is in [`SPEC.md`](SPEC.md). The look follows the common taridepaco design system (`web/css/system.css` and `web/js/theme.js`, copied unmodified).

## Layout

- `web/`: the static site. `deploy/build.sh` builds it into `dist/`, which `.github/workflows/pages.yml` publishes to GitHub Pages on every push to `main` (see [`DEPLOY.md`](DEPLOY.md)).
  - `js/engine/`: the sudoku engine, with no dependencies (grid, backtracking search, techniques T1–T6, generator).
  - `js/app.js` and `js/i18n.js`: the interface and its texts.
  - `js/worker.js`: generates puzzles off the main thread.
- `tests/`: engine tests.
- `sudoku_main.py`: the original Python generator, kept as a keepsake.

## Development

Serve `web/` with any static server, for example:

```bash
python3 -m http.server -d web 8000
```

Run the engine tests (Node 22 or later), the same ones the workflow runs before publishing:

```bash
npm test
```
