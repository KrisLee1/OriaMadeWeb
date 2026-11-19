// Compact PageEmptyState / Empty, OriaTunnel 90da190 (GPL-3.0-only).
import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function DemoEmpty({icon, title, description, action, className, fullSize=false}: {
  icon: ReactNode; title: string; description?: string; action?: ReactNode; fullSize?: boolean; className?: string;
}) {
  return <div data-slot="empty" className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border-dashed px-3 py-3 text-center text-balance", fullSize && "gap-4 p-6", className)}>
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary [&_svg]:size-4", fullSize && "size-12 rounded-xl [&_svg]:size-6")}>{icon}</span>
      <span role="heading" aria-level={2} className="text-sm font-medium tracking-tight">{title}</span>
      {description && <p className="max-w-full text-sm/relaxed wrap-anywhere text-muted-foreground">{description}</p>}
    </div>
    {action && <div className="flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm">{action}</div>}
  </div>;
}
