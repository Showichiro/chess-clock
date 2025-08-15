let player1Time = 600000;
let player2Time = 600000;
let initialTime = 600000;
let currentPlayer = null;
let timerInterval = null;
let isRunning = false;
let switchMode = 'continue';
let lastUpdateTime = null;
let byoyomiEnabled = true;
let byoyomiSeconds = 30;
let player1Byoyomi = false;
let player2Byoyomi = false;
let player1ByoyomiTime = 0;
let player2ByoyomiTime = 0;

function loadSettings() {
    const savedSettings = localStorage.getItem('chessClockSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        initialTime = settings.initialTime || 600000;
        switchMode = settings.switchMode || 'continue';
        byoyomiEnabled = settings.byoyomiEnabled !== undefined ? settings.byoyomiEnabled : true;
        byoyomiSeconds = settings.byoyomiSeconds || 30;
        
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
        document.getElementById('byoyomiEnabled').checked = byoyomiEnabled;
        document.getElementById('byoyomiSeconds').value = byoyomiSeconds;
    }
    
    player1Time = initialTime;
    player2Time = initialTime;
    player1Byoyomi = false;
    player2Byoyomi = false;
    player1ByoyomiTime = 0;
    player2ByoyomiTime = 0;
    updateDisplay();
}

function saveSettings() {
    const settings = {
        initialTime: initialTime,
        switchMode: switchMode,
        byoyomiEnabled: byoyomiEnabled,
        byoyomiSeconds: byoyomiSeconds
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
    
    // 秒読みモードの表示
    if (player1Byoyomi) {
        const byoyomiTime = Math.ceil(player1ByoyomiTime / 1000);
        timer1.textContent = `秒読み ${byoyomiTime}秒`;
        timer1.classList.add('time-up');
    } else {
        timer1.textContent = formatTime(player1Time);
        if (player1Time <= 0 && byoyomiEnabled) {
            timer1.classList.add('time-up');
        } else if (player1Time <= 0 && !byoyomiEnabled) {
            timer1.classList.add('time-up');
            stopTimer();
        } else {
            timer1.classList.remove('time-up');
        }
    }
    
    if (player2Byoyomi) {
        const byoyomiTime = Math.ceil(player2ByoyomiTime / 1000);
        timer2.textContent = `秒読み ${byoyomiTime}秒`;
        timer2.classList.add('time-up');
    } else {
        timer2.textContent = formatTime(player2Time);
        if (player2Time <= 0 && byoyomiEnabled) {
            timer2.classList.add('time-up');
        } else if (player2Time <= 0 && !byoyomiEnabled) {
            timer2.classList.add('time-up');
            stopTimer();
        } else {
            timer2.classList.remove('time-up');
        }
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
            if (player1Byoyomi) {
                // 秒読みモード
                player1ByoyomiTime = Math.max(0, player1ByoyomiTime - elapsed);
                if (player1ByoyomiTime === 0) {
                    stopTimer();
                    alert('プレイヤー1の秒読み時間切れです！');
                }
            } else {
                // 通常モード
                player1Time = Math.max(0, player1Time - elapsed);
                if (player1Time === 0 && byoyomiEnabled) {
                    // 秒読みモードへ移行
                    player1Byoyomi = true;
                    player1ByoyomiTime = byoyomiSeconds * 1000;
                } else if (player1Time === 0 && !byoyomiEnabled) {
                    stopTimer();
                    alert('プレイヤー1の時間切れです！');
                }
            }
        } else if (currentPlayer === 2) {
            if (player2Byoyomi) {
                // 秒読みモード
                player2ByoyomiTime = Math.max(0, player2ByoyomiTime - elapsed);
                if (player2ByoyomiTime === 0) {
                    stopTimer();
                    alert('プレイヤー2の秒読み時間切れです！');
                }
            } else {
                // 通常モード
                player2Time = Math.max(0, player2Time - elapsed);
                if (player2Time === 0 && byoyomiEnabled) {
                    // 秒読みモードへ移行
                    player2Byoyomi = true;
                    player2ByoyomiTime = byoyomiSeconds * 1000;
                } else if (player2Time === 0 && !byoyomiEnabled) {
                    stopTimer();
                    alert('プレイヤー2の時間切れです！');
                }
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
    
    // アクティブなプレイヤーをタップした時のみ切り替える
    if (playerNum && playerNum !== currentPlayer) return;
    
    const previousPlayer = currentPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    // 秒読みモードのリセット（プレイヤーが切り替わった時）
    if (previousPlayer === 1 && player1Byoyomi) {
        player1ByoyomiTime = byoyomiSeconds * 1000;
    } else if (previousPlayer === 2 && player2Byoyomi) {
        player2ByoyomiTime = byoyomiSeconds * 1000;
    }
    
    if (switchMode === 'reset' && previousPlayer) {
        if (previousPlayer === 1) {
            player1Time = initialTime;
            player1Byoyomi = false;
            player1ByoyomiTime = 0;
        } else {
            player2Time = initialTime;
            player2Byoyomi = false;
            player2ByoyomiTime = 0;
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
    player1Byoyomi = false;
    player2Byoyomi = false;
    player1ByoyomiTime = 0;
    player2ByoyomiTime = 0;
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
    
    byoyomiEnabled = document.getElementById('byoyomiEnabled').checked;
    byoyomiSeconds = parseInt(document.getElementById('byoyomiSeconds').value) || 30;
    
    saveSettings();
    resetTimers();
    
    alert('設定が適用されました');
}


function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
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