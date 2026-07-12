/*
  admin/preview-templates.js
  ---------------------------
  Aggiunge un'anteprima visiva (pannello destro del CMS) mentre modifichi un
  Immobile o un Articolo — non è pixel-perfect rispetto al sito vero (che ha
  un design molto più ricco), ma mostra subito foto, titolo, testi e schede
  così puoi vedere cosa stai scrivendo senza dover pubblicare e aprire la
  pagina reale per controllare.
*/
(function () {
  if (typeof CMS === 'undefined' || typeof createClass === 'undefined' || typeof h === 'undefined') {
    console.error('preview-templates.js: CMS/createClass/h non disponibili.');
    return;
  }

  function toPlain(v, fallback) {
    if (v === undefined || v === null) return fallback;
    if (typeof v.toJS === 'function') return v.toJS();
    return v;
  }

  function fieldGetter(data) {
    return function (path, fallback) {
      var v = data.getIn(path.split('.'));
      return toPlain(v, fallback !== undefined ? fallback : '');
    };
  }

  var PALETTE = {
    bg: '#15110d',
    card: '#1d1811',
    line: '#332a20',
    ivory: '#f2ede2',
    stone: '#a89a85',
    gold: '#c9a86a',
  };

  // ---- PROPERTIES ----
  var PropertyPreview = createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var getAsset = this.props.getAsset;
      var g = fieldGetter(data);

      var heroField = g('media.hero_fallback_image');
      var heroUrl = heroField ? getAsset(heroField).toString() : '';
      var i18nEn = g('i18n.en', {});
      var features = g('features', []);
      var amenities = g('amenities', {});
      var districts = g('districts', []);

      var amenityLabels = {
        concierge: 'Concierge', chambre_bonne: 'Chambre de Bonne',
        mixed_use: 'Uso Misto', pool: 'Piscina', gym: 'Palestra',
      };
      var activeAmenities = Object.keys(amenityLabels).filter(function (k) { return amenities[k]; });

      return h(
        'div',
        { style: { fontFamily: 'Georgia, serif', background: PALETTE.bg, color: PALETTE.ivory, minHeight: '100vh' } },
        heroUrl
          ? h('div', { style: { height: '360px', backgroundImage: 'url(' + heroUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center' } })
          : h('div', { style: { height: '200px', background: PALETTE.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PALETTE.stone, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase' } }, 'Nessuna foto Hero caricata'),
        h(
          'div',
          { style: { padding: '32px 44px' } },
          h('div', { style: { fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: PALETTE.gold } }, g('status_label', 'In Vendita')),
          h('h1', { style: { fontSize: '32px', fontWeight: 500, margin: '14px 0 6px', lineHeight: 1.2 } }, g('building_name', '(nome edificio mancante)')),
          h('div', { style: { fontSize: '13px', color: PALETTE.stone, marginBottom: '20px' } }, g('address_line', '')),
          h(
            'div',
            { style: { display: 'flex', gap: '24px', fontSize: '13px', color: PALETTE.ivory, marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid ' + PALETTE.line } },
            h('span', null, g('rooms', '–') + ' Locali'),
            h('span', null, g('bedrooms', '–') + ' Camere'),
            h('span', null, g('bathrooms', '–') + ' Bagni'),
            g('views_label') && h('span', null, g('views_label'))
          ),
          i18nEn.hero_title && h('div', { style: { fontSize: '24px', margin: '0 0 16px', lineHeight: 1.3 }, dangerouslySetInnerHTML: { __html: i18nEn.hero_title } }),
          i18nEn.p1 && h('p', { style: { fontSize: '14px', lineHeight: 1.75, color: '#d8d0c2', marginBottom: '14px' } }, i18nEn.p1),
          i18nEn.p2 && h('p', { style: { fontSize: '14px', lineHeight: 1.75, color: '#d8d0c2', marginBottom: '14px' } }, i18nEn.p2),
          i18nEn.p3 && h('p', { style: { fontSize: '14px', lineHeight: 1.75, color: '#d8d0c2', marginBottom: '14px' } }, i18nEn.p3),

          features.length > 0 &&
            h(
              'div',
              { style: { marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: PALETTE.line } },
              features.map(function (f, i) {
                var featureImg = f.image ? getAsset(f.image).toString() : '';
                return h(
                  'div',
                  { key: i, style: { background: PALETTE.card, padding: '16px' } },
                  featureImg && h('div', { style: { height: '100px', marginBottom: '10px', backgroundImage: 'url(' + featureImg + ')', backgroundSize: 'cover', backgroundPosition: 'center' } }),
                  h('div', { style: { fontWeight: 'bold', fontSize: '13px', color: PALETTE.ivory, marginBottom: '6px' } }, f.title || '(titolo scheda mancante)'),
                  h('div', { style: { fontSize: '12px', color: PALETTE.stone, lineHeight: 1.5 } }, f.desc || '')
                );
              })
            ),

          activeAmenities.length > 0 &&
            h(
              'div',
              { style: { marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
              activeAmenities.map(function (k) {
                return h('span', { key: k, style: { fontSize: '11px', border: '1px solid ' + PALETTE.line, borderRadius: '999px', padding: '5px 12px', color: PALETTE.stone } }, amenityLabels[k]);
              })
            ),

          districts.length > 0 &&
            h(
              'div',
              { style: { marginTop: '28px', paddingTop: '20px', borderTop: '1px solid ' + PALETTE.line, fontSize: '12px', color: PALETTE.stone } },
              '📊 Market Intelligence userà: ' + districts.map(function (d) { return d.key; }).filter(Boolean).join(' vs ')
            ),

          i18nEn.market_insight_title &&
            h(
              'div',
              { style: { marginTop: '20px' } },
              h('div', { style: { fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' } }, i18nEn.market_insight_title),
              h('div', { style: { fontSize: '13px', color: PALETTE.stone, lineHeight: 1.6 } }, i18nEn.market_insight || '')
            )
        )
      );
    },
  });

  // ---- ARTICLES ----
  var ArticlePreview = createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var getAsset = this.props.getAsset;
      var g = fieldGetter(data);

      var heroField = g('hero_image');
      var heroUrl = heroField ? getAsset(heroField).toString() : '';
      var i18nEn = g('i18n.en', {});

      return h(
        'div',
        { style: { fontFamily: 'Georgia, serif', background: PALETTE.bg, color: PALETTE.ivory, minHeight: '100vh' } },
        heroUrl
          ? h('div', { style: { height: '260px', backgroundImage: 'url(' + heroUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center' } })
          : h('div', { style: { height: '140px', background: PALETTE.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PALETTE.stone, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase' } }, 'Nessuna foto di copertina'),
        h(
          'div',
          { style: { padding: '36px 48px', maxWidth: '720px', margin: '0 auto' } },
          h('div', { style: { fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: PALETTE.gold } }, g('category', '')),
          h('h1', { style: { fontSize: '32px', fontWeight: 500, margin: '14px 0 10px', lineHeight: 1.2 } }, i18nEn.title || '(titolo mancante — compilalo nella tab 🇬🇧 English)'),
          h('div', { style: { fontSize: '12px', color: PALETTE.stone, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '.05em' } }, [g('date', ''), g('read_time', '')].filter(Boolean).join(' · ')),
          i18nEn.excerpt && h('p', { style: { fontSize: '18px', color: '#d8d0c2', lineHeight: 1.6, marginBottom: '28px', fontStyle: 'italic' } }, i18nEn.excerpt),
          i18nEn.body_html
            ? h('div', { style: { fontSize: '15px', lineHeight: 1.85, color: '#d8d0c2' }, dangerouslySetInnerHTML: { __html: i18nEn.body_html } })
            : h('div', { style: { fontSize: '13px', color: PALETTE.stone } }, '(testo articolo mancante — compilalo nella tab 🇬🇧 English)'),
          i18nEn.disclaimer &&
            h('div', { style: { marginTop: '32px', paddingTop: '16px', borderTop: '1px solid ' + PALETTE.line, fontSize: '11px', color: PALETTE.stone, lineHeight: 1.6 } }, i18nEn.disclaimer)
        )
      );
    },
  });

  // ---- HOMEPAGE ----
  var HomepagePreview = createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var getAsset = this.props.getAsset;
      var g = fieldGetter(data);

      var heroField = g('hero.hero_image');
      var heroUrl = heroField ? getAsset(heroField).toString() : '';
      var pillars = g('positioning.pillars', []);
      var stats = g('market.stats', []);

      return h(
        'div',
        { style: { fontFamily: 'Georgia, serif', background: PALETTE.bg, color: PALETTE.ivory, minHeight: '100vh' } },
        heroUrl
          ? h('div', { style: { height: '320px', backgroundImage: 'url(' + heroUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center' } })
          : h('div', { style: { height: '180px', background: PALETTE.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PALETTE.stone, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase' } }, 'Nessuna foto Hero caricata'),
        h(
          'div',
          { style: { padding: '32px 44px' } },
          h('div', { style: { fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: PALETTE.gold } }, g('hero.eyebrow', '')),
          h('h1', { style: { fontSize: '32px', fontWeight: 500, margin: '12px 0 4px' } }, g('hero.title', '(nome mancante)')),
          h('div', { style: { fontSize: '13px', color: PALETTE.stone, marginBottom: '28px' } }, [g('hero.role'), g('hero.affiliation')].filter(Boolean).join(' · ')),

          g('positioning.statement') &&
            h('p', { style: { fontSize: '16px', lineHeight: 1.7, color: '#d8d0c2', marginBottom: '20px', fontStyle: 'italic' } }, g('positioning.statement')),

          pillars.length > 0 &&
            h(
              'div',
              { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: PALETTE.line, marginBottom: '28px' } },
              pillars.map(function (p, i) {
                return h(
                  'div',
                  { key: i, style: { background: PALETTE.card, padding: '14px' } },
                  h('div', { style: { fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' } }, p.title || ''),
                  h('div', { style: { fontSize: '12px', color: PALETTE.stone, lineHeight: 1.5 } }, p.text || '')
                );
              })
            ),

          stats.length > 0 &&
            h(
              'div',
              { style: { display: 'flex', gap: '1px', background: PALETTE.line, marginBottom: '28px' } },
              stats.map(function (s, i) {
                return h(
                  'div',
                  { key: i, style: { flex: 1, background: PALETTE.card, padding: '14px', textAlign: 'center' } },
                  h('div', { style: { fontSize: '22px', color: s.highlight ? PALETTE.gold : PALETTE.ivory } }, s.value || '—'),
                  h('div', { style: { fontSize: '10px', color: PALETTE.stone, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.05em' } }, s.label || '')
                );
              })
            ),

          h(
            'div',
            { style: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid ' + PALETTE.line } },
            h('div', { style: { fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' } }, g('contact.heading', '')),
            h('div', { style: { fontSize: '13px', color: PALETTE.stone } }, g('contact.text', '')),
            h('div', { style: { fontSize: '12px', color: PALETTE.gold, marginTop: '10px' } }, g('contact.email', ''))
          ),

          h('div', { style: { marginTop: '20px', fontSize: '11px', color: PALETTE.stone } }, '🏠 Proprietà in evidenza: ' + (
              g('featured_property_slugs', []).map(function (x) { return typeof x === 'string' ? x : x.slug; }).filter(Boolean).join(', ') || '(nessuna)'
            ))
        )
      );
    },
  });

  // ---- SOLD PROPERTIES ----
  var SoldPropertiesPreview = createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var g = fieldGetter(data);
      var getAsset = this.props.getAsset;
      var properties = g('properties', []);

      return h(
        'div',
        { style: { fontFamily: 'Georgia, serif', background: PALETTE.bg, color: PALETTE.ivory, minHeight: '100vh', padding: '32px 44px' } },
        h('div', { style: { fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: PALETTE.gold, marginBottom: '20px' } }, 'Track Record — Sold Properties'),
        properties.length === 0
          ? h('div', { style: { color: PALETTE.stone, fontSize: '13px' } }, 'Nessun immobile venduto ancora aggiunto.')
          : h(
              'div',
              { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: PALETTE.line } },
              properties.map(function (prop, i) {
                var photoUrl = prop.photo ? getAsset(prop.photo).toString() : '';
                return h(
                  'div',
                  { key: i, style: { background: PALETTE.card } },
                  photoUrl
                    ? h('div', { style: { height: '160px', backgroundImage: 'url(' + photoUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center' } })
                    : h('div', { style: { height: '100px', background: '#241d15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PALETTE.stone, fontSize: '11px' } }, 'Nessuna foto'),
                  h(
                    'div',
                    { style: { padding: '14px' } },
                    h('div', { style: { fontSize: '10px', color: PALETTE.gold, textTransform: 'uppercase', letterSpacing: '.1em' } }, 'Sold' + (prop.date_sold ? ' · ' + prop.date_sold : '')),
                    h('div', { style: { fontSize: '17px', margin: '6px 0 4px' } }, prop.name || '(nome mancante)'),
                    h('div', { style: { fontSize: '12px', color: PALETTE.stone, marginBottom: '8px' } }, prop.location || ''),
                    h('div', { style: { fontSize: '13px', color: PALETTE.gold } }, prop.price || '')
                  )
                );
              })
            )
      );
    },
  });

  CMS.registerPreviewTemplate('properties', PropertyPreview);
  CMS.registerPreviewTemplate('articles', ArticlePreview);
  CMS.registerPreviewTemplate('homepage', HomepagePreview);
  CMS.registerPreviewTemplate('sold_properties', SoldPropertiesPreview);
})();
