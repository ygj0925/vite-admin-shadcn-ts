import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SiteConfigPage from './site/index'
import LoginConfigPage from './login/index'
import SecurityConfigPage from './security/index'
import MailConfigPage from './mail/index'
import SmsConfigPage from './sms/index'
import StorageConfigPage from './storage/index'
import ClientConfigPage from './client/index'

const TAB_MAP: Record<string, string> = {
  site: '站点配置',
  login: '登录配置',
  security: '安全配置',
  mail: '邮件配置',
  sms: '短信配置',
  storage: '存储配置',
  client: '客户端配置',
}

export default function SystemConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'site')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && TAB_MAP[tab]) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">系统配置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统各项配置</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="site">站点配置</TabsTrigger>
          <TabsTrigger value="login">登录配置</TabsTrigger>
          <TabsTrigger value="security">安全配置</TabsTrigger>
          <TabsTrigger value="mail">邮件配置</TabsTrigger>
          <TabsTrigger value="sms">短信配置</TabsTrigger>
          <TabsTrigger value="storage">存储配置</TabsTrigger>
          <TabsTrigger value="client">客户端配置</TabsTrigger>
        </TabsList>

        <TabsContent value="site"><SiteConfigPage /></TabsContent>
        <TabsContent value="login"><LoginConfigPage /></TabsContent>
        <TabsContent value="security"><SecurityConfigPage /></TabsContent>
        <TabsContent value="mail"><MailConfigPage /></TabsContent>
        <TabsContent value="sms"><SmsConfigPage /></TabsContent>
        <TabsContent value="storage"><StorageConfigPage /></TabsContent>
        <TabsContent value="client"><ClientConfigPage /></TabsContent>
      </Tabs>
    </div>
  )
}
