"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Image from "next/image";
import Link from "next/link";

import { PlusIcon, SearchIcon, EllipsisIcon, Trash, Pin } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useChatStore } from "@/modules/store/chat-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import DeleteChatModal from "./chat-delete-modal";
// import DeleteChatModal from "./modal/chat-delete-modal";

const ChatSidebar = ({ userEmail, chats }) => {
  const { activeChatId } = useChatStore();
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Chats
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLocaleLowerCase();

    return chats.filter(
      (chat) =>
        chat.title?.toLowerCase().includes(query) ||
        chat.messages?.some((msg) =>
          msg.content?.toLowerCase().includes(query),
        ),
    );
  }, [chats, searchQuery]);

  // Group chats by date ( today , yesterday , inMonth , inYear);
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.created_at);

      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  // Handle Search change Fn
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const onDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setIsModelOpen(true);
  };

  // Render chat List
  const renderChatList = (chatList) => {
    if (chatList.length === 0) return null;

    return chatList.map((chat) => (
      <Fragment key={chat.id}>
        <Link
          href={`/chat/${chat.id}`}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            chat.id === activeChatId && "bg-sidebar-accent",
          )}
        >
          <div className="flex felx-row justify-between items-center gap-2">
            <span className="truncate flex-1">{chat.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10"
                    onClick={(e) => e.preventDefault()}
                  >
                    <EllipsisIcon className="h-4 w-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex flex-row gap-2 cursor-pointer"
                    // onClick={(e) => onPin(e, chat.id)}
                  >
                    <Pin className="h-4 w-4 text-primary" />
                    <span className="text-primary">Pin</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex flex-row gap-2 cursor-pointer"
                    onClick={(e) => onDelete(e, chat.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>

        <DeleteChatModal
          chatId={chat.id}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModelOpen}
        />
      </Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-sidebar">
      <div className="flex items-center justify-center border-b border-sidebar-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Logo" width={150} height={100} />
        </div>
      </div>

      <div className="p-4">
        <Link href={"/"}>
          <Button className={"w-full"}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your chat..."
            className={"pl-9 bg-sidebar-accent border-sidebar-b pr-8"}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Filtered Chats */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {searchQuery ? "No Chats Founds" : "No Chats Yet"}
          </div>
        ) : (
          <>
            {groupedChats.today.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                  Today
                </div>
                {renderChatList(groupedChats.today)}
              </div>
            )}

            {groupedChats.yesterday.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                  Yesterday
                </div>
                {renderChatList(groupedChats.yesterday)}
              </div>
            )}

            {groupedChats.lastWeek.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                  Last 7 Days
                </div>
                {renderChatList(groupedChats.lastWeek)}
              </div>
            )}

            {groupedChats.older.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                  Older
                </div>
                {renderChatList(groupedChats.older)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 flex items-center gap-3 border-t border-sidebar-border">
        <UserButton />
        <span className="flex-1 text-sm text-sidebar-foreground truncate">
          {userEmail}
        </span>
      </div>
    </div>
  );
};

export default ChatSidebar;
