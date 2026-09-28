(() => {
  'use strict';
  const picker = document.querySelector('#socket-picker');
  if (picker) {
    const render = () => {
      const windows = document.querySelector('#socket-os').value === 'windows';
      const family = document.querySelector('#socket-family').value;
      const type = document.querySelector('#socket-type').value === 'tcp' ? 'SOCK_STREAM' : 'SOCK_DGRAM';
      document.querySelector('#socket-result').textContent = `${windows ? 'SOCKET sock' : 'int fd'} = socket(${family}, ${type}, 0);`;
    };
    picker.querySelectorAll('select').forEach(select => select.addEventListener('change', render));
    picker.hidden = false;
    render();
  }
  const demo = document.querySelector('#lifecycle-demo');
  if (demo) {
    const scenarios = {
      success: { steps: ['WSAStartup → 0: 초기화 성공', 'socket → 유효한 소켓 핸들', 'closesocket → 소켓 닫기', 'WSACleanup → Winsock 사용 종료'], result: '생성한 소켓을 닫고, 성공한 초기화를 정리합니다.' },
      startup: { steps: ['WSAStartup → 0이 아닌 오류 코드', '반환값으로 원인 출력', '프로그램 종료'], result: '초기화 실패: socket과 WSACleanup을 호출하지 않습니다.' },
      socket: { steps: ['WSAStartup → 0: 초기화 성공', 'socket → INVALID_SOCKET', 'WSAGetLastError로 오류 코드 저장·출력', 'WSACleanup → Winsock 사용 종료'], result: '소켓 생성 실패: closesocket 없이 초기화만 정리합니다.' }
    };
    const render = key => {
      const scenario = scenarios[key];
      const list = document.querySelector('#lifecycle-steps');
      list.replaceChildren();
      scenario.steps.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
      document.querySelector('#lifecycle-result').textContent = scenario.result;
      demo.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
    };
    demo.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => render(button.dataset.scenario)));
    demo.hidden = false;
    render('success');
  }
})();
