varying vec2 vUv;
varying float vAlpha;
uniform vec3 uColor;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.05, dist) * vAlpha;
  vec3 color = uColor * (1.0 - dist * 0.8);
  gl_FragColor = vec4(color, alpha * 0.6);
}
