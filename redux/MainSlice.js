import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAuthMenu: false,
  auth_id: null,
  userData: null
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
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    }
  },
});

// Export actions
export const { openAuthMenu, closeAuthMenu, setAuthId, setUserData } = mainSlice.actions;

// Export reducer
export default mainSlice.reducer;