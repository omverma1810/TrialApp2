import React, {useEffect, useState} from 'react';
import {Image, View, Animated, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';

import {
  Button,
  Input,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {styles} from './styles';
import {APP_LOGO, FARM_BG} from '../../../assets/images';
import {LOCALES} from '../../../localization/constants';
import {useApi} from '../../../hooks/useApi';
import {URL, DEFAULT_ENV} from '../../../constants/URLS';
import {setTokens} from '../../../utilities/token';
import {
  setIsUserSignedIn,
  setOrganizationURL,
  setUserDetails,
} from '../../../store/slice/authSlice';
import {useAppDispatch, useAppSelector} from '../../../store';
import {useKeyboard} from '../../../hooks/useKeaboard';
import {Eye, EyeSlash, Setting} from '../../../assets/icons/svgs';
import axios from 'axios';
import Toast from '../../../utilities/toast';

const SignIn = () => {
  const {t} = useTranslation();
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const ORGANIZATION_URL_STORAGE_KEY = 'ORGANIZATION_URL';
  const dispatch = useAppDispatch();
  const {organizationURL} = useAppSelector(state => state.auth);
  const {isKeyboardOpen} = useKeyboard();
  const [isValidateURLPending, setIsValidateURLPending] = useState(false);
  const [url, setUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showSettingsOptions, setShowSettingsOptions] = useState(false);

  const [login, loginData, isLoginPending, loginError] = useApi({
    url: URL.LOGIN,
    method: 'POST',
    isSecureEntry: false,
  });

  useEffect(() => {
    const handleLoginData = async () => {
      const {
        data: {user, access_token: accessToken, refresh_token: refreshToken},
      } = loginData;

      if (!user || !accessToken) {
        console.log('Login data is incomplete');
        return;
      }

      try {
        setTokens({accessToken, refreshToken});
        dispatch(setUserDetails(user));
        await AsyncStorage.setItem(
          USER_DETAILS_STORAGE_KEY,
          JSON.stringify(user),
        );
        await Keychain.setGenericPassword(userName, password);
        dispatch(setIsUserSignedIn(true));
      } catch (error) {
        console.log('Error handling login data:', error);
      }
    };

    if (loginData?.status_code === 200) {
      handleLoginData();
    }
  }, [loginData, userName, password, dispatch]);

  const onLogin = () => {
    const payload = {
      username: userName.trim(),
      password: password.trim(),
    };
    login({payload});
  };

  const renderLoginView = () => {
    return (
      <>
        <View style={styles.loginLabelContainer}>
          <Text style={styles.welcome}>Trials App 2.0</Text>
          <Text style={styles.loginToContinue}>Login to continue!</Text>
        </View>
        <Input
          placeholder={t(LOCALES.LOGIN.LBL_USERNAME)}
          value={userName}
          onChangeText={setUserName}
        />
        <Input
          placeholder={t(LOCALES.LOGIN.LBL_PASSWORD)}
          value={password}
          onChangeText={setPassword}
          rightIcon={showPassword ? <EyeSlash /> : <Eye />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          secureTextEntry={!showPassword}
        />
        {/* <Text style={styles.forgotPassword}>
              {t(LOCALES.LOGIN.LBL_FORGOT_PASSWORD)}
            </Text> */}
        <Button
          title={t(LOCALES.LOGIN.LBL_LOGIN)}
          disabled={!userName.trim() || !password.trim() || isLoginPending}
          loading={isLoginPending}
          onPress={onLogin}
        />
      </>
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
        console.log('Error validating URL:', error);
        Toast.error({message: 'Invalid organization URL'});
      })
      .finally(() => {
        setIsValidateURLPending(false);
      });
  };

  const renderConfigureOrganisationView = () => {
    return (
      <>
        <View style={styles.loginLabelContainer}>
          <Text style={styles.welcome}>Trials App 2.0</Text>
          <Text style={[styles.loginToContinue, {fontSize: 16, marginTop: 10}]}>
            Enter your organization URL to continue!
          </Text>
        </View>
        <Input
          placeholder="Organization URL"
          value={url}
          onChangeText={setUrl}
        />
        <Button
          title="Continue"
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
              <Pressable style={styles.optionsView} onPress={onEditURL}>
                <Text style={styles.optionsText}>Change Organization URL</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
        <View
          style={[
            styles.loginSection,
            !isKeyboardOpen && styles.loginSectionWithKeyboard,
          ]}>
          <View style={styles.loginContainer}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} source={APP_LOGO} />
            </View>
            {organizationURL
              ? renderLoginView()
              : renderConfigureOrganisationView()}
            <View style={styles.footerContainer}>
              <Text style={styles.footer}>Piatrika Biosystems © 2024</Text>
              <Text style={styles.footer}>
                {'App Version:'} {DeviceInfo.getVersion()}
                {`(${DeviceInfo.getBuildNumber()})`}
              </Text>
              {/* <Text style={styles.footer}>
                {'App Environment:'}{' '}
                <Text style={{textTransform: 'capitalize'}}>{DEFAULT_ENV}</Text>
              </Text> */}
            </View>
          </View>
          <View
            style={[styles.border, isKeyboardOpen && styles.borderWithKeyboard]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
