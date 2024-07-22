import dayjs from 'dayjs';
import React, {useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ButtonNavigation,
  Calendar,
  Dots,
  Edit,
  Field,
  Trash,
} from '../../assets/icons/svgs';
import BottomModal from '../../components/BottomSheetModal';

const UpcomingVisits = ({visit, onDelete, onEdit}) => {
  const bottomSheetModalRef = useRef(null);
  const {bottom} = useSafeAreaInsets();

  const getDayDifference = date => {
    let saved = dayjs(date);
    let current = dayjs();
    let result = saved.diff(current, 'day');
    if (result > 0) {
      return `${result} Days left`;
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Field />
            <View style={styles.textColumn}>
              <Text style={styles.fieldName}>{visit.experiment_name}</Text>
              <Text
                style={
                  styles.description
                }>{`Location No. ${visit.location}`}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.present()}>
            <Dots />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Calendar />
            <View style={styles.textColumn}>
              <Text style={styles.date}>{visit.date}</Text>
              <Text style={styles.daysLeft}>
                {getDayDifference(visit.date) || 'Date passed'}
              </Text>
            </View>
          </View>
          <ButtonNavigation />
        </View>
      </View>
      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={[styles.bottomModalContainer, {paddingBottom: bottom}]}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={() => {
              onDelete(visit.id);
              bottomSheetModalRef.current?.close();
            }}
            style={styles.modalOption}>
            <Trash />
            <Text style={styles.modalOptionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              onEdit(visit.id);
              bottomSheetModalRef.current?.close();
            }}>
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
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7F7F7',
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  textColumn: {
    gap: 1,
  },
  fieldName: {
    fontSize: 15,
    color: '#161616',
    fontWeight: '500',
  },
  description: {
    color: '#454545',
    fontSize: 13,
  },
  date: {
    color: '#161616',
    fontWeight: '500',
    fontSize: 14,
  },
  daysLeft: {
    color: '#454545',
    fontSize: 13,
  },
  bottomModalContainer: {
    height: 100,
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingVertical: 10,
  },
  modalOption: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#161616',
    fontSize: 15,
    fontWeight: '400',
  },
});

export default UpcomingVisits;
