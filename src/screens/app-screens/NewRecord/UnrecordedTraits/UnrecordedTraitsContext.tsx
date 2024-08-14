import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import OptionsModal from './UnrecordedTraitCard/OptionsModal';

export interface TraitItem {
  traitId: number;
  traitName: string;
  traitUom: string;
  dataType: 'float' | 'fixed' | 'str' | 'int';
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

  const onRecord = () => {
    if (item.dataType === 'fixed') {
      optionsModalRef?.current?.present();
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
    } else {
      setIsRecorded(false);
      setIsInputActive(true);
    }
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
    if (item?.traitUom && item.dataType !== 'fixed') {
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
