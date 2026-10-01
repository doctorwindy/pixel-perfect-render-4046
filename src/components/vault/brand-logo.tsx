import lightLogo from "@/assets/infovault-logo.png.asset.json";
import darkLogo from "@/assets/infovault-logo-dark.png.asset.json";
import iconLogo from "@/assets/infovault-icon.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return <img src={iconLogo.url} alt="InfoVault" className={cn("block aspect-square object-contain", className)} />;
  }

  return (
    <picture className={cn("block", className)}>
      <source srcSet={darkLogo.url} media="(prefers-color-scheme: dark)" />
      <img src={lightLogo.url} alt="InfoVault — Your personal information, always ready to copy" className="block h-auto w-full object-contain" />
    </picture>
  );
}