import {StyleSheet, View, Text, Platform, StatusBar} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Button, Input} from '../../../components';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';
import Toast from '../../../utilities/toast';
import {ChangePasswordScreenProps} from '../../../types/navigation/appTypes';
import {useAppDispatch, useAppSelector} from '../../../store';
import {setUserDetails} from '../../../store/slice/authSlice';
import {Eye, EyeSlash} from '../../../assets/icons/svgs';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Back} from '../../../assets/icons/svgs';

const ChangePassword = ({navigation}: ChangePasswordScreenProps) => {
  const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';
  const dispatch = useAppDispatch();
  const {userDetails} = useAppSelector(state => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showOldPassword, setOldShowPassword] = useState(false);
  const [showNewPassword, setNewShowPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [chnagePassword, chnagePasswordResponse, isChangePasswordLoading] =
    useApi({
      url: URL.CHANGE_PASSWORD,
      method: 'PUT',
    });

  const onResetPassword = () => {
    const payload = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    chnagePassword({payload});
  };

  useEffect(() => {
    if (chnagePasswordResponse?.status_code !== 200) {
      return;
    }

    Toast.success({
      message: 'Your password has been reset successfully!',
    });
    let user: any = {...userDetails};
    user.has_logged_in_before = true;
    dispatch(setUserDetails(user));
    AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(user));
    navigation.goBack();
  }, [chnagePasswordResponse]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.backText} onPress={() => navigation.goBack()}>
          <Back />
        </Text>
        <Text style={styles.title}>Change Password</Text>
      </View>
      <View style={styles.container}>
        <Input
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          rightIcon={showOldPassword ? <EyeSlash /> : <Eye />}
          onRightIconClick={() => setOldShowPassword(!showOldPassword)}
          secureTextEntry={!showOldPassword}
        />
        <Input
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          rightIcon={showNewPassword ? <EyeSlash /> : <Eye />}
          onRightIconClick={() => setNewShowPassword(!showNewPassword)}
          secureTextEntry={!showNewPassword}
        />
        <Input
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          rightIcon={showConfirmNewPassword ? <EyeSlash /> : <Eye />}
          onRightIconClick={() =>
            setShowConfirmNewPassword(!showConfirmNewPassword)
          }
          secureTextEntry={!showConfirmNewPassword}
        />
        <Button
          title="Reset Password"
          disabled={
            !oldPassword.trim() ||
            !newPassword.trim() ||
            !confirmNewPassword.trim() ||
            newPassword !== confirmNewPassword ||
            isChangePasswordLoading
          }
          loading={isChangePasswordLoading}
          onPress={onResetPassword}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 32, // To balance the space from the back button
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  footerText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
  },
});
