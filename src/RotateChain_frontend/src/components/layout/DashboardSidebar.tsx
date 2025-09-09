import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Layers,
  DollarSign,
  User,
  Settings,
  Plus,
  TrendingUp,
  Shield,
  HelpCircle
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar'
import { cn } from '../../lib/utils'

export function DashboardSidebar() {
  const location = useLocation()

  const mainNavigation = [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Chains',
      url: '/dashboard/chains',
      icon: Layers,
    },
    {
      title: 'Groups',
      url: '/dashboard/groups',
      icon: Users,
    },
    {
      title: 'Liquidity Pools',
      url: '/dashboard/pools',
      icon: DollarSign,
    },
  ]

  const quickActions = [
    {
      title: 'Create Chain',
      url: '/dashboard/chains/new',
      icon: Plus,
    },
    {
      title: 'Market Analysis',
      url: '/dashboard/analytics',
      icon: TrendingUp,
    },
  ]

  const accountNavigation = [
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: User,
    },
    {
      title: 'Security',
      url: '/dashboard/security',
      icon: Shield,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
    {
      title: 'Help & Support',
      url: '/dashboard/help',
      icon: HelpCircle,
    },
  ]

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(item.url)}
                      className={cn(
                        'transition-colors',
                        isActivePath(item.url) && 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                    >
                      <Link to={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(item.url)}
                      className={cn(
                        'transition-colors',
                        isActivePath(item.url) && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Link to={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(item.url)}
                      className={cn(
                        'transition-colors',
                        isActivePath(item.url) && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Link to={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default DashboardSidebar