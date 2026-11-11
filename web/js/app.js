// Sudoker UI: Play and Solve modes on one shared board.
import { BOX, COL, ROW, UNITS, conflicts, countFilled, parse, serialize } from './engine/grid.js';
import { solve } from './engine/search.js';
import { nextMove, solveSteps } from './engine/techniques.js';
import { applyDom, cellName, explainMove, fmtTime, getLang, levelName, levelOf, setLang, t, techName } from './i18n.js';

const $ = (id) => document.getElementById(id);
const KEY = 'sudoker-v1';
const zeros = () => new Array(81).fill(0);
const bit = (d) => 1 << (d - 1);

// ---------- persistent state ----------
function defaults() {
  return {
    mode: 'play',
    level: 'medium',
    opts: { peers: true, same: true, dups: true, timer: true, pad: false },
    play: null,
    solve: { given: zeros(), deduced: zeros() },
  };
}
function load() {
  const d = defaults();
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.solve) return { ...d, ...s, opts: { ...d.opts, ...s.opts } };
  } catch (e) { /* no storage */ }
  return d;
}
const S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* no storage */ }
}

// ---------- screen-only state ----------
const U = {
  sel: 40, notes: false, undo: [], redo: [], hint: null, wrong: new Set(), paused: false,
  msg: null, generating: false, diff: new Set(), steps: null, stepIdx: 0, stepView: null, solution: null,
};

const playGrid = () => S.play.puzzle.map((d, i) => d || S.play.values[i]);
const solveGrid = () => S.solve.given.map((d, i) => d || S.solve.deduced[i]);
// with a mouse (desktop), selecting an empty cell opens its notes straight away
const finePointer = () => !matchMedia('(pointer: coarse)').matches;
const canNote = (i) => S.mode === 'play' && S.play && !S.play.done && !S.play.puzzle[i] && !S.play.values[i];

// ---------- DOM ----------
const boardEl = $('board'), padEl = $('pad'), stage = $('stage'), msgEl = $('msg');
const cells = [];
for (let b = 0; b < 9; b++) {
  const box = document.createElement('div');
  box.className = 'box';
  for (const i of UNITS[18 + b]) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'cell';
    c.dataset.i = i;
    c.tabIndex = -1;
    c.innerHTML = '<span class="v"></span><span class="notes" aria-hidden="true">' + '<span></span>'.repeat(9) + '</span>';
    cells[i] = c;
    box.append(c);
  }
  boardEl.append(box);
}

function strip(kind) {
  const s = document.createElement('div');
  s.className = 'strip ' + kind;
  s.setAttribute('role', 'group');
  for (let g = 0; g < 3; g++) {
    const grp = document.createElement('div');
    grp.className = 'grp';
    for (let k = 1; k <= 3; k++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g * 3 + k;
      b.dataset.d = g * 3 + k;
      b.dataset.kind = kind;
      grp.append(b);
    }
    s.append(grp);
  }
  return s;
}
const numStrip = strip('num'), disStrip = strip('dis'), posStrip = strip('pos');
const notesPanel = document.createElement('div');
notesPanel.className = 'notes-panel';
notesPanel.append(disStrip, posStrip);
padEl.append(numStrip, notesPanel);

// desktop: how many of each digit are on the board, on the other side from the notes
const counterEl = $('counter');
const counts = [];
for (let g = 0; g < 3; g++) {
  const grp = document.createElement('div');
  grp.className = 'grp';
  for (let k = 0; k < 3; k++) { const s = document.createElement('span'); counts.push(s); grp.append(s); }
  counterEl.append(grp);
}

// phone in portrait: the board fills the frame, and notes and messages open over it
const phone = matchMedia('(max-width: 720px) and (orientation: portrait)');

