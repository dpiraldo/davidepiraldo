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
3. Vedrai quattro sezioni:
   - **Properties** — crea/modifica le proprietà in vendita: nome, prezzo,
     camere, m², amenities, foto, video, testi bilingue EN/FR
   - **Sold Properties** — l'elenco delle proprietà vendute, come una lista:
     puoi aggiungere, rimuovere, riordinare o duplicare ogni voce con i
     pulsanti del CMS, senza toccare il codice
   - **Homepage** — hero, statistiche di mercato, proprietà in evidenza,
     sezione contatti, footer
   - **Journal Articles** — i 10+ articoli del blog: titolo, categoria,
     estratto, foto di copertina e testo completo dell'articolo
4. Fai le modifiche, clicca **Publish**
5. Il sito si aggiorna da solo in 30-60 secondi

---

## Due passaggi manuali che il CMS non fa (per ora)

- **Nuova proprietà in vendita**: dopo averla creata dal CMS, va aggiunta
  a mano una card in `properties-index.html` (istruzioni nel commento del
  file). Le proprietà **vendute** non hanno questo problema — quella pagina
  si aggiorna da sola.
- **Nuovo articolo**: dopo averlo creato dal CMS, va aggiunto il suo slug
  in "Journal — Article Order", altrimenti esiste ma non compare
  nell'indice del Journal.

Se in futuro vuoi rendere automatica anche la pagina delle proprietà in
vendita (stesso meccanismo già usato per le vendute), fammelo sapere.

---

## Attivare il bottone "Traduci" (EN → FR/IT con DeepL)

Il CMS ha un bottone "🌐 Traduci" nella sezione Testi di ogni proprietà e
articolo. Funziona solo quando il sito è pubblicato su Netlify (non con
`start-local.sh`, che è solo un server statico senza le "functions"):

1. Crea un account gratuito su [deepl.com/pro-api](https://www.deepl.com/pro-api)
   (il piano Free basta per iniziare: 500.000 caratteri/mese gratis, poi si
   passa a pagamento se serve di più).
2. Copia la tua chiave API (finisce con `:fx` se hai preso il piano Free).
3. Su Netlify: **Site settings → Environment variables** → aggiungi
   `DEEPL_API_KEY` con la tua chiave.
4. Rideploya il sito ("Clear cache and deploy") perché la variabile venga
   letta.
5. Da `/admin`, scrivi il testo in inglese, premi "🌐 Traduci da English" —
   francese e italiano si compilano da soli. Rileggili sempre prima di
   pubblicare, soprattutto per gli articoli su tasse e compliance.

Per testare in locale prima di pubblicare, serve `netlify dev` (invece di
`start-local.sh`) con la CLI di Netlify installata (`npm install -g netlify-cli`)
e la stessa variabile `DEEPL_API_KEY` impostata in un file `.env` locale.

---

## Se qualcosa non funziona

Il problema più comune è dimenticare il Passo 4.5 (Git Gateway) — senza quello,
il login funziona ma salvare le modifiche dà errore. Se ti blocchi in un punto
qualsiasi, dimmi esattamente a che passo sei e cosa vedi sullo schermo.
