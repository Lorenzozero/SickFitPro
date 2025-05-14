
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
      <div className={cn(actions ? "md:flex md:items-start md:justify-between" : "text-center")}>
        {/* Text content container */}
        <div className={actions ? "flex-1 min-w-0" : ""}>
          <h1 className={cn(
            "text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl",
            "text-center" // Title is always centered
          )}>
            {title}
          </h1>
          {description && (
            // Description follows container alignment: centered if no actions, natural (left for LTR) if actions.
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {/* Actions container */}
        {actions && (
          <div className="mt-4 flex md:ml-4 md:mt-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
