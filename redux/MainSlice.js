import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthMenu: false,
  userId: null,
  accountData: null
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    openAuthMenu: (state) => {
      state.showAuthMenu = true;
    },
    closeAuthMenu: (state) => {
      state.showAuthMenu = false;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setAccountData: (state, action) => {
      state.accountData = action.payload;
    }
  },
});

// Export actions
export const { openAuthMenu, closeAuthMenu, setUserId, setAccountData } = mainSlice.actions;

// Export selectors
export const selectShowAuthMenu = (state) => state.main.showAuthMenu;
export const selectUserId = (state) => state.main.userId;
export const selectAccountData = (state) => state.main.accountData;

// Export reducer
export default mainSlice.reducer;