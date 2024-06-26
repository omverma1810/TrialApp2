import React, {createContext, useContext, useState, ReactNode} from 'react';

interface TraitItem {
  id: number;
  name: string;
  type: string;
}

interface UnrecordedTraitsContextType {
  item: TraitItem;
  isInputActive: boolean;
  isRecorded: boolean;
  recordedValue: string;
  onRecord: () => void;
  onSubmit: (value: string) => void;
  onEdit: () => void;
}

const UnrecordedTraitsContext = createContext<
  UnrecordedTraitsContextType | undefined
>(undefined);

export const UnrecordedTraitsProvider = ({
  children,
  item,
}: {
  children: ReactNode;
  item: TraitItem;
}) => {
  const [isInputActive, setIsInputActive] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [recordedValue, setRecordedValue] = useState('');

  const onRecord = () => {
    setIsInputActive(true);
  };

  const onSubmit = (value: string) => {
    setIsRecorded(true);
    setRecordedValue(value);
  };

  const onEdit = () => {
    setIsRecorded(false);
    setIsInputActive(true);
  };

  return (
    <UnrecordedTraitsContext.Provider
      value={{
        item,
        isInputActive,
        isRecorded,
        recordedValue,
        onRecord,
        onSubmit,
        onEdit,
      }}>
      {children}
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
