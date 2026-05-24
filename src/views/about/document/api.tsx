import { ExternalLink, FileCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ApiDocPage() {
  const swaggerUrl = '/swagger-ui'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">接口文档</h1>
        <p className="text-sm text-muted-foreground mt-1">API 接口在线文档</p>
      </div>

      <Card className="rounded">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Swagger UI
          </CardTitle>
          <a href={swaggerUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-1" />
              新窗口打开
            </Button>
          </a>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
            <iframe
              src={swaggerUrl}
              title="API Documentation"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
