// ============================================================
// Firefly Design System → Figma — Color swatches board
// ------------------------------------------------------------
// Reads the LIVE color variables created by figma-create-variables.js
// ("Firefly ref" + "Firefly sys" collections) and lays out a swatch board on a
// new page. Each swatch's fill is BOUND to its variable, so swatches reflect the
// active mode (Light/Dark) and update if the variable value changes.
//
// HOW TO RUN: open the Figma file (with the Firefly variables already imported)
// → run the "Scripter" plugin → paste this whole file → Run.
// Re-running replaces the previous "Firefly · Colors" page.
// ============================================================

(async () => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const refCol = collections.find(c => c.name === 'Firefly ref');
  const sysCol = collections.find(c => c.name === 'Firefly sys');
  if (!refCol && !sysCol) { figma.notify('No "Firefly ref/sys" collections — run figma-create-variables.js first.'); return; }

  const allVars = await figma.variables.getLocalVariablesAsync();
  const colorVarsIn = (col) => !col ? [] :
    allVars.filter(v => v.variableCollectionId === col.id && v.resolvedType === 'COLOR');

  // ---- helpers ----
  const TXT = (chars, { size = 12, style = 'Regular', color = { r: 0.1, g: 0.1, b: 0.12 } } = {}) => {
    const t = figma.createText();
    t.fontName = { family: 'Inter', style };
    t.characters = chars;
    t.fontSize = size;
    t.fills = [{ type: 'SOLID', color }];
    return t;
  };
  const frame = (name, dir, gap, padX = 0, padY = 0) => {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.itemSpacing = gap;
    f.paddingLeft = f.paddingRight = padX;
    f.paddingTop = f.paddingBottom = padY;
    f.fills = [];
    return f;
  };
  const leaf = (path) => path.split('/').slice(1).join('/'); // drop leading "color"
  const scaleKey = (path) => { const n = parseInt(path.split('/').pop(), 10); return isNaN(n) ? 9999 : n; };

  // ---- swatch tile (rect fill bound to the variable) ----
  const tile = (v) => {
    const col = frame('tile:' + v.name, 'VERTICAL', 6);
    col.counterAxisAlignItems = 'MIN';
    const rect = figma.createRectangle();
    rect.resize(96, 56);
    rect.cornerRadius = 6;
    rect.strokeWeight = 1;
    rect.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.87 } }];
    const paint = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
    rect.fills = [paint];
    col.appendChild(rect);
    const label = TXT(leaf(v.name), { size: 11, style: 'Semi Bold' });
    col.appendChild(label);
    return col;
  };

  // ---- group color vars by their 2nd path segment (e.g. color/primary) ----
  const buildGroups = (vars, fallback) => {
    const groups = new Map();
    for (const v of vars) {
      const parts = v.name.split('/');           // ["color","primary","500"] or ["color","surface"]
      const key = parts.length >= 3 ? parts[1] : fallback;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    }
    return groups;
  };

  const section = (title, vars, sortByScale) => {
    const sec = frame('section:' + title, 'VERTICAL', 12);
    sec.counterAxisAlignItems = 'MIN';
    sec.appendChild(TXT(title, { size: 16, style: 'Semi Bold' }));
    const row = frame('swatches', 'HORIZONTAL', 12);
    row.layoutWrap = 'WRAP';
    row.counterAxisSizingMode = 'FIXED';
    row.resize(1120, 10);
    const sorted = [...vars].sort((a, b) => sortByScale ? scaleKey(a.name) - scaleKey(b.name) : a.name.localeCompare(b.name));
    for (const v of sorted) row.appendChild(tile(v));
    sec.appendChild(row);
    return sec;
  };

  // ---- board ----
  const page = figma.createPage();
  page.name = 'Firefly · Colors';
  figma.currentPage = page;

  const board = frame('Firefly — Colors', 'VERTICAL', 32, 48, 48);
  board.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.98, b: 0.98 } }];
  board.appendChild(TXT('Firefly — Color tokens', { size: 28, style: 'Semi Bold' }));
  board.appendChild(TXT('Swatches bound to the Figma variables (Firefly ref / sys). Switch the mode on this frame to preview dark.', { size: 12, color: { r: 0.42, g: 0.45, b: 0.5 } }));

  const PALETTE_ORDER = ['primary', 'secondary', 'tertiary', 'neutral', 'error', 'success', 'warning', 'info'];
  const refGroups = buildGroups(colorVarsIn(refCol), 'other');
  board.appendChild(TXT('ref · primitives', { size: 20, style: 'Semi Bold' }));
  const refKeys = [...refGroups.keys()].sort((a, b) => {
    const ia = PALETTE_ORDER.indexOf(a), ib = PALETTE_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  for (const k of refKeys) board.appendChild(section('color / ' + k, refGroups.get(k), true));

  const sysColors = colorVarsIn(sysCol);
  if (sysColors.length) {
    board.appendChild(TXT('sys · semantic', { size: 20, style: 'Semi Bold' }));
    board.appendChild(section('semantic colors', sysColors, false));
  }

  figma.currentPage.appendChild(board);
  board.x = 0; board.y = 0;
  figma.viewport.scrollAndZoomIntoView([board]);
  figma.notify('Firefly colors board: ' + (colorVarsIn(refCol).length + sysColors.length) + ' swatches.');
  console.log('Done. Page "Firefly · Colors".');
})();
