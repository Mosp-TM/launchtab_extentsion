"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Maximize01Icon,
  TimeScheduleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

interface ActionGridProps {
  onResizeClick: () => void;
  onHistoryClick: () => void;
  onClockClick: () => void;
  onProfileClick: () => void;
}

export const ActionGrid = ({
  onResizeClick,
  onHistoryClick,
  onClockClick,
  onProfileClick,
}: ActionGridProps) => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="grid grid-cols-2 gap-1 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onResizeClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
      >
        <HugeiconsIcon
          icon={Maximize01Icon}
          size={14}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        {t("resizeShortcuts")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onHistoryClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
      >
        <HugeiconsIcon
          icon={TimeScheduleIcon}
          size={14}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        {t("history")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClockClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
      >
        <HugeiconsIcon
          icon={Clock01Icon}
          size={14}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        {t("clockSettings")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onProfileClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
      >
        <HugeiconsIcon
          icon={UserIcon}
          size={14}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        {t("profileShare")}
      </Button>
    </div>
  );
};
