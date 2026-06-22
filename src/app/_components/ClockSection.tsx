import DigitalClock from "@/components/Home/ClockZone/Clock";

interface ClockSectionProps {
  layoutPreset?: string;
  variant?: "center" | "launchpad";
}

const paddingByPreset: Record<string, string> = {
  compact: "py-1",
  focus: "py-2",
};

export function ClockSection({
  layoutPreset = "default",
  variant = "center",
}: ClockSectionProps) {
  const paddingClass = paddingByPreset[layoutPreset] ?? "py-2";

  if (variant === "launchpad") {
    return (
      <div className="text-left">
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
