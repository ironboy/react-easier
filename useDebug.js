export function useDebug(debug = true, includeGet = false) {
  window.___debugStates___ = debug;
  window.___debugStatesIncludeGet___ = includeGet;
}