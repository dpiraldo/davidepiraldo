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

    // ---- background images (with optional per-photo focus point, so a
    // vertical or horizontal photo can be framed correctly without ever
    // changing the box size or the page layout) ----
    document.querySelectorAll('[data-cms-bg]').forEach(el => {
      const key = el.getAttribute('data-cms-bg');
      const media = p.media || {};
      const val = getPath(media, key);
      if (!val) return;
      const focus = (getPath(media, key + '_focus') || 'Center').toLowerCase();
      if (el.tagName === 'IMG') {
        el.src = val;
        el.style.objectPosition = focus;
      } else {
        el.style.backgroundImage = `url('${val}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = focus;
      }
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

    // ---- bilingual (now trilingual) content: merge into the i18n object so
    // language switching (EN/FR/IT buttons) keeps working per-property ----
    if (window.i18n && p.i18n) {
      ['en', 'fr', 'it'].forEach(lang => {
        const src = p.i18n[lang];
        if (!src) return;
        // Defensive: if a property/template doesn't define this language at
        // all yet (e.g. IT not translated), start from an empty object
        // instead of throwing — setLang() already falls back to English
        // for any individual missing key.
        window.i18n[lang] = window.i18n[lang] || {};
        if (src.hero_title) window.i18n[lang]['hero.title'] = src.hero_title;
        if (src.p1) window.i18n[lang]['ov.p1'] = src.p1;
        if (src.p2) window.i18n[lang]['ov.p2'] = src.p2;
        if (src.p3) window.i18n[lang]['ov.p3'] = src.p3;
        if (src.quote_text) window.i18n[lang]['quote.text'] = src.quote_text;
        if (src.quote_cite) window.i18n[lang]['quote.cite'] = src.quote_cite;
        if (src.market_insight_title) window.i18n[lang]['market_insight_title'] = src.market_insight_title;
        if (src.market_insight) window.i18n[lang]['market_insight'] = src.market_insight;
        // NOTA: le "Schede Caratteristiche" (p.features) sono gestite più sotto,
        // separatamente e solo in inglese — non fanno parte del sistema EN/FR/IT.
      });
      // Re-render whichever language is currently active so the merged
      // strings actually show up (setLang is defined in the template).
      if (typeof setLang === 'function') setLang(window.lang || 'en');
    }

    function gallerySrc(item) {
      if (!item) return '';
      return typeof item === 'string' ? item : (item.image || item.photo || '');
    }

    // Feature slots 1-4 (always-on cards) — direct text if provided without
    // going through the EN/FR i18n system (used when no FR copy is supplied)
    (p.features || []).forEach((f, i) => {
      const n = i + 1;
      const card = document.querySelector(`[data-feature-slot="${n}"]`);
      if (!card) return;
      if (f.title) card.querySelector('h3').textContent = f.title;
      if (f.desc) card.querySelector('p').textContent = f.desc;
      const cover = card.querySelector('[data-feature-cover]');
      const imageSrc = gallerySrc(f.image);
      if (cover && imageSrc) {
        cover.src = imageSrc;
        cover.alt = f.title || p.building_name || '';
        card.classList.add('has-cover');
      } else if (cover) {
        cover.removeAttribute('src');
        card.classList.remove('has-cover');
      }
    });

    // ---- gallery ----
    const featuredWrap = document.getElementById('galleryFeatured');
    if (featuredWrap) {
      const featured = (p.media && p.media.gallery_featured) || [];
      featuredWrap.innerHTML = featured.length
        ? featured.map(src => `<div class="gallery-featured"><img src="${gallerySrc(src)}" alt="${p.building_name || ''}"></div>`).join('')
        : `<div class="gallery-featured" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:13px;letter-spacing:.05em;">Photographs coming soon</div>`;
    }
    const lockedWrap = document.getElementById('galleryLocked');
    if (lockedWrap) {
      const locked = (p.media && p.media.gallery_locked) || [];
      lockedWrap.innerHTML = locked.map(src => `<img src="${gallerySrc(src)}" alt="">`).join('');
    }

    // ---- market intelligence: 1 or 2 districts ----
    window.__lastPropertyData = p;
    window.__lastDistrictsData = districts;
    renderMarket(p, districts);

    // ---- hero video: only start if "Hero Display" is set to Video AND a
    // real video file is provided. Set it to "Photo only" in the CMS to
    // always show the fallback photo instead, regardless of any video file. ----
    const heroMode = (p.media && p.media.hero_mode) || 'video';
    if (heroMode === 'video' && p.media && p.media.hero_video_1) {
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

  // ---- Market Intelligence translations — the district data itself
  // (content/districts.json) only has _en/_fr descriptive text, so IT falls
  // back to EN for those specific short labels (e.g. "Slight correction").
  // District proper names (Jardin Exotique, La Condamine...) are French
  // place names and stay identical in all 3 languages, same as on any
  // official Monaco document. ----
  const MARKET_LABELS = {
    en: {
      propertyDistrict: 'Property District', neighbourDistrict: 'Neighbouring District',
      perSqm: 'per sqm · 2025', change: 'Change 24/25', resales: 'Resales 2025',
      resaleVolume: 'Resale Volume', newBuild: 'New Build 2020–29',
      leadCompare: (name) => `Official data from the Observatoire de l'Immobilier 2025 — IMSEE, Principality of Monaco. Comparative analysis of the two districts framing ${name}.`,
      leadSingle: `Official data from the Observatoire de l'Immobilier 2025 — IMSEE, Principality of Monaco.`,
      rowPriceSqm: 'Price per sqm (2025)', rowNewBuild: 'New build 2020–2029', rowResalesNum: 'Number of resales',
      rowResaleVolume: 'Resale volume', rowMarketShare: 'Market share', rowSurface: 'Residential surface (k m²)',
      rowBuildings: 'Buildings', colIndicator: 'Indicator', colPrincipality: 'Principality', vs: 'vs',
    },
    fr: {
      propertyDistrict: 'Quartier du Bien', neighbourDistrict: 'Quartier Voisin',
      perSqm: 'prix au m² · 2025', change: 'Variation 24/25', resales: 'Reventes 2025',
      resaleVolume: 'Montant Reventes', newBuild: 'Neuf 2020–2029',
      leadCompare: (name) => `Données officielles de l'Observatoire de l'Immobilier 2025 — IMSEE, Principauté de Monaco. Analyse comparative des deux quartiers encadrant ${name}.`,
      leadSingle: `Données officielles de l'Observatoire de l'Immobilier 2025 — IMSEE, Principauté de Monaco.`,
      rowPriceSqm: 'Prix au m² (2025)', rowNewBuild: 'Neuf 2020–2029', rowResalesNum: 'Nombre de reventes',
      rowResaleVolume: 'Montant des reventes', rowMarketShare: 'Part de marché', rowSurface: 'Surface logements (k m²)',
      rowBuildings: 'Immeubles', colIndicator: 'Indicateur', colPrincipality: 'Principauté', vs: 'vs',
    },
    it: {
      propertyDistrict: 'Quartiere dell\'Immobile', neighbourDistrict: 'Quartiere Limitrofo',
      perSqm: 'al m² · 2025', change: 'Variazione 24/25', resales: 'Rivendite 2025',
      resaleVolume: 'Volume Rivendite', newBuild: 'Nuove Costruzioni 2020–29',
      leadCompare: (name) => `Dati ufficiali dell'Observatoire de l'Immobilier 2025 — IMSEE, Principato di Monaco. Analisi comparativa dei due quartieri che circondano ${name}.`,
      leadSingle: `Dati ufficiali dell'Observatoire de l'Immobilier 2025 — IMSEE, Principato di Monaco.`,
      rowPriceSqm: 'Prezzo al m² (2025)', rowNewBuild: 'Nuove costruzioni 2020–2029', rowResalesNum: 'Numero di rivendite',
      rowResaleVolume: 'Volume rivendite', rowMarketShare: 'Quota di mercato', rowSurface: 'Superficie residenziale (k m²)',
      rowBuildings: 'Edifici', colIndicator: 'Indicatore', colPrincipality: 'Principato', vs: 'vs',
    },
  };

  function districtCard(d, tagKey, tagLabel, lang) {
    if (!d) return '';
    const changeClass = (d.change_24_25_pct || 0) < 0 ? 'down' : 'up';
    const changeLabel = d[`change_label_${lang}`] || d.change_label_en || '';
    const resaleNote = d[`resale_volume_note_${lang}`] || d.resale_volume_note_en || '';
    const L = MARKET_LABELS[lang] || MARKET_LABELS.en;
    return `
      <div class="market-card ${tagKey === 'featured' ? 'featured' : ''}">
        <div class="mc-tag">${tagLabel}</div>
        <div class="mc-name">${d.name_en}</div>
        <div class="mc-price">${d.price_sqm_2025 ? '€' + d.price_sqm_2025.toLocaleString('en-US') : '—'}</div>
        <div class="mc-unit">${L.perSqm}</div>
        <div class="mc-stats">
          <div class="mc-stat"><div class="ms-l">${L.change}</div><div class="ms-v">${d.change_24_25_pct !== null ? fmtPct(d.change_24_25_pct) : '—'}</div><div class="ms-c ${changeClass}">${changeLabel}</div></div>
          <div class="mc-stat"><div class="ms-l">${L.resales}</div><div class="ms-v">${d.resales_2025 ?? '—'}</div><div class="ms-c up">${d.resales_change_pct ? fmtPct(d.resales_change_pct) : ''}</div></div>
          <div class="mc-stat"><div class="ms-l">${L.resaleVolume}</div><div class="ms-v">${d.resale_volume_2025 || '—'}</div><div class="ms-c up">${d.resale_volume_change_pct ? fmtPct(d.resale_volume_change_pct) + (resaleNote ? ' · ' + resaleNote : '') : resaleNote}</div></div>
          <div class="mc-stat"><div class="ms-l">${L.newBuild}</div><div class="ms-v">${d.new_build_2020_29 || '—'}</div><div class="ms-c up">${d.new_build_change_pct ? fmtPct(d.new_build_change_pct) : ''}</div></div>
        </div>
      </div>`;
  }

  function renderMarket(p, districts) {
    const lang = window.lang || 'en';
    const L = MARKET_LABELS[lang] || MARKET_LABELS.en;
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
        districtCard(looked[0].d, 'featured', L.propertyDistrict, lang) +
        districtCard(looked[1].d, 'neighbour', L.neighbourDistrict, lang);
      if (titleEl) titleEl.innerHTML = `${looked[0].d.name_en} <em>${L.vs}</em> ${looked[1].d.name_en}`;
      if (leadEl) leadEl.textContent = L.leadCompare(p.building_name || 'this property');
      if (tableEl) tableEl.innerHTML = marketTableHTML([looked[0].d, looked[1].d], principality, [looked[0].d.name_en, looked[1].d.name_en], lang);
    } else if (looked.length === 1) {
      // single district, the common case
      cardsWrap.innerHTML = districtCard(looked[0].d, 'featured', L.propertyDistrict, lang);
      if (titleEl) titleEl.innerHTML = looked[0].d.name_en;
      if (leadEl) leadEl.textContent = L.leadSingle;
      if (tableEl) tableEl.innerHTML = marketTableHTML([looked[0].d], principality, [looked[0].d.name_en], lang);
    }
  }

  function marketTableHTML(districtList, principality, names, lang) {
    const L = MARKET_LABELS[lang] || MARKET_LABELS.en;
    const rows = [
      [L.rowPriceSqm, d => d.price_sqm_2025 ? '€' + d.price_sqm_2025.toLocaleString('en-US') : '—'],
      [L.rowNewBuild, d => d.new_build_2020_29 || '—'],
      [L.rowResalesNum, d => d.resales_2025 ?? '—'],
      [L.rowResaleVolume, d => d.resale_volume_2025 || '—'],
      [L.rowMarketShare, d => d.market_share_pct ? d.market_share_pct + '%' : '—'],
      [L.rowSurface, d => d.residential_surface_k_sqm ?? '—'],
      [L.rowBuildings, d => d.buildings ?? '—'],
    ];
    const head = `<thead><tr><th>${L.colIndicator}</th>${names.map(n => `<th>${n}</th>`).join('')}<th>${L.colPrincipality}</th></tr></thead>`;
    const body = rows.map(([label, fn], i) => {
      const cells = districtList.map(d => `<td>${fn(d)}</td>`).join('');
      const pCell = `<td>${fn(principality)}</td>`;
      return `<tr class="${i===0?'hl':''}"><td>${label}</td>${cells}${pCell}</tr>`;
    }).join('');
    return head + `<tbody>${body}</tbody>`;
  }

  // Exposed so the language-switch buttons (setLang, in property-template.html)
  // can re-render this section in the newly selected language — otherwise it
  // would stay frozen in whatever language was active on first page load.
  window.__rerenderMarket = function () {
    if (window.__lastPropertyData && window.__lastDistrictsData) {
      renderMarket(window.__lastPropertyData, window.__lastDistrictsData);
    }
  };
})();
