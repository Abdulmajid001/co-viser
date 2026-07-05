import { MessageRole, MessageType } from "@/lib/enum";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { supabase } from "@/lib/supabase";
import { saveMessageToSupabase } from "@/modules/messages/actions/actions";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText } from "ai";

// Initialize openRouter provider
const provider = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

function convertStoredMessageToUI(msg) {
  return {
    id: msg.id,
    role: msg.message_role.toLowerCase(),
    parts: [
      {
        type: "text",
        text: msg.content,
      },
    ],
    created_at: msg.created_at,
  };
}

function extractTextContent(message) {
  if (!message) return "";

  if (typeof message.content === "string" && message.content.trim()) {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part?.type === "text")
      .map((part) => part.text ?? "")
      .join("");
  }

  return "";
}

export async function POST(req) {
  try {
    const {
      chatId,
      messages: newMessages,
      model,
      skipUserMessage,
    } = await req.json();

    if (!chatId) {
      return new Response(JSON.stringify({ error: "chatId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── 1. Save the user's message to Supabase (unless caller says to skip) ──
    if (!skipUserMessage) {
      const normalizedForSave = Array.isArray(newMessages)
        ? newMessages
        : [newMessages];

      const latestUserMessage = normalizedForSave[normalizedForSave.length - 1];

      if (latestUserMessage?.role === "user") {
        const userText = extractTextContent(latestUserMessage);

        await saveMessageToSupabase({
          chatId,
          role: MessageRole.USER,
          content: userText,
        });
      }
    }

    // ── 2. Load full conversation history from Supabase ──
    const { data: previousMessages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const uiMessages = previousMessages
      .map(convertStoredMessageToUI)
      .filter((msg) => msg !== null);

    // ── 3. Build the full message array for the model ──
    // previousMessages already includes the newly saved user message, so we
    // only append newMessages if skipUserMessage was true (edge case).
    const allUIMessages = skipUserMessage
      ? [
          ...uiMessages,
          ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
        ]
      : uiMessages;

    let modelMessages;

    try {
      // convertToModelMessages is async in v6/v7 — must be awaited
      modelMessages = await convertToModelMessages(allUIMessages);
    } catch {
      // Fallback: plain text conversion
      modelMessages = allUIMessages
        .map((msg) => ({
          role: msg.role,
          content: msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("\n"),
        }))
        .filter((m) => m.content);
    }

    // ── 4. Stream the AI response ──
    const result = streamText({
      model: provider.chat(model),
      messages: modelMessages,
      system: CHAT_SYSTEM_PROMPT,
    });

    // In v6/v7 toUIMessageStreamResponse() is a method on the result object,
    // not a standalone `toUIMessageStream` + `createUIMessageStreamResponse` pair.
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: allUIMessages,
      onFinish: async ({ responseMessage }) => {
        try {
          const assistantText = extractTextContent(responseMessage);

          if (!assistantText.trim()) {
            return;
          }

          await saveMessageToSupabase({
            chatId,
            role: MessageRole.ASSISTANT,
            content: assistantText,
          });
        } catch (saveError) {
          console.error("❌ Error saving assistant message:", saveError);
        }
      },
    });
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// /////////------FOR VERSION 7 OF AI-SDK PROVIDER------////////////
///////////////////////////////

// import { MessageRole, MessageType } from "@/lib/enum";
// import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
// import { supabase } from "@/lib/supabase";
// import { saveMessageToSupabase } from "@/modules/messages/actions/actions";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import {
//   convertToModelMessages,
//   createUIMessageStreamResponse,
//   streamText,
//   toUIMessageStream,
// } from "ai";

// // Initialize openRouter provider
// const provider = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

// function convertStoredMessageToUI(msg) {
//   return {
//     id: msg.id,
//     role: msg.message_role.toLowerCase(),
//     parts: [
//       {
//         type: "text",
//         text: msg.content,
//       },
//     ],
//     created_at: msg.created_at,
//   };
// }

// function extractTextContent(message) {
//   if (!message) return "";

//   if (typeof message.content === "string" && message.content.trim()) {
//     return message.content;
//   }

//   if (Array.isArray(message.parts)) {
//     return message.parts
//       .filter((part) => part?.type === "text")
//       .map((part) => part.text ?? "")
//       .join("");
//   }

//   return "";
// }

// export async function POST(req) {
//   try {
//     const {
//       chatId,
//       messages: newMessages,
//       model,
//       skipUserMessage,
//     } = await req.json();

//     if (!chatId) {
//       return new Response(
//         JSON.stringify({ error: "chatId is required" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // ── 1. Save the user's message to Supabase (unless caller says to skip) ──
//     if (!skipUserMessage) {
//       const normalizedForSave = Array.isArray(newMessages)
//         ? newMessages
//         : [newMessages];

//       const latestUserMessage =
//         normalizedForSave[normalizedForSave.length - 1];

//       if (latestUserMessage?.role === "user") {
//         const userText = extractTextContent(latestUserMessage);

//         await saveMessageToSupabase({
//           chatId,
//           role: MessageRole.USER,
//           content: userText,
//         });
//       }
//     }

//     // ── 2. Load full conversation history from Supabase ──
//     const { data: previousMessages, error } = await supabase
//       .from("messages")
//       .select("*")
//       .eq("chat_id", chatId)
//       .order("created_at", { ascending: true });

//     if (error) {
//       throw new Error(error.message);
//     }

//     const uiMessages = previousMessages
//       .map(convertStoredMessageToUI)
//       .filter((msg) => msg !== null);

//     // ── 3. Build the full message array for the model ──
//     // previousMessages already includes the newly saved user message, so we
//     // only append newMessages if skipUserMessage was true (edge case).
//     const allUIMessages = skipUserMessage
//       ? [...uiMessages, ...(Array.isArray(newMessages) ? newMessages : [newMessages])]
//       : uiMessages;

//     let modelMessages;

//     try {
//       modelMessages = await convertToModelMessages(allUIMessages);
//     } catch {
//       // Fallback: plain text conversion
//       modelMessages = allUIMessages
//         .map((msg) => ({
//           role: msg.role,
//           content: msg.parts
//             .filter((p) => p.type === "text")
//             .map((p) => p.text)
//             .join("\n"),
//         }))
//         .filter((m) => m.content);
//     }

//     // ── 4. Stream the AI response ──
//     const result = streamText({
//       model: provider.chat(model),
//       messages: modelMessages,
//       system: CHAT_SYSTEM_PROMPT,
//     });

//     return createUIMessageStreamResponse({
//       stream: toUIMessageStream({
//         stream: result.stream,
//         sendReasoning: true,
//         onEnd: async ({ responseMessage }) => {
//           try {
//             const assistantText = extractTextContent(responseMessage);

//             if (!assistantText.trim()) {
//               return;
//             }

//             await saveMessageToSupabase({
//               chatId,
//               role: MessageRole.ASSISTANT,
//               content: assistantText,
//             });
//           } catch (saveError) {
//             console.error("❌ Error saving assistant message:", saveError);
//           }
//         },
//       }),
//     });
//   } catch (error) {
//     console.error("❌ API Route Error:", error);
//     return new Response(
//       JSON.stringify({
//         error: error.message || "Internal server error",
//         details: error.toString(),
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }
