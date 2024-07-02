import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceState {
  isUserSignedIn: boolean;
  userDetails: any | null;
}

const initialState: AuthSliceState = {
  isUserSignedIn: false,
  userDetails: null,
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
    setClearAuthData: (state, action) => {
      state.isUserSignedIn = false;
      state.userDetails = null;
    },
  },
});

export const {setIsUserSignedIn, setUserDetails, setClearAuthData} =
  authSlice.actions;

export default authSlice.reducer;
