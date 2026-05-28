import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DictTreePage() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedDict] = useState<any>(null)

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>字典列表</span>
            <Button size="sm">新增</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="搜索字典"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {/* 字典树节点 */}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedDict ? `${selectedDict.name} - 字典项` : '请选择字典'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDict ? (
            <div>
              {/* 字典项列表 */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              请从左侧选择字典
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
