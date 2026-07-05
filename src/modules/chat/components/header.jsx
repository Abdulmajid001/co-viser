import { ModeToggle } from "@/components/ui/mode-toggle";

const Header = () => {
  return (
    <div className="flex h-14 w-full flex-row justify-end items-center border-b border-border bg-sidebar px-4 py-2">
      <p className="text-xs text-muted-foreground mx-auto">
        Every AI model here is free. Switch between them anytime, and enjoy —
        just keep in mind storage is limited, so use thoughtfully.
      </p>
      <ModeToggle />
    </div>
  );
};

export default Header;
