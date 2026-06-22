"use client";

import { useMemo } from "react";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import { useTabsStore } from "@/store/tabsStore";
import { faviconUrl } from "@/lib/favicon";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentTabsProps {
  className?: string;
}

const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
};

export function RecentTabs({ className }: RecentTabsProps) {
  const entries = useTabClickHistoryStore((state) => state.entries);
  const incrementVisitCount = useTabsStore(
    (state) => state.incrementVisitCount,
  );
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (state) => state.addTabClickHistoryEntry,
  );
  const tabs = useTabsStore((state) => state.tabs);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return entries
      .filter((entry) => {
        const key = entry.url.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }, [entries]);

  if (recent.length === 0) return null;

  const openEntry = (url: string, tabId?: string, title?: string) => {
    if (tabId && title) {
      addTabClickHistoryEntry({ id: tabId, title, url });
      incrementVisitCount(tabId);
    }
    window.location.href = url;
  };

  return (
    <section className={cn("w-full", className)} aria-label="Recent tabs">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/45">
        Recent Tabs
      </h2>
      <div className="flex flex-wrap gap-2">
        {recent.map((entry) => {
          const hostname = getHostname(entry.url);
          const icon = getFaviconUrl(entry.url);
          const matchingTab = tabs.find((tab) => tab.url === entry.url);

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() =>
                openEntry(
                  entry.url,
                  matchingTab?.id ?? entry.tabId,
                  entry.title,
                )
              }
              className="group flex max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-left backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <Avatar className="h-5 w-5 shrink-0 rounded-md border-0 bg-transparent">
                {icon ? (
                  <AvatarImage
                    src={icon}
                    alt=""
                    className="rounded-md object-contain"
                  />
                ) : null}
                <AvatarFallback className="rounded-md bg-white/10 text-[10px]">
                  {(entry.title || hostname).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground/90">
                  {entry.title || hostname}
                </span>
                <span className="block truncate text-xs text-foreground/45">
                  {hostname}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getFaviconUrl(rawUrl: string) {
  try {
    return faviconUrl(new URL(rawUrl).origin);
  } catch {
    return undefined;
  }
}