// board size: cells of a whole number of pixels, board + pad fitted in the stage
function layout() {
  const portrait = getComputedStyle(stage).flexDirection === 'column';
  let w = stage.clientWidth - 16, h = stage.clientHeight - 16;
  let c = portrait
    ? Math.min((w - 18) / 9, (h - 18 - 8 - 6) / 10)
    : Math.min((w - 18 - 8 - 15) / 11, (h - 18) / 9);
  const fine = !matchMedia('(pointer: coarse)').matches;
  // desktop in landscape: the digit counter (1.4c + 6 wide) takes the left side
  if (!portrait && fine) c = Math.min((w - 18 - 8 - 15 - 8 - 6) / 12.4, (h - 18) / 9);
  if (phone.matches) {
    // no padding: the board and the number bar overlap the frame's borders (10c + 18 tall, 9c + 12 wide)
    w = stage.clientWidth; h = stage.clientHeight;
    c = Math.min((w - 12) / 9, (h - 18) / 10);
  }
  const cell = Math.max(14, Math.floor(c));
  stage.style.setProperty('--c', cell + 'px');
  // with room to spare, the board is centred and the pad hangs to its right
  stage.classList.toggle('centered', !portrait && !fine && (w - 9 * cell - 18) / 2 >= 2 * cell + 23);
}
new ResizeObserver(layout).observe(stage);

// ---------- messages and dialogs ----------
function showMsg(text, actions = []) { U.msg = { text, actions }; }
function renderMsg() {
  msgEl.textContent = '';
  if (!U.msg) return;
  const lines = [].concat(U.msg.text());
  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line;
    msgEl.append(p);
  }
  if (U.msg.actions.length) {
    const row = document.createElement('div');
    row.className = 'row';
    for (const a of U.msg.actions) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (a.primary ? ' primary' : '');
      b.textContent = t(a.key);
      b.addEventListener('click', a.fn);
      row.append(b);
    }
    msgEl.append(row);
  }
  msgEl.scrollTop = 0;
}

const dlg = $('dialog');
function ask({ title = '', text = '', ok = 'ok', cancel = 'cancel', input = null }) {
  $('dialog-title').textContent = title;
  $('dialog-title').hidden = !title;
  $('dialog-text').textContent = text;
  $('dialog-ok').textContent = t(ok);
  if (cancel !== null) $('dialog-cancel').textContent = t(cancel);
  $('dialog-cancel').hidden = cancel === null;
  const ta = $('dialog-input');
  ta.hidden = input === null;
  ta.value = input || '';
  dlg.returnValue = '';
  dlg.showModal();
  if (input !== null) ta.focus();
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok' ? (input !== null ? ta.value : true) : false), { once: true });
  });
}

// ---------- generation (in a worker, with a fallback on the main thread) ----------
let worker = null, reqId = 0;
const pending = new Map();
async function generateLocal(level) {
  const { generate } = await import('./engine/generator.js');
  const r = generate(level);
  return { level, puzzle: Array.from(r.puzzle), solution: Array.from(r.solution), technique: r.technique };
}
function generateAsync(level) {
  try {
    if (!worker) {
      worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => { const done = pending.get(e.data.id); pending.delete(e.data.id); if (done) done(e.data); };
      worker.onerror = () => {
        worker = null;
        for (const [id, done] of pending) { pending.delete(id); generateLocal(level).then(done); }
      };
    }
    const id = ++reqId;
    return new Promise((resolve) => { pending.set(id, resolve); worker.postMessage({ id, level }); });
  } catch (e) {
    return generateLocal(level);
  }
}
async function withGenerating(level) {
  U.generating = true;
  const timer = setTimeout(() => { showMsg(() => t('generating')); render(); }, 300);
  const r = await generateAsync(level);
  clearTimeout(timer);
  U.generating = false;
  U.msg = null;
  return r;
}

// ---------- Play ----------
function newPlay({ puzzle, solution, level, technique }) {
  return {
    puzzle: Array.from(puzzle), solution: Array.from(solution), level, technique,
    values: zeros(), pos: zeros(), dis: zeros(), time: 0, hints: 0, checks: 0, done: false,
  };
}
function resetPlayView() {
  U.undo = []; U.redo = []; U.hint = null; U.wrong = new Set(); U.notes = false; U.paused = false; U.msg = null;
}
const inProgress = () => S.play && !S.play.done && S.play.values.some(Boolean);

async function newGame() {
  if (U.generating) return;
  if (inProgress() && !(await ask({ text: t('q.new') }))) return;
  const r = await withGenerating(S.level);
  S.play = newPlay(r);
  resetPlayView();
  setMode('play');
}

const snap = (i) => ({ v: S.play.values[i], p: S.play.pos[i], x: S.play.dis[i] });
function put(i, s) { S.play.values[i] = s.v; S.play.pos[i] = s.p; S.play.dis[i] = s.x; }
function change(i, next) {
  const before = snap(i), after = { ...before, ...next };
  if (before.v === after.v && before.p === after.p && before.x === after.x) return;
  U.undo.push({ i, before, after });
  U.redo = [];
  put(i, after);
  afterChange(i, before.v !== after.v);
}
function afterChange(i, numberChanged) {
  U.wrong.delete(i);
  if (numberChanged) { U.msg = null; checkDone(); }
  commit();
}
function checkDone() {
  const P = S.play;
  const g = playGrid();
  if (P.done || !g.every(Boolean)) return;
  if (g.every((d, i) => d === P.solution[i])) {
    P.done = true;
    U.notes = false;
    showMsg(() => t('done.title'));
    ask({
      title: t('done.title'),
      text: t('done.body', { time: fmtTime(P.time), level: levelName(P.level), hints: P.hints, checks: P.checks }),
      cancel: null,
    });
  } else showMsg(() => t('full.bad'));
}

function input(d) {
  const i = U.sel;
  if (S.mode === 'solve') {
    if (S.solve.given[i] === d) return;
    S.solve.given[i] = d;
    resetSolve();
    return commit();
  }
  const P = S.play;
  if (!P || P.done || U.paused || P.puzzle[i]) return;
  change(i, { v: d });
}
function erase() {
  const i = U.sel;
  if (S.mode === 'solve') {
    if (!S.solve.given[i] && !S.solve.deduced[i]) return;
    S.solve.given[i] = 0;
    resetSolve();
    return commit();
  }
  const P = S.play;
  if (!P || P.done || U.paused || P.puzzle[i] || !P.values[i]) return;
  change(i, { v: 0 });
}
function toggleNote(kind, d) {
  const i = U.sel;
  if (!canNote(i) || U.paused) return;
  const b = bit(d);
  let { p, x } = snap(i);
  if (kind === 'pos') { p ^= b; if (p & b) x &= ~b; } else { x ^= b; if (x & b) p &= ~b; }
  change(i, { p, x });
}
function undo() {
  if (S.mode !== 'play' || !S.play || S.play.done || U.paused) return;
  const e = U.undo.pop();
  if (!e) return;
  U.redo.push(e);
  put(e.i, e.before);
  U.sel = e.i;
  afterChange(e.i, e.before.v !== e.after.v);
}
function redo() {
  if (S.mode !== 'play' || !S.play || S.play.done || U.paused) return;
  const e = U.redo.pop();
  if (!e) return;
  U.undo.push(e);
  put(e.i, e.after);
  U.sel = e.i;
  afterChange(e.i, e.before.v !== e.after.v);
}

const wrongCells = () => S.play.values.flatMap((v, i) => (v && v !== S.play.solution[i] ? [i] : []));

function hint() {
  const P = S.play;
  if (!P || P.done || U.paused) return;
  P.hints++;
  const wrong = wrongCells();
  if (wrong.length) {
    U.hint = null;
    showMsg(() => t(wrong.length === 1 ? 'h.wrong1' : 'h.wrongN', { n: wrong.length }), [
      { key: 'h.show', fn: () => { U.wrong = new Set(wrong); render(); } },
    ]);
    return commit();
  }
  const g = playGrid();
  const key = g.join('');
  if (U.hint && U.hint.key === key) U.hint.level = Math.min(4, U.hint.level + 1);
  else U.hint = { key, level: 1, move: nextMove(g) };
  const m = U.hint.move;
  if (!m.placement) {
    U.hint = null;
    showMsg(() => t('h.stuck'), [{ key: 'act.toSolve', fn: toSolve }]);
    return commit();
  }
  const p = m.placement, level = U.hint.level;
  showMsg(() => {
    const lines = [t('h.place', { d: p.digit })];
    if (level >= 2) lines.push(t('h.zone', { unit: unitLabel(p.unit) }));
    if (level >= 3) lines.push(t('h.cell', { cell: cellName(p.cell) }));
    if (level >= 4) lines.push(...explainMove(m));
    return level >= 4 ? lines.slice(3) : [lines.join(' ')];
  }, level >= 4 ? [{ key: 'h.apply', primary: true, fn: () => { U.sel = p.cell; change(p.cell, { v: p.digit }); } }] : []);
  commit();
}
// "la fila 4" is written in the template; here only the unit name
function unitLabel(u) {
  const { type, n } = u < 9 ? { type: 'row', n: u + 1 } : u < 18 ? { type: 'col', n: u - 8 } : { type: 'box', n: u - 17 };
  return t('unit.' + type, { n });
}

