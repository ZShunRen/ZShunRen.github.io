export function updateMotionToggle(toggle: HTMLButtonElement, enabled: boolean, reduced: boolean) {
  toggle.disabled = reduced;
  toggle.setAttribute("aria-pressed", String(enabled && !reduced));
  const label = toggle.querySelector("span");
  if (label) label.textContent = reduced ? "Motion reduced" : enabled ? "Motion on" : "Motion off";
  toggle.title = reduced
    ? "Your reduced-motion preference is respected."
    : "Toggle scenery movement";
}
