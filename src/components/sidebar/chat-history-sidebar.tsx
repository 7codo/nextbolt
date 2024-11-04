import { logger } from "@/app/(root)/chat/_lib/utils/logger";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAllChats } from "@/lib/db/queries/chat-queries";
import { Chat } from "@/lib/db/schemas";
import { cn, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ChatItemSettings from "./chat-item-settings";

export function ChatHistorySidebar() {
  const [list, setList] = useState<Chat[]>([]);
  const { open } = useSidebar();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await getAllChats();
        const lists = response?.data ?? [];
        setList(lists);
      } catch (error) {
        logger.error(error);
      }
    };
    loadEntries();
  }, []);

  return (
    <Sidebar
      collapsible="none"
      className={cn(open ? "flex" : "hidden", `flex-1`)}
    >
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">
            Recent Chats
          </div>
          <Button size="sm" asChild>
            <Link href="/chat" prefetch={false}>
              <Plus size={14} />
              New Chat
            </Link>
          </Button>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {list.map((item) => (
              <a
                href={`/chat/${item.id}`}
                key={item.id}
                className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-2 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className="flex w-full items-center gap-2 justify-between">
                  <div className="space-y-1.5">
                    <p>{item.title}</p>
                    <p className="text-xs">
                      {item.createdAt ? formatDate(item.createdAt) : ""}
                    </p>
                  </div>
                  <ChatItemSettings title={item.title ?? ""} id={item.id} />
                </div>
              </a>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
