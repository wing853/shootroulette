// Spike Diffuse Roulette - index.js
// 기본 규칙 구현:
// 참가자 수만큼 스파이크 설치 → 각 스파이크에 defuse_time, explode_time 설정 → 동시에 진행 → 성공자만 다음 라운드

(() => {
  // DOM 요소 참조
  const namesEl = document.getElementById('names');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const arena = document.getElementById('arena');
  const logBox = document.getElementById('logBox');
  const baseDefuseEl = document.getElementById('baseDefuse');
  const explodeRangeEl = document.getElementById('explodeRange');
  const stupidRateEl = document.getElementById('stupidRate');
  const speedEl = document.getElementById('speed');

  let players = [];
  let running = false;

  // 로그 출력 함수
  function log(text) {
    const p = document.createElement('p');
    p.textContent = text;
    logBox.prepend(p);
  }

  // 아레나 초기화
  function clearArena() {
    arena.innerHTML = '';
  }

  // 랜덤 숫자 생성
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // 스파이크 생성 및 배치
  function placeSpikeElement(player) {
    const el = document.createElement('div');
    el.className = 'spike';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = player.name;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `D:${player.defuse.toFixed(1)}s E:${player.explode.toFixed(1)}s`;

    const prog = document.createElement('div');
    prog.className = 'progress';

    const bar = document.createElement('i');
    prog.appendChild(bar);

    el.appendChild(title);
    el.appendChild(meta);
    el.appendChild(prog);

    // 랜덤 좌표 배치
    const pad = 20;
    const aw = arena.clientWidth - 140 - pad * 2;
    const ah = arena.clientHeight - 80 - pad * 2;
    const x = pad + Math.floor(Math.random() * aw);
    const y = pad + Math.floor(Math.random() * ah);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    arena.appendChild(el);

    player.el = el;
    player.bar = bar;
    player.meta = meta;
  }

  // 폭발 이펙트 생성
  function makeExplosion(x, y) {
    const fx = document.createElement('div');
    fx.className = 'explode-effect';
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;

    const ring = document.createElement('div');
    ring.className = 'ring';
    fx.appendChild(ring);

    arena.appendChild(fx);
    setTimeout(() => fx.remove(), 900);
  }

  // 게임 시작
  function startGame() {
    if (running) return;

    const raw = namesEl.value.trim();
    if (!raw) {
      alert('참가자 이름을 입력하세요');
      return;
    }

    const list = raw
      .split(/[,\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (list.length === 0) {
      alert('참가자 이름을 입력하세요');
      return;
    }

    players = list.map(name => ({ name }));
    running = true;

    log(`💣 스파이크가 설치됐다! 참가자: ${players.length}명`);
  }

  // 이벤트 등록
  startBtn.addEventListener('click', startGame);
})();
