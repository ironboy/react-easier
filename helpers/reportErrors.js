import { errorStack } from './stack';
import { consoleSrcMapped } from './consoleSrcMapped';

export function reportErrors(title, errors = []) {

  // remove empty string etc.
  errors = errors.filter(x => x);

  // if we have errors
  if (errors.length > 0) {

    // viewport output
    let message = `${title} error:\n\n${errors.join('\n')}`;
    let style = document.createElement('style');
    style.innerHTML = styling();
    document.querySelector('head').append(style);
    document.body.innerHTML = `<pre style>${message}`
      + `\n\n(see the console for the source of this error)`
      + `\n\n<a href="/">Reload once you've fixed it</a></pre>`;

    // silence further output in the console
    Object.keys(console).forEach(x => console[x] = () => { });

    // console output
    let { url, line, column } = errorStack();
    consoleSrcMapped(errorStack, 'error', [message], 100);
  }
  else {
    // if no errors then return true
    return true;
  }
}

// styling for the viewport output
function styling() {
  return `
    body { 
      background-color: black;
      color: white;
    }
    pre {
      margin: 0 auto;
      padding: 40px;
      width: 80%;
      font-size: 150%;
      white-space: pre-wrap;
      background-color: white;
      color: #a62121;
      border: 3px solid #a62121;
      margin-top: 100px;
    }
    pre::after {
      display: block;
      margin-top: 20px;
    }
    pre a {
      display: block;
      float: right;
    }
  `;
}