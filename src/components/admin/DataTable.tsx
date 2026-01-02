import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'Nenhum item encontrado',
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
