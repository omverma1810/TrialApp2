import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import {
  Button,
  Input,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {styles} from './styles';
import {APP_LOGO} from '../../../assets/images';
import {LOCALES} from '../../../localization/constants';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';
import {setTokens} from '../../../utilities/token';
import {
  setIsUserSignedIn,
  setUserDetails,
} from '../../../store/slice/authSlice';
import {useAppDispatch} from '../../../store';

const SignIn = () => {
  const {t} = useTranslation();
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const dispatch = useAppDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const [login, loginData, isLoginPending, loginError] = useApi({
    url: URL.LOGIN,
    method: 'POST',
    isSecureEntry: false,
  });

  useEffect(() => {
    const handleLoginData = async () => {
      const {
        data: {user, access_token: accessToken},
      } = loginData;

      if (!user || !accessToken) {
        console.log('Login data is incomplete');
        return;
      }

      try {
        setTokens({accessToken});
        dispatch(setUserDetails(user));
        await AsyncStorage.setItem(
          USER_DETAILS_STORAGE_KEY,
          JSON.stringify(user),
        );
        await AsyncStorage.setItem('accessToken', accessToken);
        console.log(await AsyncStorage.getItem('username'));
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
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={APP_LOGO} />
        </View>
        <View style={styles.loginSection}>
          <View style={styles.loginContainer}>
            <Input
              placeholder={t(LOCALES.LOGIN.LBL_USERNAME)}
              value={userName}
              onChangeText={setUserName}
            />
            <Input
              placeholder={t(LOCALES.LOGIN.LBL_PASSWORD)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <Text style={styles.forgotPassword}>
              {t(LOCALES.LOGIN.LBL_FORGOT_PASSWORD)}
            </Text>
            <Button
              title={t(LOCALES.LOGIN.LBL_LOGIN)}
              disabled={!userName.trim() || !password.trim() || isLoginPending}
              loading={isLoginPending}
              onPress={onLogin}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
