import React from "react";
import ReactDOM from "react-dom/client";

import { EditorWithContext } from "./Editor";
import { Screen } from "./Screen";
import { routeNames, Router } from "./utils";

function App() {
  const route = Router.useRoute(routeNames);
  if (!route) return <h1>404</h1>;
  switch (route.name) {
    case "editor":
      return <EditorWithContext />;
    case "screen":
      return <Screen />;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
