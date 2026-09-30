import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_TINTS, TINT_BG, TINT_SOFT, type Tint } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SectionIcon({
  icon: Icon,
  tint,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tint: Tint;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <span
      className={cn("tint-tile inline-flex shrink-0 items-center justify-center", TINT_BG[tint], dims, className)}
      aria-hidden
    >
      <Icon className={icon} />
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon,
  tint,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  tint?: Tint;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 pt-2">
      <div className="flex items-center gap-4">
        {icon && tint ? (
          <SectionIcon icon={icon} tint={tint} size="lg" className="h-14 w-14 sm:h-16 sm:w-16 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-8 sm:[&>svg]:w-8" />
        ) : null}
        <div className="min-w-0">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-heading sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-prose text-base text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 max-sm:w-full max-sm:[&>*]:flex-1">{actions}</div>
      ) : null}
    </header>
  );
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tint = STATUS_TINTS[value] ?? "blue";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TINT_SOFT[tint],
        className,
      )}
    >
      {value}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  tint,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  tint: Tint;
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-slab flex flex-col items-center px-6 py-14 text-center">
      <SectionIcon icon={icon} tint={tint} size="lg" />
      <h2 className="mt-4 text-lg font-semibold text-heading">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-pop rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => onConfirm()}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
