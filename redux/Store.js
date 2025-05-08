import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './MainSlice';

export const store = configureStore({
  reducer: {
    main: mainReducer,
    // Add other reducers here as your app grows
  },
  // Optional middleware configuration
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
  // Optional devTools configuration
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;