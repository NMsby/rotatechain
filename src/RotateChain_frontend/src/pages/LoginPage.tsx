import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Loader2, Shield, Zap, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useAuth } from '../contexts/AuthContext'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await login()
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'No passwords, no personal data stored. Your identity is protected by cryptography.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sign in with a single click. No forms to fill, no verification emails.',
    },
    {
      icon: Users,
      title: 'Universal Access',
      description: 'Works across all devices and platforms. One identity for everything.',
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="font-bold text-white">RC</span>
              </div>
              <span className="font-bold text-2xl">RotateChain</span>
            </Link>
          </div>

          {/* Login Card */}
          <Card className="gradient-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your RotateChain account using Internet Identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Internet Identity Login */}
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full gradient-primary text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              {/* Demo Notice */}
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  🚧 Demo Mode Active
                </div>
                <p className="text-xs text-muted-foreground">
                  
                </p>
                {import.meta.env.MODE === 'development' && (
                  <div className="text-center text-xs text-muted-foreground">
                    <p>
                      Environment: {import.meta.env.VITE_USE_MOCK_AUTH === 'true' ? 'Mock Authentication' : 'Internet Identity II'}
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    New to RotateChain?
                  </span>
                </div>
              </div>

              {/* Create Account */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary"
                    onClick={handleLogin}
                  >
                    Create one now
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              Protected by Internet Identity cryptographic authentication.{' '}
              <Link to="/security" className="text-primary hover:underline">
                Learn more about security
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg mx-auto space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Secure. Simple. Powerful.
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience passwordless authentication with Internet Identity - 
              the future of secure web login.
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="pt-8">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU3MTYzNDYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Security Technology"
              className="rounded-2xl shadow-2xl w-full h-48 object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage