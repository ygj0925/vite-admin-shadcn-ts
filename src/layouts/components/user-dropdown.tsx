import { useNavigate } from 'react-router-dom'
import { User, MessageSquare, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/stores/user'

export function UserDropdown() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const logout = useUserStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded px-2 py-1 hover:bg-accent transition-colors duration-300 outline-none">
        <Avatar className="h-7 w-7">
          <AvatarImage src={userInfo?.avatar} />
          <AvatarFallback className="text-xs">{userInfo?.nickname?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <span className="text-sm hidden sm:inline">{userInfo?.nickname || userInfo?.username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => navigate('/user/profile')}>
          <User className="h-4 w-4" /> 个人中心
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/user/message')}>
          <MessageSquare className="h-4 w-4" /> 消息中心
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4" /> 退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
