// some safe guarding so we don't trigger a lot of stack traces
// in 'production mode' / when debug is off

// call this function for logs (it will do nothing if debug is off)
export function stack(findBind) {
  return window.___debugStates___ && _stack(findBind);
}

// call this function for errors (it will work even if debug is off)
export function errorStack() {
  return _stack();
}

function _stack(findBind) {

  // get the stack
  let stack = new Error().stack.toString().split('\n');

  // but only the part of the stack that is outside of react /react-dom
  let indexOfReact = stack.findIndex(x => x.includes('react-dom'));
  stack = stack.slice(0, indexOfReact);

  // if findBind look for next none this library thing after bindStatesToForm
  if (findBind) {
    let index = stack.findIndex(x => x.includes('bindStatesToForm'));
    if (index >= 0) {
      let thisLib = stack[index].split('http')[1].split('bindStatesToForm')[0];
      while (stack[index + 1] && stack[index + 1].includes(thisLib)) { index++; }
      stack = stack.slice(0, index + 2);
    }
  }

  // parse the stack to get url, line and column of file
  let last = stack.slice(-1)[0];
  let endIndex = Math.max(...['?', '.jsx', 'js']
    .map(x => last.lastIndexOf(x) + (x.length < 2 ? 0 : x.length)));
  let url = last.slice(last.indexOf('http'), endIndex);
  let [line, column] = last.split(':').slice(-2).map(x => parseInt(x));

  // add the extra props to the stack array, then return
  Object.assign(stack, { last, url, line, column })
  return stack;
}