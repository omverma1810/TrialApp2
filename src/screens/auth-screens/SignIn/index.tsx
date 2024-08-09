import React, {useEffect, useState} from 'react';
import {Image, View, Animated} from 'react-native';
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
  setUserDetails,
} from '../../../store/slice/authSlice';
import {useAppDispatch} from '../../../store';
import {useKeyboard} from '../../../hooks/useKeaboard';
import {Eye, EyeSlash} from '../../../assets/icons/svgs';

const SignIn = () => {
  const {t} = useTranslation();
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const dispatch = useAppDispatch();
  const {isKeyboardOpen} = useKeyboard();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
  return (
    <SafeAreaView>
      <StatusBar />
      <View style={styles.container}>
        {!isKeyboardOpen && (
          <Animated.View style={styles.farmBgContainer}>
            <Animated.Image style={styles.farmBg} source={FARM_BG} />
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
            <View style={styles.loginLabelContainer}>
              <Text style={styles.welcome}>Welcome to Trials App 2.0</Text>
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
            <View style={styles.footerContainer}>
              <Text style={styles.footer}>Piatrika Biosystems © 2024</Text>
              <Text style={styles.footer}>
                {'App Version:'} {DeviceInfo.getVersion()}
                {`(${DeviceInfo.getBuildNumber()})`}
              </Text>
              <Text style={styles.footer}>
                {'App Environment:'}{' '}
                <Text style={{textTransform: 'capitalize'}}>{DEFAULT_ENV}</Text>
              </Text>
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
