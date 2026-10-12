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
  await new Promise(res => s.listen(9099, '127.0.0.1', res));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test every width from 320 to 1400 in 25px increments
  for (let w = 320; w <= 1400; w += 25) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('http://127.0.0.1:9099/index.html', { waitUntil: 'networkidle' });
    
    // Check if horizontal scrolling is possible
    const scrollInfo = await page.evaluate((winW) => {
      const doc = document.documentElement;
      window.scrollTo(500, 0);
      const scrolledLeft = window.scrollX || doc.scrollLeft;
      window.scrollTo(0, 0);

      // Find any element whose right edge > winW
      const bad = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > winW + 1) {
          bad.push({
            tag: el.tagName,
            cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 50) : '',
            right: Math.round(r.right),
            excess: Math.round(r.right - winW)
          });
        }
      });

      return {
        winW,
        scrollWidth: doc.scrollWidth,
        canScroll: scrolledLeft > 0,
        scrolledAmount: Math.round(scrolledLeft),
        badCount: bad.length,
        topBad: bad.slice(0, 3)
      };
    }, w);

    if (scrollInfo.canScroll || scrollInfo.scrollWidth > w || scrollInfo.badCount > 0) {
      console.log(`Width ${w}px: canScroll=${scrollInfo.canScroll} (amount=${scrollInfo.scrolledAmount}), scrollWidth=${scrollInfo.scrollWidth}, badElements=${scrollInfo.badCount}`);
      if (scrollInfo.topBad.length > 0) {
        console.log('  Top elements:', scrollInfo.topBad);
      }
    }
  }

  await browser.close();
  s.close();
})();
