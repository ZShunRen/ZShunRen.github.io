import { useEffect, useRef, useState } from "react";
import WeatherAnimation from "./WeatherAnimation";
import useReducedMotion from "./useReducedMotion";
import { updateMotionToggle } from "../lib/scenery/motionControl";
import { clearWeather, collectWeather, measureWeather, type WeatherLayer } from "../lib/scenery/weather";

export default function BlogSnowfall() {
  const prefersReducedMotion = useReducedMotion();
  const [layers, setLayers] = useState<WeatherLayer[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const elapsed = useRef(0);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".blog-page main");
    const toggle = main?.querySelector<HTMLButtonElement>(".motion-toggle");
    if (!main || !toggle) return;

    const weather = collectWeather(main);
    if (weather.length === 0) return;
    const measure = () => measureWeather(weather);
    const observer = new IntersectionObserver(([entry]) => setPageVisible(entry.isIntersecting));
    const handleVisibility = () => setDocumentVisible(!document.hidden);
    const handleToggle = () => setEnabled((current) => !current);

    observer.observe(main);
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    toggle.addEventListener("click", handleToggle);
    measure();
    handleVisibility();
    setLayers(weather);
    toggle.hidden = false;

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", handleVisibility);
      toggle.removeEventListener("click", handleToggle);
      toggle.hidden = true;
      clearWeather(weather);
    };
  }, []);

  const running = enabled && !prefersReducedMotion && documentVisible && pageVisible;

  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>(".blog-page .motion-toggle");
    if (toggle) updateMotionToggle(toggle, enabled, prefersReducedMotion);
    if (!running) clearWeather(layers);
  }, [enabled, layers, prefersReducedMotion, running]);

  return running ? (
    <WeatherAnimation layers={layers} elapsed={elapsed} isVisible={() => true} />
  ) : null;
}
