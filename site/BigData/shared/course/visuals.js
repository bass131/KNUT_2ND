/* Visuals feature; loaded before course.js as a classic deferred script. */
(() => {
  'use strict';
  const site = globalThis.BigDataCourse;
  site.initVisuals = function ({ $, $$, esc }) {
    function createVisual(host, title, tabs, draw) {
      host.classList.add('visual');
      host.innerHTML = `<div class="visual-header"><h3>${title}</h3><span class="visual-badge">INTERACTIVE · 학습용 모형</span></div><div class="visual-tabs" role="group" aria-label="${title} 단계 선택">${tabs.map((tab, i) => `<button type="button" aria-pressed="${i === 0}">${esc(tab)}</button>`).join('')}</div><div class="visual-body"></div><p class="visual-description" aria-live="polite"></p>`;
      const buttons = $$('.visual-tabs button', host);
      const set = (index) => {
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
        const { body, description } = draw(index);
        $('.visual-body', host).innerHTML = body;
        $('.visual-description', host).textContent = description;
        if (host.dataset.visual === 'cluster') {
          const paths = [
            '<span class="term-teal">Worker</span> ↑ 등록·자원 보고 ↑ <span class="term-amber">Master</span>',
            '<span class="term-blue">Driver</span> → 앱 등록·자원 요청 → <span class="term-amber">Master</span>',
            '<span class="term-amber">Master</span> ↓ <span class="term-teal">Worker</span> → <span class="term-purple">Executor 시작</span>',
            '<span class="term-blue">Driver</span> ↔ Task·상태·결과 ↔ <span class="term-purple">Executor</span>',
          ];
          const route = document.createElement('div');
          route.className = 'cluster-flow';
          route.innerHTML = paths[index];
          $('.cluster-workers', host).before(route);
        }
      };
      buttons.forEach((button, index) => button.addEventListener('click', () => set(index)));
      set(0);
    }
    $$('[data-visual="pipeline"]').forEach((host) => {
      const names = ['수집', '변환', '저장', '제공'];
      const sub = [
        '원천 기록 가져오기',
        '규칙에 맞게 정리',
        '다시 쓸 수 있게 보관',
        '분석·서비스에 전달',
      ];
      const desc = [
        '① 수집: 주문 A001 10,000원, A002 20,000원, 재전송된 A002 20,000원을 받았어요. 아직 3행이라는 사실만 알 수 있습니다. 원본을 먼저 확보합니다.',
        '② 변환: “같은 주문 번호의 재전송은 한 번만 센다”는 명세를 적용해요. A002를 한 번만 반영하면 실제 주문은 2건, 합계는 30,000원입니다.',
        '③ 저장: 원본 3행과 정리된 결과 2건을 구분해 보관해요. 규칙을 고치거나 오류를 찾았을 때 원본에서 다시 계산할 수 있습니다.',
        '④ 제공: 분석가나 서비스가 사용할 매출표를 전달해요. 숫자 30,000원뿐 아니라 어떤 규칙으로 만든 값인지도 설명할 수 있어야 합니다.',
      ];
      createVisual(
        host,
        '주문 기록이 흐르는 네 단계',
        names.map((n, i) => `${i + 1}. ${n}`),
        (index) => ({
          body: `<div class="flow-line">${names.map((name, i) => `${i ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}<div class="flow-node ${index === i ? 'active' : ''}"><strong>${name}</strong><small>${sub[i]}</small></div>`).join('')}</div>`,
          description: desc[index],
        }),
      );
    });
    $$('[data-visual="cluster"]').forEach((host) => {
      const desc = [
        '① 클러스터 준비: Worker 두 개가 Master에 자원을 알립니다. Client는 대기 중이고 Driver와 Executor는 아직 없습니다. 컨테이너는 네 개입니다.',
        '② 앱 제출: Client 안에서 spark-submit을 실행하면 Driver가 시작됩니다. Master에 앱을 등록하고 Executor를 실행할 자원을 요청합니다.',
        '③ 실행 자원 준비: Master가 Worker에 Executor 실행을 지시합니다. 각 Worker에서 시작한 Executor가 Client의 Driver에 연결합니다.',
        '④ 계산: Driver가 Task를 조정하고 Executor가 실제 계산을 수행합니다. 상태와 결과는 Driver와 Executor 사이에서 전달되며 Master를 경유할 필요가 없습니다.',
      ];
      createVisual(
        host,
        '앱 제출 전후, 역할이 달라져요',
        ['1. 준비', '2. 앱 제출', '3. Executor 시작', '4. 계산'],
        (index) => ({
          body: `<div class="cluster-canvas"><div class="cluster-boundary">내 Windows PC → Docker의 Linux 환경 → Compose 네트워크 · 컨테이너 4개</div><div class="cluster-top"><div class="cluster-node ${index >= 1 ? 'active' : ''}"><strong>spark-client</strong><small>${index === 0 ? '대기 · Driver 없음' : 'Driver · 실행 조정'}</small></div><div class="cluster-connect">${index === 0 ? '아직 앱 없음' : index === 1 ? '앱 등록 →' : index === 2 ? '자원 배정 ↓' : 'Master는 자원 관리'}</div><div class="cluster-node ${index < 3 ? 'active' : ''}"><strong>spark-master</strong><small>Worker·자원 관리</small></div></div><div class="cluster-workers">${[1, 2].map((n) => `<div class="cluster-node ${index >= 2 ? 'active' : ''}"><strong>spark-worker-${n}</strong><small>제공 자원 1 core · 1 GiB</small><div class="executor ${index < 2 ? 'waiting' : ''}">${index < 2 ? 'Executor 아직 없음' : index === 2 ? 'Executor 시작 → Driver 연결' : 'Executor ↔ Driver · Task 수행'}</div></div>`).join('')}</div></div>`,
          description: desc[index],
        }),
      );
    });
    $$('[data-visual="ports"]').forEach((host) => {
      const routes = [
        {
          left: 'Windows 브라우저',
          from: 'localhost:8082',
          right: 'Worker 2 컨테이너',
          to: '내부 포트 8081',
          bridge: '호스트 포트 전달 →',
          desc: 'Windows의 localhost는 내 PC입니다. compose.yaml의 127.0.0.1:8082:8081은 PC의 8082를 Worker 2 내부 8081로 연결해요. Worker 1도 자기 컨테이너에서 8081을 사용할 수 있습니다.',
        },
        {
          left: 'Worker 컨테이너',
          from: 'spark-master:7077',
          right: 'Master 컨테이너',
          to: '내부 포트 7077',
          bridge: 'DNS 조회 후 직접 연결 →',
          desc: '컨테이너에서는 서비스 이름 spark-master로 Master를 찾습니다. Docker DNS는 이름에 해당하는 IP를 알려주고, 실제 연결은 받은 주소로 직접 이루어집니다. DNS용 컨테이너를 추가하지 않습니다.',
        },
        {
          left: 'Windows 브라우저',
          from: 'localhost:4040',
          right: 'Client 안의 Driver',
          to: '내부 포트 4040',
          bridge: '앱이 살아 있을 때 →',
          desc: 'Driver UI는 앱을 제출한 뒤 사용할 수 있어요. 기본 120초의 관찰 시간이 끝나 APP_STOPPED가 출력되면 Driver가 종료되어 이 화면도 닫힙니다. Client 컨테이너가 켜져 있어도 UI가 항상 존재하는 것은 아닙니다.',
        },
        {
          left: 'Worker 2 안에서',
          from: 'localhost:8081',
          right: 'Worker 2 자기 자신',
          to: '내부 Worker UI',
          bridge: '자기 자신에게 →',
          desc: '같은 localhost라도 실행 위치가 중요합니다. Worker 2 내부의 localhost는 Worker 2 자신입니다. 여기서 Master에 연결하려면 localhost:7077이 아니라 spark-master:7077을 사용해야 합니다.',
        },
      ];
      createVisual(
        host,
        '어디에서 접속하는 주소일까요?',
        ['PC → Worker 2', 'Worker → Master', 'PC → Driver UI', 'localhost의 의미'],
        (index) => {
          const route = routes[index];
          return {
            body: `<div class="port-route"><div class="flow-node active"><strong>${route.left}</strong><code>${route.from}</code></div><div class="port-bridge">${route.bridge}</div><div class="flow-node"><strong>${route.right}</strong><span class="port-destination">${route.to}</span></div></div>`,
            description: route.desc,
          };
        },
      );
    });
    $$('[data-visual="partitions"]').forEach((host) => {
      const data = [
        [1, 25, 325],
        [26, 50, 950],
        [51, 75, 1575],
        [76, 100, 2200],
      ];
      const descriptions = [
        '① 입력 만들기: range(1, 101, 1, 4)는 1부터 100까지 숫자를 4개 입력 partition으로 나눕니다. 101은 포함하지 않아요. 그림의 범위는 분할을 이해하기 위한 모형입니다.',
        '② 부분 합계: 각 조각의 숫자를 더하면 325, 950, 1575, 2200입니다. 조각은 4개지만 이 실습의 전체 Executor core는 2개이므로 네 조각을 모두 동시에 처리한다는 뜻은 아닙니다.',
        '③ 결과 모으기: 부분 합계를 더하면 5050입니다. 실제 Spark 집계에는 추가 처리 단계가 있을 수 있어요. 이 그림은 덧셈 원리 설명이며 Spark UI의 Task 실행 순서를 그대로 재현한 화면은 아닙니다.',
      ];
      createVisual(
        host,
        '작은 조각으로 나눠서 더하기',
        ['1. 데이터 4조각', '2. 부분 합계', '3. 결과 확인'],
        (index) => ({
          body: `<div class="partition-grid">${data.map((d, i) => `<div class="partition-block"><small>PARTITION ${i}</small><strong>${d[0]}–${d[1]}</strong><div class="partition-result">${index === 0 ? '25개 숫자' : '합계 ' + d[2].toLocaleString()}</div></div>`).join('')}</div>${index === 2 ? '<div class="sum-result"><small>325 + 950 + 1,575 + 2,200</small>5,050 <small>손계산 100 × 101 ÷ 2와 비교해요</small></div>' : ''}`,
          description: descriptions[index],
        }),
      );
    });

    $$('[data-visual="scaling"]').forEach((host) => {
      const scenarios = [
        [1, 1],
        [2, 2],
        [4, 4],
        [8, 8],
        [8, 2],
      ];
      createVisual(
        host,
        'Worker 수와 사용하는 Core는 어떻게 다를까요?',
        scenarios.map(([workers, cores]) => `Worker ${workers} · Core ${cores}`),
        (index) => {
          const [workers, cores] = scenarios[index];
          return {
            body: `<div class="partition-grid">${Array.from({ length: workers }, (_, i) => `<div class="partition-block"><small>WORKER ${i + 1}</small><strong>${i < cores ? '1 Core 사용' : '이 앱 미사용'}</strong><div class="partition-result">${i < cores ? 'Executor 1개' : '계산 자원 대기'}</div></div>`).join('')}</div><div class="callout"><p>입력 Partition <strong>128개</strong> · 입력 Stage에서 동시 실행 가능한 Task는 최대 <strong>${cores}개</strong></p></div>`,
            description: `Worker ${workers}개 중 최대 ${cores}개가 이 앱에 참여합니다. Worker와 Executor마다 1 Core인 이번 설정의 예입니다. ${workers > cores ? '나머지 Worker는 이 앱의 계산에 참여하지 않습니다. ' : ''}실제 배정 위치는 달라질 수 있으며, 최종 집계는 별도 단계입니다.`,
          };
        },
      );
    });
  };
})();
