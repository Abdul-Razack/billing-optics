import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageContainer({ children, title, description, action }: PageContainerProps) {
  return (
    <div className="space-y-6 print:space-y-2 w-full page-transition pb-10 print:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:gap-2">
        <div>
          <h1>{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
