/*
  article-loader.js — powers article-template.html from content/articles/<slug>.json

  Ora supporta EN/FR/IT: legge da a.i18n[lang] e mostra un selettore di
  lingua nella nav se più di una lingua ha contenuto compilato. Se un
  articolo non è ancora stato tradotto (i18n.fr / i18n.it vuoti), il
  selettore mostra solo le lingue effettivamente disponibili.
*/
(function () {
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) return;

  let article = null;
  let currentLang = 'en';

  fetch(`content/articles/${slug}.json`)
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(a => {
      article = a;
      renderLangSwitch();
      applyLang('en');
    })
    .catch(() => {
      document.body.insertAdjacentHTML('afterbegin',
        '<p style="padding:2rem;color:#c9a86a;">Article not found. <a href="blog-index.html">Back to Journal</a></p>');
    });

  function getI18n(lang) {
    if (article.i18n && article.i18n[lang]) return article.i18n[lang];
    // Compatibilità con eventuali articoli non ancora migrati alla nuova struttura.
    if (lang === 'en') {
      return {
        title: article.title,
        excerpt: article.excerpt,
        body_html: article.body_html,
        disclaimer: article.disclaimer,
      };
    }
    return {};
  }

  function availableLangs() {
    const all = ['en', 'fr', 'it'];
    if (!article.i18n) return ['en'];
    return all.filter(l => {
      const t = article.i18n[l];
      return t && Object.keys(t).some(k => t[k]);
    });
  }

  function renderLangSwitch() {
    const nav = document.querySelector('.nav > div');
    const langs = availableLangs();
    if (!nav || langs.length <= 1) return;

    const labels = { en: 'EN', fr: 'FR', it: 'IT' };
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:6px;margin-left:24px;';
    wrap.innerHTML = langs.map(l =>
      `<button type="button" data-lang-btn="${l}" style="font-size:10px;letter-spacing:.1em;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--stone);cursor:pointer;font-family:inherit;">${labels[l] || l.toUpperCase()}</button>`
    ).join('');
    nav.appendChild(wrap);
    wrap.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-btn')));
    });
  }

  function updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const active = btn.getAttribute('data-lang-btn') === currentLang;
      btn.style.borderColor = active ? 'var(--gold)' : 'var(--line)';
      btn.style.color = active ? 'var(--gold)' : 'var(--stone)';
    });
  }

  function applyLang(lang) {
    if (!article) return;
    currentLang = lang;
    const t = getI18n(lang);
    const fallback = getI18n('en');

    document.documentElement.lang = lang;
    document.title = `${t.title || fallback.title || ''} — The Monaco Journal`;

    setText('[data-article="category"]', article.category);
    setText('[data-article="title"]', t.title || fallback.title);
    setText('[data-article="date"]', article.date);
    setText('[data-article="read_time"]', article.read_time);
    setText('[data-article="sources"]', article.sources);
    setText('[data-article="disclaimer"]', t.disclaimer || fallback.disclaimer);
    setText('[data-article="featured_property_text"]', article.featured_property_text);

    const hero = document.getElementById('article-hero');
    if (hero && article.hero_image) {
      hero.innerHTML = `<img src="${article.hero_image}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const body = document.getElementById('article-body');
    const bodyHtml = t.body_html || fallback.body_html;
    if (body && bodyHtml) body.innerHTML = bodyHtml;

    const fp = document.getElementById('featured-property-link');
    if (fp) fp.style.display = article.featured_property_text ? '' : 'none';

    updateLangButtons();
  }

  function setText(sel, val) {
    if (val === undefined || val === null || val === '') return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  }
})();
