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
import { Category } from '@/hooks/useCategories';

interface CategoryCardProps {
  category: Category;
  productCount: number;
  onToggleActive: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({
  category,
  productCount,
  onToggleActive,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
      {/* Header com Nome e Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {category.slug}
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
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Descrição */}
      <div>
        <span className="text-xs text-muted-foreground font-medium">Descrição:</span>
        <p className="text-sm text-foreground mt-1">
          {category.description || '—'}
        </p>
      </div>

      {/* Produtos */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Produtos:</span>
        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {productCount} produtos
        </span>
      </div>

      {/* Ativa */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm font-medium text-foreground">
          Ativa
        </span>
        <Switch
          checked={category.active}
          onCheckedChange={() => onToggleActive(category)}
        />
      </div>
    </div>
  );
}
