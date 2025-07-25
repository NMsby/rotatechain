/*import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { canisterId, createActor } from '../../../declarations/groupManager';
import { Principal } from '@dfinity/principal';

interface Group {
  id: string;
  name: string;
  owner: Principal;
  members: Principal[];
  createdAt: Time.Time;
}

const EmailInviteManager: React.FC = () => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [expiresInHours, setExpiresInHours] = useState<number>(168); // 1 week
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
        await fetchUserGroups(identity.getPrincipal());
      }
    };
    initAuth();
  }, []);

  const getActor = () => {
    if (!authClient) return null;
    const identity = authClient.getIdentity();
    return createActor(canisterId, {
      agentOptions: { identity }
    });
  };

  const fetchUserGroups = async (userPrincipal: Principal) => {
    try {
      setLoading(true);
      const actor = getActor();
      if (!actor) throw new Error('Actor not initialized');
      
      const groupIds = await actor.getUserGroups(userPrincipal);
      
      const groupPromises = groupIds.map(async (groupId: string) => {
        const result = await actor.getGroup(groupId);
        if ('ok' in result) return { id: groupId, ...result.ok };
        return null;
      });
      
      const groups = (await Promise.all(groupPromises)).filter(Boolean) as Group[];
      setGroups(groups);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEmailInvite = async () => {
    if (!selectedGroup || !email) {
      setError('Please select a group and enter an email');
      return;
    }

    try {
      setLoading(true);
      const actor = getActor();
      if (!actor) throw new Error('Actor not initialized');
      
      const result = await actor.createEmailInvite(selectedGroup, email, expiresInHours);
      
      if ('ok' in result) {
        setSuccess(`Invite sent to ${email}`);
        setEmail('');
      } else {
        setError(result.err);
      }
    } catch (err) {
      setError('Failed to create invite');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic" 
        ? "https://identity.ic0.app" 
        : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal());
        await fetchUserGroups(identity.getPrincipal());
      }
    });
  };

  if (!authClient) return <div>Initializing...</div>;
  if (!principal) return <button onClick={login}>Login with Internet Identity</button>;

  return (
    <div className="container">
      <h1>Email Invite Manager</h1>
      
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      
      <section>
        <h2>Your Groups</h2>
        {loading && groups.length === 0 ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p>You don't have any groups yet.</p>
        ) : (
          <div className="group-list">
            {groups.map(group => (
              <div 
                key={group.id} 
                className={`group-item ${selectedGroup === group.id ? 'selected' : ''}`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <h3>{group.name}</h3>
                <p>Members: {group.members.length}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {selectedGroup && (
        <section className="invite-section">
          <h2>Send Email Invite</h2>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Expires in (hours):</label>
            <input
              type="number"
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(Number(e.target.value))}
              min="1"
            />
          </div>
          <button 
            onClick={createEmailInvite}
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </section>
      )}
    </div>
  );
};

export default EmailInviteManager;*/