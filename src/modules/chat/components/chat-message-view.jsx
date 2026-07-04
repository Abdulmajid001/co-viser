"use client";

import React , {useState} from "react";
import ChatWelcomeTabs from "./chat-welcome-tabs";
import ChatMessageForm from "./chat-message-form";

const ChatMessageView = ({ firstName }) => {
  const [selectedMessage, setSelectedMessage] = useState("");

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
  };

  const handleMessageChange = () => {
    setSelectedMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-2">
      <ChatMessageForm
        initialMessage={selectedMessage}
        onMessageChange={handleMessageChange}
        firstName={firstName}
      />
      <ChatWelcomeTabs onMessageSelect={handleMessageSelect} />
    </div>
  );
};

export default ChatMessageView