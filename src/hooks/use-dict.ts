import { useState, useEffect } from 'react'
import { useDictStore } from '@/stores/dict'
import type { LabelValueState } from '@/types/api'

export function useDict(code: string) {
  const [options, setOptions] = useState<LabelValueState[]>([])
  const [loading, setLoading] = useState(false)
  const fetchDict = useDictStore((s) => s.fetchDict)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    fetchDict(code)
      .then(setOptions)
      .finally(() => setLoading(false))
  }, [code, fetchDict])

  return { options, loading }
}
