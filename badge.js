/* ============================================================
   CTI Score Badge — parametric vector seal
   Recreates the supplied "Commercial Trust Index" seal so the
   score can be dropped in, and the whole mark recoloured
   (gold = database coverage, navy = SME / accountant route)
   ============================================================ */
(function () {
  const GOLD   = '#B59A5A';   // brand gold (rings / text)
  const GOLDNUM= '#9E7B38';   // deeper gold for big numerals (legibility on white)
  const NAVY   = '#0F1B2D';   // brand navy

  function pt(cx, cy, r, deg) {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  const f = (n) => Math.round(n * 100) / 100;

  let _uid = 0;

  /* opts:
     theme        'gold' | 'navy'
     score        number (0-100)  — omit/null for an empty template
     band         e.g. 'LOW RISK'
     verified     false | 'inline' | 'stamp'
     pending      true  -> shows muted "AWAITING VERIFICATION" + hollow tick
     caption      optional tiny line under the band (e.g. a date)            */
  function buildBadge(opts) {
    const o = Object.assign(
      { theme: 'gold', score: 82, band: 'LOW RISK', verified: false, pending: false, caption: '' },
      opts || {}
    );
    const uid = 'b' + (_uid++);
    const ink  = o.theme === 'navy' ? NAVY : GOLD;
    const num  = o.theme === 'navy' ? NAVY : GOLDNUM;
    const C = 220, R = 440;

    // arc paths
    const [tlx, tly] = pt(C, C, 182, 201);
    const [trx, try_] = pt(C, C, 182, 339);
    const topArc = `M${f(tlx)},${f(tly)} A182,182 0 0 1 ${f(trx)},${f(try_)}`;

    const [blx, bly] = pt(C, C, 150, 137);
    const [brx, bry] = pt(C, C, 150, 43);
    const botArc = `M${f(blx)},${f(bly)} A150,150 0 0 0 ${f(brx)},${f(bry)}`;

    // bottom flourishes (decorative, only when no bottom text)
    const [fl1x, fl1y] = pt(C, C, 150, 150);
    const [fl2x, fl2y] = pt(C, C, 150, 108);
    const [fr1x, fr1y] = pt(C, C, 150, 72);
    const [fr2x, fr2y] = pt(C, C, 150, 30);
    const flourishL = `M${f(fl1x)},${f(fl1y)} A150,150 0 0 1 ${f(fl2x)},${f(fl2y)}`;
    const flourishR = `M${f(fr1x)},${f(fr1y)} A150,150 0 0 1 ${f(fr2x)},${f(fr2y)}`;

    // side dots
    const [dlx, dly] = pt(C, C, 168, 180);
    const [drx, dry] = pt(C, C, 168, 0);

    const hasScore = o.score !== null && o.score !== undefined && o.score !== '';
    const bottomText = o.verified === 'stamp';
    const cleanBottom = bottomText || o.verified === 'inline' || o.pending;

    // ---- centre stack -------------------------------------------------
    let centre = '';
    if (hasScore) {
      centre += `<text x="${C}" y="208" text-anchor="middle" font-family="Fraunces,serif" font-weight="500" font-size="118" fill="${num}" letter-spacing="-2">${o.score}<tspan font-size="30" fill="${ink}" dx="2" opacity=".62">/100</tspan></text>`;
    } else {
      centre += `<text x="${C}" y="200" text-anchor="middle" font-family="Fraunces,serif" font-weight="500" font-size="42" fill="${ink}" opacity=".35" letter-spacing="6">— —</text>`;
    }
    // centre hairline rule (tapered look via two segments)
    centre += `<line x1="${C - 78}" y1="232" x2="${C + 78}" y2="232" stroke="${ink}" stroke-width="1.4"/>`;
    centre += `<circle cx="${C}" cy="232" r="2.2" fill="${ink}"/>`;

    // band label
    if (o.band) {
      centre += `<text x="${C}" y="266" text-anchor="middle" font-family="Inter,sans-serif" font-weight="600" font-size="16" fill="${ink}" letter-spacing="3.5">${o.band.toUpperCase()}</text>`;
    }
    if (o.caption) {
      centre += `<text x="${C}" y="288" text-anchor="middle" font-family="Inter,sans-serif" font-weight="500" font-size="11" fill="${ink}" opacity=".6" letter-spacing="1.5">${o.caption}</text>`;
    }

    // ---- verification ------------------------------------------------
    let verify = '';
    if (o.verified === 'inline') {
      // gold tick medallion stacked over "CTI VERIFIED"
      verify += `<g transform="translate(${C}, 296)">
        <circle cx="0" cy="0" r="12" fill="${GOLD}"/>
        <path d="M-5.4,0 L-1.6,4.1 L5.8,-4.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
      verify += `<text x="${C}" y="330" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="13" fill="${GOLD}" letter-spacing="2.8">CTI VERIFIED</text>`;
    } else if (o.verified === 'stamp') {
      // drawn gold tick above a gold bottom-arc "CTI VERIFIED"
      verify += `<g transform="translate(${C}, 318)">
        <path d="M-9,0 L-2.5,7 L11,-9" fill="none" stroke="${GOLD}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
      verify += `<path id="${uid}-bot" d="${botArc}" fill="none"/>`;
      verify += `<text font-family="Inter,sans-serif" font-weight="700" font-size="15" fill="${GOLD}" letter-spacing="3.6"><textPath href="#${uid}-bot" startOffset="50%" text-anchor="middle">CTI VERIFIED</textPath></text>`;
    } else if (o.pending) {
      // hollow "slot" — the gold tick fills this once an accountant verifies
      verify += `<g transform="translate(${C}, 296)">
        <circle cx="0" cy="0" r="12" fill="none" stroke="${ink}" stroke-width="1.3" stroke-dasharray="2.4 2.8" opacity=".5"/>
      </g>`;
      verify += `<text x="${C}" y="330" text-anchor="middle" font-family="Inter,sans-serif" font-weight="600" font-size="11.5" fill="${ink}" opacity=".5" letter-spacing="2.2">AWAITING VERIFICATION</text>`;
    }

    return `<svg viewBox="0 0 ${R} ${R}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img">
      <!-- rings -->
      <circle cx="${C}" cy="${C}" r="214" fill="none" stroke="${ink}" stroke-width="2.4"/>
      <circle cx="${C}" cy="${C}" r="205" fill="none" stroke="${ink}" stroke-width="1.3"/>
      <circle cx="${C}" cy="${C}" r="156" fill="none" stroke="${ink}" stroke-width="1.3"/>
      <!-- arched brand text -->
      <path id="${uid}-top" d="${topArc}" fill="none"/>
      <text font-family="Fraunces,serif" font-weight="500" font-size="25.5" fill="${ink}" letter-spacing="3"><textPath href="#${uid}-top" startOffset="50%" text-anchor="middle">COMMERCIAL TRUST INDEX</textPath></text>
      <!-- side dots -->
      <circle cx="${f(dlx)}" cy="${f(dly)}" r="4.6" fill="${ink}"/>
      <circle cx="${f(drx)}" cy="${f(dry)}" r="4.6" fill="${ink}"/>
      ${cleanBottom ? '' : `<path d="${flourishL}" fill="none" stroke="${ink}" stroke-width="1.2"/><path d="${flourishR}" fill="none" stroke="${ink}" stroke-width="1.2"/>`}
      ${centre}
      ${verify}
    </svg>`;
  }

  window.buildBadge = buildBadge;
})();
