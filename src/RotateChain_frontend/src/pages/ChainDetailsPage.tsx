import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Loader2, DollarSign, Users, Clock, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import BackButton from '../components/common/BackButton'
import { mockApi } from '../lib/mockApi'
import { formatCurrency, formatRelativeTime } from '../lib/utils'
import type { Chain } from '../types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/dialog'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useQuery } from '@tanstack/react-query'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'

export function ChainDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch chain data using react-query
  const { data: chain, isLoading, error, refetch } = useQuery<Chain, Error>({
    queryKey: ['chain', id],
    queryFn: () => mockApi.getChain(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const handleDelete = async () => {
    if (!chain) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await mockApi.deleteChain(chain.id)
      // Redirect to the chains list page after successful deletion
      navigate('/dashboard/chains', { state: { message: 'Chain deleted successfully.' } })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete chain.')
      setIsDeleting(false)
    }
  }

  const handleUpdate = async (updatedData: Partial<Chain>) => {
    if (!chain) return
    try {
        await mockApi.updateChain(chain.id, updatedData)
        setIsEditing(false)
        refetch() // Refetch data to show updates
    } catch (error) {
        console.error("Update failed:", error);
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <BackButton to="/dashboard/chains" />
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-center text-muted-foreground">Loading Chain Details...</p>
      </div>
    )
  }

  if (error || !chain) {
    return (
        <Alert variant="destructive">
            <AlertDescription>{error?.message || `Chain with ID: ${id} not found.`}</AlertDescription>
            <div className="mt-4">
                <BackButton to="/dashboard/chains">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chains
                </BackButton>
            </div>
        </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'forming':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }
  
  // New function to color the feature tier badge
  const getFeatureColor = (feature: string) => {
    switch (feature) {
      case 'premium':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Internal component for editing
  const EditForm = ({ currentChain, onSave, onCancel }) => {
    const [name, setName] = useState(currentChain.name);
    const [description, setDescription] = useState(currentChain.description);
    const [isSaving, setIsSaving] = useState(false);

    const isDirty = name !== currentChain.name || description !== currentChain.description;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ name, description });
        setIsSaving(false);
    }
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Edit Chain Details</h3>
            <p className="text-sm text-muted-foreground">Update the core information for the {currentChain.name} chain. Financial parameters cannot be changed after creation.</p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Chain Name</label>
                    <Input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button 
                    className="flex-1" 
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    )
  }


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard/chains" />
            <div>
              <h1 className="text-3xl font-bold">{chain.name}</h1>
              <CardDescription className="text-lg flex items-center gap-2">
                Chain ID: <code className="text-sm bg-muted px-2 py-0.5 rounded">{chain.id}</code>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Chain'}
            </Button>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the 
                            <span className="font-semibold px-1">{chain.name}</span> savings chain 
                            and remove its data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                        <Alert variant="destructive">
                            <AlertDescription>{deleteError}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Confirm Deletion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                {isEditing ? (
                    <Card className="p-6 gradient-card">
                        <EditForm currentChain={chain} onSave={handleUpdate} onCancel={() => setIsEditing(false)} />
                    </Card>
                ) : (
                    <Card className="gradient-card">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>Chain description and core parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-base text-foreground">{chain.description}</div>
                            
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        Contribution Amount
                                    </div>
                                    <div className="text-lg font-bold">{formatCurrency(chain.contributionAmount)}</div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        Members
                                    </div>
                                    <div className="text-lg font-bold">{chain.totalMembers} / {chain.totalRounds}</div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Rotation Period
                                    </div>
                                    <div className="text-lg font-bold">{chain.rotationPeriod} Days</div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        Current Round
                                    </div>
                                    <div className="text-lg font-bold">{chain.currentRound}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>

        {/* Status/Projections Sidebar */}
        <div className="lg:col-span-1 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Card className="gradient-card">
                    <CardHeader>
                        <CardTitle>Status & Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className={getStatusColor(chain.status)}>{chain.status}</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Chain Type</span>
                            <Badge variant="outline" className="capitalize">{chain.chainType}</Badge>
                        </div>

                        <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-muted-foreground">Feature Tier</span>
                            <Badge className={getFeatureColor(chain.chainFeature)}>{chain.chainFeature}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rotation Progress</span>
                                <span className="font-medium">
                                    {Math.round((chain.currentRound / chain.totalRounds) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className="gradient-primary h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${(chain.currentRound / chain.totalRounds) * 100}%` 
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground border-t pt-4">
                            Next Payout: <span className="font-medium text-foreground">{formatRelativeTime(chain.nextPayoutDate)}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChainDetailsPage