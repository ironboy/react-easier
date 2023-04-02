// console methods (protected from monkey patching)
const methods = {};
Object.keys(console)
  .filter(x => typeof console[x] === 'function')
  .forEach(x => methods[x] = console[x].bind(console));
window.___cmethods___ = methods;

const sourceMapCache = {}; // cache for source maps
let lastCall = 0; // used with ignoreTime for debouncing
let sleep = ms => new Promise(res => setTimeout(res, ms)); // async sleep

export async function consoleSrcMapped(stack, cMethod, cArgs, ignoreTime) {

  let { url, line, column, last } = stack;
  let fullUrl = url;
  try {
    fullUrl = url + '?' + last.split('?')[1].split(':')[0];
  }
  catch (e) { }

  // Debounce, if more than one call during ignoreTime milliseconds
  if (ignoreTime && Date.now() - lastCall < ignoreTime) { return; }
  lastCall = Date.now();

  // Read source map from transpiled file or cache
  let sourceMap = sourceMapCache[fullUrl];
  if (!sourceMap) {
    try {
      let fileContent = url.split('src/')[1] ? await (await fetch(url)).text() : '';
      sourceMap = fileContent.slice(fileContent.indexOf('//# source' + 'MappingURL'));
    }
    catch (e) { }
  }
  sourceMapCache[fullUrl] = sourceMap;

  // Create src for temp file/script
  // - the trick is to have the same line and column numbers as in the transpiled file
  //   and the same src map... this gives browser sourcemapping back to source file
  let className = 'a' + (Math.random() + '').split('.')[1];
  window.___debugContent___ = window.___debugContent___ || {};
  window.___debugContent___[className] = cArgs;
  let src = '\n'.repeat(Math.max(0, line - 1))
    + ' '.repeat(Math.max(0, column - 1))
    + `window.___cmethods___['${cMethod}']`
    + `(...window.___debugContent___['${className}']);`
    + `delete window.___debugContent___['${className}'];`
    + '/*remover*/\n' + (sourceMap.length > 10 ? sourceMap : '');
  // Log from our temp script with the mapping
  // we borrowed from the transpiled file
  let isFirefox = 'netscape' in window;
  if (isFirefox) {
    // Firefox - just eval
    window['lave'.split('').reverse().join('')](src);
  }
  else {
    // Create a temp script and load - better for Chrome, a must in Safari
    let script = document.createElement('script');
    script.classList.add(className);
    script.type = 'module';
    src = src.replace('/*remover*/',
      ';document.querySelector(".' + className + '").remove();\n');
    script.src = 'data:application/javascript;base64,' + window.btoa(src);
    document.body.append(script);
    while (document.querySelector(className)) { await sleep(10); }
  }
}