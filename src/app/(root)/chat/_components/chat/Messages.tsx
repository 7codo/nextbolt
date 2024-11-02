"use client";
import type { Message } from "ai";
import React from "react";

import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface MessagesProps {
  ref?: React.RefCallback<HTMLDivElement>;
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = (props: MessagesProps) => {
  const { id, isStreaming = false, messages = [] } = props;

  return (
    <div id={id} ref={props.ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => {
            const { role, content } = message;
            const isUserMessage = role === "user";
            const isFirst = index === 0;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={index}
                className={cn(
                  "flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)]",
                  {
                    "bg-bolt-elements-messages-background":
                      isUserMessage || !isStreaming || (isStreaming && !isLast),
                    "bg-gradient-to-b from-bolt-elements-messages-background from-30% to-transparent":
                      isStreaming && isLast,
                    "mt-4": !isFirst,
                  }
                )}
              >
                {isUserMessage && (
                  <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="grid grid-col-1 w-full">
                  {isUserMessage ? (
                    <UserMessage content={content} />
                  ) : (
                    <AssistantMessage content={content} />
                  )}
                </div>
              </div>
            );
          })
        : null}
      {isStreaming && (
        <div className="text-center w-full text-bolt-elements-textSecondary i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
      )}
    </div>
  );
};
