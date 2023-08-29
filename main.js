import * as THREE from "./node_modules/three/build/three.module.js";
import gsap from "./node_modules/gsap/index.js";
// https://greensock.com/docs/v3/Plugins/ScrollTrigger
import ScrollTrigger from "./node_modules/gsap/ScrollTrigger";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const canvas = document.getElementById("bg");

// SCENE
// https://threejs.org/docs/#api/en/scenes/Scene
const scene = new THREE.Scene();

// CAMERA
// https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
const camera = new THREE.PerspectiveCamera(
    5,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);
scene.add(camera);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(2); // Resolution
renderer.shadowMap.enabled = true;
renderer.render(scene, camera);

scene.background = new THREE.Color(0x000000);

const lightPosition = new THREE.Vector3();
const clock = new THREE.Clock();

const uniforms = {
    lightPosition: { value: lightPosition },
    time: { value: 0 },
};

// MESH
// https://threejs.org/docs/#api/en/geometries/SphereGeometry
const sphereGeo = new THREE.SphereGeometry(1, 64, 64); // (radius, widthSegments, heigthSegments)
// https://threejs.org/docs/#api/en/materials/ShaderMaterial
const sphereMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    wireframe: true,
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
sphereMesh.position.set(0, 0, 0);
scene.add(sphereMesh);

// MOUSE MOVE ANIMATIONS
const mouse = new THREE.Vector2();

sphereMat.uniforms.lightPosition.value.set(0, 0, 5);

window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    sphereMesh.rotation.y = THREE.MathUtils.lerp(
        sphereMesh.rotation.y,
        (mouse.x * Math.PI) / 10,
        0.1
    );
    sphereMesh.rotation.x = THREE.MathUtils.lerp(
        sphereMesh.rotation.x,
        (mouse.y * Math.PI) / 10,
        0.1
    );

    sphereMat.uniforms.lightPosition.value.set(mouse.x * 3, mouse.y * 4, 3.5);
});

// GSAP ANIMATIONS
gsap.registerPlugin(ScrollTrigger);
const triggerValues = {
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
};

gsap.to(sphereMesh.position, {
    y: "+=4.5",
    scrollTrigger: triggerValues,
});

window.onload = function () {
    const tl = gsap.timeline();

    // Shared animation properties
    const sharedProperties = {
        x: -200,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
    };

    tl.from(".title", { ...sharedProperties, delay: 0.1 })
        .from(".name", { ...sharedProperties, delay: 0.01 })
        .from(".profession", { ...sharedProperties, delay: 0.01 });

    gsap.from(sphereMesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
        delay: 0.3,
        ease: "power2.out",
    });
};

function animate() {
    sphereMat.uniforms.time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// WINDOW RESIZE HANDLING
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/*window.addEventListener("load", function () {
    if (window.innerWidth < 721) {
        camera.fov = 10;
        console.log(camera.fov);
    }
});*/
