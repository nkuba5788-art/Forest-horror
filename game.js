let running = false;

const startButton = document.getElementById("start");
const loading = document.getElementById("loading");

startButton.addEventListener("click", () => {
    running = true;

    // Ukryj ekran startowy
    loading.style.display = "none";

    // Pokaż HUD
    const hud = document.getElementById("hud");
    if (hud) hud.style.display = "block";

    // Na telefonie pokaż sterowanie
    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls) mobileControls.style.display = "block";

    startGame();
});

function startGame() {
    // SCENA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07100b);
    scene.fog = new THREE.Fog(0x07100b, 15, 120);

    // KAMERA
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(0, 2, 8);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // ŚWIATŁO
    const moon = new THREE.HemisphereLight(
        0x8899ff,
        0x10150e,
        1.2
    );

    scene.add(moon);

    const light = new THREE.DirectionalLight(
        0xffffff,
        0.5
    );

    light.position.set(30, 50, 20);
    light.castShadow = true;
    scene.add(light);

    // ZIEMIA
    const groundGeometry = new THREE.PlaneGeometry(400, 400);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x182719,
        roughness: 1
    });

    const ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    scene.add(ground);

    // DRZEWO
    function createTree(x, z) {
        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.5, 5, 8),
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
                    2.7 - i * 0.5,
                    4,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x102b16
                })
            );

            leaves.position.y = 4 + i * 2;
            leaves.castShadow = true;

            tree.add(leaves);
        }

        tree.position.set(x, 0, z);

        scene.add(tree);
    }

    // LAS
    for (let i = 0; i < 180; i++) {
        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;

        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

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

    flashlight.position.set(0, 0, 0);
    camera.add(flashlight);

    flashlight.target.position.set(0, 0, -10);

    camera.add(flashlight.target);
    scene.add(camera);

    // STEROWANIE
    const keys = {};

    window.addEventListener("keydown", e => {
        keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    // TELEFON
    let moveX = 0;
    let moveZ = 0;

    const joystick = document.getElementById("joystick");

    if (joystick) {
        joystick.addEventListener("touchmove", e => {
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            moveX = (touch.clientX - centerX) / 50;
            moveZ = (touch.clientY - centerY) / 50;

            moveX = Math.max(-1, Math.min(1, moveX));
            moveZ = Math.max(-1, Math.min(1, moveZ));
        });

        joystick.addEventListener("touchend", () => {
            moveX = 0;
            moveZ = 0;
        });
    }

    // PĘTLA GRY
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        if (!running) return;

        const delta = Math.min(clock.getDelta(), 0.05);

        const speed = 8 * delta;

        if (keys["w"]) camera.translateZ(-speed);
        if (keys["s"]) camera.translateZ(speed);
        if (keys["a"]) camera.translateX(-speed);
        if (keys["d"]) camera.translateX(speed);

        camera.translateX(moveX * speed);
        camera.translateZ(moveZ * speed);

        renderer.render(scene, camera);
    }

    animate();

    // ZMIANA ROZMIARU
    window.addEventListener("resize", () => {
        camera.aspect =
            window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    });
              }
