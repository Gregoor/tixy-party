import React, { useContext, useEffect, useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

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

const RootButton = (s: ButtonDef) => s;

type ButtonCell = string | number | ButtonDef;
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
});
const MODULO = RootButton({ label: "%", input: "%" });

const DELETE = RootButton({
  label: "←",
  do: ({ code, cursor }) => ({
    code: code.slice(0, cursor - 1) + code.slice(cursor + 1),
    cursor,
  }),
});
const CLEAR = RootButton({
  label: "🧨",
  do: ({ code, cursor }) =>
    code.length && confirm("Do you really want to clear everything?")
      ? {
          code: "",
          cursor,
        }
      : { code, cursor },
});

const DEFAULT_GRID: ButtonGrid = [
  [Constants, Functions, CLEAR, DELETE],
  ["(", ")", MODULO, DIVIDE],
  [7, 8, 9, "*"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, "."],
];

const useIsValidCode = (code: string) =>
  useMemo(() => Boolean(buildCallback(code)), [code]);

function useCodeHistory(code: string) {
  code = code.replaceAll(" ", "");
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

const formatCode = (code: string) =>
  code
    .replaceAll(" ", "")
    .split("")
    .map((char) =>
      ["+", "-", "*", "/", "%"].includes(char) ? ` ${char} ` : char
    )
    .join("");

const CodeGallery = ({
  shownCode,
  codeHistory,
  onClose,
}: {
  shownCode: string;
  codeHistory: string[];
  onClose: (code?: string) => void;
}) => (
  <div style={{ textAlign: "center" }}>
    <button
      onClick={() => {
        onClose();
      }}
    >
      Back
    </button>
    {Array.from(
      new Set([...codeHistory, shownCode].map(formatCode).reverse())
    ).map((code, i) => (
      <div
        key={i}
        style={{
          borderBottom: "1px solid darkgrey",
          margin: 5,
          padding: 10,
        }}
        onClick={() => {
          onClose(code);
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

function Editor({ code }: { code: string }) {
  const { menu, setMenu } = useContext(MenuContext);
  const [showCodeGallery, setShowCodeGallery] = useState(false);

  const shownCode = useMemo(
    () => formatCode(code || getRandomDefaultCode()),
    [code]
  );

  const isCodeValid = useIsValidCode(shownCode);
  const codeHistory = useCodeHistory(code);

  const rows = menu ?? DEFAULT_GRID;

  const updateCodeParam = (code: string) => Router.replace("editor", { code });

  if (showCodeGallery) {
    return (
      <CodeGallery
        shownCode={shownCode}
        codeHistory={codeHistory}
        onClose={(code) => {
          if (code) {
            updateCodeParam(code);
          }
          setShowCodeGallery(false);
        }}
      />
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
        code={shownCode}
        onClick={() => {
          Router.push("screen", { code: shownCode });
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextareaAutosize
          value={shownCode}
          onChange={(event) => {
            updateCodeParam(event.target.value);
          }}
          style={{
            border: "none",
            fontSize: 20,
            color: code ? (isCodeValid ? "white" : "orange") : "grey",
            background: "transparent",
            resize: "none",
          }}
        />
        {codeHistory.length > 1 && (
          <button
            style={{
              border: BUTTON_BORDER_STYLE,
              paddingLeft: 5,
              color: "darkgrey",
              background: "none",
            }}
            onClick={() => {
              setShowCodeGallery(true);
            }}
          >
            ▾
          </button>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: 220 }}>
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
              return (
                <Button
                  key={j}
                  onClick={() => {
                    updateCodeParam(runAction(cell, code));
                  }}
                >
                  {getCellLabel(cell)}
                </Button>
              );
            })}
            {i == rows.length - 1 && !menu && (
              <Button
                style={{ width: "200%", aspectRatio: "2 / 1" }}
                onClick={() => {
                  const ws = new WebSocket(PUBSUB_HOST + "/pub?topic=asd");
                  ws.addEventListener("open", () => {
                    ws.send(shownCode);
                  });
                }}
              >
                🚀
              </Button>
            )}
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
      <Credits />
    </div>
  );
}

export const EditorWithContext = ({ code }: { code: string }) => {
  const [menu, setMenu] = useState<ButtonGrid | null>(null);
  return (
    <MenuContext.Provider value={{ menu, setMenu }}>
      <Editor code={code} />
    </MenuContext.Provider>
  );
};
