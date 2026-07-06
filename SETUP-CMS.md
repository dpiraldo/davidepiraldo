# Come mettere online il sito con il CMS — guida passo passo

Questa guida presuppone zero esperienza tecnica precedente. Segui i passaggi nell'ordine.
Tempo richiesto: 30-45 minuti la prima volta. Dopo questo setup, editare i contenuti
richiede solo login + compilare un modulo.

---

## Passo 1 — Crea un account GitHub (gratis)

1. Vai su **github.com** → "Sign up"
2. Crea l'account con la tua email

GitHub è dove "vive" il codice del sito. Serve solo come contenitore.

---

## Passo 2 — Carica i file del sito su GitHub

1. Su github.com, clicca "New repository"
2. Dai un nome, es. `davidepiraldo-sito`
3. Lascialo "Public"
4. Clicca "Create repository"
5. Nella pagina del repository, clicca "uploading an existing file"
6. Trascina dentro TUTTI i file e le cartelle di questo progetto (index.html,
   blog-index.html, la cartella `admin/`, la cartella `content/`, tutti gli
   articoli, ecc.)
7. Clicca "Commit changes"

---

## Passo 3 — Crea un account Netlify (gratis) e collega il sito

1. Vai su **netlify.com** → "Sign up" → scegli "Sign up with GitHub"
2. Una volta dentro, clicca "Add new site" → "Import an existing project"
3. Scegli GitHub, poi seleziona il repository `davidepiraldo-sito` che hai creato prima
4. Lascia tutte le impostazioni di default → clicca "Deploy site"

Dopo un minuto, Netlify ti darà un indirizzo tipo `nome-a-caso-123.netlify.app`.
**Il tuo sito è online.** Puoi collegare in seguito il tuo dominio vero
(es. davidepiraldo.com) dalle impostazioni di Netlify → "Domain settings".

---

## Passo 4 — Attiva il login per l'admin (Netlify Identity)

1. Dentro Netlify, sul tuo sito, vai su **Site configuration → Identity**
2. Clicca "Enable Identity"
3. Scorri fino a "Registration" → imposta su **"Invite only"** (così solo tu puoi accedere)
4. Scorri fino a "Services" → **Git Gateway** → clicca "Enable Git Gateway"
5. Torna su Identity → tab "Invite users" → invita la tua email

Riceverai una email — clicca il link, imposta una password. Fatto: hai il tuo login.

---

## Passo 5 — Usa il CMS

1. Vai su `[il-tuo-sito].netlify.app/admin/`
2. Fai login con l'email e password create al passo 4
3. Vedrai due sezioni:
   - **Featured Property** — modifica nome, prezzo, camere, m², descrizione e foto
     della proprietà in evidenza (quella su homepage e sulla pagina property)
   - **Journal Article Photos** — sostituisci la foto di copertina di ciascuno
     dei 10 articoli, uno per uno
4. Fai le modifiche, clicca **Publish**
5. Il sito si aggiorna da solo in 30-60 secondi

---

## Cosa il CMS NON gestisce (per ora)

Il testo lungo dei 10 articoli del Journal è già scritto dentro i file HTML — il
CMS al momento gestisce solo le **foto** di copertina di ciascun articolo, non
il testo. Se in futuro vuoi poter riscrivere anche i testi degli articoli dal
CMS, è un'estensione che si può aggiungere: fammelo sapere.

---

## Se qualcosa non funziona

Il problema più comune è dimenticare il Passo 4.5 (Git Gateway) — senza quello,
il login funziona ma salvare le modifiche dà errore. Se ti blocchi in un punto
qualsiasi, dimmi esattamente a che passo sei e cosa vedi sullo schermo.
