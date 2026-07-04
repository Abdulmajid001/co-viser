// import { getAllChats } from "@/modules/chat/actions/action";
// import { redirect } from "next/navigation";

import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import Header from "@/modules/chat/components/header";
import { currentUser } from "@clerk/nextjs/server";

const layout = async ({ children }) => {
  const user = await currentUser();


  // const { data: chats } = await getAllChats();

  const email = user.primaryEmailAddress?.emailAddress;

  // if (!user) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar userEmail={email} />
      <main className="flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
};

export default layout;
