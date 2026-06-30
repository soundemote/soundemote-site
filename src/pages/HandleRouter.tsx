import { useParams } from "react-router-dom";
import PatchShortlinkPage from "./PatchShortlinkPage.tsx";
import UserPage from "./UserPage.tsx";

// Single top-level segment resolver:
//   /@elanhickler -> user page (reserved)
//   /sinewave  -> bare claimed-patch lookup
const HandleRouter = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  return handle.startsWith("@") ? <UserPage /> : <PatchShortlinkPage />;
};

export default HandleRouter;