"use client";
import type { Message } from "ai";
import React, { type RefCallback } from "react";
import { cn } from "@/lib/utils";
import styles from "./BaseChat.module.css";
import { IconButton } from "../ui/IconButton";
import dynamic from "next/dynamic";
import { CornerDownLeft } from "lucide-react";

const SendButton = dynamic(
  () => import("./SendButton").then((mod) => mod.SendButton),
  {
    ssr: false,
  }
);

const Workbench = dynamic(
  () =>
    import("@/app/(root)/chat/_components/workbench/Workbench").then(
      (mod) => mod.Workbench
    ),
  {
    ssr: false,
  }
);
const Menu = dynamic(
  () =>
    import("@/app/(root)/chat/_components/sidebar/Menu").then(
      (mod) => mod.Menu
    ),
  {
    ssr: false,
  }
);

const Messages = dynamic(
  () => import("./Messages").then((mod) => mod.Messages),
  {
    ssr: false,
  }
);

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
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
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

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = ({
  textareaRef,
  messageRef,
  scrollRef,
  showChat = true,
  chatStarted = false,
  isStreaming = false,
  enhancingPrompt = false,
  promptEnhanced = false,
  messages,
  input = "",
  sendMessage,
  handleInputChange,
  enhancePrompt,
  handleStop,
  ref,
}: BaseChatProps) => {
  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  return (
    <div
      ref={ref}
      className={cn(
        styles.BaseChat,
        "relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1"
      )}
      data-chat-visible={showChat}
    >
      <Menu />
      <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
        <div
          className={cn(
            styles.Chat,
            "flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full"
          )}
        >
          {!chatStarted && (
            <div id="intro" className="mt-[26vh] max-w-chat mx-auto">
              <h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">
                Where ideas begin
              </h1>
              <p className="mb-4 text-center text-bolt-elements-textSecondary">
                Bring ideas to life in seconds or get help on existing projects.
              </p>
            </div>
          )}
          <div
            className={cn("pt-6 px-6", {
              "h-full flex flex-col": chatStarted,
            })}
          >
            {chatStarted ? (
              <Messages
                ref={messageRef}
                className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                messages={messages}
                isStreaming={isStreaming}
              />
            ) : (
              <></>
            )}
            <div
              className={cn("relative w-full max-w-chat mx-auto z-prompt", {
                "sticky bottom-0": chatStarted,
              })}
            >
              <div
                className={cn(
                  "shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden"
                )}
              >
                <textarea
                  ref={textareaRef}
                  className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (event.shiftKey) {
                        return;
                      }

                      event.preventDefault();

                      sendMessage?.(event);
                    }
                  }}
                  value={input}
                  onChange={(event) => {
                    handleInputChange?.(event);
                  }}
                  style={{
                    minHeight: TEXTAREA_MIN_HEIGHT,
                    maxHeight: TEXTAREA_MAX_HEIGHT,
                  }}
                  placeholder="How can Bolt help you today?"
                  translate="no"
                />

                <SendButton
                  show={input.length > 0 || isStreaming}
                  isStreaming={isStreaming}
                  onClick={(event) => {
                    if (isStreaming) {
                      handleStop?.();
                      return;
                    }

                    sendMessage?.(event);
                  }}
                />

                <div className="flex justify-between text-sm p-4 pt-2">
                  <div className="flex gap-1 items-center">
                    <IconButton
                      title="Enhance prompt"
                      disabled={input.length === 0 || enhancingPrompt}
                      className={cn({
                        "opacity-100!": enhancingPrompt,
                        "text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!":
                          promptEnhanced,
                      })}
                      onClick={() => enhancePrompt?.()}
                    >
                      {enhancingPrompt ? (
                        <>
                          <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                          <div className="ml-1.5">Enhancing prompt...</div>
                        </>
                      ) : (
                        <>
                          <div className="i-bolt:stars text-xl"></div>
                          {promptEnhanced && (
                            <div className="ml-1.5">Prompt enhanced</div>
                          )}
                        </>
                      )}
                    </IconButton>
                  </div>
                  {input.length > 3 ? (
                    <div className="text-xs text-bolt-elements-textTertiary">
                      Use <kbd className="kdb">Shift</kbd> +{" "}
                      <kbd className="kdb">Return</kbd> for a new line
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="bg-bolt-elements-background-depth-1 pb-6">
                {/* Ghost Element */}
              </div>
            </div>
          </div>
          {!chatStarted && (
            <div
              id="examples"
              className="relative w-full max-w-xl mx-auto mt-8 flex justify-center"
            >
              <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                  return (
                    <button
                      key={index}
                      onClick={(event) => {
                        sendMessage?.(event, examplePrompt.text);
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
        <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
      </div>
    </div>
  );
};
