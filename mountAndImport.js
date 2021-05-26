export default async function mountAndImport({ rootSelector, imports }) {

  // Make imports global (including every named export)
  let label = '';
  for (let i of await Promise.all(imports)) {
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

  // Mount the App component in the #root div
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.querySelector(rootSelector)
  );

}

start();