import React, {useCallback, useEffect, useMemo} from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {AccessToken, LoginManager, Settings} from 'react-native-fbsdk-next';

import {Google, Facebook, Apple} from '../../../assets/icons/svgs';
import useTheme from '../../../theme/hooks/useTheme';
import {SOCIAL_LOGIN} from '../../../constants';

const SocialLogin = () => {
  const {COLORS} = useTheme();

  const SocialLoginOptions = useMemo(
    () => [
      {
        id: 0,
        icon: Google,
        key: 'GOOGLE',
        onPress: () => googleSignIn(),
      },
      {
        id: 2,
        icon: Facebook,
        key: 'FACEBOOK',
        onPress: () => facebookSignIn(),
      },
      {
        id: 3,
        icon: Apple,
        key: 'APPLE',
        onPress: () => appleSignIn(),
      },
    ],
    [],
  );

  // Google SignIn functionality
  useEffect(() => {
    if (Platform.OS === 'ios')
      GoogleSignin.configure({iosClientId: SOCIAL_LOGIN.GOOGLE.IOS_CLIENT_ID});
    else if (Platform.OS === 'android')
      GoogleSignin.configure({
        webClientId: SOCIAL_LOGIN.GOOGLE.ANDROID_CLIENT_ID,
      });
  }, []);

  const googleSignIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
    } catch (error) {
    }
  }, []);

  // Apple SignIn functionality
  const appleSignIn = useCallback(async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );
      if (credentialState === appleAuth.State.AUTHORIZED) {
      }
    } catch (error) {
    }
  }, []);

  // Facebook SignIn functionality
  useEffect(() => {
    if (Platform.OS === 'ios') {
      Settings.initializeSDK();
    }
  }, []);

  const facebookSignIn = async () => {
    try {
      const userInfo = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (!userInfo.isCancelled) {
        const token = await AccessToken.getCurrentAccessToken();
        if (token?.accessToken) {
        }
      }
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.socialLoginParent}>
        {SocialLoginOptions.map(option => (
          <Pressable
            onPress={option.onPress}
            key={option.id}
            style={[
              styles.socialLoginContainer,
              {
                backgroundColor:
                  COLORS.COMPONENTS.SOCIAL_LOGIN.BACKGROUND_COLOR,
              },
            ]}>
            <option.icon />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default SocialLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  socialLoginParent: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  socialLoginContainer: {
    height: 50,
    width: 50,
    borderRadius: 50 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
