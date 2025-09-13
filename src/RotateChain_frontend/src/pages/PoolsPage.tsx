import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { DollarSign, TrendingUp, Users, Eye, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import BackButton from '../components/common/BackButton'
import Pagination from '../components/common/Pagination'
import { mockApi } from '../lib/mockApi'
import { formatCurrency, formatPercentage, formatNumber } from '../lib/utils'
import type { Pool, PaginatedResponse } from '../types'

export function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const pageSize = 9

  useEffect(() => {
    loadPools()
  }, [currentPage])

  const loadPools = async () => {
    try {
      setIsLoading(true)
      const response: PaginatedResponse<Pool> = await mockApi.getPools(currentPage, pageSize)
      setPools(response.data)
      setTotalPages(response.meta.totalPages)
    } catch (error) {
      console.error('Failed to load pools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h1 className="text-3xl font-bold">Liquidity Pools</h1>
              <p className="text-muted-foreground">
                Stake your R Tokens and earn passive income through DeFi
              </p>
            </div>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Pool
          </Button>
        </div>
      </motion.div>

      {/* Pool Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold">{formatCurrency(2547893)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average APY</p>
                  <p className="text-2xl font-bold text-green-600">{formatPercentage(8.4)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Participants</p>
                  <p className="text-2xl font-bold">{formatNumber(1284)}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Pools Grid */}
      {isLoading ? (
        <PoolsGridSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 gradient-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(pool.status)}>
                            {pool.status}
                          </Badge>
                          <Badge className={getRiskColor(pool.riskLevel)}>
                            <div className="flex items-center gap-1">
                              {getRiskIcon(pool.riskLevel)}
                              {pool.riskLevel} risk
                            </div>
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatPercentage(pool.apy)}
                        </div>
                        <div className="text-xs text-muted-foreground">APY</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Pool Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Total Liquidity
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(pool.totalLiquidity)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Participants
                        </div>
                        <div className="font-semibold">
                          {formatNumber(pool.participants)}
                        </div>
                      </div>
                    </div>

                    {/* Token Info */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-accent-foreground text-xs font-bold">
                            {pool.tokenSymbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{pool.tokenSymbol}</div>
                          <div className="text-sm text-muted-foreground">
                            Primary token
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Yield Breakdown */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Yield Sources</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trading Fees</span>
                          <span>{formatPercentage(pool.apy * 0.6)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Lending</span>
                          <span>{formatPercentage(pool.apy * 0.3)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rewards</span>
                          <span>{formatPercentage(pool.apy * 0.1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                      {pool.status === 'active' && (
                        <Button size="sm" className="flex-1 gradient-primary text-white">
                          <Plus className="mr-2 h-3 w-3" />
                          Stake
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && pools.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">No pools available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No liquidity pools are currently available. Check back later or create your own pool.
            </p>
            <Button className="gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Pool
            </Button>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && pools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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

function PoolsGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="h-96">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-8" />
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
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PoolsPage