function check() {
  const P = S.play;
  if (!P || P.done || U.paused) return;
  P.checks++;
  const wrong = wrongCells();
  U.wrong = new Set(wrong);
  showMsg(() => (wrong.length ? t(wrong.length === 1 ? 'ck.bad1' : 'ck.badN', { n: wrong.length }) : t('ck.ok')));
  commit();
}

async function restart() {
  if (!S.play || !(await ask({ text: t('q.restart') }))) return;
  S.play = newPlay(S.play);
  resetPlayView();
  commit();
}

function pause() {
  if (!S.play || S.play.done) return;
  U.paused = !U.paused;
  U.notes = false;
  render();
}

async function toSolve() {
  if (!S.play) return setMode('solve');
  const P = S.play;
  const wrong = new Set(wrongCells());
  let drop = false;
  if (wrong.size) drop = await ask({ text: t('q.removeWrong', { n: wrong.size }), ok: 'q.yes', cancel: 'q.no' });
  S.solve.given = P.puzzle.map((d, i) => d || (drop && wrong.has(i) ? 0 : P.values[i]));
  resetSolve();
  setMode('solve');
}

// ---------- Solve ----------
function resetSolve() {
  S.solve.deduced = zeros();
  U.steps = null; U.stepIdx = 0; U.stepView = null; U.diff = new Set(); U.msg = null; U.solution = null;
}
function analyze() {
  const G = S.solve.given;
  if (!G.some(Boolean)) { showMsg(() => t('s.empty')); return null; }
  if (conflicts(G).size) { showMsg(() => t('s.dups')); return null; }
  const r = solve(G, 2);
  if (r.count === 0) { showMsg(() => t('s.none')); return null; }
  const info = { count: r.count, solution: Array.from(r.solutions[0]), other: r.solutions[1] };
  if (r.count === 1) {
    info.steps = solveSteps(G);
    const last = info.steps[info.steps.length - 1];
    info.max = last && last.stuck ? 7 : Math.max(1, ...info.steps.map((s) => s.technique || 0));
  }
  return info;
}
const diffText = (max) => (max >= 7 ? t('s.offscale') : `${levelName(levelOf(max))} · T${max} ${techName(max)}`);

