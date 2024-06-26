import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Edit } from '../../assets/icons/svgs';

export default function CalendarModal({ modalVisible, onCancel, onOk }) {
  const [date, setDate] = useState(dayjs());
  const [textInputValue, setTextInputValue] = useState('');

  useEffect(() => {
    setTextInputValue(dayjs().format('dddd, MMMM D'));
  }, []);

  const handleDateChange = (params) => {
    setDate(dayjs(params.date));
    setTextInputValue(dayjs(params.date).format('dddd, MMMM D'));
  };

  const handleOk = () => {
    const formattedDate = date.format('YYYY-MM-DD');
    onOk(formattedDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Date</Text>
        <View style={styles.headerRow}>
          <TextInput
            style={styles.headerTextInput}
            value={textInputValue}
            placeholder="Selected Date"
            editable={false}
          />
        </View>
      </View>
      <View style={styles.body}>
        <DateTimePicker
          mode="single"
          date={date.toDate()}
          onChange={handleDateChange}
          calendarTextStyle={styles.calendarTextStyle}
          headerTextStyle={styles.headerTextStyle}
          weekDaysTextStyle={styles.dayStyle}
          selectedItemColor="#0B2E58"
          headerButtonsPosition="right"
          dayContainerStyle={styles.dayContainerStyle}
          todayContainerStyle={styles.todayContainerStyle}
          weekDaysContainerStyle={styles.weekDaysContainerStyle}
        />
        <View style={styles.footer}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.footerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOk}>
            <Text style={styles.footerButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    width: 350,
    borderRadius: 25,
  },
  header: {
    gap: 10,
    padding: 20,
    borderBottomWidth: 2,
    borderColor: 'white',
  },
  headerTitle: {
    color: '#636363',
    fontWeight: '500',
    fontSize: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextInput: {
    color: '#161616',
    fontSize: 32,
    fontWeight: '400',
  },
  body: {
    padding: 15,
    gap: 10,
  },
  calendarTextStyle: {
    color: 'black',
  },
  headerTextStyle: {
    color: '#161616',
    padding: 10,
  },
  dayStyle: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 16,
  },
  todayContainerStyle: {
    borderWidth: 0,
  },
  dayContainerStyle: {
    height: 50,
    width: 40,
  },
  weekDaysContainerStyle: {
    borderBottomWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  footerButtonText: {
    color: '#1A6DD2',
    fontSize: 15,
    fontWeight: '500',
  },
});
