/**
 * Capture mobile (iPhone-ish) screenshots for creative case-study galleries.
 * Usage: node scripts/capture-case-shots.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/assets/creative/images');

const iPhone = devices['iPhone 14'];

/** @type {{ project: string, file: string, url: string, wait?: number, prep?: (page: import('playwright').Page) => Promise<void> }[]} */
const SHOTS = [
  // TAPUS live
  { project: 'tapus', file: '01-home.png', url: 'https://tapus.ph/' },
  { project: 'tapus', file: '02-shop.png', url: 'https://tapus.ph/shop.php' },
  { project: 'tapus', file: '03-setup-guide.png', url: 'https://tapus.ph/setup-guide.php' },
  { project: 'tapus', file: '04-track.png', url: 'https://tapus.ph/track-order.php' },

  // NULPlay live
  { project: 'nulplay', file: '01-queue.png', url: 'https://music.nulpsace.com/' },
  { project: 'nulplay', file: '02-screen.png', url: 'https://music.nulpsace.com/screen' },

  // Karbono live
  { project: 'karbono', file: '01-landing.png', url: 'https://karbono.com.ph/' },
  { project: 'karbono', file: '02-marketplace.png', url: 'https://karbono.com.ph/views/marketplace.php' },

  // NUtify live + local flutter web
  { project: 'nutify', file: '01-site.png', url: 'https://nutify.site/' },
  { project: 'nutify', file: '02-flutter-web.png', url: 'http://127.0.0.1:8767/flutter/' },

  // Heatmap local
  { project: 'heatmap', file: '01-hub.png', url: 'http://127.0.0.1:8765/' },
  { project: 'heatmap', file: '02-choropleth.png', url: 'http://127.0.0.1:8765/ph_choropleth_map_e.html', wait: 4000 },

  // PRISM saved HTML
  { project: 'prism', file: '01-upload-review.png', url: 'http://127.0.0.1:8766/Upload%20Review.html' },

  // TAPUS / Karbono local fallbacks (if live blocked)
  { project: 'tapus', file: '05-local-home.png', url: 'http://127.0.0.1:8080/' },
  { project: 'karbono', file: '03-local-landing.png', url: 'http://127.0.0.1:8081/' },
];

async function ensureDirs() {
  for (const p of new Set(SHOTS.map((s) => s.project))) {
    await mkdir(path.join(OUT, p, '_shots'), { recursive: true });
  }
}

async function capture() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
    locale: 'en-PH',
  });
  const page = await context.newPage();

  const results = [];
  for (const shot of SHOTS) {
    const dest = path.join(OUT, shot.project, '_shots', shot.file);
    try {
      const res = await page.goto(shot.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForTimeout(shot.wait ?? 2000);
      if (shot.prep) await shot.prep(page);
      await page.screenshot({ path: dest, fullPage: false });
      const status = res?.status() ?? 0;
      results.push({ ...shot, dest, status, ok: true });
      console.log(`OK  ${shot.project}/${shot.file}  HTTP ${status}  ${shot.url}`);
    } catch (err) {
      results.push({ ...shot, dest, ok: false, error: String(err.message || err) });
      console.error(`FAIL ${shot.project}/${shot.file}  ${shot.url}\n  ${err.message || err}`);
    }
  }

  await browser.close();
  return results;
}

capture().then((r) => {
  const ok = r.filter((x) => x.ok).length;
  console.log(`\nDone: ${ok}/${r.length} screenshots`);
  process.exit(ok ? 0 : 1);
});
