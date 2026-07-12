#!/bin/bash
# Avvia il sito + admin CMS in locale (nessun setup Netlify richiesto).
# Uso: ./start-local.sh
# Poi apri: http://localhost:8000/admin/
#
# NOTA: il bottone "🌐 Traduci" (EN→FR/IT con DeepL) NON funziona con questo
# script, perché è solo un server statico + decap-server, senza le Netlify
# Functions. Per provarlo in locale serve `netlify dev` al suo posto — vedi
# SETUP-CMS.md, sezione "Attivare il bottone Traduci".

cd "$(dirname "$0")"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  git init -b main
  git add -A
  git commit -m "Initial commit for local CMS"
fi

echo "→ Sito:  http://localhost:8000"
echo "→ Admin: http://localhost:8000/admin/"
echo ""
echo "Premi Ctrl+C per fermare entrambi i server."
echo ""

python3 -m http.server 8000 &
SITE_PID=$!
npx --yes decap-server &
CMS_PID=$!

trap "kill $SITE_PID $CMS_PID 2>/dev/null" EXIT
wait
