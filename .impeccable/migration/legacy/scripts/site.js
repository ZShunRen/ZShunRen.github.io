// The page and its content remain usable without JavaScript.
document.querySelectorAll(".gallery").forEach((gallery) => {
  const images = JSON.parse(gallery.dataset.images);
  const image = gallery.querySelector("#gallery-image");
  const controls = gallery.querySelector(".gallery-controls");
  const count = gallery.querySelector(".gallery-count");
  if (!image || !controls || images.length < 2) return;
  let index = 0;
  controls.hidden = false;
  controls.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      index =
        (index + Number(button.dataset.step) + images.length) % images.length;
      image.src = images[index];
      image.alt = `${gallery.dataset.title} screenshot ${index + 1} of ${images.length}`;
      count.textContent = `${index + 1} / ${images.length}`;
    });
  });
});

// One weather system connects the exposed summit, sheltered trail, and warm town.
// Native scrolling drives scenery only; the content never waits for an animation.
const home = document.querySelector(".home");
if (home) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.querySelector(".motion-toggle");
  const environments = [...document.querySelectorAll("[data-environment]")];
  const scenes = environments.map((element) => ({
    element,
    region: element.closest("section"),
    type: element.dataset.environment,
    layers: [...element.querySelectorAll("[data-depth]")],
    top: 0,
    height: 0,
    visible: false,
  }));
  let enabled = true;
  let frame = 0;
  let previousTime = 0;
  let positionDirty = true;
  let elapsed = 0;
  let viewportHeight = window.innerHeight;
  let routeSamples = [];
  const traveler = home.querySelector(".trail-traveler");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  // Small screens get fewer particles; backing stores are capped independently of DPR.
  const weather = [...document.querySelectorAll(".wind-snow")]
    .map((canvas, index) => {
      const context = canvas.getContext("2d");
      const scene = scenes.find((item) => item.region === canvas.parentElement);
      return {
        canvas,
        context,
        scene,
        width: 0,
        height: 0,
        particles: [],
        intensity:
          { summit: 1, forest: 0.7, town: 0.32, garden: 0.25 }[scene?.type] ||
          0.3,
      };
    })
    .filter((item) => item.context);

  // The route belongs to the page, never to an independently moving scene.
  // Every bend shares the next bend’s endpoint and vertical tangent.
  function connectTrail() {
    const main = document.querySelector(".home main");
    const route = main.querySelector(".journey-ground");
    const box = main.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    const mobile = width <= 600;
    const summit = document.querySelector(".summit").getBoundingClientRect();
    const nodes = [{ x: width * 0.62, y: summit.height * 0.82 }];
    const add = (x, y) => {
      if (y > nodes[nodes.length - 1].y + 1) nodes.push({ x, y });
    };
    add(width * 0.3, summit.bottom - box.top);
    for (const section of [...main.querySelectorAll(":scope > section")].slice(
      1,
    )) {
      const region = section.getBoundingClientRect();
      const panel = section.querySelector(
        ".reading-surface, .content-width, .contact-copy",
      );
      const reading = panel.getBoundingClientRect();
      const top = region.top - box.top;
      const bottom = region.bottom - box.top;
      const rail = mobile ? 11 : Math.max(70, reading.left - box.left - 75);
      if (section.id === "contact") {
        add(width * 0.24, top + 70);
        add(width * 0.24, bottom - 180);
        add(width * 0.36, bottom);
      } else {
        add(rail, Math.max(top + 35, reading.top - box.top - 35));
        add(rail + (mobile ? 0 : 28), top + region.height * 0.52);
        add(rail, Math.min(bottom - 35, reading.bottom - box.top + 25));
        add(
          section.id === "project_header"
            ? rail
            : mobile
              ? width * 0.23
              : rail + 60,
          bottom,
        );
      }
    }
    let d = `M${nodes[0].x},${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1],
        b = nodes[i];
      const tangent = (b.y - a.y) * 0.45;
      d += `C${a.x},${a.y + tangent} ${b.x},${b.y - tangent} ${b.x},${b.y}`;
    }
    route.setAttribute("viewBox", `0 0 ${width} ${height}`);
    route
      .querySelectorAll(":scope > path")
      .forEach((path) => path.setAttribute("d", d));
    const center = route.querySelector(".journey-route");
    const length = center.getTotalLength();
    routeSamples = Array.from({ length: 513 }, (_, index) =>
      center.getPointAtLength((length * index) / 512),
    );
  }

  function measure() {
    viewportHeight = window.innerHeight;
    connectTrail();
    for (const scene of scenes) {
      const box = scene.region.getBoundingClientRect();
      scene.top = box.top + window.scrollY;
      scene.height = box.height;
    }
    for (const item of weather) {
      const box = item.canvas.parentElement.getBoundingClientRect();
      item.width = box.width;
      item.height = box.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      item.canvas.width = Math.round(item.width * pixelRatio);
      item.canvas.height = Math.round(item.height * pixelRatio);
      item.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = Math.round((box.width < 600 ? 48 : 105) * item.intensity);
      item.particles = Array.from({ length: count }, () => ({
        x: Math.random() * item.width,
        y: Math.random() * item.height,
        depth: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
      }));
    }
    positionDirty = true;
    requestFrame();
  }

  function moveScenery() {
    if (!enabled && !preference.matches) {
      positionDirty = false;
      return;
    }
    const scrollY = window.scrollY;
    const active = enabled && !preference.matches;
    for (const scene of scenes) {
      if (!scene.visible && active) continue;
      const progress = clamp(
        (scrollY - scene.top + viewportHeight) /
          (scene.height + viewportHeight),
        0,
        1,
      );
      // Summit begins in its original composition; trees diverge as we pass them.
      const travel =
        scene.type === "summit"
          ? clamp((scrollY - scene.top) / scene.height, 0, 1)
          : progress - 0.35;
      for (const layer of scene.layers) {
        const depth = Number(layer.dataset.depth);
        const side = Number(layer.dataset.treeSide || 0);
        const distance =
          scene.type === "summit"
            ? travel * 950 * depth
            : -travel * 235 * depth;
        layer.style.transform = active
          ? `translate(${side * travel * 100 * depth}px, ${distance}px) scale(${1 + Math.max(0, travel) * depth * 0.11})`
          : "";
      }
      if (scene.type === "town") {
        // Light gathers as the visitor enters town. Static fallback stays warmly lit.
        scene.element.style.setProperty(
          "--arrival-light",
          active ? (0.65 + progress * 0.35).toFixed(3) : "1",
        );
      }
    }
    if (traveler && routeSamples.length) {
      const targetY = active
        ? scrollY + viewportHeight * 0.72
        : routeSamples[0].y;
      let lo = 0,
        hi = routeSamples.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (routeSamples[mid].y < targetY) lo = mid;
        else hi = mid;
      }
      const a = routeSamples[lo],
        b = routeSamples[hi];
      const t = clamp((targetY - a.y) / Math.max(1, b.y - a.y), 0, 1);
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      traveler.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(${innerWidth <= 600 ? 0.8 : 1})`,
      );
      traveler.style.setProperty(
        "--stride",
        `${active ? Math.sin(scrollY * 0.045) * 1.6 : 0}px`,
      );
    }
    positionDirty = false;
  }

  function drawWeather(item, delta, gust) {
    const { context: ctx, width, height, intensity } = item;
    ctx.clearRect(0, 0, width, height);
    for (const snow of item.particles) {
      const speed = (58 + gust * 210) * snow.depth * intensity;
      snow.x += delta * speed;
      snow.y +=
        delta * (12 + snow.depth * 14) +
        Math.sin(elapsed * 1.6 + snow.phase) * delta * 7;
      if (snow.x > width + 20) snow.x = -20;
      if (snow.y > height + 8) snow.y = -8;
      const tail = (1 + gust * 19 * intensity * intensity) * snow.depth;
      ctx.strokeStyle = `rgba(255,255,246,${0.28 + snow.depth * 0.4})`;
      ctx.lineWidth = 0.65 + snow.depth;
      ctx.beginPath();
      if (intensity < 0.4) {
        ctx.arc(snow.x, snow.y, 0.45 + snow.depth * 0.65, 0, Math.PI * 2);
      } else {
        ctx.moveTo(snow.x, snow.y);
        ctx.lineTo(snow.x - tail, snow.y - tail * 0.22);
      }
      ctx.stroke();
    }
    // Low powder sweeps follow the ridgeline, rather than filling the whole page.
    if (intensity >= 0.7 && gust > 0.2) {
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const start = ((elapsed * 76 + (i * width) / 4) % (width + 260)) - 160;
        const y = height * (0.64 + i * 0.045);
        ctx.strokeStyle = `rgba(249,250,242,${gust * 0.23})`;
        ctx.beginPath();
        ctx.moveTo(start, y);
        ctx.bezierCurveTo(
          start + 45,
          y - 10,
          start + 115,
          y + 7,
          start + 175,
          y - 7,
        );
        ctx.stroke();
      }
    }
  }

  function animate(now) {
    frame = 0;
    if (document.hidden) return;
    if (positionDirty) moveScenery();
    const running =
      enabled && !preference.matches && scenes.some((scene) => scene.visible);
    if (!running) {
      previousTime = 0;
      return;
    }
    const delta = previousTime
      ? Math.min((now - previousTime) / 1000, 0.05)
      : 0;
    previousTime = now;
    elapsed += delta;
    const gust = Math.pow((Math.sin(elapsed * 0.68) + 1) / 2, 2) * 0.75 + 0.12;
    for (const item of weather) {
      if (item.scene?.visible) drawWeather(item, delta, gust);
    }
    // Wind bends only foliage; structural SVG placement transforms stay intact.
    home.style.setProperty(
      "--wind-bend",
      `${(0.5 + gust * 2.2) * Math.sin(elapsed * 0.9)}deg`,
    );
    home.style.setProperty("--wind-drift", `${12 + gust * 25}px`);
    requestFrame();
  }
  function requestFrame() {
    if (!frame && !document.hidden)
      frame = window.requestAnimationFrame(animate);
  }
  function synchronize() {
    const running = enabled && !preference.matches && !document.hidden;
    home.classList.toggle("motion-running", running);
    toggle.hidden = false;
    toggle.disabled = preference.matches;
    toggle.setAttribute("aria-pressed", String(enabled && !preference.matches));
    toggle.querySelector("span").textContent = preference.matches
      ? "Motion reduced"
      : enabled
        ? "Motion on"
        : "Motion off";
    toggle.title = preference.matches
      ? "Your reduced-motion preference is respected."
      : "Toggle scenery movement";
    if (!running) {
      for (const item of weather)
        item.context.clearRect(0, 0, item.width, item.height);
      home.style.setProperty("--wind-bend", "0deg");
      home.style.setProperty("--wind-drift", "20px");
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }
    positionDirty = true;
    if (!document.hidden) requestFrame();
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      for (const scene of scenes.filter(
        (item) => item.element === entry.target,
      )) {
        scene.visible = entry.isIntersecting;
        scene.element.classList.toggle("scene-active", entry.isIntersecting);
      }
    }
    positionDirty = true;
    requestFrame();
  });
  for (const scene of scenes) observer.observe(scene.element);
  toggle.addEventListener("click", () => {
    enabled = !enabled;
    synchronize();
  });
  preference.addEventListener("change", synchronize);
  document.addEventListener("visibilitychange", synchronize);
  window.addEventListener(
    "scroll",
    () => {
      positionDirty = true;
      requestFrame();
    },
    { passive: true },
  );
  const resizeObserver = new ResizeObserver(measure);
  for (const scene of scenes) resizeObserver.observe(scene.region);
  window.addEventListener("resize", measure, { passive: true });
  document.fonts.ready.then(measure);
  measure();
  synchronize();
}
