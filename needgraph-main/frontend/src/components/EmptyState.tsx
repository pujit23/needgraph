import { type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState — consistent empty-state placeholder across all pages.
 */
export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[#111118] border border-[#1E1E2E] flex items-center justify-center mb-4 text-[#2A2A40]">
        {icon || <Search className="w-7 h-7" />}
      </div>
      <p className="text-[15px] font-medium text-[#8A8A9A] mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-[#55556A] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
