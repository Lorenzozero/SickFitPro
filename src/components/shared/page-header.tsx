
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={cn("mb-6")}>
      <div className={cn(
        "flex flex-row items-center justify-between gap-4" // Always allow space for actions, title will adjust
      )}>
        {/* Text content container */}
        <div className={cn(
          "flex-1 min-w-0", // Allows text to truncate, takes available space
          !actions ? "text-center" : "text-left" // Center text if no actions, otherwise align left
        )}>
          <h1 className={cn(
            "text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl"
          )}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {/* Actions container */}
        {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
