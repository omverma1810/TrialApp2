import React, {createContext, useContext, useState, ReactNode} from 'react';

interface TraitItem {
  id: number;
  name: string;
  type: string;
}

interface RecordContextType {
  item: TraitItem;
  isInputActive: boolean;
  isRecorded: boolean;
  recordedValue: string;
  onRecord: () => void;
  onSubmit: (value: string) => void;
  onEdit: () => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider = ({
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
    <RecordContext.Provider
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
    </RecordContext.Provider>
  );
};

export const useRecord = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecord must be used within a RecordProvider');
  }
  return context;
};
