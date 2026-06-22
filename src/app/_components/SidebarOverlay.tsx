"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import Notepad from "@/components/Notepad";
import { Button } from "@/components/ui/button";

interface SidebarOverlayProps {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function SidebarOverlay({
  isVisible,
  onMouseEnter,
  onMouseLeave,
}: SidebarOverlayProps) {
  return (
    <>
      {!isVisible && (
        <div
          className="fixed right-0 top-0 bottom-0 w-8 z-40 cursor-w-resize"
          onMouseEnter={onMouseEnter}
        />
      )}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex w-80 transform flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-500 ease-out md:w-96",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground/90">Tasks</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-foreground/60 hover:bg-white/10 hover:text-foreground"
            onClick={onMouseLeave}
            aria-label="Close tasks panel"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Notepad />
        </div>
      </div>
    </>
  );
}
