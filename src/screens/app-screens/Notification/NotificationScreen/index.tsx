import {View, Text, Pressable, Linking} from 'react-native';
import React from 'react';
import {Alert, Back, Clock, List} from '../../../../assets/icons/svgs';
import styles from './NotificationScreenStyles';
import {NotificationScreenProps} from '../../../../types/navigation/appTypes';
import {FONTS} from '../../../../theme/fonts';
import {SafeAreaView} from '../../../../components';

type NotificationProps = {
  navigation: NotificationScreenProps['navigation'];
};

const NotificationScreen: React.FC<NotificationProps> = ({navigation}) => {
  const NotifiationData = {
    experiment: 'GE-Male Line (R) development',
    plot: '312',
    location: 'Medchal , Hyderabad',
  };

  const phoneNumber = '1234567890';

  const handlePress = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const goToTakeRecord = () => {
    navigation.navigate('RecordStackScreens');
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 20,
        }}
      >
        <Text
          style={{
            // marginHorizontal: 10,
            marginVertical: 10,
            fontFamily: FONTS.MEDIUM,
            fontSize: 20,
            color: '#000',
            backgroundColor: 'white',
            display: 'flex',
          }}>
          Notification
        </Text>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <List />
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>New Field Data Available</Text>
              <Text style={styles.bodyText}>
                New data collected by field staff is now available for review.
              </Text>
              <Pressable style={styles.button} onPress={goToTakeRecord}>
                <Text style={styles.buttonText}>View Records</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Clock />
            <View style={styles.reminderTextContainer}>
              <Text style={styles.titleText}>Field Visit Reminder</Text>
              <Text style={styles.bodyText}>
                You have a field visit scheduled for tomorrow. Don't forget to
                check the latest records and take notes
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.alertCard}>
          <View style={styles.row}>
            <Alert />
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>Missing Record</Text>
              <Text style={styles.bodyText}>
                {NotifiationData.experiment} -{'>'} {NotifiationData.plot},{' '}
                {NotifiationData.location}
              </Text>
              <Pressable onPress={handlePress} style={styles.button}>
                <Text style={styles.buttonText}>Call Field Staff</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NotificationScreen;
