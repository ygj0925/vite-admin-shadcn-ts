import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Upload, Search, Grid3X3, List, Trash2, Download, Pencil, Info,
  FolderPlus, MoreHorizontal, ChevronRight, Home, X, Check,
  Image as ImageIcon, FileVideo, FileAudio, FileText, File,
  Play, RotateCcw, Eye, HardDrive, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DeleteConfirm } from '@/components/delete-confirm'
import {
  getFilePage, uploadFile, updateFile, deleteFile, getFileStatistics,
  type FileInfo, type FileStatistics,
} from '@/apis/system/file'
import type { PageQuery } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type ViewMode = 'grid' | 'list'
type FileTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff']
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v']
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus']
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'rtf']

const FILE_TYPE_FILTERS: { key: FileTypeFilter; label: string; icon: typeof File }[] = [
  { key: 'all', label: '全部', icon: File },
  { key: 'image', label: '图片', icon: ImageIcon },
  { key: 'video', label: '视频', icon: FileVideo },
  { key: 'audio', label: '音频', icon: FileAudio },
  { key: 'document', label: '文档', icon: FileText },
  { key: 'other', label: '其他', icon: File },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function getFileCategory(ext: string): FileTypeFilter {
  const e = ext?.toLowerCase() ?? ''
  if (IMAGE_EXTENSIONS.includes(e)) return 'image'
  if (VIDEO_EXTENSIONS.includes(e)) return 'video'
  if (AUDIO_EXTENSIONS.includes(e)) return 'audio'
  if (DOCUMENT_EXTENSIONS.includes(e)) return 'document'
  return 'other'
}

function getFileIcon(file: FileInfo) {
  const cat = getFileCategory(file.extension)
  switch (cat) {
    case 'image': return ImageIcon
    case 'video': return FileVideo
    case 'audio': return FileAudio
    case 'document': return FileText
    default: return File
  }
}

function getFileColor(ext: string): string {
  const cat = getFileCategory(ext)
  switch (cat) {
    case 'image': return 'text-emerald-500'
    case 'video': return 'text-violet-500'
    case 'audio': return 'text-amber-500'
    case 'document': return 'text-blue-500'
    default: return 'text-muted-foreground'
  }
}

function isPreviewable(ext: string): boolean {
  return IMAGE_EXTENSIONS.includes(ext?.toLowerCase())
}

function isVideo(ext: string): boolean {
  return VIDEO_EXTENSIONS.includes(ext?.toLowerCase())
}

function isAudio(ext: string): boolean {
  return AUDIO_EXTENSIONS.includes(ext?.toLowerCase())
}

function isPlayable(ext: string): boolean {
  return isVideo(ext) || isAudio(ext)
}

// ---------------------------------------------------------------------------
// Context Menu (custom right-click)
// ---------------------------------------------------------------------------

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  file: FileInfo | null
}