function solveAll() {
  const info = analyze();
  if (!info) return render();
  U.steps = null; U.stepView = null;
  S.solve.deduced = info.solution.map((d, i) => (S.solve.given[i] ? 0 : d));
  if (info.count > 1) {
    U.diff = new Set(info.solution.flatMap((d, i) => (d !== info.other[i] ? [i] : [])));
    showMsg(() => t('s.multi'));
  } else showMsg(() => t('s.unique', { diff: diffText(info.max) }));
  commit();
}
function stepNext() {
  if (!U.steps) {
    const info = analyze();
    if (!info) return render();
    S.solve.deduced = zeros();
    U.diff = new Set();
    U.steps = info.steps || solveSteps(S.solve.given);
    U.stepIdx = 0;
    U.solution = info.solution;
    U.max = info.max;
  }
  const n = U.steps.length;
  if (U.stepIdx >= n) { showMsg(() => t('s.done')); return render(); }
  const st = U.steps[U.stepIdx++];
  const i = U.stepIdx;
  if (st.stuck) {
    st.filled = [];
    for (let k = 0; k < 81; k++) {
      if (!S.solve.given[k] && !S.solve.deduced[k]) { S.solve.deduced[k] = U.solution[k]; st.filled.push(k); }
    }
    U.stepView = null;
    showMsg(() => [t('s.step', { i, n }) + ' ' + t('s.trial')]);
  } else {
    S.solve.deduced[st.placement.cell] = st.placement.digit;
    U.sel = st.placement.cell;
    U.stepView = st;
    showMsg(() => [t('s.step', { i, n }), ...explainMove(st)]);
  }
  if (U.stepIdx === n && U.max) {
    const max = U.max;
    const prev = U.msg.text;
    showMsg(() => [].concat(prev(), t('s.unique', { diff: diffText(max) })));
  }
  commit();
}
function stepPrev() {
  if (!U.steps || U.stepIdx === 0) return;
  const st = U.steps[--U.stepIdx];
  if (st.stuck) st.filled.forEach((k) => { S.solve.deduced[k] = 0; });
  else S.solve.deduced[st.placement.cell] = 0;
  const prev = U.stepIdx > 0 ? U.steps[U.stepIdx - 1] : null;
  U.stepView = prev && prev.placement ? prev : null;
  const i = U.stepIdx, n = U.steps.length;
  showMsg(() => (U.stepView ? [t('s.step', { i, n }), ...explainMove(U.stepView)] : []));
  commit();
}
function stepEnd() {
  if (!U.steps) stepNext();
  while (U.steps && U.stepIdx < U.steps.length) stepNext();
}
async function playThis() {
  const info = analyze();
  if (!info) return render();
  if (info.count !== 1) { showMsg(() => t('s.needUnique')); return render(); }
  if (inProgress() && !(await ask({ text: t('q.new') }))) return;
  S.play = newPlay({ puzzle: S.solve.given, solution: info.solution, level: levelOf(info.max), technique: info.max });
  resetPlayView();
  setMode('play');
}
async function pasteSudoku() {
  const text = await ask({ title: t('paste.title'), text: t('paste.help'), input: serialize(S.solve.given) });
  if (text === false) return;
  const g = parse(text);
  if (!g) { showMsg(() => t('paste.bad')); return render(); }
  S.solve.given = Array.from(g);
  resetSolve();
  commit();
}
function copySudoku() {
  const s = serialize(S.solve.given);
  try { navigator.clipboard.writeText(s); } catch (e) { /* not allowed */ }
  showMsg(() => t('copied', { s }));
  render();
}
async function generateForSolve() {
  if (U.generating) return;
  const r = await withGenerating(S.level);
  S.solve.given = r.puzzle;
  resetSolve();
  commit();
}
function clearSolve() {
  S.solve.given = zeros();
  resetSolve();
  commit();
}

// ---------- modes, options, rendering ----------
function setMode(mode) {
  S.mode = mode;
  U.notes = false;
  document.body.dataset.mode = mode;
  $('mode-' + mode).checked = true;
  commit();
  if (mode === 'play' && !S.play) newGame();
}
function commit() { save(); render(); }

function highlights() {
  const zone = new Set(), refs = new Set();
  let target = -1, view = null, level = 0;
  if (S.mode === 'play' && U.hint && U.hint.move.placement) { view = U.hint.move; level = U.hint.level; }
  if (S.mode === 'solve' && U.stepView) { view = U.stepView; level = 4; }
  if (view) {
    const p = view.placement;
    if (level >= 2) UNITS[p.unit].forEach((i) => zone.add(i));
    if (level >= 3) target = p.cell;
    if (level >= 4) view.eliminations.forEach((e) => e.cells.forEach((i) => refs.add(i)));
  }
  return { zone, refs, target };
}

