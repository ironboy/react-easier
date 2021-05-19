let a = [], token = {};
a.__token = token;
['pop', 'push', 'shift', 'unshift', 'splice', 'reverse', 'sort'].forEach(method => {
  const orgMethod = a[method];
  a[method] = function (...args) {
    let t = args[0] === token;
    t && (args = args.slice(1));
    let result = orgMethod.apply(this, args);
    !t && (this._state[this._key] = [...this]);
    return result;
  }
});

export default function ArrayExtend(state, key, arr) {
  if (!(arr instanceof Array) || arr.__token === token) { return arr; }
  let b = Object.create(a);
  b._state = state;
  b._key = key;
  let c = Object.create(b);
  c.push(token, ...arr);
  return c;
}