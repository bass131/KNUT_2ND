/* Shared learning behavior. Page demonstrations live in chapterNN.js. */
(() => {
  'use strict';

  function initializeNavigation() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    if (!sidebar || !toggle) return;
    const mobile = matchMedia('(max-width:820px)');
    function setMenu(open, returnFocus = false) {
      document.body.classList.toggle('sidebar-closed', !open);
      sidebar.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '목차 닫기' : '목차 열기');
      if (returnFocus) toggle.focus();
    }
    setMenu(!mobile.matches);
    toggle.addEventListener('click', () => setMenu(sidebar.inert));
    mobile.addEventListener('change', () => setMenu(!mobile.matches));
    document.getElementById('scrim').addEventListener('click', () => setMenu(false, true));
    addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !sidebar.inert) setMenu(false, true);
    });
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    const sections = links.map((link) => document.querySelector(link.hash));
    const offset = Number(document.body.dataset.readingOffset || 155);
    links.forEach((link) =>
      link.addEventListener('click', () => {
        if (mobile.matches) setMenu(false, true);
      }),
    );
    let queued = false;
    function updateProgress() {
      const maximum = document.documentElement.scrollHeight - innerHeight;
      const percent =
        maximum > 0 ? Math.round(Math.max(0, Math.min(100, (scrollY / maximum) * 100))) : 100;
      document.getElementById('progress-text').textContent = percent + '%';
      document.getElementById('progress-fill').style.width = percent + '%';
      document.getElementById('top-progress').style.width = percent + '%';
      let active = 0;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= offset) active = index;
      });
      if (maximum - scrollY < 5) active = links.length - 1;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      queued = false;
    }
    function queueProgress() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(updateProgress);
    }
    addEventListener('scroll', queueProgress, { passive: true });
    addEventListener('resize', queueProgress);
    new ResizeObserver(queueProgress).observe(document.querySelector('main'));
    updateProgress();
  }

  function initializeRecall() {
    const answers = [...document.querySelectorAll('.recall-list details')];
    const count = document.getElementById('recall-count');
    function updateCount() {
      if (count)
        count.textContent =
          answers.filter((answer) => answer.open).length + ' / ' + answers.length + ' 확인';
    }
    answers.forEach((answer) => answer.addEventListener('toggle', updateCount));
    for (const [id, open] of [
      ['expand-all', true],
      ['collapse-all', false],
    ]) {
      document.getElementById(id)?.addEventListener('click', () => {
        answers.forEach((answer) => (answer.open = open));
        updateCount();
      });
    }
    updateCount();
    return updateCount;
  }

  function initializeGlossary() {
    const search = document.getElementById('term-search');
    const terms = [...document.querySelectorAll('.glossary > div')];
    function filter() {
      if (!search) return;
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      terms.forEach((term) => {
        term.hidden = !term.textContent.toLocaleLowerCase().includes(query);
        if (!term.hidden) count++;
      });
      const label = search.dataset.countLabel || '개 용어';
      document.getElementById('term-count').textContent =
        count + label + ' / 전체 ' + terms.length + '개';
      document.getElementById('no-terms').hidden = count !== 0;
    }
    search?.addEventListener('input', filter);
    filter();
    return { search, filter };
  }

  function initializeQuiz() {
    const quiz = document.getElementById('quiz-form');
    if (!quiz) return;
    const questions = [...quiz.querySelectorAll('.quiz')];
    const score = document.getElementById('quiz-score');
    quiz.addEventListener('submit', (event) => {
      event.preventDefault();
      let correct = 0;
      let answered = 0;
      questions.forEach((question) => {
        const choice = question.querySelector('input:checked');
        const ok = choice?.value === question.dataset.answer;
        const result = question.querySelector('.quiz-result');
        if (choice) answered++;
        if (ok) correct++;
        let explanation = question.dataset.explanation;
        if (quiz.dataset.answerLabel === 'true') {
          const answer = [...question.querySelectorAll('input')].find(
            (input) => input.value === question.dataset.answer,
          );
          explanation = '정답: ' + answer.parentElement.textContent.trim() + ' — ' + explanation;
        }
        result.hidden = false;
        result.textContent =
          (ok
            ? '정답입니다. '
            : choice
              ? '다시 확인해 보세요. '
              : '아직 답을 선택하지 않았습니다. ') + explanation;
      });
      score.textContent = correct + ' / ' + questions.length + ' 정답 · ' + answered + '문항 응답';
    });
    function clearFeedback(message = '') {
      questions.forEach((question) => (question.querySelector('.quiz-result').hidden = true));
      score.textContent = message;
    }
    quiz.addEventListener('reset', () => clearFeedback());
    quiz.addEventListener('change', () => clearFeedback(quiz.dataset.changeMessage || ''));
  }

  function initializePrint({ search, filter }, updateCount) {
    let state = null;
    addEventListener('beforeprint', () => {
      // Browsers may emit beforeprint more than once for the same preview.
      if (state) return;
      state = {
        details: [...document.querySelectorAll('details')].map((detail) => [detail, detail.open]),
        query: search?.value,
      };
      state.details.forEach(([detail]) => (detail.open = true));
      if (search) {
        search.value = '';
        filter();
      }
      updateCount();
    });
    addEventListener('afterprint', () => {
      if (!state) return;
      state.details.forEach(([detail, open]) => (detail.open = open));
      if (search) {
        search.value = state.query;
        filter();
      }
      state = null;
      updateCount();
    });
    document.getElementById('print-button')?.addEventListener('click', () => print());
  }

  initializeNavigation();
  const updateCount = initializeRecall();
  const glossary = initializeGlossary();
  initializeQuiz();
  initializePrint(glossary, updateCount);
})();
