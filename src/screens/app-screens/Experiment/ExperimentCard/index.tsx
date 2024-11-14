import {Text, View} from 'react-native';
import React, {Fragment} from 'react';

import {styles} from './styles';
import ExperimentList from './ExperimentList';

const ExperimentCard = ({item, selectedProject}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.cropContainer}>
        <Text style={styles.cropTitle}>{item?.name}</Text>
      </View>
      {item?.data?.map((item: any) => (
        <Fragment key={item?.id}>
          <ExperimentList experiment={item} selectedProject={selectedProject} />
        </Fragment>
      ))}
    </View>
  );
};

export default ExperimentCard;
