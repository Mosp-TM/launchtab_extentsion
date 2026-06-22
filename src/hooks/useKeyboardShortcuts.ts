"use client";

import { useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import {
  buildShortcutString,
  isReservedShortcut,
  isTypingTriggerEvent,
} from "@/lib/keyboardShortcuts";

interface UseKeyboardShortcutsProps {
  onSearchFocus?: (initialQuery?: string) => void;
}

export const useKeyboardShortcuts = ({
  onSearchFocus,
}: UseKeyboardShortcutsProps = {}) => {
  const getTabByShortcut = useTabsStore((state) => state.getTabByShortcut);
  const incrementVisitCount = useTabsStore(
    (state) => state.incrementVisitCount,
  );
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (state) => state.addTabClickHistoryEntry,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputField =
        tagName === "input" ||
        tagName === "textarea" ||
        target.contentEditable === "true";

      const isPlainSlash =
        event.key === "/" &&
        !isInputField &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey;

      if (isPlainSlash) {
        event.preventDefault();
        event.stopPropagation();
        onSearchFocus?.();
        return;
      }

      if (isInputField) {
        return;
      }

      if (isTypingTriggerEvent(event)) {
        event.preventDefault();
        event.stopPropagation();
        onSearchFocus?.(event.key === " " ? " " : event.key);
        return;
      }

      const shortcutString = buildShortcutString(event);
      if (!shortcutString) {
        return;
      }

      if (isReservedShortcut(shortcutString)) {
        return;
      }

      const tab = getTabByShortcut(shortcutString);
      if (tab) {
        event.preventDefault();
        event.stopPropagation();
        addTabClickHistoryEntry({
          id: tab.id,
          title: tab.title,
          url: tab.url,
        });
        incrementVisitCount(tab.id);

        if (tab.openInNewWindow) {
          window.open(tab.url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = tab.url;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    addTabClickHistoryEntry,
    getTabByShortcut,
    incrementVisitCount,
    onSearchFocus,
  ]);
};
