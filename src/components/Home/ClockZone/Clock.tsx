"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/constants/languages";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Image01Icon,
  Maximize01Icon,
} from "@hugeicons/core-free-icons";
import "./Clock.css";

interface DigitalClockProps {
  variant?: "default" | "launchpad";
}

export default function DigitalClock({
  variant = "default",
}: DigitalClockProps) {
  const [timeData, setTimeData] = useState<{ digits: string; ampm: string }>({
    digits: "",
    ampm: "",
  });
  const [dateLabel, setDateLabel] = useState("");
  const {
    clockColor,
    showClockGlow,
    clockFormat,
    showSeconds,
    clockStyle,
    clockPosition,
    language,
    setClockDialogOpen,
    setBackgroundDialogOpen,
    setResizeDialogOpen,
  } = useSettingsStore();
  const t = useTranslation(language);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let digits = "";
      let ampm = "";

      if (clockFormat === "12h") {
        const hours12 = now.getHours() % 12 || 12;
        const hours = String(hours12).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        ampm = now.getHours() >= 12 ? "PM" : "AM";

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          digits = `${hours}:${minutes}:${seconds}`;
        } else {
          digits = `${hours}:${minutes}`;
        }
      } else {
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          digits = `${hours}:${minutes}:${seconds}`;
        } else {
          digits = `${hours}:${minutes}`;
        }
      }
      setTimeData({ digits, ampm });

      if (variant === "launchpad") {
        setDateLabel(
          now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockFormat, showSeconds, variant]);

  const launchpadTextAlign =
    clockPosition === "top-center"
      ? "text-center"
      : clockPosition === "top-right"
        ? "text-right"
        : "text-left";

  const launchpadJustify =
    clockPosition === "top-center"
      ? "justify-center"
      : clockPosition === "top-right"
        ? "justify-end"
        : "justify-start";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={variant === "launchpad" ? launchpadTextAlign : undefined}
        >
          <div
            className={cn(
              "clock-style flex cursor-context-menu select-none items-baseline",
              variant === "launchpad"
                ? cn(
                    launchpadJustify,
                    launchpadTextAlign,
                    "text-5xl md:text-6xl",
                  )
                : "justify-center text-center text-7xl",
              clockStyle === "modern"
                ? "font-sans clock-style--modern"
                : clockStyle === "elegant"
                  ? "clock-style--elegant"
                  : clockStyle === "futuristic"
                    ? "clock-style--futuristic font-sans"
                    : clockStyle === "retro"
                      ? "clock-style--retro font-mono"
                      : "font-mono clock-style--classic",
            )}
            style={
              {
                fontFamily:
                  clockStyle === "modern"
                    ? "var(--font-fredoka)"
                    : clockStyle === "elegant"
                      ? "var(--font-righteous)"
                      : clockStyle === "futuristic"
                        ? "var(--font-orbitron)"
                        : clockStyle === "retro"
                          ? "var(--font-vt323)"
                          : "var(--font-share-tech-mono)",
                letterSpacing:
                  clockStyle === "modern"
                    ? "-0.02em"
                    : clockStyle === "elegant"
                      ? "0.03em"
                      : clockStyle === "futuristic"
                        ? "0.05em"
                        : clockStyle === "retro"
                          ? "0.04em"
                          : "0.02em",
                color: "var(--clock-color)",
                textShadow: showClockGlow
                  ? "0 0 10px var(--glow-color), 0 0 20px var(--glow-color)"
                  : "none",
                animation: showClockGlow
                  ? "glow 2s ease-in-out infinite alternate"
                  : "none",
                "--clock-color": clockColor,
                "--glow-color": clockColor,
                "--clock-glow-strength": showClockGlow ? "1" : "0",
              } as React.CSSProperties
            }
          >
            <span>{timeData.digits}</span>
            {timeData.ampm && (
              <span
                className={cn(
                  "ml-2 opacity-40 font-medium self-end mb-2",
                  clockStyle === "modern"
                    ? "text-2xl"
                    : clockStyle === "elegant"
                      ? "text-2xl font-sans"
                      : clockStyle === "futuristic"
                        ? "text-lg font-sans"
                        : clockStyle === "retro"
                          ? "text-2xl font-mono"
                          : "text-xl font-mono",
                )}
                style={{
                  fontFamily:
                    clockStyle === "modern"
                      ? "var(--font-fredoka)"
                      : clockStyle === "elegant"
                        ? "var(--font-righteous)"
                        : clockStyle === "futuristic"
                          ? "var(--font-orbitron)"
                          : clockStyle === "retro"
                            ? "var(--font-vt323)"
                            : "var(--font-share-tech-mono)",
                }}
              >
                {timeData.ampm}
              </span>
            )}
          </div>
          {variant === "launchpad" && dateLabel && (
            <p className="mt-1 text-sm text-foreground/55 md:text-base">
              {dateLabel}
            </p>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 p-1.5 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
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
}
