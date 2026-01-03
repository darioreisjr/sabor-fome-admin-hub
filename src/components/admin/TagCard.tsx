import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Tag } from '@/hooks/useTags';

interface TagCardProps {
  tag: Tag;
  productCount: number;
  onToggleActive: (tag: Tag) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export function TagCard({
  tag,
  productCount,
  onToggleActive,
  onEdit,
  onDelete,
}: TagCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
      {/* Header com Cor, Nome e Actions */}
      <div className="flex items-start gap-3">
        {/* Cor */}
        <div
          className="h-10 w-10 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: tag.color }}
        />

        {/* Nome e Slug */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {tag.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {tag.slug}
          </p>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(tag)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(tag)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Produtos */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Produtos:</span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
        >
          {productCount} produtos
        </span>
      </div>

      {/* Ativa */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm font-medium text-foreground">
          Ativa
        </span>
        <Switch
          checked={tag.active}
          onCheckedChange={() => onToggleActive(tag)}
        />
      </div>
    </div>
  );
}
