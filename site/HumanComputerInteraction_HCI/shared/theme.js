/* Apply before styles load so saved dark mode does not flash a light page. */
(() => {
  'use strict';
  const root = document.documentElement,
    key = 'hci-study-theme-v1',
    system = matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  function apply(theme) {
    root.dataset.theme = theme;
    const button = document.getElementById('theme-toggle');
    if (button) {
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
      button.innerHTML = dark
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14A8.6 8.6 0 0 1 10 3.5 8.7 8.7 0 1 0 20.5 14Z"/></svg>';
    }
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', (e) => {
    if (!preference) apply(e.matches ? 'dark' : 'light');
  });
  addEventListener('storage', (e) => {
    if (e.key === key) {
      preference = ['light', 'dark'].includes(e.newValue) ? e.newValue : null;
      apply(preference || (system.matches ? 'dark' : 'light'));
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const host =
      document.querySelector('.top-actions') || document.querySelector('.home-header nav');
    if (!host) return;
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', '다크 모드');
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(key, preference);
      } catch {}
      apply(preference);
    });
    host.append(button);
    apply(root.dataset.theme);
  });
})();
