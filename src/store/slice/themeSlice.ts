import {createSlice} from '@reduxjs/toolkit';
import {Appearance} from 'react-native';

import DarkTheme from '../../theme/themes/darkTheme';
import LightTheme from '../../theme/themes/lightTheme';
import defaultFonts from '../../theme/fonts/inter';

const AppAppearance = Appearance.getColorScheme();

const initialState = {
  theme: AppAppearance === 'dark' ? DarkTheme : LightTheme,
  fonts: defaultFonts,
};

const themeSlice = createSlice({
  name: 'ThemeSlice',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setFonts: (state, action) => {
      state.fonts = action.payload;
    },
  },
});

export const {setTheme, setFonts} = themeSlice.actions;

export default themeSlice.reducer;
