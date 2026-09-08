#!/usr/bin/env bash
# Comprueba la app: ejecuta las pruebas y saca capturas de móvil.
#   ./check.sh          -> pruebas
#   ./check.sh shots    -> pruebas + capturas en ./capturas/
#
# El proyecto no usa Node: la app es estática. Chrome en modo headless abre
# los archivos locales y ejecuta el JS, así que es el que valida.
set -e
cd "$(dirname "$0")"

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -f "$CHROME" ] || { echo "No encuentro Chrome en $CHROME"; exit 1; }
PROF="$(cygpath -m "$(mktemp -d)")/perfil"
HERE="$(cygpath -m "$(pwd)")"

run(){   # run <archivo.html> [#vista]
  timeout 120 "$CHROME" --headless=new --disable-gpu --no-first-run \
    --user-data-dir="$PROF" --allow-file-access-from-files \
    --enable-logging=stderr --v=1 --virtual-time-budget=8000 \
    --dump-dom "file:///$HERE/$1" 2>&1 >/dev/null \
    | grep -o 'CONSOLE:[0-9]*\] ".*"' | sed 's/^CONSOLE:[0-9]*\] "//; s/"$//'
}

inject(){  # inject <script.js> <salida.html>
  awk -v f="$1" '/^<\/body>/{print "<script>"; while((getline l < f)>0) print l; print "</script>"} {print}' \
    index.html > "$2"
}

echo "== Pruebas =="
inject test.js .test.html
OUT="$(run .test.html)"
echo "$OUT" | grep -v "^PASS" || true
echo "$OUT" | grep "^PASS" | wc -l | sed 's/^/pruebas superadas: /'
rm -f .test.html
echo "$OUT" | grep -q "0 fallos" || { echo "HAY FALLOS"; exit 1; }

if [ "$1" = "shots" ]; then
  echo "== Capturas =="
  mkdir -p capturas
  inject seed.js demo.html
  timeout 120 "$CHROME" --headless=new --disable-gpu --no-first-run \
    --user-data-dir="$PROF" --allow-file-access-from-files --hide-scrollbars \
    --window-size=1230,880 --virtual-time-budget=8000 \
    --screenshot="$HERE/capturas/movil.png" "file:///$HERE/mobile-test.html" 2>/dev/null
  rm -f demo.html
  echo "capturas/movil.png"
fi
