export type EnvironmentKind = "summit" | "forest" | "town" | "garden" | string;

export interface TrailPoint {
  x: number;
  y: number;
}

export interface SceneryLayer {
  element: HTMLElement | SVGElement;
  depth: number;
  side: number;
}

export interface SceneryScene {
  element: HTMLElement;
  region: HTMLElement;
  type: EnvironmentKind;
  layers: SceneryLayer[];
  top: number;
  height: number;
  visible: boolean;
}

export interface TrailGeometry {
  main: HTMLElement;
  mainTop: number;
  route: SVGSVGElement;
  routePath: SVGPathElement;
  traveler: SVGGElement | null;
  samples: TrailPoint[];
}

const SAMPLE_COUNT = 513;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const isTransformable = (element: Element): element is HTMLElement | SVGElement =>
  element instanceof HTMLElement || element instanceof SVGElement;

export function collectScenes(home: HTMLElement): SceneryScene[] {
  return Array.from(home.querySelectorAll<HTMLElement>("[data-environment]"))
    .map((element): SceneryScene | null => {
      const region = element.closest<HTMLElement>("section");
      if (!region) return null;

      const layers = Array.from(element.querySelectorAll("[data-depth]"))
        .filter(isTransformable)
        .map((layer) => ({
          element: layer,
          depth: Number(layer.dataset.depth) || 0,
          side: Number(layer.dataset.treeSide) || 0,
        }));

      return {
        element,
        region,
        type: element.dataset.environment ?? "",
        layers,
        top: 0,
        height: 0,
        visible: false,
      };
    })
    .filter((scene): scene is SceneryScene => scene !== null);
}

export function collectTrail(home: HTMLElement): TrailGeometry | null {
  const main = home.querySelector<HTMLElement>("main");
  const route = main?.querySelector<SVGSVGElement>(".journey-ground");
  const routePath = route?.querySelector<SVGPathElement>(".journey-route");
  if (!main || !route || !routePath) return null;

  return {
    main,
    mainTop: 0,
    route,
    routePath,
    traveler: route.querySelector<SVGGElement>(".trail-traveler"),
    samples: [],
  };
}

/**
 * Measures one page-spanning route. Consecutive cubic segments share endpoints
 * and vertical tangents, so the road never kinks at a section boundary.
 */
export function measureTrail(trail: TrailGeometry): void {
  const mainBox = trail.main.getBoundingClientRect();
  trail.mainTop = mainBox.top + window.scrollY;
  const summit = trail.main.querySelector<HTMLElement>(".summit");
  if (!summit || mainBox.width <= 0 || mainBox.height <= 0) return;

  const summitBox = summit.getBoundingClientRect();
  const width = mainBox.width;
  const height = mainBox.height;
  const mobile = width <= 600;
  const nodes: TrailPoint[] = [{ x: width * 0.62, y: summitBox.height * 0.82 }];
  const add = (x: number, y: number) => {
    if (y > nodes[nodes.length - 1].y + 1) nodes.push({ x, y });
  };

  add(width * 0.3, summitBox.bottom - mainBox.top);

  const sections = Array.from(trail.main.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === "SECTION",
  );

  for (const section of sections.slice(1)) {
    const region = section.getBoundingClientRect();
    const panel = section.querySelector<HTMLElement>(
      ".reading-surface, .content-width, .contact-copy",
    );
    const reading = panel?.getBoundingClientRect() ?? region;
    const top = region.top - mainBox.top;
    const bottom = region.bottom - mainBox.top;
    const rail = mobile ? 11 : Math.max(70, reading.left - mainBox.left - 75);

    if (section.id === "contact") {
      add(width * 0.24, top + 70);
      add(width * 0.24, bottom - 180);
      add(width * 0.36, bottom);
      continue;
    }

    add(rail, Math.max(top + 35, reading.top - mainBox.top - 35));
    add(rail + (mobile ? 0 : 28), top + region.height * 0.52);
    add(rail, Math.min(bottom - 35, reading.bottom - mainBox.top + 25));
    add(section.id === "project_header" ? rail : mobile ? width * 0.23 : rail + 60, bottom);
  }

  let pathData = `M${nodes[0].x},${nodes[0].y}`;
  for (let index = 1; index < nodes.length; index += 1) {
    const from = nodes[index - 1];
    const to = nodes[index];
    const tangent = (to.y - from.y) * 0.45;
    pathData += `C${from.x},${from.y + tangent} ${to.x},${to.y - tangent} ${to.x},${to.y}`;
  }

  trail.route.setAttribute("viewBox", `0 0 ${width} ${height}`);
  trail.route
    .querySelectorAll<SVGPathElement>(":scope > path")
    .forEach((path) => path.setAttribute("d", pathData));

  const length = trail.routePath.getTotalLength();
  trail.samples = Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const point = trail.routePath.getPointAtLength((length * index) / (SAMPLE_COUNT - 1));
    return { x: point.x, y: point.y };
  });
}

export function measureScenes(scenes: SceneryScene[], scrollY: number): void {
  for (const scene of scenes) {
    const box = scene.region.getBoundingClientRect();
    scene.top = box.top + scrollY;
    scene.height = box.height;
  }
}

export function placeTraveler(
  trail: TrailGeometry,
  scrollY: number,
  viewportHeight: number,
  animated: boolean,
): void {
  const { samples, traveler } = trail;
  if (!traveler || samples.length < 2) return;

  const targetY = animated
    ? scrollY + viewportHeight * 0.72 - trail.mainTop
    : samples[0].y;
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (samples[middle].y < targetY) low = middle;
    else high = middle;
  }

  const from = samples[low];
  const to = samples[high];
  const progress = clamp((targetY - from.y) / Math.max(1, to.y - from.y), 0, 1);
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;
  const scale = window.innerWidth <= 600 ? 0.8 : 1;

  traveler.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
  traveler.style.setProperty(
    "--stride",
    `${animated ? Math.sin(scrollY * 0.045) * 1.6 : 0}px`,
  );
}

export function applySceneryAtScroll(
  scenes: SceneryScene[],
  trail: TrailGeometry,
  scrollY: number,
  viewportHeight: number,
): void {
  for (const scene of scenes) {
    if (!scene.visible) continue;

    const progress = clamp(
      (scrollY - scene.top + viewportHeight) / (scene.height + viewportHeight),
      0,
      1,
    );
    const travel =
      scene.type === "summit"
        ? clamp((scrollY - scene.top) / Math.max(1, scene.height), 0, 1)
        : progress - 0.35;

    for (const layer of scene.layers) {
      const distance =
        scene.type === "summit" ? travel * 950 * layer.depth : -travel * 235 * layer.depth;
      const scale = 1 + Math.max(0, travel) * layer.depth * 0.11;
      layer.element.style.transform = `translate(${layer.side * travel * 100 * layer.depth}px, ${distance}px) scale(${scale})`;
    }

    if (scene.type === "town") {
      scene.element.style.setProperty("--arrival-light", (0.65 + progress * 0.35).toFixed(3));
    }
  }

  placeTraveler(trail, scrollY, viewportHeight, true);
}

export function resetScenery(scenes: SceneryScene[], trail: TrailGeometry): void {
  for (const scene of scenes) {
    for (const layer of scene.layers) layer.element.style.transform = "";
    if (scene.type === "town") scene.element.style.setProperty("--arrival-light", "1");
  }
  placeTraveler(trail, 0, window.innerHeight, false);
}
