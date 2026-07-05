"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import HamburgerMenuModal from "./HamburgerMenuModal";
import { Button } from "@/components/ui/button";

const Header = ({ userEmail, chats }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 w-full items-center border-b border-border bg-sidebar px-4 py-2">
        <Button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          variant="ghost"
          className="mr-auto md:hidden"
          aria-label={menuOpen ? "Close chat sidebar" : "Open chat sidebar"}
          aria-expanded={menuOpen}
        >
          <MenuIcon
            className={`h-6 w-6 transition-transform duration-300 ${
              menuOpen ? "rotate-90" : ""
            }`}
          />
        </Button>

        <p className="mx-auto max-w-3xl px-2 text-center text-xs text-muted-foreground md:text-sm">
          Every AI model here is free. Switch between them anytime, and enjoy —
          just keep in mind storage is limited, so use thoughtfully.
        </p>

        <ModeToggle />
      </div>

      <HamburgerMenuModal
        userEmail={userEmail}
        chats={chats}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
};

export default Header;
