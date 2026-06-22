import { cn } from "@/lib/utils";

type AppImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

export function AppImage({
  src,
  alt,
  className,
  width,
  height,
  fill,
  priority,
}: AppImageProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
