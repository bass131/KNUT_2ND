/* Keep a sentence together when it fits a line; longer sentences wrap normally. */
(() => {
  'use strict';
  const selector = 'p,dd,td,li,.answer,.quiz-result,.note,.comparison-tip,.termline';
  const processed = new WeakMap();
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
        (/[A-Za-z]/.test(text[i - 1] || '') ||
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
  function wrap(element) {
    if (
      element.closest('.toc,.source-list,.evidence,button,summary,svg,pre,code') ||
      element.querySelector('p,ul,ol,dl,div,br,button,input')
    )
      return;
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
      range.setStart(a, ai);
      range.setEnd(b, bi);
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
      targets.forEach(wrap);
      observer.observe(main, { childList: true, characterData: true, subtree: true });
    });
    main.querySelectorAll(selector).forEach(wrap);
    observer.observe(main, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
