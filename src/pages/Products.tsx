import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Check,
  X,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/admin/DataTable';
import { ProductBadge } from '@/components/admin/ProductBadge';
import { ProductCard } from '@/components/admin/ProductCard';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, ProductWithTags } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { generateSlug } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: ProductWithTags | null }>({
    open: false,
    product: null,
  });

  // Filtered data
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category_slug === categoryFilter;
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.available) ||
        (availabilityFilter === 'unavailable' && !p.available);
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, search, categoryFilter, availabilityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleToggleAvailable = async (product: ProductWithTags) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        updates: { available: !product.available },
        tags: product.tags,
      });
      toast({
        title: product.available ? 'Produto indisponível' : 'Produto disponível',
        description: `${product.name} foi ${product.available ? 'marcado como indisponível' : 'marcado como disponível'}.`,
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro.', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (product: ProductWithTags) => {
    try {
      await createProduct.mutateAsync({
        product: {
          slug: generateSlug(product.name + '-copia'),
          name: product.name + ' (Cópia)',
          category_slug: product.category_slug,
          price: product.price,
          unit: product.unit,
          image: product.image,
          description: product.description,
          available: product.available,
        },
        tags: product.tags,
      });
      toast({
        title: 'Produto duplicado',
        description: `${product.name} (Cópia) foi criado com sucesso.`,
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao duplicar.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;
    try {
      await deleteProduct.mutateAsync(deleteDialog.product.id);
      setDeleteDialog({ open: false, product: null });
      toast({
        title: 'Produto removido',
        description: 'O produto foi removido com sucesso.',
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao remover.', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Imagem',
      className: 'w-16',
      render: (product: ProductWithTags) => (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted overflow-hidden">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      render: (product: ProductWithTags) => (
        <div>
          <p className="font-medium text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (product: ProductWithTags) => {
        const cat = categories.find((c) => c.slug === product.category_slug);
        return (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {cat?.name || product.category_slug}
          </span>
        );
      },
    },
    {
      key: 'price',
      header: 'Preço',
      render: (product: ProductWithTags) => (
        <span className="font-medium text-foreground">
          R$ {product.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unidade',
      render: (product: ProductWithTags) => (
        <span className="text-muted-foreground">{product.unit}</span>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (product: ProductWithTags) => (
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <ProductBadge key={tag} tagSlug={tag} />
          ))}
          {product.tags.length === 0 && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'available',
      header: 'Disponível',
      className: 'w-24',
      render: (product: ProductWithTags) => (
        <Switch
          checked={product.available}
          onCheckedChange={() => handleToggleAvailable(product)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (product: ProductWithTags) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/produtos/${product.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(product)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialog({ open: true, product })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie o catálogo de produtos do Sabor Fome
          </p>
        </div>
        <Button onClick={() => navigate('/produtos/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filters - Mobile: Botão com Sheet */}
      <div className="md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Categoria</label>
                  <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Disponibilidade</label>
                  <Select value={availabilityFilter} onValueChange={(v) => { setAvailabilityFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Disponibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="available">
                        <span className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-success" />
                          Disponíveis
                        </span>
                      </SelectItem>
                      <SelectItem value="unavailable">
                        <span className="flex items-center gap-2">
                          <X className="h-3 w-3 text-destructive" />
                          Indisponíveis
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Itens por página</label>
                  <Select value={perPage.toString()} onValueChange={(v) => { setPerPage(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setFilterSheetOpen(false)}
                  className="w-full"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filters - Desktop/Tablet: Layout original */}
      <div className="hidden md:flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={(v) => { setAvailabilityFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-success" />
                  Disponíveis
                </span>
              </SelectItem>
              <SelectItem value="unavailable">
                <span className="flex items-center gap-2">
                  <X className="h-3 w-3 text-destructive" />
                  Indisponíveis
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={perPage.toString()} onValueChange={(v) => { setPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table / Cards */}
      <DataTable
        data={paginatedProducts}
        columns={columns}
        onRowClick={(product) => navigate(`/produtos/${product.id}`)}
        emptyMessage="Nenhum produto encontrado"
        mobileCard={(product) => {
          const cat = categories.find((c) => c.slug === product.category_slug);
          return (
            <ProductCard
              product={product}
              categoryName={cat?.name || product.category_slug}
              onToggleAvailable={handleToggleAvailable}
              onEdit={(p) => navigate(`/produtos/${p.id}`)}
              onDuplicate={handleDuplicate}
              onDelete={(p) => setDeleteDialog({ open: true, product: p })}
              onClick={(p) => navigate(`/produtos/${p.id}`)}
            />
          );
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * perPage + 1} a{' '}
            {Math.min(currentPage * perPage, filteredProducts.length)} de{' '}
            {filteredProducts.length} produtos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, product: deleteDialog.product })}
        title="Remover produto"
        description={`Tem certeza que deseja remover "${deleteDialog.product?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
