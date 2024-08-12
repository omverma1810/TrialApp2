import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logo: {
    width: 105,
    height: 44,
    resizeMode: 'contain',
  },
  loginSection: {
    flex: 1,
  },
  loginSectionWithKeyboard: {
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginTop: '-40%',
    backgroundColor: '#FFF',
  },
  loginContainer: {
    padding: 28,
    gap: 16,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#1A6DD2',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
  welcome: {
    color: '#00000061',
    fontSize: 18,
    fontFamily: FONTS.REGULAR,
    marginBottom: 6,
  },
  loginToContinue: {
    color: '#000000',
    fontSize: 24,
    fontFamily: FONTS.MEDIUM,
  },
  loginLabelContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  farmBgContainer: {
    width: '100%',
    height: '60%',
  },
  farmBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  footerContainer: {
    gap: 10,
    marginTop: 20,
  },
  footer: {
    color: '#949494',
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    textAlign: 'center',
  },
  border: {
    borderTopWidth: 8,
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderLeftWidth: 0.1,
    borderRightWidth: 0.1,
    borderColor: '#A6CE39',
  },
  borderWithKeyboard: {
    borderRadius: 0,
  },
});
