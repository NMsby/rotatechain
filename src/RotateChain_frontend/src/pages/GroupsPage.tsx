import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Users, DollarSign, TrendingUp, Clock, Eye } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import BackButton from '../components/common/BackButton'
import Pagination from '../components/common/Pagination'
// import { mockApi } from '../lib/mockApi'
import { realApi } from '../lib/realApi'
import { formatCurrency, formatRelativeTime } from '../lib/utils'
import type { Group, PaginatedResponse } from '../types'

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const pageSize = 12

  useEffect(() => {
    loadGroups()
  }, [currentPage])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const response: PaginatedResponse<Group> = await realApi.getGroups(currentPage, pageSize)
      setGroups(response.data)
      setTotalPages(response.meta.totalPages)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold">My Groups</h1>
            <p className="text-muted-foreground">
              Manage your active savings groups and track contributions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Groups Grid */}
      {isLoading ? (
        <GroupsGridSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 gradient-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge className={getStatusColor(group.status)}>
                          {group.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Members</div>
                        <div className="font-semibold">{group.members.length}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Financial Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Current Payout
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(group.currentPayout)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Total Pool
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(group.totalContributions)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contribution Progress</span>
                        <span className="font-medium">
                          {Math.round((group.currentPayout / group.totalContributions) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((group.currentPayout / group.totalContributions) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {formatRelativeTime(group.updatedAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && groups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">No groups yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't joined any savings groups yet. Browse available chains to find groups that match your savings goals.
            </p>
            <Button className="gradient-primary text-white">
              Browse Chains
            </Button>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && groups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </div>
  )
}

function GroupsGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="h-64">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default GroupsPage