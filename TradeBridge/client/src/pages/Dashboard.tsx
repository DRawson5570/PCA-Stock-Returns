import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  Wifi,
  WifiOff,
  Users,
  TrendingUp,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Server
} from "lucide-react"
import { getDashboardStats, getRealtimeTicks } from "@/api/dashboard"
import { useToast } from "@/hooks/useToast"

interface DashboardStats {
  connectionStatus: {
    oanda: boolean
    dde: boolean
  }
  clientCount: number
  activeSymbols: number
  dataQuality: number
  apiCallsPerMinute: number
  bandwidth: string
}

interface TickData {
  symbol: string
  bid: number
  ask: number
  timestamp: string
  volume: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [ticks, setTicks] = useState<TickData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard: Fetching initial data')
        const [statsData, ticksData] = await Promise.all([
          getDashboardStats(),
          getRealtimeTicks()
        ])

        setStats(statsData as DashboardStats)
        setTicks((ticksData as any).ticks)
        setLoading(false)
        console.log('Dashboard: Data loaded successfully')
      } catch (error) {
        console.error('Dashboard: Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()

    // Update ticks every 2 seconds
    const tickInterval = setInterval(async () => {
      try {
        const ticksData = await getRealtimeTicks()
        setTicks((ticksData as any).ticks)
      } catch (error) {
        console.error('Dashboard: Error updating ticks:', error)
      }
    }, 2000)

    // Update stats every 10 seconds
    const statsInterval = setInterval(async () => {
      try {
        const statsData = await getDashboardStats()
        setStats(statsData as DashboardStats)
      } catch (error) {
        console.error('Dashboard: Error updating stats:', error)
      }
    }, 10000)

    return () => {
      clearInterval(tickInterval)
      clearInterval(statsInterval)
    }
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor your DDE server status and real-time data feeds</p>
      </div>

      {/* Connection Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Oanda Connection</CardTitle>
            {stats?.connectionStatus.oanda ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.connectionStatus.oanda ? "default" : "destructive"} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              {stats?.connectionStatus.oanda ? "Connected" : "Disconnected"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">DDE Server</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.connectionStatus.dde ? "default" : "destructive"} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              {stats?.connectionStatus.dde ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Connected Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.clientCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Symbols</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.activeSymbols}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Gauge className="h-5 w-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Quality</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{stats?.dataQuality}%</span>
              </div>
              <Progress value={stats?.dataQuality} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">API Calls/min</span>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{stats?.apiCallsPerMinute}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Bandwidth</span>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{stats?.bandwidth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Activity className="h-5 w-5 text-green-600" />
              Live Data Feed
            </CardTitle>
            <CardDescription>Real-time tick data from Oanda</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {ticks.map((tick, index) => (
                  <div key={`${tick.symbol}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{tick.symbol}</span>
                      <div className="flex gap-2 text-sm">
                        <span className="text-red-600">Bid: {tick.bid.toFixed(5)}</span>
                        <span className="text-green-600">Ask: {tick.ask.toFixed(5)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Vol: {tick.volume}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}