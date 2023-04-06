import { stack as getStack } from './stack';
import { consoleSrcMapped } from './consoleSrcMapped';
const isSafari = navigator['ven' + 'dor'].includes('Apple');

// keep a memory helping us to rebounce double calls during React StrictMode
let debounceMem = [];

// styling
const font = isSafari ? "font-family: monospace;" : '';
const styleAlts = [
  'color: rgb(19, 105, 42);' + font,
  'color: rgb(11, 30, 124);'
];

// try to create a deep copy - so we can log things in their curent state
// and: keep functions
function deepCopy(val) {
  const funcs = [];
  try {
    return JSON.parse(JSON.stringify(val,
      (key, val) => typeof val === 'function' ? funcs.push(val) && '____function____' : val),
      (key, val) => val === '____function____' ? funcs.shift() : val
    );
  }
  catch (e) { return val; }
}

export async function debugLog(
  action, state, obj, key,
  newValue, oldValue, stateName, stack, fetchUrl
) {
  // return if debug not on, or not on for get, or array.length (unnecessary)
  if (!window.___debugStates___) { return; }
  if (!window.___debugStatesIncludeGet___ && action === 'get') { return; }
  if (obj instanceof Array && key === 'length') { return; }
  if (key === 'constructor') { return; }

  // get the stack if not defined in param
  stack = stack || getStack();
  if (window.___lastBindChange___) {
    stack = window.___lastBindChange___;
    delete window.___lastBindChange___;
  }

  // don't start a new debugLog before the previous one has finished
  if (window.___debugLock___) {
    setTimeout(() => debugLog(...arguments, stack), 10);
    return;
  }

  let output;
  try {
    // locking, important: no more returns from here on 
    // (unless you reset ___debugLock___ to false)
    window.___debugLock___ = true;

    // get path to property being changed (or read)
    let mem = [];
    JSON.stringify(state, function (key, val) {
      let path = (mem.find(x => x.val === this) || { path: [] }).path;
      mem.push({ obj: this, key, val, path: [...path, key] });
      return val;
    });
    let found = mem.find(x => x.obj === obj || x.obj._proxied === obj);
    if (!found) {
      window.___debugLock___ = false;
      return;
    }
    let path = found && found.path.slice(2, -1).concat(key);

    // only keep items < 100 ms old in debounceMem
    debounceMem = debounceMem.filter(x => Date.now() - x.time < 100);

    // if stack in debounceMem then don't do anything
    let debounce = debounceMem.find(
      x => x.stack === stack.join('\n') && x.path === path.join('.'));
    if (debounce) { window.___debugLock___ = false; return; }

    // add to debounceMem
    debounceMem.push({
      time: Date.now(),
      stack: stack.join('\n'),
      path: path.join('.')
    });

    // create debug output
    let output;

    // get details from the stack
    let { url } = stack;

    // create output
    let stateNameX = stateName.indexOf('local state: ') !== 0 ?
      stateName : 'local state in ' + ((url.split('src/')[1] || '').split('/').slice(-1) || '')
    stateNameX = stateNameX === 'local state in ' ? 'local state' : stateNameX;
    stateNameX = stateNameX.replace(/\.jsx{0,1}$/g, '');
    output = [
      'state name', stateNameX || 'none, local state',
      'action', action + (action === 'initialize' ? '' : (' ' + path
        .map(x => isNaN(+x) ? '.' + x : '[' + x + ']').join('').slice(1)))
      + (!fetchUrl ? '' : ' (fetch from ' + fetchUrl + ')'),
      '', '',
      'file', url.split('src/')[1] || 'Only available in dev mode.',
      'time', new Date().toISOString(),
      '', '',
      ...(action === 'initialize' ? [] : action === 'get' ?
        ['value', '%O'] : ['old value', '%O', 'new value', '%O']),
      'state', '%O'
    ];

    // format and color console output
    let styles = [];
    output = '\n' + output.map((x, i) => {
      styles.push(styleAlts[i % 2]);
      x = i % 2 === 0 ? x.padEnd(14, ' ') : x + '\n';
      return '%c' + x;
    }).join('');

    // insert old and new values
    if (action !== 'initialize') {
      if (action !== 'get') { styles.splice(styles.length - 4, 0, deepCopy(oldValue && oldValue._isProxy ? oldValue._ : oldValue)); }
      styles.splice(styles.length - 2, 0, deepCopy(newValue && newValue._isProxy ? newValue._ : newValue));
    }
    styles.push(deepCopy(state.state));

    // write to the console.log, then
    consoleSrcMapped(stack, 'log', [output, ...styles]);
  }

  // if something goes wrong while creating the output
  catch (e) {
    // fail silently, keep next line commented  out for fast debugging
    // console.log(...(output ? output : ['Could not extract debug details.']));
  }

  // unlock -> ok to process next log message
  window.___debugLock___ = false;
}

// Debug of fetch
export default function debugLogFetch(
  _stack, url, obj, objKey, stateName, state, val
) {
  if (!window.___debugStates___) { return; }
  val instanceof Array || (val = [val]);
  debugLog('set', state, obj, objKey, val, [], stateName, _stack, url);
}