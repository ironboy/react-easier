// traps used by our recursive proxy in useStates when 
// use get, set and delete on properties in the state 
// - they will call setState which
// makes it possible to just change values (even in sub objects)
// rather than calling a setter, React will still rerender :)

import { stack } from './stack';
import { goFetch } from '../useFetch';

export function makeProxyFactory(
  stateName, state, setState, bind, debugLog
) {

  // traps
  const proxyHandler = {
    get(obj, key) {
      debugLog('get', state, obj, key, obj[key], undefined, stateName);
      return {
        _isProxy: true,
        _proxied: obj,
        bind: (...args) => bind(makeProxy(obj), ...args),
        _: obj._ || (obj instanceof Function || obj instanceof HTMLElement ? obj : obj instanceof Array ? [...obj] : { ...obj })
      }[key]
        || makeProxy(obj[key]);
    },
    set(obj, key, val) {
      let valBefore = obj[key];
      obj[key] = val;
      setState({ ...state });
      (async () => {
        let _stack = stack();
        let fetched = val instanceof Array && await goFetch(stateName, state, setState, [val]);
        let extraLog = fetched ? [fetched.url] : [];
        debugLog('set', state, obj, key, val, valBefore, stateName, _stack, ...extraLog);
      })();
      return true;
    },
    deleteProperty(obj, key) {
      let valBefore = obj[key];
      delete obj[key];
      setState({ ...state });
      debugLog('delete', state, obj, key, undefined, valBefore, stateName);
      return true;
    }
  };

  // make a proxy (used recursively by the set trap)
  const makeProxy = x => x instanceof Object && !x._isProxy ?
    new Proxy(x, proxyHandler) : x;

  return makeProxy;
}