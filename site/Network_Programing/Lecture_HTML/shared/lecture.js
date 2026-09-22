(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  let toastTimer;
  function notify(text) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.textContent = ''; }, 5000);
  }

  function initTableOfContents() {
    const sidebar = $('#sidebar');
    const toggle = $('#toc-toggle');
    if (sidebar && toggle && $('#scrim')) {
      const mobile = window.matchMedia('(max-width: 760px)');
      const setToc = (open, returnFocus = false) => {
        document.body.classList.toggle('toc-closed', !open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '목차 닫기' : '목차 열기');
        sidebar.inert = !open;
        sidebar.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = mobile.matches && open ? 'hidden' : '';
        if (returnFocus) toggle.focus();
      };
      setToc(!mobile.matches);
      toggle.addEventListener('click', () => setToc(toggle.getAttribute('aria-expanded') !== 'true'));
      $('#scrim').addEventListener('click', () => setToc(false, true));
      document.addEventListener('keydown', (event) => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        if (event.key === 'Escape' && open && !document.querySelector('dialog[open]')) setToc(false, true);
        if (event.key === 'Tab' && mobile.matches && open) {
          const targets = [toggle, ...sidebar.querySelectorAll('a[href]')];
          const index = targets.indexOf(document.activeElement);
          event.preventDefault();
          const next = event.shiftKey ? (index <= 0 ? targets.length - 1 : index - 1) : (index + 1) % targets.length;
          targets[next].focus();
        }
      });
      mobile.addEventListener('change', () => setToc(!mobile.matches));
      const tocLinks = [...document.querySelectorAll('.toc a')];
      tocLinks.forEach((link) => link.addEventListener('click', () => {
        if (mobile.matches) {
          setToc(false);
          const target = document.querySelector(link.getAttribute('href'));
          if (!target) return;
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }));
      let scrollQueued = false;
      const sections = tocLinks.map((a) => $(a.getAttribute('href')));
      const markSection = () => {
        let index = 0;
        sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= 145) index = i; });
        tocLinks.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
        scrollQueued = false;
      };
      window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(markSection); } }, { passive: true });
      markSection();
    }
  }

  function initProgress() {
    const checks = [...document.querySelectorAll('.complete input')];
    if ($('#progress') && $('#progress-text')) {
      const storageKey = `network-notes:${document.body.dataset.chapter || 'chapter'}:v1:${location.pathname}`;
      const refreshProgress = () => {
        const count = checks.filter((input) => input.checked).length;
        $('#progress').max = checks.length;
        $('#progress').value = count;
        $('#progress-text').textContent = `${count} / ${checks.length}`;
      };
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (Array.isArray(saved)) checks.forEach((input) => { input.checked = saved.includes(input.id); });
      } catch { if ($('#storage-note')) $('#storage-note').textContent = '브라우저 저장소를 사용할 수 없어 체크는 현재 페이지를 열어 둔 동안만 유지됩니다.'; }
      checks.forEach((input) => input.addEventListener('change', () => {
        refreshProgress();
        try { localStorage.setItem(storageKey, JSON.stringify(checks.filter((item) => item.checked).map((item) => item.id))); }
        catch { if ($('#storage-note')) $('#storage-note').textContent = '저장이 제한되어 체크는 현재 페이지를 열어 둔 동안만 유지됩니다.'; }
      }));
      refreshProgress();
    }
  }

  function initCodeCopy() {
    document.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', async () => {
      const code = button.closest('.codebox')?.querySelector('code');
      if (!code) return;
      const text = code.textContent;
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch {
        const field = document.createElement('textarea');
        field.value = text; field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(field); field.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove(); button.focus();
      }
      if (copied) notify('코드를 복사했습니다.');
      else {
        const selection = window.getSelection();
        const range = document.createRange(); range.selectNodeContents(code);
        selection.removeAllRanges(); selection.addRange(range);
        notify('자동 복사가 제한되어 코드를 선택했습니다. Ctrl+C 또는 복사 메뉴를 이용하세요.');
      }
    }));
  }

  function initPrinting() {
    $('#print-btn')?.addEventListener('click', () => window.print());
    let openedForPrint = [];
    let preparingPrint = false;
    window.addEventListener('beforeprint', () => {
      if (preparingPrint) return;
      preparingPrint = true;
      openedForPrint = [...document.querySelectorAll('.code-details:not([open]), .quiz-item:not([open]), .history:not([open])')];
      openedForPrint.forEach((details) => { details.open = true; });
    });
    window.addEventListener('afterprint', () => { openedForPrint.forEach((details) => { details.open = false; }); openedForPrint = []; preparingPrint = false; });
  }

  function initProtocolDemo() {
    if (['#receive-packets', '#protocol-explanation', '#change-receive'].every((selector) => $(selector))) {
      let protocol = 'tcp'; let variant = 0;
      const examples = [['AB', 'CDEFG', 'HI'], ['ABCDEFGHI'], ['ABC', 'DEF', 'GHI'], ['A', 'BCDE', 'FGHI']];
      const renderProtocol = () => {
        const container = $('#receive-packets'); container.replaceChildren();
        const label = document.createElement('small');
        label.textContent = '수신 애플리케이션 · 가능한 수신 결과'; container.append(label);
        const packets = protocol === 'tcp' ? examples[variant % examples.length] : (variant % 2 ? ['ABC', 'GHI'] : ['ABC', 'DEF', 'GHI']);
        packets.forEach((value) => { const span = document.createElement('span'); span.className = 'packet'; span.textContent = value; container.append(span); });
        $('#protocol-explanation').textContent = protocol === 'tcp'
          ? 'TCP는 ABCDEFGHI의 순서를 유지하지만 수신 호출의 분할 방식은 달라질 수 있습니다. 수신한 바이트를 누적하고 응용 프로토콜로 메시지 경계를 복원합니다. 개념 시뮬레이션입니다.'
          : variant % 2 ? '유실 예: DEF가 도착하지 않아 ABC와 GHI만 받았습니다. 도착한 각 데이터그램의 경계는 유지됩니다. UDP 자체는 유실된 DEF를 재전송하지 않습니다. 개념 시뮬레이션입니다.'
          : '정상 도착 예: 각 데이터그램 ABC, DEF, GHI를 별도로 받습니다. 이 순서는 항상 보장되지 않으며 유실·중복도 가능합니다. 개념 시뮬레이션입니다.';
        $('#change-receive').textContent = protocol === 'tcp' ? '다른 수신 예시 보기 ↻' : variant % 2 ? '정상 도착 예시 보기 ↻' : '데이터그램 유실 예시 보기 ↻';
      };
      document.querySelectorAll('[data-protocol]').forEach((button) => button.addEventListener('click', () => {
        protocol = button.dataset.protocol; variant = 0;
        document.querySelectorAll('[data-protocol]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        renderProtocol();
      }));
      $('#change-receive').addEventListener('click', () => { variant++; renderProtocol(); });
    }
  }

  function initPageViewer() {
    const select = $('#page-select');
    if (select && ['#page-image', '#page-full', '#page-caption', '#page-prev', '#page-next'].every((selector) => $(selector))) {
      const pageCount = select.options.length;
      const pages = [...document.querySelectorAll('.gallery img')];
      if (!pageCount || pages.length !== pageCount) return;
      const renderPage = () => {
        const page = Number(select.value); const option = select.selectedOptions[0];
        const path = pages[page - 1].src;
        $('#page-image').src = path; $('#page-image').alt = `PDF ${page}쪽: ${option.dataset.title}`;
        $('#page-full').href = path;
        $('#page-full').download = `lecture-page-${String(page).padStart(2, '0')}.png`;
        $('#page-caption').textContent = `PDF ${page} / ${pageCount} · ${option.dataset.title}`;
        $('#page-prev').disabled = page === 1; $('#page-next').disabled = page === pageCount;
      };
      select.addEventListener('change', renderPage);
      $('#page-prev').addEventListener('click', () => { select.value = String(Math.max(1, Number(select.value) - 1)); renderPage(); });
      $('#page-next').addEventListener('click', () => { select.value = String(Math.min(pageCount, Number(select.value) + 1)); renderPage(); });
    }
  }

  function initImageViewer() {
    const imageDialog = $('#image-dialog');
    if (imageDialog && ['#expanded-image', '#image-download', '#image-close'].every((selector) => $(selector))) {
      document.querySelectorAll('a[data-image]').forEach((link) => link.addEventListener('click', (event) => {
        if (!imageDialog.showModal) return;
        event.preventDefault();
        $('#expanded-image').src = link.href;
        $('#expanded-image').alt = link.querySelector('img')?.alt || $('#page-image')?.alt || '확대한 원본 이미지';
        $('#image-download').href = link.href;
        $('#image-download').download = link.download || 'lecture-page.png';
        imageDialog.showModal();
      }));
      $('#image-close').addEventListener('click', () => imageDialog.close());
      imageDialog.addEventListener('click', (event) => { if (event.target === imageDialog) imageDialog.close(); });
    }
  }

  // Each initializer owns one optional page component; no globals or fetch needed.
  initTableOfContents();
  initProgress();
  initCodeCopy();
  initPrinting();
  initProtocolDemo();
  initPageViewer();
  initImageViewer();
})();
