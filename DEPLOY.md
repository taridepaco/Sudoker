# Despliegue

Sudoker es una web estática. `deploy/build.sh` la construye en `dist/`, y eso es lo que se publica:

| Dónde | URL | Cómo se actualiza |
|---|---|---|
| GitHub Pages | https://taridepaco.github.io/Sudoker/ | Solo, con cada push a `main` (`.github/workflows/pages.yml`). |

`deploy/build.sh` y `.github/workflows/pages.yml` son comunes a todas las webs de taridepaco y se
copian de [taridepaco.github.io](https://github.com/taridepaco/taridepaco.github.io): no se editan
aquí. Lo propio de este proyecto es `deploy/test.sh`, con las pruebas que el workflow pasa antes de
construir.

## Construir

```sh
deploy/build.sh                                   # web/ → dist/
python3 -m http.server 8000 --directory dist      # para probar el resultado
```

`dist/` no se sube a git. Todo salvo `index.html` va en `v/<hash>/`, un directorio con el nombre del
contenido, e `index.html` apunta ahí. Con cada cambio cambian las URLs, así que ninguna caché mezcla
dos versiones. Los módulos se importan entre sí con rutas relativas y el worker se carga con
`import.meta.url`, así que todo funciona dentro de `v/<hash>/`.

## Pruebas

```sh
deploy/test.sh        # o npm test; necesita Node 22 o más, sin dependencias
```

Comprueban el motor (`web/js/engine/`): lectura de sudokus, la búsqueda, las técnicas T1–T6 y los
niveles del generador. Si fallan, no se publica nada.

## GitHub Pages

- En cada PR, el workflow pasa las pruebas y construye la web, pero no la publica.
- En cada push a `main`, o a mano desde *Actions → Pages → Run workflow*, además publica `dist/`.

Configuración, una sola vez: *Settings → Pages → Build and deployment → Source: GitHub Actions*.
