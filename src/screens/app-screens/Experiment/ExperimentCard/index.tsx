import {Text, View} from 'react-native';
import React from 'react';

import {styles} from './styles';
import ExperimentList from './ExperimentList';

const ExperimentCard = ({data, isFirstIndex, isLastIndex}: any) => {
  return (
    <View
      style={[
        styles.container,
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      {/* <View style={styles.cropContainer}>
        <Text style={styles.cropTitle}>{data?.crop_name}</Text>
      </View>
      {data?.experiments?.map(ExperimentList)} */}
      <ExperimentList experiment={data} />
    </View>
  );
};

export default ExperimentCard;
