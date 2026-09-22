(() => {
  'use strict';
  document.querySelectorAll('.principle').forEach((diagram) => {
    const frames = Array.from(diagram.querySelectorAll('.principle-frame'));
    const navigation = diagram.querySelector('.principle-nav');
    if (!frames.length || !navigation) return;
    const previous = navigation.querySelector('[data-step="prev"]');
    const next = navigation.querySelector('[data-step="next"]');
    const status = navigation.querySelector('.principle-status');
    let current = 0;
    const render = () => {
      frames.forEach((frame, index) => { frame.hidden = index !== current; });
      status.textContent = `${current + 1} / ${frames.length} · ${frames[current].dataset.stepTitle}`;
      previous.disabled = current === 0;
      next.disabled = current === frames.length - 1;
    };
    previous.addEventListener('click', () => { if (current > 0) current--; render(); });
    next.addEventListener('click', () => { if (current < frames.length - 1) current++; render(); });
    diagram.classList.add('is-stepped');
    navigation.hidden = false;
    render();
  });
})();

(() => {
  'use strict';
  const root = document.getElementById('ring-demo');
  if (!root) return;
  const size = 5;
  let values = Array(size).fill(null);
  let front = 0;
  let rear = 0;
  let nextValue = 10;
  const render = (message) => {
    const slots = root.querySelector('.ring-slots');
    slots.replaceChildren();
    const active = new Set();
    for (let i = front; i !== rear; i = (i + 1) % size) active.add(i);
    for (let i = 0; i < size; i++) {
      const slot = document.createElement('div');
      slot.className = 'ring-slot';
      slot.dataset.active = String(active.has(i));
      const index = document.createElement('small');
      index.textContent = `index ${i}`;
      const value = document.createElement('strong');
      value.textContent = active.has(i) ? values[i] : '·';
      const marker = document.createElement('span');
      marker.textContent = [i === front ? 'front' : '', i === rear ? 'rear' : ''].filter(Boolean).join(' / ');
      slot.append(index, value, marker);
      slots.append(slot);
    }
    root.querySelector('.ring-status').textContent = `${message} front=${front}, rear=${rear}, 저장 ${active.size}/4개.`;
  };
  root.querySelector('[data-ring="enqueue"]').addEventListener('click', () => {
    const next = (rear + 1) % size;
    if (next === front) {
      render('FULL: 새 값을 거부했습니다. 기존 데이터는 유지됩니다.');
      return;
    }
    const inserted = nextValue;
    const index = rear;
    values[rear] = inserted;
    rear = next;
    nextValue += 10;
    render(`${inserted}을 index ${index}에 넣었습니다.`);
  });
  root.querySelector('[data-ring="dequeue"]').addEventListener('click', () => {
    if (front === rear) {
      render('EMPTY: 꺼낼 데이터가 없습니다.');
      return;
    }
    const value = values[front];
    front = (front + 1) % size;
    render(`${value}을 꺼냈습니다.`);
  });
  root.querySelector('[data-ring="reset"]').addEventListener('click', () => {
    values = Array(size).fill(null);
    front = rear = 0;
    nextValue = 10;
    render('초기화했습니다.');
  });
  render('빈 큐에서 시작합니다.');
})();
