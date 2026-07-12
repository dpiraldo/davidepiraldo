/*
  admin/translate-widget.js
  --------------------------
  Widget CMS personalizzato "multilingual-editor": mostra i campi di testo
  in EN/FR/IT con un bottone "Traduci" che chiama /.netlify/functions/translate
  (DeepL) e riempie automaticamente le altre due lingue a partire dall'inglese.

  Il valore salvato è sempre { en: {...}, fr: {...}, it: {...} } — stessa
  identica struttura già usata prima per le proprietà (prima solo en/fr, ora
  con "it" in più) e per gli articoli del Journal.

  Configurazione dal config.yml (vedi campi "text_fields", "languages",
  "source_language" nel widget stesso), così non serve toccare questo file
  per aggiungere/togliere un campo traducibile.
*/
(function () {
  if (typeof CMS === 'undefined' || typeof createClass === 'undefined' || typeof h === 'undefined') {
    console.error('translate-widget.js: CMS/createClass/h non disponibili — verifica che decap-cms.js sia caricato prima di questo script.');
    return;
  }

  function toPlain(v) {
    if (v && typeof v.toJS === 'function') return v.toJS();
    return v;
  }

  var LANG_NAMES = { en: 'English', fr: 'Français', it: 'Italiano' };
  var LANG_FLAGS = { en: '🇬🇧', fr: '🇫🇷', it: '🇮🇹' };

  var MultilingualEditor = createClass({
    getInitialState: function () {
      return { activeLang: this.getSourceLang(), busy: false, error: null };
    },

    getSourceLang: function () {
      return toPlain(this.props.field.get('source_language')) || 'en';
    },
    getLanguages: function () {
      return toPlain(this.props.field.get('languages')) || ['en', 'fr', 'it'];
    },
    getTextFields: function () {
      return toPlain(this.props.field.get('text_fields')) || [];
    },
    getValue: function () {
      return toPlain(this.props.value) || {};
    },

    setField: function (lang, key, val) {
      var value = this.getValue();
      var updated = {};
      for (var k in value) updated[k] = value[k];
      var langObj = {};
      var existing = updated[lang] || {};
      for (var kk in existing) langObj[kk] = existing[kk];
      langObj[key] = val;
      updated[lang] = langObj;
      this.props.onChange(updated);
    },

    handleTranslate: function () {
      var self = this;
      var value = this.getValue();
      var source = this.getSourceLang();
      var fields = this.getTextFields();
      var targets = this.getLanguages().filter(function (l) { return l !== source; });
      var texts = fields.map(function (f) {
        return (value[source] && value[source][f.name]) || '';
      });

      if (!texts.some(function (t) { return t && t.trim(); })) {
        this.setState({ error: 'Scrivi prima il testo in ' + (LANG_NAMES[source] || source) + ', poi traduci.' });
        return;
      }

      this.setState({ busy: true, error: null });

      Promise.all(
        targets.map(function (targetLang) {
          return fetch('/.netlify/functions/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              texts: texts,
              target_lang: targetLang.toUpperCase(),
              source_lang: source.toUpperCase(),
            }),
          }).then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok) throw new Error(data.error || ('Errore HTTP ' + res.status));
              return { lang: targetLang, translations: data.translations };
            });
          });
        })
      )
        .then(function (results) {
          var updated = {};
          for (var k in value) updated[k] = value[k];
          results.forEach(function (r) {
            var langObj = {};
            var existing = updated[r.lang] || {};
            for (var kk in existing) langObj[kk] = existing[kk];
            fields.forEach(function (f, i) {
              langObj[f.name] = r.translations[i];
            });
            updated[r.lang] = langObj;
          });
          self.props.onChange(updated);
          self.setState({ busy: false, activeLang: targets[0] || self.state.activeLang });
        })
        .catch(function (err) {
          self.setState({
            busy: false,
            error:
              (err && err.message) ||
              'Errore sconosciuto. Se sei in locale con start-local.sh, la traduzione richiede invece "netlify dev" (o il sito pubblicato su Netlify con DEEPL_API_KEY impostata).',
          });
        });
    },

    render: function () {
      var self = this;
      var value = this.getValue();
      var fields = this.getTextFields();
      var languages = this.getLanguages();
      var source = this.getSourceLang();
      var lang = this.state.activeLang;

      return h(
        'div',
        { style: { border: '1px solid #d8d8d8', borderRadius: '10px', padding: '16px', background: '#fafafa' } },
        h(
          'div',
          { style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' } },
          languages.map(function (l) {
            var active = l === lang;
            var hasContent = value[l] && Object.keys(value[l]).some(function (k) { return value[l][k]; });
            return h(
              'button',
              {
                key: l,
                type: 'button',
                onClick: function () { self.setState({ activeLang: l, error: null }); },
                style: {
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid ' + (active ? '#c9a86a' : '#ccc'),
                  background: active ? '#c9a86a' : '#fff',
                  color: active ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '13px',
                },
              },
              (LANG_FLAGS[l] || '') + ' ' + (LANG_NAMES[l] || l) + (hasContent ? '' : ' (vuoto)')
            );
          }),
          h(
            'button',
            {
              type: 'button',
              onClick: function () { self.handleTranslate(); },
              disabled: self.state.busy,
              style: {
                marginLeft: 'auto',
                padding: '7px 16px',
                borderRadius: '999px',
                border: 'none',
                background: self.state.busy ? '#999' : '#1f6f4a',
                color: '#fff',
                cursor: self.state.busy ? 'default' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              },
            },
            self.state.busy ? '⏳ Traduzione in corso…' : '🌐 Traduci da ' + (LANG_NAMES[source] || source)
          )
        ),
        this.state.error &&
          h(
            'div',
            { style: { color: '#b00020', fontSize: '13px', marginBottom: '14px', lineHeight: 1.5 } },
            '⚠️ ' + this.state.error
          ),
        fields.map(function (f) {
          var val = (value[lang] && value[lang][f.name]) || '';
          var isTextarea = f.type !== 'string';
          return h(
            'div',
            { key: lang + '-' + f.name, style: { marginBottom: '14px' } },
            h('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#555' } }, f.label),
            isTextarea
              ? h('textarea', {
                  value: val,
                  rows: f.name === 'body_html' ? 14 : 3,
                  style: { width: '100%', padding: '8px', fontFamily: f.name === 'body_html' ? 'monospace' : 'inherit', fontSize: '13px', boxSizing: 'border-box' },
                  onChange: function (e) { self.setField(lang, f.name, e.target.value); },
                })
              : h('input', {
                  type: 'text',
                  value: val,
                  style: { width: '100%', padding: '8px', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' },
                  onChange: function (e) { self.setField(lang, f.name, e.target.value); },
                })
          );
        })
      );
    },
  });

  var MultilingualPreview = createClass({
    render: function () {
      var value = toPlain(this.props.value) || {};
      var langs = Object.keys(value).filter(function (l) { return value[l] && Object.keys(value[l]).length; });
      return h('div', null, 'Contenuto in: ' + (langs.join(', ') || 'nessuna lingua ancora compilata'));
    },
  });

  CMS.registerWidget('multilingual-editor', MultilingualEditor, MultilingualPreview);
})();
