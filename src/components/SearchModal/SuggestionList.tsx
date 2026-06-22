"use client";

import { Fragment } from "react";
import { Search } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Globe02Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { isUrl, renderCompletionBold, renderHighlightedMatch } from "./utils";
import { SuggestionItem } from "./types";

interface SuggestionListProps {
  items: SuggestionItem[];
  localCount: number;
  activeIndex: number;
  query: string;
  onHover: (index: number) => void;
  onSelect: (item: SuggestionItem) => void;
  variant?: "default" | "launchpad";
  providerLabel?: string;
  onSearchAction?: () => void;
  embedded?: boolean;
}

function getIcon(item: SuggestionItem) {
  if (item.type === "tab") return Globe02Icon;
  if (item.type === "history")
    return isUrl(item.value) ? Globe02Icon : TimeScheduleIcon;
  return Search01Icon;
}

interface SuggestionRowProps {
  item: SuggestionItem;
  isActive: boolean;
  query: string;
  onHover: () => void;
  onSelect: () => void;
  variant: "default" | "launchpad";
}

function SuggestionRow({
  item,
  isActive,
  query,
  onHover,
  onSelect,
  variant,
}: SuggestionRowProps) {
  const icon = getIcon(item);
  const sublabel = "sublabel" in item ? item.sublabel : undefined;
  const isLaunchpad = variant === "launchpad";

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 text-left text-sm transition-colors",
        isLaunchpad
          ? "px-4 py-2.5 text-white/85"
          : "rounded-2xl border border-transparent px-4 py-2.5 text-foreground/90",
        isLaunchpad
          ? isActive
            ? "bg-white/10 text-white"
            : "hover:bg-white/6"
          : isActive
            ? "border-primary/20 bg-primary/10 text-primary"
            : "hover:border-border/40 hover:bg-accent/40 hover:text-foreground",
      )}
    >
      {isLaunchpad ? (
        <Search
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-sky-300" : "text-white/45",
          )}
          strokeWidth={2}
        />
      ) : (
        <HugeiconsIcon
          icon={icon}
          size={14}
          strokeWidth={2}
          className={cn(
            "shrink-0",
            isActive ? "text-primary" : "text-muted-foreground/50",
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <span className="block truncate">
          {isLaunchpad && (item.type === "api" || item.type === "history") ? (
            renderCompletionBold(item.label, query)
          ) : (
            <span className="font-medium">
              {renderHighlightedMatch(
                item.label,
                query,
                isActive
                  ? "font-semibold text-primary"
                  : "font-semibold text-primary/90",
              )}
            </span>
          )}
        </span>
        {sublabel && !isLaunchpad && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {renderHighlightedMatch(
              sublabel,
              query,
              isActive
                ? "font-semibold text-primary"
                : "font-semibold text-primary/80",
            )}
          </span>
        )}
      </div>
    </button>
  );
}

interface SearchActionRowProps {
  query: string;
  providerLabel: string;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
}

function SearchActionRow({
  query,
  providerLabel,
  isActive,
  onHover,
  onSelect,
}: SearchActionRowProps) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/85 hover:bg-white/6",
      )}
    >
      <Search
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-sky-300" : "text-white/45",
        )}
        strokeWidth={2}
      />
      <span className="min-w-0 truncate">
        <span className="text-sky-300">{query.trim()}</span>
        <span className="text-white/55"> — Search with {providerLabel}</span>
      </span>
    </button>
  );
}

export function SuggestionList({
  items,
  localCount,
  activeIndex,
  query,
  onHover,
  onSelect,
  variant = "default",
  providerLabel = "Google",
  onSearchAction,
  embedded = false,
}: SuggestionListProps) {
  const isLaunchpad = variant === "launchpad";
  const trimmedQuery = query.trim();
  const showSearchAction = isLaunchpad && !!trimmedQuery && !!onSearchAction;
  const hasItems = items.length > 0;

  if (!showSearchAction && !hasItems) return null;

  const hasApiSection = localCount > 0 && items.length > localCount;

  const getItemIndex = (listIndex: number) =>
    showSearchAction ? listIndex + 1 : listIndex;

  const content = (
    <div className={cn("max-h-72 overflow-y-auto", isLaunchpad && "py-1")}>
      <div className={cn("flex flex-col", !isLaunchpad && "gap-1")}>
        {showSearchAction && (
          <SearchActionRow
            query={trimmedQuery}
            providerLabel={providerLabel}
            isActive={activeIndex === 0}
            onHover={() => onHover(0)}
            onSelect={onSearchAction}
          />
        )}

        {items.map((item, index) => (
          <Fragment key={item.id}>
            {hasApiSection && index === localCount && !isLaunchpad && (
              <div className="flex items-center gap-2 px-4 py-1">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
                  Web suggestions
                </span>
                <div className="h-px flex-1 bg-border/30" />
              </div>
            )}
            <SuggestionRow
              item={item}
              isActive={activeIndex === getItemIndex(index)}
              query={query}
              onHover={() => onHover(getItemIndex(index))}
              onSelect={() => onSelect(item)}
              variant={variant}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className={cn(
        "overflow-hidden backdrop-blur-md",
        isLaunchpad
          ? "mt-0"
          : "mt-2 rounded-3xl border border-border/40 bg-background/88 p-2",
      )}
    >
      {content}
    </div>
  );
}
