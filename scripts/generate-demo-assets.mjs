import { mkdir, writeFile } from 'node:fs/promises';
import { demoStyles } from '../src/lib/demo/catalog.ts';

const directory = new URL('../public/demo-products/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const style of demoStyles) {
  for (const back of [false, true]) {
    const hoodie = style.category === 'Hoodies';
    const path =
      'M220 160 L135 190 L65 325 L156 374 L199 290 L199 610 Q300 630 401 610 L401 290 L444 374 L535 325 L465 190 L380 160 Q300 215 220 160Z';
    const title = back ? 'S&amp;S' : style.graphic.replaceAll('&', '&amp;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="Demo garment illustration">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#d4d3cb"/><stop offset="1" stop-color="#a8a99f"/></linearGradient><linearGradient id="fabric"><stop stop-color="white" stop-opacity=".12"/><stop offset=".5" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity=".2"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="12" flood-opacity=".25"/></filter></defs>
<rect width="600" height="800" fill="url(#bg)"/><path d="M0 720H600 M0 80H600" stroke="#777" opacity=".2"/>
<text x="28" y="45" font-family="monospace" font-size="13" letter-spacing="2" fill="#373830">SMOKE &amp; STEREO / DESIGN STUDY</text>
<g filter="url(#shadow)"><path d="${path}" fill="${style.color}" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="${path}" fill="url(#fabric)"/>
${hoodie ? `<path d="M220 160Q210 60 300 55Q390 60 380 160L335 207H265Z" fill="${style.color}" stroke="#000" stroke-opacity=".3" stroke-width="3"/><path d="M265 207L263 300M335 207L338 300" stroke="${style.ink}" opacity=".6" stroke-width="3"/><path d="M240 495H360L380 570H220Z" fill="none" stroke="${style.ink}" opacity=".2"/>` : `<path d="M220 160Q300 215 380 160L369 152Q300 192 231 152Z" fill="#000" opacity=".3"/>`}
<path d="M203 293L218 600M397 293L382 600" stroke="#fff" opacity=".04" stroke-width="5"/>
<text x="300" y="${back ? 300 : 350}" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="${title.length > 10 ? 24 : 34}" font-weight="900" letter-spacing="-1" fill="${style.ink}">${title}</text>
<circle cx="300" cy="420" r="43" fill="none" stroke="${style.ink}" stroke-width="2"/><circle cx="300" cy="420" r="30" fill="none" stroke="${style.ink}"/><circle cx="300" cy="420" r="9" fill="${style.ink}"/>
<text x="300" y="490" text-anchor="middle" font-family="monospace" font-size="10" letter-spacing="2" fill="${style.ink}">INDEPENDENT FREQUENCIES</text></g>
<rect x="28" y="744" width="216" height="28" fill="#23251e"/><text x="40" y="763" font-family="monospace" font-size="12" letter-spacing="1" fill="#d4f542">DEMO / NOT FOR SALE</text><text x="570" y="763" text-anchor="end" font-family="monospace" font-size="11" fill="#373830">${back ? 'BACK STUDY' : 'FRONT STUDY'}</text></svg>`;
    await writeFile(new URL(`${style.id}${back ? '-back' : ''}.svg`, directory), svg);
  }
}
console.log('Generated 16 labelled demo garment illustrations.');
