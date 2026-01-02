import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Folder,
  Tags,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Produtos', path: '/produtos', icon: Package },
  { title: 'Categorias', path: '/categorias', icon: Folder },
  { title: 'Tags', path: '/tags', icon: Tags },
  { title: 'Configurações', path: '/configuracoes', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <img
          src="/Logo.png"
          alt="Sabor Fome Logo"
          className={cn(
            "object-contain transition-all duration-300",
            collapsed ? "h-10 w-10" : "h-12 w-12"
          )}
        />
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-sidebar-foreground">Sabor Fome</h1>
            <p className="text-xs text-sidebar-foreground/60">Painel Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* User Info & Actions */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && user?.email && (
          <div className="px-2 animate-fade-in">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user.email}
            </p>
          </div>
        )}

        {/* About Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'sm'}
              className={cn(
                'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center'
              )}
            >
              <Info className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-2 animate-fade-in">Sobre</span>}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sobre o Sistema</DialogTitle>
              <DialogDescription>
                Informações sobre o Sabor Fome Admin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Sabor Fome Admin</p>
                <p className="text-sm text-muted-foreground">Versão: 1.0.0 (MVP)</p>
                <p className="text-sm text-muted-foreground">
                  Painel administrativo para gerenciamento do catálogo.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={handleLogout}
          className={cn(
            'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2 animate-fade-in">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
