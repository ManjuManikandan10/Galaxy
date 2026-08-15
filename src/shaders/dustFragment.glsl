varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * 0.4;
  gl_FragColor = vec4(0.05, 0.02, 0.01, alpha);
}
