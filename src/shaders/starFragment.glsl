varying vec3 vColor;
varying float vBrightness;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float core = 1.0 - smoothstep(0.0, 0.1, dist);
  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  glow = pow(glow, 3.0);

  vec3 color = vColor * (core * 0.7 + glow * 0.5) * vBrightness;
  float alpha = core * 0.9 + glow * 0.35;

  gl_FragColor = vec4(color, alpha);
}
