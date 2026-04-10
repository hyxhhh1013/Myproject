const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  try {
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(filePath));
        } else {
          results.push(filePath);
        }
      });
  } catch(e) { /* ignore */ }
  return results;
};

const frontendDir = path.resolve('frontend/src');
const nextDir = path.resolve('next-app/src');

const frontendFiles = walk(frontendDir).map(f => path.relative(frontendDir, f).replace(/\\/g, '/'));
const nextFiles = walk(nextDir).map(f => path.relative(nextDir, f).replace(/\\/g, '/'));

fs.writeFileSync('compare_output.json', JSON.stringify({frontendFiles, nextFiles}, null, 2), 'utf8');
