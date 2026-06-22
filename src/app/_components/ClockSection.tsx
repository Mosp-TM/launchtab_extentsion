import DigitalClock from "@/components/Home/ClockZone/Clock";
import type { ClockPosition } from "@/store/settingsStore";

interface ClockSectionProps {
  layoutPreset?: string;
  variant?: "center" | "launchpad";
  clockPosition?: ClockPosition;
}

export const CLOCK_HEADER_POSITION: Record<ClockPosition, string> = {
  "top-left": "absolute left-0 top-0 z-20 p-5 md:p-8",
  "top-center":
    "absolute left-1/2 top-0 z-20 -translate-x-1/2 p-5 md:p-8",
  "top-right": "absolute right-0 top-0 z-20 p-5 md:p-8",
};

const LAUNCHPAD_ALIGN: Record<ClockPosition, string> = {
  "top-left": "text-left",
  "top-center": "text-center",
  "top-right": "text-right",
};

const paddingByPreset: Record<string, string> = {
  compact: "py-1",
  focus: "py-2",
};

export function ClockSection({
  layoutPreset = "default",
  variant = "center",
  clockPosition = "top-left",
}: ClockSectionProps) {
  const paddingClass = paddingByPreset[layoutPreset] ?? "py-2";

  if (variant === "launchpad") {
    return (
      <div className={LAUNCHPAD_ALIGN[clockPosition]}>
        <DigitalClock variant="launchpad" />
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${paddingClass}`}>
      <DigitalClock />
    </div>
  );
}
