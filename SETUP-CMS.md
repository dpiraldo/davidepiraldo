# Come mettere online il sito con il CMS — guida passo passo

Questa guida presuppone zero esperienza tecnica precedente. Segui i passaggi
nell'ordine. Tempo richiesto: 30-45 minuti la prima volta. Dopo questo setup,
editare i contenuti richiede solo login + compilare un modulo.

**Nota importante:** questa guida usa il login **GitHub** per il CMS, non
Netlify Identity. Netlify ha deprecato Identity e Git Gateway per i siti
nuovi (non sono più raccomandati e Netlify stessa non li aggiorna più), quindi
questo progetto usa il metodo attualmente supportato: login diretto con
GitHub via OAuth. Il risultato per te è lo stesso (vai su `/admin`, fai
login, modifichi, pubblichi) — cambia solo cosa succede dietro le quinte,
ed è persino più semplice: non devi gestire un elenco separato di utenti,
usi direttamente il tuo account GitHub.

---

## Passo 1 — Crea un account GitHub (gratis)

1. Vai su **github.com** → "Sign up"
2. Crea l'account con la tua email

GitHub è dove "vive" il codice del sito.

---

## Passo 2 — Carica i file del sito su GitHub

1. Su github.com, clicca "New repository"
2. Dai un nome, es. `davidepiraldo-sito`
3. Lascialo "Public" (va bene anche "Private", vedi nota sotto)
4. Clicca "Create repository"
5. Nella pagina del repository, clicca "uploading an existing file"
6. Trascina dentro TUTTI i file e le cartelle di questo progetto (index.html,
   blog-index.html, la cartella `admin/`, la cartella `content/`, la cartella
   `netlify/`, tutti gli articoli, ecc.)
7. Clicca "Commit changes"

**Nota:** se lavori da Cursor, puoi anche usare `git init` / `git remote add` /
`git push` dal terminale integrato invece di trascinare i file a mano — stesso
risultato.

**Annota il nome esatto**, ti servirà tra poco: `tuo-utente-github/davidepiraldo-sito`

---

## Passo 3 — Crea un account Netlify (gratis) e collega il sito

1. Vai su **netlify.com** → "Sign up" → scegli "Sign up with GitHub"
2. Una volta dentro, clicca "Add new site" → "Import an existing project"
3. Scegli GitHub, poi seleziona il repository che hai creato prima
4. Lascia tutte le impostazioni di default → clicca "Deploy site"

Dopo un minuto, Netlify ti darà un indirizzo tipo `nome-a-caso-123.netlify.app`.
**Il tuo sito è online.** Puoi collegare in seguito il tuo dominio vero
(es. davidepiraldo.com) dalle impostazioni di Netlify → "Domain settings".

**Annota anche questo indirizzo**, ti serve al passo successivo.

---

## Passo 4 — Login del CMS (GitHub OAuth)

Qui creiamo la "chiave" che permette al CMS di salvare le modifiche su GitHub
per tuo conto, senza che tu debba mai toccare GitHub direttamente.

1. Su GitHub, vai su **Settings** (il tuo profilo, non il repository) →
   **Developer settings** (in fondo al menu a sinistra) → **OAuth Apps** →
   **New OAuth App**
2. Compila:
   - **Application name**: es. "Davide Piraldo CMS"
   - **Homepage URL**: l'indirizzo Netlify del Passo 3 (es. `https://nome-a-caso-123.netlify.app`)
   - **Authorization callback URL**: lo stesso indirizzo + `/.netlify/functions/callback`
     (es. `https://nome-a-caso-123.netlify.app/.netlify/functions/callback`)
3. Clicca **Register application**
4. Copia il **Client ID** mostrato
5. Clicca **Generate a new client secret** → copia anche quello (si vede una
   volta sola, salvalo subito da qualche parte)

Ora su **Netlify** → il tuo sito → **Site configuration → Environment variables**:
1. Aggiungi `GITHUB_OAUTH_CLIENT_ID` = il Client ID appena copiato
2. Aggiungi `GITHUB_OAUTH_CLIENT_SECRET` = il Client Secret appena copiato
3. Vai su **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
   (necessario perché le nuove variabili vengano lette)

