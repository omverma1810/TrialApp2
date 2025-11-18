import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import * as Keychain from 'react-native-keychain';
import {Back, ProfileImg} from '../../../../assets/icons/svgs';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import useCleanUp from '../../../../hooks/useCleanUp';
import {useAppDispatch} from '../../../../store';
import {
  setClearAuthData,
  setIsUserSignedIn,
  setUserDetails,
} from '../../../../store/slice/authSlice';
import ProfileStyles from './ProfileStyles';
import {ProfileScreenProps} from '../../../../types/navigation/appTypes';
import DeviceInfo from 'react-native-device-info';
import Toast from '../../../../utilities/toast';
import {SafeAreaView} from '../../../../components';
import ProfileSkeleton from './ProfileSkeleton';

const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';

const Profile = ({navigation}: ProfileScreenProps) => {
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    phoneNumber: '',
    email: '',
    role: '',
  });

  const [imageSource, setImageSource] = useState<any | null>(null);
  const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [logoutUser] = useCleanUp();
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] =
    useState<boolean>(false);

  const dispatch = useAppDispatch();

  // fetching profile details
  const [fetchProfile, profileDataResponse, profileLoading] = useApi({
    url: URL.PROFILE,
    method: 'GET',
    isSecureEntry: true,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  useEffect(() => {
    if (profileDataResponse && profileDataResponse.status_code === 200) {
      const fetchedUser = profileDataResponse.data.user;
      dispatch(setUserDetails(fetchedUser));
      const roleName =
        fetchedUser.role && fetchedUser.role.length > 0
          ? fetchedUser.role[0].role_name
          : 'N/A';
      setProfileData({
        name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
        location: fetchedUser.location?.name || 'N/A',
        phoneNumber: `${fetchedUser.phone_number}`,
        email: fetchedUser.email,
        role: roleName,
      });
    } else {
      if (profileDataResponse) {
        Toast.error({
          message: 'Error Fetching Profile',
        });
      }
    }
  }, [profileDataResponse]);

  //logout functionality
  const [logout, logoutResponse, logoutError] = useApi({
    url: URL.LOGOUT,
    method: 'DELETE',
  });

  useEffect(() => {
    const handleLogout = async () => {
      try {
        if (logoutResponse && logoutResponse.status_code === 200) {
          dispatch(setIsUserSignedIn(false));
          dispatch(setClearAuthData(false));
          // Use the proper logout function that preserves biometric settings
          await logoutUser();
        } else {
        }
      } catch (error) {}
    };
    handleLogout();
  }, [logoutResponse]);

  const onLogout = async () => {
    logoutUser();
  };
  //update profile functionality
  const [updateProfile, updateProfileResponse] = useApi({
    url: URL.PROFILE,
    method: 'PUT',
  });
  const onUpdate = async () => {
    const fileName = imageSource.path?.split('/').pop();
    const match_ = /\.(\w+)$/.exec(fileName ?? '');
    const imageData = match_ ? `image/${match_[1]}` : 'image/jpeg';
    const url = imageSource?.path || imageSource;
    const avatar = {
      url: url,
      fileName: fileName,
      imageData: imageData,
    };
    let payload = {
      avatar: avatar,
    };
    await updateProfile({payload});
  };

  useEffect(() => {
    const handleUpdateData = async () => {
      Toast.success({
        message: 'Profile updated successfully',
      });
      const user = updateProfileResponse.data.user;
      dispatch(setUserDetails(user));
      await AsyncStorage.setItem(
        USER_DETAILS_STORAGE_KEY,
        JSON.stringify(user),
      );
      await Keychain.setGenericPassword(
        profileData.email,
        profileData.phoneNumber,
      );
      setIsEditing(false);
    };
    if (updateProfileResponse && updateProfileResponse.status_code === 200) {
      handleUpdateData();
    } else {
      if (updateProfileResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
  }, [updateProfileResponse]);

  // update email functionality
  const [updateEmail, updateEmailResponse] = useApi({
    url: URL.PROFILE,
    method: 'PUT',
  });

  const onUpdateEmail = async () => {
    const payload = {
      email: profileData.email,
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    await updateEmail({payload, headers});
  };

  useEffect(() => {
    const handleUpdateEmailData = async () => {
      Toast.success({
        message: 'Email updated successfully',
      });
      const user = updateEmailResponse.data.user;
      dispatch(setUserDetails(user));
      await AsyncStorage.setItem(
        USER_DETAILS_STORAGE_KEY,
        JSON.stringify(user),
      );
      setIsEditingEmail(false);
    };
    if (updateEmailResponse && updateEmailResponse.status_code === 200) {
      handleUpdateEmailData();
    } else {
      if (updateEmailResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
  }, [updateEmailResponse]);

  // update phone number functionality
  const [updatePhoneNumber, updatePhoneNumberResponse] = useApi({
    url: URL.PROFILE,
    method: 'PUT',
  });

  const onUpdatePhoneNumber = async () => {
    let numericStr = profileData.phoneNumber.replace(/\s/, '');
    const payload = {
      phone_number: parseInt(numericStr),
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    await updatePhoneNumber({payload, headers});
  };

  useEffect(() => {
    const handleUpdatePhoneNumberData = async () => {
      Toast.success({
        message: 'Phone number updated successfully',
      });
      const user = updatePhoneNumberResponse.data.user;
      dispatch(setUserDetails(user));
      await AsyncStorage.setItem(
        USER_DETAILS_STORAGE_KEY,
        JSON.stringify(user),
      );
      setIsEditingPhoneNumber(false);
    };
    if (
      updatePhoneNumberResponse &&
      updatePhoneNumberResponse.status_code === 200
    ) {
      handleUpdatePhoneNumberData();
    } else {
      if (updatePhoneNumberResponse) {
        Toast.error({
          message: 'Something Went Wrong',
        });
      }
    }
  }, [updatePhoneNumberResponse]);

  //image handling functionality
  const selectImage = () => {
    ImagePicker.openPicker({
      width: 80,
      height: 80,
      cropping: true,
      cropperCircleOverlay: true,
      includeBase64: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        setImageSource(image);
        setIsDefaultImage(false);
      })
      .catch(error => {});
  };

  const deleteImage = () => {
    setImageSource(null);
    setIsDefaultImage(true);
  };

  const toggleImageAction = () => {
    if (isDefaultImage) {
      selectImage();
    } else {
      deleteImage();
    }
  };
  const hasProfileData = Boolean(
    profileDataResponse && profileDataResponse.status_code === 200,
  );
  const isSkeletonVisible = profileLoading && !hasProfileData;

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 20,
          }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Back width={24} height={24} />
          </Pressable>
          <Text style={ProfileStyles.ScreenTitle}>Profile</Text>
        </View>
      </SafeAreaView>

      {isSkeletonVisible ? (
        <ProfileSkeleton />
      ) : (
        <View style={ProfileStyles.container}>
          <Pressable
            style={ProfileStyles.profileContainer}
            onPress={toggleImageAction}>
            {isDefaultImage ? (
              <View>
                <ProfileImg width={80} height={81} />
              </View>
            ) : (
              <View
                style={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 100,
                }}>
                <Image
                  style={{width: 80, height: 80, borderRadius: 100}}
                  source={{uri: imageSource.path ?? undefined}}
                />
              </View>
            )}
          </Pressable>
          <View style={ProfileStyles.infoContainer}>
            <View style={ProfileStyles.infoItem}>
              <Text style={ProfileStyles.infoText}>Name</Text>
              <Text style={ProfileStyles.infoTextBold}>{profileData.name}</Text>
            </View>
            <View style={ProfileStyles.infoItem}>
              <Text style={ProfileStyles.infoText}>Location</Text>
              <Text style={ProfileStyles.infoTextBold}>
                {profileData.location}
              </Text>
            </View>
            <View style={ProfileStyles.infoItem}>
              <Text style={ProfileStyles.infoText}>Role Name</Text>
              <Text style={ProfileStyles.infoTextBold}>{profileData.role}</Text>
            </View>
            <View
              style={[
                ProfileStyles.infoItem,
                ProfileStyles.editButtonContainer,
              ]}>
              <View style={{gap: 8, width: '80%'}}>
                <Text style={ProfileStyles.infoText}>Phone Number</Text>
                {isEditingPhoneNumber ? (
                  <TextInput
                    style={ProfileStyles.infoTextBold}
                    value={profileData.phoneNumber}
                    onChangeText={text =>
                      setProfileData({...profileData, phoneNumber: text})
                    }
                    keyboardType="number-pad"
                  />
                ) : (
                  <Text style={ProfileStyles.infoTextBold}>
                    {profileData.phoneNumber}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => {
                  if (isEditingPhoneNumber) {
                    onUpdatePhoneNumber();
                  } else {
                    setIsEditingPhoneNumber(true);
                  }
                }}>
                <Text style={ProfileStyles.editButton}>
                  {isEditingPhoneNumber ? 'Save' : 'Edit'}
                </Text>
              </Pressable>
            </View>
            <View
              style={[
                ProfileStyles.infoItem,
                ProfileStyles.editButtonContainer,
              ]}>
              <View style={{gap: 8, width: '80%'}}>
                <Text style={ProfileStyles.infoText}>Email Id</Text>
                {isEditingEmail ? (
                  <TextInput
                    style={ProfileStyles.infoTextBold}
                    value={profileData.email}
                    onChangeText={text =>
                      setProfileData({...profileData, email: text})
                    }
                  />
                ) : (
                  <Text style={ProfileStyles.infoTextBold}>
                    {profileData.email}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => {
                  if (isEditingEmail) {
                    onUpdateEmail();
                  } else {
                    setIsEditingEmail(true);
                  }
                }}>
                <Text style={ProfileStyles.editButton}>
                  {isEditingEmail ? 'Save' : 'Edit'}
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('ChangePassword')}
            style={ProfileStyles.logoutButton}>
            <Text style={ProfileStyles.editButton}>Change Password</Text>
          </Pressable>
          <Pressable onPress={onLogout} style={ProfileStyles.logoutButton}>
            <Text style={ProfileStyles.editButton}>Logout</Text>
          </Pressable>
          <View style={ProfileStyles.footerContainer}>
            <Text style={ProfileStyles.footer}>Piatrika Biosystems © 2025</Text>
            <Text style={ProfileStyles.footer}>
              {'App Version:'} {DeviceInfo.getVersion()}
              {`(${DeviceInfo.getBuildNumber()})`}
            </Text>
            {/* <Text style={ProfileStyles.footer}>
            {'App Environment:'}{' '}
            <Text style={{textTransform: 'capitalize'}}>{DEFAULT_ENV}</Text>
          </Text> */}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;
