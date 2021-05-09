import { useState, useDebugValue } from 'react';

const statesProto = {
  bind(key) {
    return {
      name: key, value: this[key],
      onChange: e => this[key] = e.target.value
    }
  }
};

function useStateLabel(x) { useDebugValue(x) }

export default function useStates(data) {
  let states = Object.create(statesProto);
  for (let [key, val] of Object.entries(data)) {
    useStateLabel(key);
    const [state, setter] = useState(val);
    Object.defineProperty(states, key, {
      get: () => state,
      set: (x) => setter(x)
    });
  }
  return states;
}