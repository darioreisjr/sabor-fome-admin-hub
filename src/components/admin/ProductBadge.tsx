import { cn } from '@/lib/utils';
import { useTags } from '@/hooks/useTags';

interface ProductBadgeProps {
  tagSlug: string;
  className?: string;
}

export function ProductBadge({ tagSlug, className }: ProductBadgeProps) {
  const { data: tags = [] } = useTags();
  const tag = tags.find((t) => t.slug === tagSlug);

  if (!tag) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        className
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      {tag.name}
    </span>
  );
}
