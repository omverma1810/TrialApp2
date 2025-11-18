import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  Image,
  Pressable,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import DeviceInfo from 'react-native-device-info';

import axios from 'axios';
import {Eye, EyeSlash, Setting, Check} from '../../../assets/icons/svgs';
import {APP_LOGO, FARM_BG} from '../../../assets/images';
import {
  Button,
  Input,
  SafeAreaView,
  StatusBar,
  Text,
  BiometricSettings,
} from '../../../components';
import BottomSheetModalView from '../../../components/BottomSheetModal';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {useKeyboard} from '../../../hooks/useKeaboard';
import {
  useBiometricAuth,
  BiometricAuthError,
  BiometricAuthErrorCode,
} from '../../../hooks/useBiometricAuth';
import {keychainService} from '../../../services/keychainService';
import {LOCALES} from '../../../localization/constants';
import {SUPPORTED_LANGUAGES} from '../../../localization/supportedLanguages';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  setIsUserSignedIn,
  setOrganizationURL,
  setUserDetails,
  setPermissions,
} from '../../../store/slice/authSlice';
import Toast from '../../../utilities/toast';
import {setTokens} from '../../../utilities/token';
import {extractPermissionsFromUser} from '../../../utilities/permissions';
import {styles} from './styles';

const SignIn = () => {
  const {t, i18n} = useTranslation();
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const ORGANIZATION_URL_STORAGE_KEY = 'ORGANIZATION_URL';
  const dispatch = useAppDispatch();
  const {organizationURL} = useAppSelector(state => state.auth);
  const {isKeyboardOpen} = useKeyboard();
  const {
    biometricAvailable,
    biometricEnabled,
    hasBiometricCredentials,
    authenticateWithBiometric,
    getBiometricTypeName,
  } = useBiometricAuth();
  const [biometricTypeName, setBiometricTypeName] = useState('Biometric');
  const [isValidateURLPending, setIsValidateURLPending] = useState(false);
  const [url, setUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shouldDelayAutoPrompt, setShouldDelayAutoPrompt] = useState(false);

  // Biometric state management - simplified
  const [biometricCredentialsAvailable, setBiometricCredentialsAvailable] =
    useState(false);
  const [biometricFailCount, setBiometricFailCount] = useState(0);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [biometricAuthTriggered, setBiometricAuthTriggered] = useState(false);

  const [showSettingsOptions, setShowSettingsOptions] = useState(false);
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const resolveInitialLanguage = () => {
    if (i18n.language) {
      return i18n.language;
    }
    const fallback = i18n.options?.fallbackLng;
    if (Array.isArray(fallback) && fallback.length > 0) {
      return fallback[0] as string;
    }
    if (typeof fallback === 'string') {
      return fallback;
    }
    return 'en';
  };
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() =>
    resolveInitialLanguage(),
  );
  const [isLanguageUpdating, setIsLanguageUpdating] = useState(false);
  const selectedLanguageOption = useMemo(
    () =>
      SUPPORTED_LANGUAGES.find(
        language => language.code === selectedLanguage,
      ) ?? SUPPORTED_LANGUAGES[0],
    [selectedLanguage],
  );

  // Load biometric type name ONCE
  useEffect(() => {
    const loadTypeName = async () => {
      try {
        const name = await getBiometricTypeName();
        setBiometricTypeName(name);
      } catch (err) {
        // ignore
      }
    };

    if (biometricAvailable) {
      loadTypeName();
    }
  }, [biometricAvailable, getBiometricTypeName]);

  // Reset biometric state when organization URL changes
  useEffect(() => {
    setBiometricFailCount(0);
    setShowManualLogin(false);
    setBiometricAuthTriggered(false);
    setShouldDelayAutoPrompt(false);
  }, [organizationURL]);

  const [login, loginData, isLoginPending, loginError] = useApi({
    url: URL.LOGIN,
    method: 'POST',
    isSecureEntry: false,
  });

  useEffect(() => {
    const handleLanguageChanged = (languageCode: string) => {
      setSelectedLanguage(languageCode);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Check biometric availability and credentials ONCE on mount
  useEffect(() => {
    let isMounted = true;

    const checkBiometricStatus = async () => {
      if (!organizationURL) {
        return;
      }

      try {
        // Only check if credentials are available, don't trigger authentication
        if (biometricAvailable && biometricEnabled) {
          const hasCredentials = await hasBiometricCredentials();
          if (isMounted) {
            setBiometricCredentialsAvailable(hasCredentials);
            // Hide manual login when biometric credentials exist
            if (hasCredentials) {
              if (!shouldDelayAutoPrompt) {
                setShowManualLogin(false);
              }
            } else {
              setShowManualLogin(true);
            }
          }
        } else {
          // Biometric not available/enabled - show manual login
          if (isMounted) {
            setShowManualLogin(true);
          }
        }
      } catch (error) {
        if (isMounted) {
          setShowManualLogin(true);
        }
      }
    };

    checkBiometricStatus();

    return () => {
      isMounted = false;
    };
  }, [
    organizationURL,
    biometricAvailable,
    biometricEnabled,
    shouldDelayAutoPrompt,
  ]); // Include dependencies to prevent unnecessary re-runs

  useEffect(() => {
    const handleLoginData = async () => {
      const {
        data: {user, access_token: accessToken, refresh_token: refreshToken},
      } = loginData;

      const {
        role: {role_name},
      } = user;
      if (!user || !accessToken) {
        return;
      }

      try {
        // Extract permissions from user data
        const permissions = extractPermissionsFromUser(user);

        setTokens({accessToken, refreshToken});
        dispatch(setUserDetails(user));
        dispatch(setPermissions(permissions)); // Store permissions in Redux
        await AsyncStorage.setItem(
          USER_DETAILS_STORAGE_KEY,
          JSON.stringify(user),
        );

        if (
          biometricEnabled &&
          biometricAvailable &&
          userName.trim() &&
          password.trim()
        ) {
          try {
            await keychainService.storeCredentials(
              userName.trim(),
              password.trim(),
            );
          } catch (credentialError) {
            console.log(
              '⚠️ Keychain: Unable to refresh credentials after login',
              credentialError,
            );
          }
        }

        dispatch(setIsUserSignedIn(true));
        // Reset biometric state after successful login
        setBiometricAuthTriggered(false);
      } catch (error) {}
    };

    if (loginData?.status_code === 200) {
      handleLoginData();
    }
  }, [loginData, userName, password, dispatch]);

  const onLogin = useCallback(() => {
    if (!userName.trim() || !password.trim()) {
      Toast.error({message: t(LOCALES.LOGIN.MSG_ENTER_CREDENTIALS)});
      return;
    }

    const payload = {
      username: userName.trim(),
      password: password.trim(),
    };

    // Reset biometric fail count on successful manual login
    setBiometricFailCount(0);
    setShowManualLogin(false);
    login({payload});
  }, [login, password, t, userName]);

  // Function to refresh biometric state after enabling
  const refreshBiometricState = async () => {
    try {
      if (biometricAvailable && biometricEnabled) {
        const hasCredentials = await hasBiometricCredentials();
        setBiometricCredentialsAvailable(hasCredentials);
        if (hasCredentials) {
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(true);
          setShowManualLogin(true);
        } else {
          setShowManualLogin(true);
          setShouldDelayAutoPrompt(false);
        }
      }
    } catch (error) {}
  };

  const handleBiometricLogin = useCallback(
    (credentials: {username: string; password: string}) => {
      const payload = {
        username: credentials.username,
        password: credentials.password,
      };
      login({payload});
    },
    [login],
  );

  // Main biometric authentication handler
  const handleBiometricAuthentication = useCallback(async () => {
    try {
      setBiometricAuthTriggered(true);

      const credentials = await authenticateWithBiometric();

      if (credentials) {
        setUserName(credentials.username);
        setPassword(credentials.password);
        handleBiometricLogin(credentials);
        setBiometricFailCount(0);
      }
    } catch (error: unknown) {
      const biometricError = error as BiometricAuthError;
      const errorCode = biometricError?.code;

      switch (errorCode) {
        case BiometricAuthErrorCode.CANCELLED:
          setShowManualLogin(true);
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(false);
          break;
        case BiometricAuthErrorCode.ENROLLMENT_CHANGED:
          Toast.error({
            message: t(LOCALES.LOGIN.MSG_BIOMETRIC_ENROLLMENT_CHANGED, {
              biometricTypeName,
            }),
          });
          setBiometricCredentialsAvailable(false);
          setBiometricFailCount(0);
          setShowManualLogin(true);
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(false);
          break;
        case BiometricAuthErrorCode.CREDENTIALS_MISSING:
          Toast.error({
            message: t(LOCALES.LOGIN.MSG_BIOMETRIC_CREDENTIALS_MISSING, {
              biometricTypeName,
            }),
          });
          setBiometricCredentialsAvailable(false);
          setBiometricFailCount(0);
          setShowManualLogin(true);
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(false);
          break;
        case BiometricAuthErrorCode.NOT_AVAILABLE:
          Toast.error({
            message: t(LOCALES.LOGIN.MSG_BIOMETRIC_NOT_AVAILABLE, {
              biometricTypeName,
            }),
          });
          setBiometricCredentialsAvailable(false);
          setShowManualLogin(true);
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(false);
          break;
        case BiometricAuthErrorCode.AUTH_FAILED:
          setBiometricFailCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              Toast.error({
                message: t(LOCALES.LOGIN.MSG_BIOMETRIC_FAILED_ATTEMPTS, {
                  biometricTypeName,
                }),
              });
              setShowManualLogin(true);
              setBiometricAuthTriggered(false);
            } else {
              Toast.error({
                message: t(LOCALES.LOGIN.MSG_BIOMETRIC_FAILED_RETRY, {
                  biometricTypeName,
                }),
              });
              setTimeout(() => {
                setBiometricAuthTriggered(false);
              }, 800);
            }
            return newCount;
          });
          setShouldDelayAutoPrompt(false);
          break;
        default:
          if (biometricError?.message) {
            Toast.error({message: biometricError.message});
          } else {
            Toast.error({message: t(LOCALES.COMMON.MSG_GENERIC_ERROR)});
          }
          setBiometricCredentialsAvailable(false);
          setShowManualLogin(true);
          setBiometricAuthTriggered(false);
          setShouldDelayAutoPrompt(false);
          break;
      }
    }
  }, [authenticateWithBiometric, biometricTypeName, handleBiometricLogin, t]);

  useEffect(() => {
    if (
      biometricCredentialsAvailable &&
      biometricAvailable &&
      biometricEnabled &&
      !showManualLogin &&
      !biometricAuthTriggered &&
      biometricFailCount < 3 &&
      !isLoginPending &&
      !loginError &&
      !shouldDelayAutoPrompt
    ) {
      handleBiometricAuthentication();
    }
  }, [
    biometricCredentialsAvailable,
    biometricAvailable,
    biometricEnabled,
    showManualLogin,
    biometricAuthTriggered,
    biometricFailCount,
    isLoginPending,
    loginError,
    shouldDelayAutoPrompt,
    handleBiometricAuthentication,
  ]);

  useEffect(() => {
    if (loginError) {
      setBiometricAuthTriggered(false);
      setShowManualLogin(true);
      setShouldDelayAutoPrompt(false);
    }
  }, [loginError]);

  // Function to reset biometric state and try again
  const resetBiometricState = useCallback(() => {
    setBiometricFailCount(0);
    setShowManualLogin(false);
    setBiometricAuthTriggered(false);
    setShouldDelayAutoPrompt(false);
  }, []);

  // Memoize the biometric button to prevent unnecessary re-renders
  const biometricButtonContent = useMemo(() => {
    if (
      !biometricCredentialsAvailable ||
      showManualLogin ||
      biometricFailCount >= 3
    ) {
      return null;
    }

    return (
      <>
        <Pressable
          style={[
            styles.biometricButton,
            (isLoginPending || biometricAuthTriggered) &&
              styles.biometricButtonDisabled,
          ]}
          onPress={handleBiometricAuthentication}
          disabled={isLoginPending || biometricAuthTriggered}>
          <View style={styles.biometricIconContainer}>
            <Text style={styles.biometricIconText}>👆</Text>
          </View>
          <Text
            style={[
              styles.biometricButtonText,
              (isLoginPending || biometricAuthTriggered) &&
                styles.biometricButtonTextDisabled,
            ]}>
            {isLoginPending || biometricAuthTriggered
              ? t(LOCALES.LOGIN.LBL_AUTHENTICATING)
              : t(LOCALES.LOGIN.LBL_LOGIN_WITH_BIOMETRIC, {
                  biometricTypeName,
                })}
          </Text>
        </Pressable>

        <Pressable
          style={styles.manualLoginOption}
          onPress={() => setShowManualLogin(true)}>
          <Text style={styles.manualLoginText}>
            {t(LOCALES.LOGIN.LBL_USE_USERNAME_PASSWORD)}
          </Text>
        </Pressable>
      </>
    );
  }, [
    biometricCredentialsAvailable,
    showManualLogin,
    biometricFailCount,
    isLoginPending,
    biometricTypeName,
    t,
  ]);

  // Memoize the manual login form to prevent unnecessary re-renders
  const manualLoginContent = useMemo(() => {
    if (
      !showManualLogin &&
      biometricCredentialsAvailable &&
      biometricAvailable
    ) {
      return null;
    }

    return (
      <>
        {/* Show separator if biometric is available but user chose manual */}
        {/* {biometricCredentialsAvailable &&
          biometricAvailable &&
          showManualLogin &&
          biometricFailCount < 3 && (
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>
                {t(LOCALES.LOGIN.LBL_OR)}
              </Text>
              <View style={styles.separatorLine} />
            </View>
          )} */}

        {/* Show failure message if biometric failed 3 times */}
        {biometricFailCount >= 3 && (
          <View style={styles.biometricLockedContainer}>
            <Text style={styles.biometricLockedText}>
              {t(LOCALES.LOGIN.MSG_BIOMETRIC_FAILED_ATTEMPTS, {
                biometricTypeName,
              })}
            </Text>
            <Pressable
              style={styles.tryBiometricAgainButton}
              onPress={resetBiometricState}>
              <Text style={styles.tryBiometricAgainText}>
                {t(LOCALES.LOGIN.LBL_TRY_BIOMETRIC_AGAIN, {
                  biometricTypeName,
                })}
              </Text>
            </Pressable>
          </View>
        )}

        <Input
          placeholder={t(LOCALES.LOGIN.LBL_USERNAME)}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        <Input
          placeholder={t(LOCALES.LOGIN.LBL_PASSWORD)}
          value={password}
          onChangeText={setPassword}
          rightIcon={showPassword ? <EyeSlash /> : <Eye />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onLogin}
        />

        {/* Show Biometric Settings for first time setup */}
        {biometricAvailable && userName.trim() && password.trim() && (
          <BiometricSettings
            username={userName.trim()}
            password={password.trim()}
            onBiometricEnabled={refreshBiometricState}
          />
        )}

        <Button
          title={t(LOCALES.LOGIN.LBL_LOGIN)}
          disabled={!userName.trim() || !password.trim() || isLoginPending}
          loading={isLoginPending}
          onPress={onLogin}
        />
      </>
    );
  }, [
    showManualLogin,
    biometricCredentialsAvailable,
    biometricAvailable,
    biometricFailCount,
    biometricTypeName,
    userName,
    password,
    showPassword,
    isLoginPending,
    t,
  ]);

  const renderLoginView = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContent}
        keyboardDismissMode="on-drag"
        scrollEnabled={true}
        bounces={true}
        overScrollMode="auto">
        <View style={styles.loginLabelContainer}>
          <Text style={styles.welcome}>FieldGenie</Text>
          <Text style={styles.loginToContinue}>
            {t(LOCALES.LOGIN.LBL_LOGIN_TO_CONTINUE)}
          </Text>
        </View>

        {/* Memoized biometric button content */}
        {biometricButtonContent}

        {/* Memoized manual login content */}
        {manualLoginContent}
        {/* Footer at bottom of ScrollView */}
        <View style={styles.footerContainer}>
          <Text style={styles.footer}>Piatrika Biosystems © 2025</Text>
          <Text style={styles.footer}>
            {'App Version:'} {DeviceInfo.getVersion()}
            {`(${DeviceInfo.getBuildNumber()})`}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const validateURL = () => {
    setIsValidateURLPending(true);
    const newURL = url.trim() + URL.ORGANIZATION_URL_VALIDATOR;
    axios
      .get(newURL)
      .then(response => {
        if (response.data?.status_code === 200) {
          dispatch(setOrganizationURL(url.trim()));
          AsyncStorage.setItem(ORGANIZATION_URL_STORAGE_KEY, url.trim());
        }
      })
      .catch(error => {
        Toast.error({message: t(LOCALES.LOGIN.MSG_INVALID_ORGANIZATION_URL)});
      })
      .finally(() => {
        setIsValidateURLPending(false);
      });
  };

  const renderConfigureOrganisationView = () => {
    return (
      <>
        <View style={styles.loginLabelContainer}>
          <Text style={styles.welcome}>FieldGenie</Text>
          <Text style={[styles.loginToContinue, {fontSize: 16, marginTop: 10}]}>
            {t(LOCALES.LOGIN.LBL_ENTER_ORG_URL_TO_CONTINUE)}
          </Text>
        </View>
        <Input
          placeholder={t(LOCALES.LOGIN.LBL_ORGANIZATION_URL)}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Button
          title={t(LOCALES.LOGIN.LBL_CONTINUE)}
          disabled={!url.trim() || isValidateURLPending}
          loading={isValidateURLPending}
          onPress={validateURL}
        />
      </>
    );
  };

  const onSetting = () => setShowSettingsOptions(!showSettingsOptions);

  const onEditURL = () => {
    setShowSettingsOptions(false);
    organizationURL && setUrl(organizationURL);
    dispatch(setOrganizationURL(null));
  };

  const openLanguageSheet = useCallback(() => {
    setShowSettingsOptions(false);
    languageSheetRef.current?.present();
  }, []);

  const closeLanguageSheet = useCallback(() => {
    languageSheetRef.current?.close();
  }, []);

  const handleLanguageSelection = useCallback(
    async (languageCode: string) => {
      if (selectedLanguage === languageCode || isLanguageUpdating) {
        closeLanguageSheet();
        return;
      }

      setIsLanguageUpdating(true);
      try {
        await i18n.changeLanguage(languageCode);
        setSelectedLanguage(languageCode);
        closeLanguageSheet();
      } catch (error) {
        Toast.error({
          message: t(LOCALES.COMMON.MSG_LANGUAGE_UPDATE_FAILED),
        });
      } finally {
        setIsLanguageUpdating(false);
      }
    },
    [closeLanguageSheet, i18n, isLanguageUpdating, selectedLanguage, t],
  );

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={styles.container}>
        {!isKeyboardOpen && (
          <Animated.View style={styles.farmBgContainer}>
            <Animated.Image style={styles.farmBg} source={FARM_BG} />
            {organizationURL && (
              <Pressable style={styles.settingView} onPress={onSetting}>
                <Setting />
              </Pressable>
            )}
            {showSettingsOptions && (
              <View style={styles.optionsContainer}>
                <Pressable
                  accessibilityRole="button"
                  style={styles.optionRow}
                  onPress={onEditURL}>
                  <Text style={styles.optionText}>
                    {t(LOCALES.COMMON.LBL_CHANGE_ORGANIZATION_URL)}
                  </Text>
                </Pressable>
                <View style={styles.optionDivider} />
                <Pressable
                  accessibilityRole="button"
                  style={styles.optionRow}
                  onPress={openLanguageSheet}>
                  <View style={styles.optionLanguageWrapper}>
                    <Text style={styles.optionText}>
                      {t(LOCALES.COMMON.LBL_CHANGE_LANGUAGE)}
                    </Text>
                    <Text style={styles.optionHint}>
                      {`${t(LOCALES.COMMON.LBL_CURRENT_LANGUAGE)}: ${
                        selectedLanguageOption.nativeLabel
                      }`}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </Animated.View>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={[
            styles.loginSection,
            !isKeyboardOpen && styles.loginSectionWithKeyboard,
          ]}>
          <View
            style={[styles.loginContainer, {flex: organizationURL ? 1 : 0}]}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} source={APP_LOGO} />
            </View>
            {organizationURL
              ? renderLoginView()
              : renderConfigureOrganisationView()}
            {!organizationURL && (
              <View style={styles.footerContainer}>
                <Text style={styles.footer}>Piatrika Biosystems © 2025</Text>
                <Text style={styles.footer}>
                  {'App Version:'} {DeviceInfo.getVersion()}
                  {`(${DeviceInfo.getBuildNumber()})`}
                </Text>
              </View>
            )}
          </View>
          <View
            style={[styles.border, isKeyboardOpen && styles.borderWithKeyboard]}
          />
        </KeyboardAvoidingView>
        <BottomSheetModalView
          bottomSheetModalRef={languageSheetRef}
          type="CONTENT_HEIGHT"
          containerStyle={styles.languageSheetContainer}>
          <View style={styles.languageSheetHeader}>
            <View style={styles.languageSheetHeaderRow}>
              <Text style={styles.languageSheetTitle}>
                {t(LOCALES.COMMON.LBL_SELECT_LANGUAGE)}
              </Text>
              {isLanguageUpdating && (
                <ActivityIndicator size="small" color="#1A6DD2" />
              )}
            </View>
            <Text style={styles.languageSheetSubtitle}>
              {t(LOCALES.COMMON.LBL_LANGUAGE_DESCRIPTION)}
            </Text>
          </View>
          <View style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map(language => {
              const isSelected = language.code === selectedLanguage;

              return (
                <Pressable
                  key={language.code}
                  accessibilityRole="button"
                  style={[
                    styles.languageOption,
                    isSelected && styles.languageOptionActive,
                  ]}
                  disabled={isLanguageUpdating}
                  onPress={() => handleLanguageSelection(language.code)}>
                  <View style={styles.languageOptionContent}>
                    <Text style={styles.languageNativeLabel}>
                      {language.nativeLabel}
                    </Text>
                    <Text style={styles.languageSecondaryLabel}>
                      {language.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.languageSelectedIcon}>
                      <Check width={20} height={20} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </BottomSheetModalView>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
