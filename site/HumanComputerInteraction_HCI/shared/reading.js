/* Keep a sentence together when it fits a line; longer sentences wrap normally. */
(() => {
  'use strict';
  const selector = 'p,dd,td,li,.answer,.quiz-result,.note,.comparison-tip,.termline';
  const processed = new WeakMap();
  // Keep authored Korean markup before Range creates new text nodes. Restoring
  // these small, non-interactive blocks makes language switches lossless.
  const sourceMarkup = new Map();
  function eligible(element) {
    return !(
      element.closest('.toc,.source-list,.evidence,button,summary,svg,pre,code') ||
      element.querySelector('p,ul,ol,dl,div,br,button,input')
    );
  }
  function sentenceRanges(text) {
    const ranges = [],
      stack = [];
    let start = 0;
    const pairs = { '(': ')', '[': ']', '“': '”', '‘': '’', '「': '」', '『': '』' };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (pairs[c]) {
        stack.push(pairs[c]);
        continue;
      }
      if (stack.at(-1) === c) {
        stack.pop();
        continue;
      }
      if (stack.length || !'.!?。！？'.includes(c)) continue;
      // Decimal values, HCI 3.0, page references (p./pp.) and English initials.
      if (
        c === '.' &&
        (/(?:\b(?:p|pp|Dr|Mr|Ms|Mrs|Prof|vs|etc)|\b[A-Z]|\b[ei]\.[eg])$/.test(text.slice(0, i)) ||
          (/\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '')))
      )
        continue;
      let end = i + 1;
      while (/[”’"')\]]/.test(text[end] || '\u0000')) end++;
      if (end < text.length && !/\s/.test(text[end])) continue;
      ranges.push([start, end]);
      start = end;
    }
    if (start < text.length) ranges.push([start, text.length]);
    return ranges
      .map(([a, b]) => {
        while (a < b && /\s/.test(text[a])) a++;
        while (b > a && /\s/.test(text[b - 1])) b--;
        return [a, b];
      })
      .filter(([a, b]) => a < b);
  }
  function point(element, index) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node, last;
    while ((node = walker.nextNode())) {
      last = node;
      if (index <= node.length) return [node, index];
      index -= node.length;
    }
    return [last, last?.length || 0];
  }
  function boundary(element, node, offset, end) {
    // Include a fully selected inline element itself. Ending a Range inside
    // its final text node would otherwise leave an empty, focusable link behind.
    if (node.nodeType === Node.TEXT_NODE) {
      if (!end && !node.data.slice(0, offset).trim()) offset = 0;
      if (end && !node.data.slice(offset).trim()) offset = node.length;
    }
    while (node !== element) {
      const length = node.nodeType === Node.TEXT_NODE ? node.length : node.childNodes.length;
      if (offset !== 0 && offset !== length) break;
      const after = offset === length && (length !== 0 || end);
      const parent = node.parentNode;
      offset = [...parent.childNodes].indexOf(node) + Number(after);
      node = parent;
    }
    return [node, offset];
  }
  function wrap(element) {
    if (!eligible(element)) return;
    const text = element.textContent;
    if (!text.trim() || processed.get(element) === text) return;
    element
      .querySelectorAll('.reading-sentence')
      .forEach((span) => span.replaceWith(...span.childNodes));
    element.normalize();
    for (const [start, end] of sentenceRanges(text).reverse()) {
      const [a, ai] = point(element, start),
        [b, bi] = point(element, end);
      if (!a || !b) continue;
      const range = document.createRange();
      range.setStart(...boundary(element, a, ai, false));
      range.setEnd(...boundary(element, b, bi, true));
      const span = document.createElement('span');
      span.className = 'reading-sentence';
      span.append(range.extractContents());
      range.insertNode(span);
    }
    processed.set(element, text);
  }
  function start() {
    const main = document.querySelector('main');
    if (!main) return;
    const observe = () =>
      observer.observe(main, { childList: true, characterData: true, subtree: true });
    const remember = (element) => {
      if (!eligible(element)) return;
      element.querySelectorAll('.reading-sentence').forEach((span) => {
        span.replaceWith(...span.childNodes);
      });
      element.normalize();
      sourceMarkup.set(element, element.innerHTML);
    };
    main.querySelectorAll(selector).forEach(remember);
    const observer = new MutationObserver((records) => {
      observer.disconnect();
      const targets = new Set();
      records.forEach((record) => {
        const e =
          record.target.nodeType === Node.ELEMENT_NODE
            ? record.target
            : record.target.parentElement;
        const parent = e?.closest(selector);
        if (parent && main.contains(parent)) targets.add(parent);
        record.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) {
            if (n.matches(selector)) targets.add(n);
            n.querySelectorAll(selector).forEach((el) => targets.add(el));
          }
        });
      });
      // This observer is installed before the language runtime. A demonstration
      // therefore reaches us in its authored language before it is translated.
      targets.forEach((element) => {
        if (processed.get(element) !== element.textContent) remember(element);
      });
      window.KnutLanguage?.refresh();
      targets.forEach(wrap);
      observe();
    });
    document.addEventListener('knut:beforelanguagechange', () => {
      observer.disconnect();
      window.KnutLanguage.restore();
      sourceMarkup.forEach((markup, element) => {
        if (!element.isConnected) return;
        element.innerHTML = markup;
        processed.delete(element);
      });
    });
    const render = () => {
      observer.disconnect();
      main.querySelectorAll(selector).forEach(wrap);
      observe();
    };
    document.addEventListener('knut:languagechange', render);
    observe();
    // Defer initial wrapping until all deferred scripts have initialized. The
    // language runtime must first see complete authored text nodes.
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.KnutLanguage) render();
    });
    if (document.readyState === 'complete') render();
  }
  start();
})();
