declare global {
  interface Window {
    __NEXT__HOT_DATA__?: {
      documents?: MapStore<EditorDocuments>;
      selectedFile?: SelectedFile;
      shellHighlighter?: HighlighterGeneric<BundledLanguage, BundledTheme>;
      files?: MapStore<FileMap>;
      modifiedFiles?: Map<string, string>;
      showTerminal?: WritableAtom<boolean>;
      webcontainerContext?: WebContainerContext;
      artifacts?: Artifacts;
      showWorkbench?: WritableAtom<boolean>;
      currentView?: WritableAtom<WorkbenchViewType>;
      unsavedFiles?: WritableAtom<Set<string>>;
      [key: string]: MapStore<EditorDocuments> | SelectedFile | undefined;
    };
  }
}

// This line is necessary to make the file a module
export {};
