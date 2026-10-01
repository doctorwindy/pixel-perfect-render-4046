import lightLogo from "@/assets/infovault-logo.png.asset.json";
import darkLogo from "@/assets/infovault-logo-dark-final.png.asset.json";
import iconLogo from "@/assets/infovault-icon.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return <img src={iconLogo.url} alt="InfoVault" className={cn("block aspect-square object-contain", className)} />;
  }

  return (
    <span className={cn("block", className)}>
      <img src={lightLogo.url} alt="InfoVault — Your personal information, always ready to copy" className="block h-auto w-full object-contain dark:hidden" />
      <img src={darkLogo.url} alt="InfoVault — Your personal information, always ready to copy" className="hidden h-auto w-full object-contain dark:block" />
    </span>
  );
}