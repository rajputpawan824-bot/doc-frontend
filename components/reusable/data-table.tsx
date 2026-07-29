// components/ui/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  Row  ,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Settings2, Eye } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  page?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  searchColumn?: string;
  searchPlaceholder?: string;
  emptyMessage?: string | ReactNode;
  onRowClick?: (rowData: TData) => void;
  showViewButton?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  page = 1,
  total = data.length,
  onPageSizeChange,
  pageSize = 10,
  onPageChange,
  searchColumn,
  searchPlaceholder = "Search...",
  emptyMessage = "No results.",
  onRowClick,
  showViewButton = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    return columns.reduce((visibility, column) => {
    const columnId = column.id;
      if (columnId === "searchIndex") {
        visibility[columnId] = false;
      }
      return visibility;
    }, {} as VisibilityState);
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");


  // Add a "View" column if showViewButton is true
  const tableColumns = showViewButton
    ? [
        {
          id: "actions",
          header: "Actions",
         cell: ({ row }: { row: Row<TData> }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRowClick?.(row.original)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          ),
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns as ColumnDef<TData, TValue>[],
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
  
    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const searchColumnObj = searchColumn ? table.getColumn(searchColumn) : null;


  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1 w-full">
          {searchColumnObj && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (searchColumnObj.getFilterValue() as string) || globalFilter
                }
                onChange={(event) => {
                  searchColumnObj.setFilterValue(event.target.value);
                  setGlobalFilter(event.target.value);
                }}
                className="pl-10"
              />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
          {table.getRowModel().rows.length ? (
  table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }
                  onClick={() => {
                    if (onRowClick && !showViewButton) {
                      onRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center space-x-2">
<Button
  variant="outline"
  size="sm"
  onClick={() => onPageChange?.(page - 1)}
  disabled={page <= 1}
>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
<strong>
  {page} of {Math.ceil(total / pageSize)}
</strong>
          </div>
<Button
  variant="outline"
  size="sm"
  onClick={() => onPageChange?.(page + 1)}
  disabled={page >= Math.ceil(total / pageSize)}
>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
<select
  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
  value={pageSize}
  onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
>
  {[10, 20, 30, 40, 50].map((size) => (
    <option key={size} value={size}>
      Show {size}
    </option>
  ))}
</select>
        </div>
      </div>
    </div>
  );
}

// Add Search icon component
const Search = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
