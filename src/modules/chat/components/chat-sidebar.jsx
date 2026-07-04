"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

import Image from "next/image"
import Link from "next/link"

import {
  PlusIcon,
  SearchIcon,
  EllipsisIcon,
  Trash,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { UserButton } from "@clerk/nextjs";
// import { useChatStore } from "../store/chat-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
// import DeleteChatModal from "./modal/chat-delete-modal";

const ChatSidebar = ({ userEmail }) => {
  const [searchQuery, setSearchQuery] = useState("");


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
            // onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="p-4 mt-auto flex items-center gap-3 border-t border-sidebar-border">
        <UserButton />
        <span className="flex-1 text-sm text-sidebar-foreground truncate">
          {userEmail}
        </span>
      </div>
    </div>
  );
};

export default ChatSidebar