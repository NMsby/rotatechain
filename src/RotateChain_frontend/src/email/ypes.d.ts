/*import { Principal } from '@dfinity/principal';

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
}*/