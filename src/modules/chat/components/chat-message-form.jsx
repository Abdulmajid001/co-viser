"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ModelSelector } from "./model-selector";
import { useAIModels } from "@/modules/hooks/use-ai-agent";
import { useCreateChat } from "@/modules/hooks/use-chat";
import { toast } from "sonner";
// import { toast } from "sonner";
// import { createChatWithMessage } from "../actions/action";

const ChatMessageForm = ({ initialMessage, onMessageChange, firstName }) => {
  const [selectedModel, setSelectedModel] = useState("");
  const [message, setMessage] = useState("");

  const { mutateAsync, isPending: isChatPending } = useCreateChat();
  const { data: models, isPending: isModelsPending } = useAIModels();

  // Set the first available AI model as the default once the models have finished loading
  useEffect(() => {
    if (models?.models?.length > 0) {
      setSelectedModel(models?.models[0].id);
    }
  }, [models]);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      onMessageChange?.("");
    }
  }, [initialMessage, onMessageChange]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      await mutateAsync({ content: message, model: selectedModel });
      // toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      // toast.error("Failed to send message");
    } finally {
      setMessage("");
    }
  };

  return (
    <div className="w-full mx-auto px-4 pb-2">
      <h1 className="text-4xl font-semibold pb-8 text-center">
        How can i help you , {firstName}
      </h1>
      <form onSubmit={handleSubmit}>
        <div
          className="relative rounded-2xl border-border shadow-sm transition-all bg-primary/5
            "
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can I help you today?"
            className="min-h-22.5 max-h-75 resize-none border-0 px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <div className="flex items-center justify-between gap-2 px-3 py-2">
            {/* Model Selector */}
            <div className="flex items-center gap-1">
              {isModelsPending ? (
                <>
                  <Spinner />
                </>
              ) : (
                <>
                  <ModelSelector
                    models={models?.models}
                    selectedModelId={selectedModel}
                    onModelSelect={setSelectedModel}
                    className="ml-1"
                  />
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isChatPending}
              size="sm"
              variant={message.trim() ? "default" : "ghost"}
              className="h-8 w-8 p-0 rounded-full"
            >
              {isChatPending ? (
                <>
                  <Spinner />
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatMessageForm;
