import { stack } from './helpers/stack';
import debugLogFetch from './helpers/debugLog';

// A unique 'symbol' for useFetch and a debounce memory 
// that helps us avoid double fetching in React StrictMode
const fetchSymbol = {}, debounceMem = {};

// return an array, and mark it for later fetching
// arrays are always safe for rendering with React
export function useFetch(url, type, fetchOptions) {
  let options = fetchOptions;
  if (type instanceof Object) {
    options = type;
    type = undefined;
  }
  type = type || 'json';
  options = options || {};
  let postProcess = a => a;
  if (options.postProcess) {
    postProcess = options.postProcess;
    delete options.postProcess;
  }
  let array = [];
  array.___toFetch___ =
    { fetchSymbol, url, type, options, _stack: stack(), postProcess };
  return array;
}

// goFetch - called from useStates on initialize and 
// its proxy factory upon the setting of a value to an array
// checks the state and fetches arrays marked for fetching
export async function goFetch(stateName, state, setState, toFetch) {
  let callFromProxyFactory = false;
  // find arrays that are marked for fetching, if not provided
  if (!toFetch) {
    toFetch = [];
    try {
      JSON.stringify(state, function (key, value) {
        value
          && value.___toFetch___
          && value.___toFetch___.fetchSymbol === fetchSymbol
          && (value.___toFetch___.key = key)
          && (value.___toFetch___.object = this)
          && toFetch.push(value);
        return value;
      });
    } catch (e) { }
  }
  else {
    callFromProxyFactory = toFetch[0] && toFetch[0].___toFetch___;
  }
  // fetch and add to array (if not in debounceMem already)
  for (let x of toFetch) {
    if (!x.___toFetch___) { continue; }
    let { url, options, type, _stack, postProcess,
      object: obj, key: objKey } = x.___toFetch___;
    let key = JSON.stringify({ url, options, type });
    delete x.___toFetch___;
    debounceMemPurge();
    debounceMem[key] = debounceMem[key] || {
      time: Date.now(),
      fetched: _fetch(
        url, options, type, _stack,
        postProcess, obj, objKey, stateName, state, callFromProxyFactory
      )
    }
    let result = await debounceMem[key].fetched;
    debounceMem[key] = { time: Date.now(), result };
    result instanceof Array ? x.push(...result) : x.push(result);
    setState({ ...state });
  }
  return callFromProxyFactory;
}

// do the actual fetching (thus we can wait for both steps
// with a single await in goFetch - after adding to debounceMem)
async function _fetch(
  url, options, type, _stack,
  postProcess, obj, objKey, stateName, state, callFromProxyFactory
) {
  let fetched = await (await fetch(url, options))[type]();
  let val = await postProcess(fetched);
  !callFromProxyFactory &&
    setTimeout(() => debugLogFetch(_stack, url, obj, objKey, stateName, state, val), 0);
  return val;
}

// purge the debounceMem from entries older than 100 ms
function debounceMemPurge() {
  for (let [key, val] of Object.entries(debounceMem)) {
    Date.now() - val.time > 100 && delete debounceMem[key];
  }
}