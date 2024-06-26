import React, {createContext, useContext, useState, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';

import {ImagePlus, Notes} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import {NewRecordScreenProps} from '../../../types/navigation/appTypes';

interface userInteractionOptionsType {
  id: number;
  name: string;
  icon: React.JSX.Element;
  onPress: () => void;
}

interface RecordContextType {
  userInteractionOptions: userInteractionOptionsType[];
  selectedExperiment: any;
  selectedField: any;
  selectedPlot: any;
  isNotesModalVisible: boolean;
  isSelectExperimentVisible: boolean;
  isSelectFieldVisible: boolean;
  isSelectPlotVisible: boolean;
  isUnrecordedTraitsVisible: boolean;
  handleExperimentSelect: (item: any) => void;
  handleFieldSelect: (item: any) => void;
  handlePlotSelect: (item: any) => void;
  pickImageFromCamera: () => void;
  closeNotesModal: () => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider = ({children}: {children: ReactNode}) => {
  const {t} = useTranslation();
  const navigation = useNavigation<NewRecordScreenProps['navigation']>();
  const userInteractionOptions = [
    {
      id: 0,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_NOTES),
      icon: <Notes />,
      onPress: () => setIsNotesModalVisible(true),
    },
    {
      id: 1,
      name: t(LOCALES.EXPERIMENT.LBL_ADD_IMAGE),
      icon: <ImagePlus />,
      onPress: () => pickImageFromCamera(),
    },
  ];

  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const isSelectExperimentVisible = true;
  const isSelectFieldVisible = !!selectedExperiment;
  const isSelectPlotVisible = !!selectedExperiment && !!selectedField;
  const isUnrecordedTraitsVisible =
    !!selectedExperiment && !!selectedField && !!selectedPlot;

  const handleExperimentSelect = (item: any) => {
    setSelectedExperiment(item);
    setSelectedField(null);
    setSelectedPlot(null);
  };
  const handleFieldSelect = (item: any) => {
    setSelectedField(item);
    setSelectedPlot(null);
  };
  const handlePlotSelect = (item: any) => {
    setSelectedPlot(item);
  };
  const pickImageFromCamera = () => {
    ImagePicker.openCamera({cropping: true}).then(image => {
      navigation.navigate('AddImage', {
        imageUrl: image.path,
      });
    });
  };
  const closeNotesModal = () => {
    setIsNotesModalVisible(false);
  };

  const value = {
    selectedExperiment,
    selectedField,
    selectedPlot,
    isNotesModalVisible,
    isSelectExperimentVisible,
    isSelectFieldVisible,
    isSelectPlotVisible,
    isUnrecordedTraitsVisible,
    handleExperimentSelect,
    handleFieldSelect,
    handlePlotSelect,
    pickImageFromCamera,
    closeNotesModal,
    userInteractionOptions,
  };

  return (
    <RecordContext.Provider value={value}>{children}</RecordContext.Provider>
  );
};

export const useRecord = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecord must be used within a RecordProvider');
  }
  return context;
};
