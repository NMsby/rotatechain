import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Wallet, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  Copy,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { toast } from 'sonner'

import { useAuth } from '../../contexts/AuthContext'
import { 
  connectPlugWallet, 
  disconnectPlugWallet, 
  isPlugInstalled, 
  isPlugConnected,
  getPlugBalance,
  getPlugPrincipal,
  plugWalletService,
  type PlugWalletInfo,
  type PlugBalanceResponse
} from '../../lib/wallet/plugWallet'

interface WalletConnectorProps {
  onConnectionChange?: (connected: boolean, walletInfo?: PlugWalletInfo) => void
  showBalance?: boolean
  compact?: boolean
}

export function WalletConnector({ 
  onConnectionChange, 
  showBalance = true, 
  compact = false 
}: WalletConnectorProps) {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletInfo, setWalletInfo] = useState<PlugWalletInfo | null>(null)
  const [balances, setBalances] = useState<PlugBalanceResponse[]>([])
  const [installed, setInstalled] = useState(false)
  const [connected, setConnected] = useState(false)

  // Check wallet installation and connection status
  const checkWalletStatus = useCallback(async () => {
    const isInstalled = isPlugInstalled()
    setInstalled(isInstalled)

    if (isInstalled) {
      const isConnected = await isPlugConnected()
      setConnected(isConnected)

      if (isConnected) {
        try {
          const principal = await getPlugPrincipal()
          const balanceData = await getPlugBalance()
          
          if (principal) {
            const info: PlugWalletInfo = {
              principal,
              accountId: '', // Will be filled by actual connection
              walletAddress: principal.toString(),
              balance: balanceData.find(b => b.symbol === 'ICP')?.amount || 0,
              isConnected: true
            }
            setWalletInfo(info)
            setBalances(balanceData)
          }
        } catch (error) {
          console.error('Error getting wallet info:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    checkWalletStatus()
  }, [checkWalletStatus])

  // Connect to Plug Wallet
  const handleConnect = async () => {
    if (!installed) {
      window.open('https://chrome.google.com/webstore/detail/plug/cfbfdhimifdmdehjmkdobpcjfefblkjm', '_blank')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const info = await connectPlugWallet({
        whitelist: [
          import.meta.env.VITE_ROTATECHAIN_BACKEND_CANISTER_ID || 'trmuc-riaaa-aaaan-qz6dq-cai'
        ],
        onConnectionUpdate: () => {
          console.log('Plug connection updated')
          checkWalletStatus()
        }
      })

      setWalletInfo(info)
      setConnected(true)

      // Get updated balances
      const balanceData = await getPlugBalance()
      setBalances(balanceData)

      toast.success('Plug Wallet connected successfully!')
      onConnectionChange?.(true, info)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect from Plug Wallet
  const handleDisconnect = async () => {
    setIsLoading(true)
    
    try {
      await disconnectPlugWallet()
      setWalletInfo(null)
      setBalances([])
      setConnected(false)
      toast.success('Wallet disconnected')
      onConnectionChange?.(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh wallet data
  const handleRefresh = async () => {
    if (!connected) return

    setIsLoading(true)
    try {
      await checkWalletStatus()
      const balanceData = await getPlugBalance()
      setBalances(balanceData)
      toast.success('Wallet data refreshed')
    } catch (error) {
      toast.error('Failed to refresh wallet data')
    } finally {
      setIsLoading(false)
    }
  }

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied to clipboard')
  }

  // Format principal for display
  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`
  }

  // Compact view for small spaces
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {connected && walletInfo ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Wallet className="h-3 w-3" />
              Plug Connected
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Connect Plug
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Plug Wallet
          {connected && <Badge variant="secondary">SECP256K1</Badge>}
        </CardTitle>
        <CardDescription>
          Connect your Plug Wallet to manage ICP tokens and interact with RotateChain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Installation Check */}
        {!installed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Plug Wallet extension is not installed.{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open('https://chrome.google.com/webstore/detail/plug/cfbfdhimifdmdehjmkdobpcjfefblkjm', '_blank')}
              >
                Install Plug Wallet
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status</span>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Wallet Information */}
        <AnimatePresence>
          {connected && walletInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Separator />
              
              {/* Principal */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Principal ID
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted rounded px-2 py-1 flex-1">
                    {formatPrincipal(walletInfo.principal.toString())}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress(walletInfo.principal.toString())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Balance Display */}
              {showBalance && balances.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Balances
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {balances.slice(0, 3).map((balance, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {balance.image && (
                            <img src={balance.image} alt={balance.symbol} className="h-4 w-4" />
                          )}
                          {balance.symbol}
                        </span>
                        <span className="font-mono">
                          {balance.amount.toLocaleString(undefined, { 
                            maximumFractionDigits: 4 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECP256K1 Info */}
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-300">
                  Using SECP256K1 cryptographic curve for enhanced security
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-2">
          {connected ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect Wallet
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleConnect}
              disabled={!installed || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!installed ? 'Install Plug Wallet' : 'Connect Plug Wallet'}
            </Button>
          )}
        </div>

        {/* Security Note */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
          <Shield className="h-3 w-3 inline mr-1" />
          Your private keys remain secure in your Plug Wallet extension
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletConnector