attribute float size;
attribute vec3 customColor;
attribute float brightness;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vColor = customColor;
  vBrightness = brightness;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (1500.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
