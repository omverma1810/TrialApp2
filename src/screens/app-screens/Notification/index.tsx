import React from 'react';
import {StyleSheet , View , Text} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../components'
import { NotificationImg } from '../../../assets/icons/svgs';
import NotificationStyles from './NotificationDefault/NotificationStyles';
import NotificationScreen from './NotificationScreen';
import { NotificationScreenProps } from '../../../types/navigation/appTypes';

const Notification: React.FC<NotificationScreenProps> = ({navigation}) => {
  return (
    <SafeAreaView>
      <StatusBar />
      <NotificationScreen navigation={navigation}/>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({});
