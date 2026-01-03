import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Folder,
  Tags,
  Settings,
  LogOut,
  Info,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
      setIsOpen(false);
    } catch (error: any) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 active:scale-95 md:hidden"
            aria-label="Abrir menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="h-[80vh] rounded-t-2xl p-0"
        >
          <SheetHeader className="border-b p-6">
            <div className="flex items-center gap-3">
              <img
                src="/Logo.png"
                alt="Sabor Fome Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <SheetTitle className="text-left">Sabor Fome</SheetTitle>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex h-[calc(100%-5rem)] flex-col">
            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-auto p-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:bg-accent hover:text-foreground active:scale-[0.98]'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Info & Actions */}
            <div className="border-t p-4 space-y-3">
              {user?.email && (
                <div className="px-2">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}

              {/* About Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Info className="h-4 w-4 shrink-0" />
                    <span className="ml-2">Sobre</span>
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
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="ml-2">Sair</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
