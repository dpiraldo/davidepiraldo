# Davide Piraldo — Sito Web

Sito statico (HTML puro, nessun framework) per Davide Piraldo, Luxury Advisor — Monaco.

## Struttura del progetto

```
index.html                              → Homepage
properties-index.html                   → Elenco proprietà in vendita (card scritte a mano,
                                           vedi nota "Aggiungere una proprietà" sotto)
properties-sold.html                    → Elenco proprietà vendute (completamente dinamico,
                                           si aggiorna da solo dal CMS)
property-template.html                  → Pagina di dettaglio, usata per OGNI proprietà via
                                           ?slug=<nome> (stessa pagina, dati diversi)
blog-index.html                         → Indice del Journal (blog)
article-template.html                   → Pagina di dettaglio articolo, usata per OGNI
                                           articolo via ?slug=<nome>
01-...html → 10-...html                 → Versioni statiche di backup dei 10 articoli
                                           (il contenuto reale oggi vive nei JSON, vedi sotto)

admin/                                  → CMS (Decap CMS)
  index.html                            → Pagina di login/editor
  config.yml                            → Configurazione dei campi editabili (4 sezioni:
                                           Properties, Sold Properties, Homepage, Journal Articles)

content/                                → Tutti i dati letti dal CMS e dalle pagine
  homepage.json                         → Testi e statistiche della homepage
  districts.json                        → Dati di mercato per quartiere (IMSEE), usati nelle
                                           pagine proprietà e nel Social Studio
  sold-properties.json                  → Elenco proprietà vendute (lista, un elemento per
                                           immobile — modificalo dal CMS, non a mano)
  articles-order.json                   → Ordine di visualizzazione degli articoli nel Journal
  properties/<slug>.json                → Un file per ogni proprietà in vendita
  articles/<slug>.json                  → Un file per ogni articolo del Journal (titolo,
                                           testo, foto, ecc. — tutto qui, non nell'HTML)

social-studio.html                      → Tool PRIVATO per generare post/reel Instagram
sold-properties-loader.js               → Script che popola properties-sold.html dal JSON
property-loader.js, article-loader.js,
home-loader.js, journal-loader.js       → Script che popolano le rispettive pagine dai JSON

SETUP-CMS.md                            → Guida per mettere online il sito con GitHub + Netlify
start-local.sh                          → Avvia sito + CMS in locale, senza setup Netlify
```

## Come lavorare in locale

```bash
./start-local.sh
```

Poi apri:
- `http://localhost:8000` — il sito
- `http://localhost:8000/admin/` — il CMS, senza bisogno di login (modalità locale)

Lo script avvia anche `decap-server`, necessario perché il CMS possa salvare le
modifiche direttamente nei file del progetto quando lavori in locale.

Se apri i file HTML con doppio click (protocollo `file://`) invece che con un
server locale, il browser blocca le richieste `fetch()` ai JSON in `content/`
per motivi di sicurezza: vedrai contenuto statico di fallback, non è un errore.

## Come modificare i contenuti

Tutto passa dal CMS (`/admin`) — ora con **etichette in italiano** e le
sezioni meno usate chiuse di default, per essere più semplice da usare.
Le sezioni disponibili sono:

- **Properties** — proprietà in vendita (una scheda per immobile). Per ogni
  foto principale (hero, foto edificio, foto living) puoi scegliere se
  mostrare **video o solo foto** ("Hero Display") e impostare un **punto di
  fuoco** (Center/Top/Bottom/Left/Right) così che una foto verticale o
  orizzontale venga inquadrata bene senza mai cambiare le dimensioni del
  riquadro o il layout della pagina. Puoi anche scegliere **1 o 2 quartieri**
  per ogni proprietà: la sezione "Market Intelligence" (numeri, tabella e
  testo di analisi) si aggiorna automaticamente in base alla scelta. I testi
  sono ora **Inglese, Francese e Italiano** con un bottone "🌐 Traduci" che usa
  DeepL per generare FR/IT a partire dall'inglese (richiede una chiave API,
  vedi `SETUP-CMS.md`).
- **Sold Properties** — proprietà vendute, come una lista: pulsanti nativi
  per aggiungere, rimuovere, riordinare o duplicare ogni voce
- **Homepage** — hero, statistiche, **proprietà in evidenza** (ora un menu a
  tendina che cerca per nome, non più uno slug da scrivere a mano), contatti,
  footer
- **Journal Articles** — i 10+ articoli del blog, ora anch'essi in Inglese,
  Francese e Italiano con lo stesso bottone "🌐 Traduci"

**Uniche due eccezioni manuali** (non gestite dal CMS):
1. **Aggiungere una nuova proprietà in vendita**: dopo averla creata dal CMS,
   va aggiunta una card a mano in `properties-index.html` (c'è un commento
   nel file che spiega dove ed è un copia-incolla di 5 righe). Le proprietà
   **vendute**, invece, non richiedono questo passaggio — quella pagina è
   automatica.
2. **Aggiungere un nuovo articolo**: dopo averlo creato dal CMS, aggiungi il
   suo slug in "Journal — Article Order", altrimenti esiste ma non compare
   nell'indice del Journal.

## Prossimi passi

1. Sostituisci `assets/placeholder.svg` con le foto vere di Eden Tower —
   caricale dal CMS (sezione Properties → 📷 Foto e Video), non serve
   toccare i file a mano
2. Aggiorna l'email di contatto e il link Instagram in `content/homepage.json`
   (dal CMS, sezione Homepage → Contact Section)
3. Segui `SETUP-CMS.md` per mettere il sito online con il CMS collegato
4. Se vuoi, usa `social-studio.html` in locale per generare grafiche Instagram —
   non richiede setup, apri il file e basta

## Limiti noti (onestà prima di tutto)

- Le "Schede Caratteristiche" (Living & Entertaining, ecc.) sono per ora solo
  in inglese — non hanno ancora il bottone Traduci
- Le pagine legali (Privacy/Cookie/Termini) sono solo in italiano, mentre il
  resto del sito è EN/FR/IT — da valutare se tradurle anche loro
- `content/districts.json` (i dati di mercato per quartiere) non è ancora
  gestibile dal CMS — per aggiornarlo serve modificare il file a mano o
  chiedere a Claude

## Stack tecnico

- HTML puro con CSS inline (nessuna build, nessuna dipendenza da installare)
- Google Fonts: Cormorant Garamond (titoli), Jost (corpo testo)
- Palette colori in formato `oklch()` — se un tool non la supporta, i valori
  hex equivalenti sono nei commenti di `admin/config.yml` e `social-studio.html`
- CMS: Decap CMS (gratuito, richiede GitHub + Netlify per l'uso online — vedi
  `SETUP-CMS.md` — oppure `start-local.sh` per lavorare in locale senza setup)
