"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, RotateRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

import { AppearanceSection } from "./sections/AppearanceSection";
import { WallpaperSection } from "./sections/WallpaperSection";
import { LayoutSection } from "./sections/LayoutSection";
import { BehaviorSection } from "./sections/BehaviorSection";
import { ProfileShareSection } from "./sections/ProfileShareSection";
import { ClockSettingsPanel } from "./Clock/ClockSettingsPanel";
import { ResizeShortcutsPanel } from "./Shortcuts/ResizeShortcutsPanel";
import { HistoryPanel } from "./History/HistoryPanel";
import { ThemeLanguageSection } from "./Theme/ThemeLanguageSection";
import { SearchPositionSection } from "./Search/SearchPositionSection";
import { TogglesSection } from "./Toggles/TogglesSection";
import { BackgroundSection } from "./Background/BackgroundSection";
import { ActionGrid } from "./Shortcuts/ActionGrid";
import { ResizeShortcutsDialog } from "./Shortcuts/ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./Background/BackgroundImageDialog";
import { ClockColorDialog } from "./Clock/ClockColorDialog";
import { HistoryDialog } from "./History/HistoryDialog";
import { ResetDialog } from "./Reset/ResetDialog";
import { ProfileDialog } from "./Profile/ProfileDialog";
import { SettingsSidebar } from "./SettingsSidebar";
import type { SettingsSection } from "./types";

const SECTION_TITLES: Record<SettingsSection, string> = {
  appearance: "Appearance",
  wallpaper: "Wallpaper",
  layout: "Layout",
  behavior: "Behavior",
  clock: "Clock Face",
  shortcuts: "Shortcuts",
  history: "History",
  "profile-share": "Profile Share",
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

const SettingsMenu = () => {
  const isDesktop = useIsDesktop();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("appearance");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isMobileProfileDialogOpen, setIsMobileProfileDialogOpen] =
    useState(false);
  const [showMore, setShowMore] = useState(false);

  const {
    language,
    isClockDialogOpen,
    isBackgroundDialogOpen,
    isResizeDialogOpen,
    setClockDialogOpen,
    setBackgroundDialogOpen,
    setResizeDialogOpen,
  } = useSettingsStore();

  const t = useTranslation(language);

  const renderSection = () => {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSection />;
      case "wallpaper":
        return <WallpaperSection />;
      case "layout":
        return <LayoutSection />;
      case "behavior":
        return <BehaviorSection />;
      case "clock":
        return <ClockSettingsPanel />;
      case "shortcuts":
        return <ResizeShortcutsPanel />;
      case "history":
        return <HistoryPanel />;
      case "profile-share":
        return <ProfileShareSection />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {isDesktop ? (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
            aria-label="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent
              hideDefaultClose
              className="p-0 overflow-hidden rounded-2xl w-[85vw] max-w-[85vw] h-[85vh] max-h-[85vh]"
            >
              <DialogTitle className="sr-only">{t("settings")}</DialogTitle>
              <DialogDescription className="sr-only">
                App settings
              </DialogDescription>

              <div className="flex h-full overflow-hidden">
                <SettingsSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />

                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-border/20 shrink-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      {SECTION_TITLES[activeSection]}
                    </h2>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                    {renderSection()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
              aria-label="Settings"
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={16}
                strokeWidth={1.5}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("settings")}
              </span>
              <ResetDialog>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  aria-label="Reset settings"
                >
                  <HugeiconsIcon
                    icon={RotateRight01Icon}
                    size={12}
                    strokeWidth={1.5}
                  />
                </Button>
              </ResetDialog>
            </div>
            <DropdownMenuSeparator />
            <ThemeLanguageSection />
            <DropdownMenuSeparator />
            <SearchPositionSection />
            <DropdownMenuSeparator />
            <TogglesSection showMore={showMore} setShowMore={setShowMore} />
            <DropdownMenuSeparator />
            <BackgroundSection />
            {showMore && (
              <>
                <DropdownMenuSeparator />
                <ActionGrid
                  onResizeClick={() => setResizeDialogOpen(true)}
                  onHistoryClick={() => setIsHistoryDialogOpen(true)}
                  onClockClick={() => setClockDialogOpen(true)}
                  onProfileClick={() => setIsMobileProfileDialogOpen(true)}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ResizeShortcutsDialog
        open={isResizeDialogOpen}
        onOpenChange={setResizeDialogOpen}
      />
      <BackgroundImageDialog
        open={isBackgroundDialogOpen}
        onOpenChange={setBackgroundDialogOpen}
      />
      <ClockColorDialog
        open={isClockDialogOpen}
        onOpenChange={setClockDialogOpen}
      />
      <HistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
      <ProfileDialog
        open={isMobileProfileDialogOpen}
        onOpenChange={setIsMobileProfileDialogOpen}
      />
    </div>
  );
};

export default SettingsMenu;
