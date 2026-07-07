/*
  article-loader.js — powers article-template.html from content/articles/<slug>.json
*/
(function () {
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) return;

  fetch(`content/articles/${slug}.json`)
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(apply)
    .catch(() => {
      document.body.insertAdjacentHTML('afterbegin',
        '<p style="padding:2rem;color:#c9a86a;">Article not found. <a href="blog-index.html">Back to Journal</a></p>');
    });

  function apply(a) {
    document.title = `${a.title} — The Monaco Journal`;
    setText('[data-article="category"]', a.category);
    setText('[data-article="title"]', a.title);
    setText('[data-article="date"]', a.date);
    setText('[data-article="read_time"]', a.read_time);
    setText('[data-article="sources"]', a.sources);
    setText('[data-article="disclaimer"]', a.disclaimer);
    setText('[data-article="featured_property_text"]', a.featured_property_text);

    const hero = document.getElementById('article-hero');
    if (hero && a.hero_image) {
      hero.innerHTML = `<img src="${a.hero_image}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const body = document.getElementById('article-body');
    if (body && a.body_html) body.innerHTML = a.body_html;

    const fp = document.getElementById('featured-property-link');
    if (fp) fp.style.display = a.featured_property_text ? '' : 'none';
  }

  function setText(sel, val) {
    if (val === undefined || val === null || val === '') return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  }
})();
