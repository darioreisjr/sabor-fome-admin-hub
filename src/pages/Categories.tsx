import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/admin/DataTable';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategories';
import { useProducts, useUpdateProductsCategory } from '@/hooks/useProducts';
import { generateSlug } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function Categories() {
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateProductsCategory = useUpdateProductsCategory();

  // Modal states
  const [formModal, setFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete/migrate dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    category: Category | null;
    hasProducts: boolean;
  }>({ open: false, category: null, hasProducts: false });
  const [migrateTarget, setMigrateTarget] = useState('');

  const getProductCount = (categorySlug: string) => {
    return products.filter((p) => p.category_slug === categorySlug).length;
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', description: '' });
    setErrors({});
    setFormModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, slug: category.slug, description: category.description || '' });
    setErrors({});
    setFormModal(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name || form.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    if (!form.slug) {
      newErrors.slug = 'Slug é obrigatório';
    } else {
      const slugExists = categories.some(c => c.slug === form.slug && c.id !== editingCategory?.id);
      if (slugExists) {
        newErrors.slug = 'Este slug já está em uso';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        // Update products if slug changed
        if (editingCategory.slug !== form.slug) {
          await updateProductsCategory.mutateAsync({
            oldCategorySlug: editingCategory.slug,
            newCategorySlug: form.slug,
          });
        }

        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: { name: form.name, slug: form.slug, description: form.description },
        });
        toast({ title: 'Categoria atualizada', description: `${form.name} foi atualizada.` });
      } else {
        await createCategory.mutateAsync({
          slug: form.slug,
          name: form.name,
          description: form.description,
          active: true,
        });
        toast({ title: 'Categoria criada', description: `${form.name} foi criada.` });
      }
      setFormModal(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        updates: { active: !category.active },
      });
      toast({
        title: category.active ? 'Categoria desativada' : 'Categoria ativada',
        description: `${category.name} foi ${category.active ? 'desativada' : 'ativada'}.`,
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro.', variant: 'destructive' });
    }
  };

  const openDeleteDialog = (category: Category) => {
    const hasProducts = getProductCount(category.slug) > 0;
    setDeleteDialog({ open: true, category, hasProducts });
    setMigrateTarget('');
  };

  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      if (deleteDialog.hasProducts && migrateTarget) {
        await updateProductsCategory.mutateAsync({
          oldCategorySlug: deleteDialog.category.slug,
          newCategorySlug: migrateTarget,
        });
      }

      await deleteCategory.mutateAsync(deleteDialog.category.id);
      setDeleteDialog({ open: false, category: null, hasProducts: false });
      toast({ title: 'Categoria removida', description: 'A categoria foi removida.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao remover.', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (cat: Category) => (
        <div>
          <p className="font-medium text-foreground">{cat.name}</p>
          <p className="text-xs text-muted-foreground">{cat.slug}</p>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (cat: Category) => (
        <span className="text-muted-foreground">
          {cat.description || '—'}
        </span>
      ),
    },
    {
      key: 'products',
      header: 'Produtos',
      render: (cat: Category) => (
        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {getProductCount(cat.slug)} produtos
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Ativa',
      className: 'w-24',
      render: (cat: Category) => (
        <Switch
          checked={cat.active}
          onCheckedChange={() => handleToggleActive(cat)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (cat: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(cat)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openDeleteDialog(cat)}
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
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as categorias do cardápio
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Table */}
      <DataTable data={categories} columns={columns} emptyMessage="Nenhuma categoria encontrada" />

      {/* Form Modal */}
      <Dialog open={formModal} onOpenChange={setFormModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: editingCategory ? prev.slug : generateSlug(e.target.value),
                  }));
                }}
                placeholder="Ex: Doces"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: doces"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deleteDialog.hasProducts && <AlertTriangle className="h-5 w-5 text-warning" />}
              Remover Categoria
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deleteDialog.hasProducts ? (
              <>
                <p className="text-muted-foreground">
                  Esta categoria possui <strong>{getProductCount(deleteDialog.category?.slug || '')}</strong> produtos vinculados.
                  Escolha uma opção:
                </p>
                <div className="space-y-2">
                  <Label>Migrar produtos para:</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={migrateTarget}
                    onChange={(e) => setMigrateTarget(e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories
                      .filter((c) => c.id !== deleteDialog.category?.id && c.active)
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ou desative a categoria em vez de removê-la.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Tem certeza que deseja remover a categoria "{deleteDialog.category?.name}"?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, category: null, hasProducts: false })}>
              Cancelar
            </Button>
            {deleteDialog.hasProducts && (
              <Button
                variant="secondary"
                onClick={() => {
                  if (deleteDialog.category) handleToggleActive(deleteDialog.category);
                  setDeleteDialog({ open: false, category: null, hasProducts: false });
                }}
              >
                Desativar
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDialog.hasProducts && !migrateTarget}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
