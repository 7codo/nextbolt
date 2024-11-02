import { create } from "zustand";
import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
} from "shiki";
const highlighterOptions = {
  langs: ["shell"],
  themes: ["light-plus", "dark-plus"],
};

interface HotDataStore {
  shellHighlighter:
    | HighlighterGeneric<BundledLanguage, BundledTheme>
    | undefined;
  initiateShellHighlighter: () => void;
  selectedFile: string | undefined;
}

export const useHotDataStore = create<HotDataStore>()((set, get) => ({
  shellHighlighter: undefined,
  initiateShellHighlighter: async () => {
    const shellHighlighter =
      get().shellHighlighter ?? (await createHighlighter(highlighterOptions));
    set({ shellHighlighter });
  },

  //
  selectedFile: undefined,
}));
