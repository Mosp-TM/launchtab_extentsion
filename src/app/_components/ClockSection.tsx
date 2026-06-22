import DigitalClock from "@/components/Home/ClockZone/Clock";

interface ClockSectionProps {
  layoutPreset: string;
}

const paddingByPreset: Record<string, string> = {
  compact: "py-1",
  focus: "py-2",
};

export function ClockSection({ layoutPreset }: ClockSectionProps) {
  const paddingClass = paddingByPreset[layoutPreset] ?? "py-2";

  return (
    <div className={`flex justify-center ${paddingClass}`}>
      <DigitalClock />
    </div>
  );
}
