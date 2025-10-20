// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { User as UserIcon, Shield, Clock, Wallet, Edit, Settings, Phone } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import BackButton from '../components/common/BackButton'
import { useAuth } from '../contexts/AuthContext'

/**
 * Local User interface — adapt to your real / shared type if you have one.
 * Make sure your AuthContext returns the same shape (or update accordingly).
 */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  walletAddress?: string
  internetIdentityPrincipal?: string
  walletBalance?: number
  phone?: string         // optional — useful if your user record stores phone number
}

export const ProfilePage: React.FC = () => {
  // Tell TypeScript what we expect useAuth to return (adjust if your context exports types)
  const { user } = useAuth() as { user: User | null }

  // Local state for M-Pesa deposit
  const [phone, setPhone] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Pre-fill phone if available on user object
  useEffect(() => {
    if (user?.phone) setPhone(user.phone)
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }
  
const [walletBalance, setWalletBalance] = useState(
  typeof user.walletBalance === "number" ? user.walletBalance : 0
);

  // Stats shown on left card
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

  // Validate phone roughly (expects Kenyan format -> starts with 254 or 07)
  const isValidPhone = (p: string) => {
    const trimmed = p.trim()
    // Accepts '2547XXXXXXXX' or '07XXXXXXXX' or '+2547XXXXXXXX'
    return /^(?:\+?254|0)7\d{8}$/.test(trimmed)
  }

  // Simple amount validation
  const isValidAmount = (a: string) => {
    const n = Number(a)
    return !Number.isNaN(n) && n > 0
  }

  /**
   * handleDeposit
   * Calls your backend endpoint to initiate an STK Push
   *
   * NOTE:
   * - Adjust BACKEND_URL to your running backend address.
   * - For local testing with Safaricom sandbox, expose your callback via ngrok and set that URL in backend env.
   */
  const handleDeposit = async () => {
  setMessage('');
  setError('');

  if (!isValidPhone(phone)) {
    setError('Please enter a valid Kenyan phone number (e.g. 2547XXXXXXXX or 07XXXXXXXX).');
    return;
  }
  if (!isValidAmount(amount)) {
    setError('Please enter a valid amount greater than 0.');
    return;
  }

  setLoading(true);

  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
    console.log("Using backend URL:", BACKEND_URL);

    const resp = await fetch(`${BACKEND_URL}/api/stkpush`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone.trim(),
        amount: Number(amount),
        userId: user.id,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      // ✅ Update wallet balance locally
      setWalletBalance((prev) => prev + Number(amount));

      setMessage(
        '✅ STK Push sent. Check your phone and enter your M-Pesa PIN to complete the payment.'
      );

      // reset fields
      setPhone('');
      setAmount('');
    } else {
      const errMsg = data?.error || data?.message || 'Failed to initiate payment.';
      setError(`❌ ${errMsg}`);
    }
  } catch (err) {
    console.error('Error initiating STK Push:', err);
    setError('⚠️ Network error. Could not reach backend.');
  } finally {
    setLoading(false);
  }
};


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
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
                      {user.name
                        .split(' ')
                        .map((n) => (n[0] || '').toUpperCase())
                        .join('')}
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
                  <UserIcon className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and settings</CardDescription>
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

{/* Wallet + M-Pesa Section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  <Card
    style={{
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}
  >
    <CardHeader
      style={{
        background: "linear-gradient(90deg, #34b233, #25a244)", // Mpesa green gradient
        color: "white",
        padding: "16px",
      }}
    >
      <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Wallet className="h-5 w-5" style={{ color: "white" }} />
        Wallet & M-Pesa
      </CardTitle>
      <CardDescription style={{ color: "rgba(255,255,255,0.9)" }}>
        Deposit funds to your wallet using M-Pesa STK Push
      </CardDescription>
    </CardHeader>

    <CardContent style={{ padding: "20px" }}>
      {/* Wallet Balance */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#666",
          }}
        >
          Wallet Balance
        </label>
        <div
  style={{
    fontFamily: "monospace",
    fontSize: "16px",
    background: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
  }}
>
  {walletBalance} KES
</div>

      </div>

      {/* Phone Number */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
          }}
        >
          Phone Number
        </label>
        <input
          type="text"
          placeholder="2547XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
          }}
        >
          Amount (KES)
        </label>
        <input
          type="number"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Deposit Button */}
      <Button
        onClick={handleDeposit}
        disabled={loading}
        style={{
          width: "100%",
          background: "#34b233",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.3s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = "#2a8f29")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background = "#34b233")
        }
      >
        <Phone className="mr-2 h-4 w-4" />
        {loading ? "Processing..." : "Deposit with M-Pesa"}
      </Button>

      {/* Messages */}
      <div style={{ marginTop: "12px", minHeight: "1.4rem", textAlign: "center" }}>
        {message && <p style={{ fontSize: "14px", color: "green" }}>{message}</p>}
        {error && <p style={{ fontSize: "14px", color: "red" }}>{error}</p>}
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
                <CardDescription>Manage your security settings and account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates about your chains and contributions</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Privacy Mode</div>
                      <div className="text-sm text-muted-foreground">Hide your activity from other users</div>
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
                <CardDescription>Your account activity over the last 30 days</CardDescription>
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
