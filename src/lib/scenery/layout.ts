import type { TrailGeometry, TrailPoint } from "./geometry";

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function crossesBounds(points: TrailPoint[], bounds: Bounds): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const top = Math.max(from.y, bounds.top);
    const bottom = Math.min(to.y, bounds.bottom);
    if (top > bottom) continue;

    const distance = Math.max(0.001, to.y - from.y);
    const xAtTop = from.x + ((top - from.y) / distance) * (to.x - from.x);
    const xAtBottom = from.x + ((bottom - from.y) / distance) * (to.x - from.x);
    if (Math.max(xAtTop, xAtBottom) >= bounds.left &&
        Math.min(xAtTop, xAtBottom) <= bounds.right) return true;
  }
  return false;
}

/** Reserve the walking corridor during layout, without moving or slicing scenery. */
export function keepTrailClear(trail: TrailGeometry): void {
  const mainBox = trail.main.getBoundingClientRect();
  // Half the outer road edge, a quiet margin, and 2px for curve interpolation.
  const clearance = window.innerWidth <= 600 ? 21 : 35;
  const placements = Array.from(
    trail.main.querySelectorAll<SVGGElement>(".travel-tree, .travel-chalet"),
  ).map((element) => {
    // visibility:hidden retains geometry, so resizing can restore whole objects.
    const box = element.getBoundingClientRect();
    const bounds = {
      left: box.left - mainBox.left - clearance,
      right: box.right - mainBox.left + clearance,
      top: box.top - mainBox.top - clearance,
      bottom: box.bottom - mainBox.top + clearance,
    };
    return {
      element,
      obstructs: box.width > 0 && box.height > 0 && crossesBounds(trail.samples, bounds),
    };
  });

  for (const { element, obstructs } of placements) {
    element.toggleAttribute("data-trail-obstructed", obstructs);
  }
}
