import { useState, useDebugValue, useEffect } from 'react';
import { makeProxyFactory } from './helpers/makeProxyFactory';
import { bind } from './helpers/bindStatesToForm';
import { debugLog } from './helpers/debugLog';
import { goFetch } from './useFetch';

// a memory for named states
const namedStates = {};

export function useStates(stateName, initObj) {

  // first call?
  const anObject = { initialized: true };
  const toCompare = useState(anObject)[0];
  const firstCall = anObject === toCompare;

  // setup state and add initObj to state
  const ns = namedStates;
  const isLocal = typeof stateName !== 'string';
  isLocal && ((initObj = stateName) || 1)
    && (stateName = useState(`local state: ${Math.random()}`)[0]);
  initObj = initObj || {};
  ns[stateName] = ns[stateName] || { state: {}, listeners: [] };
  firstCall && Object.keys(initObj).length
    && (ns[stateName].state = { ...ns[stateName].state, ...initObj });
  const state = ns[stateName];
  firstCall && (async () => await goFetch(stateName, { state: state.state }, setState))();
  firstCall && Object.keys(initObj).length
    && debugLog('initialize', state, state, '', state, undefined, stateName);
  useDebugValue(isLocal ? 'local state' : stateName);

  // add listener on mount, remove on unmount
  let setter = useState(state.state)[1];
  useEffect(() => {
    let listener = x => setter(x);
    state.listeners.push(listener);
    return () => {
      state.listeners.splice(state.listeners.indexOf(listener), 1);
      setTimeout(removeStatesWithNoListeners, 0);
    }
  }, []);

  // call listeners on setState
  function setState() {
    state.listeners.forEach(x => x({ state: state.state }));
  }

  // remove states with no listeners
  function removeStatesWithNoListeners() {
    for (let key in ns) {
      !ns[key].listeners.length && delete ns[key];
    }
  }

  // proxy objects and arrays
  const makeProxy =
    makeProxyFactory(stateName, state, setState, bind, debugLog);

  // proxied state
  const proxiedState = makeProxy(state.state);

  // return the state as a proxy
  return proxiedState;
}