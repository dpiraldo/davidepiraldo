# Davide Piraldo — Sito Web

Sito statico (HTML puro, nessun framework) per Davide Piraldo, Luxury Advisor — Monaco.

## Struttura del progetto

```
index.html                              → Homepage
blog-index.html                         → Indice del Journal (blog)
01-...html → 10-...html                 → I 10 articoli del Journal
property-villa-bellevue.html            → Landing page della proprietà in evidenza

admin/                                  → CMS (Decap CMS) per modificare proprietà e foto articoli
  index.html                            → Pagina di login/editor
  config.yml                            → Configurazione dei campi editabili

content/                                → Dati letti dal CMS e dalle pagine
  property.json                         → Dati della proprietà in evidenza
  article-images.json                   → Riferimenti foto dei 10 articoli

social-studio.html                      → Tool PRIVATO per generare post/reel Instagram
                                           (non collegato al sito pubblico, non nel menu)

SETUP-CMS.md                            → Guida passo-passo per mettere online il sito
                                           con GitHub + Netlify + il CMS
```

## Come aprire il progetto in locale

Sono file HTML statici — bastano un editor (Cursor) e un browser.

**Nota importante**: `index.html` e `property-villa-bellevue.html` provano a leggere
`content/property.json` via `fetch()`. Aprendo i file con un doppio click
(protocollo `file://`), il browser blocca queste richieste per motivi di sicurezza
e vedrai il contenuto statico di fallback — è normale, non è un errore.
Per vedere il caricamento dinamico funzionare, serve un piccolo web server locale:

```bash
# dalla cartella del progetto
python3 -m http.server 8000
# poi apri http://localhost:8000 nel browser
```

Oppure, se lavori in Cursor, usa l'estensione "Live Server" per VS Code/Cursor,
che fa la stessa cosa con un click.

## Prossimi passi

1. Sostituisci le immagini placeholder (cerca `data-img-id` e i commenti `ADMIN NOTE`
   in cima a ogni file HTML)
2. Aggiorna l'email di contatto e il link Instagram in `index.html` (sezione Contact e footer)
3. Segui `SETUP-CMS.md` per mettere il sito online con il CMS collegato
4. Se vuoi, usa `social-studio.html` in locale per generare grafiche Instagram —
   non richiede setup, apri il file e basta

## Stack tecnico

- HTML puro con CSS inline (nessuna build, nessuna dipendenza da installare)
- Google Fonts: Cormorant Garamond (titoli), Jost (corpo testo)
- Palette colori in formato `oklch()` — se un tool non la supporta, i valori
  hex equivalenti sono nei commenti di `admin/config.yml` e `social-studio.html`
- CMS: Decap CMS (gratuito, richiede GitHub + Netlify — vedi SETUP-CMS.md)
