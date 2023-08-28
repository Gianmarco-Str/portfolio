export default /* glsl */`
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
`;
