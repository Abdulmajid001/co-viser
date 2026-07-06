"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./chat-sidebar";

export default function HamburgerMenuModal({ userEmail, chats, open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-40 flex ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      } transition-opacity duration-300`}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <aside
        className={`relative z-10 h-full bg-sidebar shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-red-500 h-[calc(100%-3.5rem)] overflow-y-auto">
          <ChatSidebar userEmail={userEmail} chats={chats} onClose={onClose} />
        </div>
      </aside>
    </div>
  );
}
