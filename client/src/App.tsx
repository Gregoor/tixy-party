import React, { useEffect, useRef, useState } from "react";
import { DPR_SIZE, renderGrid, SIZE } from "./render-grid";

const DEFAULT_CODES = [
  "sin(t)",
  "sin(y / 8 + t)",
  "cos(t + i + x * y)",
  "(x - y) - sin(t) * 16",
  "(x - y) / 24 - sin(t)",
  "sin(t * 5) * tan(t * 7)",
  "1 / 32 * tan(t / 64 * x * tan(i - x))",
  "sin(2 * atan((y - 7.5) / (x - 7.5)) + 5 * t)",
];

type Cursor = number;
type State = { code: string; cursor: Cursor };
type ButtonDef = {
  label: string;
  subLabel?: string;
} & ({ do: (s: State) => State } | { input: string });

const SIN: ButtonDef = { label: "sin", input: "sin(" };
const COS: ButtonDef = { label: "cos", input: "cos(" };
const TAN: ButtonDef = { label: "tan", input: "tan(" };
const ATAN: ButtonDef = { label: "atan", input: "atan(" };
const TIME: ButtonDef = { label: "t", subLabel: "time", input: "t" };
const RAND: ButtonDef = { label: "r", subLabel: "random", input: "r()" };
const BACKSPACE: ButtonDef = {
  label: "←",
  do: ({ code, cursor }) => ({
    code: code.slice(0, cursor - 1) + code.slice(cursor + 1),
    cursor,
  }),
};
const CLEAR: ButtonDef = {
  label: "C",
  subLabel: "clear",
  do: ({ code, cursor }) =>
    code.length && confirm("Do you really want to clear everything?")
      ? {
          code: code.slice(0, cursor - 1) + code.slice(cursor + 1),
          cursor,
        }
      : { code, cursor },
};

const buttonRows: (string | number | ButtonDef)[][] = [
  ["x", "y", CLEAR, BACKSPACE],
  ["", RAND, TIME, "%"],
  [SIN, COS, TAN, ATAN],
  [7, 8, 9, "*"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "(", ")"],
];

// const { location } = window;

// const wsClient = new WebSocket(
//   `${location.protocol.startsWith("https") ? "wss" : "ws"}://localhost:4000`
// );
// const wsClientBig = new WebSocket(
//   `${
//     location.protocol.startsWith("https") ? "wss" : "ws"
//   }://localhost:4000/bigscreen`
// );
// wsClientBig.addEventListener("message", async (event) => {
//   console.log(await event.data.text());
// });
// wsClient.addEventListener("open", () => {
//   wsClient.send("sup");
// });

function buildCallback(code: string) {
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

const BUTTON_BORDER_STYLE = "1px solid white";

function TixyCanvas({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const callback = buildCallback(code);
    if (!callback) {
      return;
    }

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
  }, [code]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: SIZE + "px", height: SIZE + "px" }}
    />
  );
}

function App() {
  const [enteredCode, setEnteredCode] = useState("");

  const code = (
    enteredCode ||
    DEFAULT_CODES[Math.floor(DEFAULT_CODES.length * Math.random())]
  )
    .replaceAll(" ", "")
    .split("")
    .map((char) =>
      ["+", "-", "*", "/", "%"].includes(char) ? ` ${char} ` : char
    )
    .join("");

  return (
    <div
      style={{
        margin: "0 auto",
        padding: 10,
        maxWidth: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <TixyCanvas code={code} />

      <div
        style={{
          fontSize: 20,
          color: enteredCode ? "white" : "grey",
        }}
        onClick={() => {
          if (!enteredCode) {
            setEnteredCode(code);
          }
        }}
      >
        {code}
      </div>

      <div style={{ width: "100%", maxWidth: 250 }}>
        {buttonRows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {row.map((cell, j) => {
              const isActionButton = typeof cell == "object";
              return (
                <button
                  key={j}
                  style={{
                    marginLeft: -1,
                    marginTop: -1,
                    border: BUTTON_BORDER_STYLE,
                    padding: 0,
                    width: "100%",
                    aspectRatio: "1 / 1",
                    fontSize: 20,
                    color: "white",
                    background: "none",
                  }}
                  onClick={() => {
                    setEnteredCode(
                      isActionButton
                        ? "do" in cell
                          ? cell.do({
                              code: enteredCode,
                              cursor: enteredCode.length,
                            }).code
                          : enteredCode + cell.input
                        : enteredCode + cell
                    );
                  }}
                >
                  {isActionButton ? cell.label : cell}
                  {isActionButton && cell.subLabel && (
                    <>
                      <br />
                      <div style={{ fontSize: 12, color: "grey" }}>
                        {cell.subLabel}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
            <br />
          </div>
        ))}
      </div>

      <div style={{ color: "lightgrey" }}>
        Credits to{" "}
        <a href="https://tixy.land/" target="_blank">
          tixy.land
        </a>
      </div>
    </div>
  );
}

export default App;
