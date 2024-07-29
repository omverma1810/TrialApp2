import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import * as Keychain from 'react-native-keychain';
import {Edit, ProfileImg} from '../../../../assets/icons/svgs';
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

const USER_DETAILS_STORAGE_KEY = 'USER_DETAILS';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    phoneNumber: '',
    email: '',
  });

  const [imageSource, setImageSource] = useState<any | null>(null);
  const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logoutUser] = useCleanUp();
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] =
    useState<boolean>(false);

  const dispatch = useAppDispatch();

  // fetching profile details 
  const [fetchProfile, profileDataResponse] = useApi({
    url: URL.PROFILE,
    method: 'GET',
    isSecureEntry: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);
  useEffect(() => {
    if (profileDataResponse && profileDataResponse.status_code === 200) {
      const fetchedUser = profileDataResponse.data.user;
      dispatch(setUserDetails(fetchedUser));
      setProfileData({
        name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
        location: fetchedUser.location?.name || 'N/A',
        phoneNumber: `${fetchedUser.phone_number}`,
        email: fetchedUser.email,
      });
      setIsLoading(false);
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
          await AsyncStorage.clear();
          await Keychain.resetGenericPassword();
        } else {
          console.log('Logout failed');
        }
      } catch (error) {
        console.log('Error while logging out:', error);
      }
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
    const filename = imageSource.path?.split('/').pop();
    const match_ = /\.(\w+)$/.exec(filename ?? '');
    const type = match_ ? `image/${match_[1]}` : 'image/jpeg';
    const uri = imageSource?.path || imageSource;
    const avatar_id = {
      uri: uri,
      name: filename,
      type: type,
    };
    let payload = {
      avatar_id : avatar_id,
    };
    await updateProfile({payload});
  };

  useEffect(() => {
    const handleUpdateData = async () => {
      Alert.alert('Success', 'Profile updated successfully');
      const user = updateProfileResponse.data.user;
      console.log(user);
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
  

    await updateEmail({payload,headers});
  };

  useEffect(() => {
    const handleUpdateEmailData = async () => {
      Alert.alert('Success', 'Email updated successfully');
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
  

    await updatePhoneNumber({payload,headers});
  };

  useEffect(() => {
    const handleUpdatePhoneNumberData = async () => {
      Alert.alert('Success', 'Phone number updated successfully');
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
        console.log(image);
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
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
  if (isLoading) {
    return (
      <View style={ProfileStyles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={ProfileStyles.container}>
      <Pressable
        style={ProfileStyles.profileContainer}
        onPress={toggleImageAction}>
        {isDefaultImage ? (
          <View>
            <ProfileImg width={80} height={81} />
            <Edit
              style={{position: 'absolute', bottom: 5, right: 5, zIndex: 2}}
            />
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
          <Text style={ProfileStyles.infoTextBold}>{profileData.location}</Text>
        </View>
        <View
          style={[ProfileStyles.infoItem, ProfileStyles.editButtonContainer]}>
          <View style={{gap: 8}}>
            <Text style={ProfileStyles.infoText}>Phone Number</Text>
            {isEditingPhoneNumber ? (
              <TextInput
                style={ProfileStyles.infoTextBold}
                value={profileData.phoneNumber}
                onChangeText={text =>
                  setProfileData({...profileData, phoneNumber: text})
                }
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
          style={[ProfileStyles.infoItem, ProfileStyles.editButtonContainer]}>
          <View style={{gap: 8}}>
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

      <Pressable onPress={onLogout} style={ProfileStyles.logoutButton}>
        <Text style={ProfileStyles.editButton}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Profile;
