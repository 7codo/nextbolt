"use client";
import { motion, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  chatId,
  db,
  deleteById,
  getAll,
  type ChatHistoryItem,
} from "@/app/(root)/chat/_lib/persistence";
import { cubicEasingFn } from "@/app/(root)/chat/_lib/utils/easings";
import { logger } from "@/app/(root)/chat/_lib/utils/logger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { HistoryItem } from "./HistoryItem";
import { binDates } from "./date-binning";
import { toast } from "sonner";

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: "hidden",
    left: "-150px",
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: "initial",
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: "delete"; item: ChatHistoryItem } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback(
    (event: React.UIEvent, item: ChatHistoryItem) => {
      event.preventDefault();

      if (db) {
        deleteById(db, item.id)
          .then(() => {
            loadEntries();

            if (chatId.get() === item.id) {
              // hard page navigation to clear the stores
              window.location.pathname = "/";
            }
          })
          .catch((error) => {
            toast.error("Failed to delete conversation");
            logger.error(error);
          });
      }
    },
    []
  );

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      if (
        menuRef.current &&
        event.clientX >
          menuRef.current.getBoundingClientRect().right + exitThreshold
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={open ? "open" : "closed"}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
    >
      <div className="flex items-center h-[var(--header-height)]">
        {/* Placeholder */}
      </div>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <Link
            href="/"
            className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
          >
            <span className="inline-block i-bolt:chat scale-110" />
            Start new chat
          </Link>
        </div>
        <div className="text-bolt-elements-textPrimary font-medium pl-6 pr-5 my-2">
          Your Chats
        </div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {list.length === 0 && (
            <div className="pl-2 text-bolt-elements-textTertiary">
              No previous conversations
            </div>
          )}
          <Dialog open={dialogContent !== null} onOpenChange={closeDialog}>
            {binDates(list).map(({ category, items }) => (
              <div key={category} className="mt-4 first:mt-0 space-y-1">
                <div className="text-bolt-elements-textTertiary sticky top-0 z-1 bg-bolt-elements-background-depth-2 pl-2 pt-2 pb-1">
                  {category}
                </div>
                {items.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onDelete={() => setDialogContent({ type: "delete", item })}
                  />
                ))}
              </div>
            ))}
            <DialogContent>
              <DialogHeader>
                {dialogContent?.type === "delete" && (
                  <>
                    <DialogTitle>Delete Chat?</DialogTitle>
                    <DialogDescription>
                      You are about to delete{" "}
                      <strong>{dialogContent.item.description}</strong>. Are you
                      sure you want to delete this chat?
                    </DialogDescription>
                  </>
                )}
              </DialogHeader>
              <DialogFooter className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                <DialogClose>Cancel</DialogClose>
                <Button
                  onClick={(event) => {
                    if (dialogContent) {
                      deleteItem(event, dialogContent.item);
                      closeDialog();
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center border-t border-bolt-elements-borderColor p-4">
          <Switch />
        </div>
      </div>
    </motion.div>
  );
}