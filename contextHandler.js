import React, { useContext, useDebugValue } from 'react';
import useStates from './useStates';

const allContexts = {};

function useContextLabel(x) { useDebugValue(x) }

export const withContext = (contextName, contextData, SubComponent) => {
  return function WithContext(p) {
    let TheContext = allContexts[contextName];
    if (!TheContext) {
      TheContext = React.createContext();
      allContexts[contextName] = TheContext;
    }
    let contextValue = useStates(contextData);
    useContextLabel(contextName);
    return React.createElement(
      TheContext.Provider,
      { value: contextValue },
      React.createElement(SubComponent, { ...p })
    );
  }
}

export const useNamedContext = contextName => {
  return useContext(allContexts[contextName]) || {};
}