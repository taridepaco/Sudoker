// Texts in Spanish and English, and the wording of hints and solving steps.
import { COL, ROW, unitInfo } from './engine/grid.js';

const STR = {
  es: {
    kind: 'Juego', panel: 'Controles',
    pitch: 'Juega sudokus con notas como en papel y pistas que explican la regla, o resuelve cualquier sudoku paso a paso.',
    'g.mode': 'Modo', 'mode.play': 'Jugar', 'mode.solve': 'Resolver',
    'g.level': 'Dificultad', 'lv.easy': 'Fácil', 'lv.medium': 'Medio', 'lv.hard': 'Difícil', 'lv.custom': 'Propio',
    'g.game': 'Partida', 'act.new': 'Nueva partida', 'act.hint': 'Pista', 'act.check': 'Comprobar',
    'act.undo': 'Deshacer', 'act.redo': 'Rehacer', 'act.erase': 'Borrar', 'act.pause': 'Pausa', 'act.resume': 'Seguir',
    'act.restart': 'Reiniciar', 'act.toSolve': 'Abrir en Resolver',
    'g.solve': 'Solución', 'act.next': 'Siguiente número', 'act.prev': 'Anterior', 'act.end': 'Hasta el final',
    'act.all': 'Resolver todo', 'act.play': 'Jugar este sudoku',
    'g.sudoku': 'Sudoku', 'act.paste': 'Pegar', 'act.copy': 'Copiar', 'act.clear': 'Limpiar', 'act.gen': 'Generar uno',
    'act.fromPlay': 'Traer partida',
    'g.options': 'Opciones', 'opt.peers': 'Fila, columna y caja', 'opt.same': 'Mismo número', 'opt.dups': 'Repetidos',
    'opt.timer': 'Cronómetro', 'opt.pad': 'Barra numérica',
    'g.look': 'Aspecto', 'g.keys': 'Teclas',
    'k.digit': 'Escribir un número', 'k.notes': 'Abrir o cerrar notas', 'k.pos': 'Marcar un posible', 'k.dis': 'Descartar un número',
    'k.erase': 'Borrar', 'k.hint': 'Pista', 'k.undo': 'Deshacer', 'k.move': 'Moverse', 'k.close': 'Cerrar notas',
    'notes.title': 'Notas de {cell}', 'notes.dis': 'Descartes', 'notes.pos': 'Posibles', board: 'Tablero', numbar: 'Números', deck: 'Mandos principales',
    'theme.auto': 'Tema: auto', 'theme.light': 'Tema: claro', 'theme.dark': 'Tema: oscuro',
    cell: 'f{r}c{c}', 'unit.row': 'fila {n}', 'unit.col': 'columna {n}', 'unit.box': 'caja {n}', and: 'y', empty: 'vacía',
    generating: 'Generando…', 'st.hints': 'pistas {n}', 'timer.show': 'Ver tiempo', 'timer.hide': 'Ocultar tiempo', paused: 'Pausa',
    'h.place': 'Puedes colocar un {d}.', 'h.zone': 'Fíjate en la {unit}.', 'h.cell': 'Va en la celda {cell}.',
    'h.apply': 'Aplicar', 'h.wrong1': 'Hay 1 número incorrecto.', 'h.wrongN': 'Hay {n} números incorrectos.',
    'h.show': 'Mostrar', 'h.stuck': 'Con las técnicas disponibles no hay un siguiente paso.',
    'ck.ok': 'Todo correcto por ahora.', 'ck.bad1': 'Hay 1 número incorrecto: está marcado.',
    'ck.badN': 'Hay {n} números incorrectos: están marcados.', 'full.bad': 'El tablero está lleno pero hay errores.',
    'done.title': '¡Resuelto!', 'done.body': 'Tiempo {time} · {level} · pistas {hints} · comprobaciones {checks}',
    ok: 'Aceptar', cancel: 'Cancelar', 'q.new': '¿Empezar una partida nueva? Se perderá la actual.',
    'q.restart': '¿Volver a empezar esta partida?',
    'q.removeWrong': 'Hay {n} números incorrectos. ¿Quitarlos antes de llevar el sudoku a Resolver?',
    'q.yes': 'Sí, quitarlos', 'q.no': 'No',
    'paste.title': 'Pegar sudoku', 'paste.help': '81 caracteres: del 1 al 9, y 0 o . para las celdas vacías.',
    'paste.bad': 'No es un sudoku válido: hacen falta 81 caracteres.', copied: 'Copiado: {s}',
    's.count': '{n} números', 's.few': 'menos de 17: no puede tener solución única',
    's.dups': 'Hay números repetidos: así no tiene solución.', 's.none': 'Sin solución.',
    's.multi': 'Varias soluciones: se muestra una. Las celdas subrayadas cambian entre soluciones.',
    's.unique': 'Solución única. Dificultad: {diff}.', 's.offscale': 'fuera de escala, requiere prueba y error',
    's.step': 'Paso {i} de {n}.', 's.trial': 'Este paso requiere prueba y error: el resto se completa por búsqueda.',
    's.done': 'Resuelto.', 's.needUnique': 'Para jugarlo, el sudoku debe tener solución única.',
    's.empty': 'Escribe los números del sudoku, pega uno o genera uno.',
    tn1: 'Último hueco', tn2: 'Único sitio', tn3: 'Único candidato', tn4: 'Candidatos bloqueados',
    tn5: 'Parejas y tríos desnudos', tn6: 'Parejas y tríos ocultos', tn5_2: 'Pareja desnuda', tn5_3: 'Trío desnudo',
    tn6_2: 'Pareja oculta', tn6_3: 'Trío oculto',
    'x.t1': 'Último hueco: {cell} es la única celda vacía de la {unit} y el único número que falta es el {d}.',
    'x.t2': 'Único sitio: en la {unit}, el {d} solo puede ir en {cell}.',
    'x.t3': 'Único candidato: con los números de su fila, su columna y su caja, en {cell} solo cabe el {d}.',
    'x.pointing': 'Candidatos bloqueados: en la {box}, el {d} solo puede ir en la {line}, así que se descarta del resto de la {line} ({cells}).',
    'x.claiming': 'Candidatos bloqueados: en la {line}, el {d} solo puede ir en la {box}, así que se descarta del resto de la {box} ({cells}).',
    'x.naked': '{name}: {cells} solo admiten los números {digits}, así que se descartan del resto de la {unit} ({removed}).',
    'x.hidden': '{name}: en la {unit}, los números {digits} solo caben en {cells}, así que ahí se descartan los demás números.',
    'x.then': 'Por tanto:',
  },
  en: {
    kind: 'Game', panel: 'Controls',
    pitch: 'Play sudokus with paper-style notes and hints that explain the rule, or solve any sudoku step by step.',
    'g.mode': 'Mode', 'mode.play': 'Play', 'mode.solve': 'Solve',
    'g.level': 'Difficulty', 'lv.easy': 'Easy', 'lv.medium': 'Medium', 'lv.hard': 'Hard', 'lv.custom': 'Custom',
    'g.game': 'Game', 'act.new': 'New game', 'act.hint': 'Hint', 'act.check': 'Check',
    'act.undo': 'Undo', 'act.redo': 'Redo', 'act.erase': 'Erase', 'act.pause': 'Pause', 'act.resume': 'Resume',
    'act.restart': 'Restart', 'act.toSolve': 'Open in Solve',
    'g.solve': 'Solution', 'act.next': 'Next number', 'act.prev': 'Back', 'act.end': 'To the end',
    'act.all': 'Solve all', 'act.play': 'Play this sudoku',
    'g.sudoku': 'Sudoku', 'act.paste': 'Paste', 'act.copy': 'Copy', 'act.clear': 'Clear', 'act.gen': 'Generate',
    'act.fromPlay': 'Bring game',
    'g.options': 'Options', 'opt.peers': 'Row, column and box', 'opt.same': 'Same number', 'opt.dups': 'Repeats',
    'opt.timer': 'Timer', 'opt.pad': 'Number bar',
    'g.look': 'Appearance', 'g.keys': 'Keys',
    'k.digit': 'Write a number', 'k.notes': 'Open or close notes', 'k.pos': 'Mark a possible digit', 'k.dis': 'Rule out a digit',
    'k.erase': 'Erase', 'k.hint': 'Hint', 'k.undo': 'Undo', 'k.move': 'Move', 'k.close': 'Close notes',
    'notes.title': 'Notes for {cell}', 'notes.dis': 'Ruled out', 'notes.pos': 'Possible', board: 'Board', numbar: 'Numbers', deck: 'Main controls',
    'theme.auto': 'Theme: auto', 'theme.light': 'Theme: light', 'theme.dark': 'Theme: dark',
    cell: 'r{r}c{c}', 'unit.row': 'row {n}', 'unit.col': 'column {n}', 'unit.box': 'box {n}', and: 'and', empty: 'empty',
    generating: 'Generating…', 'st.hints': 'hints {n}', 'timer.show': 'Show time', 'timer.hide': 'Hide time', paused: 'Paused',
    'h.place': 'You can place a {d}.', 'h.zone': 'Look at {unit}.', 'h.cell': 'It goes in cell {cell}.',
    'h.apply': 'Apply', 'h.wrong1': 'There is 1 wrong number.', 'h.wrongN': 'There are {n} wrong numbers.',
    'h.show': 'Show', 'h.stuck': 'The available techniques find no next step.',
    'ck.ok': 'Everything is right so far.', 'ck.bad1': 'There is 1 wrong number: it is marked.',
    'ck.badN': 'There are {n} wrong numbers: they are marked.', 'full.bad': 'The board is full, but there are mistakes.',
    'done.title': 'Solved!', 'done.body': 'Time {time} · {level} · hints {hints} · checks {checks}',
    ok: 'OK', cancel: 'Cancel', 'q.new': 'Start a new game? The current one will be lost.',
    'q.restart': 'Start this game over?',
    'q.removeWrong': 'There are {n} wrong numbers. Remove them before taking the sudoku to Solve?',
    'q.yes': 'Yes, remove them', 'q.no': 'No',
    'paste.title': 'Paste sudoku', 'paste.help': '81 characters: 1 to 9, and 0 or . for empty cells.',
    'paste.bad': 'Not a valid sudoku: 81 characters are needed.', copied: 'Copied: {s}',
    's.count': '{n} digits', 's.few': 'fewer than 17: it cannot have a unique solution',
    's.dups': 'There are repeated digits: no solution like this.', 's.none': 'No solution.',
    's.multi': 'Several solutions: one is shown. Underlined cells change between solutions.',
    's.unique': 'Unique solution. Difficulty: {diff}.', 's.offscale': 'off the scale, needs trial and error',
    's.step': 'Step {i} of {n}.', 's.trial': 'This step needs trial and error: the rest is filled in by search.',
    's.done': 'Solved.', 's.needUnique': 'To play it, the sudoku needs a unique solution.',
    's.empty': 'Type the sudoku’s digits, paste one or generate one.',
    tn1: 'Full house', tn2: 'Hidden single', tn3: 'Naked single', tn4: 'Locked candidates',
    tn5: 'Naked pairs and triples', tn6: 'Hidden pairs and triples', tn5_2: 'Naked pair', tn5_3: 'Naked triple',
    tn6_2: 'Hidden pair', tn6_3: 'Hidden triple',
    'x.t1': 'Full house: {cell} is the only empty cell in {unit}, and the only missing digit is {d}.',
    'x.t2': 'Hidden single: in {unit}, {d} can only go in {cell}.',
    'x.t3': 'Naked single: given the digits in its row, column and box, only {d} fits in {cell}.',
    'x.pointing': 'Locked candidates: in {box}, {d} can only go in {line}, so it is ruled out from the rest of {line} ({cells}).',
    'x.claiming': 'Locked candidates: in {line}, {d} can only go in {box}, so it is ruled out from the rest of {box} ({cells}).',
    'x.naked': '{name}: {cells} only take {digits}, so those digits are ruled out from the rest of {unit} ({removed}).',
    'x.hidden': '{name}: in {unit}, {digits} only fit in {cells}, so every other digit is ruled out there.',
    'x.then': 'So:',
  },
};

