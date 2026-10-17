import type { SceneryScene } from "./geometry";

interface SnowParticle {
  x: number;
  y: number;
  depth: number;
  phase: number;
}

export interface WeatherLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scene: SceneryScene | null;
  width: number;
  height: number;
  intensity: number;
  particles: SnowParticle[];
}

const INTENSITY: Record<string, number> = {
  summit: 1,
  forest: 0.7,
  town: 0.32,
  garden: 0.25,
};

export function collectWeather(home: HTMLElement, scenes: SceneryScene[] = []): WeatherLayer[] {
  return Array.from(home.querySelectorAll<HTMLCanvasElement>(".wind-snow")).flatMap(
    (canvas) => {
      const context = canvas.getContext("2d");
      if (!context) return [];

      const region = canvas.closest<HTMLElement>("section");
      const scene = scenes.find((candidate) => candidate.region === region) ?? null;
      return [
        {
          canvas,
          context,
          scene,
          width: 0,
          height: 0,
          intensity: INTENSITY[canvas.dataset.weather ?? scene?.type ?? ""] ?? 0.3,
          particles: [],
        },
      ];
    },
  );
}

export function measureWeather(layers: WeatherLayer[]): void {
  for (const layer of layers) {
    const box = layer.canvas.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) continue;

    layer.width = box.width;
    layer.height = box.height;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    layer.canvas.width = Math.round(layer.width * pixelRatio);
    layer.canvas.height = Math.round(layer.height * pixelRatio);
    layer.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.round((box.width < 600 ? 48 : 105) * layer.intensity);
    layer.particles = Array.from({ length: count }, () => ({
      x: Math.random() * layer.width,
      y: Math.random() * layer.height,
      depth: 0.35 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
    }));
  }
}

export function drawWeather(
  layer: WeatherLayer,
  deltaSeconds: number,
  elapsedSeconds: number,
  gust: number,
): void {
  const { context, width, height, intensity } = layer;
  context.clearRect(0, 0, width, height);

  for (const snow of layer.particles) {
    const speed = (58 + gust * 210) * snow.depth * intensity;
    snow.x += deltaSeconds * speed;
    snow.y +=
      deltaSeconds * (12 + snow.depth * 14) +
      Math.sin(elapsedSeconds * 1.6 + snow.phase) * deltaSeconds * 7;

    if (snow.x > width + 20) snow.x = -20;
    if (snow.y > height + 8) snow.y = -8;

    const tail = (1 + gust * 19 * intensity * intensity) * snow.depth;
    context.strokeStyle = `rgba(255,255,246,${0.28 + snow.depth * 0.4})`;
    context.lineWidth = 0.65 + snow.depth;
    context.beginPath();
    if (intensity < 0.4) {
      context.arc(snow.x, snow.y, 0.45 + snow.depth * 0.65, 0, Math.PI * 2);
    } else {
      context.moveTo(snow.x, snow.y);
      context.lineTo(snow.x - tail, snow.y - tail * 0.22);
    }
    context.stroke();
  }

  if (intensity >= 0.7 && gust > 0.2) {
    context.lineWidth = 1;
    for (let index = 0; index < 5; index += 1) {
      const start = ((elapsedSeconds * 76 + (index * width) / 4) % (width + 260)) - 160;
      const y = height * (0.64 + index * 0.045);
      context.strokeStyle = `rgba(249,250,242,${gust * 0.23})`;
      context.beginPath();
      context.moveTo(start, y);
      context.bezierCurveTo(start + 45, y - 10, start + 115, y + 7, start + 175, y - 7);
      context.stroke();
    }
  }
}

export function clearWeather(layers: WeatherLayer[]): void {
  for (const layer of layers) {
    layer.context.clearRect(0, 0, layer.width, layer.height);
  }
}
