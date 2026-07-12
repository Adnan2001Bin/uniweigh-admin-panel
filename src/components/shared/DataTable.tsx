import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { cn } from "@/src/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  /** Render cell content in JetBrains Mono with tabular numerals (IDs, weights, money). */
  mono?: boolean;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

export interface DataTableSort {
  key: string;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: DataTableSort;
  empty?: React.ReactNode;
  footer?: React.ReactNode;
  stickyHeader?: boolean;
  dense?: boolean;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  empty,
  footer,
  stickyHeader,
  dense,
  rowClassName,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10")}>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => {
              const isSorted = sort && sort.key === col.key;
              return (
                <TableHead
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(alignClass[col.align ?? "left"], col.headClassName)}
                >
                  {col.sortable && sort ? (
                    <button
                      type="button"
                      onClick={() => sort.onSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 uppercase tracking-wider font-semibold cursor-pointer hover:text-foreground transition-colors",
                        isSorted && "text-foreground"
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                {empty ?? "No records found."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer", rowClassName?.(row))}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass[col.align ?? "left"],
                      col.mono && "font-mono tabular-nums",
                      dense && "py-1.5",
                      col.cellClassName
                    )}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
