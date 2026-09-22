/* Content feature; loaded before course.js as a classic deferred script. */
(() => {
  'use strict';
  const site = globalThis.BigDataCourse;
  site.initContent = function ({ $, $$, esc, toast }) {
    // Semantic colors connect the same vocabulary across lessons and diagrams.
    const termGroups = {
      blue: ['Driver', 'Client', 'Docker Desktop', 'CLI', '수집', '호스트'],
      purple: ['Executor', 'Apache Spark', 'PySpark', 'Transformation', '변환', '분산 처리'],
      teal: [
        '데이터',
        '데이터 파이프라인',
        '데이터 엔지니어링(Data Engineering, DE)',
        'DataFrame',
        'Partition',
        'partition',
        '스키마(Schema)',
        '저장',
        'Worker',
      ],
      amber: ['Master', 'Action', '명세', '병목', 'DNS', '포트', '제공'],
    };
    $$('main strong, main th[scope="row"]').forEach((el) => {
      const entry = Object.entries(termGroups).find(([, words]) =>
        words.includes(el.textContent.trim().replace(/[:：]$/, '')),
      );
      if (!entry) return;
      if (el.tagName === 'TH')
        el.innerHTML = `<span class="term term-${entry[0]}">${esc(el.textContent)}</span>`;
      else el.classList.add('term', `term-${entry[0]}`);
    });
    function highlightCode(value) {
      return value
        .split('\n')
        .map((line) => {
          if (line.trim().startsWith('#'))
            return `<span class="syntax-comment">${esc(line)}</span>`;
          if (/^(?:PYSPARK_IMAGE_CHECK|NETWORK_CHECK|CHECK)=PASS/.test(line))
            return `<span class="syntax-success">${esc(line)}</span>`;
          const tokens =
            /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|--[\w.-]+|\b(?:import|from|try|finally|assert|for|in|as|if|else|exec)\b|\b\d+(?:\.\d+)?\b)/g;
          let output = '',
            offset = 0;
          for (const match of line.matchAll(tokens)) {
            const token = match[0];
            const kind = /^["']/.test(token)
              ? 'string'
              : token.startsWith('--')
                ? 'option'
                : /^\d/.test(token)
                  ? 'number'
                  : 'keyword';
            output +=
              esc(line.slice(offset, match.index)) +
              `<span class="syntax-${kind}">${esc(token)}</span>`;
            offset = match.index + token.length;
          }
          return output + esc(line.slice(offset));
        })
        .join('\n');
    }
    $$('main code')
      .filter((code) => !code.closest('pre'))
      .forEach((code) => {
        const value = code.textContent;
        // Keep spelling/copying exact; wbr introduces only optional visual breaks.
        code.replaceChildren();
        for (let i = 0, start = 0; i < value.length; i++) {
          const separator =
            /[/:_=]/.test(value[i]) ||
            (value[i] === '-' && i > 1) ||
            (value[i] === '.' && /[A-Za-z]/.test(value[i + 1] || ''));
          if (separator || i === value.length - 1) {
            code.append(document.createTextNode(value.slice(start, i + 1)));
            if (separator && i < value.length - 1) code.append(document.createElement('wbr'));
            start = i + 1;
          }
        }
      });
    $$('.table-wrap').forEach((table, index) => {
      const headers = $$('thead th', table).map((header) => header.textContent.trim());
      if (headers.length && !table.querySelector('[colspan], [rowspan]')) {
        table.dataset.responsive = 'rows';
        $$('tbody tr', table).forEach((row) =>
          [...row.children].forEach((cell, column) => {
            if (cell.tagName === 'TD') cell.dataset.label = headers[column] || '';
          }),
        );
      }
      const hint = document.createElement('p');
      hint.className = 'table-scroll-hint';
      hint.id = `table-hint-${index}`;
      hint.textContent = '↔ 표를 좌우로 움직여 나머지 내용을 확인하세요.';
      hint.hidden = true;
      table.before(hint);
      const sync = () => {
        const scrollable = table.scrollWidth > table.clientWidth + 1;
        hint.hidden = !scrollable;
        if (scrollable) {
          table.tabIndex = 0;
          table.setAttribute('role', 'region');
          table.setAttribute(
            'aria-label',
            $('caption', table)?.textContent || '가로로 이동할 수 있는 표',
          );
          table.setAttribute('aria-describedby', hint.id);
        } else {
          table.removeAttribute('tabindex');
          table.removeAttribute('role');
          table.removeAttribute('aria-label');
          table.removeAttribute('aria-describedby');
        }
      };
      new ResizeObserver(sync).observe(table);
      sync();
    });
    $$('pre').forEach((pre) => {
      const code = $('code', pre);
      if (!code) return;
      pre.tabIndex = 0;
      const value = code.textContent;
      code.innerHTML = highlightCode(value);
      const label = document.createElement('span');
      label.className = 'code-label';
      label.textContent = value.startsWith('#!/usr/bin/env bash')
        ? 'BASH · 파일 내용'
        : /^(import |from |"""|spark =|numbers =)/m.test(value)
          ? 'PYTHON · 코드'
          : /^(name:|x-spark:|  spark-)/m.test(value)
            ? 'YAML · 구성 파일'
            : /(^docker |^wsl |^cd |^\$sparkImage)/m.test(value)
              ? 'POWERSHELL'
              : '참고 코드 · 출력';
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.type = 'button';
      button.textContent = '복사';
      button.setAttribute('aria-label', '코드 복사');
      button.addEventListener('click', async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
          document.body.append(textarea);
          textarea.select();
          try {
            copied = document.execCommand('copy');
          } catch {
            copied = false;
          }
          textarea.remove();
          button.focus({ preventScroll: true });
        }
        if (copied) {
          button.textContent = '복사 완료';
          toast('복사했어요. 안내된 실행 위치를 확인해 주세요.');
          setTimeout(() => {
            button.textContent = '복사';
          }, 1800);
        } else {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          toast('코드를 선택했어요. Ctrl+C로 복사해 주세요.');
        }
      });
      pre.append(label, button);
    });
    $$('.quiz').forEach((quiz) => {
      const buttons = $$('.quiz-options button', quiz);
      const answer = Number(quiz.dataset.answer);
      buttons.forEach((button, index) =>
        button.addEventListener('click', () => {
          buttons.forEach((b) => {
            b.classList.remove('correct', 'incorrect');
            b.setAttribute('aria-pressed', 'false');
          });
          button.classList.add(index === answer ? 'correct' : 'incorrect');
          button.setAttribute('aria-pressed', 'true');
          $('.quiz-feedback', quiz).textContent =
            `${index === answer ? '✓ 맞았어요.' : '다시 생각해 볼까요?'} ${quiz.dataset.explanation}`;
        }),
      );
    });

    // Keep the lesson open while inspecting external docs or local Spark UI.
    $$('main a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `${a.textContent.trim()} (새 탭)`);
    });
  };
})();
