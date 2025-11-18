import React from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';
import {APP_LOGO} from '../../../assets/images';

const {width} = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/new_app-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: width * 0.6, // 60% of screen width
    height: width * 0.6, // keep it square—adjust as needed
  },
});

export default SplashScreen;
