import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat } from "@/lib/db/queries/chat-queries";
import { MoreHorizontalIcon, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Props = {
  title: string;
  id: string;
};

const ChatItemsSettings: React.FC<Props> = ({ title, id }) => {
  const handleItemDelete = async () => {
    try {
      await deleteChat(id);
      toast.success(`${title} successfully deleted`);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error(`${title} failed delete`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-xs font-medium">
          {title} settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleItemDelete}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete Chat</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatItemsSettings;
