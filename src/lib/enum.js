// Note : Object.freeze make the function immutable

export const MessageRole = Object.freeze({
  USER: "USER",
  ASSISTANT: "ASSISTANT",
});

export const MessageType = Object.freeze({
  NORMAL: "NORMAL",
  ERROR: "ERROR",
  TOOL_CALL: "TOOL_CALL",
});