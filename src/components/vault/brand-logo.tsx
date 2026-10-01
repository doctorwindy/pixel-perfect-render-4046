import lightLogo from "@/assets/infovault-logo.png";
import darkLogo from "@/assets/infovault-logo-dark.png";
import iconLogo from "@/assets/infovault-icon.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return <img src={iconLogo.url} alt="InfoVault" className={cn("block aspect-square object-contain", className)} />;
  }

  return (
    <span className={cn("block", className)}>
      <img src={lightLogo} alt="InfoVault" className="block h-auto w-full object-contain dark:hidden" />
      <img src={darkLogo} alt="InfoVault" className="hidden h-auto w-full object-contain dark:block" />
    </span>
  );
}
