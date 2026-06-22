"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useTabsStore } from "@/store/tabsStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import { useSuggestions } from "@/components/SearchModal/useSuggestions";
import { SuggestionList } from "@/components/SearchModal/SuggestionList";
import { SuggestionItem } from "@/components/SearchModal/types";
import { isUrl } from "@/components/SearchModal/utils";
import { cn } from "@/lib/utils";

export type HomeSearchBarHandle = {
  focus: (seedText?: string) => void;
};

interface HomeSearchBarProps {
  className?: string;
}

export const HomeSearchBar = forwardRef<
  HomeSearchBarHandle,
  HomeSearchBarProps
>(function HomeSearchBar({ className }, ref) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isInlineHistoryDismissed, setIsInlineHistoryDismissed] =
    useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchEngine, language } = useSettingsStore();
  const addSearchHistoryEntry = useSearchHistoryStore(
    (s) => s.addSearchHistoryEntry,
  );
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (s) => s.addTabClickHistoryEntry,
  );
  const tabs = useTabsStore((s) => s.tabs);
  const incrementVisitCount = useTabsStore((s) => s.incrementVisitCount);
  const t = useTranslation(language);

  const { allItems, localCount, inlineValue, inlineIsHistory, inlineSuffix } =
    useSuggestions({
      query,
      apiSuggestions: [],
      language,
    });

  useImperativeHandle(ref, () => ({
    focus: (seedText = "") => {
      if (seedText) {
        setQuery(seedText);
        setActiveIndex(-1);
      }
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const pos = seedText.length;
        el.setSelectionRange(pos, pos);
      });
    },
  }));

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const isHistoryComplete =
    !isInlineHistoryDismissed && inlineIsHistory && !!inlineValue;

  useLayoutEffect(() => {
    if (!isHistoryComplete || !inputRef.current) return;
    const el = inputRef.current;
    const start = query.length;
    const end = inlineValue!.length;
    if (el.selectionStart !== start || el.selectionEnd !== end) {
      el.setSelectionRange(start, end);
    }
  });

  useEffect(() => {
    setIsInlineHistoryDismissed(false);
  }, [query]);

  const getSearchUrl = (text: string) => {
    const q = encodeURIComponent(text);
    if (searchEngine === "duckduckgo") return `https://duckduckgo.com/?q=${q}`;
    if (searchEngine === "bing") return `https://www.bing.com/search?q=${q}`;
    if (searchEngine === "brave")
      return `https://search.brave.com/search?q=${q}`;
    return `https://www.google.com/search?q=${q}`;
  };

  const handleSearchValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    addSearchHistoryEntry(trimmed);
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.blur();

    if (isUrl(trimmed)) {
      window.location.href =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : `https://${trimmed}`;
    } else {
      window.location.href = getSearchUrl(trimmed);
    }
  };

  const handleSuggestionSelect = (item: SuggestionItem) => {
    if (item.type === "tab") {
      const matchingTab = tabs.find((tab) => tab.id === item.tabId);
      if (matchingTab) {
        addSearchHistoryEntry(matchingTab.url);
        addTabClickHistoryEntry({
          id: matchingTab.id,
          title: matchingTab.title,
          url: matchingTab.url,
        });
        incrementVisitCount(matchingTab.id);
      }
      setQuery("");
      if (item.openInNewWindow) {
        window.open(item.value, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.value;
      }
      return;
    }
    handleSearchValue(item.value);
  };

  const acceptInlineCompletion = () => {
    if (!inlineValue) return false;
    setIsInlineHistoryDismissed(false);
    setQuery(inlineValue);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(
        inlineValue.length,
        inlineValue.length,
      );
    });
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isPlainCharacterKey =
      e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (isHistoryComplete && (e.key === "Backspace" || isPlainCharacterKey)) {
      e.preventDefault();
      setActiveIndex(-1);
      setIsInlineHistoryDismissed(false);
      if (e.key === "Backspace") {
        setQuery((prev) => prev.slice(0, -1));
      } else {
        setQuery((prev) => `${prev}${e.key}`);
      }
      return;
    }

    if (isHistoryComplete && (e.key === "ArrowLeft" || e.key === "Delete")) {
      e.preventDefault();
      setActiveIndex(-1);
      setIsInlineHistoryDismissed(true);
      requestAnimationFrame(() => {
        const caretPos =
          e.key === "ArrowLeft" ? Math.max(query.length - 1, 0) : query.length;
        inputRef.current?.setSelectionRange(caretPos, caretPos);
      });
      return;
    }

    if (isHistoryComplete && e.key === "Home") {
      e.preventDefault();
      setActiveIndex(-1);
      setIsInlineHistoryDismissed(true);
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(0, 0);
      });
      return;
    }

    if (isHistoryComplete && e.key === "End") {
      e.preventDefault();
      acceptInlineCompletion();
      return;
    }

    if (e.key === "ArrowDown") {
      if (!allItems.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i < 0 ? 0 : Math.min(i + 1, allItems.length - 1)));
    } else if (e.key === "ArrowUp") {
      if (!allItems.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i < 0 ? allItems.length - 1 : Math.max(i - 1, 0)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = activeIndex >= 0 ? allItems[activeIndex] : undefined;
      if (active) {
        handleSuggestionSelect(active);
        return;
      }
      if (inlineValue && inlineIsHistory) {
        handleSearchValue(inlineValue);
        return;
      }
      handleSearchValue(query);
    } else if (e.key === "Tab" || e.key === "ArrowRight") {
      if (acceptInlineCompletion()) e.preventDefault();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const providerLabel =
    searchEngine === "duckduckgo"
      ? t("duckduckgo")
      : searchEngine === "bing"
        ? t("bing")
        : searchEngine === "brave"
          ? t("brave")
          : t("google");

  const showSuggestions =
    (isFocused || query.trim().length > 0) && allItems.length > 0;

  return (
    <section className={cn("w-full", className)} aria-label="Search">
      <div
        className={cn(
          "relative rounded-2xl border border-white/20 bg-background/55 shadow-2xl shadow-black/10 backdrop-blur-xl transition-shadow",
          isFocused && "border-white/30 bg-background/65 shadow-black/20",
        )}
      >
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/80"
        />

        {inlineSuffix && !isHistoryComplete && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex h-14 items-center overflow-hidden whitespace-pre rounded-2xl pl-14 pr-16 text-base md:h-16 md:text-lg"
          >
            <span className="invisible">{query}</span>
            <span className="text-muted-foreground/45">{inlineSuffix}</span>
          </div>
        )}

        <Input
          ref={inputRef}
          placeholder={`${t("search")} ${providerLabel} or enter a URL...`}
          value={isHistoryComplete ? inlineValue! : query}
          onChange={(e) => {
            if (isHistoryComplete) {
              const cursorPos =
                e.target.selectionStart ?? e.target.value.length;
              setQuery(e.target.value.slice(0, cursorPos));
            } else {
              setQuery(e.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          onKeyDown={handleKeyDown}
          className="relative h-14 rounded-2xl border-0 bg-transparent pl-14 pr-16 text-base shadow-none focus-visible:ring-0 md:h-16 md:text-lg"
        />

        <Button
          type="button"
          size="sm"
          onClick={() =>
            handleSearchValue(isHistoryComplete ? inlineValue! : query)
          }
          aria-label={`Search with ${providerLabel}`}
          className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl border border-border/40 bg-background/80 p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-foreground"
          disabled={!query.trim()}
        >
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} />
        </Button>
      </div>

      {showSuggestions && (
        <SuggestionList
          items={allItems}
          localCount={localCount}
          activeIndex={activeIndex}
          query={query}
          onHover={setActiveIndex}
          onSelect={handleSuggestionSelect}
        />
      )}
    </section>
  );
});
