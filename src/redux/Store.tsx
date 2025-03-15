import { configureStore, combineReducers } from '@reduxjs/toolkit';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';
import mainReducer from './slices/mainSlice.ts'

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

// Combine parent and child reducers
const rootReducer:any = combineReducers({
  main: mainReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
});

// Create the persistor
const persistor = persistStore(store);

// Export both store and persistor
export { store, persistor }; // Ensure this line is included


export const clearAllStorage = () => ({
  type: 'persist/PURGE', // Use 'persist/PURGE' for redux-persist v6
  keys: ['main'], // Add keys for all your slices
  result: () => null,
});

