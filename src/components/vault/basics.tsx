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
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && tint ? <SectionIcon icon={icon} tint={tint} size="lg" /> : null}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">{title}</h1>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
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
