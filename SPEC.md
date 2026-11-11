# Sudoker — Especificación funcional

> **Estado:** borrador para revisión (2026-11-11).
> El diseño visual queda fuera de este documento: se define en un artefacto aparte.

## 0. Cómo usar este documento

- Edítalo libremente: añade, quita o reescribe lo que quieras.
- Cada requisito lleva un **ID** (`J-01`, `R-10`, `G-02`…) para poder referirnos a él.
- Prioridades:
  - **MVP**: primera versión publicable.
  - **v2**: justo después.
  - **Opcional**: si da tiempo.
- Lo marcado como **[D1]**, **[D2]**… depende de una decisión abierta de la §9. En esos casos el texto describe mi propuesta por defecto.

---

## 1. Objetivo y alcance

Web app estática, publicada con GitHub Pages desde la carpeta `docs/`, que permite:

1. **Jugar** sudokus generados por la propia página. El jugador toma notas a mano, como en papel, y puede pedir pistas explicadas.
2. **Resolver** sudokus, tanto los propuestos por la página como los que el usuario introduzca a mano desde cero.

Está **fuera de alcance**:

- Cuentas de usuario y servidor.
- Multijugador.
- Variantes de sudoku (killer, diagonal…).
- Diseño visual (se define en el artefacto de diseño).

## 2. Glosario y notación

- **Número inicial:** número que trae el sudoku de partida. No se puede editar.
- **Número del jugador:** número que el jugador escribe en una celda vacía.
- **Nota:** marca pequeña que el jugador pone en una celda (ver [D1]).
- **Candidato:** número que podría ir en una celda según los números ya colocados. Lo calcula el motor y nunca se muestra en modo Jugar.
- **Unidad:** una fila, una columna o una caja de 3×3.
- **Pista:** ayuda que muestra el siguiente movimiento lógico y lo explica.
- **Paso lógico:** deducción hecha con una técnica concreta (§6.1).
- **Notación:**
  - Filas `f1`–`f9` y columnas `c1`–`c9`.
  - Una celda se nombra `f3c7`.
  - Cajas `1`–`9`, numeradas de izquierda a derecha y de arriba abajo.

---

## 3. Estructura de la aplicación

- **A-01** · MVP · Una sola página con dos modos: **Jugar** y **Resolver**. Los dos usan el mismo componente de tablero.
- **A-02** · MVP · Se cambia de modo sin perder el estado del otro modo.
- **A-03** · MVP · Panel de **Opciones** con los resaltados ([D5]) y la marca de repetidos ([D2]).
- **A-04** · MVP · El estado se guarda en el navegador (`localStorage`) y se recupera al volver.
- **A-05** · v2 · Un enlace con un sudoku (`?p=…`) abre la página con ese sudoku cargado (§7).

---

## 4. Modo Jugar

### 4.1 Nueva partida

- **J-01** · MVP · Selector de dificultad ([D4]) y botón **Nueva partida**.
  - El sudoku se genera en segundo plano.
  - Mientras tanto se muestra "Generando…".
- **J-02** · MVP · Si hay una partida en curso, se pide confirmación antes de descartarla.
- **J-03** · MVP · Los números iniciales se distinguen visualmente de los del jugador y no se pueden editar.

### 4.2 Entrada de números

- **J-10** · MVP · Para seleccionar una celda:
  - clic o toque sobre ella;
  - o las flechas del teclado.
- **J-11** · MVP · Para escribir y borrar:
  - teclado numérico en pantalla (1–9 y Borrar), pensado para móvil;
  - teclado físico: 1–9, `Supr` o `Retroceso` para borrar y flechas para moverse.
- **J-12** · MVP · Escribir en una celda que ya tiene un número del jugador lo sustituye.

### 4.3 Notas

- **J-20** · MVP · Interruptor **Modo notas**: botón en pantalla y tecla `N`.
- **J-21** · MVP · En modo notas, pulsar un número pone o quita esa nota en la celda seleccionada.
- **J-22** · MVP · Significado de la nota [D1]: marca un número **descartado**, es decir, que ya no es posible en esa celda. Se muestra tachado.
- **J-23** · MVP · **Sin automatismos:**
  - no se rellenan candidatos automáticamente;
  - colocar un número no borra notas en otras celdas.
- **J-24** · MVP · Al colocar un número en una celda, sus notas se ocultan. Si se borra el número, las notas vuelven a aparecer.
- **J-25** · MVP · Las notas **no** se usan para calcular pistas ni comprobaciones.

### 4.4 Pista

- **J-30** · MVP · Botón **Pista**. Se calcula solo con los números del tablero (iniciales y del jugador) e ignora las notas.
- **J-31** · MVP · Antes de dar una pista, el tablero se compara con la solución.
  - Si hay números incorrectos, la pista lo dice ("Hay 2 números incorrectos") en lugar de dar un movimiento.
  - Ofrece mostrar cuáles son.
- **J-32** · MVP · La pista da el siguiente movimiento con la **técnica más sencilla** posible (§6.1).
- **J-33** · MVP · Pista **progresiva en 3 niveles** [D3]. Cada pulsación revela el siguiente nivel:
  1. **Zona:** "Fíjate en la caja 5".
  2. **Técnica:** "En esta caja hay un número que solo puede ir en un sitio".
  3. **Movimiento:**
     - celda y número ("El 7 va en f4c5");
     - resaltado de las celdas y unidades que lo justifican;
     - explicación en texto;
     - botón **Aplicar**.
- **J-34** · v2 · Si el movimiento necesita descartes previos (técnicas T4 y siguientes), la explicación los enumera en orden antes de la colocación final.
- **J-35** · MVP · La pista solo propone **colocar un número**, nunca descartes sueltos [D3].
- **J-36** · MVP · Se cuentan las pistas usadas y el total aparece en el resumen final.

### 4.5 Errores y comprobación

- **J-40** · MVP · Marca en tiempo real de los **números repetidos** en una misma unidad. Se puede desactivar en Opciones [D2].
- **J-41** · MVP · Botón **Comprobar**: marca los números del jugador que no coinciden con la solución.
- **J-42** · MVP · Fuera de **Comprobar** y **Pista**, nunca se indica si un número es incorrecto.

### 4.6 Resaltados visuales

- **J-50** · MVP · Al seleccionar una celda se resaltan su fila, su columna y su caja [D5].
- **J-51** · MVP · Al seleccionar una celda con número, se resaltan las demás celdas con ese mismo número [D5].
- **J-52** · MVP · Ambos resaltados se pueden desactivar en Opciones.

### 4.7 Control de partida

- **J-60** · MVP · **Deshacer** y **Rehacer** de números y notas, también con `Ctrl+Z` y `Ctrl+Y`.
- **J-61** · MVP · **Reiniciar**: deja solo los números iniciales. Pide confirmación.
- **J-62** · MVP · **Cronómetro**:
  - visible durante la partida;
  - se pausa solo al cambiar de pestaña;
  - tiene botón de pausa, y la pausa oculta el tablero.
- **J-63** · MVP · Guardado automático de la partida en curso.
- **J-64** · MVP · Al rellenar el tablero:
  - si es correcto, se muestra un resumen con tiempo, dificultad, pistas usadas y comprobaciones usadas;
  - si hay errores, se muestra "El tablero está lleno pero hay errores", sin decir dónde.
- **J-65** · v2 · **Abrir en Resolver**: lleva el sudoku de la partida al modo Resolver.

---

## 5. Modo Resolver

### 5.1 Entrada

- **R-01** · MVP · Tablero vacío editable. Se escribe igual que en Jugar, pero sin notas.
- **R-02** · MVP · **Pegar sudoku** como cadena de 81 caracteres:
  - dígitos `1`–`9`, con `0` o `.` para las celdas vacías;
  - se ignoran espacios y saltos de línea.
- **R-03** · MVP · **Generar uno**: crea un sudoku nuevo con el selector de dificultad.
- **R-04** · MVP · **Traer partida actual**: carga los números iniciales de la partida del modo Jugar.
- **R-05** · MVP · **Limpiar** el tablero.
- **R-06** · Opcional · Importar el formato CSV del script Python antiguo.

### 5.2 Validación en vivo

- **R-10** · MVP · Los números repetidos en una unidad se resaltan mientras se escribe.
- **R-11** · MVP · Contador de números introducidos. Con menos de 17 aparece el aviso: "no puede tener solución única".

### 5.3 Resolver y analizar

- **R-20** · MVP · **Resolver** muestra la solución completa. Los números deducidos se ven con un estilo distinto a los introducidos.
- **R-21** · MVP · Antes de resolver se analiza el sudoku, con tres resultados posibles:
  - **Sin solución.** Si se debe a números repetidos, se señalan.
  - **Solución única.**
  - **Varias soluciones.** Se muestra una y se resaltan las celdas que cambian entre dos soluciones distintas.
- **R-22** · MVP · **Dificultad** del sudoku: la técnica más difícil necesaria y la lista de técnicas usadas (§6.3).
- **R-23** · v2 · **Paso a paso** (usa el mismo motor que la Pista):
  - cada paso muestra la técnica, las celdas resaltadas y la explicación;
  - botones **Anterior**, **Siguiente** y **Hasta el final**.
- **R-24** · v2 · Si las técnicas implementadas no bastan, el paso a paso lo indica ("Este paso requiere prueba y error") y completa el resto por búsqueda.
- **R-25** · MVP · **Jugar este sudoku**: lo pasa al modo Jugar como partida nueva. Solo se permite si tiene solución única.

---

## 6. Motor de sudoku

Se escribe en JavaScript para que funcione en GitHub Pages y se basa en las ideas del script Python actual (§10).

### 6.1 Técnicas lógicas (de más fácil a más difícil)

| ID | Técnica | En qué consiste | Prioridad |
|----|---------|-----------------|-----------|
| T1 | Último hueco | Una unidad tiene una sola celda vacía. | MVP |
| T2 | Único sitio | Un número solo cabe en una celda de una caja, fila o columna. Es la única técnica del script actual. | MVP |
| T3 | Único candidato | En una celda solo cabe un número. | MVP |
| T4 | Candidatos bloqueados | Dentro de una caja, un número solo puede ir en una fila o columna, así que se descarta de esa fila o columna fuera de la caja. También el caso inverso. | v2 |
| T5 | Parejas y tríos desnudos | 2 o 3 celdas de una unidad comparten solo 2 o 3 candidatos, que se descartan del resto de la unidad. | v2 |
| T6 | Parejas y tríos ocultos | 2 o 3 números de una unidad solo caben en las mismas 2 o 3 celdas. | v2 |
| T7 | X-Wing y Swordfish | Patrones de un mismo número en 2 o 3 filas o columnas. | Opcional |
| T8 | XY-Wing | Cadena de tres celdas con dos candidatos cada una. | Opcional |
| — | Prueba y error | Búsqueda por backtracking. Queda fuera de la escala de dificultad. | MVP (solo para resolver) |

### 6.2 Funciones del motor

- **M-01** · MVP · Leer y escribir sudokus como cadena de 81 caracteres.
- **M-02** · MVP · Validar: detectar números repetidos.
- **M-03** · MVP · Búsqueda completa (backtracking):
  - devuelve una solución;
  - cuenta soluciones hasta 2, para saber si la solución es única.
- **M-04** · MVP · Calcular los candidatos a partir de los números colocados.
- **M-05** · MVP · **Siguiente paso lógico.** Recibe un tablero y devuelve:
  - la técnica usada;
  - la colocación o los descartes;
  - las celdas y unidades que lo justifican;
  - el texto de la explicación.

  Esta función sirve para la Pista, el Paso a paso y la clasificación de dificultad.
- **M-06** · MVP · Resolver por lógica: aplica pasos hasta terminar o atascarse. Devuelve la lista de pasos y la dificultad.
- **M-07** · MVP · Generar un sudoku de una dificultad dada (§6.3).
- **M-08** · MVP · El motor no depende de la interfaz, para poder probarlo con tests en Node.

### 6.3 Generación y dificultad

- **G-01** · MVP · Cuadrícula completa aleatoria por backtracking con orden aleatorio. Sustituye los reinicios desde cero del script.
- **G-02** · MVP · **Vaciado** (es la idea del script actual):
  - se recorren las celdas en orden aleatorio;
  - cada celda se vacía solo si el sudoku sigue resolviéndose por lógica con las técnicas permitidas para ese nivel;
  - así se garantiza una solución única y que nunca haga falta adivinar.
- **G-03** · MVP · La dificultad es la **técnica más difícil necesaria**. Si el resultado no encaja en el nivel pedido, se genera otro.
- **G-04** · MVP · Niveles [D4]. Los rangos de números iniciales son orientativos:

  | Nivel | Técnicas necesarias | Números iniciales |
  |-------|---------------------|-------------------|
  | Fácil | T1–T2 | 36–45 |
  | Medio | Requiere T3 | 30–35 |
  | Difícil | Requiere T4–T6 | 25–30 |
  | Experto | Requiere T7–T8 | 22–27 |

- **G-05** · MVP · La generación corre en un *Web Worker* para que la interfaz no se congele.
  - Objetivo: menos de 2 s.
  - Si tarda más, se muestra el progreso.
- **G-06** · Opcional · Simetría rotacional en la posición de los números iniciales, como en los sudokus de periódico.
- **G-07** · Opcional · Banco de sudokus pregenerados (JSON) como respaldo para los niveles difíciles.

---

## 7. Datos, guardado y compartir

- **D-01** · MVP · Formato de intercambio: cadena de 81 caracteres (§5.1, R-02).
- **D-02** · MVP · En `localStorage` se guardan:
  - la partida en curso: números iniciales, números del jugador, notas, tiempo, pistas y comprobaciones usadas;
  - el tablero del modo Resolver;
  - las opciones.

  El historial de deshacer no se conserva al recargar.
- **D-03** · v2 · **Compartir:** botón que copia un enlace `?p=<81 caracteres>`.
  - Si el sudoku tiene solución única, el enlace abre una partida en Jugar.
  - Si no, lo abre en Resolver.
- **D-04** · Opcional · Estadísticas: partidas jugadas y mejores tiempos por dificultad.

---

## 8. Requisitos no funcionales

- **N-01** · MVP · Sitio 100 % estático, sin paso de compilación (módulos ES). Se publica desde `docs/` en GitHub Pages.
- **N-02** · MVP · Se puede usar en móvil (táctil) y en escritorio (teclado).
- **N-03** · MVP · El motor no tiene dependencias externas. Se prueba con `node --test`.
- **N-04** · MVP · Accesibilidad básica: todo se puede hacer con teclado, con etiquetas `aria` en el tablero y los botones.
- **N-05** · MVP · Idioma de la interfaz [D7].
- **N-06** · MVP · El aspecto visual sigue el artefacto de diseño.
- **N-07** · Opcional · Uso sin conexión como PWA.

---

## 9. Decisiones abiertas

Rellena la línea **Decisión** de cada una (o cambia la propuesta).

### D1 · Notas

- **Opciones:**
  - (a) Solo tachar los números **descartados**.
  - (b) Solo apuntar los números **posibles**, que es lo habitual en papel.
  - (c) Las dos cosas: cada número de la nota pasa por vacío → posible → descartado.
- **Propuesta:** (a), que es lo que se pidió.
- **Decisión:** _pendiente_

### D2 · Errores

- **Opciones:**
  - (a) Nada.
  - (b) Marcar números repetidos en tiempo real.
  - (c) Botón **Comprobar** contra la solución.
  - (d) Marcar como incorrecto cualquier número que no coincida con la solución, al momento.
- **Propuesta:** (b) + (c). La (b) se puede desactivar.
- **Decisión:** _pendiente_

### D3 · Pista

- **Opciones de forma:**
  - (a) Progresiva en 3 niveles: zona → técnica → movimiento.
  - (b) Directa: muestra el movimiento con su explicación de una vez.
- **Opciones de contenido:**
  - (x) Solo colocaciones.
  - (y) También descartes, del tipo "puedes tachar el 4 en f2c3".
- **Propuesta:** (a) + (x).
- **Decisión:** _pendiente_

### D4 · Niveles de dificultad

