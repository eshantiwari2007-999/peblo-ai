import { create } from "zustand";

interface EditorState {
  isSaving: boolean;
  lastSaved: Date | null;
  unsavedChanges: boolean;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setUnsavedChanges: (unsaved: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isSaving: false,
  lastSaved: null,
  unsavedChanges: false,
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date, unsavedChanges: false }),
  setUnsavedChanges: (unsaved) => set({ unsavedChanges: unsaved }),
}));
