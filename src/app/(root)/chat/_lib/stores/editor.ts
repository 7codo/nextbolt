import type {
  EditorDocument,
  ScrollPosition,
} from "@/app/(root)/chat/_components/editor/codemirror/CodeMirrorEditor";
import {
  atom,
  computed,
  map,
  type MapStore,
  type WritableAtom,
} from "nanostores";
import type { FileMap, FilesStore } from "./files";
import { getPersistedStore } from "../utils/persistence-handler";

export type EditorDocuments = Record<string, EditorDocument>;

type SelectedFile = WritableAtom<string | undefined>;

export class EditorStore {
  #filesStore: FilesStore;

  selectedFile: SelectedFile;
  documents: MapStore<EditorDocuments>;

  currentDocument;

  constructor(filesStore: FilesStore) {
    this.#filesStore = filesStore;

    this.selectedFile = getPersistedStore(
      "selectedFile",
      atom<string | undefined>()
    );
    this.documents = getPersistedStore("documents", map({}));

    if (typeof window !== "undefined") {
      window.__NEXT__HOT_DATA__ = {
        documents: this.documents,
        selectedFile: this.selectedFile,
      };
    }

    this.currentDocument = computed(
      [this.documents, this.selectedFile],
      (documents, selectedFile) => {
        if (!selectedFile) {
          return undefined;
        }
        return documents[selectedFile];
      }
    );
  }

  setDocuments(files: FileMap) {
    const previousDocuments = this.documents.get();

    this.documents.set(
      Object.fromEntries<EditorDocument>(
        Object.entries(files)
          .map(([filePath, dirent]) => {
            if (dirent === undefined || dirent.type === "folder") {
              return undefined;
            }

            const previousDocument = previousDocuments?.[filePath];

            return [
              filePath,
              {
                value: dirent.content,
                filePath,
                scroll: previousDocument?.scroll,
              },
            ] as [string, EditorDocument];
          })
          .filter(Boolean) as Array<[string, EditorDocument]>
      )
    );
  }

  setSelectedFile(filePath: string | undefined) {
    this.selectedFile.set(filePath);
  }

  updateScrollPosition(filePath: string, position: ScrollPosition) {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return;
    }

    this.documents.setKey(filePath, {
      ...documentState,
      scroll: position,
    });
  }

  updateFile(filePath: string, newContent: string) {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return;
    }

    const currentContent = documentState.value;
    const contentChanged = currentContent !== newContent;

    if (contentChanged) {
      this.documents.setKey(filePath, {
        ...documentState,
        value: newContent,
      });
    }
  }
}
