import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
// import ChatMessageView from "@/modules/chat/components/chat-message-view";

export default async function Home() {
  const user = await currentUser();

  return (
    <div>
      {/* <ChatMessageView firstName={user.firstName} /> */}
      <h1>main content</h1>
    </div>
  );
}
