import React, {useRef, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert,Modal} from 'react-native';
import BottomModal from '../BottomSheetModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ButtonNavigation, Field, Calendar, Dots, Trash, Edit} from '../../assets/icons/svgs';
import {differenceInDays} from 'date-fns';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs, {Dayjs} from 'dayjs';
import PlanVisitStyles from '../..//screens/app-screens/PlanVisit/PlanVisitStyles';
import {SafeAreaView, StatusBar, Calender} from '../../components';

const UpcomingVisits = ({visit, onDelete, navigation,refreshVisits} : any) => {
  const bottomSheetModalRef = useRef<any>(null);
  const {bottom} = useSafeAreaInsets();
  const currentDate = new Date();
  const daysLeft = differenceInDays(new Date(visit.date), currentDate);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDateModelVisible, setIsDateModelVisible] = useState(false);

  const [deleteVisit, deleteVisitResponse] = useApi({
    url: `${URL.VISITS}${visit.id}`,
    method: 'DELETE',
  });

  const onDeleteVisit = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    } 

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };

    deleteVisit({headers});
  };

  useEffect(() => {
    if (deleteVisitResponse) {
      if (deleteVisitResponse.status_code === 200) {
        Alert.alert('Success', 'Visit deleted successfully');
        onDelete(visit.id);
      } else {
        Alert.alert('Error', 'Failed to delete visit');
      }
    }
  }, [deleteVisitResponse]);
  
  const [update,updatedResponse] = useApi({
    url : `${URL.VISITS}${visit.id}/`,
    method : 'PUT',
  })

  const onUpdate = async() => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };

    const payload = {
      date: selectedDate?.format('YYYY-MM-DD'),
    };
    update({payload,headers})
  }

  useEffect(() => {
    if (updatedResponse) {
      if (updatedResponse.status_code === 200) {
        Alert.alert('Success', 'Visit updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update visit');
      }
    }
  }, [updatedResponse]);

  const handleEdit = () => {
    setIsEditing(true)
    bottomSheetModalRef.current.close()
    setIsDateModelVisible(true)
  };
  const handleOk = (date: Dayjs | null) => {
    setSelectedDate(dayjs(date));
    onUpdate()
    // refreshVisits(); // Refresh visits after update
    setIsDateModelVisible(false);
  };

  const handleCancel = () => {
    setIsDateModelVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Field />
            <View style={styles.textColumn}>
              <Text style={styles.fieldName}>{visit.experiment_name}</Text>
              <Text style={styles.description}>{visit.trial_type}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>
            <Dots />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Calendar />
            <View style={styles.textColumn}>
              <Text style={styles.date}>{visit.date}</Text>
              <Text style={styles.daysLeft}>Days left: {daysLeft ? daysLeft : "N/A"}</Text>
            </View>
          </View>
          <ButtonNavigation />
        </View>
      </View>
      {
        isDateModelVisible && 
          <Modal
            animationType="slide"
            transparent={true}
            visible={isDateModelVisible}
            onRequestClose={() => {
              setIsDateModelVisible(!isDateModelVisible);
            }}>
            <View style={PlanVisitStyles.modalOverlay}>
              <Calender
                modalVisible={isDateModelVisible}
                onCancel={handleCancel}
                onOk={handleOk}
              />
            </View>
          </Modal>
      }
      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={[styles.bottomModalContainer, {paddingBottom: bottom}]}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onDeleteVisit} style={styles.modalOption}>
            <Trash />
            <Text style={styles.modalOptionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
            <Edit />
            <Text style={styles.modalOptionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    marginLeft: 10,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 16,
  },
  daysLeft: {
    fontSize: 14,
    color: '#666',
  },
  bottomModalContainer: {
    paddingHorizontal: 20,
  },
  modalContent: {
    paddingVertical: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default UpcomingVisits;
