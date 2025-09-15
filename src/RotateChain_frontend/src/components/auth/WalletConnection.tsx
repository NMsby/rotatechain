import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Wallet, LogOut, User, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/badge'

export const WalletConnection: React.FC = () => {
    const { user, isAuthenticated, isLoading, principal, login, logout } = useAuth();

    // Determine auth method from stored data
    const authMethod = localStorage.getItem('rotatechain_auth_method') || 'unknown';
    const isInternetIdentity = authMethod === 'internet_identity';
    const isMockAuth = authMethod === 'mock';

    if (isLoading) {
        return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Connecting to Identity...</span>
            </CardContent>
        </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Connected
                    </div>
                    <Badge variant={isInternetIdentity ? 'default' : 'secondary'}>
                        {isInternetIdentity ? 'Internet Identity' : 'Mock Auth'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                {/* Principal/Wallet Address */}
                <div className="bg-muted p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {isInternetIdentity ? 'Principal ID:' : 'Wallet Address:'}
                        </p>
                        <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="font-mono text-xs break-all bg-background p-2 rounded border">
                        {isInternetIdentity ? principal : user.walletAddress}
                    </p>
                </div>

                {/* Environment Info for Development */}
                {import.meta.env.MODE === 'development' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            Development Mode: Using {isInternetIdentity ? 'Internet Identity' : 'Mock Authentication'}
                        </p>
                    </div>
                )}

                <Button onClick={logout} variant="outline" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                </Button>
            </CardContent>
        </Card>
    );
  }

 return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sign in to access your RotateChain dashboard
          </p>
        </div>
        
        <Button onClick={login} className="w-full" size="lg">
          {import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true' 
            ? 'Connect with Internet Identity'
            : 'Sign In (Demo Mode)'
          }
        </Button>

        {/* Development Info */}
        {import.meta.env.MODE === 'development' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Dev Mode: {import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true' ? 'Real' : 'Mock'} Authentication
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnection;