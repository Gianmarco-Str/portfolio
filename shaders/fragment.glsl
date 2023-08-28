export default /* glsl */`
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
`;


