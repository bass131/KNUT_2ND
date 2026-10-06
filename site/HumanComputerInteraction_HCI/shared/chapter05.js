/* Chapter-specific learning cases; shared study behavior stays in course.js. */
(() => {
  const demo = document.querySelector('[data-risk-demo]');
  const matrix = demo?.querySelector('.risk-matrix');
  const result = document.getElementById('risk-result');
  if (!demo || !matrix || !result) return;
  // Korean source labels; language.js translates the resulting sentence after it is written.
  const severityLabels = ['사소한', '경미한', '상당한', '중대한', '치명적'];
  const likelihoodLabels = ['매우 높음', '높음', '보통', '낮음', '매우 낮음'];
  const update = () => {
    const severity = demo.querySelector('input[name="risk-severity"]:checked');
    const likelihood = demo.querySelector('input[name="risk-likelihood"]:checked');
    if (!severity || !likelihood) return;
    let grade = '';
    for (const cell of matrix.querySelectorAll('td[data-row]')) {
      const hit = cell.dataset.row === likelihood.value && cell.dataset.col === severity.value;
      cell.classList.toggle('is-selected', hit);
      if (hit) grade = cell.textContent.trim();
    }
    result.textContent = `선택: ${severityLabels[severity.value]} · ${likelihoodLabels[likelihood.value]} → ${grade}등급`;
  };
  demo.addEventListener('change', update);
  update();
})();
