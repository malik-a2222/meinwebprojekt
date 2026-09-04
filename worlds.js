import * as THREE from './vendor/three.module.min.js';

const worldModal = document.getElementById('worldModal');
const sceneElement = document.getElementById('worldCanvas');
const worldTitle = document.getElementById('worldModalTitle');
const worldHelp = document.getElementById('worldModalHelp');
const worldScore = document.getElementById('worldScore');
const worldStatus = document.getElementById('worldStatus');
const closeWorldModal = document.getElementById('closeWorldModal');
const restartWorld = document.getElementById('restartWorld');
const worldButtons = document.querySelectorAll('.world-play, .join-button');

if (worldModal && sceneElement) {
    const keys = {};
    const lanes = [-4, 0, 4];
    const obstacles = [];
    let renderer;
    let animationFrame;
    let running = false;
    let score = 0;
    let lastTime = 0;
    let player;
    let finish;

    function createBox(scene, size, color, position) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshStandardMaterial({ color, roughness: 0.75 })
        );
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
    }

    function initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbfe7ff);
        scene.fog = new THREE.Fog(0xbfe7ff, 35, 105);
        const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
        camera.position.set(0, 7, 13);
        camera.lookAt(0, 2, -18);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        sceneElement.innerHTML = '';
        sceneElement.appendChild(renderer.domElement);
        scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x35556d, 2.2));
        const sun = new THREE.DirectionalLight(0xffffff, 2.5);
        sun.position.set(-8, 14, 8);
        sun.castShadow = true;
        scene.add(sun);
        createBox(scene, { x: 24, y: 0.4, z: 110 }, 0x72c58b, { x: 0, y: -0.35, z: -35 });
        createBox(scene, { x: 14, y: 0.2, z: 110 }, 0x29384a, { x: 0, y: -0.1, z: -35 });
        [-2, 2].forEach(x => {
            for (let z = -82; z < 18; z += 8) createBox(scene, { x: 0.15, y: 0.04, z: 3.5 }, 0xffd34e, { x, y: 0.02, z });
        });
        player = createBox(scene, { x: 1.35, y: 1.8, z: 1.35 }, 0x2f80ed, { x: 0, y: 0.9, z: 7 });
        createBox(scene, { x: 0.82, y: 0.45, z: 0.9 }, 0xf3b183, { x: 0, y: 2.05, z: 7 });
        finish = createBox(scene, { x: 2.8, y: 0.25, z: 2.8 }, 0xffd34e, { x: 0, y: 0.2, z: -78 });
        for (let index = 0; index < 8; index += 1) {
            const obstacle = createBox(scene, { x: 1.7, y: 1.7, z: 1.7 }, 0xef5b5b, { x: lanes[index % 3], y: 0.85, z: -8 - index * 9 });
            obstacles.push(obstacle);
        }
        return { scene, camera };
    }

    let game = initScene();

    function resize() {
        const width = sceneElement.clientWidth;
        const height = sceneElement.clientHeight;
        game.camera.aspect = width / height;
        game.camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }

    function resetGame() {
        cancelAnimationFrame(animationFrame);
        game = initScene();
        obstacles.length = 0;
        game.scene.traverse(object => {
            if (object.isMesh && object !== player && object !== finish && object.geometry?.parameters?.width === 1.7) obstacles.push(object);
        });
        score = 0;
        running = true;
        worldScore.textContent = '0';
        worldStatus.textContent = 'Erreiche das goldene Ziel.';
        resize();
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
    }

    function openWorld(name) {
        worldTitle.textContent = name || 'Sky Jump';
        worldHelp.textContent = 'W/A/S/D bewegen · Leertaste springen';
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

    function endGame(message) {
        running = false;
        worldStatus.textContent = message;
    }

    function animate(time) {
        animationFrame = requestAnimationFrame(animate);
        const delta = Math.min((time - lastTime) / 16.67, 2);
        lastTime = time;
        if (running) {
            const horizontal = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            const depth = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            player.position.x = Math.max(-5, Math.min(5, player.position.x + horizontal * 0.16 * delta));
            player.position.z = Math.max(-82, Math.min(9, player.position.z + depth * 0.16 * delta));
            if (keys[' '] && player.position.y <= 0.91) player.userData.jump = 0.35;
            player.userData.jump = (player.userData.jump || 0) - 0.018 * delta;
            player.position.y = Math.max(0.9, player.position.y + player.userData.jump * delta);
            obstacles.forEach(obstacle => {
                obstacle.position.z += 0.22 * delta;
                obstacle.rotation.y += 0.01 * delta;
                if (obstacle.position.z > 12) {
                    obstacle.position.z = -82 - Math.random() * 20;
                    obstacle.position.x = lanes[Math.floor(Math.random() * lanes.length)];
                    score += 1;
                    worldScore.textContent = score;
                }
                if (Math.abs(obstacle.position.x - player.position.x) < 1.4 && Math.abs(obstacle.position.z - player.position.z) < 1.5 && Math.abs(obstacle.position.y - player.position.y) < 1.6) endGame(`Crash! Score: ${score}. Drücke Neu starten.`);
            });
            if (Math.abs(finish.position.x - player.position.x) < 2.2 && Math.abs(finish.position.z - player.position.z) < 2.2) endGame(`Ziel erreicht! Score: ${score + 100}.`);
        }
        renderer.render(game.scene, game.camera);
    }

    worldButtons.forEach(button => button.addEventListener('click', () => openWorld(button.closest('.world-card')?.querySelector('h3')?.textContent || 'Sky Jump')));
    closeWorldModal.addEventListener('click', closeWorld);
    restartWorld.addEventListener('click', resetGame);
    worldModal.addEventListener('click', event => { if (event.target === worldModal) closeWorld(); });
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        keys[key] = true;
        if (worldModal.classList.contains('active') && ['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
        if (key === 'arrowup') keys.w = true;
        if (key === 'arrowdown') keys.s = true;
        if (key === 'arrowleft') keys.a = true;
        if (key === 'arrowright') keys.d = true;
    });
    document.addEventListener('keyup', event => {
        const key = event.key.toLowerCase();
        keys[key] = false;
        if (key === 'arrowup') keys.w = false;
        if (key === 'arrowdown') keys.s = false;
        if (key === 'arrowleft') keys.a = false;
        if (key === 'arrowright') keys.d = false;
    });
    window.addEventListener('resize', resize);
    resize();
    renderer.render(game.scene, game.camera);
}
