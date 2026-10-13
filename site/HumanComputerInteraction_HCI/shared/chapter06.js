// Source-case comparison; the complete explanations remain readable without JavaScript.
(() => {
  const buttons = [...document.querySelectorAll('[data-stakeholder]')];
  const panels = [...document.querySelectorAll('[data-stakeholder-panel]')];
  if (!buttons.length) return;
  const select = (key) => {
    buttons.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.stakeholder === key)),
    );
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.stakeholderPanel !== key;
    });
  };
  buttons.forEach((button) =>
    button.addEventListener('click', () => select(button.dataset.stakeholder)),
  );
  select(buttons[0].dataset.stakeholder);
  let printSelection = null;
  window.addEventListener('beforeprint', () => {
    if (printSelection !== null) return;
    printSelection = buttons.find((button) => button.getAttribute('aria-pressed') === 'true')
      .dataset.stakeholder;
    panels.forEach((panel) => {
      panel.hidden = false;
    });
  });
  window.addEventListener('afterprint', () => {
    if (printSelection === null) return;
    select(printSelection);
    printSelection = null;
  });
})();
