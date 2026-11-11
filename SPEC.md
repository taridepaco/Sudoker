# Sudoker — Especificación funcional

> **Estado:** aprobado para implementar (2026-11-11).
> El diseño visual sigue el sistema común de diseño de taridepaco (N-06).
> Cada requisito lleva un ID y una prioridad: **MVP**, **v2** u **Opcional**.

---

## 1. Objetivo y alcance

Web app estática, publicada con GitHub Pages desde la carpeta `docs/`, que permite:

1. **Jugar** sudokus generados por la propia página o introducidos por el usuario. El jugador toma notas a mano, como en papel, y puede pedir pistas que se vuelven más obvias cada vez que las pide.
2. **Resolver** sudokus, tanto los propuestos por la página como los introducidos a mano. Se puede pedir el siguiente número, con su explicación, o la solución completa.

**Fuera de alcance:**
- Cuentas de usuario y servidor.
- Multijugador.
- Variantes de sudoku (killer, diagonal…).
- Diseño visual propio: se usa el sistema común de diseño (N-06).

**Fuera de esta versión:**
- Nivel Experto.
- Banco de sudokus pregenerados.
- Importar el CSV del script Python.

## 2. Glosario y notación

- **Número inicial:** número que trae el sudoku de partida. No se puede editar.
- **Número del jugador:** número que el jugador escribe en una celda vacía.
- **Notas de una celda:** dos tipos de marca que pone el jugador.
  - **Posible:** número que el jugador cree que puede ir en la celda. Se muestra en azul.
  - **Descartado:** número que el jugador sabe que no puede ir. Se muestra tachado en rojo.
- **Panel de notas:** las dos filas o columnas de números del 1 al 9 que sirven para editar las notas de una celda (§4.3).
- **Barra numérica:** fila o columna con los botones 1–9 y Borrar, en dispositivos táctiles (§4.2).
- **Candidato:** número que podría ir en una celda según los números ya colocados. Lo calcula el motor y nunca se muestra en modo Jugar.
- **Unidad:** una fila, una columna o una caja de 3×3.
- **Pista:** ayuda progresiva que lleva al siguiente número que se puede colocar.
- **Paso lógico:** deducción hecha con una técnica concreta (§6.1).
- **Notación:**
  - Filas `f1`–`f9` y columnas `c1`–`c9`.
  - Una celda se nombra `f3c7`.
  - Cajas `1`–`9`, numeradas de izquierda a derecha y de arriba abajo.

---

## 3. Estructura de la aplicación

- **A-01** · MVP · Una sola página con dos modos, **Jugar** y **Resolver**, que comparten el mismo componente de tablero.
- **A-02** · MVP · Se cambia de modo sin perder el estado del otro modo.
- **A-03** · MVP · Un sudoku pasa de un modo a otro así:
  - De Resolver a Jugar con **Jugar este sudoku** (R-25).
  - De Jugar a Resolver con **Abrir en Resolver** (J-66).
- **A-04** · MVP · **Reparto de ayudas:**
  - En Jugar solo hay **Pista**, que en su último nivel acaba indicando el número que hay que poner.
  - Para pedir números sueltos o la solución completa, el sudoku se abre en Resolver.
- **A-05** · MVP · Panel de **Opciones** con:
  - los resaltados (J-50, J-51);
  - la marca de repetidos (J-40);
  - mostrar u ocultar el cronómetro (J-63).
- **A-06** · MVP · El estado se guarda en el navegador (`localStorage`) y se recupera al volver.
- **A-07** · v2 · Un enlace con un sudoku (`?p=…`) abre la página con ese sudoku cargado (D-03).

---

## 4. Modo Jugar

### 4.1 Nueva partida

- **J-01** · MVP · Selector de dificultad (**Fácil**, **Medio** o **Difícil**; §6.3) y botón **Nueva partida**.
  - El sudoku se genera en segundo plano.
  - Si tarda más de ~300 ms se muestra "Generando…".
