const stage = document.getElementById('obbyStage');
const status = document.getElementById('builderStatus');
const tools = document.querySelectorAll('.builder-tool');
const clearButton = document.getElementById('clearObby');
const saveButton = document.getElementById('saveObby');
const playButton = document.getElementById('playObby');

if (stage && status) {
    const columns = 12;
    const rows = 7;
    const storageKey = 'blockforgeObby';
    let selectedBlock = 'platform';
    let playMode = false;
    let blocks = loadLevel();
    let player = { column: 0, row: 5, velocityY: 0, grounded: false };
    let animationFrame;

    function loadLevel() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            if (Array.isArray(saved) && saved.length === columns * rows) return saved;
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
        return Array.from({ length: columns * rows }, (_, index) => index >= columns * 6 ? 'platform' : '');
    }

    function indexFor(column, row) {
        return row * columns + column;
    }

    function render() {
        stage.innerHTML = '';
        stage.classList.toggle('play-mode', playMode);
        blocks.forEach((block, index) => {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = `obby-cell ${block || 'empty'}${playMode ? ' locked' : ''}`;
            cell.dataset.index = index;
            cell.setAttribute('aria-label', block ? `${block} bei Feld ${index + 1}` : `Leeres Feld ${index + 1}`);
            cell.textContent = block === 'platform' ? '' : block === 'hazard' ? '!' : block === 'finish' ? '★' : '';
            cell.addEventListener('click', () => handleCell(index));
            stage.appendChild(cell);
        });
        if (playMode) renderPlayer();
    }

    function handleCell(index) {
        if (playMode) return;
        blocks[index] = blocks[index] === selectedBlock ? '' : selectedBlock;
        render();
    }

    function renderPlayer() {
        const oldPlayer = stage.querySelector('.obby-player');
        if (oldPlayer) oldPlayer.remove();
        const playerElement = document.createElement('div');
        playerElement.className = 'obby-player';
        playerElement.style.left = `${(player.column / columns) * 100}%`;
        playerElement.style.top = `${(player.row / rows) * 100}%`;
        stage.appendChild(playerElement);
    }

    function setStatus(message) {
        status.textContent = message;
    }

    function startPlaytest() {
        playMode = !playMode;
        playButton.textContent = playMode ? 'Editor öffnen' : 'Test starten';
        player = { column: 0, row: 5, velocityY: 0, grounded: false };
        setStatus(playMode ? 'Testmodus: Bewege dich bis zum Ziel.' : 'Bauteil auswählen und Raster anklicken.');
        render();
        if (playMode) {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(playLoop);
        } else {
            cancelAnimationFrame(animationFrame);
        }
    }

    function isSolid(column, row) {
        if (column < 0 || column >= columns || row < 0 || row >= rows) return false;
        return blocks[indexFor(column, row)] === 'platform';
    }

    function movePlayer(direction) {
        if (!playMode) return;
        const nextColumn = Math.max(0, Math.min(columns - 1, player.column + direction));
        if (!isSolid(nextColumn, player.row)) player.column = nextColumn;
        checkTile();
        renderPlayer();
    }

    function jump() {
        if (playMode && player.grounded) {
            player.velocityY = -0.42;
            player.grounded = false;
        }
    }

    function checkTile() {
        const tile = blocks[indexFor(player.column, player.row)];
        if (tile === 'hazard') {
            setStatus('Autsch! Du bist auf eine Gefahr gelaufen.');
            player = { column: 0, row: 5, velocityY: 0, grounded: false };
        }
        if (tile === 'finish') {
            setStatus('Ziel erreicht! Dein Obby funktioniert.');
            playMode = false;
            playButton.textContent = 'Test starten';
        }
    }

    function playLoop() {
        if (!playMode) return;
        player.velocityY += 0.025;
        const nextRow = player.row + player.velocityY;
        const floorRow = Math.floor(nextRow);
        if (player.velocityY >= 0 && isSolid(player.column, floorRow + 1)) {
            player.row = floorRow;
            player.velocityY = 0;
            player.grounded = true;
        } else if (nextRow < rows - 1) {
            player.row = Math.max(0, nextRow);
            player.grounded = false;
        } else {
            player.row = rows - 1;
            player.velocityY = 0;
            player.grounded = true;
        }
        checkTile();
        renderPlayer();
        animationFrame = requestAnimationFrame(playLoop);
    }

    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            tools.forEach(item => item.classList.remove('active'));
            tool.classList.add('active');
            selectedBlock = tool.dataset.block;
            setStatus(`${tool.textContent} ausgewählt. Klicke ein Feld an.`);
        });
    });

    clearButton.addEventListener('click', () => {
        if (playMode) return;
        blocks = Array(columns * rows).fill('');
        setStatus('Raster geleert. Setze dein erstes Bauteil.');
        render();
    });

    saveButton.addEventListener('click', () => {
        localStorage.setItem(storageKey, JSON.stringify(blocks));
        setStatus('Dein Obby wurde auf diesem Gerät gespeichert.');
    });

    playButton.addEventListener('click', startPlaytest);
    document.addEventListener('keydown', event => {
        if (!playMode) return;
        const key = event.key.toLowerCase();
        if (['a', 'd', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
        if (key === 'a' || key === 'arrowleft') movePlayer(-1);
        if (key === 'd' || key === 'arrowright') movePlayer(1);
        if (key === ' ') jump();
    });

    render();
}
