/*
  home-loader.js — fills index.html from content/homepage.json
*/
(function () {
  fetch('content/homepage.json')
    .then(r => r.json())
    .then(apply)
    .catch(err => console.warn('Homepage CMS data unavailable', err));

  function apply(h) {
    setText('[data-home="hero.eyebrow"]', h.hero?.eyebrow);
    setText('[data-home="hero.title"]', h.hero?.title);
    setText('[data-home="hero.role"]', h.hero?.role);
    setText('[data-home="hero.affiliation"]', h.hero?.affiliation);
    setText('[data-home="hero.scroll_label"]', h.hero?.scroll_label);
    setBg('[data-home-bg="hero.hero_image"]', h.hero?.hero_image);

    setText('[data-home="positioning.label"]', h.positioning?.label);
    setText('[data-home="positioning.statement"]', h.positioning?.statement);
    (h.positioning?.pillars || []).forEach((p, i) => {
      setText(`[data-home="positioning.pillars.${i}.title"]`, p.title);
      setText(`[data-home="positioning.pillars.${i}.text"]`, p.text);
    });

    setText('[data-home="market.label"]', h.market?.label);
    setText('[data-home="market.source"]', h.market?.source);
    (h.market?.stats || []).forEach((s, i) => {
      setText(`[data-home="market.stats.${i}.value"]`, s.value);
      setText(`[data-home="market.stats.${i}.label"]`, s.label);
      const cell = document.querySelector(`[data-home="market.stats.${i}.value"]`);
      if (cell && s.highlight) cell.style.color = 'var(--gold)';
    });

    setText('[data-home="journal.label"]', h.journal?.label);
    setText('[data-home="journal.heading"]', h.journal?.heading);

    setText('[data-home="contact.label"]', h.contact?.label);
    setText('[data-home="contact.heading"]', h.contact?.heading);
    setText('[data-home="contact.text"]', h.contact?.text);
    const email = h.contact?.email;
    if (email) {
      document.querySelectorAll('[data-home="contact.email"]').forEach(a => {
        a.href = 'mailto:' + email;
        if (!a.dataset.keepLabel) a.textContent = 'Send an Email';
      });
    }
    const ig = h.contact?.instagram_url;
    if (ig) {
      document.querySelectorAll('[data-home="contact.instagram"]').forEach(a => {
        a.href = ig;
        if (h.contact?.instagram_label) a.textContent = h.contact.instagram_label;
      });
    }

    setText('[data-home="footer.name"]', h.footer?.name);
    setText('[data-home="footer.role"]', h.footer?.role);

    if (h.featured_property_slugs?.length) {
      window.FEATURED_SLUGS = h.featured_property_slugs.map(x => typeof x === 'string' ? x : x.slug).filter(Boolean);
      if (typeof window.loadFeaturedProperty === 'function') window.loadFeaturedProperty();
    }

    if (h.journal?.featured_slugs?.length && window.renderJournalTeaser) {
      const slugs = h.journal.featured_slugs.map(x => typeof x === 'string' ? x : x.slug).filter(Boolean);
      window.renderJournalTeaser(slugs);
    }
  }

  function setText(sel, val) {
    if (val === undefined || val === null || val === '') return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  }

  function setBg(sel, url) {
    if (!url) return;
    document.querySelectorAll(sel).forEach(el => {
      el.style.backgroundImage = `url('${url}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      if (el.classList.contains('img-placeholder')) el.textContent = '';
    });
  }
})();
