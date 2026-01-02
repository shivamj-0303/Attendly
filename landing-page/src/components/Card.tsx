import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export const Card = ({ children, className = '', title, action }: CardProps) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
