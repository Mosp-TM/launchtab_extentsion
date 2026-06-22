"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Image01Icon,
  Maximize01Icon,
  Delete02Icon,
  Edit02Icon,
  KeyboardIcon,
} from "@hugeicons/core-free-icons";
import { faviconUrl } from "@/lib/favicon";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTabsStore, Tab } from "@/store/tabsStore";
import { useTabClickHistoryStore } from "@/store/tabClickHistoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { AddTabDialog } from "./AddTabDialog";
import { EditTabDialog } from "./EditTabDialog";
import { ShortcutDialog } from "./ShortcutDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const getHostname = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
};

const getFaviconUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    return faviconUrl(parsed.origin);
  } catch {
    return undefined;
  }
};

const getFallbackChar = (title: string) => {
  if (!title) {
    return "?";
  }
  return title.trim().charAt(0).toUpperCase();
};

type DragItem = {
  id: string;
  index: number;
};

const DRAG_TYPE = "shortcut-card";

interface SortableShortcutCardProps {
  tab: Tab;
  index: number;
  moveTab: (fromIndex: number, toIndex: number) => void;
  removeTab: (id: string) => void;
  incrementVisitCount: (id: string) => void;
  autoOrderTabs: boolean;
  compact?: boolean;
}

const SortableShortcutCard = ({
  tab,
  index,
  moveTab,
  removeTab,
  incrementVisitCount,
  autoOrderTabs,
  compact = false,
}: SortableShortcutCardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const {
    language,
    setClockDialogOpen,
    setBackgroundDialogOpen,
    setResizeDialogOpen,
  } = useSettingsStore();
  const addTabClickHistoryEntry = useTabClickHistoryStore(
    (state) => state.addTabClickHistoryEntry,
  );
  const t = useTranslation(language);

  const [, drop] = useDrop<DragItem>({
    accept: DRAG_TYPE,
    hover: (item) => {
      if (!ref.current || autoOrderTabs) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTab(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({
      id: tab.id,
      index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !autoOrderTabs,
  });

  if (!autoOrderTabs) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  const hostname = getHostname(tab.url);
  const favicon = getFaviconUrl(tab.url);

  const handleShortcutClick = () => {
    addTabClickHistoryEntry({
      id: tab.id,
      title: tab.title,
      url: tab.url,
    });
    incrementVisitCount(tab.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={ref}
          className="flex flex-col items-center gap-1"
          style={{
            opacity: isDragging ? 0.5 : 1,
            cursor: autoOrderTabs
              ? "default"
              : isDragging
                ? "grabbing"
                : "grab",
            width: "var(--card-size-dynamic, 4.5rem)",
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${tab.title || hostname || "shortcut"}`}
                onClick={handleShortcutClick}
                className="block"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="relative flex items-center justify-center overflow-hidden transition-transform active:scale-90"
                  style={{
                    width: "var(--card-size-dynamic, 4.5rem)",
                    height: "var(--card-size-dynamic, 4.5rem)",
                    border: "0.5px solid rgba(255,255,255,0.42)",
                    borderRadius: "var(--card-radius-dynamic, 0.625rem)",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(14px) saturate(1.2)",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
                    WebkitBackdropFilter: "blur(14px) saturate(1.2)",
                  }}
                >
                  <Avatar
                    className="overflow-visible border-0 bg-transparent"
                    style={{
                      width: "calc(var(--card-size-dynamic, 4.5rem) * 0.68)",
                      height: "calc(var(--card-size-dynamic, 4.5rem) * 0.68)",
                      borderRadius:
                        "calc(var(--card-size-dynamic, 4.5rem) * 0.06)",
                    }}
                  >
                    {favicon ? (
                      <AvatarImage
                        src={favicon}
                        alt={hostname}
                        className="object-contain"
                        style={{
                          borderRadius:
                            "calc(var(--card-size-dynamic, 4.5rem) * 0.06)",
                        }}
                      />
                    ) : null}
                    <AvatarFallback
                      style={{
                        backgroundColor: "transparent",
                        fontSize:
                          "max(0.55rem, calc(var(--card-size-dynamic, 4.5rem) * 0.28))",
                        fontWeight: 600,
                        borderRadius:
                          "calc(var(--card-size-dynamic, 4.5rem) * 0.06)",
                      }}
                      className="text-foreground"
                    >
                      {getFallbackChar(tab.title || hostname)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs space-y-1 text-left">
              <p className="text-sm font-medium text-foreground">{tab.title}</p>
              <p className="text-xs text-muted-foreground">{tab.url}</p>
            </TooltipContent>
          </Tooltip>

          {!compact && (
            <p
              className="w-full text-center text-foreground leading-tight"
              style={{
                fontSize:
                  "max(0.5rem, calc(var(--card-size-dynamic, 4.5rem) * 0.17))",
                fontWeight: 400,
                letterSpacing: "0px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tab.title || hostname}
            </p>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64 p-1.5 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {t("shortcutActions")}
        </div>
        <EditTabDialog tab={tab}>
          <ContextMenuItem
            className="gap-2.5 font-bold text-xs rounded-lg"
            onSelect={(e) => e.preventDefault()}
          >
            <HugeiconsIcon
              icon={Edit02Icon}
              size={14}
              strokeWidth={2}
              className="text-primary"
            />
            {t("edit")}
          </ContextMenuItem>
        </EditTabDialog>
        <ShortcutDialog tab={tab}>
          <ContextMenuItem
            className="gap-2.5 font-bold text-xs rounded-lg"
            onSelect={(e) => e.preventDefault()}
          >
            <HugeiconsIcon
              icon={KeyboardIcon}
              size={14}
              strokeWidth={2}
              className="text-primary"
            />
            {t("keyboardShortcut")}
          </ContextMenuItem>
        </ShortcutDialog>
        <DeleteConfirmDialog
          title={t("deleteShortcut") + "?"}
          description={
            t("deleteShortcutDesc") ||
            `Permanently remove "${tab.title || hostname}"?`
          }
          onConfirm={() => removeTab(tab.id)}
        >
          <ContextMenuItem
            className="gap-2.5 font-bold text-xs rounded-lg text-destructive focus:text-destructive"
            onSelect={(e) => e.preventDefault()}
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
            {t("deleteShortcut")}
          </ContextMenuItem>
        </DeleteConfirmDialog>

        <ContextMenuSeparator className="bg-border/40 my-1.5" />

        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {t("dashboardConfig")}
        </div>

        <ContextMenuItem
          onSelect={() => setClockDialogOpen(true)}
          className="gap-2.5 font-bold text-xs rounded-lg"
        >
          <HugeiconsIcon
            icon={Clock01Icon}
            size={14}
            strokeWidth={2}
            className="text-primary"
          />
          {t("clockSettings")}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => setBackgroundDialogOpen(true)}
          className="gap-2.5 font-bold text-xs rounded-lg"
        >
          <HugeiconsIcon
            icon={Image01Icon}
            size={14}
            strokeWidth={2}
            className="text-primary"
          />
          {t("backgroundImage")}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => setResizeDialogOpen(true)}
          className="gap-2.5 font-bold text-xs rounded-lg"
        >
          <HugeiconsIcon
            icon={Maximize01Icon}
            size={14}
            strokeWidth={2}
            className="text-primary"
          />
          {t("resizeShortcuts")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const TabsList = ({
  variant = "dock",
}: {
  variant?: "grid" | "dock";
}) => {
  const [mounted, setMounted] = useState(false);
  const tabs = useTabsStore((state) => state.tabs);
  const removeTab = useTabsStore((state) => state.removeTab);
  const moveTab = useTabsStore((state) => state.moveTab);
  const incrementVisitCount = useTabsStore(
    (state) => state.incrementVisitCount,
  );
  const { autoOrderTabs, cardSize, cardRadius, tabsPosition } =
    useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDock = variant === "dock";

  if (tabs.length === 0) {
    return (
      <div className="flex w-full justify-center">
        <AddTabDialog />
      </div>
    );
  }

  const sortedTabs = autoOrderTabs
    ? [...tabs].sort((a, b) => b.visitCount - a.visitCount)
    : tabs;

  if (isDock) {
    return (
      <TooltipProvider delayDuration={150}>
        <DndProvider backend={HTML5Backend}>
          <div
            className="shortcut-card-grid flex w-full justify-center gap-3 overflow-x-auto px-1 py-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            style={
              {
                "--base-card-size": "3.25rem",
                "--base-card-radius": "0.875rem",
              } as React.CSSProperties
            }
          >
            {sortedTabs.map((tab: Tab, index) => (
              <div
                key={tab.id}
                className="shrink-0"
                style={{ width: "var(--card-size-dynamic, 3.25rem)" }}
              >
                <SortableShortcutCard
                  tab={tab}
                  index={index}
                  moveTab={moveTab}
                  removeTab={removeTab}
                  incrementVisitCount={incrementVisitCount}
                  autoOrderTabs={autoOrderTabs}
                  compact
                />
              </div>
            ))}
            <div className="flex shrink-0 items-center">
              <AddTabDialog />
            </div>
          </div>
        </DndProvider>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex h-full flex-col px-2 pb-4 md:px-4">
      <div className="flex justify-end mb-4">
        <AddTabDialog />
      </div>

      <TooltipProvider delayDuration={150}>
        <DndProvider backend={HTML5Backend}>
          <div
            className={cn(
              "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent flex flex-col",
              tabsPosition === "top" ? "justify-start" : "justify-center",
            )}
          >
            <div
              className="flex flex-wrap gap-4 justify-center w-full mx-auto shortcut-card-grid"
              style={
                {
                  "--base-card-size": `${cardSize}rem`,
                  "--base-card-radius": `${cardRadius}rem`,
                  maxWidth: `calc(8 * var(--card-size-dynamic, 4.5rem) + 7 * 1rem)`, // 8 items + 7 gaps
                  minWidth: `calc(2 * var(--card-size-dynamic, 4.5rem) + 1 * 1rem)`, // 2 items + 1 gap
                } as React.CSSProperties
              }
            >
              {sortedTabs.map((tab: Tab, index) => (
                <div
                  key={tab.id}
                  style={{
                    width: "var(--card-size-dynamic, 4.5rem)",
                  }}
                >
                  <SortableShortcutCard
                    tab={tab}
                    index={index}
                    moveTab={moveTab}
                    removeTab={removeTab}
                    incrementVisitCount={incrementVisitCount}
                    autoOrderTabs={autoOrderTabs}
                  />
                </div>
              ))}
            </div>
          </div>
        </DndProvider>
      </TooltipProvider>
      <p className="text-sm text-muted-foreground text-center mt-6">
        {" "}
        Made by{" "}
        <a
          href="https://imurad.pages.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Murad
        </a>
      </p>
    </div>
  );
};
