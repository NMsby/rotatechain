/*import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '../../../declarations/groupManager';
import { Principal } from '@dfinity/principal';

interface Invite {
  groupId: string;
  creator: Principal;
  email: string;
  expiresAt: Time.Time;
  used: boolean;
}

const JoinGroupPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [email, setEmail] = useState<string>('');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
      }
      
      try {
        setLoading(true);
        const actor = createActor(canisterId);
        const result = await actor.getInvite(token || '');
        
        if ('ok' in result) {
          setInvite(result.ok);
        } else {
          setError(result.err);
        }
      } catch (err) {
        setError('Failed to fetch invite details');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) init();
  }, [token]);

  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic" 
        ? "https://identity.ic0.app" 
        : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal());
      }
    });
  };

  const joinGroup = async () => {
    if (!token || !authClient) return;
    
    try {
      setLoading(true);
      const actor = createActor(canisterId, {
        agentOptions: { identity: authClient.getIdentity() }
      });
      
      const result = await actor.joinGroupByEmail(token, email);
      
      if ('ok' in result) {
        setSuccess('Successfully joined the group!');
        setTimeout(() => navigate(`/group/${result.ok}`), 2000);
      } else {
        setError(result.err);
      }
    } catch (err) {
      setError('Failed to join group');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!authClient || loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Group Invitation</h1>
      
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      
      {invite && (
        <div className="invite-details">
          <p>You've been invited to join a group</p>
          <p>Invite sent to: {invite.email}</p>
          
          {!principal ? (
            <div>
              <p>Please login to accept the invitation</p>
              <button onClick={login}>Login with Internet Identity</button>
            </div>
          ) : (
            <div>
              <p>Please confirm your email matches the invite:</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={invite.email}
              />
              <button 
                onClick={joinGroup}
                disabled={loading || email !== invite.email}
              >
                {loading ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinGroupPage;*/