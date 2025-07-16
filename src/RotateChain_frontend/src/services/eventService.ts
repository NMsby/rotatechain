/*import { Actor, HttpAgent } from '@dfinity/agent';

// Mocked interface for the Event Canister

const EventServiceInterface = ({ IDL }) => {
  return IDL.Service({
    subscribe: IDL.Func([IDL.Principal], [], []),
    get_events: IDL.Func([IDL.Nat64], [IDL.Vec(IDL.Record({
      event_type: IDL.Text,
      data: IDL.Text,
      timestamp: IDL.Nat64
    }))], ['query']),
  });
};

class EventService {
  private agent: HttpAgent;
  private actor: any;
  private eventCallbacks: Record<string, Function[]> = {};
  
  constructor() {
    this.agent = new HttpAgent({ 
      host: process.env.DFX_NETWORK === 'ic' 
        ? 'https://ic0.app' 
        : 'http://localhost:4943'
    });
    
    this.actor = Actor.createActor(EventServiceInterface, {
      agent: this.agent,
      canisterId: process.env.EVENT_CANISTER_ID!
    });
  }
  
  async subscribe(principal: any) {
    await this.actor.subscribe(principal);
    this.startEventPolling();
  }
  
  on(eventType: string, callback: Function) {
    if (!this.eventCallbacks[eventType]) {
      this.eventCallbacks[eventType] = [];
    }
    this.eventCallbacks[eventType].push(callback);
  }
  
  off(eventType: string, callback: Function) {
    if (this.eventCallbacks[eventType]) {
      this.eventCallbacks[eventType] = this.eventCallbacks[eventType].filter(
        cb => cb !== callback
      );
    }
  }
  
  private async startEventPolling() {
    let lastTimestamp = BigInt(0);
    
    setInterval(async () => {
      try {
        const events = await this.actor.get_events(lastTimestamp);
        
        for (const event of events) {
          this.triggerEvent(event.event_type, JSON.parse(event.data));
          lastTimestamp = event.timestamp > lastTimestamp 
            ? event.timestamp 
            : lastTimestamp;
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }, 5000); // Poll every 5 seconds
  }
  
  private triggerEvent(eventType: string, data: any) {
    if (this.eventCallbacks[eventType]) {
      this.eventCallbacks[eventType].forEach(callback => callback(data));
    }
  }
}

export const eventService = new EventService();*/