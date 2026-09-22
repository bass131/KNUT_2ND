/* Entry point: classic deferred scripts keep the site usable directly over file://. */
(() => {
  'use strict';
  const site = globalThis.BigDataCourse;
  const context = {
    root: document.body.dataset.root || './',
    pageId: document.body.dataset.page || 'home',
    chapters: site.chapters,
    store: site.createLearningStore(site.chapters),
    $: (selector, scope = document) => scope.querySelector(selector),
    $$: (selector, scope = document) => [...scope.querySelectorAll(selector)],
    esc: (value) =>
      String(value).replace(
        /[&<>"']/g,
        (character) =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          })[character],
      ),
  };
  context.toast = site.initNavigation(context);
  site.initContent(context);
  site.initVisuals(context);
  document.documentElement.dataset.ready = 'true';
})();
