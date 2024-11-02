"use client";
import dynamic from "next/dynamic";
import { BaseChat } from "../_components/chat/BaseChat";
import { Header } from "../_components/header/Header";

const Chat = dynamic(
  () => import("../_components/chat/Chat").then((mod) => mod.Chat),
  {
    ssr: false,
    loading: () => <BaseChat />,
  }
);

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <Chat />
    </div>
  );
}
