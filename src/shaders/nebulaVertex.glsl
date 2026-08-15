varying vec2 vUv;
varying float vAlpha;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
