const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const fl = (content.match(/data-aos=["']fade-left["']/g) || []).length;
  const fr = (content.match(/data-aos=["']fade-right["']/g) || []).length;
  if (fl > 0 || fr > 0) {
    console.log(f.padEnd(28), 'fade-left:', fl, '| fade-right:', fr);
  }
});
