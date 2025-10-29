// Spike Diffuse Roulette - index.js (실시간 게이지 + 카드 변화 + 승자 애니메이션)
(() => {
  const namesEl = document.getElementById('names');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const arena = document.getElementById('arena');
  const logBox = document.getElementById('logBox');

  let players = [];
  let running = false;

  function log(text) {
    const p = document.createElement('p');
    p.textContent = text;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function clearArena() { arena.innerHTML = ''; }
  function clearLog() { logBox.innerHTML = ''; }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function getRandomPosition(existingPositions, width, height) {
    const pad = 20;
    const arenaWidth = arena.clientWidth - width - pad * 2;
    const arenaHeight = arena.clientHeight - height - pad * 2;
    let x, y, tries = 0;
    do {
      x = pad + Math.floor(Math.random() * arenaWidth);
      y = pad + Math.floor(Math.random() * arenaHeight);
      tries++;
      if(tries > 100) break;
    } while(existingPositions.some(pos => Math.abs(pos.x - x) < width + 10 && Math.abs(pos.y - y) < height + 10));
    existingPositions.push({x, y});
    return {x, y};
  }

  function placeSpikeElement(player, existingPositions) {
    const el = document.createElement('div');
    el.className = 'spike';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = player.name;

    const prog = document.createElement('div');
    prog.className = 'progress';
    const bar = document.createElement('i');
    prog.appendChild(bar);

    el.appendChild(title);
    el.appendChild(prog);

    const {x, y} = getRandomPosition(existingPositions, 120, 60);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    arena.appendChild(el);

    player.el = el;
    player.bar = bar;
  }

  function showWinnerOnArena(winner) {
    const winnerEl = document.createElement('div');
    winnerEl.className = 'winner';
    winnerEl.textContent = `🏆 당첨자: ${winner.name}`;
    winnerEl.style.position = 'absolute';
    winnerEl.style.top = '50%';
    winnerEl.style.left = '50%';
    winnerEl.style.transform = 'translate(-50%, -50%)';
    winnerEl.style.fontSize = '2rem';
    winnerEl.style.color = 'gold';
    winnerEl.style.fontWeight = 'bold';
    arena.appendChild(winnerEl);
  }

  function runRound(roundNum=1){
    clearArena();
    log(`--- 라운드 ${roundNum} ---`);
    log(`🚨 스파이크 설치중...`);

    setTimeout(async ()=>{
      log(`🚨 스파이크 설치완료! (참가자 ${players.length}명)`);

      const survivors=[];
      const existingPositions=[];
      const promises=[];

      players.forEach(player=>{
        player.defuse=rand(5,8);
        player.explode=rand(6,12);
        player.stupid=Math.random()<0.2;

        placeSpikeElement(player, existingPositions);

        // 게이지 실시간 진행
        const startTime = performance.now();
        const defuseTime = player.defuse * 1000;

        const progressAnimation = () => {
          const now = performance.now();
          const elapsed = now - startTime;
          const percent = Math.min((elapsed / defuseTime) * 100, 100);
          player.bar.style.width = `${percent}%`;

          if(percent < 50) player.bar.style.background='linear-gradient(90deg,#4caf50,#8bc34a)';
          else if(percent < 80) player.bar.style.background='linear-gradient(90deg,#ffc107,#ffeb3b)';
          else player.bar.style.background='linear-gradient(90deg,#f44336,#ff5722)';

          if(percent < 100) requestAnimationFrame(progressAnimation);
        };
        requestAnimationFrame(progressAnimation);

        // Promise 처리
        const p = new Promise(resolve=>{
          setTimeout(()=>{
            if(player.explode>player.defuse && !player.stupid){
              log(`✅ ${player.name} 디퓨즈 성공!`);
              survivors.push(player);
              player.el.classList.add('success');
            } else if(player.stupid){
              log(`🥴 ${player.name} 스파이크 해체방법을 까먹었다!`);
              player.el.classList.add('exploded');
            } else{
              log(`💥 ${player.name} 폭발!`);
              player.el.classList.add('exploded');
            }
            resolve();
          }, Math.min(player.explode, player.defuse)*1000 + 100);
        });

        promises.push(p);
      });

      await Promise.all(promises);

      if(survivors.length===0){
        const lucky=players[Math.floor(Math.random()*players.length)];
        log(`🔥 전멸! 운 좋게 ${lucky.name} 생존.`);
        players=[lucky];
      } else{
        players=survivors;
      }

      if(players.length===1){
        log(`👑 ${players[0].name} 최후의 생존자!`);
        showWinnerOnArena(players[0]);
        running=false;
        return;
      }

      setTimeout(()=>{
        clearLog();
        runRound(roundNum+1);
      }, rand(1000,2000));
    },rand(1000,2000));
  }

  function startGame(){
    if(running) return;
    clearLog();
    players=namesEl.value.trim().split(/[,\n]+/).map(s=>s.trim()).filter(Boolean).map(name=>({name}));
    if(players.length===0){ alert('참가자 이름을 입력하세요'); return;}
    running=true;
    setTimeout(()=>runRound(1),1000);
  }

  function resetGame(){
    running=false;
    players=[];
    clearArena();
    clearLog();
  }

  startBtn.addEventListener('click',startGame);
  resetBtn.addEventListener('click',resetGame);
})();
