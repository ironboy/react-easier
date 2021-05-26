import React from 'react';
import cssNester from './cssNester.js';

const hashNames = [];
let styleEl;

const hash = x => x.split('').reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0);

function init() {
  class StyleWrapper extends HTMLElement { }
  customElements.define('style-wrapper', StyleWrapper, { extends: 'span' });
  styleEl = document.createElement('style');
  styleEl.className = 'react-scoped-styles';
  document.head.append(styleEl);
}

function logic(props) {
  let { css, style, template } = props;
  css = css || style || '';
  template = template || props.children;
  styleEl || init();
  let _hash = 'style-' + hash(css);
  if (!hashNames.includes(_hash)) {
    hashNames.push(_hash);
    styleEl.append(document.createTextNode(cssNester(css, '.' + _hash)));
  }
  return React.createElement(
    'style-wrapper', { class: _hash }, template
  );
}

export function Style(props) {
  return logic(props);
}

export function SFC(props) {
  return logic(props);
}

export function SingleFileComponent(props) {
  return logic(props);
}