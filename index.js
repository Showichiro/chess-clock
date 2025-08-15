let player1Time = 600000;
let player2Time = 600000;
let initialTime = 600000;
let currentPlayer = null;
let timerInterval = null;
let isRunning = false;
let switchMode = 'continue';
let lastUpdateTime = null;

function loadSettings() {
    const savedSettings = localStorage.getItem('chessClockSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        initialTime = settings.initialTime || 600000;
        switchMode = settings.switchMode || 'continue';
        
        const modeRadios = document.getElementsByName('switchMode');
        modeRadios.forEach(radio => {
            if (radio.value === switchMode) {
                radio.checked = true;
            }
        });
        
        const totalSeconds = Math.floor(initialTime / 1000);
        document.getElementById('hours').value = Math.floor(totalSeconds / 3600);
        document.getElementById('minutes').value = Math.floor((totalSeconds % 3600) / 60);
        document.getElementById('seconds').value = totalSeconds % 60;
    }
    
    player1Time = initialTime;
    player2Time = initialTime;
    updateDisplay();
}

function saveSettings() {
    const settings = {
        initialTime: initialTime,
        switchMode: switchMode
    };
    localStorage.setItem('chessClockSettings', JSON.stringify(settings));
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
    const timer1 = document.getElementById('timer1');
    const timer2 = document.getElementById('timer2');
    const player1El = document.getElementById('player1');
    const player2El = document.getElementById('player2');
    const controlsEl = document.getElementById('controls');
    
    timer1.textContent = formatTime(player1Time);
    timer2.textContent = formatTime(player2Time);
    
    if (player1Time <= 0) {
        timer1.classList.add('time-up');
        stopTimer();
    } else {
        timer1.classList.remove('time-up');
    }
    
    if (player2Time <= 0) {
        timer2.classList.add('time-up');
        stopTimer();
    } else {
        timer2.classList.remove('time-up');
    }
    
    if (currentPlayer === 1) {
        player1El.classList.add('active');
        player2El.classList.remove('active');
        controlsEl.className = 'controls position-player1';
    } else if (currentPlayer === 2) {
        player1El.classList.remove('active');
        player2El.classList.add('active');
        controlsEl.className = 'controls position-player2';
    } else {
        player1El.classList.remove('active');
        player2El.classList.remove('active');
        controlsEl.className = 'controls position-neutral';
    }
}

function startTimer() {
    if (!currentPlayer) {
        currentPlayer = 1;
    }
    
    isRunning = true;
    lastUpdateTime = Date.now();
    document.getElementById('startPauseBtn').textContent = '一時停止';
    
    timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastUpdateTime;
        lastUpdateTime = now;
        
        if (currentPlayer === 1) {
            player1Time = Math.max(0, player1Time - elapsed);
            if (player1Time === 0) {
                stopTimer();
                alert('プレイヤー1の時間切れです！');
            }
        } else if (currentPlayer === 2) {
            player2Time = Math.max(0, player2Time - elapsed);
            if (player2Time === 0) {
                stopTimer();
                alert('プレイヤー2の時間切れです！');
            }
        }
        
        updateDisplay();
    }, 10);
}

function stopTimer() {
    isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.getElementById('startPauseBtn').textContent = 'スタート';
}

function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function switchPlayer(playerNum) {
    if (!isRunning) return;
    
    if (playerNum && playerNum === currentPlayer) return;
    
    const previousPlayer = currentPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    if (switchMode === 'reset' && previousPlayer) {
        if (previousPlayer === 1) {
            player1Time = initialTime;
        } else {
            player2Time = initialTime;
        }
    }
    
    lastUpdateTime = Date.now();
    updateDisplay();
}

function switchCurrentPlayer() {
    if (!isRunning) {
        // タイマーが動いていない場合は、開始してから切り替え
        if (!currentPlayer) {
            currentPlayer = 1;
        }
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateDisplay();
    } else {
        // タイマーが動いている場合は通常の切り替え
        switchPlayer();
    }
}

function resetTimers() {
    stopTimer();
    currentPlayer = null;
    player1Time = initialTime;
    player2Time = initialTime;
    updateDisplay();
}

function applySettings() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    
    initialTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
    
    const modeRadios = document.getElementsByName('switchMode');
    modeRadios.forEach(radio => {
        if (radio.checked) {
            switchMode = radio.value;
        }
    });
    
    saveSettings();
    resetTimers();
    
    alert('設定が適用されました');
}


window.addEventListener('beforeunload', (e) => {
    if (isRunning) {
        e.preventDefault();
        e.returnValue = 'タイマーが動作中です。ページを離れますか？';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateDisplay();
});