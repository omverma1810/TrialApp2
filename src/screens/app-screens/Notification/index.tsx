import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import ComingSoon from '../ComingSoon';

const Notification = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({});
