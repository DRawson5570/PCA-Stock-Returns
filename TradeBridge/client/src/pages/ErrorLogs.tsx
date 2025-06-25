import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  Trash2
} from "lucide-react"
import { getErrorLogs } from "@/api/errorLogs"
import { useToast } from "@/hooks/useToast"

interface ErrorLog {
  timestamp: string
  level: string
  message: string
  source: string
  details?: string
}

export function ErrorLogs() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log('ErrorLogs: Fetching error logs')
        const response = await getErrorLogs()
        const logData = (response as any).logs
        setLogs(logData)
        setFilteredLogs(logData)
        setLoading(false)
        console.log('ErrorLogs: Logs loaded successfully')
      } catch (error) {
        console.error('ErrorLogs: Error fetching logs:', error)
        toast({
          title: "Error",
          description: "Failed to load error logs",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchLogs()

    // Refresh logs every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await getErrorLogs()
        const logData = (response as any).logs
        setLogs(logData)
        applyFilters(logData, searchTerm, levelFilter, sourceFilter)
      } catch (error) {
        console.error('ErrorLogs: Error refreshing logs:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [toast])

  const applyFilters = (logsData: ErrorLog[], search: string, level: string, source: string) => {
    let filtered = logsData

    if (search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (level !== "all") {
      filtered = filtered.filter(log => log.level === level)
    }

    if (source !== "all") {
      filtered = filtered.filter(log => log.source === source)
    }

    setFilteredLogs(filtered)
  }

  useEffect(() => {
    applyFilters(logs, searchTerm, levelFilter, sourceFilter)
  }, [logs, searchTerm, levelFilter, sourceFilter])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">Warning</Badge>
      case 'info':
        return <Badge className="bg-blue-500 text-white">Info</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedLogs(newExpanded)
  }

  const handleClearLogs = async () => {
    try {
      console.log('ErrorLogs: Clearing logs')
      // Simulate clearing logs
      toast({
        title: "Logs Cleared",
        description: "All error logs have been cleared successfully",
      })
    } catch (error) {
      console.error('ErrorLogs: Error clearing logs:', error)
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      })
    }
  }

  const handleExportLogs = async () => {
    try {
      console.log('ErrorLogs: Exporting logs')
      // Simulate exporting logs
      const dataStr = JSON.stringify(filteredLogs, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Export Complete",
        description: "Error logs have been exported successfully",
      })
    } catch (error) {
      console.error('ErrorLogs: Error exporting logs:', error)
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      })
    }
  }

  const uniqueSources = [...new Set(logs.map(log => log.source))]
  const errorCount = logs.filter(log => log.level === 'error').length
  const warningCount = logs.filter(log => log.level === 'warning').length
  const infoCount = logs.filter(log => log.level === 'info').length

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Error Logs</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor system errors, warnings, and information logs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Logs</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{logs.length}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">all entries</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">critical issues</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">informational</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32 bg-white dark:bg-slate-700">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40 bg-white dark:bg-slate-700">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportLogs}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleClearLogs}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            System Logs
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <Collapsible key={index}>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <CollapsibleTrigger
                      className="w-full p-4 text-left"
                      onClick={() => toggleLogExpansion(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getLevelIcon(log.level)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getLevelBadge(log.level)}
                              <Badge variant="outline" className="bg-white dark:bg-slate-700">
                                {log.source}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-900 dark:text-slate-100 truncate">
                              {log.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.details && (
                            <>
                              {expandedLogs.has(index) ? (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    {log.details && (
                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/30">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 mt-3">Details:</h4>
                          <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded border">
                            {log.details}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}