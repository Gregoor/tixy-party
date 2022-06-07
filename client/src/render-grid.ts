const COUNT = 16;
const DOT_SIZE = 16;
const SPACING = 1;

const DPR = window.devicePixelRatio || 1;

export const SIZE = COUNT * (DOT_SIZE + SPACING) - SPACING;
export const DPR_SIZE = SIZE * DPR;

export function renderGrid(
  context: CanvasRenderingContext2D,
  callback: Function,
  startTime: number
) {
  const time = (Number(new Date()) - startTime) / 1000;

  context.scale(DPR, DPR);
  let index = 0;
  for (let y = 0; y < COUNT; y++) {
    for (let x = 0; x < COUNT; x++) {
      const value = Number(callback(time, index, x, y));
      const offset = DOT_SIZE / 2;
      let color = "#FFF";
      let radius = (value * DOT_SIZE) / 2;

      if (radius < 0) {
        radius = -radius;
        color = "#F24";
      }

      if (radius > DOT_SIZE / 2) {
        radius = DOT_SIZE / 2;
      }

      context.beginPath();
      context.fillStyle = color;
      context.arc(
        x * (DOT_SIZE + SPACING) + offset,
        y * (DOT_SIZE + SPACING) + offset,
        radius,
        0,
        2 * Math.PI
      );
      context.fill();
      index++;
    }
  }
}
