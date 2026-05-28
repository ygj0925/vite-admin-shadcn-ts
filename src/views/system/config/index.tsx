import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState('site')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">系统配置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统各项配置</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="site">站点配置</TabsTrigger>
          <TabsTrigger value="login">登录配置</TabsTrigger>
          <TabsTrigger value="security">安全配置</TabsTrigger>
          <TabsTrigger value="mail">邮件配置</TabsTrigger>
          <TabsTrigger value="sms">短信配置</TabsTrigger>
          <TabsTrigger value="storage">存储配置</TabsTrigger>
          <TabsTrigger value="client">客户端配置</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>站点配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 站点配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>登录配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 登录配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 安全配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>邮件配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 邮件配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>短信配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 短信配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>存储配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 存储配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client">
          <Card>
            <CardHeader>
              <CardTitle>客户端配置</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 客户端配置内容 */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
