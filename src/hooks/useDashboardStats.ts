import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;
type Tag = Tables<'tags'>;

interface DashboardStats {
  totalProducts: number;
  availableProducts: number;
  unavailableProducts: number;
  activeCategories: number;
  totalCategories: number;
  activeTags: number;
  totalTags: number;
  productsByCategory: Array<{ name: string; count: number }>;
  recentProducts: Array<Product & { categoryName: string }>;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Buscar todas as categorias
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Buscar todas as tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Calcular estatísticas
      const totalProducts = products?.length || 0;
      const availableProducts = products?.filter(p => p.available).length || 0;
      const unavailableProducts = totalProducts - availableProducts;
      const activeCategories = categories?.filter(c => c.active).length || 0;
      const totalCategories = categories?.length || 0;
      const activeTags = tags?.filter(t => t.active).length || 0;
      const totalTags = tags?.length || 0;

      // Produtos por categoria
      const productsByCategory = categories?.map(cat => ({
        name: cat.name,
        count: products?.filter(p => p.category_slug === cat.slug).length || 0,
      })) || [];

      // Produtos recentes (últimos 5) com nome da categoria
      const recentProducts = (products?.slice(0, 5) || []).map(product => {
        const category = categories?.find(c => c.slug === product.category_slug);
        return {
          ...product,
          categoryName: category?.name || product.category_slug,
        };
      });

      setStats({
        totalProducts,
        availableProducts,
        unavailableProducts,
        activeCategories,
        totalCategories,
        activeTags,
        totalTags,
        productsByCategory,
        recentProducts,
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