let lang = document.documentElement.lang === 'en' ? 'en' : 'es';
export const getLang = () => lang;

export function t(key, p = {}) {
  const s = STR[lang][key] ?? STR.es[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (p[k] ?? ''));
}

export function setLang(l) {
  lang = l === 'en' ? 'en' : 'es';
  document.documentElement.lang = lang;
  try { localStorage.setItem('taridepaco-lang', lang); } catch (e) { /* no storage */ }
  applyDom();
}

export function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  root.querySelectorAll('.lang-switch [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

export const cellName = (i) => t('cell', { r: ROW[i] + 1, c: COL[i] + 1 });
export function unitName(u) {
  const { type, n } = unitInfo(u);
  return t('unit.' + type, { n });
}
export function list(items) {
  if (items.length < 2) return items.join('');
  return items.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + items[items.length - 1];
}
export const levelName = (level) => t('lv.' + level);
export const levelOf = (technique) => (technique <= 2 ? 'easy' : technique === 3 ? 'medium' : technique <= 6 ? 'hard' : 'custom');
export const techName = (n) => t('tn' + n);

export function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (x) => String(x).padStart(2, '0');
  return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(r);
}

function explainElimination(e) {
  const cells = list(e.cells.map(cellName));
  const removedCells = list([...new Set(e.removed.map(([i]) => i))].map(cellName));
  if (e.t === 4) {
    const box = unitName(e.kind === 'pointing' ? e.unit : e.unit2);
    const line = unitName(e.kind === 'pointing' ? e.unit2 : e.unit);
    return t('x.' + e.kind, { box, line, d: e.digits[0], cells: removedCells });
  }
  const name = t('tn' + e.t + '_' + e.cells.length);
  const digits = list(e.digits.map(String));
  if (e.t === 5) return t('x.naked', { name, cells, digits, unit: unitName(e.unit), removed: removedCells });
  return t('x.hidden', { name, cells, digits, unit: unitName(e.unit) });
}

/** Full explanation of a move from nextMove(): previous eliminations, then the placement. */
export function explainMove(m) {
  const p = m.placement;
  const lines = m.eliminations.map(explainElimination);
  if (lines.length) lines.push(t('x.then'));
  lines.push(t('x.t' + p.t, { cell: cellName(p.cell), unit: unitName(p.unit), d: p.digit }));
  return lines;
}
