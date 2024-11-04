import dynamic from "next/dynamic";
import { BaseChat } from "../_components/chat/BaseChat";
import { Header } from "../_components/header/Header";
import { Chat } from "../_components/chat/Chat";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Index({ params }: Props) {
  const chatId = (await params).id;
  console.log("chatId", chatId);
  return (
    <div className="flex flex-col h-full w-full">
      <Chat chatId={chatId} />
    </div>
  );
}
