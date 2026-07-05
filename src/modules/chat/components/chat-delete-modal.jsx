"use client";
import Modal from "@/components/ui/modal";
import React from "react";
import { toast } from "sonner";
import { useDeleteChat } from "../../hooks/use-chat";

const DeleteChatModal = ({ isModalOpen, setIsModalOpen, chatId }) => {
  const { mutateAsync, isPending } = useDeleteChat(chatId);

  const handleDelete = async () => {
    await mutateAsync();
    setIsModalOpen(false);
    // try {
    //   await mutateAsync();
    //   setIsModalOpen(false);
    //   toast.success("Chat Deleted Successfully");
    // } catch (error) {
    //   toast.error("Failed to delete chat");
    //   console.error("Failed to delete chat:", error);
    // }
  };

  return (
    <Modal
      title="Delete Chat"
      description="Are you sure you want to delete this Chat? This action cannot be undone."
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Once deleted, all requests and data in this Chat will be permanently
        removed.
      </p>
    </Modal>
  );
};

export default DeleteChatModal;