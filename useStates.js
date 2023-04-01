import { useState, useDebugValue, useEffect } from 'react';
import { makeProxyFactory } from './helpers/makeProxyFactory';
import { bind } from './helpers/bindStatesToForm';
import { debugLog } from './helpers/debugLog';
import { goFetch } from './useFetch';

// an object in which we save states that have names
const savedStates = {};

// and another for 'watcher'-local states
// (needed for createBrowserRouter - i.e. cases 
//  where we don't have a normal descedant line of components)
const savedWatcherStates = {};

export function useStates(initObj, stateName) {

  // switch argument values around depending on type
  typeof initObj === 'string'
    && ([initObj, stateName] = [stateName, initObj]);

  // for easier viewing of named states in React dev tools
  useDebugValue((initObj ? stateName : stateName + ' subscriber') || 'local state');

  // get the state from the savedStates if name only
  const [state, setStateRaw] = initObj ?
    useState({ state: initObj }) : savedStates[stateName];


  // localState
  if (stateName && !initObj) {
    let [localWatcher, setLocalWatcher] = useState({ ...state });
    if (localWatcher.state === initObj) {
      savedWatcherStates[stateName] = savedWatcherStates[stateName] || [];
      savedWatcherStates[stateName].push([localWatcher, setLocalWatcher]);
    }
  }

  function setState(...args) {
    setStateRaw(...args);
    if (stateName && !initObj) {
      for (let [val, setter] of savedWatcherStates[stateName]) {
        setter(args[0]);
      }
    }
  }

  // if this is the initial setting of then call goFetch
  if (state.state === initObj) {
    (async () => {
      debugLog('initialize', state, initObj, '',
        initObj, undefined, stateName);
      await goFetch(stateName, state, setState);
    })();
  }

  // if a stateName is provided then save the state in savedStates
  stateName && (savedStates[stateName] = [state, setState]);

  // proxy objects and arrays but don't double proxy them
  const makeProxy =
    makeProxyFactory(stateName, state, setState, bind, debugLog);

  // proxied state
  const proxiedState = makeProxy(state.state);

  // return the state as a proxy
  return proxiedState;
}