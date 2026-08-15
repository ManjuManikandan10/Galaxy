export function temperatureToColor(temperature) {
  let r, g, b;

  if (temperature < 3500) {
    r = 1.0;
    g = 0.3;
    b = 0.1;
  } else if (temperature < 5000) {
    r = 1.0;
    g = 0.6;
    b = 0.3;
  } else if (temperature < 6500) {
    r = 1.0;
    g = 0.85;
    b = 0.7;
  } else if (temperature < 10000) {
    r = 0.85;
    g = 0.9;
    b = 1.0;
  } else if (temperature < 20000) {
    r = 0.6;
    g = 0.75;
    b = 1.0;
  } else {
    r = 0.4;
    g = 0.6;
    b = 1.0;
  }

  return { r, g, b };
}

export function randomTemperature(rng) {
  const temps = [3000, 3500, 4000, 5000, 6000, 6500, 7500, 10000, 15000, 25000];
  const weights = [0.05, 0.1, 0.15, 0.2, 0.15, 0.15, 0.1, 0.05, 0.03, 0.02];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = rng() * totalWeight;
  for (let i = 0; i < temps.length; i++) {
    r -= weights[i];
    if (r <= 0) return temps[i];
  }
  return 6500;
}
