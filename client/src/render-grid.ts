const COUNT = 16;
const SPACING = 1;

export const DPR = window.devicePixelRatio || 1;
// export const SIZE = COUNT * (DOT_SIZE + SPACING) - SPACING;

export const getIntSize = (floatSize: number) =>
  Math.floor(floatSize / COUNT) * COUNT;

export function renderGrid(
  context: CanvasRenderingContext2D,
  callback: Function,
  startTime: number,
  size: number
) {
  const dotSize = size / COUNT - SPACING;
  const time = (Number(new Date()) - startTime) / 1000;

  context.scale(DPR, DPR);
  let index = 0;
  for (let y = 0; y < COUNT; y++) {
    for (let x = 0; x < COUNT; x++) {
      const value = Number(callback(time, index, x, y));
      const offset = dotSize / 2;
      let color = "#FFF";
      let radius = (value * dotSize) / 2;

      if (radius < 0) {
        radius = -radius;
        color = "#F24";
      }

      if (radius > dotSize / 2) {
        radius = dotSize / 2;
      }

      context.beginPath();
      context.fillStyle = color;
      context.arc(
        x * (dotSize + SPACING) + offset,
        y * (dotSize + SPACING) + offset,
        radius,
        0,
        2 * Math.PI
      );
      context.fill();
      index++;
    }
  }
}
