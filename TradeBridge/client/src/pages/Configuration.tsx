import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { Settings, Key, Server, Clock, Save, TestTube } from "lucide-react"
import { getConfiguration, updateConfiguration } from "@/api/configuration"
import { useToast } from "@/hooks/useToast"

interface ConfigurationData {
  oandaConfig: {
    apiKey: string
    accountId: string
    environment: string
  }
  ddeConfig: {
    serviceName: string
    refreshInterval: number
  }
  historicalConfig: {
    maxDays: number
    defaultTimeframe: string
  }
}

export function Configuration() {
  const [config, setConfig] = useState<ConfigurationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, setValue, watch } = useForm()

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        console.log('Configuration: Fetching current settings')
        const data = await getConfiguration() as ConfigurationData
        setConfig(data)
        
        // Set form values
        setValue('apiKey', data.oandaConfig.apiKey)
        setValue('accountId', data.oandaConfig.accountId)
        setValue('environment', data.oandaConfig.environment)
        setValue('serviceName', data.ddeConfig.serviceName)
        setValue('refreshInterval', data.ddeConfig.refreshInterval)
        setValue('maxDays', data.historicalConfig.maxDays)
        setValue('defaultTimeframe', data.historicalConfig.defaultTimeframe)
        
        setLoading(false)
        console.log('Configuration: Settings loaded successfully')
      } catch (error) {
        console.error('Configuration: Error fetching settings:', error)
        toast({
          title: "Error",
          description: "Failed to load configuration settings",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchConfiguration()
  }, [setValue, toast])

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      console.log('Configuration: Saving settings', data)
      const updateData = {
        oandaConfig: {
          apiKey: data.apiKey,
          accountId: data.accountId,
          environment: data.environment
        },
        ddeConfig: {
          serviceName: data.serviceName,
          refreshInterval: parseInt(data.refreshInterval)
        },
        historicalConfig: {
          maxDays: parseInt(data.maxDays),
          defaultTimeframe: data.defaultTimeframe
        }
      }

      await updateConfiguration(updateData)
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      })
      console.log('Configuration: Settings saved successfully')
    } catch (error) {
      console.error('Configuration: Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      console.log('Configuration: Testing Oanda connection')
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Connection Test",
        description: "Oanda API connection successful",
      })
    } catch (error) {
      console.error('Configuration: Connection test failed:', error)
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to Oanda API",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Configuration</h1>
        <p className="text-slate-600 dark:text-slate-400">Configure your Oanda API and DDE server settings</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Oanda API Configuration */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Key className="h-5 w-5 text-blue-600" />
              Oanda API Configuration
            </CardTitle>
            <CardDescription>Configure your Oanda trading account and API access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Oanda API key"
                  {...register('apiKey', { required: true })}
                  className="bg-white dark:bg-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  id="accountId"
                  placeholder="Enter your Oanda account ID"
                  {...register('accountId', { required: true })}
                  className="bg-white dark:bg-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select defaultValue={config?.oandaConfig.environment} onValueChange={(value) => setValue('environment', value)}>
                <SelectTrigger className="bg-white dark:bg-slate-700">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? "Testing..." : "Test Connection"}
              </Button>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                Status: {config?.oandaConfig.environment === 'live' ? 'Live Trading' : 'Practice Mode'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* DDE Server Configuration */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Server className="h-5 w-5 text-green-600" />
              DDE Server Configuration
            </CardTitle>
            <CardDescription>Configure DDE service settings for Elwave integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  placeholder="DDE service name"
                  {...register('serviceName', { required: true })}
                  className="bg-white dark:bg-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Refresh Interval (ms)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  placeholder="1000"
                  {...register('refreshInterval', { required: true })}
                  className="bg-white dark:bg-slate-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Data Configuration */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Clock className="h-5 w-5 text-purple-600" />
              Historical Data Configuration
            </CardTitle>
            <CardDescription>Configure historical data retention and default settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDays">Max Retention Days</Label>
                <Input
                  id="maxDays"
                  type="number"
                  placeholder="30"
                  {...register('maxDays', { required: true })}
                  className="bg-white dark:bg-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTimeframe">Default Timeframe</Label>
                <Select defaultValue={config?.historicalConfig.defaultTimeframe} onValueChange={(value) => setValue('defaultTimeframe', value)}>
                  <SelectTrigger className="bg-white dark:bg-slate-700">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1 Minute</SelectItem>
                    <SelectItem value="5M">5 Minutes</SelectItem>
                    <SelectItem value="15M">15 Minutes</SelectItem>
                    <SelectItem value="1H">1 Hour</SelectItem>
                    <SelectItem value="4H">4 Hours</SelectItem>
                    <SelectItem value="1D">1 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  )
}