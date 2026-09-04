const worldModal = document.getElementById('worldModal');
const worldCanvas = document.getElementById('worldCanvas');
const worldTitle = document.getElementById('worldModalTitle');
const worldHelp = document.getElementById('worldModalHelp');
const worldScore = document.getElementById('worldScore');
const worldStatus = document.getElementById('worldStatus');
const closeWorldModal = document.getElementById('closeWorldModal');
const restartWorld = document.getElementById('restartWorld');
const worldButtons = document.querySelectorAll('.world-play, .join-button');

if (worldModal && worldCanvas) {
    const context = worldCanvas.getContext('2d');
    let animationFrame;
    let running = false;
    let levelName = 'Sky Jump';
    let score = 0;
    let player;
    let platforms;
    let hazards;
    let finish;
    const keys = {};

    function createLevel() {
        platforms = [
            { x: 0, y: 370, width: 180, height: 50 },
            { x: 230, y: 320, width: 130, height: 22 },
            { x: 415, y: 260, width: 125, height: 22 },
            { x: 590, y: 205, width: 130, height: 22 },
            { x: 335, y: 165, width: 95, height: 22 }
        ];
        hazards = [
            { x: 180, y: 398, width: 50, height: 22 },
            { x: 360, y: 398, width: 55, height: 22 },
            { x: 540, y: 398, width: 50, height: 22 }
        ];
        finish = { x: 650, y: 145, width: 35, height: 60 };
        player = { x: 45, y: 320, width: 26, height: 36, velocityY: 0, grounded: false };
    }

    function resetGame() {
        cancelAnimationFrame(animationFrame);
        createLevel();
        score = 0;
        running = true;
        worldScore.textContent = '0';
        worldStatus.textContent = 'Erreiche das goldene Ziel.';
        animationFrame = requestAnimationFrame(gameLoop);
    }

    function openWorld(name) {
        levelName = name || 'Sky Jump';
        worldTitle.textContent = levelName;
        worldHelp.textContent = 'A/D oder Pfeile bewegen · Leertaste springen';
        worldModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetGame();
    }

    function closeWorld() {
        running = false;
        cancelAnimationFrame(animationFrame);
        worldModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function overlaps(first, second) {
        return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
    }

    function movePlayer() {
        const direction = (keys.a || keys.arrowleft ? -1 : 0) + (keys.d || keys.arrowright ? 1 : 0);
        player.x = Math.max(0, Math.min(worldCanvas.width - player.width, player.x + direction * 4));
        if ((keys[' '] || keys.w || keys.arrowup) && player.grounded) {
            player.velocityY = -11;
            player.grounded = false;
        }
        player.velocityY += 0.55;
        player.y += player.velocityY;
        player.grounded = false;
        platforms.forEach(platform => {
            const falling = player.velocityY >= 0;
            const landed = player.y + player.height >= platform.y && player.y + player.height <= platform.y + platform.height + 10;
            const horizontal = player.x + player.width > platform.x && player.x < platform.x + platform.width;
            if (falling && landed && horizontal) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        });
        if (player.y > worldCanvas.height + 30) loseGame();
        hazards.forEach(hazard => {
            if (overlaps(player, hazard)) loseGame();
        });
        if (overlaps(player, finish)) winGame();
    }

    function loseGame() {
        if (!running) return;
        running = false;
        worldStatus.textContent = 'Autsch! Drücke „Neu starten“ und versuche es erneut.';
    }

    function winGame() {
        if (!running) return;
        running = false;
        score += 100;
        worldScore.textContent = score;
        worldStatus.textContent = 'Ziel erreicht! Du hast die Welt geschafft.';
    }

    function draw() {
        context.clearRect(0, 0, worldCanvas.width, worldCanvas.height);
        context.fillStyle = '#bfe7ff';
        context.fillRect(0, 0, worldCanvas.width, worldCanvas.height);
        context.fillStyle = '#ffffff';
        [[80, 70, 100, 20], [290, 90, 130, 20], [500, 55, 100, 20]].forEach(([x, y, width, height]) => context.fillRect(x, y, width, height));
        context.fillStyle = '#8fd19e';
        context.fillRect(0, 420, worldCanvas.width, 40);
        platforms.forEach(platform => {
            context.fillStyle = '#5b9bd5';
            context.fillRect(platform.x, platform.y, platform.width, platform.height);
            context.fillStyle = 'rgba(255,255,255,0.3)';
            context.fillRect(platform.x, platform.y, platform.width, 5);
        });
        hazards.forEach(hazard => {
            context.fillStyle = '#ef4444';
            context.beginPath();
            context.moveTo(hazard.x, hazard.y + hazard.height);
            context.lineTo(hazard.x + hazard.width / 2, hazard.y);
            context.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
            context.fill();
        });
        context.fillStyle = '#ffd34e';
        context.fillRect(finish.x, finish.y, finish.width, finish.height);
        context.fillStyle = '#202a3a';
        context.fillRect(finish.x + 7, finish.y + 10, 22, 5);
        context.fillStyle = '#2f80ed';
        context.fillRect(player.x, player.y, player.width, player.height);
        context.fillStyle = '#f3b183';
        context.fillRect(player.x + 5, player.y + 5, player.width - 10, 12);
    }

    function gameLoop() {
        if (running) movePlayer();
        draw();
        animationFrame = requestAnimationFrame(gameLoop);
    }

    worldButtons.forEach(button => button.addEventListener('click', () => openWorld(button.closest('.world-card')?.querySelector('h3')?.textContent || 'Sky Jump')));
    closeWorldModal.addEventListener('click', closeWorld);
    restartWorld.addEventListener('click', resetGame);
    worldModal.addEventListener('click', event => {
        if (event.target === worldModal) closeWorld();
    });
    document.addEventListener('keydown', event => {
        keys[event.key.toLowerCase()] = true;
        if (worldModal.classList.contains('active') && ['a', 'd', 'arrowleft', 'arrowright', ' ', 'w', 'arrowup'].includes(event.key.toLowerCase())) event.preventDefault();
    });
    document.addEventListener('keyup', event => {
        keys[event.key.toLowerCase()] = false;
    });
}
