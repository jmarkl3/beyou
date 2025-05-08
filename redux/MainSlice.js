import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthMenu: false
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
    }
  },
});

// Export actions
export const { openAuthMenu, closeAuthMenu } = mainSlice.actions;

// Export selectors
export const selectShowAuthMenu = (state) => state.main.showAuthMenu;

// Export reducer
export default mainSlice.reducer;