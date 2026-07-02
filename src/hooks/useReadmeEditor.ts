import { useCallback, useMemo, useRef, useState } from "react";

export type ReadmeEditorMode = "edit" | "preview" | "split";

export type UseReadmeEditorOptions = {
  /** Initial committed markdown (e.g. the saved README). */
  initialValue?: string;
  /** Starting view mode. */
  initialMode?: ReadmeEditorMode;
  /** Called whenever the draft is accepted/committed. */
  onCommit?: (markdown: string) => void;
};

export type UseReadmeEditorReturn = {
  /** The live, editable markdown. */
  draft: string;
  /** The last accepted/committed markdown. */
  committed: string;
  /** Current view mode. */
  mode: ReadmeEditorMode;
  /** Draft differs from committed. */
  isDirty: boolean;
  /** True until anything has been committed at least once. */
  isEmpty: boolean;
  /** Update the working draft (edit). */
  setDraft: (next: string) => void;
  /** Swap in entirely new content as the draft (e.g. an AI proposal / paste). */
  replace: (next: string) => void;
  /** Commit the current draft as the accepted README. */
  accept: () => void;
  /** Discard draft edits, restoring the committed value. */
  revert: () => void;
  /** Switch view mode. */
  setMode: (mode: ReadmeEditorMode) => void;
  /** Convenience: enter edit mode. */
  edit: () => void;
  /** Reset both draft and committed to a value (default empty). */
  reset: (next?: string) => void;
};

/**
 * Headless state hook for a GitHub-style README markdown editor.
 *
 * Owns the draft/committed split plus the accept / edit / replace / revert
 * workflow. Rendering (textarea, highlighting, preview) is left entirely to
 * the consumer — this hook has no opinion on UI.
 */
export function useReadmeEditor(options: UseReadmeEditorOptions = {}): UseReadmeEditorReturn {
  const { initialValue = "", initialMode = "split", onCommit } = options;

  const [committed, setCommitted] = useState(initialValue);
  const [draft, setDraftState] = useState(initialValue);
  const [mode, setMode] = useState<ReadmeEditorMode>(initialMode);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const setDraft = useCallback((next: string) => setDraftState(next), []);

  const replace = useCallback((next: string) => {
    setDraftState(next);
    setMode((m) => (m === "preview" ? "split" : m));
  }, []);

  const accept = useCallback(() => {
    setDraftState((current) => {
      setCommitted(current);
      onCommitRef.current?.(current);
      return current;
    });
  }, []);

  const revert = useCallback(() => {
    setDraftState(committed);
  }, [committed]);

  const edit = useCallback(() => setMode("edit"), []);

  const reset = useCallback((next = "") => {
    setCommitted(next);
    setDraftState(next);
  }, []);

  const isDirty = draft !== committed;
  const isEmpty = committed.trim().length === 0 && draft.trim().length === 0;

  return useMemo(
    () => ({
      draft,
      committed,
      mode,
      isDirty,
      isEmpty,
      setDraft,
      replace,
      accept,
      revert,
      setMode,
      edit,
      reset,
    }),
    [draft, committed, mode, isDirty, isEmpty, setDraft, replace, accept, revert, edit, reset],
  );
}

export default useReadmeEditor;