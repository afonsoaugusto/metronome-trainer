// --- Seleciona os elementos do HTML ---
const bpmInput = document.getElementById('bpm-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const metronomeVisualizer = document.getElementById('metronome-visualizer');
const feedbackVisualizer = document.getElementById('feedback-visualizer');
const toleranceInput = document.getElementById('tolerance-input');
const hitsCountSpan = document.getElementById('hits-count');
const missesCountSpan = document.getElementById('misses-count');
const accuracyRateSpan = document.getElementById('accuracy-rate');
const resetMetricsBtn = document.getElementById('reset-metrics-btn');
// --- Sons ---
const bipSound = new Audio('bip.wav');
bipSound.preload = 'auto';
const clickSound = new Audio('click.wav');
clickSound.preload = 'auto';

// --- Variáveis de estado do metrônomo ---
let bpm = 120;
let currentBeat = 0; // Vai de 1 a 4
let beatInterval = 60000 / bpm;
let timerId = null;
let lastBeatTime = 0;

// --- Variáveis de métricas ---
let hits = 0;
let misses = 0;

// --- Função para atualizar o estado dos botões ---
function updateButtons(isMetronomeRunning) {
    startBtn.disabled = isMetronomeRunning;
    stopBtn.disabled = !isMetronomeRunning;
    bpmInput.disabled = isMetronomeRunning;
    toleranceInput.disabled = isMetronomeRunning;
    resetMetricsBtn.disabled = isMetronomeRunning;
}

// --- A "batida" do metrônomo ---
function tick() {
    // Registra o tempo exato da batida para comparação
    lastBeatTime = performance.now();

    // Avança a batida (1, 2, 3, 4, 1, 2, ...)
    currentBeat = (currentBeat % 4) + 1;

    // Remove classes antigas para limpar o visual
    metronomeVisualizer.classList.remove('beat-1', 'beat-other');

    // Pisca o quadrado do metrônomo com a cor certa
    if (currentBeat === 1) {
        metronomeVisualizer.classList.add('beat-1'); // Verde no tempo 1
    } else {
        metronomeVisualizer.classList.add('beat-other'); // Azul nos outros
    }

    // Define um tempo para "apagar" a luz, criando o efeito de piscar
    setTimeout(() => {
        metronomeVisualizer.classList.remove('beat-1', 'beat-other');
    }, 100); // A luz fica acesa por 100ms

    // Toca o som do bip
    bipSound.currentTime = 0;
    bipSound.play();
}

// --- Função para iniciar o metrônomo ---
function startMetronome() {
    bpm = parseInt(bpmInput.value, 10);
    if (isNaN(bpm) || bpm < 40 || bpm > 240) {
        alert("Por favor, insira um BPM entre 40 e 240.");
        return;
    }

    beatInterval = 60000 / bpm;
    currentBeat = 0; // Reseta a contagem

    // Inicia o loop de batidas
    tick(); // Chama a primeira batida imediatamente
    timerId = setInterval(tick, beatInterval);

    updateButtons(true);

    // Zera métricas ao iniciar
    resetMetrics();
}

// --- Função para parar o metrônomo ---
function stopMetronome() {
    clearInterval(timerId);
    timerId = null;
    currentBeat = 0;

    // Limpa os visuais
    metronomeVisualizer.classList.remove('beat-1', 'beat-other');
    feedbackVisualizer.classList.remove('feedback-correct', 'feedback-wrong');

    updateButtons(false);
}

// --- Função para mostrar o feedback do clique ---
function showFeedback(isCorrect) {
    // Remove classes antigas
    feedbackVisualizer.classList.remove('feedback-correct', 'feedback-wrong');

    // Adiciona a classe correta
    if (isCorrect) {
        feedbackVisualizer.classList.add('feedback-correct');
        hits++;
    } else {
        feedbackVisualizer.classList.add('feedback-wrong');
        misses++;
    }

    // Limpa o feedback visual após um tempo
    setTimeout(() => {
        feedbackVisualizer.classList.remove('feedback-correct', 'feedback-wrong');
    }, 500); // Feedback fica visível por meio segundo

    updateMetricsDisplay();
}

function updateMetricsDisplay() {
    hitsCountSpan.textContent = hits;
    missesCountSpan.textContent = misses;
    let total = hits + misses;
    let rate = total > 0 ? Math.round((hits / total) * 100) : 0;
    accuracyRateSpan.textContent = rate + '%';
}

function resetMetrics() {
    hits = 0;
    misses = 0;
    updateMetricsDisplay();
    // Limpa feedback visual
    feedbackVisualizer.classList.remove('feedback-correct', 'feedback-wrong');
}

// --- Função que avalia o tempo do clique ---
function checkTiming() {
    // Só avalia se o metrônomo estiver rodando
    if (!timerId) return;

    const now = performance.now();
    const timeSinceLastBeat = now - lastBeatTime;
    const timeUntilNextBeat = beatInterval - timeSinceLastBeat;

    // Define uma "janela de acerto" (tolerância)
    // 20% do intervalo da batida parece um bom começo
    // Pega o valor da tolerância do input (em porcentagem)
    let tolerancePercent = parseFloat(toleranceInput.value);
    if (isNaN(tolerancePercent) || tolerancePercent < 5 || tolerancePercent > 50) {
        tolerancePercent = 20; // fallback
    }
    const tolerance = beatInterval * (tolerancePercent / 100);

    // Verifica se o clique está perto da batida anterior OU da próxima
    if (timeSinceLastBeat <= tolerance || timeUntilNextBeat <= tolerance) {
        showFeedback(true); // Acertou!
    } else {
        showFeedback(false); // Errou!
    }
}

// --- Adiciona os Event Listeners ---

// Botão de Iniciar
startBtn.addEventListener('click', startMetronome);

// Botão de Parar
stopBtn.addEventListener('click', stopMetronome);

// Botão de Reiniciar Métricas
resetMetricsBtn.addEventListener('click', resetMetrics);

// Escuta a barra de espaço
window.addEventListener('keydown', (event) => {
    // Se a tecla for a barra de espaço
    if (event.code === 'Space') {
        event.preventDefault(); // Evita que a página role para baixo
        checkTiming();
        // Toca o som de click
        clickSound.currentTime = 0;
        clickSound.play();
    }
});