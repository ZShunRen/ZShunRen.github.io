import { useAnimationFrame } from "motion/react";
import { drawWeather, type WeatherLayer } from "../lib/scenery/weather";

interface Props {
  layers: WeatherLayer[];
  elapsed: { current: number };
  isVisible: (layer: WeatherLayer) => boolean;
  onWind?: (gust: number) => void;
}

export default function WeatherAnimation({ layers, elapsed, isVisible, onWind }: Props) {
  useAnimationFrame((_time, delta) => {
    const deltaSeconds = Math.min(delta / 1000, 0.05);
    elapsed.current += deltaSeconds;
    const gust = Math.pow((Math.sin(elapsed.current * 0.68) + 1) / 2, 2) * 0.75 + 0.12;

    for (const layer of layers) {
      if (isVisible(layer)) drawWeather(layer, deltaSeconds, elapsed.current, gust);
    }
    onWind?.(gust);
  });

  return null;
}
