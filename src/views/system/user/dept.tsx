import { useEffect, useState, useMemo } from 'react'
import { Search, ChevronRight, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDept } from '@/hooks/use-dept'
import { cn } from '@/lib/utils'
import type { LabelValueState } from '@/types/api'

/** 递归过滤树 */
function filterTree(nodes: LabelValueState[], keyword: string): LabelValueState[] {
  if (!keyword) return nodes
  const lower = keyword.toLowerCase()
  const result: LabelValueState[] = []
  for (const node of nodes) {
    const children = node.children ? filterTree(node.children, keyword) : []
    if (node.label.toLowerCase().includes(lower) || children.length > 0) {
      result.push({ ...node, children: children.length > 0 ? children : undefined })
    }
  }
  return result
}

/** 递归展开所有节点 ID */
function getAllKeys(nodes: LabelValueState[]): (string | number)[] {
  const keys: (string | number)[] = []
  for (const node of nodes) {
    keys.push(node.value)
    if (node.children) keys.push(...getAllKeys(node.children))
  }
  return keys
}

function TreeNode({
  node, depth, expanded, selectedId, onToggle, onSelect,
}: {
  node: LabelValueState
  depth: number
  expanded: Set<string | number>
  selectedId: string | number | null
  onToggle: (id: string | number) => void
  onSelect: (id: string | number, node: LabelValueState) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.value)
  const isSelected = selectedId === node.value

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) onToggle(node.value)
          onSelect(node.value, node)
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          'hover:bg-accent hover:text-foreground',
          isSelected && 'bg-accent text-foreground font-medium'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
        ) : (
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.value} node={child} depth={depth + 1} expanded={expanded}
              selectedId={selectedId} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserDeptPage() {
  const { deptList, getDeptList, loading } = useDept()
  const [searchKey, setSearchKey] = useState('')
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set())
  const [selectedDept, setSelectedDept] = useState<LabelValueState | null>(null)

  useEffect(() => { getDeptList() }, [getDeptList])

  useEffect(() => {
    if (deptList.length > 0 && expanded.size === 0) {
      setExpanded(new Set(getAllKeys(deptList)))
    }
  }, [deptList])

  const filteredTree = useMemo(() => filterTree(deptList, searchKey), [deptList, searchKey])

  const handleToggle = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">部门列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索部门..." value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="h-8 pl-8 text-sm" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="px-1 pb-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredTree.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无部门数据</div>
              ) : (
                filteredTree.map((node) => (
                  <TreeNode key={node.value} node={node} depth={0} expanded={expanded}
                    selectedId={selectedDept?.value ?? null} onToggle={handleToggle}
                    onSelect={(_, n) => setSelectedDept(n)} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDept ? `${selectedDept.label} - 详情` : '请选择部门'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDept ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">部门名称</span>
                  <p className="mt-1 font-medium">{selectedDept.label}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">部门 ID</span>
                  <p className="mt-1 font-medium">{String(selectedDept.value)}</p>
                </div>
              </div>
              <Badge variant="outline">子部门: {selectedDept.children?.length ?? 0} 个</Badge>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              请从左侧选择部门
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
