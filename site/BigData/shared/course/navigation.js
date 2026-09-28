/* Navigation feature; loaded before course.js as a classic deferred script. */
(() => {
  'use strict';
  const site = globalThis.BigDataCourse;
  site.initNavigation = function ({ root, pageId, chapters, store, $, $$, esc }) {
    const { state, save } = store;
    const totalSections = chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0);
    const icons = {
      menu: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M5.5 8h1M5.5 11h1M5.5 14h1"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
      home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5l1.5 1.5M5 19l1.5-1.5M17.5 6.5l1.5-1.5"/>',
      moon: '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
    };
    const icon = (name) =>
      `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
    const mobile = matchMedia('(max-width: 1024px)');
    const currentSections = $$('.lesson-section[data-title]');
    const chapterHref = (id, hash = '') =>
      `${root}chapters/${id}/index.html${hash ? '#' + hash : ''}`;
    const toc = currentSections
      .map(
        (s) =>
          `${s.dataset.group ? `<p class="toc-group">${esc(s.dataset.group)}</p>` : ''}<a class="toc-link" href="#${esc(s.id)}">${esc(s.dataset.title)}</a>`,
      )
      .join('');
    $('#course-shell').innerHTML = `
    <a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
    <header class="site-header">
      <button class="icon-button" id="sidebar-toggle" type="button" aria-label="목차 접기" aria-controls="course-sidebar" aria-expanded="true">${icon('menu')}</button>
      <a class="brand" href="${root}index.html"><span class="brand-mark" aria-hidden="true">B.</span> BigData</a>
      <span class="brand-divider"></span><span class="header-subtitle">Learning Notes</span>
      <div class="header-actions"><span class="header-course">2026 · 빅데이터 프로그래밍</span><button type="button" id="search-open" class="search-button" aria-haspopup="dialog">${icon('search')}<span>강의 내용 찾기</span><kbd>Ctrl K</kbd><span class="sr-only" hidden>검색</span></button><button type="button" id="theme-toggle" class="icon-button theme-toggle" aria-label="다크모드 켜기" aria-pressed="false">${icon('moon')}</button></div>
    </header>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="course-sidebar" aria-label="학습 목차">
      <a class="sidebar-home ${pageId === 'home' ? 'active' : ''}" href="${root}index.html" ${pageId === 'home' ? 'aria-current="page"' : ''}>${icon('home')} 학습 홈</a>
      <p class="sidebar-label">COURSE CHAPTERS</p>
      <nav aria-label="챕터와 섹션">${chapters.map((c) => `<a class="chapter-nav ${pageId === c.id ? 'active' : ''}" href="${chapterHref(c.id)}" ${pageId === c.id ? 'aria-current="page"' : ''}><small>CHAPTER ${c.id}</small>${c.title}</a>${pageId === c.id ? `<div class="toc">${toc}</div>` : ''}`).join('')}${pageId === 'home' ? `<div class="toc">${toc}</div>` : ''}</nav>
      <div class="sidebar-bottom"><div class="sidebar-progress-label"><span>나의 학습 진도</span><span id="total-progress-caption">0 / ${totalSections}</span></div><div class="progress-track" role="progressbar" aria-label="전체 학습 진도" aria-valuemin="0" aria-valuemax="${totalSections}" aria-valuenow="0"><span id="total-progress-bar"></span></div><p class="sidebar-hint" id="storage-hint">이해한 내용을 체크해 보세요.<br>이 브라우저에 진도를 기억해 둘게요.</p><a class="sidebar-sources" href="${root}index.html#materials">실습 파일과 출처 <span aria-hidden="true">↗</span></a></div>
    </aside>
    <dialog class="search-dialog" id="search-dialog" aria-label="강의 섹션 검색"><div class="search-field">${icon('search')}<input id="search-input" type="search" aria-label="검색어" placeholder="예: Driver, 포트, 데이터 흐름" autocomplete="off"><button type="button" class="icon-button" id="search-close" aria-label="검색 닫기">${icon('close')}</button></div><div class="search-results" id="search-results" aria-live="polite"></div><div class="search-shortcut-hint">강의 섹션 제목과 핵심 용어 검색 · Tab으로 결과 이동 · Esc로 닫기</div></dialog>
    <div class="toast" role="status" id="toast" hidden></div><a class="back-to-top" href="#main-content" aria-label="맨 위로 이동" hidden>↑</a>`;
    $('#search-open').setAttribute('aria-label', '강의 내용 검색');
    $('#main-content').setAttribute('tabindex', '-1');
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    let themePreference = null;
    try {
      themePreference = localStorage.getItem('bigdata.theme.v1');
    } catch {
      /* Use the system default. */
    }
    function applyTheme(theme) {
      const dark = theme === 'dark';
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      const button = $('#theme-toggle');
      button.innerHTML = icon(dark ? 'sun' : 'moon');
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? '라이트모드로 전환' : '다크모드로 전환');
      button.title = dark ? '라이트모드로 전환' : '다크모드로 전환';
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.content = dark ? '#151619' : '#f5f5f7';
    }
    applyTheme(document.documentElement.dataset.theme);
    $('#theme-toggle').addEventListener('click', () => {
      themePreference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('bigdata.theme.v1', themePreference);
      } catch {
        /* Keep theme for this page. */
      }
      applyTheme(themePreference);
    });
    systemTheme.addEventListener('change', (e) => {
      if (themePreference !== 'dark' && themePreference !== 'light')
        applyTheme(e.matches ? 'dark' : 'light');
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'bigdata.theme.v1') {
        themePreference = e.newValue;
        applyTheme(
          themePreference === 'dark' || themePreference === 'light'
            ? themePreference
            : systemTheme.matches
              ? 'dark'
              : 'light',
        );
      }
    });

    function syncSidebar() {
      const isOpen = mobile.matches
        ? document.body.classList.contains('sidebar-mobile-open')
        : !state.sidebarCollapsed;
      document.body.classList.toggle(
        'sidebar-collapsed',
        !mobile.matches && state.sidebarCollapsed,
      );
      $('#sidebar-toggle').setAttribute('aria-expanded', String(isOpen));
      $('#sidebar-toggle').setAttribute('aria-label', isOpen ? '목차 접기' : '목차 열기');
      $('#course-sidebar').inert = !isOpen;
      if (mobile.matches && isOpen) $('#main-content').inert = true;
      else $('#main-content').inert = false;
    }
    function closeMobile(returnFocus = false) {
      document.body.classList.remove('sidebar-mobile-open');
      syncSidebar();
      if (returnFocus) $('#sidebar-toggle').focus();
    }
    $('#sidebar-toggle').addEventListener('click', () => {
      if (mobile.matches) document.body.classList.toggle('sidebar-mobile-open');
      else {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        save();
      }
      syncSidebar();
    });
    $('#sidebar-overlay').addEventListener('click', () => closeMobile(true));
    $$('#course-sidebar a').forEach((a) =>
      a.addEventListener('click', () => {
        if (mobile.matches) closeMobile(false);
      }),
    );
    mobile.addEventListener('change', () => {
      document.body.classList.remove('sidebar-mobile-open');
      syncSidebar();
    });
    syncSidebar();

    let toastTimer;
    function toast(message) {
      const el = $('#toast');
      el.textContent = message;
      el.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        el.hidden = true;
      }, 2800);
    }
    const resumeDefault = $('#continue-learning')?.innerHTML;
    const resumeHref = $('#continue-learning')?.getAttribute('href');
    function updateProgress() {
      let total = 0;
      for (const chapter of chapters) {
        const done = chapter.sections.filter(
          (s) => state.completed[`${chapter.id}-${s[0]}`] === true,
        ).length;
        total += done;
        const bar = $(`[data-chapter-progress="${chapter.id}"]`);
        if (bar) bar.style.width = `${(done / chapter.sections.length) * 100}%`;
        const caption = $(`[data-chapter-caption="${chapter.id}"]`);
        if (caption)
          caption.textContent = done
            ? `${done} / ${chapter.sections.length}개 섹션 이해했어요`
            : '학습을 시작해 보세요';
      }
      $('#total-progress-caption').textContent = `${total} / ${totalSections}`;
      $('#total-progress-bar').style.width = `${(total / totalSections) * 100}%`;
      $('.progress-track').setAttribute('aria-valuenow', total);
      if (!store.available)
        $('#storage-hint').textContent =
          '저장이 제한된 브라우저입니다. 현재 페이지에서는 체크할 수 있어요.';
      const resume = $('#continue-learning');
      if (resume && state.last) {
        resume.href = chapterHref(state.last.chapter, state.last.section);
        resume.innerHTML = `${state.last.chapter}장 이어서 학습하기 <span aria-hidden="true">↗</span>`;
      } else if (resume) {
        resume.setAttribute('href', resumeHref);
        resume.innerHTML = resumeDefault;
      }
    }
    $$('[data-complete]').forEach((input) => {
      input.checked = state.completed[input.dataset.complete] === true;
      input.addEventListener('change', () => {
        state.completed[input.dataset.complete] = input.checked;
        const section = input.closest('.lesson-section');
        state.last = { chapter: pageId, section: section.id };
        save();
        updateProgress();
        if (input.checked) toast('이해한 내용을 기록했어요. 다음 단계로 가 볼까요?');
      });
    });
    updateProgress();
    window.addEventListener('storage', (event) => {
      if (event.key !== store.storageKey && event.key !== null) return;
      if (!store.sync(event.newValue)) return;
      $$('[data-complete]').forEach((input) => {
        input.checked = state.completed[input.dataset.complete] === true;
      });
      syncSidebar();
      updateProgress();
    });

    const searchItems = chapters.flatMap((c) =>
      c.sections.map((s) => ({
        chapter: c.id,
        title: s[1],
        chapterTitle: c.title,
        keywords: s[2],
        terms: `${s[1]} ${s[2]} ${c.title}`,
        href: chapterHref(c.id, s[0]),
      })),
    );
    function renderSearch() {
      const query = $('#search-input').value.trim().toLocaleLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      const translate = (value) => window.KnutLanguage?.translate(value) || value;
      const found = searchItems.filter((item) => {
        const searchable =
          `${item.terms} ${translate(item.title)} ${translate(item.keywords)} ${translate(item.chapterTitle)}`.toLocaleLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
      $('#search-results').innerHTML = found.length
        ? found
            .map(
              (item) =>
                `<a class="search-result" href="${item.href}"><small>CHAPTER ${item.chapter}</small><strong>${esc(item.title)}</strong></a>`,
            )
            .join('')
        : '<p class="search-empty">일치하는 섹션이 없어요. “Spark”, “포트”, “검증”처럼 핵심 용어로 찾아보세요.</p>';
      $$('.search-result').forEach((a) =>
        a.addEventListener('click', () => $('#search-dialog').close()),
      );
    }
    function openSearch() {
      closeMobile();
      renderSearch();
      if (!$('#search-dialog').open) $('#search-dialog').showModal();
      $('#search-input').focus();
    }
    $('#search-open').addEventListener('click', openSearch);
    $('#search-close').addEventListener('click', () => $('#search-dialog').close());
    $('#search-dialog').addEventListener('close', () => $('#search-open').focus());
    $('#search-input').addEventListener('input', renderSearch);
    document.addEventListener('knut:languagechange', () => {
      if ($('#search-dialog').open) renderSearch();
    });
    $('#search-dialog').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
          e.currentTarget.close();
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && document.body.classList.contains('sidebar-mobile-open'))
        closeMobile(true);
      if (
        e.key === 'Tab' &&
        mobile.matches &&
        document.body.classList.contains('sidebar-mobile-open') &&
        !$('#search-dialog').open
      ) {
        const focusable = [$('#sidebar-toggle'), ...$$('#course-sidebar a')];
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === focusable.at(-1)) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    });
    let scrollQueued = false;
    let lastActive = '';
    function updateActiveSection() {
      scrollQueued = false;
      let active = currentSections[0];
      for (const section of currentSections)
        if (section.getBoundingClientRect().top <= 150) active = section;
      if (active && active.id !== lastActive) {
        lastActive = active.id;
        $$('.toc-link').forEach((a) => {
          const match = a.hash === '#' + active.id;
          a.classList.toggle('active', match);
          if (match) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
        if (pageId !== 'home') {
          state.last = { chapter: pageId, section: active.id };
          save();
        }
      }
      $('.back-to-top').hidden = window.scrollY < 600;
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!scrollQueued) {
          scrollQueued = true;
          requestAnimationFrame(updateActiveSection);
        }
      },
      { passive: true },
    );
    updateActiveSection();

    return toast;
  };
})();
