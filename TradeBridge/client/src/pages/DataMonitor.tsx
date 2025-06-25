import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { getHistoricalDataStatus, getLivePriceData } from "@/api/dataMonitor"
import { useToast } from "@/hooks/useToast"

interface HistoricalRequest {
  symbol: string
  timeframe: string
  progress: number
  status: string
  startDate: string
  endDate: string
}

interface LivePrice {
  symbol: string
  bid: number
  ask: number
  spread: number
  timestamp: string
  change: number
}

export function DataMonitor() {
  const [historicalData, setHistoricalData] = useState<HistoricalRequest[]>([])
  const [livePrices, setLivePrices] = useState<LivePrice[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('DataMonitor: Fetching initial data')
        const [historicalResponse, liveResponse] = await Promise.all([
          getHistoricalDataStatus(),
          getLivePriceData()
        ])

        setHistoricalData((historicalResponse as any).requests)
        setLivePrices((liveResponse as any).prices)
        setLoading(false)
        console.log('DataMonitor: Data loaded successfully')
      } catch (error) {
        console.error('DataMonitor: Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data monitor information",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()

    // Update live prices every 3 seconds
    const liveInterval = setInterval(async () => {
      try {
        const liveResponse = await getLivePriceData()
        setLivePrices((liveResponse as any).prices)
      } catch (error) {
        console.error('DataMonitor: Error updating live prices:', error)
      }
    }, 3000)

    // Update historical data every 10 seconds
    const historicalInterval = setInterval(async () => {
      try {
        const historicalResponse = await getHistoricalDataStatus()
        setHistoricalData((historicalResponse as any).requests)
      } catch (error) {
        console.error('DataMonitor: Error updating historical data:', error)
      }
    }, 10000)

    return () => {
      clearInterval(liveInterval)
      clearInterval(historicalInterval)
    }
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'queued': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500 text-white">Completed</Badge>
      case 'in_progress': return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case 'queued': return <Badge className="bg-yellow-500 text-white">Queued</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Data Monitor</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor real-time and historical data feeds</p>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60">
          <TabsTrigger value="live" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4 mr-2" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="historical" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Database className="h-4 w-4 mr-2" />
            Historical Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Activity className="h-5 w-5 text-green-600" />
                Real-time Price Feed
              </CardTitle>
              <CardDescription>Live market data from Oanda streaming API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Symbol</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Bid</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Ask</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Spread</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Change</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {livePrices.map((price, index) => (
                      <TableRow key={`${price.symbol}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{price.symbol}</TableCell>
                        <TableCell className="text-red-600 font-mono">{price.bid.toFixed(5)}</TableCell>
                        <TableCell className="text-green-600 font-mono">{price.ask.toFixed(5)}</TableCell>
                        <TableCell className="font-mono text-slate-600 dark:text-slate-400">{price.spread.toFixed(5)}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {price.change >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            <span className="font-mono text-sm">{price.change >= 0 ? '+' : ''}{price.change.toFixed(5)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                          {new Date(price.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Database className="h-5 w-5 text-blue-600" />
                Historical Data Requests
              </CardTitle>
              <CardDescription>Status of historical data fetching operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalData.map((request, index) => (
                  <div key={`${request.symbol}-${request.timeframe}-${index}`} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{request.symbol}</span>
                        <Badge variant="outline" className="bg-white dark:bg-slate-700">
                          {request.timeframe}
                        </Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {request.startDate} - {request.endDate}
                      </div>
                    </div>
                    {request.status === 'in_progress' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-slate-900 dark:text-slate-100">{request.progress}%</span>
                        </div>
                        <Progress value={request.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}