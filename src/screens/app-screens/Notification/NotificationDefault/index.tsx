import React from 'react';
import {StyleSheet , View , Text} from 'react-native';

import {SafeAreaView, StatusBar} from '../../../../components'
import { NotificationImg } from '../../../../assets/icons/svgs';
import NotificationStyles from './NotificationStyles';

const Notification = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <View style={NotificationStyles.container}>
        <View style={NotificationStyles.content}>
          <View style={NotificationStyles.innerContent}>
            <NotificationImg />
            <Text style={NotificationStyles.titleText}>No Notification Yet</Text>
            <View style={NotificationStyles.messageContainer}>
              <Text style={NotificationStyles.messageText}>Your notification will appear here</Text>
              <Text style={NotificationStyles.messageText}>once you receive them</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({});
