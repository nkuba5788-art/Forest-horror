let running = false;

const loading = document.getElementById("loading");
const startButton = document.getElementById("start");

startButton.addEventListener("click", () => {
    running = true;
    loading.style.display = "none";
    startGame();
});

function startGame() {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07100b);
    scene.fog = new THREE.Fog(0x07100b, 15, 130);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // ŚWIATŁO
    scene.add(
        new THREE.HemisphereLight(
            0x8899ff,
            0x10150e,
            1.2
        )
    );

    const moon = new THREE.DirectionalLight(0xffffff, 0.5);
    moon.position.set(30, 50, 20);
    moon.castShadow = true;
    scene.add(moon);

    // ZIEMIA
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        new THREE.MeshStandardMaterial({
            color: 0x182719
        })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // DRZEWA
    function createTree(x, z) {

        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.55, 5, 8),
            new THREE.MeshStandardMaterial({
                color: 0x4a2d18
            })
        );

        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 3; i++) {

            const leaves = new THREE.Mesh(
                new THREE.ConeGeometry(
                    2.8 - i * 0.5,
                    4,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x102b16
                })
            );

            leaves.position.y = 4 + i * 1.8;
            leaves.castShadow = true;

            tree.add(leaves);
        }

        tree.position.set(x, 0, z);
        scene.add(tree);
    }

    for (let i = 0; i < 220; i++) {

        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;

        if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;

        createTree(x, z);
    }

    // LATARKA
    const flashlight = new THREE.SpotLight(
        0xffffff,
        5,
        45,
        Math.PI / 7,
        0.5,
        1
    );

    camera.add(flashlight);
    camera.add(flashlight.target);
    flashlight.target.position.set(0, 0, -10);

    scene.add(camera);

    // =========================
    // STEROWANIE
    // =========================

    const keys = {};

    window.addEventListener("keydown", e => {
        keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    // JOYSTICK
    let joystickX = 0;
    let joystickY = 0;

    const joystick = document.getElementById("joystick");

    if (joystick) {

        let active = false;

        joystick.addEventListener("touchstart", e => {
            active = true;
            e.preventDefault();
        }, { passive: false });

        joystick.addEventListener("touchmove", e => {

            if (!active) return;

            e.preventDefault();

            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            joystickX =
                (touch.clientX - centerX) / (rect.width / 2);

            joystickY =
                (touch.clientY - centerY) / (rect.height / 2);

            joystickX = Math.max(-1, Math.min(1, joystickX));
            joystickY = Math.max(-1, Math.min(1, joystickY));

        }, { passive: false });

        joystick.addEventListener("touchend", () => {
            active = false;
            joystickX = 0;
            joystickY = 0;
        });
    }

    // OBRACANIE KAMERY PALCEM
    let lookTouch = null;
    let lastX = 0;
    let lastY = 0;

    let yaw = 0;
    let pitch = 0;

    const lookArea =
        document.getElementById("lookArea") || document.body;

    lookArea.addEventListener("touchstart", e => {

        if (e.target.closest("#joystick")) return;

        const touch = e.changedTouches[0];

        lookTouch = touch.identifier;

        lastX = touch.clientX;
        lastY = touch.clientY;

    }, { passive: true });

    lookArea.addEventListener("touchmove", e => {

        if (lookTouch === null) return;

        for (const touch of e.changedTouches) {

            if (touch.identifier !== lookTouch) continue;

            const dx = touch.clientX - lastX;
            const dy = touch.clientY - lastY;

            lastX = touch.clientX;
            lastY = touch.clientY;

            yaw -= dx * 0.004;
            pitch -= dy * 0.004;

            pitch = Math.max(
                -Math.PI / 2.2,
                Math.min(Math.PI / 2.2, pitch)
            );

            camera.rotation.order = "YXZ";
            camera.rotation.y = yaw;
            camera.rotation.x = pitch;
        }

    }, { passive: true });

    lookArea.addEventListener("touchend", e => {

        for (const touch of e.changedTouches) {

            if (touch.identifier === lookTouch) {
                lookTouch = null;
            }
        }

    });

    // SKAKANIE
    let velocityY = 0;
    let onGround = true;

    const jumpButton =
        document.getElementById("jumpButton");

    function jump() {

        if (!onGround) return;

        velocityY = 8;
        onGround = false;
    }

    if (jumpButton) {

        jumpButton.addEventListener("touchstart", e => {
            e.preventDefault();
            jump();
        }, { passive: false });

        jumpButton.addEventListener("click", jump);
    }

    // =========================
    // GŁÓWNA PĘTLA
    // =========================

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        if (!running) return;

        const delta = Math.min(
            clock.getDelta(),
            0.05
        );

        const speed = 7 * delta;

        // PC
        if (keys["w"]) camera.translateZ(-speed);
        if (keys["s"]) camera.translateZ(speed);
        if (keys["a"]) camera.translateX(-speed);
        if (keys["d"]) camera.translateX(speed);

        // TELEFON
        camera.translateZ(joystickY * speed);
        camera.translateX(joystickX * speed);

        // GRAWITACJA
        velocityY -= 20 * delta;

        camera.position.y += velocityY * delta;

        if (camera.position.y <= 2) {

            camera.position.y = 2;
            velocityY = 0;
            onGround = true;
        }

        renderer.render(scene, camera);
    }

    animate();

    // RESIZE
    window.addEventListener("resize", () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    });
    }
