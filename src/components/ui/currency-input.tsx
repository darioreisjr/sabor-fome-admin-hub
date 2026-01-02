import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [isFocused, setIsFocused] = React.useState(false);
    const isInitialized = React.useRef(false);

    // Formata número para moeda brasileira (apenas para exibição quando desfocado)
    const formatCurrency = (value: number): string => {
      return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    // Converte string para número
    const parseToNumber = (str: string): number => {
      // Remove tudo exceto números e vírgula
      const cleanValue = str.replace(/[^\d,]/g, '');
      // Substitui vírgula por ponto
      const normalized = cleanValue.replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) ? 0 : num;
    };

    // Inicializa o valor apenas uma vez ou quando o componente não está focado
    React.useEffect(() => {
      if (!isInitialized.current) {
        setDisplayValue(formatCurrency(value || 0));
        isInitialized.current = true;
      } else if (!isFocused && value !== parseToNumber(displayValue)) {
        setDisplayValue(formatCurrency(value || 0));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove tudo exceto números, vírgula e ponto
      inputValue = inputValue.replace(/[^\d,]/g, '');

      // Garante apenas uma vírgula
      const commaCount = (inputValue.match(/,/g) || []).length;
      if (commaCount > 1) {
        const firstCommaIndex = inputValue.indexOf(',');
        inputValue = inputValue.substring(0, firstCommaIndex + 1) +
                     inputValue.substring(firstCommaIndex + 1).replace(/,/g, '');
      }

      // Limita a 2 casas decimais após a vírgula
      const parts = inputValue.split(',');
      if (parts.length === 2 && parts[1].length > 2) {
        inputValue = parts[0] + ',' + parts[1].substring(0, 2);
      }

      // Formata com separador de milhares apenas enquanto digita
      if (inputValue) {
        const [integerPart, decimalPart] = inputValue.split(',');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const formatted = decimalPart !== undefined
          ? `${formattedInteger},${decimalPart}`
          : formattedInteger;

        setDisplayValue(formatted);
        onValueChange(parseToNumber(formatted));
      } else {
        setDisplayValue('');
        onValueChange(0);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Remove formatação de moeda para facilitar edição
      const numValue = parseToNumber(displayValue);
      if (numValue === 0) {
        setDisplayValue('');
      }
      // Seleciona todo o texto
      setTimeout(() => e.target.select(), 0);
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Formata como moeda quando perde o foco
      const numValue = parseToNumber(displayValue);
      setDisplayValue(formatCurrency(numValue));
      // Garante que o valor numérico seja atualizado
      onValueChange(numValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          R$
        </span>
        <Input
          type="text"
          inputMode="decimal"
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn("pl-10", className)}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
