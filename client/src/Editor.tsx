import React, { useContext, useMemo, useState } from "react";

import { TixyCanvas } from "./TixyCanvas";
import { buildCallback, PUBSUB_HOST } from "./utils";
import { Button, BUTTON_BORDER_STYLE } from "./Button";
import { Credits } from "./Credits";

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
type ButtonDef = { label: string } & (
  | { do: (s: State) => State }
  | { input: string }
);
type RootButtonDef = ButtonDef & { secondary?: ButtonDef };

const RootButton = (s: RootButtonDef) => s;

type ButtonCell = string | number | RootButtonDef;
type Cell = ButtonCell | React.FunctionComponent;
type ButtonGrid = Cell[][];

const FnButton = (s: string) => RootButton({ label: s, input: s + "(" });

const SIN = FnButton("sin");
const COS = FnButton("cos");
const TAN = FnButton("tan");
const ATAN = FnButton("atan");
const RAND = RootButton({ label: "r", input: "r()" });
const FLOOR = RootButton({ label: "⤵", input: "floor(" });
const CEIL = RootButton({ label: "⤴", input: "ceil(" });
const ROUND = RootButton({ label: "~", input: "round(" });

const MenuContext = React.createContext<{
  menu: null | ButtonGrid;
  setMenu: (value: null | ButtonGrid) => void;
}>({ menu: null, setMenu: () => {} });

const CONSTANTS_GRID: ButtonGrid = [["x", "y", "i", "t"]];
function Constants() {
  const { setMenu } = useContext(MenuContext);
  return (
    <Button
      onClick={() => {
        setMenu(CONSTANTS_GRID);
      }}
    >
      💎
    </Button>
  );
}

const FUNCTIONS_GRID: ButtonGrid = [
  [SIN, COS, TAN, ATAN],
  [RAND, FLOOR, CEIL, ROUND],
];
function Functions() {
  const { setMenu } = useContext(MenuContext);
  return (
    <Button
      onClick={() => {
        setMenu(FUNCTIONS_GRID);
      }}
    >
      🧰
    </Button>
  );
}

const DIVIDE = RootButton({
  label: "/",
  input: "/",
  secondary: { label: "%", input: "%" } as ButtonDef,
});

const DELETE = RootButton({
  label: "←",
  do: ({ code, cursor }) => ({
    code: code.slice(0, cursor - 1) + code.slice(cursor + 1),
    cursor,
  }),
  secondary: {
    label: "🧨",
    do: ({ code, cursor }) =>
      code.length && confirm("Do you really want to clear everything?")
        ? {
            code: "",
            cursor,
          }
        : { code, cursor },
  } as ButtonDef,
});

const DEFAULT_GRID: ButtonGrid = [
  [Constants, Functions, DELETE, DIVIDE],
  [7, 8, 9, "*"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "(", ")"],
];

function runAction(def: ButtonCell | ButtonDef, code: string) {
  return typeof def == "object"
    ? "do" in def
      ? def.do({
          code: code,
          cursor: code.length,
        }).code
      : code + def.input
    : code + def;
}

const getCellLabel = (cell: ButtonCell | ButtonDef) =>
  typeof cell == "object" ? cell.label : cell;

function Editor() {
  const { menu, setMenu } = useContext(MenuContext);
  const [enteredCode, setEnteredCode] = useState("");

  const code = useMemo(
    () =>
      (
        enteredCode ||
        DEFAULT_CODES[Math.floor(DEFAULT_CODES.length * Math.random())]
      )
        .replaceAll(" ", "")
        .split("")
        .map((char) =>
          ["+", "-", "*", "/", "%"].includes(char) ? ` ${char} ` : char
        )
        .join(""),
    [enteredCode]
  );

  const isCodeValid = useMemo(() => Boolean(buildCallback(code)), [code]);

  const rows = menu ?? DEFAULT_GRID;

  return (
    <div
      style={{
        margin: "0 auto",
        padding: 10,
        minHeight: "100vh",
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
          color: enteredCode ? (isCodeValid ? "white" : "orange") : "grey",
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
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {row.map((cell, j) => {
              if (typeof cell == "function") {
                return React.createElement(cell, { key: j });
              }
              const hasSecondary =
                typeof cell == "object" &&
                "secondary" in cell &&
                cell.secondary;
              return (
                <Button
                  key={j}
                  onClick={() => {
                    setEnteredCode(runAction(cell, enteredCode));
                  }}
                  onLongPress={() => {
                    if (hasSecondary) {
                      setEnteredCode(runAction(cell.secondary!, enteredCode));
                    }
                  }}
                >
                  {getCellLabel(cell)}
                  {hasSecondary && (
                    <>
                      <br />
                      <div style={{ fontSize: 12, color: "grey" }}>
                        {getCellLabel(cell.secondary!)}
                      </div>
                    </>
                  )}
                </Button>
              );
            })}
            <br />
          </div>
        ))}
        {menu && (
          <Button
            style={{ aspectRatio: "4/1" }}
            onClick={() => {
              setMenu(null);
            }}
          >
            ❌
          </Button>
        )}
      </div>
      <div style={{ width: "100%", maxWidth: 250 }}>
        <button
          style={{
            border: BUTTON_BORDER_STYLE,
            padding: 0,
            width: "100%",
            fontSize: 20,
            color: "white",
            background: "none",
          }}
          onClick={() => {
            const ws = new WebSocket(PUBSUB_HOST + "/pub");
            ws.addEventListener("open", () => {
              ws.send(code);
            });
          }}
        >
          SEND
        </button>
      </div>
      <Credits />
    </div>
  );
}

export const EditorWithContext = () => {
  const [menu, setMenu] = useState<ButtonGrid | null>(null);
  return (
    <MenuContext.Provider value={{ menu, setMenu }}>
      <Editor />
    </MenuContext.Provider>
  );
};
