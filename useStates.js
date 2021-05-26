import { useState } from 'react';

export default function useStates(obj) {
  // recursive proxy handler
  const handler = {
    get(target, key) {
      if (key === 'bind') {
        return (key, valueCheck) => {
          return valueCheck === undefined ? {
            name: key,
            value: target[key],
            onChange: e => {
              target[key] = e.target.value;
              changer();
            }
          } : { // radio buttons etc...
            name: key,
            value: valueCheck + '',
            checked: valueCheck === target[key],
            onChange: e => {
              target[key] = valueCheck + '' === e.target.value && valueCheck;
              changer();
            }
          }
        }
      }
      if (key === '__isProxy') { return true; }
      const prop = target[key];
      if (prop && !prop.__isProxy && typeof prop === 'object') {
        target[key] = new Proxy(prop, handler);
      }
      return Reflect.get(target, key);
    },
    set(...args) {
      changer();
      return Reflect.set(...args);
    },
    deleteProperty(...args) {
      changer();
      return Reflect.deleteProperty(...args);
    }
  };

  const changer = () => setter(new Proxy(obj, handler));
  let [val, setter] = useState(new Proxy(obj, handler));
  return val;
}