- **J-02** · MVP · Si hay una partida en curso, se pide confirmación antes de descartarla.
- **J-03** · MVP · Los números iniciales se distinguen visualmente de los del jugador y no se pueden editar.

### 4.2 Entrada de números

- **J-10** · MVP · Las celdas del tablero **no son campos de texto**: el teclado del sistema nunca se abre en móvil ni en tablet.
- **J-11** · MVP · Para seleccionar una celda:
  - clic o toque sobre ella;
  - en escritorio, también con las flechas del teclado.
- **J-12** · MVP · **Dispositivos táctiles** (móvil y tablet): **barra numérica** con 1–9 y Borrar.
  - En vertical es una fila bajo el tablero.
  - En horizontal es una columna junto al tablero.
- **J-13** · MVP · **Escritorio**: se usa el teclado físico (1–9, `Supr` o `Retroceso` para borrar, flechas para moverse). La barra numérica no se muestra.
- **J-14** · MVP · Para decidir entre táctil y escritorio se mira el **tipo de puntero principal** (`pointer: coarse`), no el tamaño de pantalla. Así la tablet tiene barra numérica y el ordenador no.
- **J-15** · MVP · Escribir en una celda que ya tiene un número del jugador lo sustituye.
- **J-16** · Opcional · Opción para mostrar la barra numérica también en escritorio, para jugar solo con ratón.

### 4.3 Notas

> Primera versión para probar; se iterará después de usarla.

- **J-20** · MVP · Las notas de una celda se abren **al volver a pulsar la celda que ya estaba seleccionada**, tanto en móvil como en escritorio. No existe un "modo notas".
  - Con teclado, `Intro` abre las notas de la celda seleccionada.
- **J-21** · MVP · **Panel de notas**: dos filas (o columnas, según la orientación) con los números del 1 al 9.
  - **Descartes:** números en **rojo**. Al pulsar uno se tacha; al volver a pulsarlo se quita el tachado.
  - **Posibles:** números en **gris claro**. Al pulsar uno se oscurece a **azul**; al volver a pulsarlo vuelve a gris.
- **J-22** · MVP · Un número no puede ser posible y descartado a la vez en la misma celda: marcarlo en una fila lo desmarca en la otra.
- **J-23** · MVP · **Posición del panel:**
  - En táctil ocupa el lugar de la barra numérica mientras está abierto.
  - En escritorio aparece junto al tablero.
- **J-24** · MVP · **Cierre del panel:**
  - Se cierra al pulsar fuera de sus dos filas o columnas.
  - Si se pulsa otra celda, además queda seleccionada.
  - En escritorio también se cierra con `Esc`.
- **J-25** · MVP · Con teclado y el panel abierto:
  - `1`–`9` marca o desmarca un **posible**;
  - `Mayús` + `1`–`9` marca o desmarca un **descarte**.
- **J-26** · MVP · **Dentro de la celda** se ven en pequeño solo los **posibles**, en una subcuadrícula de 3×3.
  - Cada número ocupa siempre su posición: el 1 arriba a la izquierda y el 9 abajo a la derecha.
  - Los descartes solo se ven en el panel.
- **J-27** · MVP · Al poner un número en la celda, sus notas se **ocultan pero no se borran**. Si se borra el número, vuelven a verse.
- **J-28** · MVP · **Sin automatismos:** las notas nunca se rellenan ni se borran solas, tampoco en otras celdas al colocar un número.
- **J-29** · MVP · Las notas **no** se usan para calcular pistas ni comprobaciones.

### 4.4 Pista

- **J-30** · MVP · Botón **Pista**. Se calcula solo con los números del tablero (iniciales y del jugador) e ignora las notas.
- **J-31** · MVP · Antes de dar una pista, el tablero se compara con la solución.
  - Si hay números incorrectos, la pista lo dice ("Hay 2 números incorrectos") en lugar de dar un movimiento.
  - Ofrece mostrar cuáles son.
