"use server";

import { MessageType } from "@/lib/enum";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";

export const getMessagesBychatid = async (chatId) => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized user",
      };
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: "Chats fetched successfully",
      data: messages,
    };
    
  } catch (error) {
    console.error("Error fetching chats:", error);
    return {
      success: false,
      message: "Failed to fetch chats",
    };
  }
};

export async function saveMessageToSupabase({ chatId, role, content }) {
  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    message_role: role,
    content,
    created_at: new Date().toISOString(),
    message_type: MessageType.NORMAL,
  });

  if (error) {
    throw new Error(`Failed to save ${role.toLowerCase()} message: ${error.message}`);
  }
}