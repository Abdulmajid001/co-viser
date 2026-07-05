import { currentUser } from "@clerk/nextjs/server";
import ChatMessageView from "@/modules/chat/components/chat-message-view";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ChatMessageView firstName={user?.firstName} />
    </div>
  );
}