- **J-32** · MVP · La pista busca el siguiente número que se puede colocar con la **técnica más sencilla** posible (T1–T6, §6.1).
- **J-33** · MVP · **Cada pulsación hace la pista más obvia:**
  1. **Número:** "Puedes colocar un 7".
  2. **Zona:** "Fíjate en la fila 4". Es la unidad donde se coloca el número; con T3 (único candidato) se indica la caja de la celda.
  3. **Celda:** "En la celda f4c5", con la celda resaltada.
  4. **Explicación:**
     - técnica y razonamiento completo;
     - resaltado de las celdas que lo justifican;
     - si hacen falta descartes previos (T4–T6), se enumeran en orden;
     - botón **Aplicar**, que coloca el número.
- **J-34** · MVP · La pista siempre termina en **colocar un número**, nunca en un descarte suelto.
- **J-35** · MVP · Si el jugador cambia el tablero, la siguiente pulsación empieza una pista nueva desde el nivel 1.
- **J-36** · MVP · Se cuenta cada pulsación de Pista y el total aparece en el resumen final.
- **J-37** · MVP · Si ninguna técnica de T1 a T6 permite avanzar (puede pasar con sudokus introducidos a mano), la pista lo dice y ofrece **Abrir en Resolver**.

### 4.5 Errores y comprobación

- **J-40** · MVP · Marca en tiempo real de los **números repetidos** en una misma unidad. Se puede desactivar en Opciones.
- **J-41** · MVP · Botón **Comprobar**: marca los números del jugador que no coinciden con la solución.
- **J-42** · MVP · Fuera de **Comprobar** y **Pista**, nunca se indica si un número es incorrecto.

### 4.6 Resaltados visuales

- **J-50** · MVP · Al seleccionar una celda se resaltan su fila, su columna y su caja.
- **J-51** · MVP · Al seleccionar una celda con número, se resaltan las demás celdas con ese mismo número.
- **J-52** · MVP · Ambos resaltados están activados por defecto y se pueden desactivar en Opciones.

### 4.7 Control de partida

- **J-60** · MVP · **Deshacer** y **Rehacer** de números y notas, también con `Ctrl+Z` y `Ctrl+Y`.
- **J-61** · MVP · **Reiniciar**: deja solo los números iniciales. Pide confirmación.
- **J-62** · MVP · **Cronómetro**:
  - se pausa solo al cambiar de pestaña;
  - tiene botón de pausa, y la pausa oculta el tablero.
- **J-63** · MVP · El cronómetro **se puede ocultar** pulsándolo o desde Opciones.
  - Sigue contando aunque esté oculto.
  - Vuelve a mostrarse pulsando su hueco o desde Opciones.
- **J-64** · MVP · Guardado automático de la partida en curso.
- **J-65** · MVP · Al rellenar el tablero:
  - si es correcto, se muestra un resumen con tiempo, dificultad, pistas usadas y comprobaciones usadas;
  - si hay errores, se muestra "El tablero está lleno pero hay errores", sin decir dónde.
- **J-66** · MVP · **Abrir en Resolver**:
  - Lleva al modo Resolver los números iniciales y los del jugador. La partida de Jugar no se modifica.
  - Si algún número del jugador es incorrecto, avisa y ofrece quitarlos antes de llevarlos.

---

## 5. Modo Resolver

### 5.1 Entrada

- **R-01** · MVP · Tablero vacío editable. Se escribe igual que en Jugar (barra numérica en táctil, teclado en escritorio), pero sin notas.
- **R-02** · MVP · **Pegar sudoku** como cadena de 81 caracteres:
  - dígitos `1`–`9`, con `0` o `.` para las celdas vacías;
  - se ignoran espacios y saltos de línea.
- **R-03** · MVP · **Generar uno**: crea un sudoku nuevo de nivel Fácil, Medio o Difícil.
- **R-04** · MVP · **Traer partida actual**: hace lo mismo que J-66.
- **R-05** · MVP · **Limpiar** el tablero.

### 5.2 Validación en vivo

- **R-10** · MVP · Los números repetidos en una unidad se resaltan mientras se escribe.
- **R-11** · MVP · Contador de números introducidos. Con menos de 17 aparece el aviso: "no puede tener solución única".

