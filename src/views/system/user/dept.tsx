import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function UserDeptPage() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedDept] = useState<any>(null)

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>部门列表</span>
            <Button size="sm">新增</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="搜索部门"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {/* 部门树节点 */}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedDept ? `${selectedDept.name} - 详情` : '请选择部门'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDept ? (
            <div>
              {/* 部门详情 */}
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
