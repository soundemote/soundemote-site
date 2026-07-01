import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

export type UserFile = {
  id: string;
  owner_id: string;
  slug: string;
  name: string | null;
  description: string | null;
  is_public: boolean;
  storage_path: string | null;
  size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};

export type UserFilesLink = {
  /** Link to the signed-in user's own files. */
  myFilesUrl: string;
  /** Build a link to any user's files by handle. */
  userFilesUrl: (handle: string) => string;
  /** Whether the user is signed in and a handle exists. */
  isReady: boolean;
  /** List all files for the signed-in user (owner sees everything). */
  listMyFiles: () => Promise<UserFile[]>;
  /** List public files for any user by owner id. */
  listPublicFiles: (ownerId: string) => Promise<UserFile[]>;
  /** True if the signed-in user owns the given file. */
  isOwner: (file: UserFile) => boolean;
};

/**
 * Hook that returns the URL to the user-files area plus privacy-aware queries.
 * The file explorer UI itself lives elsewhere; this just provides the link and data helpers.
 */
export function useUserFiles(): UserFilesLink {
  const { session, profile } = useAuth();

  const listMyFiles = async (): Promise<UserFile[]> => {
    if (!session?.user?.id) return [];
    const { data, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as UserFile[]) ?? [];
  };

  const listPublicFiles = async (ownerId: string): Promise<UserFile[]> => {
    const { data, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("is_public", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as UserFile[]) ?? [];
  };

  const isOwner = (file: UserFile): boolean => {
    return Boolean(session?.user?.id && file.owner_id === session.user.id);
  };

  return {
    myFilesUrl: "/files",
    userFilesUrl: (handle: string) => `/@${handle.replace(/^@/, "")}/files`,
    isReady: Boolean(session && profile?.handle),
    listMyFiles,
    listPublicFiles,
    isOwner,
  };
}
