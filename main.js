import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js";

/*import gsap from "gsap";
// https://greensock.com/docs/v3/Plugins/ScrollTrigger
import { ScrollTrigger } from "gsap/ScrollTrigger";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";*/

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
    vertexShader: `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        vUv = uv;
        vNormal = normal;
        vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vec3 pos = position;
        pos.y += sin(pos.x * 10.0 + time) * 0.1;
        pos.x += sin(pos.y * 10.0 + time) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
    `,
    fragmentShader: `
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    uniform float u_time;
    uniform vec3 lightPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition; 
    
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
        vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0);
        float t = u_time * 0.1;
        float r = random(uv + t);
        float g = random(uv + t + 1.0);
        float b = random(uv + t + 2.0);
    
        // Transform the light position from world space to view space (camera's local space)
        vec3 lightPosition_view = (viewMatrix * vec4(lightPosition, 1.0)).xyz;
    
        // Calculate the light direction in view space
        vec3 lightDirection = normalize(lightPosition_view - vViewPosition);
    
        // Calculate the distance between the light source and the fragment in view space
        float distance = length(lightPosition_view - vViewPosition);
    
        // Calculate the attenuation factor based on the distance (adjust the 0.1 constant to control attenuation rate)
        float attenuation = 1.0 / (1.0 + 0.1 * distance * distance);
    
        // Calculate the intensity of the light based on the dot product between normal and light direction
        float intensity = max(dot(vNormal, lightDirection), 0.7) * attenuation;
    
        // Increase the overall light intensity (adjust this value as needed)
        float lightIntensity = 2.5;
        intensity *= lightIntensity;
    
        vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.5, 1.0), uv.y);
    
        // Combine the color animation and light intensity
        vec3 finalColor = vec3(color) * intensity;
    
        gl_FragColor = vec4(finalColor, 1.0);
    }
    `,
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

/*
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
};*/

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
