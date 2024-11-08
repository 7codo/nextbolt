"use client";
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from "@/app/(root)/chat/_components/editor/codemirror/CodeMirrorEditor";
import { IconButton } from "@/app/(root)/chat/_components/ui/IconButton";
import { PanelHeaderButton } from "@/app/(root)/chat/_components/ui/PanelHeaderButton";
import {
  Slider,
  type SliderOptions,
} from "@/app/(root)/chat/_components/ui/Slider";
import {
  workbenchStore,
  type WorkbenchViewType,
} from "@/app/(root)/chat/_lib/stores/workbench";
import { cubicEasingFn } from "@/app/(root)/chat/_lib/utils/easings";
import { renderLogger } from "@/app/(root)/chat/_lib/utils/logger";
import { useStore } from "@nanostores/react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Terminal, XCircle } from "lucide-react";
import { computed } from "nanostores";
import { memo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { EditorPanel } from "./EditorPanel";
import { Preview } from "./Preview";

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: "code",
    text: "Code",
  },
  right: {
    value: "preview",
    text: "Preview",
  },
};

export const Workbench = memo(
  ({ chatStarted, isStreaming }: WorkspaceProps) => {
    renderLogger.trace("Workbench");

    const hasPreview = useStore(
      computed(workbenchStore.previews, (previews) => previews.length > 0)
    );

    const selectedFile = useStore(workbenchStore.selectedFile);
    const currentDocument = useStore(workbenchStore.currentDocument);
    const unsavedFiles = useStore(workbenchStore.unsavedFiles);
    const files = useStore(workbenchStore.files);
    const selectedView = useStore(workbenchStore.currentView);

    const setSelectedView = (view: WorkbenchViewType) => {
      workbenchStore.currentView.set(view);
    };

    useEffect(() => {
      if (hasPreview) {
        setSelectedView("preview");
      }
    }, [hasPreview]);

    useEffect(() => {
      workbenchStore.setDocuments(files);
    }, [files]);

    const onEditorChange = useCallback<OnEditorChange>((update) => {
      workbenchStore.setCurrentDocumentContent(update.content);
    }, []);

    const onEditorScroll = useCallback<OnEditorScroll>((position) => {
      workbenchStore.setCurrentDocumentScrollPosition(position);
    }, []);

    const onFileSelect = useCallback((filePath: string | undefined) => {
      workbenchStore.setSelectedFile(filePath);
    }, []);

    const onFileSave = useCallback(() => {
      workbenchStore.saveCurrentDocument().catch(() => {
        toast.error("Failed to update file content");
      });
    }, []);

    const onFileReset = useCallback(() => {
      workbenchStore.resetCurrentDocument();
    }, []);

    console.log("WORKBENCH: currentDocument", currentDocument);
    console.log("WORKBENCH: files", JSON.stringify(files));
    console.log("WORKBENCH: selectedFile", selectedFile);
    console.log("WORKBENCH: isStreaming", isStreaming);

    return (
      chatStarted && (
        <div className="h-full flex flex-col bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor  overflow-hidden">
          <div className="flex items-center px-3 py-2 border-b border-bolt-elements-borderColor">
            <Slider
              selected={selectedView}
              options={sliderOptions}
              setSelected={setSelectedView}
            />
            <div className="ml-auto" />
            {selectedView === "code" && (
              <PanelHeaderButton
                className="mr-1 text-sm"
                onClick={() => {
                  workbenchStore.toggleTerminal(
                    !workbenchStore.showTerminal.get()
                  );
                }}
              >
                <Terminal className="w-4 h-4 text-white" />
                Toggle Terminal
              </PanelHeaderButton>
            )}
            <IconButton
              className="-mr-1"
              size="xl"
              onClick={() => {
                workbenchStore.showWorkbench.set(false);
              }}
            >
              <XCircle className="w-4 h-4 text-white" />
            </IconButton>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <View
              initial={{ x: selectedView === "code" ? 0 : "-100%" }}
              animate={{ x: selectedView === "code" ? 0 : "-100%" }}
              /* className="h-full" */
            >
              <EditorPanel
                editorDocument={currentDocument}
                isStreaming={isStreaming}
                selectedFile={selectedFile}
                files={files}
                unsavedFiles={unsavedFiles}
                onFileSelect={onFileSelect}
                onEditorScroll={onEditorScroll}
                onEditorChange={onEditorChange}
                onFileSave={onFileSave}
                onFileReset={onFileReset}
              />
            </View>
            <View
              initial={{ x: selectedView === "preview" ? 0 : "100%" }}
              animate={{ x: selectedView === "preview" ? 0 : "100%" }}
            >
              <Preview />
            </View>
          </div>
        </div>
      )
    );
  }
);

Workbench.displayName = "Workbench";

interface ViewProps extends HTMLMotionProps<"div"> {
  children: JSX.Element;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div
      className="absolute inset-0"
      transition={viewTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
});
View.displayName = "View";
