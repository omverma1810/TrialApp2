import React from 'react';
import {View, Text, Image, TouchableOpacity, Pressable} from 'react-native';

import {
  Flask,
  Leaf,
  File,
  Logo,
  ProfileImg,
} from '../../../../assets/icons/svgs';
import HeaderStyles from './HeaderStyles';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenProps} from '../../../../types/navigation/appTypes';

type HeaderProps = {
  navigation: HomeScreenProps['navigation'];
};

const Header: React.FC<HeaderProps> = ({navigation}) => {
  const goToProfile = () => {
    navigation.navigate('Profile');
  };
  return (
    <View style={HeaderStyles.main}>
      <View style={HeaderStyles.container}>
        <Logo />
        <Pressable onPress={goToProfile}>
          <View>
            <ProfileImg width={50} height={50} />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
