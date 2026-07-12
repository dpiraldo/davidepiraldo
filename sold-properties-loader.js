/*
  sold-properties-loader.js
  --------------------------
  Powers properties-sold.html. Reads content/sold-properties.json and builds
  one card per entry — add or remove properties from the CMS ("Sold
  Properties") and this list updates on its own, no HTML editing needed.
*/
(function () {
  const grid = document.getElementById('sold-grid');
  if (!grid) return;

  fetch('content/sold-properties.json')
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(data => {
      const items = data.properties || [];
      if (!items.length) {
        grid.innerHTML = '<p class="empty">No sold properties yet — add one from the CMS under &ldquo;Sold Properties&rdquo;.</p>';
        return;
      }
      grid.innerHTML = items.map(card).join('');
    })
    .catch(err => {
      console.warn('Sold properties unavailable', err);
      grid.innerHTML = '<p class="empty">Sold properties will appear here once added from the CMS.</p>';
    });

  function card(p) {
    const thumbStyle = p.photo ? ` style="background-image:url('${esc(p.photo)}');"` : '';
    const specs = [];
    if (p.bedrooms) specs.push(`${esc(p.bedrooms)} Bed`);
    if (p.surface) specs.push(esc(p.surface));

    return `<div class="card">
      <div class="thumb"${thumbStyle}></div>
      <div class="body">
        <div class="status">Sold${p.date_sold ? ' · ' + esc(p.date_sold) : ''}</div>
        <h2>${esc(p.name)}</h2>
        <div class="loc">${esc(p.location || '')}</div>
        ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ''}
        <div class="specs">
          ${specs.map(s => `<span>${s}</span>`).join('')}
          ${p.price ? `<span class="price">${esc(p.price)}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
