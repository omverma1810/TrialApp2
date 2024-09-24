import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import BottomModal from '../BottomSheetModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ButtonNavigation,
  Field,
  Calendar,
  Dots,
  Trash,
  DbEdit,
} from '../../assets/icons/svgs';
import {differenceInDays, isToday, isTomorrow, isYesterday} from 'date-fns';
import {useApi} from '../../hooks/useApi';
import {URL} from '../../constants/URLS';
import dayjs, {Dayjs} from 'dayjs';
import PlanVisitStyles from '../..//screens/app-screens/PlanVisit/PlanVisitStyles';
import {SafeAreaView, StatusBar, Calender} from '../../components';
import {FONTS} from '../../theme/fonts';
import Toast from '../../utilities/toast';

const UpcomingVisits = ({visit, onDelete, navigation, refreshVisits}: any) => {
  const bottomSheetModalRef = useRef<any>(null);
  const {bottom} = useSafeAreaInsets();
  const currentDate = new Date();

  const [daysLeft, setdaysLeft] = useState<any>(
    differenceInDays(new Date(visit.date), currentDate),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDateModelVisible, setIsDateModelVisible] = useState(false);

  const [deleteVisit, deleteVisitResponse] = useApi({
    url: URL.VISITS.replace(/\/$/, ''),
    method: 'DELETE',
  });

  const onDeleteVisit = async () => {
    deleteVisit({pathParams: visit.id});
  };
  useEffect(() => {
    const visitDate = new Date(visit.date);
    const difference = differenceInDays(visitDate, currentDate);
    
    if (isToday(visitDate)) {
      setdaysLeft('Today');
    } else if (isTomorrow(visitDate)) {
      setdaysLeft('Tomorrow');
    } else if (isYesterday(visitDate)) {
      setdaysLeft('Yesterday');
    } else {
      setdaysLeft(difference);
    }
  }, [visit.date]);
    useEffect(() => {
    if (deleteVisitResponse) {
      if (deleteVisitResponse.status_code === 204) {
        Toast.success({
          message: 'Visit deleted successfully',
        });
        onDelete(visit.id);
      } else {
        Toast.error({
          message: 'Failed to delete visit',
        });
      }
    }
  }, [deleteVisitResponse]);

  const [update, updatedResponse] = useApi({
    url: `${URL.VISITS}${visit.id}/`,
    method: 'PUT',
  });


  const onUpdate = async (dateSelected: any) => {
    const payload = {
      date: dateSelected.format('YYYY-MM-DD'),
    };
    update({payload});
  };

  useEffect(() => {
    if (updatedResponse) {
      if (updatedResponse.status_code === 200) {
        Toast.success({
          message: 'Visit updated successfully',
        });
      } else {
        Toast.error({
          message: 'Failed to update visit',
        });
      }
    }
  }, [updatedResponse]);

  const handleEdit = () => {
    setIsEditing(true);
    bottomSheetModalRef.current.close();
    setIsDateModelVisible(true);
  };
  const handleOk = (date: Dayjs | null) => {
    setSelectedDate(dayjs(date));
    const dateSelected = dayjs(date);
    onUpdate(dateSelected);
    refreshVisits(); // Refresh visits after update
    setIsDateModelVisible(false);
    if (selectedDate) {
      setdaysLeft(
        differenceInDays(
          new Date(selectedDate.format('YYYY-MM-DD')),
          currentDate,
        ),
      ); // Recalculate daysLeft
    }
  };

  const handleCancel = () => {
    setIsDateModelVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress = {() => bottomSheetModalRef.current?.present()}>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Field />
            <View style={styles.textColumn}>
              <Text style={styles.fieldName}>{visit.experiment_name}</Text>
              <Text style={styles.description}>{visit.trial_type}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.present()}>
            <Dots />
          </TouchableOpacity>
        </View>
        </TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Calendar />
            <View style={styles.textColumn}>
              <Text style={styles.date}>{visit.date}</Text>
              <Text style={styles.daysLeft}>
                Days left: {daysLeft ? daysLeft : 'N/A'}
              </Text>
            </View>
          </View>
          <ButtonNavigation />
        </View>
      </View>
      {isDateModelVisible && (
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
              selectedDate={visit.date}
            />
          </View>
        </Modal>
      )}
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
            <DbEdit />
            <Text style={styles.editOptionText}>Edit</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F7F7F7',
    // elevation: 3,
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
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
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
    fontSize: 15,
    color: '#161616',
    fontWeight: '400',
  },
  editOptionText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#161616',
    fontWeight: '400',
    marginHorizontal: 20,
  },
});

export default UpcomingVisits;
