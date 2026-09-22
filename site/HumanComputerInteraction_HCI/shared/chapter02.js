(() => {
  'use strict';
  const demo = [
    [
      '감각적 경험 · 무엇이 실제처럼 느껴지는가?',
      '말풍선과 알림음은 감각 자극입니다. 상대의 입력 상태가 바로 보이면 함께 대화한다는 사회적 실재감을 느낄 수 있습니다. 자극을 늘리는 것이 언제나 좋은 경험을 뜻하지는 않습니다.',
    ],
    [
      '판단적 경험 · 왜 이 대화를 하는가?',
      '친구와 대화하는 과정의 즐거움은 경험적 가치, 약속 시간을 정하는 목적은 수단적 가치입니다. 사용자가 알림과 답장 방식을 조절할 수 있는지도 함께 살펴봅니다.',
    ],
    [
      '구성적 경험 · 누구와 어떻게 연결되는가?',
      '일대일 대화와 단체 대화는 연결 구조가 다릅니다. 참여자 수뿐 아니라 실제 연결된 관계, 메시지를 주고받는 빈도와 정보의 깊이가 관계의 복잡도에 영향을 줍니다.',
    ],
  ];
  document.querySelectorAll('[data-dimension]').forEach((button) =>
    button.addEventListener('click', () => {
      document
        .querySelectorAll('[data-dimension]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      const panel = document.getElementById('dimension-panel'),
        data = demo[Number(button.dataset.dimension)];
      panel.querySelector('h4').textContent = data[0];
      panel.querySelector('p').textContent = data[1];
    }),
  );
})();
