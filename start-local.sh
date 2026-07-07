#!/bin/bash
# Avvia il sito + admin CMS in locale (nessun setup Netlify richiesto).
# Uso: ./start-local.sh
# Poi apri: http://localhost:8000/admin/

cd "$(dirname "$0")"

if ! command -v npx >/dev/null 2>&1; then
  echo "Node.js non è installato — serve per l'admin locale."
  echo ""
  echo "Installalo da https://nodejs.org (versione LTS), poi rilancia:"
  echo "  ./start-local.sh"
  echo ""
  echo "Avvio solo il sito (senza admin) su http://localhost:8000"
  python3 -m http.server 8000
  exit 0
fi

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
