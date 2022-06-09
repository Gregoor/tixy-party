import React from "react";
import ReactDOM from "react-dom/client";
import { createRouter } from "@swan-io/chicane";

import { EditorWithContext } from "./Editor";
import { Screen } from "./Screen";

const Router = createRouter({
  Editor: "/",
  Screen: "/screen",
});

function App() {
  const route = Router.useRoute(["Editor", "Screen"]);
  if (!route) return <h1>404</h1>;
  switch (route.name) {
    case "Editor":
      return <EditorWithContext />;
    case "Screen":
      return <Screen />;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
