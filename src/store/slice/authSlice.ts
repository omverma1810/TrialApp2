import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceState {
  isUserSignedIn: boolean;
  userDetails: any | null;
  organizationURL: string | null;
}

const initialState: AuthSliceState = {
  isUserSignedIn: false,
  userDetails: null,
  organizationURL: null,
};

const authSlice = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    setIsUserSignedIn: (state, action) => {
      state.isUserSignedIn = action.payload;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setOrganizationURL: (state, action) => {
      state.organizationURL = action.payload;
    },
    setClearAuthData: (state, action) => {
      state.isUserSignedIn = false;
      state.userDetails = null;
      // state.organizationURL = null;
    },
  },
});

export const {
  setIsUserSignedIn,
  setUserDetails,
  setClearAuthData,
  setOrganizationURL,
} = authSlice.actions;

export default authSlice.reducer;
