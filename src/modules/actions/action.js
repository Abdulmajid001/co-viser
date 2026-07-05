"use server";

import { MessageRole, MessageType } from "@/lib/enum";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const createChatWithMessage = async (values) => {
  console.log("createChatWithMessage called with values:", values);
  try {
    const user = await currentUser();

    if (!user)
      return {
        success: false,
        message: "Unauthorized user",
      };

    const { content, model } = values;

    if (!content || !content.trim()) {
      return { success: false, message: "Message content is required" };
    }

    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");

    // Create the chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ title, model, user_id: user.id })
      .select()
      .single();

    if (chatError) throw chatError;

    // Create the message linked to the chat
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chat.id,
        content,
        message_role: MessageRole.USER,
        message_type: MessageType.NORMAL,
        model,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    revalidatePath("/");

    return {
      success: true,
      message: "Chat created successfully",
      data: { ...chat, messages: [message] },
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, message: "Failed to create chat" };
  }
};

export const getAllChats = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized user",
      };
    }

    const { data: chats, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        messages (*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return {
      success: false,
      message: "Failed to fetch chats",
    };
  }
};

export const getChatById = async (chatId) => {
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized user",
    };
  }

  const { data: chat, error } = await supabase
    .from("chats")
    .select(`*, messages (*)`)
    .eq("id", chatId)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error("Error fetching chat");

  return {
    success: true,
    message: "Chat Fetched Successfully",
    data: chat,
  };

  // try {
  //   const chat = await db.chat.findUnique({
  //     where: {
  //       id: chatId,
  //       userId: user.id,
  //     },
  //     include: {
  //       messages: true,
  //     },
  //   });

  //   return {
  //     success: true,
  //     message: "Chat Fetched Successfully",
  //     data: chat,
  //   };
  // } catch (error) {
  //   console.error("Error fetching chat:", error);
  //   return {
  //     success: false,
  //     message: "Failed to fetch chat",
  //   };
  // }
};

export const deleteChat = async (chatId) => {
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized user",
    };
  }

  const { error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", user.id);

  if (error) {
    // console.error(error.message);
    throw new Error("Failed to delete chat, try again !");
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Chat deleted successfully",
  };
};