import { useState, useCallback } from 'react'
import { getRoleDict } from '@/apis/system/role'
import type { LabelValueState } from '@/types/api'

export function useRole() {
  const [roleList, setRoleList] = useState<LabelValueState[]>([])
  const [loading, setLoading] = useState(false)

  const getRoleList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRoleDict()
      setRoleList(res.data)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  return { roleList, getRoleList, loading }
}
