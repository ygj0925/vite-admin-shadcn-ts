import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MonitorLogPage() {
  const [activeTab, setActiveTab] = useState('operation')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">监控日志</h1>
        <p className="text-sm text-muted-foreground mt-1">查看系统操作日志和登录日志</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="operation">操作日志</TabsTrigger>
          <TabsTrigger value="login">登录日志</TabsTrigger>
        </TabsList>

        <TabsContent value="operation">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 操作日志列表 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>登录日志</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 登录日志列表 */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
