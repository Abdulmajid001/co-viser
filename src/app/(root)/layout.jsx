import { getAllChats } from "@/modules/actions/action";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import Header from "@/modules/chat/components/header";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const layout = async ({ children }) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { data: chats } = await getAllChats();

  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <ChatSidebar userEmail={email} chats={chats} />
      </div>
      <main className="flex-1 overflow-scroll">
        <Header userEmail={email} chats={chats} />
        {children}
      </main>
    </div>
  );
};

export default layout;
