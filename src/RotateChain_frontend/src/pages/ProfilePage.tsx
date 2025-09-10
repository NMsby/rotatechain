import React from 'react'
import { motion } from 'motion/react'
import { User, Shield, Clock, Wallet, Edit, Settings } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import BackButton from '../components/common/BackButton'
import { useAuth } from '../contexts/AuthContext'
import { formatRelativeTime } from '../lib/utils'

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  const profileStats = [
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
      value: new Date(user.createdAt).toLocaleDateString(),
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
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
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
                    <div className="font-semibold">{user.name}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="font-semibold">{user.email}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <div className="font-mono text-sm bg-muted rounded p-2">{user.id}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                    <div className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</div>
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
                  Wallet & Identity
                </CardTitle>
                <CardDescription>
                  Your blockchain wallet and Internet Identity information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                    <div className="font-mono text-sm bg-muted rounded p-3 break-all">
                      {user.walletAddress}
                    </div>
                  </div>
                  
                  {user.internetIdentityPrincipal && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Internet Identity Principal</label>
                      <div className="font-mono text-sm bg-muted rounded p-3 break-all">
                        {user.internetIdentityPrincipal}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Your identity is secured by cryptographic authentication</span>
                  </div>
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
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-sm text-muted-foreground">Contributions Made</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-muted-foreground">Payouts Received</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-muted-foreground">Pool Interactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage