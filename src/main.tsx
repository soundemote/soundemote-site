import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Clean-URL bridge: custom links like soundemote.io/reverb are path-based, but
// the app routes with HashRouter (URLs live after "#"). Static hosting serves
// index.html for any path, so when we land on a non-root path without a hash we
// fold that path into the hash before React mounts. This makes /reverb,
// /shootingstar, /<article>, etc. resolve the same as /#/reverb would.
const { pathname, search, hash } = window.location;
if (pathname !== "/" && !hash) {
  window.history.replaceState(null, "", `/#${pathname}${search}`);
}

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
