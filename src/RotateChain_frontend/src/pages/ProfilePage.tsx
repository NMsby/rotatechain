import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { User, Shield, Clock, Wallet, Edit, Settings, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import BackButton from '../components/common/BackButton'
import { useAuth } from '../contexts/AuthContext'
import { formatRelativeTime } from '../lib/utils'
import { 
  userService, 
  getUserProfile,
  getUserStats,
  getUserActivity 
} from '@/lib/icp/userService'
import type { 
  UserProfile, 
  UserStats,
  UserActivitySummary
} from '@/types/user'

export function ProfilePage() {
  const { user, isAuthenticated, getIdentity, getPrincipal } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [activity, setActivity] = useState<UserActivitySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData()
    }
  }, [isAuthenticated])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize user service
      await userService.initialize()

      // Load user data in parallel
      const [profileData, statsData, activityData] = await Promise.allSettled([
        getUserProfile(),
        getUserStats(),
        getUserActivity()
      ])

      // Handle profile data
      if (profileData.status === 'fulfilled' && profileData.value) {
        setProfile(profileData.value)
      }

      // Handle stats data
      if (statsData.status === 'fulfilled' && statsData.value) {
        setStats(statsData.value)
      }

      // Handle activity data
      if (activityData.status === 'fulfilled' && activityData.value) {
        setActivity(activityData.value)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <BackButton to="/dashboard" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadUserData} className="w-full">
          Try Again
        </Button>
      </div>
    )
  }

  // Show not authenticated state
  if (!user && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const displayProfile = profile || user  
  const profileAvatar = profile?.personalInfo?.avatar || (user as any)?.avatar
  const profileName = profile?.personalInfo?.displayName || (user as any)?.name
  const profileEmail = profile?.personalInfo?.email || (user as any)?.email
  const profileStats = stats ? [
    {
      label: 'Chains Joined',
      value: stats.activeGroupsCount + stats.completedGroupsCount,
      icon: Shield,
    },
    {
      label: 'Total Contributions',
      value: `$${stats.totalContributions.toLocaleString()}`,
      icon: Wallet,
    },
    {
      label: 'Member Since',
      value: new Date(stats.joinDate).toLocaleDateString(),
      icon: Clock,
    },
  ] : [
    {
      label: 'Chains Joined',
      value: '4',
      icon: Shield,
    },
    {
      label: 'Total Contributions',
      value: '$2,450',
      icon: Wallet,
    },
    {
      label: 'Member Since',
      value: displayProfile ? new Date(displayProfile.createdAt).toLocaleDateString() : 'Unknown',
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="gradient-card">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={profileAvatar} 
                      alt={profileName || 'User'} 
                    />
                    <AvatarFallback className="text-2xl">
                      {profileName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {profile?.personalInfo?.displayName || profileName || 'Anonymous User'}
                    </CardTitle>
                    <CardDescription>
                      {profile?.personalInfo?.email || profileEmail || 'No email provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {profile?.walletConnections?.internetIdentity?.isConnected ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {profileStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    )
                  })}
                </div>
                
                <Separator />
                
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <div className="font-semibold">{user?.name}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="font-semibold">{user?.email}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <div className="font-mono text-sm bg-muted rounded p-2">{user?.id}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                    <div className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wallet Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Internet Identity & Wallet
                </CardTitle>
                <CardDescription>
                  Your blockchain identity and connected wallets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Internet Identity Principal
                    </label>
                    <div className="font-mono text-sm bg-muted rounded p-3 break-all">
                      {profile?.principal || (user as any)?.internetIdentityPrincipal || 'Not connected'}
                    </div>
                  </div>
                  
                  {(user as any)?.walletAddress && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Wallet Address
                      </label>
                      <div className="font-mono text-sm bg-muted rounded p-3 break-all">
                        {(user as any).walletAddress}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Your identity is secured by cryptographic authentication</span>
                  </div>
                </div>

                <Separator />
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Security Center
                  </Button>
                </div>                
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Preferences
                </CardTitle>
                <CardDescription>
                  Manage your security settings and account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about your chains and contributions
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Enabled
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Privacy Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Hide your activity from other users
                      </div>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Security Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Summary</CardTitle>
                <CardDescription>
                  Your account activity over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">
                      {activity?.last30Days?.contributionsMade || 8}
                    </div>
                    <div className="text-sm text-muted-foreground">Contributions Made</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">
                      {activity?.last30Days?.payoutsReceived || 2}
                    </div>
                    <div className="text-sm text-muted-foreground">Payouts Received</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">
                      {activity?.last30Days?.poolInteractions || 5}
                    </div>
                    <div className="text-sm text-muted-foreground">Pool Interactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ICP Balance & Assets */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Asset Overview</CardTitle>
                  <CardDescription>
                    Your holdings and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        ${stats.rTokensValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">R Tokens Value</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                      <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {stats.averageYield.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Average Yield</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage