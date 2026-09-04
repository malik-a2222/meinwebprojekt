import * as THREE from './vendor/three.module.min.js';

window.THREE = THREE;

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
    } else if (gameId === 'racer3d' && !window.racer3dInitialized) {
        initRacer3d();
        window.racer3dInitialized = true;
    }
}

// ===== 3D RACER =====
function initRacer3d() {
    const sceneElement = document.getElementById('racer3dScene');
    const scoreDisplay = document.getElementById('racer3dScore');
    const statusDisplay = document.getElementById('racer3dStatus');
    const restartButton = document.getElementById('restartRacer3d');
    const leftButton = document.getElementById('racer3dLeft');
    const rightButton = document.getElementById('racer3dRight');

    if (!sceneElement || !window.THREE) {
        statusDisplay.textContent = 'Das 3D-Spiel konnte nicht geladen werden.';
        return;
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9ed9ff);
    scene.fog = new THREE.Fog(0x9ed9ff, 35, 115);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
    camera.position.set(0, 5.8, 11);
    camera.lookAt(0, 0.8, -18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    sceneElement.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe5f5ff, 0x34516b, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(-8, 14, 8);
    sun.castShadow = true;
    scene.add(sun);

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 160),
        new THREE.MeshStandardMaterial({ color: 0x27364a, roughness: 0.92 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.z = -28;
    road.receiveShadow = true;
    scene.add(road);

    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x45a66f });
    [-10, 10].forEach(x => {
        const shoulder = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 160), shoulderMaterial);
        shoulder.position.set(x, -0.08, -28);
        scene.add(shoulder);
    });

    const laneMarkers = [];
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xf6d365, emissive: 0x5b4310 });
    [-2.1, 2.1].forEach(x => {
        for (let z = -78; z < 22; z += 8) {
            const marker = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 3.5), markerMaterial);
            marker.position.set(x, 0.03, z);
            scene.add(marker);
            laneMarkers.push(marker);
        }
    });

    const car = new THREE.Group();
    const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.42, 2.7),
        new THREE.MeshStandardMaterial({ color: 0x0b75d1, metalness: 0.35, roughness: 0.3 })
    );
    carBody.position.y = 0.48;
    carBody.castShadow = true;
    car.add(carBody);
    const cockpit = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.36, 1.05),
        new THREE.MeshStandardMaterial({ color: 0x152b45, metalness: 0.15, roughness: 0.2 })
    );
    cockpit.position.set(0, 0.82, 0.15);
    cockpit.castShadow = true;
    car.add(cockpit);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x10141b, roughness: 0.8 });
    [[-0.83, 0.3, -0.8], [0.83, 0.3, -0.8], [-0.83, 0.3, 0.8], [0.83, 0.3, 0.8]].forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 16), wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        car.add(wheel);
    });
    car.position.set(0, 0, 7);
    scene.add(car);

    const lanes = [-4.2, 0, 4.2];
    const obstacles = [];
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xef5b5b, roughness: 0.5 });
    for (let index = 0; index < 4; index += 1) {
        const obstacle = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.15, 1.65), obstacleMaterial);
        obstacle.position.set(lanes[index % lanes.length], 0.58, -18 - index * 18);
        obstacle.castShadow = true;
        scene.add(obstacle);
        obstacles.push(obstacle);
    }

    let lane = 1;
    let score = 0;
    let speed = 0.22;
    let running = true;
    let lastTime = performance.now();

    function moveLane(direction) {
        if (!running) return;
        lane = Math.max(0, Math.min(lanes.length - 1, lane + direction));
    }

    function restart() {
        lane = 1;
        score = 0;
        speed = 0.22;
        running = true;
        scoreDisplay.textContent = '0';
        statusDisplay.textContent = 'A/D zum Spurwechsel';
        obstacles.forEach((obstacle, index) => {
            obstacle.position.set(lanes[index % lanes.length], 0.58, -18 - index * 18);
        });
    }

    function resize() {
        const width = sceneElement.clientWidth;
        const height = sceneElement.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }

    function animate(time) {
        requestAnimationFrame(animate);
        const delta = Math.min((time - lastTime) / 16.67, 2);
        lastTime = time;
        car.position.x += (lanes[lane] - car.position.x) * 0.12 * delta;
        laneMarkers.forEach(marker => {
            marker.position.z += speed * 2.8 * delta;
            if (marker.position.z > 20) marker.position.z -= 104;
        });
        if (running) {
            obstacles.forEach((obstacle, index) => {
                obstacle.position.z += speed * delta;
                obstacle.rotation.y += 0.01 * delta;
                if (obstacle.position.z > 13) {
                    obstacle.position.z = -55 - index * 9 - Math.random() * 12;
                    obstacle.position.x = lanes[Math.floor(Math.random() * lanes.length)];
                    score += 1;
                    speed = Math.min(0.52, speed + 0.004);
                    scoreDisplay.textContent = score;
                }
                if (Math.abs(obstacle.position.x - car.position.x) < 1.35 && Math.abs(obstacle.position.z - car.position.z) < 1.8) {
                    running = false;
                    statusDisplay.textContent = `Crash! Score: ${score}. Drücke Neu starten.`;
                }
            });
        }
        renderer.render(scene, camera);
    }

    document.addEventListener('keydown', event => {
        if (event.key.toLowerCase() === 'a') moveLane(-1);
        if (event.key.toLowerCase() === 'd') moveLane(1);
    });
    leftButton.addEventListener('click', () => moveLane(-1));
    rightButton.addEventListener('click', () => moveLane(1));
    restartButton.addEventListener('click', restart);
    window.addEventListener('resize', resize);
    resize();
    restart();
    requestAnimationFrame(animate);
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
