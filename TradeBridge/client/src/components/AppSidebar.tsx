import { useLocation, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "./ui/sidebar"
import { 
  LayoutDashboard, 
  Settings, 
  Activity, 
  Wifi, 
  AlertTriangle,
  Server,
  User
} from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Configuration",
    url: "/configuration",
    icon: Settings,
  },
  {
    title: "Data Monitor",
    url: "/data-monitor",
    icon: Activity,
  },
  {
    title: "Connections",
    url: "/connections",
    icon: Wifi,
  },
  {
    title: "Error Logs",
    url: "/error-logs",
    icon: AlertTriangle,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/60 dark:border-slate-700/60">
      <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-700/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Server className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">DDE Server</span>
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">Elwave Bridge</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 dark:text-slate-400">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={location.pathname === item.url}
                    onClick={() => navigate(item.url)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-700/60 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium text-slate-900 dark:text-slate-100">
              {user?.email || 'User'}
            </span>
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">Online</span>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}