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

function _stack() {

  // get the stack
  let stack = new Error().stack.toString().split('\n');

  // get the first file in the src folder
  let lookFor = [...location.href.split('/').slice(0, 3), 'src'].join('/');
  let indexOfFile = stack.findIndex(x => x.includes(lookFor));
  stack = stack.slice(0, indexOfFile + 1);

  // parse the stack to get url, line and column of file
  let last = stack.slice(-1)[0];
  if (last) {
    let endIndex = Math.max(...['?', '.jsx', 'js']
      .map(x => {
        return last && last.lastIndexOf(x) + (x.length < 2 ? 0 : x.length)
      }));
    let url = last.slice(last.indexOf('http'), endIndex);
    let [line, column] = last.split(':').slice(-2).map(x => parseInt(x));

    // add the extra props to the stack array, then return
    Object.assign(stack, { last, url, line, column })
  }
  return stack;
}