import { useSyncExternalStore } from "react";

const queryText = "(prefers-reduced-motion: reduce)";
const getSnapshot = () => window.matchMedia(queryText).matches;
const getServerSnapshot = () => false;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(queryText);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
