import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components';
import ComingSoon from '../ComingSoon';

const Experiment = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default Experiment;

const styles = StyleSheet.create({});
