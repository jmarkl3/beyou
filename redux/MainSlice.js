import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthMenu: false,
  userId: null
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
    }
  },
});

// Export actions
export const { openAuthMenu, closeAuthMenu, setUserId } = mainSlice.actions;

// Export selectors
export const selectShowAuthMenu = (state) => state.main.showAuthMenu;
export const selectUserId = (state) => state.main.userId;

// Export reducer
export default mainSlice.reducer;