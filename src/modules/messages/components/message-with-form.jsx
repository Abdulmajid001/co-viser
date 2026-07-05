"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Spinner } from "@/components/ui/spinner";
import { ModelSelector } from "@/modules/chat/components/model-selector";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, RotateCcwIcon, StopCircleIcon } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAIModels } from "@/modules/hooks/use-ai-agent";
import { useGetChatById } from "@/modules/hooks/use-chat";
import { useChatStore } from "@/modules/store/chat-store";
import MessageSkeleton from "./message-skeleton";


// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessageWithForm({ chatId }) {
  const { data: models, isPending: isModelLoading } = useAIModels();
  const { data, isPending } = useGetChatById(chatId);
  const [selectedModel, setSelectedModel] = useState(null);
  const [input, setInput] = useState("");

  const { hasChatBeenTriggered, markChatAsTriggered } = useChatStore();
  const hasAutoTriggered = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldAutoTrigger = searchParams.get("autoTrigger") === "true";

  // ── Build initialMessages from Supabase data ────────────────────────────────
  const initialMessages = useMemo(() => {
    if (!data?.data?.messages) return [];

    return data.data.messages
      .filter((msg) => msg.content && msg.content.trim() !== "" && msg.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((msg) => {
        try {
          const parts = JSON.parse(msg.content);
          return {
            id: msg.id,
            role: msg.message_role.toLowerCase(),
            parts: Array.isArray(parts)
              ? parts
              : [{ type: "text", text: msg.content }],
            createdAt: msg.created_at,
          };
        } catch {
          return {
            id: msg.id,
            role: msg.message_role.toLowerCase(),
            parts: [{ type: "text", text: msg.content }],
            createdAt: msg.created_at,
          };
        }
      });
  }, [data]);

  // ── useChat — seeded with DB history on mount ───────────────────────────────
  const { messages, status, sendMessage, stop, regenerate, setMessages } =
    useChat({
      initialMessages,
      api: "/api/chat",
    });

  // Re-seed useChat if initialMessages arrives after mount (async fetch)
  const hasSeeded = useRef(false);
  useEffect(() => {
    if (hasSeeded.current) return;
    if (initialMessages.length === 0) return;

    hasSeeded.current = true;
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  // ── Sync selected model from DB ─────────────────────────────────────────────
  useEffect(() => {
    if (data?.data?.model && !selectedModel) {
      setSelectedModel(data.data.model);
    }
  }, [data, selectedModel]);

  // ── Auto-trigger: fire AI on first load for brand-new chats ────────────────
  useEffect(() => {
    if (hasAutoTriggered.current) return;
    if (!shouldAutoTrigger) return;
    if (hasChatBeenTriggered(chatId)) return;
    if (!selectedModel) return;
    if (initialMessages.length === 0) return;

    const lastMessage = initialMessages[initialMessages.length - 1];
    if (lastMessage.role !== "user") return;

    hasAutoTriggered.current = true;
    markChatAsTriggered(chatId);

    sendMessage(
      { text: null },
      {
        body: {
          model: selectedModel,
          chatId,
          skipUserMessage: true,
        },
      },
    );

    router.replace(`/chat/${chatId}`, { scroll: false });
  }, [
    shouldAutoTrigger,
    chatId,
    selectedModel,
    initialMessages,
    markChatAsTriggered,
    hasChatBeenTriggered,
    sendMessage,
    router,
  ]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";

  // Merge local messages — initialMessages are already in useChat state after
  // seeding, so we just render `messages` directly (no duplication).
  const messageToRender = messages;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!input.trim() || isStreaming || isSubmitting) return;

    sendMessage(
      { text: input },
      {
        body: {
          model: selectedModel,
          chatId,
        },
      },
    );

    setInput("");
  }, [input, isStreaming, isSubmitting, sendMessage, selectedModel, chatId]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    regenerate();
  }, [regenerate]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }, []);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <MessageSkeleton />
          </div>
          {/* Keep the input visible but disabled while loading */}
          <PromptInput onSubmit={() => {}} className="mt-4">
            <PromptInputBody>
              <PromptInputTextarea
                disabled
                placeholder="Loading conversation..."
              />
            </PromptInputBody>
            <PromptInputFooter>
              <Spinner />
              <PromptInputSubmit disabled className="ml-auto" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messageToRender.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Start a conversation…
              </div>
            ) : (
              messageToRender.map((message, msgIndex) => {
                const isLastMessage = msgIndex === messageToRender.length - 1;
                const isAssistant = message.role === "assistant";
                const isCurrentlyStreaming =
                  isLastMessage && isAssistant && isStreaming;

                return (
                  <Fragment key={message.id}>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "reasoning":
                          return (
                            <Reasoning
                              className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
                              key={`${message.id}-reasoning-${i}`}
                              isStreaming={isCurrentlyStreaming}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
                                {part.text}
                              </ReasoningContent>
                            </Reasoning>
                          );

                        case "text":
                          return (
                            <Fragment key={`${message.id}-text-${i}`}>
                              <Message
                                from={message.role}
                                // key={`${message.id}-text-${i}`}
                              >
                                {/* All messages displayed */}
                                <MessageContent>
                                  <MessageResponse>{part.text}</MessageResponse>
                                </MessageContent>
                              </Message>
                              {/* Action toolbar — only show on assistant messages */}
                              {isAssistant && !isCurrentlyStreaming && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() => handleCopy(part.text)}
                                  >
                                    <CopyIcon size={14} />
                                  </MessageAction>
                                  {isLastMessage && (
                                    <MessageAction onClick={handleRetry}>
                                      <RotateCcwIcon size={14} />
                                    </MessageAction>
                                  )}
                                </MessageActions>
                              )}
                            </Fragment>
                          );

                        default:
                          return null;
                      }
                    })}

                    {/* Streaming indicator — shown below the last assistant message */}
                    {isCurrentlyStreaming && message.parts.length === 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground py-2">
                        <Spinner />
                        <span className="text-sm">Thinking…</span>
                      </div>
                    )}
                  </Fragment>
                );
              })
            )}

            {/* Global submitted / pre-stream indicator */}
            {isSubmitting && (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Spinner />
                <span className="text-sm">AI is thinking…</span>
              </div>
            )}
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>

        {/* ── Prompt Input ───────────────────────────────────────────── */}
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              disabled={isStreaming || isSubmitting}
            />
          </PromptInputBody>

          <PromptInputFooter>
            {isModelLoading ? (
              <Spinner />
            ) : (
              <ModelSelector
                models={models?.models}
                selectedModelId={selectedModel}
                onModelSelect={setSelectedModel}
              />
            )}

            {isStreaming ? (
              <PromptInputButton className="ml-auto" onClick={handleStop}>
                <StopCircleIcon size={16} />
                <span>Stop</span>
              </PromptInputButton>
            ) : (
              <PromptInputSubmit className="ml-auto" />
            )}
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
