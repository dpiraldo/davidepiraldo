// netlify/functions/callback.js
//
// Secondo passo del login GitHub per il CMS. GitHub reindirizza qui con un
// "code" temporaneo; questa function lo scambia (lato server, con il Client
// Secret mai esposto al browser) per un token di accesso vero e proprio, poi
// lo passa alla finestra del CMS nel formato che Decap CMS si aspetta.
//
// SETUP RICHIESTO — vedi SETUP-CMS.md, sezione "Login del CMS (GitHub OAuth)".

exports.handler = async (event) => {
  const { code, error, error_description: errorDescription } = event.queryStringParameters || {};

  if (error) {
    return htmlError(`GitHub ha rifiutato l'autorizzazione: ${errorDescription || error}`);
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return htmlError('Parametri OAuth mancanti — verifica GITHUB_OAUTH_CLIENT_ID e GITHUB_OAUTH_CLIENT_SECRET su Netlify.');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return htmlError('Errore GitHub: ' + (tokenData.error_description || tokenData.error || 'token mancante'));
    }

    const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });

    const html = `<!DOCTYPE html>
<html><body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload.replace(/</g, '\\u003c')}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
<p style="font-family:system-ui,sans-serif;padding:2rem;">Login riuscito — puoi chiudere questa finestra.</p>
</body></html>`;

    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
  } catch (err) {
    return htmlError('Errore imprevisto: ' + String((err && err.message) || err));
  }
};

function htmlError(message) {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:2rem;color:#b00020;">
      <strong>Errore di login</strong><p>${message}</p>
    </body></html>`,
  };
}
