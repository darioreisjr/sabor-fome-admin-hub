import { Package, Folder, Tags, TrendingUp, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral do seu catálogo Sabor Fome
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Produtos"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6" />}
        />
        <StatsCard
          title="Disponíveis"
          value={stats.availableProducts}
          description={`${stats.unavailableProducts} indisponíveis`}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Categorias Ativas"
          value={stats.activeCategories}
          description={`de ${stats.totalCategories} total`}
          icon={<Folder className="h-6 w-6" />}
        />
        <StatsCard
          title="Tags Ativas"
          value={stats.activeTags}
          description={`de ${stats.totalTags} total`}
          icon={<Tags className="h-6 w-6" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products by Category */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Produtos por Categoria
            </h2>
          </div>
          <div className="space-y-3">
            {stats.productsByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-500"
                      style={{
                        width: `${stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-foreground">
                    {cat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Produtos Recentes
            </h2>
          </div>
          <div className="space-y-3">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {product.image && product.image !== '/placeholder.svg' ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.categoryName} • R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      product.available
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {product.available ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum produto cadastrado ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
