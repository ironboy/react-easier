export default function cssNester(css, nestWith) {
  css = css.replace(/\r/g, '');
  let co = 0, mem = [], d = [...css].reduce((a, c) => ((co += (c === '{') - (c === '}')) || 1) && [...a, co], []);
  while (true) {
    let m = css.match(/@(-moz-|-webkit-|-ms-)*(keyframes|global)/i);
    if (!m) { break; }
    let i = m.index, j = i, s = d[i];
    while (css[j] && css[j] !== '{') { j++; }
    while (d[j] !== s) { j++; }
    mem.push(css.slice(i, j + 1));
    css = css.slice(0, i) + '__me_m__' + css.slice(j + 1);
    d.splice(i, j - i - 6);
  }
  css = css.replace(/'[^']*?'/g, x => mem.push(x) && '__me_m2__');
  css = css.replace(/"[^"]*?'/g, x => mem.push(x) && '__me_m3__');
  mem = mem.map(x => (x.match(/@global/i) || {}).index !== 0 ? x : x.slice(1 + x.indexOf('{'), x.lastIndexOf('}')));
  window.mem = mem.slice();
  return '\n/*' + nestWith + '*/\n' +
    css.replace(/([^\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '))
      .replace(/__me_m__/g, x => mem.shift())
      .replace(/__me_m2__/g, x => mem.shift())
      .replace(/__me_m3__/g, x => mem.shift());
}