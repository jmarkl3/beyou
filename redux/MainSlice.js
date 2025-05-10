import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthMenu: false,
  auth_id: null
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
    setAuthId: (state, action) => {
      state.auth_id = action.payload;
    }
  },
});

// Export actions
export const { openAuthMenu, closeAuthMenu, setAuthId } = mainSlice.actions;

// Export reducer
export default mainSlice.reducer;