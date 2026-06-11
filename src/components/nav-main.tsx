import { useNavigate, useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAppStore } from "@/stores/app"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { state } = useSidebar()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const isCollapsed = state === "collapsed"

  const handleNavigate = (url: string) => {
    navigate(url)
    if (isMobile) setMobileSidebarOpen(false)
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            location.pathname === item.url ||
            location.pathname.startsWith(item.url + "/")
          const hasChildren = item.items && item.items.length > 0

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => handleNavigate(item.url)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // 折叠状态下使用 Popover 显示子菜单
          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <Popover>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      {item.icon}
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="start"
                    className="w-48 p-1"
                  >
                    <div className="flex flex-col gap-0.5">
                      {item.items?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url
                        return (
                          <button
                            key={subItem.title}
                            onClick={() => handleNavigate(subItem.url)}
                            className={cn(
                              "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {subItem.title}
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            )
          }

          // 展开状态下使用 Collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon size={15} className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = location.pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isSubActive}
                            onClick={() => handleNavigate(subItem.url)}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
