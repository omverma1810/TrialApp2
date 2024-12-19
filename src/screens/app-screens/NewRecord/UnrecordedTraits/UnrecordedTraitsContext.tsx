import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal, StyleSheet, View} from 'react-native';
import OptionsModal from './UnrecordedTraitCard/OptionsModal';
import Calendar from '../../../../components/Calender';
import dayjs from 'dayjs';

export interface TraitItem {
  traitId: number;
  traitName: string;
  traitUom: string;
  dataType: 'float' | 'fixed' | 'str' | 'int' | 'date';
  observationStatus: boolean;
  observationId: number | null;
  value: string;
  preDefiendList: any;
}

interface UnrecordedTraitsContextType {
  item: TraitItem;
  isInputActive: boolean;
  isRecorded: boolean;
  recordedValue: string;
  getFormattedRecordValue: string;
  onRecord: () => void;
  onSubmit: (value: string) => void;
  onEdit: () => void;
}

export interface UpdateRecordDataFunction {
  (observationId: number | null, traitId: number, observedValue: string): void;
}

const UnrecordedTraitsContext = createContext<
  UnrecordedTraitsContextType | undefined
>(undefined);

export const UnrecordedTraitsProvider = ({
  children,
  item,
  updateRecordData = () => {},
}: {
  children: ReactNode;
  item: TraitItem;
  updateRecordData: UpdateRecordDataFunction;
}) => {
  const optionsModalRef = useRef<BottomSheetModal>(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [recordedValue, setRecordedValue] = useState('');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const onRecord = () => {
    if (item.dataType === 'fixed') {
      optionsModalRef?.current?.present();
    } else if (item.dataType === 'date') {
      setIsCalendarVisible(true);
    } else {
      setIsInputActive(true);
    }
  };

  const onSubmit = (value: string) => {
    let finalValue: any = value;
    if (item?.dataType === 'int' || item?.dataType === 'float') {
      let numbers: string[] = value.replace(/\*$/, '').split('*');
      let sum: number = numbers.reduce((acc, curr) => acc + Number(curr), 0);
      finalValue = (sum / numbers.length).toFixed(2).toString();
    }
    setIsRecorded(true);
    setRecordedValue(finalValue);
    updateRecordData(item?.observationId, item?.traitId, finalValue);
  };

  const onEdit = () => {
    if (item.dataType === 'fixed') {
      optionsModalRef?.current?.present();
    } else if (item.dataType === 'date') {
      setIsCalendarVisible(true);
    } else {
      setIsRecorded(false);
      setIsInputActive(true);
    }
  };

  const onDateSelected = (date: string) => {
    setRecordedValue(date);
    setIsRecorded(true);
    setIsCalendarVisible(false);
    updateRecordData(item?.observationId, item?.traitId, date);
  };

  const onCancelDate = () => {
    setIsCalendarVisible(false);
  };

  useEffect(() => {
    if (item?.value) {
      setIsRecorded(true);
      setRecordedValue(item.value);
    } else {
      setIsInputActive(false);
      setIsRecorded(false);
      setRecordedValue('');
    }
  }, [item]);

  const getFormattedRecordValue = useMemo(() => {
    if (
      item?.traitUom &&
      item.dataType !== 'fixed' &&
      item.dataType !== 'date'
    ) {
      return `${recordedValue} ${item?.traitUom}`;
    } else {
      return String(recordedValue);
    }
  }, [recordedValue, item?.traitUom]);

  return (
    <UnrecordedTraitsContext.Provider
      value={{
        item,
        isInputActive,
        isRecorded,
        recordedValue,
        getFormattedRecordValue,
        onRecord,
        onSubmit,
        onEdit,
      }}>
      {children}
      <OptionsModal bottomSheetModalRef={optionsModalRef} />
      <Modal
        visible={isCalendarVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCalendarVisible(false)}>
        <View style={styles.transparentBackground}>
          <Calendar
            onCancel={onCancelDate}
            onOk={onDateSelected}
            selectedDate={recordedValue}
          />
        </View>
      </Modal>
    </UnrecordedTraitsContext.Provider>
  );
};

export const useUnrecordedTraits = () => {
  const context = useContext(UnrecordedTraitsContext);
  if (!context) {
    throw new Error(
      'useUnrecordedTraits must be used within a UnrecordedTraitsProvider',
    );
  }
  return context;
};

const styles = StyleSheet.create({
  transparentBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
