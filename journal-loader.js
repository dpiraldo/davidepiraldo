/*
  journal-loader.js — builds article cards on blog-index.html and homepage teaser
*/
(function () {
  window.renderJournalTeaser = function (slugs) {
    const grid = document.getElementById('journal-grid');
    if (!grid || !slugs?.length) return;
    loadArticles(slugs).then(items => {
      grid.innerHTML = items.map(cardTeaser).join('');
    });
  };

  window.renderJournalIndex = function () {
    const grid = document.getElementById('journal-grid');
    if (!grid) return;
    fetch('content/articles-order.json')
      .then(r => r.json())
      .then(data => {
        const order = (data.order || []).map(x => typeof x === 'string' ? x : x.slug).filter(Boolean);
        return loadArticles(order);
      })
      .then(items => { grid.innerHTML = items.map(cardFull).join(''); })
      .catch(err => console.warn('Journal index unavailable', err));
  };

  function loadArticles(slugs) {
    return Promise.all(
      slugs.map(slug =>
        fetch(`content/articles/${slug}.json`)
          .then(r => r.json())
          .then(a => ({ ...a, slug }))
          .catch(() => null)
      )
    ).then(list => list.filter(a => a && a.published !== false));
  }

  function cardTeaser(a) {
    const t = (a.i18n && a.i18n.en) || a; // fallback for any non-migrated data
    return `<a class="jcard" href="article-template.html?slug=${a.slug}">
      <div class="cat">${esc(a.category)}</div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.excerpt)}</p>
      <div class="readmore">Read →</div>
    </a>`;
  }

  function cardFull(a) {
    const t = (a.i18n && a.i18n.en) || a; // fallback for any non-migrated data
    const thumb = a.hero_image
      ? `<img src="${esc(a.hero_image)}" alt="" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="img-placeholder">${esc(a.category || 'Article')}</div>`;
    return `<a class="card" href="article-template.html?slug=${a.slug}">
      <div class="thumb">${thumb}</div>
      <div class="body">
        <div class="cat">${esc(a.category)}</div>
        <h2>${esc(t.title)}</h2>
        <p>${esc(t.excerpt)}</p>
        <div class="meta"><span>${esc(a.category)}</span><span>·</span><span>${esc(a.read_time || '')}</span></div>
        <div class="readmore">Read →</div>
      </div>
    </a>`;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  }

  if (document.getElementById('journal-grid')?.dataset.mode === 'index') {
    window.renderJournalIndex();
  }
})();
