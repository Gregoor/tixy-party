import React from "react";

export const BUTTON_BORDER_STYLE = "1px solid white";

export function Button({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: any;
  style?: any;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        marginBottom: 0,
        marginLeft: -1,
        marginTop: -1,
        border: BUTTON_BORDER_STYLE,
        padding: 0,
        width: "100%",
        aspectRatio: "1 / 1",
        fontSize: 18,
        color: "white",
        background: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
