import { chatStore } from "@/app/(root)/chat/_lib/stores/chat";
import { workbenchStore } from "@/app/(root)/chat/_lib/stores/workbench";
import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import { Code } from "lucide-react";

export function HeaderActionButtons() {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);

  const canHideChat = showWorkbench || !showChat;

  return (
    <div className="flex">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat}
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey("showChat", !showChat);
            }
          }}
        >
          <div className="i-bolt:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey("showChat", true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <Code className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
  onClick?: VoidFunction;
}

function Button({
  active = false,
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn("flex items-center p-1.5", {
        "bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary":
          !active,
        "bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent":
          active && !disabled,
        "bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed":
          disabled,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
