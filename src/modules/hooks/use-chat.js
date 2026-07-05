import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createChatWithMessage,
  deleteChat,
  getChatById,
} from "../actions/action";


export const useCreateChat = () => {
  const queryClient = useQueryClient();

  const router = useRouter();

  return useMutation({
    mutationFn: (values) => createChatWithMessage(values),
    onSuccess: (res) => {
      if (res.success && res.data) {
        // add optimistic ui
        const chat = res.data;

        queryClient.invalidateQueries(["chats"]);

        router.push(`/chat/${chat.id}?autoTrigger=true`);
      }
    },
    onError: (error) => {
      console.error("Create chat error:", error);
      toast.error("Failed to create chat");
    },
  });
};

export const useDeleteChat = (chatId) => {
  const queryClient = useQueryClient();

  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteChat(chatId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["chats"]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// export const useGetChatById = (chatId)=>{
//   return useQuery({
//     queryKey:["chats" , chatId],
//     queryFn:(chatId) => getChatById(chatId)
//   })
// }

export function useGetChatById(chatId) {
  const { data, isPending, error } = useQuery({
    queryKey: ["chats", chatId],
    queryFn: () => getChatById(chatId),
    enabled: !!chatId,
  });

  return { data, isPending, error };
}