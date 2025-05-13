
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const isTitleOnly = !description && !actions;

  return (
    <div className={cn(
      "mb-6",
      isTitleOnly ? "flex justify-center" : "md:flex md:items-center md:justify-between"
    )}>
      <div className={cn(!isTitleOnly && "flex-1 min-w-0")}>
        <h1 className={cn(
          "text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl",
          isTitleOnly && "text-center" 
        )}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex md:ml-4 md:mt-0">{actions}</div>
      )}
    </div>
  );
}
