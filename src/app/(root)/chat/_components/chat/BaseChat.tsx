"use client";
import { VanishTextArea } from "@/components/vanish-textarea";
import { chatTextareaPlaceholders } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Message } from "ai";
import { CornerDownLeft } from "lucide-react";
import dynamic from "next/dynamic";
import React, { Suspense, type RefCallback } from "react";
import styles from "./BaseChat.module.css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@nanostores/react";
import { workbenchStore } from "../../_lib/stores/workbench";

const Workbench = dynamic(
  () =>
    import("@/app/(root)/chat/_components/workbench/Workbench").then(
      (mod) => mod.Workbench
    ),
  {
    ssr: false,
  }
);

const Messages = dynamic(
  () => import("./Messages").then((mod) => mod.default),
  {
    ssr: false,
  }
);

const leftPanelAnimation = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
  transition: { duration: 0.3, ease: "easeInOut" },
};

const rightPanelAnimation = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "100%" },
  transition: { duration: 0.3, ease: "easeInOut" },
};

// Only use horizontal slide animation when chat has started
const chatStartedAnimation = {
  initial: { opacity: 0, x: "-100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "-100%" },
  transition: { duration: 0.3, ease: "easeInOut" },
};

interface BaseChatProps {
  ref?: React.Ref<HTMLDivElement>;
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: React.RefCallback<HTMLDivElement>;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

const EXAMPLE_PROMPTS = [
  { text: "Build a todo app in React using Tailwind" },
  { text: "Build a simple blog using Astro" },
  { text: "Create a cookie consent form using Material UI" },
  { text: "Make a space invaders game" },
  { text: "How do I center a div?" },
];

// Add these constants at the top level, after imports
const DEFAULT_CHAT_PANEL_SIZE = 50; // 50% of the total width
const DEFAULT_WORKBENCH_PANEL_SIZE = 50; // 50% of the total width
const MIN_CHAT_PANEL_SIZE = 30; // 30% minimum width
const MIN_WORKBENCH_PANEL_SIZE = 30; // 30% minimum width

export const BaseChat = ({
  textareaRef,
  messageRef,
  scrollRef,
  showChat = true,
  chatStarted = false,
  isStreaming = false,
  messages,
  input = "",
  sendMessage,
  handleInputChange,
  handleStop,
  ref,
}: BaseChatProps) => {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  return (
    <div
      ref={ref}
      className={cn(
        styles.BaseChat,
        "flex h-full w-full overflow-hidden gap-4 max-w-screen"
      )}
      data-chat-visible={showChat}
    >
      <ResizablePanelGroup direction="horizontal">
        <AnimatePresence>
          {showChat && (
            <motion.div
              {...(chatStarted ? chatStartedAnimation : leftPanelAnimation)}
              className="w-full h-full"
            >
              <ResizablePanel
                defaultSize={DEFAULT_CHAT_PANEL_SIZE}
                minSize={MIN_CHAT_PANEL_SIZE}
                className="h-full max-w-2xl mx-auto py-3"
              >
                <div
                  ref={scrollRef}
                  className="flex overflow-y-auto w-full h-full"
                >
                  <div
                    className={cn(
                      styles.Chat,
                      "flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full"
                    )}
                  >
                    {!chatStarted && (
                      <div id="intro" className="mt-[26vh] max-w-chat mx-auto">
                        <h1 className="text-5xl text-center font-bold mb-2">
                          Where ideas begin
                        </h1>
                        <p className="mb-4 text-center">
                          Bring ideas to life in seconds or get help on existing
                          projects.
                        </p>
                      </div>
                    )}
                    <div
                      className={cn("", {
                        "h-full flex flex-col": chatStarted,
                      })}
                    >
                      {chatStarted ? (
                        <Suspense fallback={<>loading</>}>
                          <Messages
                            ref={messageRef}
                            className="flex flex-col w-full flex-1  px-4 pb-6 mx-auto z-1"
                            messages={messages}
                            isStreaming={isStreaming}
                          />
                        </Suspense>
                      ) : (
                        <></>
                      )}
                      <div
                        className={cn("relative w-full  mx-auto z-prompt", {
                          "sticky bottom-0": chatStarted,
                        })}
                      >
                        <div className={cn("")}>
                          <VanishTextArea
                            textRef={textareaRef}
                            onChange={(event) => {
                              handleInputChange?.(event);
                            }}
                            chatStarted={chatStarted}
                            placeholders={chatTextareaPlaceholders}
                            isStreaming={isStreaming}
                            onSubmit={() => {
                              if (isStreaming) {
                                handleStop?.();
                                return;
                              }
                              sendMessage?.(input);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      {!chatStarted && (
                        <div
                          id="examples"
                          className="w-full max-w-xl mx-auto mt-8 flex justify-center"
                        >
                          <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                            {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    sendMessage?.(examplePrompt.text);
                                  }}
                                  className="group flex items-center w-full gap-2 justify-center bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-theme"
                                >
                                  {examplePrompt.text}
                                  <CornerDownLeft className="w-4 h-4 text-white" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </motion.div>
          )}
        </AnimatePresence>
        {showWorkbench && <ResizableHandle />}
        <AnimatePresence>
          {showWorkbench && (
            <motion.div {...rightPanelAnimation} className="w-full h-full">
              <ResizablePanel
                defaultSize={DEFAULT_WORKBENCH_PANEL_SIZE}
                minSize={MIN_WORKBENCH_PANEL_SIZE}
                className="h-full"
              >
                <Workbench
                  chatStarted={chatStarted}
                  isStreaming={isStreaming}
                />
              </ResizablePanel>
            </motion.div>
          )}
        </AnimatePresence>
      </ResizablePanelGroup>
    </div>
  );
};
