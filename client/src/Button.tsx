import React, { useState } from "react";
import { useLongPress } from "use-long-press";

export const BUTTON_BORDER_STYLE = "1px solid white";

export function Button({
  onClick,
  onLongPress,
  children,
  style,
}: {
  onClick: Function;
  onLongPress?: Function;
  children: any;
  style?: any;
}) {
  const THRESHOLD = 300;
  const [pressStart, setPressStart] = useState<number | null>(null);
  const bindLongPress = useLongPress(
    () => {
      onLongPress?.();
      setPressStart(null);
    },
    {
      threshold: THRESHOLD,
      onStart() {
        setPressStart(Date.now());
      },
      onCancel() {
        if (pressStart && Date.now() - pressStart < THRESHOLD) {
          onClick();
        }
        setPressStart(null);
      },
    }
  );

  return (
    <button
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
        ...style,
      }}
      {...bindLongPress()}
    >
      {children}
    </button>
  );
}
