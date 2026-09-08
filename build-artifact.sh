#!/usr/bin/env bash
# Genera artifact.html a partir de index.html (única fuente de verdad).
# El host de Artifacts envuelve el archivo en su propio <!doctype>/<head>/<body>,
# así que aquí solo van: <title>, el <style> y el contenido del <body>.
set -e
cd "$(dirname "$0")"

{
  grep -m1 "<title>" index.html
  sed -n "/^<style>/,/^<\/style>/p" index.html
  sed -n "/^<header>/,/^<\/script>/p" index.html
} > artifact.html

# El service worker no aplica dentro de un Artifact: fuera.
sed -i "/serviceWorker/,+2d" artifact.html

echo "artifact.html: $(wc -l < artifact.html) lineas, $(wc -c < artifact.html) bytes"
grep -c "serviceWorker" artifact.html || echo "sw: eliminado"
