import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { ThemeToggle } from "./ui/theme-toggle"
import { Button } from "./ui/button"
import { LogOut, Bell } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Badge } from "./ui/badge"

export function DashboardHeader() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Server Active</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}