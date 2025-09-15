import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Layers, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Skeleton } from '../components/ui/skeleton'
import { Alert, AlertDescription } from '../components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useBackend } from '../lib/useBackend'
import { mockApi } from '../lib/mockApi'
import { formatCurrency, formatNumber, formatRelativeTime, formatPercentage } from '../lib/utils'
import type { DashboardStats, SystemHealth, UserBalance, Activity as ActivityType, TimeSeriesDataPoint } from '../types'

export function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const { 
    checkHealth, 
    getPlatformStats, 
    getUserBalance,
    getRTokenBalance,
    error: backendError,
    isLoading: backendLoading 
  } = useBackend()

  // Original state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityType[]>([])
  const [healthTimeline, setHealthTimeline] = useState<TimeSeriesDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Backend Integration State
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null)
  const [backendStats, setBackendStats] = useState<any>(null)
  const [backendBalance, setBackendBalance] = useState<string | null>(null)
  const [rTokenBalance, setRTokenBalance] = useState<any>(null)
  const [lastBackendUpdate, setLastBackendUpdate] = useState<Date | null>(null)

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load mock data
      const [
        statsData,
        healthData,
        balanceData,
        activityData,
        timelineData
      ] = await Promise.all([
        mockApi.getDashboardStats(),
        mockApi.getSystemHealth(),
        mockApi.getUserBalance(),
        mockApi.getRecentActivity(8),
        mockApi.getHealthTimeline()
      ])

      setStats(statsData)
      setSystemHealth(healthData)
      setUserBalance(balanceData)
      setRecentActivity(activityData)
      setHealthTimeline(timelineData)

      // Load backend data if authenticated
      if (isAuthenticated) {
        await loadBackendData()
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBackendData = async () => {
    if (!isAuthenticated) return
    
    try {
      console.log('🔄 Loading backend data...')
      
      // Backend health check
      const health = await checkHealth()
      setBackendHealth(health)
      console.log('🏥 Backend health:', health)
      
      // Platform statistics
      const platformStats = await getPlatformStats()
      setBackendStats(platformStats)
      console.log('📊 Platform stats:', platformStats)
      
      // User balance
      const balance = await getUserBalance()
      setBackendBalance(balance?.toString() || null)
      console.log('💰 User balance:', balance)

      // R Token balance
      const rTokens = await getRTokenBalance()
      setRTokenBalance(rTokens)
      console.log('🪙 R Token balance:', rTokens)
      
      setLastBackendUpdate(new Date())
      console.log('✅ Backend data loaded successfully')
    } catch (error) {
      console.error('❌ Failed to load backend data:', error)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadBackendData()
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const getActivityIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'contribution':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'payout':
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />
      case 'stake':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      case 'unstake':
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'trade':
        return <Activity className="h-4 w-4 text-cyan-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Stats Data with Backend Integration
  const statsData = [
    {
      title: 'Total Users',
      value: formatNumber(backendStats?.totalUsers || stats?.totalUsers || 0),
      icon: Users,
      trend: '+12.5%',
      delay: 0.2,
      isBackendData: !!backendStats?.totalUsers
    },
    {
      title: 'Active Chains',
      value: backendStats?.activeGroups || stats?.activeChains || 0,
      icon: Layers,
      trend: '+8.2%',
      delay: 0.3,
      isBackendData: !!backendStats?.activeGroups
    },
    {
      title: 'Total Volume',
      value: formatCurrency(backendStats?.totalVolume || stats?.totalVolume || 0),
      icon: DollarSign,
      trend: '+15.3%',
      delay: 0.4,
      isBackendData: !!backendStats?.totalVolume
    },
    {
      title: 'System Uptime',
      value: formatPercentage(backendStats?.systemUptime || stats?.systemUptime || 0),
      icon: Shield,
      trend: backendHealth ? '+0.1%' : '+0.1%',
      delay: 0.5,
      isBackendData: !!backendStats?.systemUptime
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your savings and investments today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Backend Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted">
              {backendHealth ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Backend Connected</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Backend Offline</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Not Connected</span>
                </>
              )}
            </div>

             <Button 
              onClick={loadDashboardData} 
              disabled={isLoading || backendLoading}
              variant="outline"
              size="default"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || backendLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Link to="/dashboard/chains/new">
              <Button className="gradient-primary text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Chain
              </Button>
            </Link>
            <Link to="/dashboard/chains">
              <Button variant="outline">
                <Layers className="mr-2 h-4 w-4" />
                Browse Chains
              </Button>
            </Link>
          </div>
        </div>

        {/* Backend Error Alert */}
        {backendError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              Backend Error: {backendError}
            </AlertDescription>
          </Alert>
        )}

        {/* Backend Data Timestamp */}
        {lastBackendUpdate && (
          <p className="text-xs text-muted-foreground mt-2">
            Backend data last updated: {lastBackendUpdate.toLocaleTimeString()}
          </p>
        )}
      </motion.div>

      {/* User Profile Cardnwith Backend Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="gradient-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-lg">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                  </span>
                  {isAuthenticated && (
                    <Badge variant={backendHealth ? 'default' : 'secondary'} className="gap-1">
                      {backendHealth ? 'Backend Active' : 'Demo Mode'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  {backendBalance 
                    ? `${(parseInt(backendBalance) / 100000000).toFixed(4)} ICP`
                    : formatCurrency(userBalance?.totalValue || 0)
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {backendBalance ? 'ICP Balance' : 'Total Portfolio'}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: stat.delay }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        {stat.isBackendData && (
                          <Badge variant="default" className="h-4 px-1 text-xs">
                            Live
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Health Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health (24h)
                  {backendHealth !== null && (
                    <Badge variant={backendHealth ? 'default' : 'destructive'}>
                      {backendHealth ? 'Connected' : 'Offline'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Real-time system performance and uptime metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[95, 100]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Uptime']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      backendHealth === true ? 'bg-green-500' : 
                      backendHealth === false ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      Status: {backendHealth === true ? 'Healthy' : 
                               backendHealth === false ? 'Backend Offline' : 
                               systemHealth?.status === 'healthy' ? 'Healthy' : 'Warning'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last block: {formatRelativeTime(systemHealth?.lastBlock || '')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Balance</CardTitle>
                <CardDescription>
                  Your R Tokens and liquid assets breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backend R Tokens */}
                {rTokenBalance && Array.isArray(rTokenBalance) && rTokenBalance.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">Live R Tokens</h3>
                      <Badge variant="default" className="h-4 px-1 text-xs">
                        Backend
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {rTokenBalance.map((token: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                              <span className="text-white text-xs font-bold">R</span>
                            </div>
                            <div>
                              <div className="font-medium">Group {token.groupId || index + 1}</div>
                              <div className="text-sm text-muted-foreground">
                                Live Data
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{token.amount || 0}</div>
                            <div className="text-sm text-muted-foreground">
                              R Tokens
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Original R Tokens */}
                <div>
                  <h3 className="font-semibold mb-3">R Tokens</h3>
                  <div className="space-y-3">
                    {userBalance?.rTokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white text-xs font-bold">R</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              Liquidity: {formatPercentage(token.liquidityRatio * 100)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{token.balance.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(token.usdValue)}
                          </div>
                        </div>
                      </div>
                    ))} 
                  </div>
                </div>

                {/* Liquid Assets */}
                <div>
                  <h3 className="font-semibold mb-3">Liquid Assets</h3>
                  <div className="space-y-3">
                    {userBalance?.liquidAssets.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <span className="text-accent-foreground text-xs font-bold">
                              {asset.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{asset.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{asset.balance.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(asset.usdValue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest transactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {activity.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {activity.amount.toFixed(2)} {activity.tokenSymbol}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/dashboard/activity">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chains Joined</span>
                    <span className="font-medium">4</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Target</span>
                    <span className="font-medium">$2,500</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staking Rewards</span>
                    <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                {/* Backend Connection Status */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Backend Status</span>
                    <span className={`font-medium ${backendHealth ? 'text-green-600' : 'text-red-600'}`}>
                      {backendHealth ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <Progress value={backendHealth ? 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-24 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard