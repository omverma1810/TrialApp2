import React, {useState, useRef, useEffect} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {SafeAreaView, StatusBar, Calender} from '../../../components';
import BottomModal from '../../../components/BottomSheetModal';
import {DropdownArrow} from '../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {experiment, field} from '../../../Data';
import Chip from '../../../components/Chip';
import dayjs, {Dayjs} from 'dayjs';
import PlanVisitStyles from './PlanVisitStyles';
import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const PlanVisit = ({navigation}) => {
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState('Select an Experiment');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedField, setSelectedField] = useState<Chip | null>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);
  const {bottom} = useSafeAreaInsets();

  const handleFirstRightIconClick = () => {
    if (bottomSheetModalRef.current) {
      (bottomSheetModalRef.current as any).present();
    }
  };

  const handleSecondRightIconClick = () => {
    if (secondBottomSheetRef.current) {
      (secondBottomSheetRef.current as any).present();
    }
  };

  const handleThirdRightIconClick = () => {
    setModalVisible(true);
  };

  const handleExperimentSelect = (item: Chip) => {
    setSelectedChips([item]);
    setChipTitle('Select Field');
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFieldSelect = (item: Chip) => {
    setSelectedField(item);
    setChipTitle('Select Date');
    (secondBottomSheetRef.current as any).dismiss();
  };

  const handleOk = (date: Dayjs | null) => {
    setSelectedDate(dayjs(date));
    setModalVisible(false);
    setChipVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleChipPress = () => {
    if (selectedChips.length === 0) {
      handleFirstRightIconClick();
    } else if (!selectedField) {
      handleSecondRightIconClick();
    } else {
      handleThirdRightIconClick();
    }
  };

  //planning the visits
  const [planVisit, planVisitResponse] = useApi({
    url: URL.VISITS,
    method: 'POST',
  });
  const onPlanVisit = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    if (!selectedField || !selectedChips.length || !selectedDate) {
      Alert.alert('Error', 'Please select all fields before planning a visit');
      return;
    }

    const payload = {
      field_id: selectedField.id,
      experiment_id: selectedChips[0].id,
      date: selectedDate.format('YYYY-MM-DD'),
      experiment_type: 'hybrid',
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-auth-token': token,
    };

    planVisit({payload, headers});
  };
  useEffect(() => {
    if (planVisitResponse && planVisitResponse.status_code == 201) {
      Alert.alert('Success', 'Visit planned successfully', [
        {text: 'OK', onPress: () => navigation.navigate('Home')},
      ]);
    } else {
      Alert.alert('Error', 'Failed to plan visit');
    }
  }, []);
  return (
    <SafeAreaView>
      <StatusBar />
      <View style={PlanVisitStyles.container}>
        <View style={PlanVisitStyles.chipContainer}>
          {selectedChips.length > 0 && (
            <Pressable
              style={PlanVisitStyles.chipItem}
              onPress={handleChipPress}>
              <Text style={PlanVisitStyles.chipTitle}>Experiment</Text>
              <View style={PlanVisitStyles.chipTextRow}>
                <Text style={PlanVisitStyles.chipText}>
                  {selectedChips[0].ExperientName}
                </Text>
                <DropdownArrow />
              </View>
              <View style={PlanVisitStyles.chipCropText}>
                <Text style={PlanVisitStyles.chipCropText1}>
                  {selectedChips[0].CropName}
                </Text>
              </View>
            </Pressable>
          )}
          {selectedField && (
            <Pressable
              style={PlanVisitStyles.chipItem}
              onPress={handleChipPress}>
              <Text style={PlanVisitStyles.chipTitle}>Field</Text>
              <View style={PlanVisitStyles.chipTextRow}>
                <Text style={PlanVisitStyles.chipText}>
                  {selectedField.fieldName || 'Field name not available'}
                </Text>
                <DropdownArrow />
              </View>
              <Text style={PlanVisitStyles.chipTitle}>
                {selectedField.Location}
              </Text>
            </Pressable>
          )}
        </View>
        {selectedDate && (
          <View style={PlanVisitStyles.dateContainer}>
            <Text style={PlanVisitStyles.dateTitle}>Date</Text>
            <Text style={PlanVisitStyles.dateText}>
              {selectedDate.format('dddd, MMMM D, YYYY')}
            </Text>
          </View>
        )}
        {chipVisible && (
          <Chip
            onPress={handleChipPress}
            rightIcon={
              <Pressable onPress={handleChipPress}>
                <DropdownArrow />
              </Pressable>
            }
            containerStyle={PlanVisitStyles.chip}
            customLabelStyle={PlanVisitStyles.chipLabel}
            title={chipTitle}
            isSelected={false}
          />
        )}
        {!chipVisible && (
          <Pressable style={PlanVisitStyles.submitButton} onPress={onPlanVisit}>
            <Text style={PlanVisitStyles.submitButtonText}>Plan a Visit</Text>
          </Pressable>
        )}
        <BottomModal
          bottomSheetModalRef={bottomSheetModalRef}
          type="CONTENT_HEIGHT"
          containerStyle={{paddingBottom: bottom}}>
          <View style={PlanVisitStyles.modalContainer}>
            <Text style={PlanVisitStyles.modalTitle}>Select an Experiment</Text>
            <ScrollView>
              <View style={{gap: 30}}>
                {experiment.map((item, index) => (
                  <Pressable
                    key={`${item.id}-${index}`}
                    onPress={() => handleExperimentSelect(item)}
                    style={PlanVisitStyles.modalItem}>
                    <Text style={PlanVisitStyles.modalItemText}>
                      {item.ExperientName}
                    </Text>
                    <Text
                      style={[
                        PlanVisitStyles.modalItemCropText,
                        {
                          backgroundColor:
                            item.CropName === 'Rice' ? '#FCEBEA' : '#E8F0FB',
                        },
                      ]}>
                      {item.CropName}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </BottomModal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={PlanVisitStyles.modalOverlay}>
            <Calender
              modalVisible={modalVisible}
              onCancel={handleCancel}
              onOk={handleOk}
            />
          </View>
        </Modal>

        <BottomModal
          bottomSheetModalRef={secondBottomSheetRef}
          type="CONTENT_HEIGHT"
          containerStyle={{paddingBottom: bottom}}>
          <View style={PlanVisitStyles.modalContainer}>
            <Text style={PlanVisitStyles.modalTitle}>Select Field</Text>
            <ScrollView>
              <View style={{gap: 30}}>
                {field.map((item, index) => (
                  <Pressable
                    key={`${item.id}-${index}`}
                    onPress={() =>
                      handleFieldSelect({
                        id: item.id,
                        ExperientName: '',
                        CropName: '',
                        fieldName: item.Fieldno,
                        Location: item.Location,
                      })
                    }
                    style={PlanVisitStyles.fieldItem}>
                    <Text style={PlanVisitStyles.fieldItemText}>
                      Field:{item.Fieldno}
                    </Text>
                    <Text style={PlanVisitStyles.fieldLocationText}>
                      {item.Location}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </BottomModal>
      </View>
    </SafeAreaView>
  );
};

export default PlanVisit;

const styles = StyleSheet.create({});
