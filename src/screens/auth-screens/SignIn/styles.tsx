import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '10%',
  },
  logo: {},
  loginSection: {
    flex: 1,
    marginTop: '30%',
  },
  loginContainer: {
    paddingHorizontal: 28,
    gap: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#1A6DD2',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
});
