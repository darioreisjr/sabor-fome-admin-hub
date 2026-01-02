import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [units, setUnits] = useState('un, fatia, porcao, combo, 50ml, 200ml, 300ml, 350ml, 400ml, 500ml');
  const [currency, setCurrency] = useState('BRL');

  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'Suas preferências foram atualizadas.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Preferências gerais do sistema
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Units */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Unidades de Medida
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="units">Unidades permitidas</Label>
              <Input
                id="units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="un, fatia, porcao..."
              />
              <p className="text-xs text-muted-foreground">
                Separe as unidades por vírgula
              </p>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Moeda
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda padrão</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="BRL"
              />
              <p className="text-xs text-muted-foreground">
                Código ISO da moeda (ex: BRL, USD)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}
