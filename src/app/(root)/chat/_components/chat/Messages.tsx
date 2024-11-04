"use client";

import React from "react";
import type { Message } from "ai";
import { User } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface MessagesProps {
  ref?: React.RefCallback<HTMLDivElement>;
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export default function MessagesCard({
  id,
  ref,
  className,
  isStreaming = false,
  messages = [],
}: MessagesProps) {
  return (
    <div id={id} ref={ref} className={cn("space-y-4", className)}>
      {messages.map((message, index) => {
        const { role, content } = message;
        const isUserMessage = role === "user";

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn("overflow-hidden  shadow-none")}>
              <CardContent className="p-4 gap-4 flex items-start flex-row">
                <div className="pt-1 5">
                  {isUserMessage ? (
                    <Avatar className="size-4">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="size-4">
                      <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                {isUserMessage ? (
                  <UserMessage content={content} />
                ) : (
                  <AssistantMessage content={content} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      {isStreaming && (
        <div className="flex justify-center">
          <span className="loading loading-dots loading-md"></span>
        </div>
      )}
    </div>
  );
}
