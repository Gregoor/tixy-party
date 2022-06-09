import React, { useEffect, useMemo, useRef, useState } from "react";
import { Rect, useRect } from "react-use-rect";

import { DPR, getIntSize, renderGrid } from "./render-grid";
import { buildCallback } from "./utils";

export function TixyCanvas({
  code,
  onClick,
}: {
  code: string;
  onClick?: () => void;
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [rectRef] = useRect(setRect);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const size = useMemo(
    () => (rect ? getIntSize(Math.min(rect.width, rect.height)) : null),
    [rect]
  );

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const callback = buildCallback(code);
    if (!callback || !size) {
      return;
    }

    const startTime = Number(new Date());
    let frameHandle: number | null = null;

    const startRenderLoop = () => {
      canvas.width = canvas.height = DPR * size;
      renderGrid(context, callback, startTime, size);
      frameHandle = requestAnimationFrame(startRenderLoop);
    };

    startRenderLoop();

    return () => {
      cancelAnimationFrame(frameHandle!);
    };
  }, [code, size]);

  return (
    <div
      ref={rectRef}
      style={{
        height: "100%",
        minHeight: 300,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size + "px",
          height: size + "px",
        }}
      />
    </div>
  );
}
