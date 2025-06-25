import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wifi,
  WifiOff,
  Users,
  Activity,
  Clock,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { getConnectedClients, getDDERequests } from "@/api/connections"
import { useToast } from "@/hooks/useToast"

interface Client {
  id: string
  name: string
  status: string
  connectedAt: string
  requestCount: number
  symbols: string[]
}

interface DDERequest {
  timestamp: string
  client: string
  command: string
  topic: string
  item: string
  status: string
  responseTime: number
}

export function Connections() {
  const [clients, setClients] = useState<Client[]>([])
  const [requests, setRequests] = useState<DDERequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Connections: Fetching connection data')
        const [clientsResponse, requestsResponse] = await Promise.all([
          getConnectedClients(),
          getDDERequests()
        ])

        setClients((clientsResponse as any).clients)
        setRequests((requestsResponse as any).requests)
        setLoading(false)
        console.log('Connections: Data loaded successfully')
      } catch (error) {
        console.error('Connections: Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load connection information",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()

    // Update data every 5 seconds
    const interval = setInterval(async () => {
      try {
        const [clientsResponse, requestsResponse] = await Promise.all([
          getConnectedClients(),
          getDDERequests()
        ])
        setClients((clientsResponse as any).clients)
        setRequests((requestsResponse as any).requests)
      } catch (error) {
        console.error('Connections: Error updating data:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connected</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const handleDisconnectClient = async (clientId: string) => {
    try {
      console.log('Connections: Disconnecting client', clientId)
      // Simulate client disconnection
      toast({
        title: "Client Disconnected",
        description: "Client has been disconnected successfully",
      })
    } catch (error) {
      console.error('Connections: Error disconnecting client:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect client",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const connectedClients = clients.filter(client => client.status === 'connected')
  const totalRequests = requests.length
  const successfulRequests = requests.filter(req => req.status === 'success').length
  const avgResponseTime = requests.length > 0 ? 
    Math.round(requests.reduce((sum, req) => sum + req.responseTime, 0) / requests.length) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Connections</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor Elwave client connections and DDE requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{connectedClients.length}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">of {clients.length} total</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalRequests}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">in last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{successfulRequests} successful</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgResponseTime}ms</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">response time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60">
          <TabsTrigger value="clients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Elwave Clients
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4 mr-2" />
            DDE Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Users className="h-5 w-5 text-blue-600" />
                Connected Elwave Clients
              </CardTitle>
              <CardDescription>Manage and monitor connected Elwave instances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {client.status === 'connected' ? (
                          <Wifi className="h-5 w-5 text-green-600" />
                        ) : (
                          <WifiOff className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{client.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">ID: {client.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(client.status)}
                        {client.status === 'connected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectClient(client.id)}
                            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Connected</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(client.connectedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Requests</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{client.requestCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Symbols</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{client.symbols.length}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Active Symbols</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {client.symbols.slice(0, 3).map((symbol) => (
                            <Badge key={symbol} variant="outline" className="text-xs bg-white dark:bg-slate-700">
                              {symbol}
                            </Badge>
                          ))}
                          {client.symbols.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-white dark:bg-slate-700">
                              +{client.symbols.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Activity className="h-5 w-5 text-green-600" />
                DDE Request Monitor
              </CardTitle>
              <CardDescription>Real-time monitoring of DDE requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Time</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Client</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Command</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Topic</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Item</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request, index) => (
                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                          <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                            {new Date(request.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                            {request.client}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white dark:bg-slate-700">
                              {request.command}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {request.topic}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-900 dark:text-slate-100">
                            {request.item}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRequestStatusIcon(request.status)}
                              <span className={`text-sm ${request.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {request.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                            {request.responseTime}ms
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}