### 5.3 Resolver y analizar

- **R-20** · MVP · **Resolver todo** muestra la solución completa. Los números deducidos se ven con un estilo distinto a los introducidos.
- **R-21** · MVP · Antes de resolver se analiza el sudoku, con tres resultados posibles:
  - **Sin solución.** Si se debe a números repetidos, se señalan.
  - **Solución única.**
  - **Varias soluciones.** Se muestra una y se resaltan las celdas que cambian entre dos soluciones distintas.
- **R-22** · MVP · **Dificultad:** se muestran la técnica más difícil necesaria y la lista de técnicas usadas. Si hace falta prueba y error, se indica "fuera de escala".
- **R-23** · MVP · **Siguiente número** (paso a paso). Es la forma de pedir números sueltos y usa el mismo motor que la Pista.
  - Coloca el siguiente número.
  - Muestra la técnica, las celdas resaltadas y la explicación.
  - Tiene botones **Anterior**, **Siguiente** y **Hasta el final**.
- **R-24** · MVP · Si ninguna técnica de T1 a T6 permite avanzar, el paso a paso lo indica ("Este paso requiere prueba y error") y completa el resto por búsqueda.
- **R-25** · MVP · **Jugar este sudoku**:
  - Inicia una partida nueva en Jugar con los números introducidos (no los deducidos) como números iniciales.
  - Solo se permite si el sudoku tiene solución única.

---

## 6. Motor de sudoku

Está escrito en JavaScript, para que funcione en GitHub Pages, y parte de las ideas del script Python (§10).

### 6.1 Técnicas lógicas (de más fácil a más difícil)

| ID | Técnica | En qué consiste | Prioridad |
|----|---------|-----------------|-----------|
| T1 | Último hueco | Una unidad tiene una sola celda vacía. | MVP |
| T2 | Único sitio | Un número solo cabe en una celda de una caja, fila o columna. Es la única técnica del script actual. | MVP |
| T3 | Único candidato | En una celda solo cabe un número. | MVP |
| T4 | Candidatos bloqueados | Dentro de una caja, un número solo puede ir en una fila o columna, así que se descarta de esa fila o columna fuera de la caja. También el caso inverso. | MVP |
| T5 | Parejas y tríos desnudos | 2 o 3 celdas de una unidad comparten solo 2 o 3 candidatos, que se descartan del resto de la unidad. | MVP |
| T6 | Parejas y tríos ocultos | 2 o 3 números de una unidad solo caben en las mismas 2 o 3 celdas. | MVP |
| T7 | X-Wing y Swordfish | Patrones de un mismo número en 2 o 3 filas o columnas. | Opcional |
| T8 | XY-Wing | Cadena de tres celdas con dos candidatos cada una. | Opcional |
| — | Prueba y error | Búsqueda por backtracking. **Solo se usa en Resolver** (R-20, R-21, R-24); nunca en pistas ni para generar. | MVP |

### 6.2 Funciones del motor

- **M-01** · MVP · Leer y escribir sudokus como cadena de 81 caracteres.
- **M-02** · MVP · Validar: detectar números repetidos.
- **M-03** · MVP · Búsqueda completa: backtracking que guarda los candidatos de cada celda como bits y empieza siempre por la celda con menos opciones.
  - Devuelve una solución.
  - Cuenta soluciones hasta 2, para saber si la solución es única.
  - No hace falta *Dancing Links*: para sudokus de 9×9 este método tarda menos de un milisegundo.
- **M-04** · MVP · Calcular los candidatos a partir de los números colocados.
- **M-05** · MVP · **Siguiente paso lógico.** Recibe un tablero y devuelve:
  - la técnica usada;
  - la colocación y los descartes previos;
  - las celdas y unidades que lo justifican;
  - el texto de cada nivel de pista.

  Esta función sirve para la Pista, el Siguiente número y la clasificación de dificultad.
