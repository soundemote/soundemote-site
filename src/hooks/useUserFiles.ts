import { useAuth } from "./useAuth";

export type UserFilesLink = {
  /** Link to the signed-in user's own files. */
  myFilesUrl: string;
  /** Build a link to any user's files by handle. */
  userFilesUrl: (handle: string) => string;
  /** Whether the user is signed in and a handle exists. */
  isReady: boolean;
};

/**
 * Minimal hook that returns the URL to the user-files area.
 * The file explorer UI itself lives elsewhere; this just provides the link.
 */
export function useUserFiles(): UserFilesLink {
  const { session, profile } = useAuth();

  return {
    myFilesUrl: "/files",
    userFilesUrl: (handle: string) => `/@${handle.replace(/^@/, "")}/files`,
    isReady: Boolean(session && profile?.handle),
  };
}
