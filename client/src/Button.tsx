import React, { useRef } from "react";
import { LongPressDetectEvents, useLongPress } from "use-long-press";

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
  const pressStartRef = useRef<number | null>(null);
  const bindLongPress = useLongPress(
    () => {
      onLongPress?.();
      pressStartRef.current = null;
    },
    {
      // still works on touch, but does not trigger twice, like "both" does
      detect: LongPressDetectEvents.MOUSE,
      threshold: THRESHOLD,
      onStart() {
        pressStartRef.current = Date.now();
      },
      onCancel() {
        if (
          pressStartRef.current &&
          Date.now() - pressStartRef.current < THRESHOLD
        ) {
          onClick();
        }
        pressStartRef.current = null;
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
