import { useEffect } from 'react';

export function useOnMount(func) {
  const funcWrapped = function () {
    (async () => {
      func();
    })();
  }
  useEffect(funcWrapped, []);
}

export function useOnCleanup(func) {
  const funcWrapped = function () {
    (async () => {
      func();
    })();
  }
  useEffect(() => funcWrapped, []);
}