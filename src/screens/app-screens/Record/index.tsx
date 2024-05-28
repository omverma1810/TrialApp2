import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import ComingSoon from '../ComingSoon';

const Record = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
