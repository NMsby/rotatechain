// src/types.ts
export interface UserData {
  principal: string;
  username: string;
  lastLogin: string;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  login: (principal: string) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface InternetIdentityLoginProps {
  onClick: () => void;
  isLoading: boolean;
}

export interface LoginPageProps {
  onLogin: (principal: string) => void;
}

export interface DashboardProps {
  userData: UserData;
  onLogout: () => Promise<void>;
}