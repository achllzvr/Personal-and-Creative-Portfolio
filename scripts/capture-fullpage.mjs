/**
 * Full-page mobile screenshots via puppeteer-core + system Chrome.
 * Usage: node scripts/capture-fullpage.mjs
 */
import puppeteer from 'puppeteer-core';
import { mkdir, copyFile, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/assets/creative/images');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const WIDTH = 390;
const HEIGHT = 844;

/** @type {{ project: string, file: string, url: string, waitMs?: number, promote?: '01'|'02', prep?: (page: import('puppeteer-core').Page) => Promise<void> }[]} */
const SHOTS = [
  // TAPUS local (shop is public)
  { project: 'tapus', file: 'fp-01-home.png', url: 'http://127.0.0.1:8080/', waitMs: 2500, promote: '01', maxCss: 8000 },
  { project: 'tapus', file: 'fp-02-setup.png', url: 'http://127.0.0.1:8080/setup-guide.php', waitMs: 2500, promote: '02', maxCss: 9999 },

  // NULPlay local
  { project: 'nulplay', file: 'fp-01-queue.png', url: 'http://127.0.0.1:8000/', waitMs: 3000, promote: '01' },
  {
    project: 'nulplay',
    file: 'fp-02-screen.png',
    url: 'http://127.0.0.1:8000/screen',
    waitMs: 3500,
    promote: '02',
  },

  // Heatmap local (full interactive HTML)
  {
    project: 'heatmap',
    file: 'fp-01-choropleth.png',
    url: 'http://127.0.0.1:8768/ph_choropleth_map_e.html',
    waitMs: 5000,
    promote: '01',
  },
  {
    project: 'heatmap',
    file: 'fp-02-heatmap.png',
    url: 'http://127.0.0.1:8768/philippines_heatmap_e.html',
    waitMs: 4000,
    promote: '02',
  },

  // PRISM saved review page
  {
    project: 'prism',
    file: 'fp-01-upload-review.png',
    url: 'http://127.0.0.1:8766/Upload%20Review.html',
    waitMs: 2000,
    promote: '01',
  },
  {
    project: 'prism',
    file: 'fp-02-upload-section.png',
    url: 'http://127.0.0.1:8766/Upload%20Review.html',
    waitMs: 2500,
    promote: '02',
    fullPage: false,
    prep: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 4200));
      await new Promise((r) => setTimeout(r, 500));
    },
  },

  // Karbono local (admin auth UI + public-facing root)
  {
    project: 'karbono',
    file: 'fp-01-admin.png',
    url: 'http://127.0.0.1:8081/index.php',
    waitMs: 2000,
    promote: '01',
  },
  {
    project: 'karbono',
    file: 'fp-02-root.png',
    url: 'http://127.0.0.1:8081/',
    waitMs: 2500,
    promote: '02',
  },

  // NUtify local Laravel
  {
    project: 'nutify',
    file: 'fp-01-home.png',
    url: 'http://127.0.0.1:8769/',
    waitMs: 2500,
    promote: '01',
  },
  {
    project: 'nutify',
    file: 'fp-02-login.png',
    url: 'http://127.0.0.1:8769/login',
    waitMs: 2000,
    promote: '02',
    prep: async (page) => {
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 }).catch(() => {});
      await page.waitForSelector('form button, button[type="submit"]', { timeout: 15000 }).catch(() => {});
      const email = await page.$('input[type="email"], input[name="email"]');
      const pass = await page.$('input[type="password"], input[name="password"]');
      const submit = await page.$('form button, button[type="submit"], input[type="submit"]');
      if (email && pass && submit) {
        await email.click({ clickCount: 3 });
        await email.type('test@example.com');
        await pass.click({ clickCount: 3 });
        await pass.type('password');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
          submit.click(),
        ]);
        await new Promise((r) => setTimeout(r, 2500));
      }
    },
  },

  // NUtify flutter web backup (marketing)
  {
    project: 'nutify',
    file: 'fp-03-flutter-web.png',
    url: 'http://127.0.0.1:8767/flutter/',
    waitMs: 4000,
  },
];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

/** True content height (avoids runaway scrollHeight from transforms / overflow). CSS px. */
async function measureContentHeight(page, maxCss = 14000) {
  return page.evaluate((maxH) => {
    const doc = document.documentElement;
    const body = document.body;
    let bottom = Math.max(doc?.clientHeight || 0, window.innerHeight || 0, 844);
    const nodes = body ? body.querySelectorAll('*') : [];
    for (const el of nodes) {
      try {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (style.position === 'fixed' || style.position === 'sticky') continue;
        const rect = el.getBoundingClientRect();
        const b = rect.bottom + window.scrollY;
        if (Number.isFinite(b) && b > bottom) bottom = b;
      } catch {
        /* ignore */
      }
    }
    // Prefer the tighter of scrollHeight vs measured content bottom
    const scrollH = Math.max(body?.scrollHeight || 0, doc?.scrollHeight || 0);
    let h = Math.ceil(Math.min(Math.max(bottom, 844), scrollH || bottom, maxH));
    // If scrollHeight is absurdly larger than measured content, trust measured
    if (scrollH > bottom * 2.5) h = Math.ceil(Math.min(Math.max(bottom + 24, 844), maxH));
    return h;
  }, maxCss);
}

async function capture() {
  await access(CHROME);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--force-device-scale-factor=2',
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  );
  await page.emulateTimezone('Asia/Manila');

  const results = [];
  for (const shot of SHOTS) {
    const dir = path.join(OUT, shot.project, '_shots');
    await ensureDir(dir);
    const dest = path.join(dir, shot.file);
    try {
      const res = await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() =>
        page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 45000 }),
      );
      await new Promise((r) => setTimeout(r, shot.waitMs ?? 2000));
      // Lazy-load pass within a sane scroll budget
      await page.evaluate(async () => {
        const limit = Math.min(
          Math.max(document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0, 2000),
          12000,
        );
        for (let y = 0; y < limit; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      }).catch(() => {});
      if (shot.prep) await shot.prep(page);

      const useFullPage = shot.fullPage !== false;
      if (useFullPage) {
        const cssH = await measureContentHeight(page, shot.maxCss ?? 14000);
        await page.setViewport({
          width: WIDTH,
          height: Math.max(HEIGHT, cssH),
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
        });
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({
          path: dest,
          type: 'png',
          clip: { x: 0, y: 0, width: WIDTH, height: cssH },
          captureBeyondViewport: true,
        });
        // Restore mobile viewport for next shot
        await page.setViewport({
          width: WIDTH,
          height: HEIGHT,
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
        });
        console.log(`OK  HTTP ${res?.status?.() ?? '?'}  contentH=${cssH}px  ${shot.project}/${shot.file}`);
      } else {
        await page.screenshot({ path: dest, type: 'png', fullPage: false });
        console.log(`OK  HTTP ${res?.status?.() ?? '?'}  viewport  ${shot.project}/${shot.file}`);
      }

      if (shot.promote) {
        const promo = path.join(OUT, shot.project, `${shot.promote}.png`);
        await copyFile(dest, promo);
      }
      results.push({ ok: true, dest, url: shot.url, promote: shot.promote });
    } catch (err) {
      results.push({ ok: false, dest, url: shot.url, error: String(err.message || err) });
      console.error(`FAIL ${shot.project}/${shot.file}\n  ${err.message || err}`);
    }
  }

  await browser.close();
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nDone: ${ok}/${results.length} full-page shots`);
  process.exit(ok ? 0 : 1);
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
