export function useDebug(debug = true, includeGet = false) {
  try {
    if (import.meta.env.MODE === 'production') { return; }
  } catch (e) { }
  window.___debugStates___ = debug;
  window.___debugStatesIncludeGet___ = includeGet;
}