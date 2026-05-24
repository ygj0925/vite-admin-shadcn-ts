import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { PageQuery, PageRes } from '@/types/api'

interface UseCrudOptions<T, Q extends PageQuery> {
  listApi: (params: Q) => Promise<{ data: PageRes<T> }>
  deleteApi?: (ids: string[]) => Promise<unknown>
  exportApi?: (params?: Q) => Promise<Blob>
  defaultPageSize?: number
  onSuccess?: () => void
}

export function useCrud<T extends { id: string | number }, Q extends PageQuery>({
  listApi,
  deleteApi,
  exportApi,
  defaultPageSize = 10,
}: UseCrudOptions<T, Q>) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<Partial<Q>>({ page: 1, size: defaultPageSize } as Partial<Q>)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listApi(query as Q)
      setData(res.data.list)
      setTotal(res.data.total)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [query, listApi])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = useCallback((searchQuery: Partial<Q>) => {
    setQuery((prev) => ({ ...prev, ...searchQuery, page: 1 }))
  }, [])

  const handleReset = useCallback(() => {
    setQuery({ page: 1, size: defaultPageSize } as Partial<Q>)
  }, [defaultPageSize])

  const handlePageChange = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const handleSizeChange = useCallback((size: number) => {
    setQuery((prev) => ({ ...prev, size, page: 1 }))
  }, [])

  const handleDelete = useCallback(async (ids: string[]) => {
    if (!deleteApi) return
    try {
      await deleteApi(ids)
      toast.success('删除成功')
      setSelectedIds([])
      fetchData()
    } catch {
      // Error handled by HTTP interceptor
    }
  }, [deleteApi, fetchData])

  const handleExport = useCallback(async () => {
    if (!exportApi) return
    try {
      const blob = await exportApi(query as Q)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch {
      // Error handled by HTTP interceptor
    }
  }, [exportApi, query])

  return {
    data,
    total,
    loading,
    query,
    selectedIds,
    setSelectedIds,
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleDelete,
    handleExport,
  }
}
