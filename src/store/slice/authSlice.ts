import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceState {
  isUserSignedIn: boolean;
}

const initialState: AuthSliceState = {
  isUserSignedIn: true,
};

const authSlice = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    setIsUserSignedIn: (state, action) => {
      state.isUserSignedIn = action.payload;
    },
    setClearAuthData: (state, action) => {
      state.isUserSignedIn = false;
    },
  },
});

export const {setIsUserSignedIn, setClearAuthData} = authSlice.actions;

export default authSlice.reducer;
