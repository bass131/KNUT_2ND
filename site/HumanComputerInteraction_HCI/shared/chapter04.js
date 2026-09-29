/* Chapter-specific learning cases; shared study behavior stays in course.js. */
(() => {
  const buttons = [...document.querySelectorAll('[data-usability]')];
  const panels = [...document.querySelectorAll('[data-usability-panel]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = button.dataset.usability;
      for (const item of buttons) {
        item.setAttribute('aria-pressed', String(item === button));
      }
      for (const panel of panels) {
        panel.hidden = panel.dataset.usabilityPanel !== selected;
      }
    });
  }
})();
