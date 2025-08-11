

// src/features/counter/counterSlice.ts
import { Actor, ActorSubclass } from '@dfinity/agent';
import { CreateChainParams,_SERVICE } from '../../../declarations/chain_management/chain_management.did';
import { AuthClient } from '@dfinity/auth-client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chain } from '../rotate_dashboard_graph_payment';

type UserState = {
  authClient: AuthClient | null,
  roundChain:Chain | null      
}

/*The initial state */
const initialState: UserState = {
  authClient:null,
  roundChain:null
};

/*-------------------------------------------------End of the initial state-------------------------------------------*/

const authClientSlice = createSlice({
  name: 'authClient',
  initialState:initialState.authClient,
  reducers: {
    update: (state,action:PayloadAction<AuthClient | null>) => {
        let newActor = action.payload
        return newActor
    }
  },
});

export const {update} = authClientSlice.actions;
export const authClientSliceReducer = authClientSlice.reducer;

const roundChainSlice = createSlice({
  name: 'roundChain',
  initialState:initialState.roundChain,
  reducers: {
    roundUpdate: (state,action:PayloadAction<Chain | null>) => {
        
        let newActor = action.payload
        if(newActor){
          return newActor
        }    
    }
  },
});

export const {roundUpdate} = roundChainSlice.actions;
export const roundSliceReducer = roundChainSlice.reducer;