- **Opciones:** cuántos niveles y hasta qué técnica llegan (ver G-04).
- **Propuesta:** 4 niveles. Experto (T7–T8) queda como opcional.
- **Decisión:** _pendiente_

### D5 · Resaltados

- **Pregunta:** ¿resaltar la fila, la columna y la caja de la celda seleccionada, y los números iguales? ¿Cuenta como "ayuda"?
- **Propuesta:** sí, activados por defecto y desactivables.
- **Decisión:** _pendiente_

### D6 · Script Python

- **Opciones:**
  - (a) Eliminarlo y quedarse solo con el motor JS.
  - (b) Mantenerlo refactorizado como herramienta sin conexión, por ejemplo para generar el banco de G-07.
  - (c) Moverlo a `legacy/` como referencia.
- **Propuesta:** (c).
- **Decisión:** _pendiente_

### D7 · Idioma

- **Opciones:**
  - (a) Español.
  - (b) Inglés.
  - (c) Ambos, con selector.
- **Propuesta:** (a), con los textos centralizados para poder añadir (c) más adelante.
- **Decisión:** _pendiente_

---

## 10. Referencia: análisis del script actual (`sudoku_main.py`)

### Qué hace

| Función | Qué hace |
|---------|----------|
| `sdku_gen` | Rellena una cuadrícula completa celda a celda con números aleatorios. Si se atasca, reinicia desde cero (~310 reinicios de media, 0,05 s). |
| `sdku_drain` | Vacía celdas en orden aleatorio mientras el sudoku siga siendo resoluble por lógica (0,45 s; quedan 22–27 números iniciales). |
| `sdku_solv` | Resolvedor lógico que solo usa la técnica T2 (único sitio). No usa backtracking. |
| `sdku_Sact` | Actualiza los candidatos a partir de los números colocados. |
| `main` | Repite generar y vaciar hasta tener 22 o menos números iniciales. Solo el 2,5 % de los intentos lo consigue, así que tarda ~18 s de media. Guarda el resultado en `sudoku.csv`. |

### Lo que se conserva

Vaciar celdas solo mientras el sudoku se resuelva por lógica pura. Esto garantiza solución única y que no haga falta adivinar.

### Problemas encontrados

- **Le falta la técnica T3** (único candidato). En 139 de 396 sudokus en los que se atascó, había una celda con un solo candidato que no aprovechó.
- **No usa búsqueda.** Con un sudoku difícil conocido no coloca ni un número, así que no sirve para resolver sudokus introducidos por el usuario.
- **No distingue entre resultados.** "Sin solución", "varias soluciones" y "demasiado difícil" dan el mismo resultado. Tampoco valida números repetidos.
- **No hay niveles de dificultad.** Todos los sudokus se resuelven solo con T2.
- **Pierde la solución.** `sdku_drain` modifica la cuadrícula completa, y `sdku_solv` también modifica el sudoku que recibe.
- **Detalles menores:**
  - `main(p<23)` lanza `NameError`, porque `Sd` queda sin definir;
  - el comentario "checkout rows" en realidad recorre una columna;
  - usa `open` sin `with` y `print("\n"*50)`;
  - depende de numpy sin necesitarlo.

---

## 11. Arquitectura propuesta (orientativa)

```
docs/                    ← raíz publicada en GitHub Pages
  index.html
  css/
  js/
    engine/              ← motor sin dependencias de la interfaz
      grid.js            (leer/escribir, validar, candidatos)
      search.js          (backtracking, contar soluciones)
      techniques.js      (T1…T8, siguiente paso lógico)
      generator.js       (cuadrícula completa, vaciado, dificultad)
    ui/                  ← tablero, teclado, modos, opciones
    worker.js            ← generación en segundo plano
tests/
  engine/*.test.js       ← node --test
```

## 12. Fases

1. **Motor:** M-01 a M-08, T1–T3 y tests.
2. **Jugar (MVP):** todos los J-xx marcados como MVP.
3. **Resolver (MVP):** todos los R-xx marcados como MVP.
4. **v2:**
   - técnicas T4–T6;
   - Paso a paso (R-23, R-24);
   - explicaciones con descartes (J-34);
   - compartir (D-03).
5. **Opcionales.**
