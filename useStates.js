import { useState, useDebugValue } from 'react';
import { makeProxyFactory } from './helpers/makeProxyFactory';
import { stack } from './helpers/stack';
import { bind } from './helpers/bindStatesToForm';
import { debugLog } from './helpers/debugLog';
import { goFetch } from './useFetch';

// an object in which we save states that have names
const savedStates = {};

export function useStates(initObj, stateName) {

  // switch argument values around depending on type
  typeof initObj === 'string'
    && ([initObj, stateName] = [stateName, initObj]);

  // for easier viewing of named states in React dev tools
  useDebugValue(stateName || 'local state');

  // get the state from the savedStates if name only
  const [state, setState] = initObj ?
    useState({ state: initObj }) : savedStates[stateName];

  // if this is the initial setting of then call goFetch
  if (state.state === initObj) {
    (async () => {
      debugLog('initialize', state, initObj, '',
        initObj, undefined, stateName);
      await goFetch(state, setState);
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