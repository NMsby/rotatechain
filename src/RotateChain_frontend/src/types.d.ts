// src/types.ts
import { Principal } from '@dfinity/principal';

declare global {
  type GroupId = string;
  type InviteToken = string;
  type Email = string;

  interface Group {
    id: GroupId;
    name: string;
    owner: Principal;
    members: Principal[];
    createdAt: Time.Time;
  }

  interface Invite {
    groupId: GroupId;
    creator: Principal;
    email: Email;
    expiresAt: Time.Time;
    used: boolean;
  }

  // Extend Window interface for IC specific types
  interface Window {
    ic: {
      plug?: any;
      infinityWallet?: any;
    };
  }
}


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