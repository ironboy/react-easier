import React, { useState } from 'react';
import cssNester from './cssNester.js';

let mem = [], writeRulesTimeout, keyCo = 1, fontsToWaitFor = 0;

const sleep = ms => new Promise(res => setTimeout(res, ms));

createStyleTag({ i: 0, text: 'body {opacity: 0}' });

export function css(text, ...args) {
  text = text.map((x, i) => x + (i < args.length ? args[i] : '')).join('');
  !mem.includes(text) && mem.push(text);
  return React.createElement(Css, {
    key: keyCo++,
    index: mem.indexOf(text)
  });
}

css.waitForFonts = x => fontsToWaitFor = x;

function Css(props) {
  const { index } = props;
  const [done, setDone] = useState(false);
  function fix(e) {
    let p = e.target.parentNode;
    let a = [...p.querySelectorAll('[data-index]')].filter(x => x.parentNode === p);
    a = a.map(x => +x.getAttribute('data-index'));
    p.setAttribute('css', a.join(' '));
    clearTimeout(writeRulesTimeout);
    writeRulesTimeout = setTimeout(writeRules, 0);
    setDone(true);
  }
  return done ? React.createElement(React.Fragment) :
    React.createElement('img', {
      src: '#',
      'data-index': index,
      style: { display: 'none' },
      onError: fix
    });
}

function makeCssPart(css, prefixer) {
  return cssNester(css, prefixer);
}

function writeRules() {
  rulesPrune();
  // find depths of elements with the css attribute
  let depths = [...document.querySelectorAll('[css]')].map(x => {
    let p = x, depth = 0;
    while (p = p.parentElement) { depth++; }
    return {
      depth,
      indexes: x.getAttribute('css').split(' ').map(x => +x)
    }
  });
  // could be problematic if same css text in different components
  let depthByIndex = {};
  depths.forEach(x => x.indexes.map(i => depthByIndex[i] = x.depth));
  let rules = mem.map((x, i) => ({
    i,
    text: x ?
      makeCssPart(x, `[css~="${i}"]`) + '\n' : ''
  }))
    .sort((a, b) => (depthByIndex[a.i] || 0) - (depthByIndex[b.i] || 0));
  // create style tags
  removeStyleTags();
  rules.forEach(x => createStyleTag(x));
}

function rulesPrune() {
  let inDom = [...new Set([...document.querySelectorAll('[css]')].map(x =>
    x.getAttribute('css').split(' ').map(x => +x)).flat())];
  mem = mem.map((x, i) => inDom.includes(i) ? x : '');
}

function createStyleTag(x) {
  if (!x.text) { return; }
  let styleEl = document.createElement('style');
  styleEl.setAttribute('react-easier', x.i);
  styleEl.append(document.createTextNode(x.text));
  document.querySelector('head').append(styleEl);
}

async function removeStyleTags() {
  [...document.querySelectorAll('style[react-easier]')]
    .forEach(x => x.setAttribute('to-remove', ''));
  // wait for fonts
  let waited = 0;
  while (getFonts().length < fontsToWaitFor) {
    waited++;
    await sleep(10);
  }
  waited > 5 && await sleep(500);
  // wait (so new style tags can be written before removing old ones)
  setTimeout(() => {
    [...document.querySelectorAll('style[react-easier][to-remove]')]
      .forEach(x => x.remove());
  }, 0);
}

function getFonts() {
  let fonts = [];
  document.fonts.forEach((({ family, style, weight, loaded }) =>
    loaded && fonts.push([family, style, weight].join(' '))));
  return [...new Set(fonts)];
}

// make loadedFonts reachable for end dev
Object.defineProperty(
  window,
  "loadedFonts",
  {
    get() { return getFonts() },
    configurable: false
  }
);