import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { useTags, useCreateTag } from '@/hooks/useTags';
import { generateSlug, unitOptions } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  slug: string;
  category_slug: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  tags: string[];
  available: boolean;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = id && id !== 'novo';

  const { data: existingProduct, isLoading: productLoading } = useProduct(isEditing ? id : undefined);
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createCategory = useCreateCategory();
  const createTag = useCreateTag();

  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    category_slug: '',
    price: 0,
    unit: 'un',
    image: '/placeholder.svg',
    description: '',
    tags: [],
    available: true,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal states
  const [categoryModal, setCategoryModal] = useState(false);
  const [tagModal, setTagModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [newTag, setNewTag] = useState({ name: '', slug: '', color: '#f59e0b' });

  // Load product if editing
  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name,
        slug: existingProduct.slug,
        category_slug: existingProduct.category_slug || '',
        price: existingProduct.price,
        unit: existingProduct.unit,
        image: existingProduct.image || '/placeholder.svg',
        description: existingProduct.description || '',
        tags: existingProduct.tags,
        available: existingProduct.available,
      });
    }
  }, [existingProduct]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, isEditing]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!form.slug) {
      newErrors.slug = 'Slug é obrigatório';
    }
    if (!form.category_slug) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (form.price <= 0) {
      newErrors.price = 'Preço deve ser maior que 0';
    }
    if (!form.unit) {
      newErrors.unit = 'Unidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (createAnother = false) => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await updateProduct.mutateAsync({
          id,
          updates: {
            name: form.name,
            slug: form.slug,
            category_slug: form.category_slug,
            price: form.price,
            unit: form.unit,
            image: form.image,
            description: form.description,
            available: form.available,
          },
          tags: form.tags,
        });
        toast({ title: 'Produto atualizado', description: `${form.name} foi atualizado com sucesso.` });
      } else {
        await createProduct.mutateAsync({
          product: {
            name: form.name,
            slug: form.slug,
            category_slug: form.category_slug,
            price: form.price,
            unit: form.unit,
            image: form.image,
            description: form.description,
            available: form.available,
          },
          tags: form.tags,
        });
        toast({ title: 'Produto criado', description: `${form.name} foi criado com sucesso.` });
      }

      if (createAnother) {
        setForm({
          name: '',
          slug: '',
          category_slug: form.category_slug,
          price: 0,
          unit: 'un',
          image: '/placeholder.svg',
          description: '',
          tags: [],
          available: true,
        });
      } else {
        navigate('/produtos');
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) return;

    const slug = newCategory.slug || generateSlug(newCategory.name);
    const slugExists = categories.some(c => c.slug === slug);
    if (slugExists) {
      toast({ title: 'Erro', description: 'Este slug de categoria já existe.', variant: 'destructive' });
      return;
    }

    try {
      await createCategory.mutateAsync({
        slug,
        name: newCategory.name,
        description: newCategory.description,
        active: true,
      });
      setForm((prev) => ({ ...prev, category_slug: slug }));
      setCategoryModal(false);
      setNewCategory({ name: '', slug: '', description: '' });
      toast({ title: 'Categoria criada', description: `${newCategory.name} foi criada com sucesso.` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao criar a categoria.', variant: 'destructive' });
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name) return;

    const slug = newTag.slug || generateSlug(newTag.name);
    const slugExists = tags.some(t => t.slug === slug);
    if (slugExists) {
      toast({ title: 'Erro', description: 'Este slug de tag já existe.', variant: 'destructive' });
      return;
    }

    try {
      await createTag.mutateAsync({
        slug,
        name: newTag.name,
        color: newTag.color,
        active: true,
      });
      setForm((prev) => ({ ...prev, tags: [...prev.tags, slug] }));
      setTagModal(false);
      setNewTag({ name: '', slug: '', color: '#f59e0b' });
      toast({ title: 'Tag criada', description: `${newTag.name} foi criada com sucesso.` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao criar a tag.', variant: 'destructive' });
    }
  };

  const toggleTag = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(slug)
        ? prev.tags.filter((t) => t !== slug)
        : [...prev.tags, slug],
    }));
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/produtos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEditing ? 'Atualize as informações do produto' : 'Preencha os dados para criar um novo produto'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identification */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Identificação</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Brigadeiro Gourmet"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Ex: brigadeiro-gourmet"
                  className={errors.slug ? 'border-destructive' : ''}
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Classificação</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.category_slug}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, category_slug: v }))}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c.active).map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setCategoryModal(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setTagModal(true)}>
                    <Plus className="mr-1 h-3 w-3" />
                    Nova tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.filter((t) => t.active).map((tag) => (
                    <label
                      key={tag.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={form.tags.includes(tag.slug)}
                        onCheckedChange={() => toggleTag(tag.slug)}
                      />
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Price and Unit */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Preço e Unidade</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <CurrencyInput
                  id="price"
                  value={form.price}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
                  placeholder="0,00"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, unit: v }))}
                >
                  <SelectTrigger className={errors.unit ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Descrição</h2>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o produto..."
              rows={4}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {form.description.length}/300 caracteres
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Imagem</h2>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            />
          </div>

          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Disponível</p>
                <p className="text-sm text-muted-foreground">
                  Produto visível no cardápio
                </p>
              </div>
              <Switch
                checked={form.available}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, available: checked }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSubmit()} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
            {!isEditing && (
              <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
                Salvar e criar outro
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate('/produtos')}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Dialog open={categoryModal} onOpenChange={setCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="Ex: Doces"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={newCategory.slug}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: doces"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory}>Criar categoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Modal */}
      <Dialog open={tagModal} onOpenChange={setTagModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag((prev) => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="Ex: Mais vendido"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={newTag.slug}
                onChange={(e) => setNewTag((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: mais_vendido"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag((prev) => ({ ...prev, color: e.target.value }))}
                  className="h-10 w-20 cursor-pointer p-1"
                />
                <Input
                  value={newTag.color}
                  onChange={(e) => setNewTag((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTag}>Criar tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
