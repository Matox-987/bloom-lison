import sharp from "sharp";
import { mkdirSync } from "node:fs";

const flower = (petalColor, centerColor) => `
  <g transform="translate(256,256)">
    ${[0, 60, 120, 180, 240, 300]
      .map(
        (a) =>
          `<ellipse cx="0" cy="-78" rx="52" ry="86" fill="${petalColor}" transform="rotate(${a})" opacity="0.95"/>`
      )
      .join("")}
    <circle cx="0" cy="0" r="46" fill="${centerColor}"/>
  </g>`;

// Icône : fond dégradé rose, fleur blanche
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F472B6"/>
      <stop offset="1" stop-color="#9D174D"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  ${flower("#FFFFFF", "#FDF2F8")}
</svg>`;

// Maskable : mêmes éléments mais plein cadre avec marge de sécurité
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F472B6"/>
      <stop offset="1" stop-color="#9D174D"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(0,0) scale(0.82) translate(56,56)">${flower("#FFFFFF", "#FDF2F8")}</g>
</svg>`;

mkdirSync("public/icons", { recursive: true });

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile("public/icons/icon-maskable-512.png");
// Apple touch icon : coins carrés (iOS arrondit lui-même)
const apple = svg.replace('rx="116"', 'rx="0"');
await sharp(Buffer.from(apple)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");

console.log("Icônes générées ✓");
