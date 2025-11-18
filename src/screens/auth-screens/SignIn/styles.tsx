import {StyleSheet} from 'react-native';
import {FONTS} from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
    gap: 16,
  },
  logoContainer: {
    alignItems: 'center',
    // marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  loginSection: {
    flex: 1,
  },
  loginSectionWithKeyboard: {
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginTop: '-50%',
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
    // marginBottom: 6,
  },
  loginToContinue: {
    color: '#000000',
    fontSize: 20,
    fontFamily: FONTS.MEDIUM,
  },
  loginLabelContainer: {
    alignItems: 'center',
    // paddingVertical: 10,
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
    // marginTop: 10,
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
  settingView: {
    backgroundColor: '#fff',
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    right: 16,
    top: 64,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 12,
    elevation: 6,
    minWidth: 220,
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    color: '#161616',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  optionHint: {
    color: '#6c757d',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    marginTop: 4,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
  },
  optionLanguageWrapper: {
    gap: 4,
  },
  languageSheetContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  languageSheetHeader: {
    gap: 8,
  },
  languageSheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageSheetTitle: {
    fontSize: 18,
    color: '#161616',
    fontFamily: FONTS.MEDIUM,
  },
  languageSheetSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: FONTS.REGULAR,
  },
  languageList: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  languageOptionActive: {
    backgroundColor: '#E7F2D6',
    borderWidth: 1,
    borderColor: '#A6CE39',
  },
  languageOptionContent: {
    flex: 1,
    gap: 4,
  },
  languageNativeLabel: {
    fontSize: 16,
    color: '#161616',
    fontFamily: FONTS.MEDIUM,
  },
  languageSecondaryLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: FONTS.REGULAR,
  },
  languageSelectedIcon: {
    marginLeft: 12,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6c757d',
    fontFamily: FONTS.REGULAR,
  },
  biometricLockedContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  biometricLockedText: {
    fontSize: 14,
    color: '#856404',
    fontFamily: FONTS.REGULAR,
    textAlign: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  biometricButtonDisabled: {
    opacity: 0.5,
  },
  biometricIconContainer: {
    marginRight: 8,
  },
  biometricIconText: {
    fontSize: 20,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    fontFamily: FONTS.MEDIUM,
  },
  biometricButtonTextDisabled: {
    color: '#adb5bd',
  },
  manualLoginOption: {
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
  },
  manualLoginText: {
    fontSize: 14,
    color: '#007bff',
    fontFamily: FONTS.MEDIUM,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: FONTS.REGULAR,
  },
  tryBiometricAgainButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'center',
  },
  tryBiometricAgainText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: FONTS.MEDIUM,
    textAlign: 'center',
  },
});
