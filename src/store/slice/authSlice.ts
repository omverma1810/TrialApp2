import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceState {
  isUserSignedIn: boolean;
  userDetails: any | null;
  organizationURL: string | null;
  permissions: string[];
  biometricEnabled: boolean;
  biometricAvailable: boolean;
}

const initialState: AuthSliceState = {
  isUserSignedIn: false,
  userDetails: null,
  organizationURL: null,
  permissions: [],
  biometricEnabled: false,
  biometricAvailable: false,
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
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    setBiometricAvailable: (state, action) => {
      state.biometricAvailable = action.payload;
    },
    setClearAuthData: (state, action) => {
      state.isUserSignedIn = false;
      state.userDetails = null;
      state.permissions = [];
      // state.organizationURL = null;
    },
  },
});

export const {
  setIsUserSignedIn,
  setUserDetails,
  setClearAuthData,
  setOrganizationURL,
  setPermissions,
  setBiometricEnabled,
  setBiometricAvailable,
} = authSlice.actions;

export default authSlice.reducer;
