import type { ActionState } from "@/app/(root)/chat/_lib/runtime/action-runner";
import { workbenchStore } from "@/app/(root)/chat/_lib/stores/workbench";
import { cubicEasingFn } from "@/app/(root)/chat/_lib/utils/easings";
import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  LoaderCircle,
  X,
} from "lucide-react";
import { computed } from "nanostores";
import { memo, useEffect, useRef, useState } from "react";
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

// Create a singleton pattern for the highlighter
let shellHighlighterInstance: HighlighterGeneric<
  BundledLanguage,
  BundledTheme
> | null = null;

// Helper to initialize highlighter
const getHighlighter = async () => {
  if (typeof window === "undefined") return null;

  if (!shellHighlighterInstance) {
    shellHighlighterInstance = await createHighlighter(highlighterOptions);

    // Store in window for HMR persistence
    if (typeof window !== "undefined") {
      if (window.__NEXT__HOT_DATA__) {
        window.__NEXT__HOT_DATA__.shellHighlighter = shellHighlighterInstance;
      }
    }
  }
  return shellHighlighterInstance;
};

interface ArtifactProps {
  messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);

  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];

  const actions = useStore(
    computed(artifact.runner.actions, (actions) => {
      return Object.values(actions);
    })
  );

  const toggleActions = () => {
    userToggledActions.current = true;
    setShowActions(!showActions);
  };

  useEffect(() => {
    if (actions.length && !showActions && !userToggledActions.current) {
      setShowActions(true);
    }
  }, [actions]);

  return (
    <div className="artifact border border-bolt-elements-borderColor flex flex-col overflow-hidden rounded-lg w-full transition-border duration-150">
      <div className="flex">
        <button
          className="flex items-stretch bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover w-full overflow-hidden"
          onClick={() => {
            const showWorkbench = workbenchStore.showWorkbench.get();
            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="px-5 p-3.5 w-full text-left">
            <div className="w-full text-bolt-elements-textPrimary font-medium leading-5 text-sm">
              {artifact?.title}
            </div>
            <div className="w-full text-bolt-elements-textSecondary text-xs mt-0.5">
              Click to open Workbench
            </div>
          </div>
        </button>
        <div className="bg-bolt-elements-artifacts-borderColor w-[1px]" />
        <AnimatePresence>
          {actions.length && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover"
              onClick={toggleActions}
            >
              <div className="p-4">
                {showActions ? (
                  <ChevronUp className="text-white h-4 w-4" />
                ) : (
                  <ChevronDown className="text-white h-4 w-4" />
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showActions && actions.length > 0 && (
          <motion.div
            className="actions"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: "0px" }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-bolt-elements-artifacts-borderColor h-[1px]" />
            <div className="p-5 text-left bg-bolt-elements-actions-background">
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Artifact.displayName = "Artifact";

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  useEffect(() => {
    const initializeHighlighter = async () => {
      const highlighter = await getHighlighter();
      if (highlighter) {
        const html = highlighter.codeToHtml(code, {
          lang: "shell",
          theme: "dark-plus",
        });
        setHighlightedCode(html);
      }
    };

    initializeHighlighter();
  }, [code]);

  return (
    <>
      <div
        className={cn("text-xs", classsName)}
        dangerouslySetInnerHTML={{
          __html: highlightedCode,
        }}
      />
    </>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActionList = memo(({ actions }: ActionListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <ul className="list-none space-y-2.5">
        {actions.map((action, index) => {
          const { status, type, content } = action;
          const isLast = index === actions.length - 1;

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.2,
                ease: cubicEasingFn,
              }}
            >
              <div className="flex items-center gap-1.5 text-sm">
                <div className={cn("text-lg")}>
                  {status === "running" ? (
                    <LoaderCircle className="w-4 h-4 text-bolt-elements-loader-progress animate-spin" />
                  ) : status === "pending" ? (
                    <Circle className="w-4 h-4 text-bolt-elements-textTertiary" />
                  ) : status === "complete" ? (
                    <Check className="w-4 h-4 text-bolt-elements-icon-success" />
                  ) : status === "aborted" ? (
                    <X className="w-4 h-4 text-bolt-elements-textSecondary" />
                  ) : status === "failed" ? (
                    <X className="w-4 h-4 text-bolt-elements-icon-error" />
                  ) : null}
                </div>
                {type === "file" ? (
                  <div>
                    Create{" "}
                    <code className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md">
                      {action.filePath}
                    </code>
                  </div>
                ) : type === "shell" ? (
                  <div className="flex items-center w-full min-h-[28px]">
                    <span className="flex-1">Run command</span>
                  </div>
                ) : null}
              </div>
              {type === "shell" && (
                <ShellCodeBlock
                  classsName={cn("mt-1", {
                    "mb-3.5": !isLast,
                  })}
                  code={content}
                />
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});
ActionList.displayName = "ActionList";

/* function getIconColor(status: ActionState["status"]) {
  switch (status) {
    case "pending": {
      return "text-bolt-elements-textTertiary";
    }
    case "running": {
      return "text-bolt-elements-loader-progress";
    }
    case "complete": {
      return "text-bolt-elements-icon-success";
    }
    case "aborted": {
      return "text-bolt-elements-textSecondary";
    }
    case "failed": {
      return "text-bolt-elements-icon-error";
    }
    default: {
      return undefined;
    }
  }
}
 */
