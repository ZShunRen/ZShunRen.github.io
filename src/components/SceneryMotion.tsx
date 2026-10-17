import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import WeatherAnimation from "./WeatherAnimation";
import useReducedMotion from "./useReducedMotion";
import { updateMotionToggle } from "../lib/scenery/motionControl";
import { keepTrailClear } from "../lib/scenery/layout";
import {
  applySceneryAtScroll,
  collectScenes,
  collectTrail,
  measureScenes,
  measureTrail,
  placeTraveler,
  resetScenery,
  type SceneryScene,
  type TrailGeometry,
} from "../lib/scenery/geometry";
import {
  clearWeather,
  collectWeather,
  measureWeather,
  type WeatherLayer,
} from "../lib/scenery/weather";

interface SceneryRuntime {
  home: HTMLElement;
  toggle: HTMLButtonElement;
  scenes: SceneryScene[];
  trail: TrailGeometry;
  weather: WeatherLayer[];
  viewportHeight: number;
  lastAppliedScrollY: number;
  motionActive: boolean;
  reducedMotion: boolean;
}

export default function SceneryMotion() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [runtime, setRuntime] = useState<SceneryRuntime | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [visibleSceneCount, setVisibleSceneCount] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const home = document.querySelector<HTMLElement>(".home");
    const toggle = document.querySelector<HTMLButtonElement>(".motion-toggle");
    if (!home || !toggle) return;

    const scenes = collectScenes(home);
    const trail = collectTrail(home);
    if (!trail || scenes.length === 0) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nextRuntime: SceneryRuntime = {
      home,
      toggle,
      scenes,
      trail,
      weather: collectWeather(home, scenes),
      viewportHeight: window.innerHeight,
      lastAppliedScrollY: window.scrollY,
      motionActive: !reducedMotionQuery.matches,
      reducedMotion: reducedMotionQuery.matches,
    };

    let measureFrame = 0;
    let disposed = false;
    const measure = () => {
      measureFrame = 0;
      nextRuntime.viewportHeight = window.innerHeight;
      measureTrail(nextRuntime.trail);
      keepTrailClear(nextRuntime.trail);
      measureScenes(nextRuntime.scenes, window.scrollY);
      measureWeather(nextRuntime.weather);
      if (nextRuntime.reducedMotion) {
        resetScenery(nextRuntime.scenes, nextRuntime.trail);
        clearWeather(nextRuntime.weather);
      } else if (nextRuntime.motionActive && !document.hidden) {
        nextRuntime.lastAppliedScrollY = window.scrollY;
        applySceneryAtScroll(
          nextRuntime.scenes,
          nextRuntime.trail,
          nextRuntime.lastAppliedScrollY,
          nextRuntime.viewportHeight,
        );
      } else {
        placeTraveler(
          nextRuntime.trail,
          nextRuntime.lastAppliedScrollY,
          nextRuntime.viewportHeight,
          true,
        );
      }
    };
    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };
    const handleToggle = () => setEnabled((current) => !current);
    const handleVisibility = () => setDocumentVisible(!document.hidden);

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const scene = nextRuntime.scenes.find((candidate) => candidate.element === entry.target);
        if (!scene) continue;
        scene.visible = entry.isIntersecting;
        scene.element.classList.toggle("scene-active", scene.visible);
      }
      setVisibleSceneCount(nextRuntime.scenes.filter((scene) => scene.visible).length);
      if (nextRuntime.motionActive && !document.hidden) {
        applySceneryAtScroll(
          nextRuntime.scenes,
          nextRuntime.trail,
          nextRuntime.lastAppliedScrollY,
          nextRuntime.viewportHeight,
        );
      }
    });
    for (const scene of nextRuntime.scenes) intersectionObserver.observe(scene.element);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    for (const region of new Set(nextRuntime.scenes.map((scene) => scene.region))) {
      resizeObserver.observe(region);
    }

    toggle.addEventListener("click", handleToggle);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    measure();
    setDocumentVisible(!document.hidden);
    setRuntime(nextRuntime);
    toggle.hidden = false;

    document.fonts.ready.then(() => {
      if (!disposed) scheduleMeasure();
    });

    return () => {
      disposed = true;
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      toggle.removeEventListener("click", handleToggle);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", scheduleMeasure);
      toggle.hidden = true;
      home.classList.remove("motion-running");
      for (const scene of scenes) scene.element.classList.remove("scene-active");
      resetScenery(scenes, trail);
      clearWeather(nextRuntime.weather);
      home.style.removeProperty("--wind-drift");
    };
  }, []);

  const motionActive = enabled && !prefersReducedMotion;

  useEffect(() => {
    if (!runtime) return;

    const updateFromScroll = (value: number) => {
      if (!motionActive || !documentVisible) return;
      runtime.lastAppliedScrollY = value;
      applySceneryAtScroll(runtime.scenes, runtime.trail, value, runtime.viewportHeight);
    };

    updateFromScroll(scrollY.get());
    return scrollY.on("change", updateFromScroll);
  }, [documentVisible, motionActive, runtime, scrollY]);

  useEffect(() => {
    if (!runtime) return;

    const running = motionActive && documentVisible;
    runtime.motionActive = motionActive;
    runtime.reducedMotion = prefersReducedMotion;
    runtime.home.classList.toggle("motion-running", running);
    updateMotionToggle(runtime.toggle, enabled, prefersReducedMotion);

    if (prefersReducedMotion) {
      resetScenery(runtime.scenes, runtime.trail);
      clearWeather(runtime.weather);
      runtime.home.style.setProperty("--wind-drift", "20px");
    } else if (running) {
      runtime.lastAppliedScrollY = scrollY.get();
      applySceneryAtScroll(
        runtime.scenes,
        runtime.trail,
        runtime.lastAppliedScrollY,
        runtime.viewportHeight,
      );
    } else if (!enabled) {
      // Re-sample the frozen location after a responsive route measurement.
      placeTraveler(
        runtime.trail,
        runtime.lastAppliedScrollY,
        runtime.viewportHeight,
        true,
      );
    }
  }, [documentVisible, enabled, motionActive, prefersReducedMotion, runtime, scrollY]);

  const weatherRunning =
    runtime !== null && motionActive && documentVisible && visibleSceneCount > 0;

  return weatherRunning ? (
    <WeatherAnimation
      layers={runtime.weather}
      elapsed={elapsed}
      isVisible={(layer) => Boolean(layer.scene?.visible)}
      onWind={(gust) => runtime.home.style.setProperty("--wind-drift", `${12 + gust * 25}px`)}
    />
  ) : null;
}