function render() {
  const play = S.mode === 'play';
  const P = S.play;
  if (play && !P) { boardEl.classList.remove('paused'); }
  const g = play ? (P ? playGrid() : zeros()) : solveGrid();
  if (play && U.hint && U.hint.key !== g.join('')) U.hint = null;
  const sel = U.sel, sd = g[sel];
  const bad = play ? (S.opts.dups ? conflicts(g) : new Set()) : conflicts(S.solve.given);
  const hl = highlights();
  for (let i = 0; i < 81; i++) {
    const c = cells[i], d = g[i];
    const isGiven = play ? P && P.puzzle[i] : S.solve.given[i];
    const peer = S.opts.peers && i !== sel && (ROW[i] === ROW[sel] || COL[i] === COL[sel] || BOX[i] === BOX[sel]);
    c.className = 'cell'
      + (d && !isGiven ? ' player' : '')
      + (peer ? ' peer' : '')
      + (S.opts.same && sd && d === sd && i !== sel ? ' same' : '')
      + (hl.zone.has(i) ? ' zone' : '')
      + (i === sel ? ' sel' : '')
      + (bad.has(i) ? ' conflict' : '')
      + (play && U.wrong.has(i) ? ' wrong' : '')
      + (hl.refs.has(i) ? ' ref' : '')
      + (i === hl.target ? ' target' : '')
      + (!play && U.diff.has(i) ? ' diff' : '');
    c.firstChild.textContent = d || '';
    const notes = play && P && !d ? P.pos[i] : 0;
    const spans = c.lastChild.children;
    for (let k = 0; k < 9; k++) spans[k].textContent = notes & (1 << k) ? k + 1 : '';
    c.tabIndex = i === sel ? 0 : -1;
    c.setAttribute('aria-label', cellName(i) + ': ' + (d || t('empty')));
    c.setAttribute('aria-pressed', String(i === sel));
  }
  boardEl.classList.toggle('paused', play && U.paused);
  boardEl.dataset.paused = t('paused');

  // pad: number bar (touch, or optional with a mouse) and notes panel
  const coarse = matchMedia('(pointer: coarse)').matches;
  const notesOpen = play && U.notes && canNote(sel);
  numStrip.classList.toggle('off', notesOpen || !(coarse || S.opts.pad) || (play && U.paused));
  notesPanel.hidden = !notesOpen;
  // phone: notes open over the half of the board away from the cell (rows 1-5 below, 6-9 above)
  notesPanel.classList.toggle('at-top', ROW[sel] >= 5);
  document.querySelector('.screen').classList.toggle('notes-open', notesOpen);
  // the message goes to the other half from the cell the hint or step points at
  let ref = -1;
  if (play && U.hint && U.hint.move.placement) {
    const p = U.hint.move.placement;
    if (U.hint.level >= 3) ref = ROW[p.cell];
    else if (U.hint.level === 2 && p.unit < 9) ref = p.unit;
    else if (U.hint.level === 2 && p.unit >= 18) ref = Math.floor((p.unit - 18) / 3) * 3 + 1;
  }
  if (!play && U.stepView) ref = ROW[U.stepView.placement.cell];
  msgEl.classList.toggle('at-top', ref >= 5);
  // digit counter
  const tally = new Array(10).fill(0);
  for (const d of g) tally[d]++;
  counts.forEach((s, k) => { s.textContent = `${k + 1}: ${tally[k + 1]}`; s.classList.toggle('full', tally[k + 1] >= 9); });
  if (notesOpen) {
    for (const b of disStrip.querySelectorAll('button')) b.setAttribute('aria-pressed', String(!!(P.dis[sel] & bit(+b.dataset.d))));
    for (const b of posStrip.querySelectorAll('button')) b.setAttribute('aria-pressed', String(!!(P.pos[sel] & bit(+b.dataset.d))));
  }
  disStrip.setAttribute('aria-label', t('notes.dis'));
  posStrip.setAttribute('aria-label', t('notes.pos'));
  numStrip.setAttribute('aria-label', t('numbar'));

  // status line and timer
  const timer = $('timer');
  if (play && P) {
    $('status-text').textContent = `${levelName(P.level)} · ${t('st.hints', { n: P.hints })}`;
    timer.hidden = false;
    timer.textContent = S.opts.timer ? fmtTime(P.time) : t('timer.show');
    timer.classList.toggle('off', !S.opts.timer);
    timer.setAttribute('aria-label', S.opts.timer ? t('timer.hide') : t('timer.show'));
  } else if (!play) {
    const n = countFilled(S.solve.given);
    $('status-text').textContent = t('s.count', { n }) + (n && n < 17 ? ' · ' + t('s.few') : '');
    timer.hidden = true;
  } else {
    $('status-text').textContent = '';
    timer.hidden = true;
  }
  document.querySelectorAll('[data-act="pause"] span').forEach((s) => { s.textContent = t(U.paused ? 'act.resume' : 'act.pause'); });
  document.querySelectorAll('[data-opt]').forEach((b) => b.setAttribute('aria-pressed', String(!!S.opts[b.dataset.opt])));
  $('level').value = S.level;
  renderMsg();
  syncTheme();
}

// ---------- events ----------
const ACTIONS = {
  newGame, hint, check, undo, redo, erase, pause, restart, toSolve,
  stepNext, stepPrev, stepEnd, solveAll, playThis, paste: pasteSudoku, copy: copySudoku,
  generate: generateForSolve, fromPlay: toSolve, clear: clearSolve,
};
document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => ACTIONS[b.dataset.act]()));
document.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
  S.opts[b.dataset.opt] = !S.opts[b.dataset.opt];
  commit();
}));
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', () => setMode(r.value)));
$('level').addEventListener('change', (e) => { S.level = e.target.value; save(); });
$('timer').addEventListener('click', () => { S.opts.timer = !S.opts.timer; commit(); });

