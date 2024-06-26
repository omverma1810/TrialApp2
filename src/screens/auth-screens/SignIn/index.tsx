import React from 'react';
import {Image, View} from 'react-native';
import {useTranslation} from 'react-i18next';

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

const SignIn = () => {
  const {t} = useTranslation();
  return (
    <SafeAreaView>
      <StatusBar />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={APP_LOGO} />
        </View>
        <View style={styles.loginSection}>
          <View style={styles.loginContainer}>
            <Input placeholder={t(LOCALES.LOGIN.LBL_EMAIL)} />
            <Input placeholder={t(LOCALES.LOGIN.LBL_PASSWORD)} />
            <Text style={styles.forgotPassword}>
              {t(LOCALES.LOGIN.LBL_FORGOT_PASSWORD)}
            </Text>
            <Button title={t(LOCALES.LOGIN.LBL_LOGIN)} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
