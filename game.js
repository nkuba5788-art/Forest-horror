const isMobile =
    window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;


// ==============================
// DEVICE
// ==============================

const deviceText = document.getElementById("device");
const controlsText = document.getElementById("controls");

if (isMobile) {

    deviceText.textContent = "📱 TRYB TELEFONU";

    controlsText.textContent =
        "Lewy joystick = ruch • przeciąganie po prawej = kamera • ↑ = skok • 🔦 = latarka";

} else {

    deviceText.textContent = "🖥️ TRYB PC";

    controlsText.textContent =
        "WASD = ruch • SHIFT = bieg • SPACJA = skok • MYSZ = kamera • F = latarka";
}


// ==============================
// THREE.JS
// ==============================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x020604);

scene.fog = new THREE.FogExp2(
    0x07100a,
    0.025
);


const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.05,
    400
);

camera.position.set(
    0,
    1.7,
    10
);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);


// ==============================
// LIGHT
// ==============================

const moonLight =
    new THREE.HemisphereLight(
        0x66806d,
        0x10140e,
        0.7
    );

scene.add(moonLight);


const moon =
    new THREE.DirectionalLight(
        0xa7b9ad,
        1.2
    );

moon.position.set(
    -40,
    60,
    -30
);

moon.castShadow = true;

scene.add(moon);


// ==============================
// GROUND
// ==============================

const groundGeometry =
    new THREE.PlaneGeometry(
        400,
        400
    );

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101a11,
        roughness: 1
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// ==============================
// TREES
// ==============================

const trunkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x352318,
        roughness: 1
    });


const leafMaterials = [

    new THREE.MeshStandardMaterial({
        color: 0x0d2414,
        roughness: 1
    }),

    new THREE.MeshStandardMaterial({
        color: 0x12321a,
        roughness: 1
    }),

    new THREE.MeshStandardMaterial({
        color: 0x183b1d,
        roughness: 1
    })

];


function createTree(
    x,
    z,
    scale
) {

    const tree =
        new THREE.Group();

    tree.position.set(
        x,
        0,
        z
    );

    tree.scale.setScalar(scale);


    // pień

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .3,
                .48,
                5,
                9
            ),
            trunkMaterial
        );

    trunk.position.y = 2.5;

    trunk.castShadow = true;

    tree.add(trunk);


    // korona

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const leaves =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    2.6 - i * .25,
                    3.5,
                    9
                ),
                leafMaterials[i % 3]
            );

        leaves.position.y =
            4.4 + i * 1.35;

        leaves.castShadow = true;

        tree.add(leaves);
    }


    scene.add(tree);
}


// dużo drzew

for (
    let i = 0;
    i < 220;
    i++
) {

    const angle =
        Math.random() *
        Math.PI *
        2;

    const distance =
        12 +
        Math.random() *
        150;

    const x =
        Math.cos(angle) *
        distance;

    const z =
        Math.sin(angle) *
        distance;

    const scale =
        .7 +
        Math.random() *
        1.5;

    createTree(
        x,
        z,
        scale
    );
}


// ==============================
// KRZAKI
// ==============================

for (
    let i = 0;
    i < 180;
    i++
) {

    const bush =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .3 + Math.random() * .7,
                7,
                5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x12351b,
                roughness: 1
            })
        );

    bush.position.set(
        (Math.random() - .5) * 260,
        .35,
        (Math.random() - .5) * 260
    );

    bush.scale.y = .55;

    bush.castShadow = true;

    scene.add(bush);
}


// ==============================
// FLASHLIGHT
// ==============================

const flashlight =
    new THREE.SpotLight(
        0xfff5d6,
        60,
        45,
        Math.PI / 7,
        .45,
        1.5
    );

flashlight.castShadow = true;

scene.add(flashlight);
scene.add(flashlight.target);


// ==============================
// PLAYER
// ==============================

let yaw = 0;
let pitch = 0;

let velocityY = 0;

let grounded = true;

let flashlightOn = true;

let battery = 100;


// ==============================
// KEYBOARD
// ==============================

const keys = {};

document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        if (
            event.code === "KeyF"
        ) {

            flashlightOn =
                !flashlightOn;
        }


        if (
            event.code === "Space" &&
            grounded
        ) {

            velocityY = 7;

            grounded = false;
        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);


// ==============================
// MOUSE
// ==============================

document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement ===
            renderer.domElement
        ) {

            yaw -=
                event.movementX *
                0.0025;

            pitch -=
                event.movementY *
                0.0025;

            pitch =
                Math.max(
                    -1.45,
                    Math.min(
                        1.45,
                        pitch
                    )
                );
        }

    }
);


renderer.domElement.addEventListener(
    "click",
    () => {

        if (!isMobile) {

            renderer.domElement
                .requestPointerLock();

        }

    }
);


// ==============================
// MOBILE CAMERA
// ==============================

const lookArea =
    document.getElementById(
        "lookArea"
    );

let touching = false;

let lastTouchX = 0;
let lastTouchY = 0;


lookArea.addEventListener(
    "pointerdown",
    event => {

        touching = true;

        lastTouchX =
            event.clientX;

        lastTouchY =
            event.clientY;

        lookArea.setPointerCapture(
            event.pointerId
        );
    }
);


lookArea.addEventListener(
    "pointermove",
    event => {

        if (!touching)
            return;

        const dx =
            event.clientX -
            lastTouchX;

        const dy =
            event.clientY -
            lastTouchY;

        yaw -=
            dx * 0.004;

        pitch -=
            dy * 0.004;

        pitch =
            Math.max(
                -1.45,
                Math.min(
                    1.45,
                    pitch
                )
            );

        lastTouchX =
            event.clientX;

        lastTouchY =
            event.clientY;

    }
);


lookArea.addEventListener(
    "pointerup",
    () => {
        touching = false;
    }
);


// ==============================
// MOBILE JOYSTICK
// ==============================

const joystick =
    document.getElementById(
        "joystick"
    );

const knob =
    document.getElementById(
        "joystickKnob"
    );

let joystickX = 0;
let joystickY = 0;

let joystickID = null;


function moveJoystick(event) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let x =
        event.clientX -
        centerX;

    let y =
        event.clientY -
        centerY;

    const max = 38;

    const length =
        Math.hypot(x, y);

    if (length > max) {

        x =
            x / length *
            max;

        y =
            y / length *
            max;
    }

    joystickX =
        x / max;

    joystickY =
        y / max;

    knob.style.transform =
        `translate(${x}px, ${y}px)`;
}


function resetJoystick() {

    joystickX = 0;
    joystickY = 0;

    knob.style.transform =
        "translate(0,0)";

    joystickID = null;
}


joystick.addEventListener(
    "pointerdown",
    event => {

        joystickID =
            event.pointerId;

        joystick.setPointerCapture(
            joystickID
        );

        moveJoystick(event);

    }
);


joystick.addEventListener(
    "pointermove",
    event => {

        if (
            event.pointerId ===
            joystickID
        ) {

            moveJoystick(event);
        }

    }
);


joystick.addEventListener(
    "pointerup",
    resetJoystick
);

joystick.addEventListener(
    "pointercancel",
    resetJoystick
);


// ==============================
// MOBILE BUTTONS
// ==============================

document.getElementById(
    "flashButton"
).onclick = () => {

    flashlightOn =
        !flashlightOn;

};


document.getElementById(
    "jumpButton"
).onclick = () => {

    if (grounded) {

        velocityY = 7;

        grounded = false;

    }

};


// ==============================
// START
// ==============================

document.getElementById(
    "start"
).onclick = () => {

    document.getElementById(
        "loading"
    ).style.display = "none";

    if (!isMobile) {

        renderer.domElement
            .requestPointerLock();

    }

};


// ==============================
// PLAYER MOVEMENT
// ==============================

function updatePlayer(
    delta
) {

    let forward = 0;
    let sideways = 0;


    if (
        keys.KeyW ||
        keys.ArrowUp
    ) forward++;


    if (
        keys.KeyS ||
        keys.ArrowDown
    ) forward--;


    if (
        keys.KeyA ||
        keys.ArrowLeft
    ) sideways--;


    if (
        keys.KeyD ||
        keys.ArrowRight
    ) sideways++;


    if (isMobile) {

        forward -=
            joystickY;

        sideways +=
            joystickX;

    }


    const running =
        keys.ShiftLeft ||
        keys.ShiftRight;


    let speed =
        running
            ? 8
            : 4.5;


    if (isMobile)
        speed = 4.2;


    const length =
        Math.hypot(
            forward,
            sideways
        );


    if (length > 1) {

        forward /= length;
        sideways /= length;

    }


    const forwardVector =
        new THREE.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        );


    const sideVector =
        new THREE.Vector3(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );


    camera.position
        .addScaledVector(
            forwardVector,
            forward *
            speed *
            delta
        );


    camera.position
        .addScaledVector(
            sideVector,
            sideways *
            speed *
            delta
        );


    // grawitacja

    velocityY -=
        18 *
        delta;


    camera.position.y +=
        velocityY *
        delta;


    if (
        camera.position.y <
        1.7
    ) {

        camera.position.y =
            1.7;

        velocityY = 0;

        grounded = true;

    }


    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;


    // latarka

    flashlight.position.copy(
        camera.position
    );


    flashlight.target.position.copy(
        camera.position
    );


    flashlight.target.position.add(
        forwardVector.multiplyScalar(
            12
        )
    );


    if (
        flashlightOn &&
        battery > 0
    ) {

        battery -=
            delta * 1.3;

        if (battery < 0)
            battery = 0;

    }


    if (
        battery <= 0
    ) {

        flashlightOn = false;

    }


    flashlight.intensity =
        flashlightOn
            ? 60
            : 0;


    document.getElementById(
        "battery"
    ).textContent =
        "🔦 " +
        Math.round(battery) +
        "%";

}


// ==============================
// LOOP
// ==============================

let previous =
    performance.now();


function gameLoop(
    time
) {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            .05,
            (time - previous) /
            1000
        );


    previous = time;


    updatePlayer(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


gameLoop(
    performance.now()
);


// ==============================
// RESIZE
// ==============================

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
