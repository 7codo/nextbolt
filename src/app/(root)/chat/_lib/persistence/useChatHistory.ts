"use client";
import { getChatById, upsertChat } from "@/lib/db/queries/chat-queries";
import { Message } from "ai";
import { atom } from "nanostores";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { workbenchStore } from "../stores/workbench";
import { chatStore } from "../stores/chat";

interface UseChatHistoryReturn {
  ready: boolean;
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
}

export const description = atom<string | undefined>(undefined);

type Props = {
  chatId?: string;
};

export function useChatHistory({ chatId }: Props): UseChatHistoryReturn {
  console.log("🚀 ~ useChatHistory ~ chatId:", chatId);
  const router = useRouter();
  const [ready, setReady] = useState(!chatId);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const currentChatId = useRef<string | null>(null);
  console.log("initialMessages", initialMessages);

  useEffect(() => {
    if (!chatId) {
      workbenchStore.files.set({});
      chatStore.setKey("started", false);
      description.set(undefined);
      currentChatId.current = null;
      setInitialMessages([]);
      setReady(true);
    }
  }, [chatId]);

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        setReady(true);
        return;
      }

      try {
        const chat = (await getChatById(chatId))?.data;
        if (chat) {
          setInitialMessages(chat.messages as Message[]);
          description.set(chat.title || "");
          currentChatId.current = chat.id;
        } else {
          toast.error(`No chat with ID ${chatId} found`);
          router.push("/chat");
        }
      } catch (error) {
        console.error("Failed to load chat:", error);
        toast.error("Failed to load chat history");
      } finally {
        setReady(true);
      }
    };

    loadChat();
  }, [chatId, router]);

  const storeMessageHistory = async (messages: Message[]) => {
    if (messages.length === 0) return;

    try {
      const { firstArtifact } = workbenchStore;
      const title = firstArtifact?.title || messages[0].content.slice(0, 50);

      if (!currentChatId.current) {
        // Create new chat
        currentChatId.current = crypto.randomUUID();
        await upsertChat({
          id: currentChatId.current,
          title,
          messages,
        });

        // Update URL without full page reload
        window.history.replaceState(null, "", `/chat/${currentChatId.current}`);
      } else {
        // Update existing chat
        await upsertChat({
          id: currentChatId.current,
          title,
          messages,
        });
      }
    } catch (error) {
      console.log("🚀 ~ storeMessageHistory ~ error:", error);
      toast.error("Failed to save chat history");
    }
  };

  return {
    ready,
    initialMessages,
    storeMessageHistory,
  };
}
