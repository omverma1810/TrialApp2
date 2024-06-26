import {useAppDispatch, useAppSelector} from '../../store';
import {setTheme, setFonts} from '../../store/slice/themeSlice';
import darkTheme from '../themes/darkTheme';
import lightTheme from '../themes/lightTheme';
import blueTheme from '../themes/blueTheme';
import inter from '../fonts/inter';
import montserrat from '../fonts/montserrat';

type themeType = 'light' | 'dark' | 'blue';

type fontsType = 'INTER' | 'MONTSERRAT';

const useTheme = () => {
  const {theme, fonts} = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();

  const changeTheme = (themeType: themeType) => {
    if (themeType === 'dark') {
      dispatch(setTheme(darkTheme));
    } else if (themeType === 'light') {
      dispatch(setTheme(lightTheme));
    } else if (themeType === 'blue') {
      dispatch(setTheme(blueTheme));
    } else {
      dispatch(setTheme(lightTheme));
    }
  };

  const changeFonts = (fontsType: fontsType) => {
    if (fontsType === 'INTER') {
      dispatch(setFonts(inter));
    } else if (fontsType === 'MONTSERRAT') {
      dispatch(setFonts(montserrat));
    } else {
      dispatch(setFonts(inter));
    }
  };

  return {...theme, ...fonts, changeTheme, changeFonts};
};

export default useTheme;