- **M-06** · MVP · Resolver por lógica: aplica pasos hasta terminar o atascarse. Devuelve la lista de pasos y la dificultad.
- **M-07** · MVP · Generar un sudoku de una dificultad dada (§6.3).
- **M-08** · MVP · El motor no depende de la interfaz, para poder probarlo con tests en Node.

### 6.3 Generación y dificultad

- **G-01** · MVP · **Cuadrícula completa:** backtracking que prueba los números en orden aleatorio y empieza por la celda con menos opciones. Sustituye los reinicios desde cero del script.
- **G-02** · MVP · **Vaciado** (es la idea del script actual):
  - se recorren las celdas en orden aleatorio;
  - cada celda se vacía solo si el sudoku sigue resolviéndose por lógica con las técnicas permitidas para ese nivel;
  - así se garantiza una solución única sin necesidad de búsqueda;
  - cada celda se prueba una sola vez: si ahora no se puede quitar, más adelante tampoco.
- **G-03** · MVP · **Optimización:** al comprobar si se puede vaciar una celda, el resolvedor se detiene en cuanto vuelve a deducir esa celda, porque a partir de ahí el sudoku ya era resoluble.
- **G-04** · MVP · La dificultad es la **técnica más difícil necesaria**. Si el resultado no encaja en el nivel pedido, se genera otro, como hacen [HoDoKu](https://hodoku.sourceforge.net/en/docs_cre.php) y [QQWing](https://ostermiller.org/qqwing/about.html).
- **G-05** · MVP · **Niveles** (los números iniciales son orientativos y se ajustarán al probar):

  | Nivel | Técnicas permitidas al vaciar | Debe requerir | Números iniciales |
  |-------|-------------------------------|---------------|-------------------|
  | Fácil | T1–T2 | — | se deja de vaciar al llegar a ~36 |
  | Medio | T1–T3 | T3 | lo que salga del vaciado (22–27 en las pruebas) |
  | Difícil | T1–T6 | alguna de T4–T6 | lo que salga del vaciado (22–27 en las pruebas) |

- **G-06** · MVP · La generación corre en un *Web Worker* para que la interfaz no se congele.
- **G-07** · Opcional · **Sudoku en la recámara:** generar en segundo plano el siguiente sudoku de la misma dificultad.
  - Con los tiempos medidos no hace falta (ver tabla de abajo).
  - Se activa solo si en móviles reales la generación resulta lenta.
  - En ese caso, propongo generarlo al empezar la partida en lugar de cerca del final: es más sencillo y siempre está listo.
**Medidas del prototipo** (JavaScript en Node, en una sola máquina; el motor definitivo puede variar):

| Paso | Tiempo |
|------|--------|
| Cuadrícula completa (G-01) | 0,2 ms |
| Vaciado con T1–T3 | ~4 ms |
| Vaciado con T1–T6 | ~11 ms |
| Sudoku Medio (el 47 % de los vaciados con T1–T3 requiere T3) | ~10 ms de media |
| Sudoku Difícil (el 29 % de los vaciados con T1–T6 requiere T4–T6) | ~50 ms de media |
| Script Python actual, como referencia | ~0,45 s por vaciado; ~18 s de media hasta llegar a 22 números iniciales |

- La parada temprana de G-03 ahorra un 20–30 % y da exactamente el mismo resultado: 0 diferencias en 200 pruebas.
- **Descartado:** quitar varios números de golpe al principio y reducir la cantidad conforme quedan menos.
  - Hace menos comprobaciones (53 frente a 81).
  - No es más rápido: empata con solo T1–T3 y es ~60 % más lento con T1–T6, porque los intentos fallidos se concentran al final, cuando el sudoku tiene pocos números y cada comprobación es más cara.

---

## 7. Datos, guardado y compartir

- **D-01** · MVP · Formato de intercambio: cadena de 81 caracteres (R-02).
- **D-02** · MVP · En `localStorage` se guardan:
  - la partida en curso: números iniciales, números del jugador, notas (posibles y descartes), tiempo, pistas y comprobaciones usadas;
  - el tablero del modo Resolver;
  - las opciones, incluida la visibilidad del cronómetro.

  El historial de deshacer no se conserva al recargar.
- **D-03** · v2 · **Compartir:** botón que copia un enlace `?p=<81 caracteres>`.
  - Si el sudoku tiene solución única, el enlace abre una partida en Jugar.
  - Si no, lo abre en Resolver.
- **D-04** · v2 · **Estadísticas:** partidas jugadas y mejores tiempos por dificultad.

---

## 8. Requisitos no funcionales

- **N-01** · MVP · Sitio 100 % estático, sin paso de compilación (módulos ES). Se publica desde `docs/` en GitHub Pages.
- **N-02** · MVP · Se puede usar en móvil y tablet (táctil, con barra numérica) y en escritorio (teclado).
- **N-03** · MVP · El motor no tiene dependencias externas. Se prueba con `node --test`.
- **N-04** · MVP · Accesibilidad básica: todo se puede hacer con teclado, con etiquetas `aria` en el tablero y los botones.
- **N-05** · MVP · Interfaz en **español e inglés**, con el selector de idioma del sistema de diseño.
  - Orden de decisión: parámetro `?lang=`, última elección guardada y, si no hay ninguna, idioma del navegador (español si empieza por `es`; inglés en otro caso).
  - Los textos fijos se marcan con `data-i18n`; las explicaciones de las pistas se construyen en los dos idiomas.
- **N-06** · MVP · El aspecto visual sigue el **sistema común de diseño** de taridepaco:
  - `system.css` y `theme.js` se copian sin modificar;
  - cabecera de proyecto con vuelta a la portada, botón de tema (auto, claro, oscuro) e idioma;
  - página tipo simulador: panel de controles a la izquierda en escritorio, y hoja plegable con barra de mandos en móvil.
- **N-07** · Opcional · Uso sin conexión como PWA.
- **N-08** · MVP · El script Python (`sudoku_main.py` y `sudoku.csv`) se conserva tal cual, como recuerdo. La web no lo usa.

---

## 9. Decisiones abiertas

Ninguna por ahora.

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

Vaciar celdas solo mientras el sudoku se resuelva por lógica pura (G-02). Esto garantiza solución única y que no haga falta adivinar.

### Problemas encontrados

Se corrigen en el motor JS; el script se deja como está.

- **Le falta la técnica T3** (único candidato). En 139 de 396 sudokus en los que se atascó, había una celda con un solo candidato que no aprovechó.
- **No usa búsqueda.** Con un sudoku difícil conocido no coloca ni un número.
- **No distingue entre resultados.** "Sin solución", "varias soluciones" y "demasiado difícil" dan el mismo resultado. Tampoco valida números repetidos.
- **No hay niveles de dificultad.** Todos los sudokus se resuelven solo con T2.
- **Pierde la solución.** `sdku_drain` modifica la cuadrícula completa, y `sdku_solv` también modifica el sudoku que recibe.
- **Detalles menores:**
  - `main(p<23)` lanza `NameError`;
  - el comentario "checkout rows" en realidad recorre una columna;
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
      techniques.js      (T1…T6, siguiente paso lógico)
      generator.js       (cuadrícula completa, vaciado, dificultad)
    ui/                  ← tablero, barra numérica, panel de notas, modos, opciones
    worker.js            ← generación en segundo plano
tests/
  engine/*.test.js       ← node --test
sudoku_main.py           ← script original, se conserva como recuerdo
sudoku.csv
```

## 12. Fases

1. **Motor:**
   - M-01 a M-08;
   - técnicas T1–T6;
   - generador por niveles (G-01 a G-06);
   - tests.
2. **Jugar (MVP):** todos los J-xx marcados como MVP.
3. **Resolver (MVP):** todos los R-xx marcados como MVP.
4. **v2:**
   - compartir (A-07, D-03);
   - estadísticas (D-04).
5. **Opcionales:**
   - técnicas T7–T8;
   - recámara (G-07);
   - barra numérica en escritorio (J-16);
   - PWA (N-07).
