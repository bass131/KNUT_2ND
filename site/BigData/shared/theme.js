/* Load before CSS to avoid a bright flash when opening dark mode. */
(() => {
  let theme;
  try {
    theme = localStorage.getItem('bigdata.theme.v1');
  } catch {
    /* Browser storage may be disabled. */
  }
  if (theme !== 'dark' && theme !== 'light')
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
})();
