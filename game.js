// Variáveis globais e configuração inicial
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
    { symbol: 'images/checa.webp', weight: 5 },
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
  // Procura pelos elementos com a classe .reel-content
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
  betIndex = Math.min(Math.max(betIndex + direction, 0), bets.length - 1);
  bet = bets[betIndex];
  // Verifica se o elemento existe antes de modificar o textContent
  const betAmountEl = document.getElementById('betAmount');
  if (betAmountEl) {
    betAmountEl.textContent = formatCredits(bet);
  }
}

function spin(button) {
  if (isSpinning) return;
  if (credits < bet) {
    const modal = document.getElementById('outOfCreditsModal');
    if (modal) {
      modal.style.display = 'flex';
    }
    return;
  }
  
  // Remove efeitos anteriores de símbolos vencedores
  matchedSymbols.forEach(s => {
    s.classList.remove(
      'winning', 'win-tigre', 'win-aranha', 'win-perereca',
      'win-cobra', 'win-pinto', 'win-arara', 'win-checa', 'infinite'
    );
  });
  matchedSymbols.clear();
  
  // Oculta imagem bônus, se visível
  const bonusImg = document.getElementById('bonusImage');
  if (bonusImg) {
    bonusImg.style.display = 'none';
    bonusImg.classList.remove('bounce-zoom');
  }
  
  isSpinning = true;
  credits -= bet;
  const creditsAmountEl = document.getElementById('creditsAmount');
  if (creditsAmountEl) {
    creditsAmountEl.textContent = formatCredits(credits);
  }
  
  // Cria partículas animadas no botão de girar
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
    if (reel.parentElement) {
      reel.parentElement.classList.add('shake');
    }
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
    reels.forEach(reel => {
      if (reel.parentElement) {
        reel.parentElement.classList.remove('shake');
      }
    });
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
  if (bonusImg) {
    bonusImg.classList.add('bounce-zoom');
    for (let i = 0; i < 100; i++) {
      const spark = document.createElement('span');
      spark.className = 'bonus-particle';
      spark.style.left = `${50 + (Math.random() * 100 - 50)}%`;
      spark.style.top = `${50 + (Math.random() * 100 - 50)}%`;
      spark.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 4000);
    }
    setTimeout(() => {
      bonusImg.style.display = 'none';
      bonusImg.classList.remove('bounce-zoom');
    }, 3000);
  }
}

function createCoinExplosion() {
  const container = document.body;
  for (let i = 0; i < 30; i++) {
    const coin = document.createElement('span');
    coin.className = 'coin-explosion';
    coin.style.left = `${50 + (Math.random() * 40 - 20)}%`;
    coin.style.top = `${50 + (Math.random() * 40 - 20)}%`;
    container.appendChild(coin);
    setTimeout(() => coin.remove(), 1500);
  }
}

function checkWin() {
  const reels = document.querySelectorAll('.reel-content');
  let win = 0;
  let checaCount = 0;
  
  // Remove classes de símbolos vencedores antigos
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
  
  // Monta uma matriz 3x3 dos símbolos visíveis
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const idx = stopIndexes[col] + row;
      if (idx < 0 || idx >= 20) continue;
      const wrapper = reels[col].children[idx];
      if (!wrapper) continue;
      const symbol = wrapper.querySelector('img');
      if (!symbol) continue;
      visibleSymbols[row][col] = symbol;
    }
  }
  
  // Função auxiliar para checar combinações
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
        if (names[0].includes('checa') && multiplier === 3) {
          win += 50;
          console.log("Jackpot ativado para CHECA!");
        }
      }
    }
  };
  
  // Combinações horizontais
  for (let row = 0; row < 3; row++) {
    checkMatch(visibleSymbols[row], 3);
  }
  
  // Diagonais
  checkMatch([visibleSymbols[0][0], visibleSymbols[1][1], visibleSymbols[2][2]], 6);
  checkMatch([visibleSymbols[0][2], visibleSymbols[1][1], visibleSymbols[2][0]], 6);
  
  if (win > 0) {
    credits += win;
    const creditsAmountEl = document.getElementById('creditsAmount');
    if (creditsAmountEl) {
      creditsAmountEl.textContent = formatCredits(credits);
    }
    createCoinExplosion();
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
  const creditsAmountEl = document.getElementById('creditsAmount');
  if (creditsAmountEl) {
    creditsAmountEl.textContent = formatCredits(credits);
  }
}

function closeModal() {
  const modal = document.getElementById('outOfCreditsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function animarSimbolosVencedores() {
  anime({
    targets: '.win-symbol',
    scale: [1, 1.4],
    opacity: [1, 0.6],
    duration: 400,
    easing: 'easeInOutQuad',
    direction: 'alternate',
    loop: 3
  });
  setTimeout(() => {
    document.querySelectorAll('.win-symbol').forEach(el => {
      el.classList.remove('win-symbol');
    });
  }, 2000);
}

// Configuração do efeito de fogo para o container "fireEffect" via tsParticles
tsParticles.load("fireEffect", {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  particles: {
    number: { value: 0 },
    color: { value: ["#FF4500", "#FFA500", "#FFD700"] },
    shape: { type: "circle" },
    size: {
      value: { min: 5, max: 12 },
      animation: { enable: true, speed: 5, minimumValue: 3 }
    },
    opacity: {
      value: { min: 0.4, max: 1 },
      animation: { enable: true, speed: 2, minimumValue: 0.1 }
    },
    move: {
      enable: true,
      speed: { min: 10, max: 20 },
      direction: "top",
      outModes: { default: "destroy" },
      straight: false
    }
  },
  emitters: {
    direction: "top",
    life: { count: 0, duration: 0.1, delay: 0 },
    rate: { delay: 0.1, quantity: 5 },
    size: { width: 100, height: 0 },
    position: { x: 50, y: 100 }
  },
  interactivity: { events: {} }
});

// Inicializa os rolos e associa o evento ao botão de girar, garantindo que o DOM já esteja carregado
window.onload = function() {
  initializeReels();
  const spinBtn = document.getElementById("spinButton");
  if (spinBtn) {
    spinBtn.addEventListener("click", function() {
      spin(this);
    });
  }
};

// Tela de carregamento
window.addEventListener("DOMContentLoaded", function () {
  const loadingBar = document.getElementById("loading-bar");
  const loadingPercent = document.getElementById("loading-percent");
  const loadingView = document.getElementById("loading-view");

  // Só prossegue se todos os elementos estiverem presentes
  if (!loadingBar || !loadingPercent || !loadingView) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 3; // aumenta mais lentamente
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadingView.style.opacity = 0;
        setTimeout(() => {
          loadingView.style.display = "none";
        }, 1000);
      }, 1000); // tempo extra antes de sumir
    }
    loadingBar.style.width = progress + "%";
    loadingPercent.textContent = Math.floor(progress) + "%";
  }, 50);

  // ... pode incluir aqui outras inicializações se necessário ...
});
