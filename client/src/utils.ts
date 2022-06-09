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
