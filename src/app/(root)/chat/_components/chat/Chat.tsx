"use client";
import {
  useMessageParser,
  usePromptEnhancer,
  useShortcuts,
  useSnapScroll,
} from "@/app/(root)/chat/_lib/hooks";
import { useChatHistory } from "@/app/(root)/chat/_lib/persistence/useChatHistory";
import { chatStore } from "@/app/(root)/chat/_lib/stores/chat";
import { workbenchStore } from "@/app/(root)/chat/_lib/stores/workbench";
import { fileModificationsToHTML } from "@/app/(root)/chat/_lib/utils/diff";
import { cubicEasingFn } from "@/app/(root)/chat/_lib/utils/easings";
import {
  createScopedLogger,
  renderLogger,
} from "@/app/(root)/chat/_lib/utils/logger";
import { useStore } from "@nanostores/react";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { useAnimate } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { BaseChat } from "./BaseChat";
import { toast } from "sonner";

const logger = createScopedLogger("Chat");
type Props = {
  chatId?: string;
};
export function Chat({ chatId }: Props) {
  renderLogger.trace("Chat");
  const { ready, initialMessages, storeMessageHistory } = useChatHistory({
    chatId,
  });

  if (!ready) {
    return <>Loading...</>;
  }

  return (
    <ChatImpl
      key={chatId || "new"}
      initialMessages={initialMessages}
      storeMessageHistory={storeMessageHistory}
    />
  );
}

interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
}

export const ChatImpl = memo(
  ({ initialMessages, storeMessageHistory }: ChatProps) => {
    useShortcuts();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);

    const { showChat } = useStore(chatStore);
    const [animationScope, animate] = useAnimate();
    const {
      messages,
      isLoading,
      input,
      handleInputChange,
      setInput,
      stop,
      append,
    } = useChat({
      api: "/api/chat",
      onError: (error) => {
        logger.error("Request failed\n\n", error);
        toast.error("There was an error processing your request");
      },
      onFinish: async (message, { usage }) => {
        console.log("🚀 ~ usage:", usage);
      },
      initialMessages,
    });

    const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } =
      usePromptEnhancer();
    const { parsedMessages, parseMessages } = useMessageParser();
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    useEffect(() => {
      setChatStarted(initialMessages.length > 0);
      chatStore.setKey("started", initialMessages.length > 0);
    }, [initialMessages.length]);

    useEffect(() => {
      parseMessages(messages, isLoading);
    }, [messages, isLoading, parseMessages]);

    useEffect(() => {
      if (messages.length > initialMessages.length && !isLoading) {
        storeMessageHistory(messages).catch(() =>
          toast.error("Failed to save message history")
        );
      }
    }, [messages, initialMessages.length, isLoading]);

    const scrollTextArea = () => {
      const textarea = textareaRef.current;
      if (textarea) textarea.scrollTop = textarea.scrollHeight;
    };

    const abort = () => {
      stop();
      chatStore.setKey("aborted", true);
      workbenchStore.abortAllActions();
    };

    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
        textarea.style.overflowY =
          scrollHeight > TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
      }
    }, [input, textareaRef]);

    const runAnimation = async () => {
      if (chatStarted) return;
      await Promise.all([
        animate(
          "#examples",
          { opacity: 0, display: "none" },
          { duration: 0.1 }
        ),
        animate(
          "#intro",
          { opacity: 0, flex: 1 },
          { duration: 0.2, ease: cubicEasingFn }
        ),
      ]);
      chatStore.setKey("started", true);
      setChatStarted(true);
    };

    const sendMessage = async (messageInput?: string) => {
      const _input = messageInput || input;
      if (!_input.length || isLoading) return;
      await workbenchStore.saveAllFiles();

      const fileModifications = workbenchStore.getFileModifcations();
      chatStore.setKey("aborted", false);
      runAnimation();

      if (fileModifications) {
        const diff = fileModificationsToHTML(fileModifications);
        append({ role: "user", content: `${diff}\n\n${_input}` });
        workbenchStore.resetAllFileModifications();
      } else {
        append({ role: "user", content: _input });
      }

      setInput("");
      resetEnhancer();
      textareaRef.current?.blur();
    };

    const [messageRef, scrollRef] = useSnapScroll();

    return (
      <>
        <BaseChat
          ref={animationScope}
          textareaRef={textareaRef}
          input={input}
          showChat={showChat}
          chatStarted={chatStarted}
          isStreaming={isLoading}
          enhancingPrompt={enhancingPrompt}
          promptEnhanced={promptEnhanced}
          sendMessage={sendMessage}
          messageRef={messageRef}
          scrollRef={scrollRef}
          handleInputChange={handleInputChange}
          handleStop={abort}
          messages={messages.map((message, i) =>
            message.role === "user"
              ? message
              : { ...message, content: parsedMessages[i] || "" }
          )}
          enhancePrompt={() => {
            enhancePrompt(input, (newInput) => {
              setInput(newInput);
              scrollTextArea();
            });
          }}
        />
      </>
    );
  }
);
ChatImpl.displayName = "ChatImpl";
