// ===== Games System =====
// Game Tab Switching
const gameButtons = document.querySelectorAll('.game-btn');
const gameContainers = document.querySelectorAll('.game-container');

gameButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const gameId = btn.dataset.game;
        
        // Deactivate all
        gameButtons.forEach(b => b.classList.remove('active'));
        gameContainers.forEach(c => c.classList.remove('active'));
        
        // Activate selected
        btn.classList.add('active');
        document.getElementById(`${gameId}-game`).classList.add('active');
        
        // Initialize game if needed
        initGameIfNeeded(gameId);
    });
});

function initGameIfNeeded(gameId) {
    if (gameId === 'snake' && !window.snakeInitialized) {
        initSnake();
        window.snakeInitialized = true;
    } else if (gameId === '2048' && !window.board2048Initialized) {
        init2048();
        window.board2048Initialized = true;
    } else if (gameId === 'tictactoe' && !window.ticTacToeInitialized) {
        initTicTacToe();
        window.ticTacToeInitialized = true;
    } else if (gameId === 'memory' && !window.memoryInitialized) {
        initMemory();
        window.memoryInitialized = true;
    } else if (gameId === 'quiz' && !window.quizInitialized) {
        initQuiz();
        window.quizInitialized = true;
    }
}

// ===== SNAKE GAME =====
function initSnake() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('snakeScore');
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let direction = {x: 1, y: 0};
    let nextDirection = {x: 1, y: 0};
    let score = 0;
    
    const gridSize = 20;
    const tileSize = canvas.width / gridSize;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && direction.y === 0) nextDirection = {x: 0, y: -1};
        if (e.key === 'ArrowDown' && direction.y === 0) nextDirection = {x: 0, y: 1};
        if (e.key === 'ArrowLeft' && direction.x === 0) nextDirection = {x: -1, y: 0};
        if (e.key === 'ArrowRight' && direction.x === 0) nextDirection = {x: 1, y: 0};
    });
    
    function update() {
        direction = nextDirection;
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
        
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
            snake.some(s => s.x === head.x && s.y === head.y)) {
            alert(`🐍 Game Over! Score: ${score}`);
            initSnake();
            return;
        }
        
        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.textContent = score;
            food = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        } else {
            snake.pop();
        }
    }
    
    function draw() {
        ctx.fillStyle = '#f0f6ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0066cc';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize - 2, tileSize - 2);
        });
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize - 2, tileSize - 2);
    }
    
    function gameLoop() {
        update();
        draw();
        setTimeout(gameLoop, 100);
    }
    
    gameLoop();
}

