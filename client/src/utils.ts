import { createRouter } from "@swan-io/chicane";

export const PUBSUB_HOST =
  (window.location.protocol === "https:" ? "wss://" : "ws://") +
  window.location.host;

export function buildCallback(code: string) {
  try {
    return new Function(
      "t",
      "i",
      "x",
      "y",
      `
      try {
        with (Math) {
          const r = () => Math.random();
          return ${code};
        }
      } catch (error) {
        return t;
      }
    `
    );
  } catch (error) {
    console.error("Error while building callback", error);
  }
}

const routes = {
  editor: "/",
  screen: "/screen",
} as const;
export const routeNames = Object.keys(routes) as (keyof typeof routes)[];

export const Router = createRouter(routes);

const DEFAULT_CODES = [
  "sin(t)",
  "sin(y / 8 + t)",
  "cos(t + i + x * y)",
  "(x - y) - sin(t) * 16",
  "(x - y) / 24 - sin(t)",
  "sin(t / 2) * tan(t / 4)",
  "1 / 32 * tan(t / 64 * x * tan(i - x))",
  "sin(2 * atan((y - 7.5) / (x - 7.5)) + 5 * t)",
];

export const getRandomDefaultCode = () =>
  DEFAULT_CODES[Math.floor(DEFAULT_CODES.length * Math.random())];
