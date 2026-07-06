/*
  property-loader.js
  ------------------
  Powers every property page generated from property-template.html.
  Reads ?slug=xxx from the URL, fetches content/properties/xxx.json,
  cross-references content/districts.json for the market intelligence
  section, and fills in every [data-cms] / [data-cms-bg] / [data-amenity]
  element already present in the template.

  If a property has no video yet, hero_video_1 is simply empty/missing —
  the static fallback photo stays visible and nothing breaks.
*/

(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || 'eden-tower';

  Promise.all([
    fetch(`content/properties/${slug}.json`).then(r => r.json()),
    fetch('content/districts.json').then(r => r.json())
  ]).then(([property, districts]) => {
    applyProperty(property, districts);
  }).catch(err => {
    console.warn('Property data not reachable — showing static template content.', err);
  });

  function fmtPct(n, digits = 1) {
    if (n === null || n === undefined) return '';
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(digits)}%`;
  }

  function applyProperty(p, districts) {
    // ---- simple text fields ----
    document.querySelectorAll('[data-cms]').forEach(el => {
      const key = el.getAttribute('data-cms');
      const val = getPath(p, key);
      if (val !== undefined && val !== null && val !== '') el.textContent = val;
    });

    // ---- background images ----
    document.querySelectorAll('[data-cms-bg]').forEach(el => {
      const key = el.getAttribute('data-cms-bg');
      const val = getPath(p.media || {}, key);
      if (!val) return;
      if (el.tagName === 'IMG') el.src = val;
      else { el.style.backgroundImage = `url('${val}')`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; }
    });

    // poster attribute on <video> tags
    document.querySelectorAll('[data-cms-poster]').forEach(el => {
      const key = el.getAttribute('data-cms-poster');
      const val = getPath(p.media || {}, key);
      if (val) el.setAttribute('poster', val);
    });

    // ---- page title ----
    if (p.building_name) {
      document.title = `${p.building_name} — Davide Piraldo`;
    }

    // ---- amenities: show/hide any element with data-amenity="key" ----
    const amenities = p.amenities || {};
    document.querySelectorAll('[data-amenity]').forEach(el => {
      const key = el.getAttribute('data-amenity');
      el.style.display = amenities[key] ? '' : 'none';
    });

    // ---- bilingual content: merge into the i18n object so language
    // switching (EN/FR buttons) keeps working per-property ----
    if (window.i18n && p.i18n) {
      ['en', 'fr'].forEach(lang => {
        const src = p.i18n[lang];
        if (!src) return;
        if (src.hero_title) window.i18n[lang]['hero.title'] = src.hero_title;
        if (src.p1) window.i18n[lang]['ov.p1'] = src.p1;
        if (src.p2) window.i18n[lang]['ov.p2'] = src.p2;
        if (src.p3) window.i18n[lang]['ov.p3'] = src.p3;
        if (src.quote_text) window.i18n[lang]['quote.text'] = src.quote_text;
        if (src.quote_cite) window.i18n[lang]['quote.cite'] = src.quote_cite;
        (src.features || []).forEach((f, i) => {
          window.i18n[lang][`feat.f${i+1}t`] = f.title;
          window.i18n[lang][`feat.f${i+1}d`] = f.desc;
        });
      });
      // Re-render whichever language is currently active so the merged
      // strings actually show up (setLang is defined in the template).
      if (typeof setLang === 'function') setLang(window.lang || 'en');
    }

    // Feature slots 1-4 (always-on cards) — direct text if provided without
    // going through the EN/FR i18n system (used when no FR copy is supplied)
    (p.features || []).forEach((f, i) => {
      const n = i + 1;
      const card = document.querySelector(`[data-feature-slot="${n}"]`);
      if (!card) return;
      if (f.title) card.querySelector('h3').textContent = f.title;
      if (f.desc) card.querySelector('p').textContent = f.desc;
    });

    // ---- gallery ----
    const featuredWrap = document.getElementById('galleryFeatured');
    if (featuredWrap && p.media && p.media.gallery_featured) {
      featuredWrap.innerHTML = p.media.gallery_featured.map(src =>
        `<div class="gallery-featured"><img src="${src}" alt="${p.building_name || ''}"></div>`
      ).join('');
    }
    const lockedWrap = document.getElementById('galleryLocked');
    if (lockedWrap && p.media && p.media.gallery_locked) {
      lockedWrap.innerHTML = p.media.gallery_locked.map(src =>
        `<img src="${src}" alt="">`
      ).join('');
    }

    // ---- market intelligence: 1 or 2 districts ----
    renderMarket(p, districts);

    // ---- hero video: only start if a real video file is provided ----
    if (p.media && p.media.hero_video_1) {
      window.__PROPERTY_VIDEO_1__ = p.media.hero_video_1;
      window.__PROPERTY_VIDEO_2__ = p.media.hero_video_2 || '';
      if (typeof window.initHeroVideos === 'function') window.initHeroVideos();
    }

    // ---- contact mailto ----
    const cta = document.getElementById('contactCta');
    if (cta && p.contact_email) cta.href = `mailto:${p.contact_email}`;
  }

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  function districtCard(d, tagKey, tagLabel) {
    if (!d) return '';
    const changeClass = (d.change_24_25_pct || 0) < 0 ? 'down' : 'up';
    return `
      <div class="market-card ${tagKey === 'featured' ? 'featured' : ''}">
        <div class="mc-tag">${tagLabel}</div>
        <div class="mc-name">${d.name_en}</div>
        <div class="mc-price">${d.price_sqm_2025 ? '€' + d.price_sqm_2025.toLocaleString('en-US') : '—'}</div>
        <div class="mc-unit">per sqm · 2025</div>
        <div class="mc-stats">
          <div class="mc-stat"><div class="ms-l">Change 24/25</div><div class="ms-v">${d.change_24_25_pct !== null ? fmtPct(d.change_24_25_pct) : '—'}</div><div class="ms-c ${changeClass}">${d.change_label_en || ''}</div></div>
          <div class="mc-stat"><div class="ms-l">Resales 2025</div><div class="ms-v">${d.resales_2025 ?? '—'}</div><div class="ms-c up">${d.resales_change_pct ? fmtPct(d.resales_change_pct) : ''}</div></div>
          <div class="mc-stat"><div class="ms-l">Resale Volume</div><div class="ms-v">${d.resale_volume_2025 || '—'}</div><div class="ms-c up">${d.resale_volume_change_pct ? fmtPct(d.resale_volume_change_pct) + (d.resale_volume_note_en ? ' · ' + d.resale_volume_note_en : '') : (d.resale_volume_note_en || '')}</div></div>
          <div class="mc-stat"><div class="ms-l">New Build 2020–29</div><div class="ms-v">${d.new_build_2020_29 || '—'}</div><div class="ms-c up">${d.new_build_change_pct ? fmtPct(d.new_build_change_pct) : ''}</div></div>
        </div>
      </div>`;
  }

  function renderMarket(p, districts) {
    const refs = p.districts || [];
    const looked = refs.map(r => ({ ref: r, d: districts[r.key] })).filter(x => x.d);
    const principality = districts['principality'];

    const cardsWrap = document.getElementById('marketCards');
    const titleEl = document.getElementById('marketTitle');
    const leadEl = document.getElementById('marketLead');
    const tableEl = document.getElementById('marketTable');

    if (!cardsWrap) return;

    if (looked.length === 2) {
      // dual-district comparison, e.g. Eden Tower
      cardsWrap.innerHTML =
        districtCard(looked[0].d, 'featured', 'Property District') +
        districtCard(looked[1].d, 'neighbour', 'Neighbouring District');
      if (titleEl) titleEl.innerHTML = `${looked[0].d.name_en} <em>vs</em> ${looked[1].d.name_en}`;
      if (leadEl) leadEl.textContent = `Official data from the Observatoire de l'Immobilier 2025 — IMSEE, Principality of Monaco. Comparative analysis of the two districts framing ${p.building_name || 'this property'}.`;
      if (tableEl) tableEl.innerHTML = marketTableHTML([looked[0].d, looked[1].d], principality, [looked[0].d.name_en, looked[1].d.name_en]);
    } else if (looked.length === 1) {
      // single district, the common case
      cardsWrap.innerHTML = districtCard(looked[0].d, 'featured', 'Property District');
      if (titleEl) titleEl.innerHTML = looked[0].d.name_en;
      if (leadEl) leadEl.textContent = `Official data from the Observatoire de l'Immobilier 2025 — IMSEE, Principality of Monaco.`;
      if (tableEl) tableEl.innerHTML = marketTableHTML([looked[0].d], principality, [looked[0].d.name_en]);
    }
  }

  function marketTableHTML(districtList, principality, names) {
    const rows = [
      ['Price per sqm (2025)', d => d.price_sqm_2025 ? '€' + d.price_sqm_2025.toLocaleString('en-US') : '—'],
      ['New build 2020–2029', d => d.new_build_2020_29 || '—'],
      ['Number of resales', d => d.resales_2025 ?? '—'],
      ['Resale volume', d => d.resale_volume_2025 || '—'],
      ['Market share', d => d.market_share_pct ? d.market_share_pct + '%' : '—'],
      ['Residential surface (k m²)', d => d.residential_surface_k_sqm ?? '—'],
      ['Buildings', d => d.buildings ?? '—'],
    ];
    const head = `<thead><tr><th>Indicator</th>${names.map(n => `<th>${n}</th>`).join('')}<th>Principality</th></tr></thead>`;
    const body = rows.map(([label, fn], i) => {
      const cells = districtList.map(d => `<td>${fn(d)}</td>`).join('');
      const pCell = `<td>${fn(principality)}</td>`;
      return `<tr class="${i===0?'hl':''}"><td>${label}</td>${cells}${pCell}</tr>`;
    }).join('');
    return head + `<tbody>${body}</tbody>`;
  }
})();
