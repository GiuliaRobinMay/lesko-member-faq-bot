/* NOTE: Chromium will not launch in the Claude Code container — every run times
   out. This script is kept because it works on a normal machine:
     npm install && node check-embed.js 520 1280
   It renders the app in an iframe on a tall host page and asserts that the ask
   box is visible, the app does not overflow, and the host page never scrolls. */
/* Render the app inside an iframe on a tall host page — the Mighty Networks
   situation — and measure what actually went wrong before, instead of guessing.
   Usage: node check-embed.js [height] [viewportWidth] */
const { chromium } = require('playwright');
const path = require('path');

const H = Number(process.argv[2] || 520);
const W = Number(process.argv[3] || 1280);
const app = 'file://' + path.resolve('lesko-navigator.html');

const host = `<!doctype html><html><body style="margin:0;font:16px system-ui">
  <div style="height:420px;background:#2c3fa0;color:#fff;padding:20px">Community header above the embed</div>
  <iframe id="f" src="${app}" style="width:100%;height:${H}px;border:0;display:block"></iframe>
  <div style="height:900px;background:#eee;padding:20px">Comments below the embed</div>
</body></html>`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: W, height: 800 } });
  await p.setContent(host);
  const f = p.frameLocator('#f');
  await p.waitForTimeout(900);
  const fh = await (await p.$('#f')).contentFrame();

  const geo = () => fh.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null;
      const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; };
    return { view: window.innerHeight, header: r('header.bar'), composer: r('.composer'),
             body: Math.round(document.body.scrollHeight),
             threadScrolls: (() => { const t = document.querySelector('.thread');
               return t ? t.scrollHeight > t.clientHeight + 2 : null; })() };
  });

  const before = await geo();
  const hostScrollBefore = await p.evaluate(() => window.scrollY);

  // ask a question the way a member would
  await f.locator('#q').fill('Where do I find my call sheet?');
  await f.locator('.cwrap button').click();
  await p.waitForTimeout(1800);

  const after = await geo();
  const hostScrollAfter = await p.evaluate(() => window.scrollY);

  const fits = after.composer && after.composer.bottom <= after.view + 1;
  const noOverflow = after.body <= after.view + 1;
  const hostMoved = hostScrollAfter !== hostScrollBefore;

  console.log(`iframe ${H}px @ ${W}w`);
  console.log(`  app viewport      ${after.view}px, body ${after.body}px`);
  console.log(`  header            top ${after.header.top} bottom ${after.header.bottom}`);
  console.log(`  ask box           top ${after.composer.top} bottom ${after.composer.bottom}`);
  console.log(`  ${fits ? 'PASS' : 'FAIL'}  ask box visible without scrolling`);
  console.log(`  ${noOverflow ? 'PASS' : 'FAIL'}  app does not overflow its frame`);
  console.log(`  ${!hostMoved ? 'PASS' : 'FAIL'}  host page did not scroll (${hostScrollBefore} -> ${hostScrollAfter})`);
  console.log(`  thread scrolls internally: ${after.threadScrolls}`);

  await p.screenshot({ path: `shot-${H}.png`, fullPage: false });
  await b.close();
})();
