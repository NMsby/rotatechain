    // src/app/store.ts
    import { configureStore } from '@reduxjs/toolkit';
    import { authClientSliceReducer, roundSliceReducer } from './slice';

    export const store = configureStore({
      reducer: {
        authReducer:authClientSliceReducer,
        roundReducer:roundSliceReducer
        // Add your slice reducers here
      },
    });

    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;