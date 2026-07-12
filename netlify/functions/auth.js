// netlify/functions/auth.js
//
// Primo passo del login GitHub per il CMS (sostituisce Netlify Identity +
// Git Gateway, ormai deprecati da Netlify per i siti nuovi). Reindirizza
// l'utente alla pagina di autorizzazione di GitHub.
//
// SETUP RICHIESTO — vedi SETUP-CMS.md, sezione "Login del CMS (GitHub OAuth)".

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      body: 'GITHUB_OAUTH_CLIENT_ID non configurata su Netlify (Site settings → Environment variables).',
    };
  }

  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/.netlify/functions/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
    },
    body: '',
  };
};
