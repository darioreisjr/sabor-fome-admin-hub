import { MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ProductBadge } from './ProductBadge';
import { ProductWithTags } from '@/hooks/useProducts';

interface ProductCardProps {
  product: ProductWithTags;
  categoryName: string;
  onToggleAvailable: (product: ProductWithTags) => void;
  onEdit: (product: ProductWithTags) => void;
  onDuplicate: (product: ProductWithTags) => void;
  onDelete: (product: ProductWithTags) => void;
  onClick?: (product: ProductWithTags) => void;
}

export function ProductCard({
  product,
  categoryName,
  onToggleAvailable,
  onEdit,
  onDuplicate,
  onDelete,
  onClick,
}: ProductCardProps) {
  return (
    <div
      onClick={() => onClick?.(product)}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer"
    >
      {/* Imagem e Info Principal */}
      <div className="flex gap-4">
        {/* Imagem */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {product.slug}
              </p>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(product);
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Preço e Unidade */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              R$ {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {product.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Categoria */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Categoria:</span>
        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {categoryName}
        </span>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <ProductBadge key={tag} tagSlug={tag} />
          ))}
        </div>
      )}

      {/* Disponibilidade */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm font-medium text-foreground">
          Disponível
        </span>
        <Switch
          checked={product.available}
          onCheckedChange={() => onToggleAvailable(product)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
