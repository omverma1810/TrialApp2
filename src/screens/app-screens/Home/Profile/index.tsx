import React from 'react';
import {View, Text, Pressable} from 'react-native';

import ProfileStyles from './ProfileStyles';

const Profile = () => {
  const profileData = {
    name: 'John Doe',
    location: 'New York',
    phoneNumber: '+1234567890',
    email: 'johndoe@example.com',
  };

  return (
    <View style={ProfileStyles.container}>
      <View style={ProfileStyles.profileContainer}>
        {/* <Image style={ProfileStyles.profileImage} source={require('../../assets/splash.png')} /> */}
      </View>
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
