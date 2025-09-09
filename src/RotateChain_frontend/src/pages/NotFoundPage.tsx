import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto space-y-8"
        >
          {/* 404 Illustration */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-9xl font-bold gradient-primary bg-clip-text text-transparent"
            >
              404
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold">Page Not Found</h1>
              <p className="text-muted-foreground text-lg">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </motion.div>
          </div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              Here are some helpful links to get you back on track:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="gradient-primary text-white group">
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Go Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Button>
            </div>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pt-8 border-t border-border"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Search className="h-4 w-4" />
                <span className="text-sm">Looking for something specific?</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link to="/dashboard/chains">
                  <Button variant="ghost" size="sm">Savings Chains</Button>
                </Link>
                <Link to="/dashboard/pools">
                  <Button variant="ghost" size="sm">Liquidity Pools</Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-sm text-muted-foreground"
          >
            <p>
              Still having trouble? {' '}
              <Link 
                to="/contact" 
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage