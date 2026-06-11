import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { PageQuery, PageRes } from '@/types/api'

interface UseCrudOptions<T, Q extends PageQuery> {
  listApi: (params: Q) => Promise<{ data: PageRes<T> }>
  deleteApi?: (ids: string[]) => Promise<unknown>
  exportApi?: (params?: Q) => Promise<Blob>
  defaultPageSize?: number
  onSuccess?: () => void
}

export function useCrud<T, Q extends PageQuery>({
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

  // 把 api 函数存进 ref，避免调用方未 useCallback 包装时引用变化导致 fetchData 重建 → useEffect 重跑 → 无限请求
  const listApiRef = useRef(listApi)
  const deleteApiRef = useRef(deleteApi)
  const exportApiRef = useRef(exportApi)

  // 每次 render 同步最新的 api 引用，但不参与依赖
  listApiRef.current = listApi
  deleteApiRef.current = deleteApi
  exportApiRef.current = exportApi

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listApiRef.current(query as Q)
      setData(res.data.list)
      setTotal(res.data.total)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [query])

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
    if (!deleteApiRef.current) return
    try {
      await deleteApiRef.current(ids)
      toast.success('删除成功')
      setSelectedIds([])
      fetchData()
    } catch {
      // Error handled by HTTP interceptor
    }
  }, [fetchData])

  const handleExport = useCallback(async () => {
    if (!exportApiRef.current) return
    try {
      const blob = await exportApiRef.current(query as Q)
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
  }, [query])

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
    refresh: fetchData,
  }
}
