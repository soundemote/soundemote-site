import { Navigate, useParams } from "react-router-dom";
import PatchShortlinkPage from "./PatchShortlinkPage.tsx";
import UserPage from "./UserPage.tsx";

// Static routes that should never be treated as bare handles, even if the
// <Routes> order in App.tsx is stale or a dynamic route catches them first.
const RESERVED_HANDLES = new Set([
  "auth",
  "admin",
  "login",
  "claims",
  "sandbox",
  "share",
  "learning-lab",
  "circle-test",
  "oscilloscope",
  "scope-scratch",
  "avw-research",
  "supabase-test",
  "index",
  "404",
]);

// Single top-level segment resolver:
//   /@elanhickler -> user page (reserved)
//   /sinewave  -> bare claimed-patch lookup
const HandleRouter = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  if (handle.startsWith("@")) return <UserPage />;
  if (RESERVED_HANDLES.has(handle.toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  return <PatchShortlinkPage />;
};

export default HandleRouter;