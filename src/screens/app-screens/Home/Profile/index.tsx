import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ProfileStyles from './ProfileStyles';
import {ProfileImg} from '../../../../assets/icons/svgs';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {useApi} from '../../../../hooks/useApi';
import {URL} from '../../../../constants/URLS';
import {
  setClearAuthData,
  setIsUserSignedIn,
  setUserDetails,
} from '../../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

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

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.userDetails);

  // fetching profile details using access token
  const [fetchProfile, profileDataResponse] = useApi({
    url: URL.GET_PROFILE,
    method: 'GET',
  });

  useEffect(() => {
    const getTokenAndFetchProfile = async () => {
      try {
        if (user) {
          setProfileData({
            name: `${user.first_name} ${user.last_name}`,
            location: user.location?.name || 'N/A',
            phoneNumber: `${user.phone_number}`,
            email: user.email,
          });
          setIsLoading(false);
        }
        // } else {
        //   const token = await AsyncStorage.getItem('accessToken');
        //   if (token) {
        //     await fetchProfile({headers: {Authorization: `Bearer ${token}`}});
        //     if (profileDataResponse && profileDataResponse.status === 200) {
        //       const fetchedUser = profileDataResponse.data.user;
        //       dispatch(setUserDetails(fetchedUser)); 
        //       setProfileData({
        //         name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
        //         location: fetchedUser.location?.name || 'N/A',
        //         phoneNumber: `${fetchedUser.country_code} ${fetchedUser.phone_number}`,
        //         email: fetchedUser.email,
        //       });
        //     }
        //   } else {
        //     console.log('No token found');
        //   }
        // }
      } catch (error: any) {
        console.log('Error retrieving token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getTokenAndFetchProfile();
  }, [profileDataResponse]);

  //logout functionality
  const [logout, logoutResponse] = useApi({
    url: URL.LOGOUT,
    method: 'DELETE',
    isSecureEntry: true,
  });
  useEffect(()=>{
    const handleLogout = async () => {
      try {
        if (logoutResponse && logoutResponse.status_code === 200) {
          dispatch(setIsUserSignedIn(false));
          dispatch(setClearAuthData(profileData));
          await AsyncStorage.clear();
          await Keychain.resetGenericPassword();
        } else {
          console.log('Logout failed');
        }
      } catch (error) {
        console.log('Error while logging out:', error);
      }
    };
    handleLogout()
  },[logoutResponse])
  const onLogout = async() =>{
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      console.log('No access token found');
      return;
    }
    await logout({
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-auth-key': accessToken,
      },
      payload: {
        access_token: accessToken,
      },
    });
    console.log(logoutResponse)
  }
  
  const [updateProfile, updateProfileResponse] = useApi({
    url: URL.UPDATE_PROFILE,
    method: 'PUT',
  });
  const onUpdate = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found');
      return;
    }

    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };  
    let numericStr = profileData.phoneNumber.replace(/\s/, '')
    let payload = JSON.stringify({
      "phone_number": parseInt(numericStr),
      "email": profileData.email
    });
    await updateProfile({payload,headers});
  };
  useEffect(() => { 
    console.log('updateddata', updateProfileResponse);
    const handleUpdateData = async () => {
      Alert.alert('Success', 'Profile updated successfully');
      const user= updateProfileResponse.data.user;
      console.log(user)
      dispatch(setUserDetails(user));
      await AsyncStorage.setItem(
        USER_DETAILS_STORAGE_KEY,
        JSON.stringify(user),
      );
      await Keychain.setGenericPassword(profileData.email, profileData.phoneNumber);
      setIsEditing(false);
    };
    if (updateProfileResponse && updateProfileResponse.status_code === 200) {
      handleUpdateData();
    }
  }, [updateProfileResponse]);
  
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
          <ProfileImg width={80} height={81} />
        ) : (
          <Image
            style={{width: 80, height: 80, borderRadius: 100}}
            source={{uri: imageSource.path ?? undefined}}
          />
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
            {isEditing ? (
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
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={ProfileStyles.editButton}>
              {isEditing ? '' : 'Edit'}
            </Text>
          </Pressable>
        </View>
        <View
          style={[ProfileStyles.infoItem, ProfileStyles.editButtonContainer]}>
          <View style={{gap: 8}}>
            <Text style={ProfileStyles.infoText}>Email Id</Text>
            {isEditing ? (
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
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={ProfileStyles.editButton}>
              {isEditing ? '' : 'Edit'}
            </Text>
          </Pressable>
        </View>
      </View>
      {isEditing && (
        <Pressable onPress={onUpdate} style={ProfileStyles.updateButton}>
          <Text style={ProfileStyles.updateButtonText}>Update Profile</Text>
        </Pressable>
      )}
      <Pressable onPress={onLogout} style={ProfileStyles.logoutButton}>
        <Text style={ProfileStyles.editButton}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Profile;
