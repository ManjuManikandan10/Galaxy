export function createSeededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}

export function randomGaussian(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function randomNormal(rng, mean, stdDev) {
  return mean + randomGaussian(rng) * stdDev;
}
