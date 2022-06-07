import React, { useEffect, useRef, useState } from "react";
import { DPR_SIZE, renderGrid, SIZE } from "./render-grid";

const SIN = "sin()";
const COS = "cos()";
const TIME = "t";
const RAND = "r";
const BACKSPACE = "<";

const buttonRows = [
  [SIN, COS, TIME, RAND],
  ["%", "x", "y", BACKSPACE],
  [7, 8, 9, "*"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "(", ")"],
];

function App() {
  const [code, setCode] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    try {
      const callback = new Function(
        "t",
        "i",
        "x",
        "y",
        `
      try {
        with (Math) {
          return ${code};
        }
      } catch (error) {
        return t;
      }
    `
      );
      const startTime = Number(new Date());
      let frameHandle: number | null = null;

      const startRenderLoop = () => {
        canvas.width = canvas.height = DPR_SIZE;
        renderGrid(context, callback, startTime);
        frameHandle = requestAnimationFrame(startRenderLoop);
      };

      startRenderLoop();

      return () => {
        cancelAnimationFrame(frameHandle!);
      };
    } catch (error) {
      console.error(error);
    }
  }, [code]);

  return (
    <div
      style={{
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: SIZE + "px", height: SIZE + "px" }}
      />

      <br />

      <div style={{ color: "white" }}>{code || "_"}</div>

      <div style={{ width: "100%" }}>
        {buttonRows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row" }}>
            {row.map((l) => (
              <button
                key={l}
                style={{ width: "100%" }}
                onClick={() => setCode(code + l)}
              >
                {l}
              </button>
            ))}
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
