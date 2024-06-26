import React, {useState} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ProfileStyles from './ProfileStyles';
import {ProfileImg} from '../../../../assets/icons/svgs';

const Profile = () => {
  const profileData = {
    name: 'John Doe',
    location: 'New York',
    phoneNumber: '+1234567890',
    email: 'johndoe@example.com',
  };

  const [imageSource, setImageSource] = useState<string | null>(null);
  const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);

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
        setImageSource(image.path);
        setIsDefaultImage(false);
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
            source={{uri: imageSource ?? undefined}}
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
            <Text style={ProfileStyles.infoTextBold}>
              {profileData.phoneNumber}
            </Text>
          </View>
          <Pressable>
            <Text style={ProfileStyles.editButton}>Edit</Text>
          </Pressable>
        </View>
        <View
          style={[ProfileStyles.infoItem, ProfileStyles.editButtonContainer]}>
          <View style={{gap: 8}}>
            <Text style={ProfileStyles.infoText}>Email Id</Text>
            <Text style={ProfileStyles.infoTextBold}>{profileData.email}</Text>
          </View>
          <Pressable>
            <Text style={ProfileStyles.editButton}>Edit</Text>
          </Pressable>
        </View>
      </View>
      <Pressable style={ProfileStyles.logoutButton}>
        <Text style={ProfileStyles.editButton}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Profile;
