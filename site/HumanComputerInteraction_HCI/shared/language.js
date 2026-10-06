(() => {
  'use strict';
  if (window.KnutLanguage) return;
  const dictionary = window.KNUT_TRANSLATIONS || {};
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const translations = dictionary.text || {};
  const patterns = (dictionary.patterns || []).map((entry) => ({
    expression: new RegExp(entry.pattern, entry.flags || ''),
    replacement: entry.replacement,
  }));
  const ignored = 'script,style,code,kbd,samp,textarea,[translate="no"],[data-no-translate]';
  const isIgnored = (element) =>
    element.closest(ignored) ||
    (element.closest('pre') && !element.closest('button,[translate="yes"]'));
  const attributes = [
    'title',
    'alt',
    'aria-label',
    'aria-description',
    'placeholder',
    'data-label',
  ];
  const originals = new WeakMap();
  const originalAttributes = new WeakMap();
  // English is the default; Korean (the authored DOM) is shown when chosen.
  let language = 'en';
  let explicit = false;
  try {
    const stored = localStorage.getItem('knut-language');
    if (stored === 'ko' || stored === 'en') {
      language = stored;
      explicit = true;
    }
  } catch {
    /* Storage is optional for local learning pages. */
  }
  const requested = new URL(location.href).searchParams.get('lang');
  if (requested === 'ko' || requested === 'en') {
    language = requested;
    explicit = true;
  }
  const english = (text) => {
    const key = normalize(text);
    let translated = Object.prototype.hasOwnProperty.call(translations, key)
      ? translations[key]
      : null;
    if (translated === null) {
      for (const { expression, replacement } of patterns) {
        expression.lastIndex = 0;
        if (expression.test(key)) {
          expression.lastIndex = 0;
          translated = key.replace(expression, replacement);
          break;
        }
      }
    }
    if (translated === null) return text;
    return text.match(/^\s*/)[0] + translated + text.match(/\s*$/)[0];
  };
  const translate = (text) => (language === 'en' ? english(String(text)) : String(text));
  const processText = (node) => {
    if (!node.parentElement || isIgnored(node.parentElement)) return;
    const current = node.nodeValue;
    if (!current.trim()) return;
    let state = originals.get(node);
    if (!state || current !== state.applied) state = { original: current, applied: current };
    const next = translate(state.original);
    state.applied = next;
    originals.set(node, state);
    if (current !== next) node.nodeValue = next;
  };
  const processAttributes = (element) => {
    if (isIgnored(element)) return;
    let states = originalAttributes.get(element);
    if (!states) {
      states = {};
      originalAttributes.set(element, states);
    }
    for (const name of attributes) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name);
      let state = states[name];
      if (!state || current !== state.applied) state = { original: current, applied: current };
      const next = translate(state.original);
      state.applied = next;
      states[name] = state;
      if (current !== next) element.setAttribute(name, next);
    }
  };
  const visit = (root) => {
    if (root.nodeType === Node.TEXT_NODE) return processText(root);
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && root.closest(ignored)) return;
    if (root.nodeType === Node.ELEMENT_NODE) processAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches(ignored))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === Node.TEXT_NODE) processText(walker.currentNode);
      else processAttributes(walker.currentNode);
    }
  };
  let controls;
  const refresh = () => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    visit(document.head);
    visit(document.body);
    if (controls) {
      controls.querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
      });
    }
  };
  const updateAddress = (value) => {
    try {
      const url = new URL(location.href);
      url.searchParams.set('lang', value);
      history.replaceState(history.state, '', url);
    } catch {
      /* Some file viewers do not allow history changes. */
    }
  };
  const setLanguage = (next) => {
    if (next !== 'ko' && next !== 'en') return;
    document.dispatchEvent(
      new CustomEvent('knut:beforelanguagechange', {
        detail: { language: next, previousLanguage: language },
      }),
    );
    language = next;
    explicit = true;
    updateAddress(next);
    try {
      localStorage.setItem('knut-language', next);
    } catch {
      /* Optional storage. */
    }
    refresh();
    document.dispatchEvent(new CustomEvent('knut:languagechange', { detail: { language } }));
  };
  const restore = () => {
    const previous = language;
    language = 'ko';
    visit(document.head);
    visit(document.body);
    language = previous;
  };
  window.KnutLanguage = {
    translate,
    refresh,
    restore,
    setLanguage,
    get language() {
      return language;
    },
  };
  const start = () => {
    controls = document.createElement('nav');
    controls.className = 'knut-language';
    controls.setAttribute('aria-label', 'Language / 언어 선택');
    controls.setAttribute('data-no-translate', '');
    for (const [value, label] of [
      ['en', 'English'],
      ['ko', '한국어'],
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.lang = value;
      button.dataset.language = value;
      button.textContent = label;
      button.addEventListener('click', () => setLanguage(value));
      controls.append(button);
    }
    const main = document.querySelector('main, .page') || document.body;
    const host = main.querySelector('.content') || main;
    host.prepend(controls);
    refresh();
    const observer = new MutationObserver((records) => {
      const roots = new Set();
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach((node) => roots.add(node));
        else roots.add(record.target);
      }
      for (const node of roots) if (node.isConnected) visit(node);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
    document.addEventListener(
      'click',
      (event) => {
        const link = event.target.closest?.('a[href]');
        if (!explicit || !link || link.hasAttribute('download')) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        const url = new URL(href, location.href);
        if (url.protocol !== location.protocol || url.origin !== location.origin) return;
        if (!/\.html?$|\/$/i.test(url.pathname)) return;
        url.searchParams.set('lang', language);
        link.href = url.href;
        setTimeout(() => {
          if (link.isConnected) link.setAttribute('href', href);
        }, 0);
      },
      true,
    );
    window.addEventListener('storage', (event) => {
      if (event.key === 'knut-language' && ['ko', 'en'].includes(event.newValue)) {
        document.dispatchEvent(
          new CustomEvent('knut:beforelanguagechange', {
            detail: { language: event.newValue, previousLanguage: language },
          }),
        );
        language = event.newValue;
        explicit = true;
        updateAddress(language);
        refresh();
        document.dispatchEvent(new CustomEvent('knut:languagechange', { detail: { language } }));
      }
    });
    document.dispatchEvent(new CustomEvent('knut:languagechange', { detail: { language } }));
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