boardEl.addEventListener('click', (e) => {
  const c = e.target.closest('.cell');
  if (!c || (S.mode === 'play' && U.paused)) return;
  const i = +c.dataset.i;
  if (i === U.sel && canNote(i)) U.notes = !U.notes;
  else { U.sel = i; U.notes = finePointer() && canNote(i); }
  render();
});
padEl.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = +b.dataset.d;
  if (b.dataset.kind === 'num') input(d);
  else toggleNote(b.dataset.kind, d);
});
// the notes panel closes when tapping anywhere outside it (a tap on a cell is handled by the board)
document.addEventListener('pointerdown', (e) => {
  let changed = false;
  if (U.notes && !e.target.closest('.notes-panel, .cell')) { U.notes = false; changed = true; }
  // on a phone the message covers part of the screen: touching the board or the numbers hides it
  if (U.msg && phone.matches && e.target.closest('.board, .pad')) { U.msg = null; changed = true; }
  if (changed) render();
});
// give the keyboard back to the board after using a button
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, summary');
  if (b && !dlg.contains(b) && !b.classList.contains('cell')) b.blur();
});

document.addEventListener('keydown', (e) => {
  if (dlg.open) return;
  if (['TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;
  const k = e.key;
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    if (k === 'z' || k === 'Z') { e.preventDefault(); return e.shiftKey ? redo() : undo(); }
    if (k === 'y' || k === 'Y') { e.preventDefault(); return redo(); }
    return;
  }
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if (m) {
    e.preventDefault();
    const d = +m[1];
    // 1-9 writes the number; Shift marks a possible digit, Alt rules one out
    if (e.shiftKey || e.altKey) { if (canNote(U.sel)) toggleNote(e.altKey ? 'dis' : 'pos', d); }
    else input(d);
    return;
  }
  if (e.altKey) return;
  const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
  if (k in moves) {
    e.preventDefault();
    const i = U.sel, dlt = moves[k];
    if ((dlt === -1 && COL[i] === 0) || (dlt === 1 && COL[i] === 8) || i + dlt < 0 || i + dlt > 80) return;
    U.sel = i + dlt;
    U.notes = finePointer() && canNote(U.sel);
    render();
    cells[U.sel].focus({ preventScroll: true });
    return;
  }
  if (k === 'Backspace' || k === 'Delete' || e.code === 'Digit0' || e.code === 'Numpad0') { e.preventDefault(); return erase(); }
  if (k === 'Enter' && S.mode === 'play' && canNote(U.sel)) { e.preventDefault(); U.notes = !U.notes; return render(); }
  if (k === 'Escape') { U.notes = false; return render(); }
  if (k === 'h' || k === 'H') return S.mode === 'play' ? hint() : stepNext();
});

// timer: counts while playing, the tab is visible and the game is not paused
setInterval(() => {
  const P = S.play;
  if (S.mode !== 'play' || !P || P.done || U.paused || document.hidden || U.generating) return;
  P.time += 1000;
  if (S.opts.timer) $('timer').textContent = fmtTime(P.time);
  if (P.time % 10000 === 0) save();
}, 1000);
document.addEventListener('visibilitychange', save);

// theme button (header and, on phones, the Appearance section) and language switch
const themeBtns = document.querySelectorAll('.theme-btn');
function syncTheme() {
  if (!window.Theme) return;
  themeBtns.forEach((b) => { b.textContent = t('theme.' + window.Theme.mode()); });
}
themeBtns.forEach((b) => b.addEventListener('click', () => window.Theme && window.Theme.cycle()));
if (window.Theme) window.Theme.onChange(syncTheme);
document.querySelectorAll('.lang-switch [data-lang]').forEach((b) => b.addEventListener('click', () => {
  setLang(b.dataset.lang);
  render();
}));

// ---------- start ----------
applyDom();
document.documentElement.lang = getLang();
document.body.dataset.mode = S.mode;
$('mode-' + S.mode).checked = true;
layout();
render();
if (S.mode === 'play' && !S.play) newGame();
