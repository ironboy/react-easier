import { isValidElement } from "react";
import { reportErrors } from './helpers/reportErrors';

export function useAutoKeys(
  possibleKeys = ['_id', 'id', /.*Id$/, /.*_id$/],
  useIndexIfNoMatchingKey = true
) {

  // short hand variable names
  let [ap, pKeys, useIndex] =
    [Array.prototype, possibleKeys, useIndexIfNoMatchingKey];

  // don't do anything if we have already applied useAutoKey before
  if (ap._mapOriginal_) { return; }

  // check for errors in arguments
  if (!reportErrors('useAutoKeys', [
    !(pKeys instanceof Array &&
      pKeys.every(x => x && (typeof x === 'string' || x instanceof RegExp)))
    && 'possibleKeys must be an array of non-empty strings and/or regexps',
    pKeys.length === 0 && !useIndex
    && 'if no possibleKeys, then useIndexIfNoMatchingKey must be true'
  ])) { return; }

  //  save original array map method as Array.prototype._mapOriginal_
  let orgMap = ap._mapOriginal_ = ap.map;

  // declare new mapping method
  ap.map = function (...args) {

    // apply original mapping method
    let result = orgMap.apply(this, args);

    // if result is  empty or not an array of react elements then return
    if (!result.length || !result.every(x => isValidElement(x))) {
      return result;
    }

    // get keys/id:s - only look at first item, since we expect
    // all items to have the same properties and property order
    // (find the first key matches one of the props)
    let keyToUse, obj = this[0];
    matchLoop: for (let key of Object.keys(obj || {})) {
      for (let pKey of pKeys) {
        keyToUse = (key === pKey || pKey.test && pKey.test(key)) && key;
        if (keyToUse) { break matchLoop; }
      }
    }

    // create an array of key values
    let keyValues = orgMap.call(this, (x, i) =>
      keyToUse ? x[keyToUse] : useIndex ? i : undefined);

    // patch result with key values (if there is not manually set key)
    return orgMap.call(result, (x, i) =>
      x.key !== null || keyValues[i] === undefined ?
        x : ({ ...x, key: keyValues[i] }));
  };
}