export function prevent(func) {
  return (...args) => {
    args[0].preventDefault
      && args[0].preventDefault();
    return func(...args);
  }
}