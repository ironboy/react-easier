import { stack } from './stack';

export function bind(obj, name, value = obj[name], altValue) {
  // if debug, then remember the stack at call to to bind
  // since this let us report the place where bind is called
  // when it onChange triggers
  let stackAtCall = window.___debugStates___ && stack(true);

  // return necessary properties for an input element
  // that will bind it to a state property
  return {
    name,
    value,
    checked: obj[name] === value,
    onChange: ({ target: t }) => {
      stackAtCall && (window.___lastBindChange___ = stackAtCall);
      return t.type === 'checkbox' ?
        obj[name] = t.checked ? value : altValue :
        obj[name] = t.type === 'number' ?
          (isNaN(+t.value) ? t.value : +t.value) : t.value
    }
  }
}