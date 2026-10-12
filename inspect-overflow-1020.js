const playwrightPath = 'C:/Users/gokul/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(playwrightPath);
const http = require('http');
const fs = require('fs');
const path = require('path');
const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const s = http.createServer((q, r) => {
  let p = path.join(__dirname, q.url.split('?')[0]);
  if (p.endsWith('/') || !path.extname(p)) p = path.join(p, 'index.html');
  if (fs.existsSync(p)) { r.writeHead(200, { 'Content-Type': mimeTypes[path.extname(p)] || 'text/plain' }); fs.createReadStream(p).pipe(r); }
  else { r.writeHead(404); r.end(); }
});

(async () => {
  await new Promise(res => s.listen(9399, '127.0.0.1', res));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1020, height: 800 });
  await page.goto('http://127.0.0.1:9399/index.html', { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => {
    const el = document.querySelector('[data-aos="fade-left"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      cls: el.className,
      rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) },
      transform: window.getComputedStyle(el).transform,
      parentRow: {
        rect: {
          left: Math.round(el.parentElement.getBoundingClientRect().left),
          right: Math.round(el.parentElement.getBoundingClientRect().right),
          width: Math.round(el.parentElement.getBoundingClientRect().width)
        }
      }
    };
  });

  console.log('Element computed before CSS override:', info);

  // Now apply override:
  await page.addStyleTag({
    content: `
      body [data-aos="fade-left"],
      html [data-aos="fade-left"],
      [data-aos="fade-left"] {
        transform: translate3d(0, 30px, 0) !important;
      }
      body [data-aos="fade-right"],
      html [data-aos="fade-right"],
      [data-aos="fade-right"] {
        transform: translate3d(0, 30px, 0) !important;
      }
      body [data-aos="fade-left"].aos-animate,
      html [data-aos="fade-left"].aos-animate,
      body [data-aos="fade-right"].aos-animate,
      html [data-aos="fade-right"].aos-animate {
        transform: translate3d(0, 0, 0) !important;
      }
    `
  });

  const infoAfter = await page.evaluate(() => {
    const el = document.querySelector('[data-aos="fade-left"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      cls: el.className,
      rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) },
      transform: window.getComputedStyle(el).transform
    };
  });

  console.log('Element computed AFTER CSS override:', infoAfter);

  const anyBad = await page.evaluate((winW) => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > winW + 1) {
        list.push({
          tag: el.tagName,
          cls: el.className.slice(0, 40),
          right: Math.round(r.right),
          excess: Math.round(r.right - winW)
        });
      }
    });
    return list;
  }, 1020);

  console.log('Any elements with right > 1020px:', anyBad.length, anyBad);

  await browser.close();
  s.close();
})();
