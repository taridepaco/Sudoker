#!/usr/bin/env bash
# Builds the static site in web/ into dist/. dist/ is the only thing that gets published: GitHub
# Pages (.github/workflows/pages.yml) and the home server (deploy/install.sh) serve the same files.
#
# Everything but index.html goes under v/<hash>/, a directory named after the content, and the
# href/src of index.html are rewritten to point there. Any change gives new URLs, so no cache
# (GitHub Pages keeps files 10 minutes, Cloudflare keeps CSS and JS for hours) mixes two versions.
# A ?v= on index.html would not be enough: ES modules import each other by URL.
# Pages must load files relative to themselves (a <script src>, or import.meta.url in modules),
# never relative to the page: the page stays at the root.
#
# Not published: web/tests/ and dotfiles. Needs bash and GNU coreutils (Linux, WSL, GitHub runner).
# Common to every taridepaco site, copied from taridepaco.github.io: do not edit it here.
set -euo pipefail
cd "$(dirname "$0")/.."

src=web
[ -f "$src/index.html" ] || { echo "error: $src/index.html not found" >&2; exit 1; }

mapfile -t files < <(cd "$src" && find . -type f ! -path './tests/*' ! -name '.*' ! -path './index.html' \
  | sed 's|^\./||' | LC_ALL=C sort)
v=$(cd "$src" && printf '%s\0' "${files[@]}" | xargs -0 sha256sum -- | sha256sum | cut -c1-10)

rm -rf dist
mkdir -p "dist/v/$v"
for f in "${files[@]}"; do
  mkdir -p "dist/v/$v/$(dirname "$f")"
  cp "$src/$f" "dist/v/$v/$f"
done

# literal replacements (no regex): href="f", src="f" and their ./f forms
html=$(<"$src/index.html")
for f in "${files[@]}"; do
  for attr in href src; do
    html=${html//"$attr=\"$f\""/"$attr=\"v/$v/$f\""}
    html=${html//"$attr=\"./$f\""/"$attr=\"v/$v/$f\""}
  done
done
printf '%s\n' "$html" > dist/index.html

# every local href/src of the page must point to a file in dist/
broken=0
while IFS= read -r url; do
  case "$url" in '' | *:* | //* | '#'*) continue ;; esac   # external, data:, mailto:, anchors
  [ -e "dist/${url%%[?#]*}" ] || { echo "error: index.html points to $url, which is not in dist/" >&2; broken=1; }
done < <(grep -oE '(href|src)="[^"]*"' dist/index.html | sed -E 's/^[a-z]+="(.*)"$/\1/')
[ "$broken" -eq 0 ] || exit 1

grep -oE '(href|src)="v/[^"]+"' dist/index.html
echo "dist/ ready: index.html + ${#files[@]} files in v/$v/"
