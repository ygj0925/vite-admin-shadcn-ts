import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Search, X, RotateCcw, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/data-table'
import { getUserPage, type User, type UserPageQuery } from '@/apis/system/user'

interface UserSelectProps {
  multiple?: boolean
  value?: string | string[]
  onChange: (value: string | string[]) => void
  roleId?: string
  disabled?: boolean
}

export function UserSelect({
  multiple = false,
  value,
  onChange,
  roleId,
  disabled = false,
}: UserSelectProps) {
  // Table state
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<User[]>([])
  const [keyword, setKeyword] = useState('')
  const [deptId, setDeptId] = useState<number | undefined>()

  // Selection state: id -> User
  const [selectedMap, setSelectedMap] = useState<Map<string, User>>(new Map())

  // Initialize from value prop
  useEffect(() => {
    if (!value) {
      setSelectedMap(new Map())
      return
    }
    const ids = Array.isArray(value) ? value : [value]
    if (ids.length === 0) {
      setSelectedMap(new Map())
      return
    }
    // Keep existing entries that match, clear others
    setSelectedMap((prev) => {
      const next = new Map<string, User>()
      for (const id of ids) {
        if (prev.has(id)) {
          next.set(id, prev.get(id)!)
        }
      }
      return next
    })
  }, [value])

  // Fetch user list
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: UserPageQuery = {
        current: page,
        size,
      }
      if (keyword) {
        params.username = keyword
      }
      if (deptId) {
        params.deptId = deptId
      }
      const res = await getUserPage(params)
      setData(res.records || [])
      setTotal(res.total || 0)
    } catch {
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, keyword, deptId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle row click to toggle selection
  const handleRowClick = useCallback(
    (user: User) => {
      if (disabled) return
      const id = String(user.id)
      setSelectedMap((prev) => {
        const next = new Map(prev)
        if (multiple) {
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.set(id, user)
          }
        } else {
          if (next.has(id)) {
            next.clear()
          } else {
            next.clear()
            next.set(id, user)
          }
        }
        // Emit change
        const ids = Array.from(next.keys())
        onChange(multiple ? ids : ids[0] || '')
        return next
      })
    },
    [multiple, onChange, disabled]
  )

  // Remove a selected user
  const handleRemove = useCallback(
    (id: string) => {
      if (disabled) return
      setSelectedMap((prev) => {
        const next = new Map(prev)
        next.delete(id)
        const ids = Array.from(next.keys())
        onChange(multiple ? ids : ids[0] || '')
        return next
      })
    },
    [multiple, onChange, disabled]
  )

  // Clear all selections
  const handleClear = useCallback(() => {
    if (disabled) return
    setSelectedMap(new Map())
    onChange(multiple ? [] : '')
  }, [multiple, onChange, disabled])

  // Reset search
  const handleReset = useCallback(() => {
    setKeyword('')
    setDeptId(undefined)
    setPage(1)
  }, [])

  // Selected users list
  const selectedUsers = useMemo(() => Array.from(selectedMap.values()), [selectedMap])

  // Table columns
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'avatar',
        header: '',
        size: 40,
        cell: ({ row }) => {
          const user = row.original
          return (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback className="text-xs">
                {user.nickname?.slice(0, 1) || user.username?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )
        },
      },
      {
        accessorKey: 'username',
        header: '用户名',
      },
      {
        accessorKey: 'nickname',
        header: '昵称',
      },
      {
        accessorKey: 'deptName',
        header: '部门',
      },
    ],
    []
  )

  // Row className based on selection
  const selectedIds = useMemo(() => Array.from(selectedMap.keys()), [selectedMap])

  return (
    <div className="flex gap-4" style={{ minHeight: 400 }}>
      {/* Left: Table */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-8 pl-8"
              placeholder="搜索用户名/昵称"
              value={keyword}
              disabled={disabled}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={handleReset} disabled={disabled}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            重置
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          total={total}
          page={page}
          size={size}
          loading={loading}
          selectedIds={selectedIds}
          onPageChange={setPage}
          onSizeChange={(s) => {
            setSize(s)
            setPage(1)
          }}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Right: Selected users */}
      <Card className="w-56 shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4" />
              已选 ({selectedUsers.length})
            </CardTitle>
            {selectedUsers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClear}
                disabled={disabled}
              >
                清空
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px]">
            {selectedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-xs">暂未选择用户</p>
              </div>
            ) : (
              <div className="space-y-1 px-3 pb-3">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.nickname} />
                      <AvatarFallback className="text-[10px]">
                        {user.nickname?.slice(0, 1) || user.username?.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{user.nickname || user.username}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.deptName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-5 w-5 shrink-0"
                      onClick={() => handleRemove(String(user.id))}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
