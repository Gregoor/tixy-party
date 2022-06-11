import React, { useEffect } from "react";
import QRCode from "react-qr-code";

import { Credits } from "./Credits";
import { TixyCanvas } from "./TixyCanvas";
import { getRandomDefaultCode, PUBSUB_HOST, Router } from "./utils";

export function Screen({ code }: { code?: string }) {
  code ??= getRandomDefaultCode();
  useEffect(() => {
    let ws: WebSocket | null = null;
    function connect() {
      ws?.close();
      ws = new WebSocket(PUBSUB_HOST + "/sub?topic=asd");
      ws.addEventListener("message", async (event) => {
        const newCode = await event.data.text();
        console.log("got new code: " + newCode);
        Router.replace("screen", { code: newCode });
      });
      ws.addEventListener("close", () => {
        setTimeout(() => {
          connect();
        }, 500);
      });
      ws.addEventListener("error", () => {
        ws?.close();
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
      <TixyCanvas
        code={code}
        onClick={() => {
          Router.replace("editor", { code });
        }}
      />

      <div
        style={{
          fontSize: 20,
          color: "grey",
        }}
      >
        {code}
      </div>
      <Credits />

      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
        }}
      >
        <QRCode
          value={location.protocol + "//" + location.host + Router.editor()}
          size={128}
          fgColor="black"
          bgColor="#F24"
        />
      </div>
    </div>
  );
}
