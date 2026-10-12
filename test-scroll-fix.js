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
  await new Promise(res => s.listen(9199, '127.0.0.1', res));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test 1020px with the CSS fix applied in the page
  await page.setViewportSize({ width: 1020, height: 800 });
  await page.goto('http://127.0.0.1:9199/index.html', { waitUntil: 'networkidle' });
  
  await page.addStyleTag({
    content: `
      [data-aos="fade-left"] {
        transform: translate3d(min(20px, 2vw), 0, 0) !important;
      }
      [data-aos="fade-right"] {
        transform: translate3d(max(-20px, -2vw), 0, 0) !important;
      }
      [data-aos="fade-left"].aos-animate,
      [data-aos="fade-right"].aos-animate {
        transform: translate3d(0, 0, 0) !important;
      }
    `
  });

  const bad = await page.evaluate((winW) => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > winW + 1) {
        list.push({
          tag: el.tagName,
          cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 50) : '',
          right: Math.round(r.right),
          excess: Math.round(r.right - winW)
        });
      }
    });
    return list;
  }, 1020);

  console.log('Bad elements at 1020px with fix:', bad.length, bad);
  await browser.close();
  s.close();
})();
