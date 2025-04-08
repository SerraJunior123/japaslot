let credits = 100;
let bet = 1;
let isSpinning = false;
const symbols = [
  'images/tigre.webp',
  'images/checa.webp',
  'images/aranha.webp',
  'images/pinto.webp',
  'images/cobra.webp',
  'images/arara.webp',
  'images/perereca.webp'
];

let stopIndexes = []; // Armazena os índices finais visíveis dos rolos
let matchedSymbols = new Set();

function initializeReels() {
  document.querySelectorAll('.reel-content').forEach(reel => {
    reel.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const img = document.createElement('img');
      img.src = (i % 3 === 0) ? 'images/tigre.webp' : symbols[i % symbols.length];
      img.className = 'symbol';

      const wrapper = document.createElement('div');
      wrapper.className = 'symbol-wrapper';
      wrapper.appendChild(img);
      reel.appendChild(wrapper);
    }
  });
}

function changeBet(amount) {
  bet = Math.max(1, bet + amount);
  document.getElementById('betAmount').textContent = bet;
}

function spin(button) {
  if (isSpinning) return;
  if (credits < bet) {
    document.getElementById('outOfCreditsModal').style.display = 'flex';
    return;
  }

  matchedSymbols.forEach(s => s.classList.remove('winning', 'win-tigre', 'win-aranha', 'win-perereca', 'win-cobra', 'win-pinto', 'win-arara', 'win-checa'));
  matchedSymbols.clear();

  isSpinning = true;
  credits -= bet;
  document.getElementById('creditsAmount').textContent = credits;

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.setProperty('--x', Math.random());
    p.style.setProperty('--y', Math.random());
    button.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  const reels = document.querySelectorAll('.reel-content');
  stopIndexes = [];

  const baseStopIndex = Math.floor(Math.random() * (20 - 4 - 2)) + 1;

  reels.forEach((reel, index) => {
    reel.parentElement.classList.add('shake');

    const variation = Math.floor(Math.random() * 2);
    const stopIndex = Math.min(baseStopIndex + variation, 16);

    stopIndexes.push(stopIndex);
    const translateY = -(stopIndex * 100);

    setTimeout(() => {
      reel.style.transition = 'transform 1s linear';
      reel.style.transform = `translateY(${translateY}px)`;
    }, index * 150);
  });

  setTimeout(() => {
    reels.forEach(reel => reel.parentElement.classList.remove('shake'));
    isSpinning = false;
    checkWin();
  }, 1500);
}

function applyWinEffect(symbol) {
  const fileName = symbol.src.split('/').pop();

  if (fileName.includes('tigre')) {
    symbol.classList.add('win-tigre');
    createParticlesForSymbol(symbol, 'tigre');
  } else if (fileName.includes('aranha')) {
    symbol.classList.add('win-aranha');
    createParticlesForSymbol(symbol, 'aranha');
  } else if (fileName.includes('perereca')) {
    symbol.classList.add('win-perereca');
    createParticlesForSymbol(symbol, 'perereca');
  } else if (fileName.includes('cobra')) {
    symbol.classList.add('win-cobra');
    createParticlesForSymbol(symbol, 'cobra');
  } else if (fileName.includes('pinto')) {
    symbol.classList.add('win-pinto');
    createParticlesForSymbol(symbol, 'pinto');
  } else if (fileName.includes('arara')) {
    symbol.classList.add('win-arara');
    createParticlesForSymbol(symbol, 'arara');
  } else if (fileName.includes('checa')) {
    symbol.classList.add('win-checa');
    createParticlesForSymbol(symbol, 'checa');
  } else {
    symbol.classList.add('winning');
    createParticlesForSymbol(symbol, 'default');
  }
}

function createParticlesForSymbol(symbol, type) {
  const colors = {
    'tigre': 'gold',
    'aranha': 'red',
    'perereca': 'lime',
    'cobra': 'orange',
    'pinto': 'pink',
    'arara': 'cyan',
    'checa': 'violet',
    'default': 'white'
  };

  const wrapper = symbol.parentElement;
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('span');
    particle.className = `win-particle particle-${type}`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.backgroundColor = colors[type] || 'white';
    wrapper.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

function checkWin() {
  const reels = document.querySelectorAll('.reel-content');
  let win = 0;

  reels.forEach(reel => {
    Array.from(reel.querySelectorAll('.symbol')).forEach(child => {
      child.classList.remove('winning', 'win-tigre', 'win-aranha', 'win-perereca', 'win-cobra', 'win-pinto', 'win-arara', 'win-checa');
    });
  });

  const getFileName = (src) => src.substring(src.lastIndexOf('/') + 1);

  const visibleSymbols = [[], [], []];

  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const idx = stopIndexes[col] + row;
      if (idx < 0 || idx >= 20) continue;
      const wrapper = reels[col].children[idx];
      const symbol = wrapper.querySelector('img');
      visibleSymbols[row][col] = symbol;
    }
  }

  for (let row = 0; row < 3; row++) {
    const symbolsRow = visibleSymbols[row];
    if (symbolsRow.length < 3) continue;
    const names = symbolsRow.map(s => getFileName(s.src));
    if (names[0] === names[1] && names[1] === names[2]) {
      symbolsRow.forEach(s => {
        applyWinEffect(s);
        matchedSymbols.add(s);
      });
      win += bet * 5;
    }
  }

  if (visibleSymbols[0][0] && visibleSymbols[1][1] && visibleSymbols[2][2]) {
    const d1 = [visibleSymbols[0][0], visibleSymbols[1][1], visibleSymbols[2][2]];
    const nD1 = d1.map(s => getFileName(s.src));
    if (nD1[0] === nD1[1] && nD1[1] === nD1[2]) {
      d1.forEach(s => {
        applyWinEffect(s);
        matchedSymbols.add(s);
      });
      win += bet * 10;
    }
  }

  if (visibleSymbols[0][2] && visibleSymbols[1][1] && visibleSymbols[2][0]) {
    const d2 = [visibleSymbols[0][2], visibleSymbols[1][1], visibleSymbols[2][0]];
    const nD2 = d2.map(s => getFileName(s.src));
    if (nD2[0] === nD2[1] && nD2[1] === nD2[2]) {
      d2.forEach(s => {
        applyWinEffect(s);
        matchedSymbols.add(s);
      });
      win += bet * 10;
    }
  }

  if (win > 0) {
    credits += win;
    document.getElementById('creditsAmount').textContent = credits;
  }
}

function watchAd() {
  closeModal();
  credits += 50;
  document.getElementById('creditsAmount').textContent = credits;
}

function closeModal() {
  document.getElementById('outOfCreditsModal').style.display = 'none';
}

window.onload = initializeReels;