// ===== 2048 GAME =====
function init2048() {
    const boardElement = document.getElementById('board2048');
    const scoreDisplay = document.getElementById('score2048');
    const restartBtn = document.getElementById('restart2048');
    
    let board = Array(16).fill(0);
    let score = 0;
    
    function addNewTile() {
        const empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
        if (empty.length > 0) {
            const idx = empty[Math.floor(Math.random() * empty.length)];
            board[idx] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    function render() {
        boardElement.innerHTML = '';
        board.forEach((tile, i) => {
            const div = document.createElement('div');
            div.className = 'tile-2048' + (tile === 0 ? ' empty' : '');
            div.textContent = tile || '';
            div.style.background = tile === 0 ? '#f0f0f0' : getColor(tile);
            div.style.color = tile <= 4 ? '#333' : '#fff';
            boardElement.appendChild(div);
        });
        scoreDisplay.textContent = score;
    }
    
    function getColor(value) {
        const colors = {
            2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
            32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
            512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        return colors[value] || '#3c3c2f';
    }
    
    addNewTile();
    addNewTile();
    render();
    
    document.addEventListener('keydown', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        
        const move = {
            'ArrowUp': (b) => moveUp(b),
            'ArrowDown': (b) => moveDown(b),
            'ArrowLeft': (b) => moveLeft(b),
            'ArrowRight': (b) => moveRight(b)
        }[e.key];
        
        const before = board.join();
        move(board);
        if (board.join() !== before) addNewTile();
        render();
    });
    
    restartBtn.onclick = () => init2048();
    
    function moveLeft(b) {
        for (let i = 0; i < 4; i++) { 
            compress(b, i * 4, 1); 
            merge(b, i * 4, 1); 
            compress(b, i * 4, 1); 
        }
    }
    
    function moveRight(b) { 
        for (let i = 0; i < 4; i++) { 
            let row = [b[i * 4], b[i * 4 + 1], b[i * 4 + 2], b[i * 4 + 3]]; 
            row.reverse(); 
            compress(row, 0, 1); 
            merge(row, 0, 1); 
            compress(row, 0, 1); 
            row.reverse(); 
            b[i * 4] = row[0]; 
            b[i * 4 + 1] = row[1]; 
            b[i * 4 + 2] = row[2]; 
            b[i * 4 + 3] = row[3]; 
        } 
    }
    
    function moveUp(b) { 
        for (let i = 0; i < 4; i++) { 
            let col = [b[i], b[i + 4], b[i + 8], b[i + 12]]; 
            compress(col, 0, 1); 
            merge(col, 0, 1); 
            compress(col, 0, 1); 
            b[i] = col[0]; 
            b[i + 4] = col[1]; 
            b[i + 8] = col[2]; 
            b[i + 12] = col[3]; 
        } 
    }
    
    function moveDown(b) { 
        for (let i = 0; i < 4; i++) { 
            let col = [b[i], b[i + 4], b[i + 8], b[i + 12]]; 
            col.reverse(); 
            compress(col, 0, 1); 
            merge(col, 0, 1); 
            compress(col, 0, 1); 
            col.reverse(); 
            b[i] = col[0]; 
            b[i + 4] = col[1]; 
            b[i + 8] = col[2]; 
            b[i + 12] = col[3]; 
        } 
    }
    
    function compress(arr, start, step) { 
        for (let i = start; i < start + 12; i += step) { 
            if (arr[i + step] === 0) continue; 
            if (arr[i] === 0) { 
                arr[i] = arr[i + step]; 
                arr[i + step] = 0; 
                i -= step; 
            } 
        } 
    }
    
    function merge(arr, start, step) { 
        for (let i = start; i < start + 9; i += step) { 
            if (arr[i] === arr[i + step] && arr[i] !== 0) { 
                arr[i] *= 2; 
                score += arr[i]; 
                arr[i + step] = 0; 
            } 
        } 
    }
}

// ===== TIC-TAC-TOE GAME =====
function initTicTacToe() {
    const board = document.getElementById('tictactoeBoard');
    const status = document.getElementById('tictactoeStatus');
    const restartBtn = document.getElementById('restartTicTacToe');
    
    let gameBoard = Array(9).fill('');
    let isXNext = true;
    
    function calculateWinner(b) {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let [a,b1,c] of lines) if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
        return null;
    }
    
    function render() {
        board.innerHTML = '';
        gameBoard.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = `tictactoe-cell ${val ? val.toLowerCase() : ''}`;
            cell.textContent = val;
            cell.onclick = () => makeMove(idx);
            board.appendChild(cell);
        });
    }
    
    function makeMove(idx) {
        if (gameBoard[idx] || calculateWinner(gameBoard)) return;
        gameBoard[idx] = isXNext ? 'X' : 'O';
        isXNext = !isXNext;
        
        const winner = calculateWinner(gameBoard);
        if (winner) {
            status.textContent = `🎉 ${winner} gewinnt!`;
        } else if (gameBoard.every(c => c)) {
            status.textContent = '🤝 Unentschieden!';
        } else if (!isXNext) {
            setTimeout(computerMove, 500);
        }
        render();
    }
    
    function computerMove() {
        const empty = gameBoard.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        if (empty.length > 0) {
            const idx = empty[Math.floor(Math.random() * empty.length)];
            gameBoard[idx] = 'O';
            isXNext = true;
            const winner = calculateWinner(gameBoard);
            if (winner) status.textContent = `🎉 ${winner} gewinnt!`;
            else if (gameBoard.every(c => c)) status.textContent = '🤝 Unentschieden!';
            else status.textContent = 'Dein Zug (X)';
            render();
        }
    }
    
    restartBtn.onclick = initTicTacToe;
    render();
}

// ===== MEMORY GAME =====
function initMemory() {
    const board = document.getElementById('memoryBoard');
    const matchesDisplay = document.getElementById('memoryMatches');
    const restartBtn = document.getElementById('restartMemory');
    
    const symbols = ['🌟', '🎨', '🚀', '🎮', '🎸', '🌺', '⚡', '🎯'];
    let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    let isLocked = false;
    
    function render() {
        board.innerHTML = '';
        cards.forEach((card, idx) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.textContent = flipped.includes(idx) ? card : '?';
            cardEl.onclick = () => flipCard(idx);
            board.appendChild(cardEl);
        });
    }
    
    function flipCard(idx) {
        if (isLocked || flipped.includes(idx) || flipped.length >= 2) return;
        flipped.push(idx);
        render();
        
        if (flipped.length === 2) {
            isLocked = true;
            if (cards[flipped[0]] === cards[flipped[1]]) {
                matched++;
                matchesDisplay.textContent = matched;
                if (matched === symbols.length) alert('🎉 Du hast gewonnen!');
                flipped = [];
            } else {
                setTimeout(() => { flipped = []; render(); isLocked = false; }, 1000);
            }
        }
    }
    
    restartBtn.onclick = initMemory;
    render();
}

// ===== QUIZ GAME =====
function initQuiz() {
    const quizContent = document.getElementById('quizContent');
    
    const questions = [
        { q: 'Was ist JavaScript?', a: 'Eine Programmiersprache', o: ['Python', 'Java', 'C++'] },
        { q: 'Welche HTML-Tag für Absätze?', a: '<p>', o: ['<text>', '<par>', '<paragraph>'] },
        { q: 'CSS steht für...', a: 'Cascading Style Sheets', o: ['Creative Style System', 'Computer Style Sheets', 'Cascading Super Sheets'] },
        { q: 'Was ist HTTP?', a: 'Hypertext Transfer Protocol', o: ['High Transfer Text Protocol', 'Hyper Type Text Processor', 'Home Text Transfer Process'] },
        { q: 'Wer hat JavaScript erfunden?', a: 'Brendan Eich', o: ['Tim Berners-Lee', 'Guido van Rossum', 'Dennis Ritchie'] }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    
    function showQuestion() {
        if (currentQuestion >= questions.length) {
            quizContent.innerHTML = `<div class="quiz-result">
                <p style="font-size: 1.5rem;">🏆 Quiz beendet!</p>
                <p>Dein Score: ${score}/${questions.length}</p>
                <button class="btn-primary" onclick="location.reload()">Erneut spielen</button>
            </div>`;
            return;
        }
        
        const q = questions[currentQuestion];
        const options = [q.a, ...q.o].sort(() => Math.random() - 0.5);
        
        quizContent.innerHTML = `
            <div class="quiz-question">${currentQuestion + 1}. ${q.q}</div>
            <div class="quiz-options">
                ${options.map(opt => `<div class="quiz-option" onclick="answerQuestion('${opt}', '${q.a}')">${opt}</div>`).join('')}
            </div>
        `;
    }
    
    window.answerQuestion = function(selected, correct) {
        if (selected === correct) {
            score++;
            alert('✅ Richtig!');
        } else {
            alert(`❌ Falsch! Richtige Antwort: ${correct}`);
        }
        currentQuestion++;
        showQuestion();
    };
    
    showQuestion();
}
