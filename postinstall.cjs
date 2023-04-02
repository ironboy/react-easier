const fs = require('fs');
const path = require('path');

// Add treating js files as jsx files to vite.config.js
// thus improving the debug log since it is piggybacking
// on src-maps, and would otherwise be missing these in js files

try {

  // find the closest vite.config.js
  let p = __dirname.split(path.sep), s = path.sep;
  while (p.length && !fs.existsSync(p.join(s) + s + 'vite.config.js')) { p.pop(); }
  if (!p.length) { return; /* not found */ }
  let pathToConfig = p.join(s) + s + 'vite.config.js';

  // add necessary changes to vite config
  // (changes that will run the settings through the 
  // reactEasierViteConfig function found in vite - config.js)
  let lf = path.sep === '\\' ? '\r\n' : '\n';
  let config = fs.readFileSync(pathToConfig, 'utf-8');
  if (config.includes('reactEasierViteConfig as revc_')) { return; }
  config = "import { reactEasierViteConfig as revc_ } from 'react-easier/vite-config'" + lf + config;
  config = config.replace(/(defineConfig[\(]*\()/, '$1revc_(');
  let start = config.indexOf('revc_(');
  let c = config.split('');
  let pCo = 1;
  for (let i = start; i < c.length; i++) {
    c[i] === '(' && pCo++;
    c[i] === ')' && pCo--;
    c[i] === ')' && pCo === 1 && (c[i] = '))');
  }
  config = c.join('');
  fs.writeFileSync(pathToConfig, config, 'utf-8');

}
catch (e) { }