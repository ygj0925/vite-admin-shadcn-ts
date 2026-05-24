import { useState, useCallback } from 'react'
import { getMenuDictTree } from '@/apis/system/menu'
import { getPackageMenuTree } from '@/apis/tenant/package'

export function useMenu() {
  const [menuList, setMenuList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const getMenuList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMenuDictTree()
      setMenuList(res.data)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  const getPackageMenuList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPackageMenuTree()
      setMenuList(res.data)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  return { menuList, getMenuList, getPackageMenuList, loading }
}
