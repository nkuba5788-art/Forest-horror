let running = false;

const loading = document.getElementById("loading");
const startButton = document.getElementById("start");
const mobileControls = document.getElementById("mobileControls");

startButton.addEventListener("click", startGame);

function startGame() {

    if (running) return;

    running = true;

    loading.style.display = "none";

    if (
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth <= 700
    ) {
        mobileControls.style.display = "block";
    }

    createGame();
}

function createGame() {

    // =========================
    // SCENA
    // =========================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x071009);

    scene.fog = new THREE.Fog(
        0x071009,
        15,
        120
    );

    // =========================
    // KAMERA
    // =========================

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(0, 2, 8);

    camera.rotation.order = "YXZ";

    // =========================
    // RENDERER
    // =========================

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // =========================
    // ŚWIATŁO
    // =========================

    const skyLight =
        new THREE.HemisphereLight(
            0x7890a8,
            0x10150c,
            1.2
        );

    scene.add(skyLight);

    const moon =
        new THREE.DirectionalLight(
            0xb5c9ff,
            0.7
        );

    moon.position.set(
        30,
        60,
        20
    );

    moon.castShadow = true;

    scene.add(moon);

    // =========================
    // ZIEMIA
    // =========================

    const ground =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                400,
                400
            ),

            new THREE.MeshStandardMaterial({
                color: 0x172519,
                roughness: 1
            })
        );

    ground.rotation.x = -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);

    // =========================
    // DRZEWO
    // =========================

    function createTree(x, z) {

        const tree =
            new THREE.Group();

        const trunk =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.35,
                    0.6,
                    5,
                    8
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x4a2c17
                })
            );

        trunk.position.y = 2.5;

        trunk.castShadow = true;

        tree.add(trunk);

        for (let i = 0; i < 3; i++) {

            const leaves =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        2.8 - i * 0.5,
                        4,
                        8
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x102d17
                    })
                );

            leaves.position.y =
                4.2 + i * 1.8;

            leaves.castShadow = true;

            tree.add(leaves);
        }

        tree.position.set(
            x,
            0,
            z
        );

        scene.add(tree);
    }

    // =========================
    // LAS
    // =========================

    for (let i = 0; i < 220; i++) {

        const x =
            (Math.random() - 0.5) * 300;

        const z =
            (Math.random() - 0.5) * 300;

        // wolna przestrzeń przy graczu

        if (
            Math.abs(x) < 12 &&
            Math.abs(z) < 12
        ) {
            continue;
        }

        createTree(x, z);
    }

    // =========================
    // KRZAKI
    // =========================

    for (let i = 0; i < 180; i++) {

        const bush =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    Math.random() * 0.7 + 0.4,
                    7,
                    7
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x17361c
                })
            );

        bush.position.set(
            (Math.random() - 0.5) * 300,
            0.5,
            (Math.random() - 0.5) * 300
        );

        scene.add(bush);
    }

    // =========================
    // LATARKA
    // =========================

    const flashlight =
        new THREE.SpotLight(
            0xffffff,
            6,
            45,
            Math.PI / 7,
            0.5,
            1
        );

    flashlight.position.set(
        0,
        0,
        0
    );

    flashlight.target.position.set(
        0,
        0,
        -15
    );

    camera.add(flashlight);
    camera.add(flashlight.target);

    scene.add(camera);

    // =========================
    // KLAWIATURA
    // =========================

    const keys = {};

    window.addEventListener(
        "keydown",
        event => {
            keys[event.key.toLowerCase()] = true;

            if (
                event.code === "Space"
            ) {
                jump();
            }
        }
    );

    window.addEventListener(
        "keyup",
        event => {
            keys[event.key.toLowerCase()] = false;
        }
    );

    // =========================
    // JOYSTICK
    // =========================

    const joystick =
        document.getElementById(
            "joystick"
        );

    const stick =
        document.getElementById(
            "joystickStick"
        );

    let joystickX = 0;
    let joystickY = 0;

    let joystickTouch = null;

    joystick.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            const touch =
                event.changedTouches[0];

            joystickTouch =
                touch.identifier;

            updateJoystick(touch);

        },
        { passive: false }
    );

    joystick.addEventListener(
        "touchmove",
        event => {

            event.preventDefault();

            for (
                const touch of event.changedTouches
            ) {

                if (
                    touch.identifier ===
                    joystickTouch
                ) {

                    updateJoystick(touch);
                }
            }

        },
        { passive: false }
    );

    joystick.addEventListener(
        "touchend",
        event => {

            for (
                const touch of event.changedTouches
            ) {

                if (
                    touch.identifier ===
                    joystickTouch
                ) {

                    joystickTouch = null;

                    joystickX = 0;
                    joystickY = 0;

                    stick.style.transform =
                        "translate(-50%, -50%)";
                }
            }
        }
    );

    function updateJoystick(touch) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            touch.clientX -
            centerX;

        let dy =
            touch.clientY -
            centerY;

        const radius =
            rect.width / 2;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance > radius) {

            dx =
                dx / distance *
                radius;

            dy =
                dy / distance *
                radius;
        }

        joystickX =
            dx / radius;

        joystickY =
            dy / radius;

        stick.style.transform =
            `translate(
                calc(-50% + ${dx}px),
                calc(-50% + ${dy}px)
            )`;
    }

    // =========================
    // OBRACANIE KAMERĄ
    // =========================

    let lookTouch = null;

    let lastLookX = 0;
    let lastLookY = 0;

    let yaw = 0;
    let pitch = 0;

    document.addEventListener(
        "touchstart",
        event => {

            for (
                const touch of event.changedTouches
            ) {

                if (
                    touch.target.closest(
                        "#joystick"
                    ) ||
                    touch.target.closest(
                        "#jumpButton"
                    )
                ) {
                    continue;
                }

                if (
                    lookTouch === null
                ) {

                    lookTouch =
                        touch.identifier;

                    lastLookX =
                        touch.clientX;

                    lastLookY =
                        touch.clientY;
                }
            }
        },
        { passive: true }
    );

    document.addEventListener(
        "touchmove",
        event => {

            if (
                lookTouch === null
            ) {
                return;
            }

            for (
                const touch of event.changedTouches
            ) {

                if (
                    touch.identifier !==
                    lookTouch
                ) {
                    continue;
                }

                const dx =
                    touch.clientX -
                    lastLookX;

                const dy =
                    touch.clientY -
                    lastLookY;

                lastLookX =
                    touch.clientX;

                lastLookY =
                    touch.clientY;

                yaw -= dx * 0.004;
                pitch -= dy * 0.004;

                pitch =
                    Math.max(
                        -Math.PI / 2.2,
                        Math.min(
                            Math.PI / 2.2,
                            pitch
                        )
                    );

                camera.rotation.y =
                    yaw;

                camera.rotation.x =
                    pitch;
            }
        },
        { passive: true }
    );

    document.addEventListener(
        "touchend",
        event => {

            for (
                const touch of event.changedTouches
            ) {

                if (
                    touch.identifier ===
                    lookTouch
                ) {

                    lookTouch = null;
                }
            }
        },
        { passive: true }
    );

    // =========================
    // SKAKANIE
    // =========================

    let velocityY = 0;

    let onGround = true;

    function jump() {

        if (!onGround) {
            return;
        }

        velocityY = 8;

        onGround = false;
    }

    const jumpButton =
        document.getElementById(
            "jumpButton"
        );

    jumpButton.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            jump();
        },
        { passive: false }
    );

    // =========================
    // GRA
    // =========================

    const clock =
        new THREE.Clock();

    function animate() {

        requestAnimationFrame(
            animate
        );

        if (!running) {
            return;
        }

        const delta =
            Math.min(
                clock.getDelta(),
                0.05
            );

        const speed =
            7 * delta;

        // PC

        if (keys["w"]) {
            camera.translateZ(
                -speed
            );
        }

        if (keys["s"]) {
            camera.translateZ(
                speed
            );
        }

        if (keys["a"]) {
            camera.translateX(
                -speed
            );
        }

        if (keys["d"]) {
            camera.translateX(
                speed
            );
        }

        // TELEFON

        camera.translateZ(
            joystickY * speed
        );

        camera.translateX(
            joystickX * speed
        );

        // GRAWITACJA

        velocityY -=
            20 * delta;

        camera.position.y +=
            velocityY * delta;

        if (
            camera.position.y <= 2
        ) {

            camera.position.y = 2;

            velocityY = 0;

            onGround = true;
        }

        renderer.render(
            scene,
            camera
        );
    }

    animate();

    // =========================
    // EKRAN
    // =========================

    window.addEventListener(
        "resize",
        () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
        }
    );
          }
