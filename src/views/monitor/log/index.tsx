import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginLogPage from './login/index'
import OperationLogPage from './operation/index'

export default function MonitorLogPage() {
  const [activeTab, setActiveTab] = useState('operation')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">系统日志</h1>
        <p className="text-sm text-muted-foreground mt-1">查看系统操作日志和登录日志</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="operation">操作日志</TabsTrigger>
          <TabsTrigger value="login">登录日志</TabsTrigger>
        </TabsList>

        <TabsContent value="operation"><OperationLogPage /></TabsContent>
        <TabsContent value="login"><LoginLogPage /></TabsContent>
      </Tabs>
    </div>
  )
}
