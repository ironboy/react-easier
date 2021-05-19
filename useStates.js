import { useState, useDebugValue } from 'react';
import ArrayExtend from './ArrayExtend.js';

const statesProto = {
  bind(key, valueCheck) {
    return valueCheck === undefined ? {
      name: key,
      value: this[key],
      onChange: e => this[key] = e.target.value
    } : { // radio buttons etc...
      name: key,
      value: valueCheck + '',
      checked: valueCheck === this[key],
      onChange: e => {
        this[key] = valueCheck + '' === e.target.value && valueCheck;
      }
    }
  }
};

function useStateLabel(x) { useDebugValue(x) }

export default function useStates(data) {
  let states = Object.create(statesProto);
  for (let [key, val] of Object.entries(data)) {
    useStateLabel(key);
    const [state, setter] = useState(ArrayExtend(state, key, val));
    Object.defineProperty(states, key, {
      get: () => state,
      set: (x) => setter(ArrayExtend(state, key, x))
    });
  }
  return states;
}