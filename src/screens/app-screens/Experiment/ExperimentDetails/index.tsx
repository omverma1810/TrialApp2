import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../../components';
import ComingSoon from '../../ComingSoon';

const ExperimentDetails = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <ComingSoon />
    </SafeAreaView>
  );
};

export default ExperimentDetails;

const styles = StyleSheet.create({});
