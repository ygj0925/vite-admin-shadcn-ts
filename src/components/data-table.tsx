import { useState, memo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  total?: number
  page?: number
  size?: number
  loading?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onPageChange?: (page: number) => void
  onSizeChange?: (size: number) => void
  onRowClick?: (row: T) => void
}

function DataTableInner<T extends Record<string, any>>({
  columns,
  data,
  total = 0,
  page = 1,
  size = 10,
  loading,
  selectedIds = [],
  onSelectionChange,
  onPageChange,
  onSizeChange,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      const ids = Object.keys(newSelection).filter((k) => newSelection[k]).map((k) => String(data[Number(k)]?.id))
      onSelectionChange?.(ids)
    },
    state: { sorting, columnFilters, columnVisibility, columnSizing, rowSelection },
  })

  const totalPages = Math.ceil(total / size)

  return (
    <div className="space-y-3">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-xs text-muted-foreground">已选 {selectedIds.length} 项</span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Settings2 className="h-3.5 w-3.5" /> 列设置
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(v) => column.toggleVisibility(v)}
                onSelect={(e) => e.preventDefault()}
              >
                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded border overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: table.getCenterTotalSize() }}>
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned()
                  const isActions = header.column.id === 'actions'
                  return (
                    <th
                      key={header.id}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground relative"
                      style={{
                        minWidth: header.getSize(),
                        ...(isPinned ? { position: 'sticky', right: 0, zIndex: 2, background: 'hsl(var(--background))' } : {}),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'flex cursor-pointer select-none items-center gap-1' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                            header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> : null
                          )}
                        </div>
                      )}
                      {!isActions && header.column.getCanResize() && (
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none hover:bg-primary/30"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-2 h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-2 h-24 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned()
                    return (
                      <td
                        key={cell.id}
                        className="p-2 align-middle whitespace-nowrap"
                        style={{
                          minWidth: cell.column.getSize(),
                          ...(isPinned ? { position: 'sticky', right: 0, zIndex: 1, background: 'hsl(var(--background))' } : {}),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 无分页参数时（如 tree/list 模式）整行隐藏 */}
      {(onPageChange || onSizeChange) && (
        <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">每页</span>
          <Select value={String(size)} onValueChange={(v) => onSizeChange?.(Number(v))}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">条</span>
        </div>
        <span className="text-xs text-muted-foreground">共 {total} 条</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            if (p > totalPages) return null
            return (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      )}
    </div>
  )
}

// React.memo 默认浅比较 props。调用方应该用 useMemo 稳定 columns，
// useCallback 稳定 onPageChange/onSizeChange/onSelectionChange/onRowClick。
// 类型断言保留泛型签名（memo 包装泛型组件的官方推荐做法）
export const DataTable = memo(DataTableInner) as typeof DataTableInner