Infine, apri `admin/config.yml` nel tuo repository e sostituisci le due righe
segnate con "⬇️ SOSTITUISCI":
```yaml
backend:
  name: github
  repo: "tuo-utente-github/davidepiraldo-sito"   # ⬅️ il nome esatto del Passo 2
  branch: main
  base_url: "https://nome-a-caso-123.netlify.app" # ⬅️ l'indirizzo del Passo 3
  auth_endpoint: ".netlify/functions/auth"
```
Salva, fai commit/push (o ricarica il file su GitHub) — Netlify rifarà il
deploy da solo in automatico dopo ogni modifica al repository.

---

## Passo 5 — Usa il CMS

1. Vai su `[il-tuo-sito].netlify.app/admin/`
2. Clicca **Login with GitHub** → autorizza con il tuo account GitHub
   (quello con cui hai creato il repository al Passo 2)
3. Vedrai le sezioni:
   - **Properties** — crea/modifica le proprietà in vendita: nome, prezzo,
     camere, m², amenities, foto, video, planimetria, testi in Inglese/Francese/Italiano
   - **Sold Properties** — proprietà vendute, come una lista: aggiungi,
     rimuovi, riordina o duplica ogni voce con i pulsanti del CMS
   - **Homepage** — hero, statistiche di mercato, proprietà in evidenza
     (puoi aggiungerne quante vuoi), contatti, footer
   - **Journal Articles** — gli articoli del blog, anch'essi in 3 lingue
4. Fai le modifiche, clicca **Publish**
5. Il sito si aggiorna da solo in 30-60 secondi

---

## Due passaggi manuali che il CMS non fa (per ora)

- **Nuova proprietà in vendita**: dopo averla creata dal CMS, va aggiunta
  a mano una card in `properties-index.html` (istruzioni nel commento del
  file). Le proprietà **vendute** non hanno questo problema — quella pagina
  si aggiorna da sola.
- **Nuovo articolo**: dopo averlo creato dal CMS, va aggiunto in "Journal —
  Article Order", altrimenti esiste ma non compare nell'indice del Journal.

---

## Attivare il bottone "Traduci" (EN → FR/IT con DeepL)

Il CMS ha un bottone "🌐 Traduci" nella sezione Testi di ogni proprietà e
articolo. Funziona solo quando il sito è pubblicato su Netlify (non con
`start-local.sh`, che è solo un server statico senza le "functions"):

1. Crea un account gratuito su [deepl.com/pro-api](https://www.deepl.com/pro-api)
   (il piano Free basta per iniziare: 500.000 caratteri/mese gratis, poi si
   passa a pagamento se serve di più).
2. Copia la tua chiave API (finisce con `:fx` se hai preso il piano Free).
3. Su Netlify: **Site configuration → Environment variables** → aggiungi
   `DEEPL_API_KEY` con la tua chiave.
4. **Trigger deploy → Clear cache and deploy site** perché la variabile
   venga letta.
5. Da `/admin`, scrivi il testo in inglese, premi "🌐 Traduci da English" —
   francese e italiano si compilano da soli. Rileggili sempre prima di
   pubblicare, soprattutto per gli articoli su tasse e compliance.

Per testare in locale prima di pubblicare, serve `netlify dev` (invece di
`start-local.sh`) con la CLI di Netlify installata (`npm install -g netlify-cli`)
e le stesse variabili impostate in un file `.env` locale.

---

## Se qualcosa non funziona

- **"Login with GitHub" non appare o dà errore**: controlla che
  `GITHUB_OAUTH_CLIENT_ID` e `GITHUB_OAUTH_CLIENT_SECRET` siano davvero
  impostate su Netlify, e che tu abbia rifatto il deploy dopo averle aggiunte.
- **L'autorizzazione GitHub si apre ma poi resta bloccata**: controlla che la
  "Authorization callback URL" nell'OAuth App su GitHub sia *esattamente*
  `https://tuosito.netlify.app/.netlify/functions/callback` (incluso `https://`,
  incluso lo slash finale del dominio prima di `/.netlify`).
- **Il salvataggio di una modifica fallisce**: controlla che `repo:` in
  `admin/config.yml` sia scritto esattamente come `utente/nome-repository`
  (senza `https://github.com/` davanti) e che il tuo account GitHub abbia
  accesso in scrittura a quel repository.
- Se ti blocchi in un punto qualsiasi, dimmi esattamente a che passo sei e
  cosa vedi sullo schermo.
