"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
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
import { useSearchAutocomplete } from "@/hooks/useSearchAutocomplete";
import { cn } from "@/lib/utils";

export type HomeSearchBarHandle = {
  focus: (seedText?: string) => void;
};

interface HomeSearchBarProps {
  className?: string;
  autoFocus?: boolean;
  variant?: "default" | "launchpad";
  onSuggestionsChange?: (show: boolean) => void;
}

function SearchEngineMark({ engine }: { engine: string }) {
  if (engine === "duckduckgo") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DE5833] text-[10px] font-bold text-white">
        D
      </span>
    );
  }

  if (engine === "bing") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#008373] text-[10px] font-bold text-white">
        b
      </span>
    );
  }

  if (engine === "brave") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FB542B] text-[10px] font-bold text-white">
        B
      </span>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export const HomeSearchBar = forwardRef<
  HomeSearchBarHandle,
  HomeSearchBarProps
>(function HomeSearchBar(
  { className, autoFocus = false, variant = "launchpad", onSuggestionsChange },
  ref,
) {
  const isLaunchpad = variant === "launchpad";
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

  const apiSuggestions = useSearchAutocomplete(query, searchEngine);

  const { allItems, localCount, inlineValue, inlineIsHistory, inlineSuffix } =
    useSuggestions({
      query,
      apiSuggestions,
      language,
    });

  useImperativeHandle(ref, () => ({
    focus: (seedText = "") => {
      if (seedText) {
        setQuery(seedText);
        setActiveIndex(seedText.trim() && isLaunchpad ? 0 : -1);
      }
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      const pos = seedText.length;
      el.setSelectionRange(pos, pos);
    },
  }));

  useEffect(() => {
    if (!autoFocus) return;

    const focusInput = () => {
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
    };

    focusInput();
    const rafId = requestAnimationFrame(focusInput);
    const timeoutIds = [50, 150, 350].map((delay) =>
      window.setTimeout(focusInput, delay),
    );

    window.addEventListener("focus", focusInput);

    return () => {
      cancelAnimationFrame(rafId);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("focus", focusInput);
    };
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex(isLaunchpad && query.trim() ? 0 : -1);
  }, [query, isLaunchpad]);

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
    setActiveIndex(isLaunchpad ? 0 : -1);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(
        inlineValue.length,
        inlineValue.length,
      );
    });
    return true;
  };

  const hasSearchAction = isLaunchpad && !!query.trim();
  const totalRows = (hasSearchAction ? 1 : 0) + allItems.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isPlainCharacterKey =
      e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (isHistoryComplete && (e.key === "Backspace" || isPlainCharacterKey)) {
      e.preventDefault();
      setActiveIndex(isLaunchpad && query.trim() ? 0 : -1);
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
      setActiveIndex(isLaunchpad && query.trim() ? 0 : -1);
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
      setActiveIndex(isLaunchpad && query.trim() ? 0 : -1);
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
      if (!totalRows) return;
      e.preventDefault();
      setActiveIndex((i) => {
        if (i < 0) return 0;
        return Math.min(i + 1, totalRows - 1);
      });
    } else if (e.key === "ArrowUp") {
      if (!totalRows) return;
      e.preventDefault();
      setActiveIndex((i) => {
        if (i < 0) return totalRows - 1;
        return Math.max(i - 1, 0);
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hasSearchAction && activeIndex === 0) {
        handleSearchValue(query);
        return;
      }
      const itemIndex = hasSearchAction ? activeIndex - 1 : activeIndex;
      const active = itemIndex >= 0 ? allItems[itemIndex] : undefined;
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

  const hasQuery = !!query.trim();

  const showSuggestions = isLaunchpad
    ? hasQuery
    : (isFocused || hasQuery) && allItems.length > 0;

  useEffect(() => {
    onSuggestionsChange?.(showSuggestions);
    return () => onSuggestionsChange?.(false);
  }, [showSuggestions, onSuggestionsChange]);

  const placeholder = isLaunchpad
    ? `Search with ${providerLabel} or enter address`
    : `${t("search")} ${providerLabel} or enter a URL...`;

  return (
    <section className={cn("w-full", className)} aria-label="Search">
      <div
        className={cn(
          "relative overflow-hidden",
          isLaunchpad
            ? "rounded-2xl border border-sky-400/35 bg-[#1c1c1e]/88 shadow-2xl shadow-black/30 backdrop-blur-xl"
            : cn(
                "transition-all duration-200 rounded-2xl border border-white/20 bg-background/55 shadow-2xl shadow-black/10 backdrop-blur-xl",
                isFocused &&
                  "border-white/30 bg-background/65 shadow-black/20",
              ),
        )}
      >
        <div className="relative flex items-center">
          {isLaunchpad && (
            <div className="flex shrink-0 items-center gap-0.5 pl-4 text-white/70">
              <SearchEngineMark engine={searchEngine} />
              <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
            </div>
          )}

          {inlineSuffix && !isHistoryComplete && !isLaunchpad && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre pl-14 pr-16 text-base"
            >
              <span className="invisible">{query}</span>
              <span className="text-muted-foreground/45">{inlineSuffix}</span>
            </div>
          )}

          <Input
            ref={inputRef}
            placeholder={placeholder}
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
            className={cn(
              "relative border-0 bg-transparent shadow-none focus-visible:ring-0",
              isLaunchpad
                ? "h-12 flex-1 rounded-none pl-3 pr-12 text-base text-white placeholder:text-white/45"
                : "h-14 rounded-2xl pl-14 pr-16 text-base md:h-16 md:text-lg",
            )}
          />

          <Button
            type="button"
            size="sm"
            onClick={() =>
              handleSearchValue(isHistoryComplete ? inlineValue! : query)
            }
            aria-label={`Search with ${providerLabel}`}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-0 shadow-none",
              isLaunchpad
                ? "h-8 w-8 rounded-full border-0 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                : "h-10 w-10 rounded-xl border border-border/40 bg-background/80 text-muted-foreground hover:text-foreground",
            )}
            disabled={!query.trim()}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>

        {showSuggestions && (
          <>
            <div className="mx-4 h-px bg-white/10" />
            <SuggestionList
              items={allItems}
              localCount={localCount}
              activeIndex={activeIndex}
              query={query}
              onHover={setActiveIndex}
              onSelect={handleSuggestionSelect}
              variant="launchpad"
              providerLabel={providerLabel}
              onSearchAction={() => handleSearchValue(query)}
              embedded
            />
          </>
        )}
      </div>

      {!isLaunchpad && showSuggestions && (
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
