import { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  [key: string]: unknown
}

interface CheckboxTreeProps {
  data: TreeNode[]
  checked: string[]
  onCheckedChange: (checked: string[]) => void
  className?: string
}

function getAllIds(nodes: TreeNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    ids.push(String(node.id))
    if (node.children?.length) {
      ids.push(...getAllIds(node.children))
    }
  }
  return ids
}

function getChildIds(node: TreeNode): string[] {
  const ids: string[] = []
  if (node.children) {
    for (const child of node.children) {
      ids.push(String(child.id))
      ids.push(...getChildIds(child))
    }
  }
  return ids
}

function getParentMap(nodes: TreeNode, parent?: TreeNode): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>()
  if (parent) map.set(String(nodes.id), parent)
  if (nodes.children) {
    for (const child of nodes.children) {
      const childMap = getParentMap(child, nodes)
      for (const [k, v] of childMap) map.set(k, v)
    }
  }
  return map
}

function buildParentMap(nodes: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>()
  for (const node of nodes) {
    const nodeMap = getParentMap(node)
    for (const [k, v] of nodeMap) map.set(k, v)
  }
  return map
}

function TreeCheckboxItem({
  node,
  depth,
  checked,
  onToggle,
  expanded,
  onToggleExpand,
}: {
  node: TreeNode
  depth: number
  checked: Set<string>
  onToggle: (id: string) => void
  expanded: Set<string>
  onToggleExpand: (id: string) => void
}) {
  const id = String(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(id)

  const childIds = useMemo(() => (hasChildren ? getChildIds(node) : []), [node, hasChildren])
  const allChildrenChecked = hasChildren && childIds.length > 0 && childIds.every((cid) => checked.has(cid))
  const someChildrenChecked = hasChildren && childIds.some((cid) => checked.has(cid))

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent',
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex h-4 w-4 shrink-0 items-center justify-center"
            onClick={() => onToggleExpand(id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Checkbox
          checked={allChildrenChecked ? true : someChildrenChecked ? 'indeterminate' : checked.has(id)}
          onCheckedChange={() => onToggle(id)}
        />
        <span className="text-sm">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeCheckboxItem
              key={child.id}
              node={child}
              depth={depth + 1}
              checked={checked}
              onToggle={onToggle}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CheckboxTree({ data, checked, onCheckedChange, className }: CheckboxTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    for (const node of data) {
      if (node.children?.length) ids.add(String(node.id))
    }
    return ids
  })

  const parentMap = useMemo(() => buildParentMap(data), [data])

  const handleToggle = useCallback(
    (id: string) => {
      const checkedSet = new Set(checked)
      const allIds = getAllIds(data)
      const node = findNode(data, id)

      if (checkedSet.has(id)) {
        // Uncheck: remove this node and all descendants
        checkedSet.delete(id)
        if (node) {
          for (const cid of getChildIds(node)) {
            checkedSet.delete(cid)
          }
        }
        // Uncheck ancestors if no children remain checked
        let current = parentMap.get(id)
        while (current) {
          const parentId = String(current.id)
          const cIds = getChildIds(current)
          if (!cIds.some((cid) => checkedSet.has(cid))) {
            checkedSet.delete(parentId)
          }
          current = parentMap.get(parentId)
        }
      } else {
        // Check: add this node and all descendants
        checkedSet.add(id)
        if (node) {
          for (const cid of getChildIds(node)) {
            checkedSet.add(cid)
          }
        }
        // Check ancestors if all children are checked
        let current = parentMap.get(id)
        while (current) {
          const parentId = String(current.id)
          const cIds = getChildIds(current)
          if (cIds.every((cid) => checkedSet.has(cid))) {
            checkedSet.add(parentId)
          }
          current = parentMap.get(parentId)
        }
      }

      onCheckedChange(Array.from(checkedSet).filter((cid) => allIds.includes(cid)))
    },
    [checked, data, parentMap, onCheckedChange],
  )

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className={cn('max-h-[400px] overflow-y-auto', className)}>
      {data.map((node) => (
        <TreeCheckboxItem
          key={node.id}
          node={node}
          depth={0}
          checked={new Set(checked)}
          onToggle={handleToggle}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  )
}

function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (String(node.id) === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return undefined
}
