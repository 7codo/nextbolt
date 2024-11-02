import { useStore } from "@nanostores/react";
import { chatStore } from "@/app/(root)/chat/_lib/stores/chat";
import Link from "next/link";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Sidebar } from "lucide-react";

const HeaderActionButtons = dynamic(
  () => import("./HeaderActionButtons").then((mod) => mod.HeaderActionButtons),
  {
    ssr: false,
  }
);

const ChatDescription = dynamic(
  () =>
    import("@/app/(root)/chat/_lib/persistence/ChatDescription").then(
      (mod) => mod.ChatDescription
    ),
  {
    ssr: false,
  }
);

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={cn(
        "flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]",
        {
          "border-transparent": !chat.started,
          "border-bolt-elements-borderColor": chat.started,
        }
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <Sidebar className="w-6 h-6 text-white" />
        <Link
          href="/"
          className="text-2xl font-semibold text-accent flex items-center"
        >
          <span className="i-bolt:logo-text?mask w-[46px] inline-block" />
        </Link>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ChatDescription />
      </span>
      {chat.started && (
        <div className="mr-1">
          <HeaderActionButtons />
        </div>
      )}
    </header>
  );
}
