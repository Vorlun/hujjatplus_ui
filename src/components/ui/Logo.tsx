import clsx from "clsx";

export type LogoVariant = "full" | "icon" | "icon-bg";
/** sm=28px header · md=32px collapsed rail · lg=40px profile/cards · xl=48px sidebar full */
export type LogoSize = "sm" | "md" | "lg" | "xl";

const SRC: Record<LogoVariant, string> = {
  full: "/logo_full.png",
  icon: "/logo_nobg.png",
  "icon-bg": "/logo.png",
};

const SIZE_SQUARE: Record<LogoSize, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

const SIZE_FULL_HEIGHT: Record<LogoSize, string> = {
  sm: "h-7",
  md: "h-8",
  lg: "h-10",
  xl: "h-12",
};

const FULL_MAX_W: Record<LogoSize, string> = {
  sm: "max-w-[min(100%,200px)]",
  md: "max-w-[min(100%,220px)]",
  lg: "max-w-[min(100%,260px)]",
  xl: "max-w-[min(100%,280px)]",
};

export type LogoProps = {
  variant: LogoVariant;
  size?: LogoSize;
  className?: string;
  imgClassName?: string;
  alt?: string;
};

/**
 * Brand images — never stretched (`object-contain`), aspect ratio preserved.
 * - full → /logo_full.png
 * - icon → /logo_nobg.png
 * - icon-bg → /logo.png
 */
export function Logo({
  variant,
  size = "md",
  className,
  imgClassName,
  alt = "HujjatPlus",
}: LogoProps) {
  const src = SRC[variant];
  const isFull = variant === "full";

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 origin-center items-center justify-center",
        isFull && "max-w-full",
        "transition-all duration-200 hover:scale-105",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        width={320}
        height={80}
        decoding="async"
        loading="lazy"
        className={clsx(
          "object-contain",
          isFull
            ? clsx(
                SIZE_FULL_HEIGHT[size],
                "w-auto",
                FULL_MAX_W[size],
                imgClassName
              )
            : clsx(SIZE_SQUARE[size], imgClassName)
        )}
      />
    </span>
  );
}
