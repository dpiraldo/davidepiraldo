// netlify/functions/translate.js
//
// Chiamata dal bottone "Traduci" dentro /admin. Gira lato server su Netlify,
// così la chiave DeepL non finisce mai nel codice che il browser scarica.
//
// SETUP RICHIESTO (una volta sola):
// 1. Crea un account su https://www.deepl.com/pro-api (il piano "Free" basta
//    per iniziare: 500.000 caratteri/mese gratis).
// 2. Copia la tua chiave API (finisce con ":fx" se è un piano Free).
// 3. Su Netlify: Site settings → Environment variables → aggiungi
//    DEEPL_API_KEY = <la tua chiave>
// 4. Rideploya il sito (o "Clear cache and deploy") perché la variabile
//    venga letta dalla function.
//
// IN LOCALE: questa function gira solo con `netlify dev` (non con
// start-local.sh, che è solo un server statico + decap-server). Se apri
// /admin con start-local.sh il bottone "Traduci" mostrerà un errore chiaro
// invece di fallire in silenzio — è previsto, non è un bug.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'DEEPL_API_KEY non configurata. Vai su Netlify → Site settings → Environment variables e aggiungila, poi rideploya.',
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo della richiesta non valido (JSON atteso).' }) };
  }

  const { texts, target_lang, source_lang } = payload;
  if (!Array.isArray(texts) || texts.length === 0 || !target_lang) {
    return { statusCode: 400, body: JSON.stringify({ error: '"texts" (array) e "target_lang" sono obbligatori.' }) };
  }

  // Le chiavi del piano Free DeepL finiscono in ":fx" e usano un host diverso.
  const isFreeKey = apiKey.trim().endsWith(':fx');
  const endpoint = isFreeKey
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const params = new URLSearchParams();
  texts.forEach((t) => params.append('text', t || ''));
  params.append('target_lang', target_lang);
  params.append('source_lang', source_lang || 'EN');
  params.append('tag_handling', 'html'); // preserva i tag HTML nel testo degli articoli

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const raw = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `DeepL ha risposto con un errore (${res.status}): ${raw}` }),
      };
    }

    const data = JSON.parse(raw);
    const translations = (data.translations || []).map((t) => t.text);
    return { statusCode: 200, body: JSON.stringify({ translations: translations }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String((err && err.message) || err) }) };
  }
};
