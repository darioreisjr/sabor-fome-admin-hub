import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;
export type ProductUpdate = TablesUpdate<'products'>;

export type ProductWithTags = Product & {
  tags: string[];
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (productsError) throw productsError;

      // Fetch product_tags
      const { data: productTags, error: tagsError } = await supabase
        .from('product_tags')
        .select('product_id, tag_slug');
      
      if (tagsError) throw tagsError;

      // Map tags to products
      const productsWithTags: ProductWithTags[] = products.map(product => ({
        ...product,
        tags: productTags
          .filter(pt => pt.product_id === product.id)
          .map(pt => pt.tag_slug),
      }));

      return productsWithTags;
    },
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (productError) throw productError;
      if (!product) return null;

      const { data: productTags, error: tagsError } = await supabase
        .from('product_tags')
        .select('tag_slug')
        .eq('product_id', id);
      
      if (tagsError) throw tagsError;

      return {
        ...product,
        tags: productTags.map(pt => pt.tag_slug),
      } as ProductWithTags;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ product, tags }: { product: ProductInsert; tags: string[] }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;

      // Insert product tags
      if (tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('product_tags')
          .insert(tags.map(tagSlug => ({
            product_id: data.id,
            tag_slug: tagSlug,
          })));
        
        if (tagsError) throw tagsError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates, tags }: { id: string; updates: ProductUpdate; tags: string[] }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Delete existing tags
      await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', id);

      // Insert new tags
      if (tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('product_tags')
          .insert(tags.map(tagSlug => ({
            product_id: id,
            tag_slug: tagSlug,
          })));
        
        if (tagsError) throw tagsError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete product tags first (cascade should handle this, but being explicit)
      await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', id);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProductTags = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ oldTagSlug, newTagSlug }: { oldTagSlug: string; newTagSlug: string }) => {
      const { error } = await supabase
        .from('product_tags')
        .update({ tag_slug: newTagSlug })
        .eq('tag_slug', oldTagSlug);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProductTagsBySlug = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tagSlug: string) => {
      const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('tag_slug', tagSlug);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProductsCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ oldCategorySlug, newCategorySlug }: { oldCategorySlug: string; newCategorySlug: string }) => {
      const { error } = await supabase
        .from('products')
        .update({ category_slug: newCategorySlug })
        .eq('category_slug', oldCategorySlug);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
