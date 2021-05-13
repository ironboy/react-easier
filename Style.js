import React from 'react';

const hashNames = [];

const styleEl = document.createElement('style');
styleEl.className = 'react-scoped-styles';
document.head.append(styleEl);

class StyleWrapper extends HTMLElement { }
customElements.define('style-wrapper', StyleWrapper, { extends: 'span' });

const hash = x => x.split('').reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0);

function cssNester(css, nestWith) {
  let kframes = [];
  css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
  css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
  return '/*' + nestWith + '*/\n' + css.replace(/__keyframes__/g, x => kframes.shift());
}

export default function Style(props) {
  let { css } = props, _hash = 'style-' + hash(css);
  if (!hashNames.includes(_hash)) {
    hashNames.push(_hash);
    styleEl.append(document.createTextNode(cssNester(css, '#' + _hash)));
  }
  return React.createElement(
    'style-wrapper', { id: _hash }, props.children
  );
}