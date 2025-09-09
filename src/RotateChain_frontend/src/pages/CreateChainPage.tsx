import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form@7.55.0'
import * as z from 'zod'
import { Loader2, Plus, DollarSign, Users, Clock, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import BackButton from '../components/common/BackButton'
import { mockApi } from '../lib/mockApi'
import { formatCurrency } from '../lib/utils'
import type { CreateChainFormData } from '../types'

const formSchema = z.object({
  name: z.string().min(3, 'Chain name must be at least 3 characters').max(50, 'Chain name must be less than 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  contributionAmount: z.number().min(10, 'Minimum contribution is $10').max(10000, 'Maximum contribution is $10,000'),
  rotationPeriod: z.number().min(1, 'Minimum rotation period is 1 day').max(365, 'Maximum rotation period is 365 days'),
  maxMembers: z.number().min(3, 'Minimum 3 members required').max(50, 'Maximum 50 members allowed'),
  chainType: z.enum(['standard', 'premium', 'enterprise'], {
    required_error: 'Please select a chain type',
  }),
})

type FormData = z.infer<typeof formSchema>

export function CreateChainPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      contributionAmount: 100,
      rotationPeriod: 30,
      maxMembers: 10,
      chainType: 'standard',
    },
  })

  const watchedValues = form.watch()

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      const chainData: CreateChainFormData = {
        name: data.name,
        description: data.description,
        contributionAmount: data.contributionAmount,
        rotationPeriod: data.rotationPeriod,
        maxMembers: data.maxMembers,
        chainType: data.chainType,
      }

      const newChain = await mockApi.createChain(chainData)
      
      // Redirect to the new chain's detail page
      navigate(`/dashboard/chains/${newChain.id}`, {
        state: { 
          message: 'Chain created successfully! You can now invite members to join.' 
        }
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create chain')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateProjections = () => {
    const { contributionAmount, maxMembers, rotationPeriod } = watchedValues
    if (!contributionAmount || !maxMembers || !rotationPeriod) return null

    const totalPool = contributionAmount * maxMembers
    const totalCycles = maxMembers
    const totalDuration = totalCycles * rotationPeriod

    return {
      totalPool,
      totalCycles,
      totalDuration,
      monthlyContribution: contributionAmount * (30 / rotationPeriod),
    }
  }

  const projections = calculateProjections()

  const chainTypeInfo = {
    standard: {
      description: 'Basic savings chain with standard features',
      features: ['Basic automation', 'Standard support', 'Mobile app access'],
      fee: '0.5%',
    },
    premium: {
      description: 'Enhanced features with priority support',
      features: ['Advanced automation', 'Priority support', 'Analytics dashboard', 'Custom rules'],
      fee: '0.75%',
    },
    enterprise: {
      description: 'Full-featured with dedicated support',
      features: ['Full automation', 'Dedicated support', 'Advanced analytics', 'API access', 'White-label options'],
      fee: '1%',
    },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <BackButton to="/dashboard/chains" />
          <div>
            <h1 className="text-3xl font-bold">Create New Savings Chain</h1>
            <p className="text-muted-foreground">
              Set up a new rotational savings group for your community
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Chain Details
                </CardTitle>
                <CardDescription>
                  Configure your savings chain parameters and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chain Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., College Fund Savings Circle" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Choose a descriptive name for your savings chain
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the purpose and goals of this savings chain..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Explain what this chain is for and any specific rules or requirements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Financial Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Financial Settings</h3>
                      
                      <FormField
                        control={form.control}
                        name="contributionAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contribution Amount (USD) *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number"
                                  placeholder="100"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Amount each member contributes per rotation period
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rotationPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rotation Period (Days) *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number"
                                  placeholder="30"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              How often payouts occur (recommended: 7, 14, or 30 days)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Group Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Group Settings</h3>
                      
                      <FormField
                        control={form.control}
                        name="maxMembers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Members *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number"
                                  placeholder="10"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Total number of members who can join this chain
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chainType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chain Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select chain type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(chainTypeInfo).map(([type, info]) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      <span className="capitalize">{type}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {info.fee} fee
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the feature level for your chain
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Chain Type Information */}
                    {watchedValues.chainType && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Shield className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <h4 className="font-semibold capitalize">{watchedValues.chainType} Chain</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {chainTypeInfo[watchedValues.chainType].description}
                                </p>
                                <ul className="text-sm space-y-1">
                                  {chainTypeInfo[watchedValues.chainType].features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full gradient-primary text-white"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Chain...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Savings Chain
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Projections */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chain Projections</CardTitle>
                <CardDescription>
                  Based on your current settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projections ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Pool per Round</span>
                        <span className="font-semibold">{formatCurrency(projections.totalPool)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Cycles</span>
                        <span className="font-semibold">{projections.totalCycles}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Duration</span>
                        <span className="font-semibold">{projections.totalDuration} days</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Commitment</span>
                        <span className="font-semibold">{formatCurrency(projections.monthlyContribution)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <div className="text-sm text-muted-foreground">You'll receive</div>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(projections.totalPool)}
                        </div>
                        <div className="text-xs text-muted-foreground">when it's your turn</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Fill in the form to see projections</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm">Choose a contribution amount everyone can afford consistently</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm">Start with people you know and trust</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm">Clearly communicate the purpose and rules</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm">Consider shorter rotation periods for smaller groups</p>
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

export default CreateChainPage