import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import ChatMessageView from "@/modules/chat/components/chat-message-view";


export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 overflow-y-scroll">
      <ChatMessageView firstName={user.firstName} />
    </div>
  );
}
