import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RoleTreePage() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedRole] = useState<any>(null)

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>角色列表</span>
            <Button size="sm">新增</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="搜索角色"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {/* 角色树节点 */}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedRole ? `${selectedRole.name} - 详情` : '请选择角色'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRole ? (
            <div>
              {/* 角色详情 */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              请从左侧选择角色
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
