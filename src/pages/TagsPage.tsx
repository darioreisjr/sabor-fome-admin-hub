import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { TagCard } from '@/components/admin/TagCard';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, Tag } from '@/hooks/useTags';
import { useProducts, useUpdateProductTags, useDeleteProductTagsBySlug } from '@/hooks/useProducts';
import { generateSlug } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function TagsPage() {
  const { toast } = useToast();
  const { data: tags = [], isLoading } = useTags();
  const { data: products = [] } = useProducts();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const updateProductTags = useUpdateProductTags();
  const deleteProductTagsBySlug = useDeleteProductTagsBySlug();

  // Modal states
  const [formModal, setFormModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', color: '#f59e0b' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tag: Tag | null;
    hasProducts: boolean;
  }>({ open: false, tag: null, hasProducts: false });

  const getProductCount = (tagSlug: string) => {
    return products.filter((p) => p.tags.includes(tagSlug)).length;
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setForm({ name: '', slug: '', color: '#f59e0b' });
    setErrors({});
    setFormModal(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setForm({ name: tag.name, slug: tag.slug, color: tag.color });
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
      const slugExists = tags.some(t => t.slug === form.slug && t.id !== editingTag?.id);
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
      if (editingTag) {
        // Update product_tags if slug changed
        if (editingTag.slug !== form.slug) {
          await updateProductTags.mutateAsync({
            oldTagSlug: editingTag.slug,
            newTagSlug: form.slug,
          });
        }

        await updateTag.mutateAsync({
          id: editingTag.id,
          updates: { name: form.name, slug: form.slug, color: form.color },
        });
        toast({ title: 'Tag atualizada', description: `${form.name} foi atualizada.` });
      } else {
        await createTag.mutateAsync({
          slug: form.slug,
          name: form.name,
          color: form.color,
          active: true,
        });
        toast({ title: 'Tag criada', description: `${form.name} foi criada.` });
      }
      setFormModal(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (tag: Tag) => {
    try {
      await updateTag.mutateAsync({
        id: tag.id,
        updates: { active: !tag.active },
      });
      toast({
        title: tag.active ? 'Tag desativada' : 'Tag ativada',
        description: `${tag.name} foi ${tag.active ? 'desativada' : 'ativada'}.`,
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro.', variant: 'destructive' });
    }
  };

  const openDeleteDialog = (tag: Tag) => {
    const hasProducts = getProductCount(tag.slug) > 0;
    setDeleteDialog({ open: true, tag, hasProducts });
  };

  const handleDelete = async (removeFromProducts = false) => {
    if (!deleteDialog.tag) return;

    try {
      if (removeFromProducts) {
        await deleteProductTagsBySlug.mutateAsync(deleteDialog.tag.slug);
      }

      await deleteTag.mutateAsync(deleteDialog.tag.id);
      setDeleteDialog({ open: false, tag: null, hasProducts: false });
      toast({ title: 'Tag removida', description: 'A tag foi removida.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao remover.', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'color',
      header: '',
      className: 'w-12',
      render: (tag: Tag) => (
        <div
          className="h-6 w-6 rounded-full border border-border"
          style={{ backgroundColor: tag.color }}
        />
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      render: (tag: Tag) => (
        <div>
          <p className="font-medium text-foreground">{tag.name}</p>
          <p className="text-xs text-muted-foreground">{tag.slug}</p>
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Produtos',
      render: (tag: Tag) => (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
        >
          {getProductCount(tag.slug)} produtos
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Ativa',
      className: 'w-24',
      render: (tag: Tag) => (
        <Switch
          checked={tag.active}
          onCheckedChange={() => handleToggleActive(tag)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (tag: Tag) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(tag)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openDeleteDialog(tag)}
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
          <h1 className="text-3xl font-bold text-foreground">Tags</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as tags dos produtos
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tag
        </Button>
      </div>

      {/* Table / Cards */}
      <DataTable
        data={tags}
        columns={columns}
        emptyMessage="Nenhuma tag encontrada"
        mobileCard={(tag) => (
          <TagCard
            tag={tag}
            productCount={getProductCount(tag.slug)}
            onToggleActive={handleToggleActive}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
          />
        )}
      />

      {/* Form Modal */}
      <Dialog open={formModal} onOpenChange={setFormModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Editar Tag' : 'Nova Tag'}
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
                    slug: editingTag ? prev.slug : generateSlug(e.target.value),
                  }));
                }}
                placeholder="Ex: Mais vendido"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: mais_vendido"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="h-10 w-20 cursor-pointer p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTag ? 'Salvar' : 'Criar'}
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
              Remover Tag
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deleteDialog.hasProducts ? (
              <>
                <p className="text-muted-foreground">
                  Esta tag está sendo usada por <strong>{getProductCount(deleteDialog.tag?.slug || '')}</strong> produtos.
                  Escolha uma opção:
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                  <li>Remover a tag de todos os produtos e excluí-la</li>
                  <li>Desativar a tag (mantém nos produtos)</li>
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">
                Tem certeza que deseja remover a tag "{deleteDialog.tag?.name}"?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, tag: null, hasProducts: false })}>
              Cancelar
            </Button>
            {deleteDialog.hasProducts ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (deleteDialog.tag) handleToggleActive(deleteDialog.tag);
                    setDeleteDialog({ open: false, tag: null, hasProducts: false });
                  }}
                >
                  Desativar
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(true)}>
                  Remover de tudo
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={() => handleDelete(false)}>
                Remover
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
