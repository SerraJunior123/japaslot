let credits = 100;
const bets = [0.40, 0.80, 1.00, 2.50, 5.00, 10.00];
let betIndex = 0;
let bet = bets[betIndex];
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

let stopIndexes = [];
let matchedSymbols = new Set();

// Função para formatar créditos em reais
function formatCredits(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getRandomSymbol() {
  const weightedSymbols = [
    { symbol: 'images/tigre.webp', weight: 25 },
    { symbol: 'images/checa.webp', weight: 5 },       // Mais raro
    { symbol: 'images/aranha.webp', weight: 20 },
    { symbol: 'images/pinto.webp', weight: 20 },
    { symbol: 'images/cobra.webp', weight: 20 },
    { symbol: 'images/arara.webp', weight: 20 },
    { symbol: 'images/perereca.webp', weight: 20 }
  ];
  const totalWeight = weightedSymbols.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (let item of weightedSymbols) {
    if (random < item.weight) return item.symbol;
    random -= item.weight;
  }
  return weightedSymbols[0].symbol;
}

function initializeReels() {
  document.querySelectorAll('.reel-content').forEach(reel => {
    reel.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const img = document.createElement('img');
      img.src = getRandomSymbol();
      img.className = 'symbol';

      const wrapper = document.createElement('div');
      wrapper.className = 'symbol-wrapper';
      wrapper.appendChild(img);
      reel.appendChild(wrapper);
    }
  });
}


function changeBet(direction) {
  // direction: +1 ou -1
  betIndex = Math.min(Math.max(betIndex + direction, 0), bets.length - 1);
  bet = bets[betIndex];
  document.getElementById('betAmount').textContent = formatCredits(bet);
}

function spin(button) {
  if (isSpinning) return;
  if (credits < bet) {
    document.getElementById('outOfCreditsModal').style.display = 'flex';
    return;
  }
  
  // Remove efeitos anteriores dos símbolos vencedores
  matchedSymbols.forEach(s => {
    s.classList.remove(
      'winning', 'win-tigre', 'win-aranha', 'win-perereca',
      'win-cobra', 'win-pinto', 'win-arara', 'win-checa', 'infinite'
    );
  });
  matchedSymbols.clear();
  
  // Oculta a imagem bônus, se estiver visível
  const bonusImg = document.getElementById('bonusImage');
  if (bonusImg) {
    bonusImg.style.display = 'none';
    bonusImg.classList.remove('bounce-zoom');
  }
  
  isSpinning = true;
  credits -= bet;
  document.getElementById('creditsAmount').textContent = formatCredits(credits);
  
  // Cria partículas no botão girar
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
    symbol.classList.add('win-tigre', 'infinite');
    createParticlesForSymbol(symbol, 'tigre');
  } else if (fileName.includes('aranha')) {
    symbol.classList.add('win-aranha', 'infinite');
    createParticlesForSymbol(symbol, 'aranha');
  } else if (fileName.includes('perereca')) {
    symbol.classList.add('win-perereca', 'infinite');
    createParticlesForSymbol(symbol, 'perereca');
  } else if (fileName.includes('cobra')) {
    symbol.classList.add('win-cobra', 'infinite');
    createParticlesForSymbol(symbol, 'cobra');
  } else if (fileName.includes('pinto')) {
    symbol.classList.add('win-pinto', 'infinite');
    createParticlesForSymbol(symbol, 'pinto');
  } else if (fileName.includes('arara')) {
    symbol.classList.add('win-arara', 'infinite');
    createParticlesForSymbol(symbol, 'arara');
  } else if (fileName.includes('checa')) {
    symbol.classList.add('win-checa', 'infinite');
    createParticlesForSymbol(symbol, 'checa');
  } else {
    symbol.classList.add('winning', 'infinite');
    createParticlesForSymbol(symbol, 'default');
  }
}

function createParticlesForSymbol(symbol, type) {
  const colors = {
    'tigre': 'gold', 'aranha': 'red', 'perereca': 'lime',
    'cobra': 'orange', 'pinto': 'pink', 'arara': 'cyan',
    'checa': 'violet', 'default': 'white'
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

function createBonusEffect() {
  const bonusImg = document.getElementById('bonusImage');
  bonusImg.classList.add('bounce-zoom'); // Aplica o efeito bounce zoom (pulo com zoom)
  
  // Cria partículas extras (faíscas) ao redor da imagem bônus com duração de 4s
  for (let i = 0; i < 100; i++) {
    const spark = document.createElement('span');
    spark.className = 'bonus-particle';
    spark.style.left = `${50 + (Math.random() * 100 - 50)}%`;
    spark.style.top = `${50 + (Math.random() * 100 - 50)}%`;
    spark.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 4000);
  }
  
  // Remove a imagem bônus após 3 segundos
  setTimeout(() => {
    bonusImg.style.display = 'none';
    bonusImg.classList.remove('bounce-zoom');
  }, 3000);
}

function checkWin() {
  const reels = document.querySelectorAll('.reel-content');
  let win = 0;
  let checaCount = 0;
  
  reels.forEach(reel => {
    Array.from(reel.querySelectorAll('.symbol')).forEach(child => {
      child.classList.remove(
        'winning', 'win-tigre', 'win-aranha', 'win-perereca',
        'win-cobra', 'win-pinto', 'win-arara', 'win-checa', 'infinite'
      );
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
  
  const checkMatch = (symbolsArray, multiplier) => {
    if (symbolsArray.every(Boolean)) {
      const names = symbolsArray.map(s => getFileName(s.src));
      if (names.every(n => n === names[0])) {
        symbolsArray.forEach(s => {
          applyWinEffect(s);
          matchedSymbols.add(s);
          if (getFileName(s.src).includes('checa')) checaCount++;
        });
        win += bet * multiplier;
        // Se a combinação for de "checa" e horizontal (multiplier 3), adicionar jackpot bonus
        if (names[0].includes('checa') && multiplier === 3) {
          win += 50;
          console.log("Jackpot ativado para CHECA!");
        }
      }
    }
  };
  
  // Multiplicador horizontal reduzido para 3x
  for (let row = 0; row < 3; row++) {
    checkMatch(visibleSymbols[row], 3);
  }
  
  // Multiplicador diagonal reduzido para 6x
  checkMatch([visibleSymbols[0][0], visibleSymbols[1][1], visibleSymbols[2][2]], 6);
  checkMatch([visibleSymbols[0][2], visibleSymbols[1][1], visibleSymbols[2][0]], 6);
  
  if (win > 0) {
    credits += win;
    document.getElementById('creditsAmount').textContent = formatCredits(credits);
    
    // Exibe o bônus somente se houver pelo menos 3 "checa"
    if (checaCount >= 3) {
      const bonusImg = document.getElementById('bonusImage');
      if (bonusImg) {
        bonusImg.style.display = 'block';
        bonusImg.classList.add('bounce-zoom');
        createBonusEffect();
      }
    }
  }
}

function watchAd() {
  closeModal();
  credits += 50;
  document.getElementById('creditsAmount').textContent = formatCredits(credits);
}

function closeModal() {
  document.getElementById('outOfCreditsModal').style.display = 'none';
}

window.onload = initializeReels;
