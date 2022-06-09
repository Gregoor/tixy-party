import React, { useContext, useEffect, useMemo, useState } from "react";

import { TixyCanvas } from "./TixyCanvas";
import {
  buildCallback,
  getRandomDefaultCode,
  PUBSUB_HOST,
  Router,
} from "./utils";
import { Button, BUTTON_BORDER_STYLE } from "./Button";
import { Credits } from "./Credits";

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

const useIsValidCode = (code: string) =>
  useMemo(() => Boolean(buildCallback(code)), [code]);

function useCodeHistory(code: string) {
  const STORE_KEY = "code-history";
  const isCodeValid = useIsValidCode(code);
  const [storedItems, setStoredItems] = useState(() => {
    const storedValue = localStorage.getItem(STORE_KEY);
    if (!storedValue) {
      return [];
    }
    return JSON.parse(storedValue) as string[];
  });

  useEffect(() => {
    if (!isCodeValid || !code) {
      return;
    }
    const newStoredItems = Array.from(new Set(storedItems).add(code));
    localStorage.setItem(STORE_KEY, JSON.stringify(newStoredItems));
    setStoredItems(newStoredItems);
  }, [code, isCodeValid]);

  return storedItems;
}

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
  const [showHistory, setShowHistory] = useState(false);

  const code = useMemo(
    () =>
      (enteredCode || getRandomDefaultCode())
        .replaceAll(" ", "")
        .split("")
        .map((char) =>
          ["+", "-", "*", "/", "%"].includes(char) ? ` ${char} ` : char
        )
        .join(""),
    [enteredCode]
  );

  const isCodeValid = useIsValidCode(code);
  const codeHistory = useCodeHistory(enteredCode);

  const rows = menu ?? DEFAULT_GRID;

  if (showHistory) {
    return (
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => {
            setShowHistory(false);
          }}
        >
          Back
        </button>
        {[code, ...codeHistory].map((code, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid darkgrey",
              margin: 5,
              padding: 10,
            }}
            onClick={() => {
              setEnteredCode(code);
              setShowHistory(false);
            }}
          >
            <TixyCanvas code={code} />
            <div
              style={{
                fontSize: 20,
                color: "grey",
              }}
            >
              {code}
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      <TixyCanvas
        code={code}
        onClick={() => {
          Router.push("screen");
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          fontSize: 20,
          color: enteredCode ? (isCodeValid ? "white" : "orange") : "grey",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowHistory(true);
        }}
      >
        {code}
        {codeHistory.length > 1 && (
          <span style={{ paddingLeft: 5, color: "darkgrey" }}>▾</span>
        )}
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
