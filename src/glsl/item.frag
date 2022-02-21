uniform vec3 color;
uniform float shadow;
uniform float alpha;

varying vec2 vUv;

void main(void) {
  vec4 dest = vec4(color, alpha);
  dest.rgb += step(vUv.x, vUv.y) * 0.25 * shadow;
  gl_FragColor = dest;
}
