import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Shield, Layers, DollarSign, Users, Globe, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'
import { Progress } from '../components/ui/progress'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'

export function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Rotational Savings',
      description: 'Join or create savings groups where members contribute regularly and take turns receiving payouts.',
    },
    {
      icon: DollarSign,
      title: 'Liquidity Pool Staking',
      description: 'Earn passive income by staking your R Tokens in community-driven liquidity pools.',
    },
    {
      icon: Zap,
      title: 'Trade Mode Options',
      description: 'Multiple trading strategies including conservative, balanced, and aggressive options.',
    },
    {
      icon: Layers,
      title: 'Liquid R Tokens',
      description: 'Your contributions become liquid tokens that can be traded, staked, or used as collateral.',
    },
    {
      icon: Shield,
      title: 'Security & Transparency',
      description: 'Built on blockchain with smart contracts ensuring transparency and automated execution.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Participate from anywhere in the world with Internet Identity authentication.',
    },
  ]

  const faqItems = [
    {
      question: 'What is RotateChain?',
      answer: 'RotateChain is a revolutionary platform that combines traditional rotational savings groups (like susus or tandas) with modern DeFi capabilities. Members contribute to groups and receive liquid R Tokens that can be traded or staked.',
    },
    {
      question: 'How do R Tokens work?',
      answer: 'R Tokens are liquid contribution tokens you receive when you contribute to a savings chain. These tokens represent your stake and can be traded, staked in liquidity pools, or used as collateral for cross-group lending.',
    },
    {
      question: 'Is RotateChain secure?',
      answer: 'Yes, RotateChain is built on blockchain technology with smart contracts that ensure transparency and automated execution. We use Internet Identity for secure authentication without passwords.',
    },
    {
      question: 'How do I join a savings chain?',
      answer: 'After creating your account, browse available chains on the dashboard, review their terms (contribution amount, rotation period, etc.), and join with a single click. You\'ll start receiving R Tokens with your first contribution.',
    },
    {
      question: 'Can I create my own savings chain?',
      answer: 'Absolutely! You can create custom chains with your preferred contribution amount, rotation period, and maximum members. Invite friends or let others discover and join your chain.',
    },
    {
      question: 'What are the fees?',
      answer: 'RotateChain charges minimal platform fees (typically 0.5-1%) on transactions. Most of your contributions go directly to the savings pool, with small fees covering platform maintenance and security.',
    },
  ]

  // Mock data for interactive chart
  const chartData = [
    { name: 'Your Savings', value: 35, color: '#1e40af' },
    { name: 'Staking Rewards', value: 25, color: '#06b6d4' },
    { name: 'Trading Profits', value: 20, color: '#0891b2' },
    { name: 'Available', value: 20, color: '#e2e8f0' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Build Wealth{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Together
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Revolutionary platform combining rotational savings groups with modern DeFi capabilities. 
                  Get liquid contribution tokens and cross-group lending.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="gradient-primary text-white group">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="group">
                  <Play className="mr-2 h-5 w-5" />
                  How it Works
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">$2.5M+</div>
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,200+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98.5%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Interactive Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Your Portfolio Growth</CardTitle>
                  <CardDescription>
                    See how your savings and investments grow over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Why Choose RotateChain?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of collaborative finance with features designed for modern savers and investors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 gradient-card">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              How RotateChain Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start building wealth with your community
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjB0ZWNobm9sb2d5JTIwYmxvY2tjaGFpbnxlbnwxfHx8fDE3NTcxNjM0NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="RotateChain Technology"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </motion.div>

            {/* Right - Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                {
                  step: '01',
                  title: 'Create Account',
                  description: 'Sign up with Internet Identity for secure, passwordless authentication.',
                  progress: 100,
                },
                {
                  step: '02',
                  title: 'Join or Create Chain',
                  description: 'Browse existing savings chains or create your own with custom terms.',
                  progress: 75,
                },
                {
                  step: '03',
                  title: 'Contribute & Earn',
                  description: 'Make regular contributions and receive liquid R Tokens you can trade or stake.',
                  progress: 50,
                },
                {
                  step: '04',
                  title: 'Build Wealth',
                  description: 'Watch your savings grow through rotational payouts and DeFi opportunities.',
                  progress: 25,
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white font-bold">{item.step}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about RotateChain
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-background/50 backdrop-blur"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Start Building Wealth?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who are already growing their savings through collaborative finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="gradient-primary text-white group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage