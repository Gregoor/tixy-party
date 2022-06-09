import React, { useEffect, useState } from "react";

import { Credits } from "./Credits";
import { TixyCanvas } from "./TixyCanvas";
import { getRandomDefaultCode, PUBSUB_HOST } from "./utils";

export function Screen() {
  const [code, setCode] = useState(getRandomDefaultCode);
  useEffect(() => {
    let ws: WebSocket | null = null;
    function connect() {
      ws?.close();
      ws = new WebSocket(PUBSUB_HOST + "/sub");
      ws.addEventListener("message", async (event) => {
        const newcode = await event.data.text();
        console.log("got new code: " + newcode);
        setCode(newcode);
      });
      ws.addEventListener("close", () => {
        setTimeout(() => {
          connect();
        }, 500);
      });
      ws.addEventListener("error", () => {
        setTimeout(() => {
          connect();
        }, 500);
      });
    }

    connect();

    return () => {
      ws?.close();
    };
  });
  return (
    <div
      style={{
        margin: "0 auto",
        padding: 10,
        height: "100vh",
        boxSizing: "border-box",
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
          color: "grey",
        }}
      >
        {code}
      </div>
      <Credits />
    </div>
  );
}
