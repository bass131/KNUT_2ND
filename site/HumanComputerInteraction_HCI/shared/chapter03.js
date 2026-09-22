(() => {
  'use strict';
  const explanations = {
    value: [
      '가치 모형 · 안심하고 제출을 마치는가?',
      '학생의 목표는 파일 업로드 자체가 아니라 올바른 과제를 기한 안에 제출하는 것입니다. 제출 기록을 통해 완료 여부를 확신할 수 있어야 합니다.',
    ],
    function: [
      '기능 모형 · 어떤 순서와 예외를 처리하는가?',
      '파일 검사 → 업로드 → 제출 확정 → 기록 생성의 상태를 연결합니다. 업로드 실패나 허용된 재제출도 기능 흐름에서 다룹니다.',
    ],
    structure: [
      '구조 모형 · 제출 기록은 어디서 찾는가?',
      '과목 → 주차 → 과제의 정보 관계를 정리합니다. 제출함과 제출 기록을 일관된 위치에 두어 다시 찾을 수 있게 합니다.',
    ],
    representation: [
      '표현 모형 · 현재 상태를 알아볼 수 있는가?',
      '업로드 중과 최종 제출 완료를 구분해 표시합니다. 진행 상태, 완료 문구와 기록으로 결과를 알아차릴 수 있게 합니다.',
    ],
  };
  const buttons = [...document.querySelectorAll('[data-model]')];
  const panel = document.getElementById('model-panel');
  if (!panel) return;
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const content = explanations[button.dataset.model];
      if (!content) return;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      panel.querySelector('h4').textContent = content[0];
      panel.querySelector('p').textContent = content[1];
    }),
  );
})();