function ContextMenuOverlay({
  state,
  onClose,
  onDownload,
  onRename,
  onDetail,
  onDelete,
}: {
  state: ContextMenuState
  onClose: () => void
  onDownload: () => void
  onRename: () => void
  onDetail: () => void
  onDelete: () => void
}) {
  if (!state.visible || !state.file) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <div
        className="fixed z-50 min-w-[160px] rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95"
        style={{ left: state.x, top: state.y }}
      >
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-default"
          onClick={() => { onDownload(); onClose() }}
        >
          <Download className="h-4 w-4" /> 下载
        </button>
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-default"
          onClick={() => { onRename(); onClose() }}
        >
          <Pencil className="h-4 w-4" /> 重命名
        </button>
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-default"
          onClick={() => { onDetail(); onClose() }}
        >
          <Info className="h-4 w-4" /> 详情
        </button>
        <div className="my-1 h-px bg-border" />
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-default"
          onClick={() => { onDelete(); onClose() }}
        >
          <Trash2 className="h-4 w-4" /> 删除
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Breadcrumb helpers
// ---------------------------------------------------------------------------

interface BreadcrumbSegment {
  name: string
  path: string
}

function FolderBreadcrumb({
  segments,
  onNavigate,
}: {
  segments: BreadcrumbSegment[]
  onNavigate: (path: string) => void
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-1 cursor-pointer"
            onClick={(e) => { e.preventDefault(); onNavigate('/') }}
          >
            <Home className="h-3.5 w-3.5" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, idx) => (
          <BreadcrumbItem key={seg.path}>
            <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
            {idx === segments.length - 1 ? (
              <BreadcrumbPage>{seg.name}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                className="cursor-pointer"
                onClick={(e) => { e.preventDefault(); onNavigate(seg.path) }}
              >
                {seg.name}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  activeFilter,
  onFilterChange,
  stats,
  loading,
}: {
  activeFilter: FileTypeFilter
  onFilterChange: (f: FileTypeFilter) => void
  stats: FileStatistics | null
  loading: boolean
}) {
  const getCount = (key: FileTypeFilter): number => {
    if (!stats) return 0
    switch (key) {
      case 'all': return stats.total
      case 'image': return stats.imageCount
      case 'video': return stats.videoCount
      case 'audio': return stats.audioCount
      case 'document': return stats.documentCount
      case 'other': return stats.otherCount
    }
  }

  const getSize = (key: FileTypeFilter): number => {
    if (!stats) return 0
    // The API only provides totalSize; per-type sizes are not available, so we show total for all
    // and 0 for individual categories unless the API provides breakdown
    switch (key) {
      case 'all': return stats.totalSize
      default: return 0
    }
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Label className="mb-2 block px-2 text-xs font-medium text-muted-foreground">文件类型</Label>
          <nav className="space-y-0.5">
            {FILE_TYPE_FILTERS.map((f) => {
              const Icon = f.icon
              const active = activeFilter === f.key
              const count = getCount(f.key)
              return (
                <button
                  key={f.key}
                  onClick={() => onFilterChange(f.key)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && getFileColor(f.key === 'all' ? '' : f.key === 'image' ? 'jpg' : f.key === 'video' ? 'mp4' : f.key === 'audio' ? 'mp3' : f.key === 'document' ? 'pdf' : 'zip'))} />
                  <span className="flex-1 text-left">{f.label}</span>
                  <Badge variant="secondary" className="h-5 min-w-[20px] justify-center px-1.5 text-xs">
                    {loading ? '-' : count}
                  </Badge>
                </button>
              )
            })}
          </nav>
        </div>
      </ScrollArea>

      <Separator />

      {/* Storage statistics */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 px-2 mb-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">存储统计</Label>
        </div>
        {stats ? (
          <div className="space-y-2 px-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">总大小</span>
              <span className="font-medium">{formatSize(stats.totalSize)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              {(['image', 'video', 'audio', 'document'] as const).map((key) => {
                const count = getCount(key)
                const label = FILE_TYPE_FILTERS.find((f) => f.key === key)?.label ?? key
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', key === 'image' ? 'bg-emerald-500' : key === 'video' ? 'bg-violet-500' : key === 'audio' ? 'bg-amber-500' : 'bg-blue-500')} />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="ml-auto font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="px-2 text-xs text-muted-foreground">加载中...</div>
        )}
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Grid Card
// ---------------------------------------------------------------------------

function GridCard({
  file,
  selected,
  onSelect,
  onClick,
  onContextMenu,
  onPreview,
}: {
  file: FileInfo
  selected: boolean
  onSelect: (checked: boolean) => void
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onPreview: () => void
}) {
  const Icon = getFileIcon(file)
  const color = getFileColor(file.extension)
  const previewable = isPreviewable(file.extension)
  const playable = isPlayable(file.extension)

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary',
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <CardContent className="p-0">
        {/* Checkbox */}
        <div
          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
        {selected && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked
              onCheckedChange={onSelect}
              className="bg-background/80 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Preview / Icon */}
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-t-lg bg-muted/50">
          {previewable ? (
            <>
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onPreview() }}
              >
                <Eye className="h-6 w-6 text-white" />
              </button>
            </>
          ) : playable ? (
            <button
              className="flex h-full w-full flex-col items-center justify-center gap-1 transition-colors hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); onPreview() }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Play className={cn('h-6 w-6', color)} />
              </div>
              <span className="text-xs text-muted-foreground">{file.extension?.toUpperCase()}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Icon className={cn('h-10 w-10', color)} />
              <span className="text-xs text-muted-foreground uppercase">{file.extension || '未知'}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="truncate text-sm font-medium" title={file.originalName || file.name}>
            {file.originalName || file.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatSize(file.size)} &middot; {formatDate(file.createTime)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// List Row
// ---------------------------------------------------------------------------

function ListRow({
  file,
  selected,
  onSelect,
  onClick,
  onContextMenu,
  onPreview,
}: {
  file: FileInfo
  selected: boolean
  onSelect: (checked: boolean) => void
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onPreview: () => void
}) {
  const Icon = getFileIcon(file)
  const color = getFileColor(file.extension)

  return (
    <tr
      className={cn(
        'group border-b transition-colors hover:bg-muted/50 cursor-pointer',
        selected && 'bg-muted/70',
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <td className="w-10 px-3 py-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2.5">
          {isPreviewable(file.extension) ? (
            <button
              className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted"
              onClick={(e) => { e.stopPropagation(); onPreview() }}
            >
              <img src={file.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ) : (
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted/50', color)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.originalName || file.name}</p>
            <p className="text-xs text-muted-foreground">{file.extension?.toUpperCase() || '-'}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="font-normal">{file.type || '-'}</Badge>
      </td>
      <td className="px-3 py-2 text-sm text-muted-foreground">{formatSize(file.size)}</td>
      <td className="px-3 py-2 text-sm text-muted-foreground">{file.storageName || '-'}</td>
      <td className="px-3 py-2 text-sm text-muted-foreground">{formatDate(file.createTime)}</td>
      <td className="w-10 px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview()}>
              <Eye className="h-4 w-4" /> 预览
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
              <Download className="h-4 w-4" /> 下载
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => {}}>
              <Trash2 className="h-4 w-4" /> 删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Media Player Dialog
// ---------------------------------------------------------------------------

function MediaPlayerDialog({
  open,
  onOpenChange,
  file,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileInfo | null
}) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{file.originalName || file.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {isVideo(file.extension) ? (
            <video
              src={file.url}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full rounded"
            />
          ) : isAudio(file.extension) ? (
            <div className="flex w-full flex-col items-center gap-4 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <FileAudio className="h-12 w-12 text-amber-500" />
              </div>
              <audio src={file.url} controls autoPlay className="w-full max-w-md" />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Image Lightbox
// ---------------------------------------------------------------------------

function ImageLightbox({
  open,
  onOpenChange,
  url,
  name,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  name: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <img src={url} alt={name} className="max-h-[70vh] max-w-full object-contain rounded" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// File Detail Dialog
// ---------------------------------------------------------------------------

function FileDetailDialog({
  open,
  onOpenChange,
  file,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileInfo | null
}) {
  if (!file) return null

  const fields = [
    { label: '文件名称', value: file.originalName || file.name },
    { label: '存储名称', value: file.name },
    { label: '文件类型', value: file.type || '-' },
    { label: '扩展名', value: file.extension?.toUpperCase() || '-' },
    { label: '文件大小', value: formatSize(file.size) },
    { label: '存储位置', value: file.storageName || '-' },
    { label: '文件路径', value: file.path || '-' },
    { label: '创建时间', value: formatDate(file.createTime) },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>文件详情</DialogTitle>
          <DialogDescription>查看文件的详细信息</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isPreviewable(file.extension) && (
            <div className="flex justify-center rounded-lg bg-muted/50 p-2">
              <img src={file.url} alt={file.name} className="max-h-48 object-contain rounded" />
            </div>
          )}
          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.label} className="flex items-start gap-3 text-sm">
                <span className="w-20 shrink-0 text-muted-foreground">{f.label}</span>
                <span className="break-all">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
            <Download className="h-4 w-4 mr-1" /> 下载
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Rename Dialog
// ---------------------------------------------------------------------------

function RenameDialog({
  open,
  onOpenChange,
  file,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileInfo | null
  onConfirm: (newName: string) => void
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (file) {
      setName(file.originalName || file.name)
    }
  }, [file])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('文件名不能为空')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>重命名</DialogTitle>
          <DialogDescription>输入新的文件名称</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-input">文件名</Label>
          <Input
            id="rename-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
          <Button size="sm" onClick={handleSubmit}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function FilePage() {
  // Data
  const [files, setFiles] = useState<FileInfo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<FileStatistics | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeFilter, setActiveFilter] = useState<FileTypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Folder / breadcrumb
  const [folderPath, setFolderPath] = useState('/')
  const breadcrumbSegments: BreadcrumbSegment[] = useMemo(() => {
    if (folderPath === '/') return []
    const parts = folderPath.split('/').filter(Boolean)
    return parts.map((name, idx) => ({
      name,
      path: '/' + parts.slice(0, idx + 1).join('/'),
    }))
  }, [folderPath])

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const lastClickedIndex = useRef<number | null>(null)

  // Context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, file: null,
  })

  // Dialogs
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [detailFile, setDetailFile] = useState<FileInfo | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [renameFile, setRenameFile] = useState<FileInfo | null>(null)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTargets, setDeleteTargets] = useState<string[]>([])

  // Upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // Fetch data
  // ---------------------------------------------------------------------------

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const params: PageQuery & Record<string, unknown> = {
        page,
        size: pageSize,
      }
      if (searchQuery) params.name = searchQuery
      if (activeFilter !== 'all') {
        params.type = activeFilter
      }
      const res = await getFilePage(params)
      setFiles(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, activeFilter])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await getFileStatistics()
      setStats(res)
    } catch {
      // handled by interceptor
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Close context menu on scroll
  useEffect(() => {
    const handler = () => setContextMenu((prev) => ({ ...prev, visible: false }))
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [activeFilter, searchQuery])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSearch = () => {
    setSearchQuery(searchInput.trim())
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchQuery('')
    setActiveFilter('all')
    setPage(1)
  }

  const handleFilterChange = (filter: FileTypeFilter) => {
    setActiveFilter(filter)
    setSelectedIds(new Set())
  }

  const handleBreadcrumbNavigate = (path: string) => {
    setFolderPath(path)
    setPage(1)
  }

  // Selection
  const toggleSelect = (id: number, checked: boolean, index?: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
    if (index !== undefined) {
      lastClickedIndex.current = index
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(files.map((f) => f.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleShiftSelect = (index: number, id: number) => {
    if (lastClickedIndex.current === null) {
      toggleSelect(id, !selectedIds.has(id), index)
      return
    }
    const start = Math.min(lastClickedIndex.current, index)
    const end = Math.max(lastClickedIndex.current, index)
    const ids = files.slice(start, end + 1).map((f) => f.id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const shouldSelect = !selectedIds.has(id)
      ids.forEach((fid) => {
        if (shouldSelect) next.add(fid)
        else next.delete(fid)
      })
      return next
    })
    lastClickedIndex.current = index
  }

  const handleCardClick = (file: FileInfo, index: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      handleShiftSelect(index, file.id)
    } else {
      toggleSelect(file.id, !selectedIds.has(file.id), index)
    }
  }

  const isAllSelected = files.length > 0 && files.every((f) => selectedIds.has(f.id))
  const isSomeSelected = files.some((f) => selectedIds.has(f.id)) && !isAllSelected

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, file: FileInfo) => {
    e.preventDefault()
    // Ensure the file is selected
    if (!selectedIds.has(file.id)) {
      setSelectedIds(new Set([file.id]))
    }
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 200),
      file,
    })
  }

  // File actions
  const handlePreview = (file: FileInfo) => {
    setPreviewFile(file)
    if (isPreviewable(file.extension)) {
      setLightboxOpen(true)
    } else if (isPlayable(file.extension)) {
      setPlayerOpen(true)
    }
  }

  const handleDetail = (file: FileInfo) => {
    setDetailFile(file)
    setDetailOpen(true)
  }

  const handleRename = (file: FileInfo) => {
    setRenameFile(file)
    setRenameOpen(true)
  }

  const handleRenameConfirm = async (newName: string) => {
    if (!renameFile) return
    try {
      await updateFile(renameFile.id, { originalName: newName })
      toast.success('重命名成功')
      setRenameOpen(false)
      setRenameFile(null)
      fetchFiles()
    } catch {
      // handled by interceptor
    }
  }

  const handleDownload = (file: FileInfo) => {
    if (file.url) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.originalName || file.name
      a.click()
    }
  }

  const handleDeleteSingle = (file: FileInfo) => {
    setDeleteTargets([String(file.id)])
    setDeleteOpen(true)
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    setDeleteTargets(Array.from(selectedIds).map(String))
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTargets.length === 0) return
    try {
      await deleteFile(deleteTargets)
      toast.success(deleteTargets.length > 1 ? `已删除 ${deleteTargets.length} 个文件` : '删除成功')
      setDeleteOpen(false)
      setDeleteTargets([])
      setSelectedIds(new Set())
      fetchFiles()
      fetchStats()
    } catch {
      // handled by interceptor
    }
  }

  // Upload
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    let successCount = 0
    try {
      for (let i = 0; i < fileList.length; i++) {
        try {
          await uploadFile(fileList[i])
          successCount++
        } catch {
          // individual file upload error
        }
      }
      if (successCount > 0) {
        toast.success(`成功上传 ${successCount} 个文件`)
        fetchFiles()
        fetchStats()
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Create folder (stub - requires backend support)
  const handleCreateFolder = () => {
    toast.info('新建文件夹功能待后端支持')
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg border bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <h1 className="text-base font-semibold">文件管理</h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Batch delete */}
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              删除 ({selectedIds.size})
            </Button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索文件..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 w-48 pl-8"
            />
            {searchInput && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Separator orientation="vertical" className="h-5" />

          {/* View toggle */}
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5" />

          {/* Create folder */}
          <Button variant="outline" size="sm" onClick={handleCreateFolder}>
            <FolderPlus className="h-4 w-4 mr-1" />
            新建文件夹
          </Button>

          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button size="sm" onClick={handleUploadClick} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            {uploading ? '上传中...' : '上传'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          stats={stats}
          loading={statsLoading}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb & select-all */}
          <div className="flex items-center gap-3 border-b px-4 py-2">
            <FolderBreadcrumb segments={breadcrumbSegments} onNavigate={handleBreadcrumbNavigate} />
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              {viewMode === 'grid' && (
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                  />
                  <span>全选</span>
                </div>
              )}
              <span>共 {total} 项</span>
            </div>
          </div>

          {/* File area */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                <File className="h-12 w-12" />
                <p className="text-sm">暂无文件</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {files.map((file, idx) => (
                  <GridCard
                    key={file.id}
                    file={file}
                    selected={selectedIds.has(file.id)}
                    onSelect={(checked) => toggleSelect(file.id, checked, idx)}
                    onClick={(e) => handleCardClick(file, idx, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    onPreview={() => handlePreview(file)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                      <th className="w-10 px-3 py-2">
                        <Checkbox
                          checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-3 py-2">文件名</th>
                      <th className="px-3 py-2">类型</th>
                      <th className="px-3 py-2">大小</th>
                      <th className="px-3 py-2">存储</th>
                      <th className="px-3 py-2">创建时间</th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file, idx) => (
                      <ListRow
                        key={file.id}
                        file={file}
                        selected={selectedIds.has(file.id)}
                        onSelect={(checked) => toggleSelect(file.id, checked, idx)}
                        onClick={(e) => handleCardClick(file, idx, e as any)}
                        onContextMenu={(e) => handleContextMenu(e, file)}
                        onPreview={() => handlePreview(file)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>每页</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                  className="rounded border bg-background px-1.5 py-0.5 text-xs"
                >
                  {[20, 50, 100].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span>条</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <span className="px-3 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenuOverlay
        state={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        onDownload={() => contextMenu.file && handleDownload(contextMenu.file)}
        onRename={() => contextMenu.file && handleRename(contextMenu.file)}
        onDetail={() => contextMenu.file && handleDetail(contextMenu.file)}
        onDelete={() => contextMenu.file && handleDeleteSingle(contextMenu.file)}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        url={previewFile?.url ?? ''}
        name={previewFile?.originalName ?? previewFile?.name ?? ''}
      />

      {/* Media Player */}
      <MediaPlayerDialog
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        file={previewFile}
      />

      {/* File Detail */}
      <FileDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        file={detailFile}
      />

      {/* Rename */}
      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        file={renameFile}
        onConfirm={handleRenameConfirm}
      />

      {/* Delete Confirm */}
      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        count={deleteTargets.length}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
