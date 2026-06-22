"use client";

import { useState, useEffect, useRef } from "react";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import {
  HomeSearchBar,
  type HomeSearchBarHandle,
} from "@/components/Home/HomeSearchBar";
import AISidebar from "@/components/AISidebar";
import StickyAlarmDialog from "@/components/Notepad/StickyAlarmDialog";
import GithubLink from "@/components/Home/GithubLink";
import {
  normalizeDynamicWallpaper,
  useSettingsStore,
} from "@/store/settingsStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { useDefaultAssets } from "@/hooks/useDefaultAssets";
import { useStickyNoteAlarms } from "@/hooks/useStickyNoteAlarms";
import { useTheme } from "next-themes";
import { BackgroundLayer } from "./_components/BackgroundLayer";
import { ClockSection } from "./_components/ClockSection";
import { SidebarOverlay } from "./_components/SidebarOverlay";

export function PageClient() {
  const {
    showClock,
    showRightSidebar,
    backgroundImage,
    isHydrated,
    layoutPreset,
    isDynamicWallpaper,
    dynamicWallpapers,
    dynamicWallpaperMode,
    autoFocusSearch,
    setBackgroundImage,
  } = useSettingsStore();
  const { resolvedTheme } = useTheme();
  const activeWallpaperTheme = resolvedTheme === "dark" ? "dark" : "light";

  const { url: backgroundImageUrl } = useMediaUrl(backgroundImage);
  const [bgOpacity, setBgOpacity] = useState(0);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

  const searchRef = useRef<HomeSearchBarHandle>(null);
  const isAISidebarOpenRef = useRef(false);
  const hasPickedDynamicWallpaperRef = useRef(false);
  const lastDynamicWallpaperThemeRef = useRef<string | null>(null);

  useEffect(() => {
    isAISidebarOpenRef.current = isAISidebarOpen;
  }, [isAISidebarOpen]);

  useEffect(() => {
    if (backgroundImageUrl) {
      setBgOpacity(0);
      const timer = setTimeout(() => setBgOpacity(1), 50);
      return () => clearTimeout(timer);
    }
  }, [backgroundImageUrl]);

  useEffect(() => {
    if (!isHydrated || !isDynamicWallpaper) {
      if (!isDynamicWallpaper) {
        hasPickedDynamicWallpaperRef.current = false;
        lastDynamicWallpaperThemeRef.current = null;
      }
      return;
    }

    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    const effectiveContext =
      dynamicWallpaperMode === "auto"
        ? "auto"
        : dynamicWallpaperMode === "time"
          ? isDayTime
            ? "time:day"
            : "time:night"
          : `theme:${activeWallpaperTheme}`;

    if (
      hasPickedDynamicWallpaperRef.current &&
      lastDynamicWallpaperThemeRef.current === effectiveContext
    )
      return;

    const normalizedWallpapers = dynamicWallpapers.map(
      normalizeDynamicWallpaper,
    );

    let available: typeof normalizedWallpapers;
    if (dynamicWallpaperMode === "auto") {
      available = normalizedWallpapers;
    } else {
      const filterTheme =
        dynamicWallpaperMode === "time"
          ? isDayTime
            ? ("light" as const)
            : ("dark" as const)
          : activeWallpaperTheme;
      const filtered = normalizedWallpapers.filter(
        (w) => w.mode === "both" || w.mode === filterTheme,
      );
      available = filtered.length > 0 ? filtered : normalizedWallpapers;
    }

    if (available.length === 0) return;

    hasPickedDynamicWallpaperRef.current = true;
    lastDynamicWallpaperThemeRef.current = effectiveContext;

    const fetchNewWallpaper = async () => {
      try {
        const lastIndexStr = sessionStorage.getItem("lastWallpaperIndex");
        const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
        let randomIndex = 0;
        if (available.length > 1) {
          do {
            randomIndex = Math.floor(Math.random() * available.length);
          } while (randomIndex === lastIndex);
        }
        sessionStorage.setItem("lastWallpaperIndex", randomIndex.toString());
        await setBackgroundImage(available[randomIndex].url);
      } catch {
        hasPickedDynamicWallpaperRef.current = false;
        lastDynamicWallpaperThemeRef.current = null;
      }
    };

    fetchNewWallpaper();
  }, [
    activeWallpaperTheme,
    dynamicWallpapers,
    isDynamicWallpaper,
    dynamicWallpaperMode,
    isHydrated,
    setBackgroundImage,
  ]);

  const shouldShowRightSidebar = showRightSidebar && layoutPreset !== "focus";

  useKeyboardShortcuts({
    onSearchFocus: (initialQuery) => {
      if (isAISidebarOpenRef.current) return;
      searchRef.current?.focus(initialQuery ?? "");
    },
    onAIModalOpen: () => {
      isAISidebarOpenRef.current = true;
      setIsAISidebarOpen(true);
    },
  });

  useDefaultAssets();
  useStickyNoteAlarms();

  useEffect(() => {
    if (isHydrated && autoFocusSearch) {
      searchRef.current?.focus();
    }
  }, [isHydrated, autoFocusSearch]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackgroundLayer url={backgroundImageUrl} opacity={bgOpacity} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-24 pt-[8vh] md:pt-[10vh]">
          {showClock && (
            <div className="mb-6 w-full">
              <ClockSection layoutPreset={layoutPreset} />
            </div>
          )}

          <HomeSearchBar ref={searchRef} className="mb-8 w-full max-w-2xl" />

          <div className="flex w-full flex-1 flex-col">
            <TabsZone />
          </div>
        </main>
      </div>

      {shouldShowRightSidebar && (
        <SidebarOverlay
          isVisible={isSidebarVisible}
          onMouseEnter={() => setIsSidebarVisible(true)}
          onMouseLeave={() => setIsSidebarVisible(false)}
        />
      )}

      <SettingsMenu />
      <GithubLink />

      <AISidebar
        open={isAISidebarOpen}
        onClose={() => {
          isAISidebarOpenRef.current = false;
          setIsAISidebarOpen(false);
        }}
      />
      <StickyAlarmDialog />
    </div>
  );
}
