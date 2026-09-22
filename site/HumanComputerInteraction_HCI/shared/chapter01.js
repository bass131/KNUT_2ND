(() => {
  'use strict';
  const stages = [
    [
      '말과 실내 상태를 입력으로 받습니다.',
      '음성 입력 “더워요”와 실내 온도를 수집합니다. 사용자에게 인식된 문장을 보여 주면, 잘못 알아들은 내용을 바로잡을 수 있습니다.',
      '시스템이 무엇을 들었는지 확인할 수 있나요?',
    ],
    [
      '상황을 해석하고 조정을 제안합니다.',
      '실내 상태와 사용자 요청을 바탕으로 온도를 낮추는 것이 적절한지 판단합니다. 판단 이유를 보여 주고, 사용자가 “창문을 열어 둔 상태야”처럼 추가 정보를 줄 수 있게 합니다.',
      'AI가 제안한 이유를 이해하고 수정할 수 있나요?',
    ],
    [
      '사용자가 확인한 조정을 실행합니다.',
      '이 학습 예시에서는 사용자 확인을 받은 뒤 에어컨 온도를 낮춥니다. 변경 결과를 알려 주고, 원하지 않는 조정은 취소하거나 되돌릴 수 있도록 설계합니다.',
      '행동의 결과를 확인하고 제어할 수 있나요?',
    ],
  ];
  document.querySelectorAll('[data-stage]').forEach((btn) =>
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('[data-stage]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const data = stages[Number(btn.dataset.stage)],
        panel = document.getElementById('demo-panel');
      panel.querySelector('h4').textContent = data[0];
      panel.querySelector('p').textContent = data[1];
      panel.querySelector('.demo-question').textContent = '설계 질문: ' + data[2];
    }),
  );
})();
