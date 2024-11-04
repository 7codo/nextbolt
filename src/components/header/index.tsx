"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatDescription } from "@/app/(root)/chat/_lib/persistence/ChatDescription";
import { useStore } from "@nanostores/react";
import { chatStore } from "@/app/(root)/chat/_lib/stores/chat";
import { workbenchStore } from "@/app/(root)/chat/_lib/stores/workbench";
import { cn } from "@/lib/utils";

const Header = () => {
  const chat = useStore(chatStore);
  const showWorkbench = useStore(workbenchStore.showWorkbench);

  const canHideChat = showWorkbench || !chat.showChat;

  return (
    <header className="sticky top-0 flex shrink-0 items-center border-b bg-background p-4">
      <div className="flex gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Library</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <ChatDescription />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {chat.started && (
        <div className="mr-1">
          <div className="flex items-center space-x-2">
            <div className="flex border rounded-md overflow-hidden">
              <button
                className={cn(
                  "flex items-center p-1.5",
                  chat.showChat
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted",
                  !canHideChat && "cursor-not-allowed opacity-50"
                )}
                disabled={!canHideChat}
                onClick={() => {
                  if (canHideChat) {
                    chatStore.setKey("showChat", !chat.showChat);
                  }
                }}
              >
                Chat
              </button>
              <div className="w-[1px] bg-border" />
              <button
                className={cn(
                  "flex items-center p-1.5",
                  showWorkbench
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
                onClick={() => {
                  if (showWorkbench && !chat.showChat) {
                    chatStore.setKey("showChat", true);
                  }
                  workbenchStore.showWorkbench.set(!showWorkbench);
                }}
              >
                Workbench
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
