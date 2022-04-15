import withLoop from './withLoop.js';
import { withContext } from './contextHandler.js';

globalThis.withLoop = withLoop;
globalThis.withContext = withContext;

export default async function importAndStart({ rootSelector, globalImports, component }) {
  // Make imports global (including every named export)
  let label = '';
  for (let i of await Promise.all(globalImports)) {
    if (typeof i == 'string') {
      let j = i.replace(/\sas\s/g, ':');
      if (i !== j) {
        let [org, as] = j.split(':');
        globalThis[as] = globalThis[org];
        delete globalThis[org];
      }
      else {
        label = i;
      }
      continue;
    }
    for (let k in i) { globalThis[k] = i[k]; }
    globalThis[label] = i.default;
    label = '';
  }

  // Mount the root component
  component = (await component()).default;

  let toMount = React.createElement(
    React.StrictMode, null,
    React.createElement(component, null)
  );

  let rootEl = document.querySelector('#root');

  let { warn, error } = console;
  console.warn = console.error = () => { };

  parseInt(React.version) >= 18 ?
    ReactDOM.createRoot(rootEl).render(toMount) :
    ReactDOM.render(toMount, rootEl);

  console.warn = warn;
  console.error = error;
}