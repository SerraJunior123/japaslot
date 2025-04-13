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

// Som de vitória – utilizado via JavaScript
const winSound = new Audio('sounds/win.mp3');
winSound.volume = 0.9; // Ajuste o volume conforme necessário

let stopIndexes = [];
let matchedSymbols = new Set();

// Função para formatar créditos em reais
function formatCredits(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Retorna um símbolo aleatório considerando pesos
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

// Inicializa os rolos preenchendo-os com 20 símbolos cada
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

// Altera o valor da aposta conforme a direção (+ ou -)
function changeBet(direction) {
  betIndex = Math.min(Math.max(betIndex + direction, 0), bets.length - 1);
  bet = bets[betIndex];
  const betAmountEl = document.getElementById('betAmount');
  if (betAmountEl) {
    betAmountEl.textContent = formatCredits(bet);
  }
}

// Função para iniciar o som de fundo
function startBackgroundSound() {
  const bgSound = document.getElementById("bgSound");
  if (bgSound && bgSound.paused) {
    bgSound.volume = 0.4; 
    bgSound.currentTime = 0;
    bgSound.play().catch(err => console.warn("Não foi possível iniciar o áudio de fundo:", err));
  }
}

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    bgSound.pause();
  } else {
    bgSound.play().catch(e => {
      console.warn("Erro ao retomar a música de fundo:", e);
    });
  }
});

// Função que executa o giro dos rolos
function spin(button) {
  // Inicia o som de fundo na primeira interação, se ainda não estiver tocando
  startBackgroundSound();

  // Toca o som de clique ao pressionar o botão
  const clickSound = document.getElementById("clickSound");
  if (clickSound) {
    clickSound.volume = 0.7; 
    clickSound.currentTime = 0;
    clickSound.play().catch(err => console.warn("Erro ao reproduzir o som de clique:", err));
  }
  
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
  
  // Oculta a imagem bônus, se estiver visível
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

// Aplica efeito de vitória conforme o símbolo
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

// Cria partículas temáticas para cada tipo de símbolo vencedor
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

// Cria efeito bônus (partículas e animação bounce)
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

// Cria efeito de explosão de moedas
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

// Verifica combinações vencedoras na matriz 3x3 dos símbolos visíveis
function checkWin() {
  const reels = document.querySelectorAll('.reel-content');
  let win = 0;
  let checaCount = 0;
  
  // Remove classes de vitória anteriores
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
  
  // Monta uma matriz 3x3 com os símbolos visíveis de cada rolo
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
  
  // Verifica combinações horizontais
  for (let row = 0; row < 3; row++) {
    checkMatch(visibleSymbols[row], 3);
  }
  // Verifica combinações diagonais
  checkMatch([visibleSymbols[0][0], visibleSymbols[1][1], visibleSymbols[2][2]], 6);
  checkMatch([visibleSymbols[0][2], visibleSymbols[1][1], visibleSymbols[2][0]], 6);
  
  if (win > 0) {
    credits += win;
    const creditsAmountEl = document.getElementById('creditsAmount');
    if (creditsAmountEl) {
      creditsAmountEl.textContent = formatCredits(credits);
    }
    
    // Reproduz o som de vitória, reiniciando o áudio e tratando possíveis erros
    winSound.currentTime = 0;
    winSound.play().catch(error => console.warn("Erro ao reproduzir som de vitória:", error));
    
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
async function buyCredits() {
  try {
    const transacaoId = Date.now(); // ID único
    const valor = 10; // R$10,00

    const response = await fetch('http://localhost:3000/criar-pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: valor,
        description: 'Compra de créditos para jogo',
      }),
    });

    if (!response.ok) {
      throw new Error('Falha na requisição: ' + response.statusText);
    }

    const data = await response.json();
    const urlPagamento = data.init_point; // URL para pagamento, assumindo que está no campo init_point

    // Redireciona para a URL de pagamento
    window.open(urlPagamento, '_blank');
  } catch (error) {
    console.error('Erro na requisição para criar o pagamento:', error);
  }
}

function updateCreditsDisplay() {
  // Supondo que você tenha uma variável 'credits' para atualizar a quantidade de créditos
  document.getElementById("creditsAmount").textContent = credits;
}


// Incrementa créditos após assistir a um anúncio
function watchAd() {
  closeModal();
  credits += 50;
  const creditsAmountEl = document.getElementById('creditsAmount');
  if (creditsAmountEl) {
    creditsAmountEl.textContent = formatCredits(credits);
  }
}

// Fecha o modal de créditos insuficientes
function closeModal() {
  const modal = document.getElementById('outOfCreditsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Função de animação adicional para os símbolos vencedores (utilizando anime.js)
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

// Inicializa os rolos e associa o evento de clique ao botão de girar após o carregamento do DOM
window.onload = function() {
  initializeReels();
  const spinBtn = document.getElementById("spinButton");
  if (spinBtn) {
    spinBtn.addEventListener("click", function() {
      spin(this);
    });
  }
  window.addEventListener("load", () => {
    const creditoPendentes = localStorage.getItem("addCredits");
    if (creditoPendentes) {
      let atual = parseInt(document.getElementById("creditsAmount").textContent);
      atual += parseInt(creditoPendentes);
      document.getElementById("creditsAmount").textContent = atual;
  
      localStorage.removeItem("addCredits");
      alert(`Você recebeu ${creditoPendentes} créditos!`);
    }
  });
  
};

// Tela de carregamento: mostra uma barra de progresso e depois oculta a tela
window.addEventListener("DOMContentLoaded", function () {
  const loadingBar = document.getElementById("loading-bar");
  const loadingPercent = document.getElementById("loading-percent");
  const loadingView = document.getElementById("loading-view");

  if (!loadingBar || !loadingPercent || !loadingView) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadingView.style.opacity = 0;
        setTimeout(() => {
          loadingView.style.display = "none";
        }, 1000);
      }, 1000);
    }
    loadingBar.style.width = progress + "%";
    loadingPercent.textContent = Math.floor(progress) + "%";
  }, 50);
});

window.scrollTo(0, 0);
