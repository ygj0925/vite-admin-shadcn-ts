import { useState, useCallback } from 'react'
import { getDeptDictTree } from '@/apis/system/dept'
import type { LabelValueState } from '@/types/api'

export function useDept() {
  const [deptList, setDeptList] = useState<LabelValueState[]>([])
  const [loading, setLoading] = useState(false)

  const getDeptList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDeptDictTree()
      setDeptList(res.data)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  return { deptList, getDeptList, loading }
}
