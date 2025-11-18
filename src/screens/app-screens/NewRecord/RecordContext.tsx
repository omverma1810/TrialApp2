import {useNavigation, useRoute} from '@react-navigation/native';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';

import {ImagePlus, Notes} from '../../../assets/icons/svgs';
import {LOCALES} from '../../../localization/constants';
import {NewRecordScreenProps} from '../../../types/navigation/appTypes';
import {
  formatDateTime,
  getBase64FromUrl,
  getNameFromUrl,
} from '../../../utilities/function';
import Toast from '../../../utilities/toast';
import {useRecordApi} from './RecordApiContext';
import {UpdateRecordDataFunction} from './UnrecordedTraits/UnrecordedTraitsContext';
import {useExperimentTracker} from '../../../utilities/experimentTracker';
import {validateLocationForAPI} from '../../../utilities/locationValidation';

type RecordData = {
  [key: string]: {
    observationId: number | null;
    traitId: number;
    observedValue: string;
  };
};

interface userInteractionOptionsType {
  id: number;
  name: string;
  icon: React.JSX.Element;
  onPress: () => void;
}

export interface TraitsImageTypes {
  url: string;
  imagePath: string | null;
  imageName: string | null;
  base64Data: string | null;
  uploadedOn: string | null;
}

interface RecordContextType {
  userInteractionOptions: userInteractionOptionsType[];
  cropList: string[];
  projectList: string[];
  experimentList: any[];
  fieldList: any[];
  plotList: any[];
  unRecordedTraitList: {
    observationId: number | null;
    traitId: number;
    value: any;
  }[];
  selectedCrop: any;
  selectedProject: any;
  selectedExperiment: any;
  selectedField: any;
  selectedPlot: any;
  images: TraitsImageTypes[];
  notes: string;
  isNotesModalVisible: boolean;
  isSelectExperimentVisible: boolean;
  isSelectFieldVisible: boolean;
  isSelectPlotVisible: boolean;
  isUnrecordedTraitsVisible: boolean;
  isSaveRecordBtnVisible: boolean;
  isNotesVisible: boolean;
  isTraitsImageVisible: boolean;
  hasNextPlot: boolean;
  handleExperimentSelect: (item: any) => void;
  handleFieldSelect: (item: any) => void;
  handlePlotSelect: (item: any) => void;
  pickImageFromCamera: () => void;
  closeNotesModal: () => void;
  handleCropChange: (option: string) => void;
  handleProjectChange: (option: string) => void;
  updateRecordData: UpdateRecordDataFunction;
  onSaveRecord: (hasNextPlot: boolean) => void;
  onSaveNotes: (notes: string) => void;
  onDeleteImages: (arr: number[]) => void;
  getExperimentTypeColor: (type: string) => string;
  isExperimentListLoading: boolean;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider = ({children}: {children: ReactNode}) => {
  const {t} = useTranslation();
  const {trackExperimentVisit, trackDataRecording} = useExperimentTracker();
  const {
    experimentListData,
    getFieldList,
    fieldListData,
    getPlotList,
    plotListData,
    createTraitsRecord,
    updateTraitsRecord,
    trraitsRecordData,
  } = useRecordApi();
  const navigation = useNavigation<NewRecordScreenProps['navigation']>();
  const {params} = useRoute<NewRecordScreenProps['route']>();
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

  const [experimentData, setExperimentData] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState([]);
  const [fieldList, setFieldList] = useState([]);
  const [plotList, setPlotList] = useState([]);
  const [unRecordedTraitList, setUnRecordedTraitList] = useState<
    {observationId: number | null; traitId: number; value: any}[]
  >([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [recordData, setRecordData] = useState<RecordData>({});
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<TraitsImageTypes[]>([]);
  const [maxNoOfImages, setMaxNoOfImages] = useState(0);
  const [hasNextPlot, setHasNextPlot] = useState(false);
  const isSelectExperimentVisible = true;
  const isSelectFieldVisible = !!selectedExperiment;
  const isSelectPlotVisible = !!selectedExperiment && !!selectedField;
  const isUnrecordedTraitsVisible =
    !!selectedExperiment && !!selectedField && !!selectedPlot;
  const isNotesVisible = notes.trim().length > 0;
  const isTraitsImageVisible = images.length > 0;
  const isSaveRecordBtnVisible =
    Object.keys(recordData).length > 0 ||
    isNotesVisible ||
    isTraitsImageVisible;

  const handleExperimentSelect = (item: any) => {
    setSelectedExperiment(item);
    setSelectedField(null);
    setSelectedPlot(null);

    // Track experiment visit
    if (item && selectedCrop) {
      trackExperimentVisit(item, selectedCrop);
    }
  };
  const handleFieldSelect = (item: any) => {
    setSelectedField(item);
    setSelectedPlot(null);
  };
  const handlePlotSelect = (item: any) => {
    setSelectedPlot(item);
    setUnRecordedTraitList(item?.unrecordedTraitData);
    setNotes(item?.notes || '');
    setImages(item?.imageUrls || []);
  };
  const pickImageFromCamera = () => {
    if (images.length >= maxNoOfImages) {
      Toast.info({
        message: `Maximum number (${maxNoOfImages}) of trait image uploads exceeded.`,
      });
      return;
    }
    ImagePicker.openCamera({cropping: true}).then(image => {
      navigation.navigate('AddImage', {
        imageUrl: image.path,
        screen: 'NewRecord',
        data: {
          id: selectedPlot.id,
          type: selectedExperiment?.experimentType,
          plotId: selectedPlot?.id,
          field: selectedField?.location?.villageName,
        },
      });
    });
  };
  const closeNotesModal = () => {
    setIsNotesModalVisible(false);
  };

  useEffect(() => {
    const data: any = params;
    if (data?.imageUrl) {
      setImages([
        {
          url: data?.imageUrl,
          imagePath: null,
          base64Data: null,
          imageName: null,
          uploadedOn: data?.uploadedOn,
        },
        ...images,
      ]);
    }
  }, [params]);

  useEffect(() => {
    if (experimentListData?.status_code !== 200 || !experimentListData?.data) {
      return;
    }
    const paramsData: any = params;
    const {data} = experimentListData;
    const cropList = Object.keys(data || {});

    let selectedCrop = null;
    if (paramsData?.QRData) {
      selectedCrop = paramsData.QRData.crop;
    } else {
      selectedCrop = cropList[0] || null;
    }
    const projectList = Object.keys(data?.[selectedCrop] || {});
    let selectedProject = null;

    if (paramsData?.QRData) {
      selectedProject = paramsData.QRData.project;
    } else {
      selectedProject = projectList[0] || null;
    }

    const experimentList = data?.[selectedCrop]?.[selectedProject] || [];

    setExperimentData(data);
    setCropList(cropList);
    setProjectList(projectList);
    setExperimentList(experimentList);
    setSelectedCrop(selectedCrop);
    setSelectedProject(selectedProject);
    if (paramsData?.QRData) {
      const data = paramsData?.QRData;
      const experiment = Array.isArray(experimentList)
        ? experimentList.find((item: any) => item?.id === data?.experiment_id)
        : null;
      if (experiment) {
        setSelectedCrop(data?.crop || '');
        setSelectedProject(data?.project || '');
        handleExperimentSelect(experiment);
      }
    }
  }, [experimentListData]);

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      const newProjectList = Object.keys(experimentData?.[option] || {});
      const experimentList =
        experimentData?.[option]?.[newProjectList[0]] || [];
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(experimentList);
    },
    [experimentData],
  );

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      const experimentList = experimentData?.[selectedCrop]?.[option] || [];
      setExperimentList(experimentList);
    },
    [experimentData, selectedCrop],
  );

  useEffect(() => {
    if (!selectedExperiment) {
      return;
    }
    getFieldList({
      pathParams: selectedExperiment?.id,
      queryParams: `experimentType=${selectedExperiment?.experimentType}`,
    });
  }, [selectedExperiment]);

  useEffect(() => {
    if (fieldListData?.status_code !== 200 || !fieldListData?.data) {
      return;
    }

    const {data} = fieldListData;
    const fieldList = data?.locationList || [];
    setFieldList(fieldList);
    const paramsData: any = params;
    if (paramsData?.QRData) {
      const data = paramsData?.QRData;
      const field = fieldList?.find(
        (item: any) => item?.landVillageId === data?.field_id,
      );
      if (field) {
        handleFieldSelect(field);
      }
    }
  }, [fieldListData]);

  useEffect(() => {
    if (!selectedField || !selectedExperiment) {
      return;
    }
    getPlotList({
      pathParams: selectedField?.id,
      queryParams: `experimentType=${selectedExperiment?.experimentType}`,
    });
  }, [selectedField, selectedExperiment]);

  useEffect(() => {
    if (plotListData?.status_code !== 200 || !plotListData?.data) {
      return;
    }

    const {data} = plotListData;
    const plotList = data?.plotData;
    setPlotList(plotList);
    setMaxNoOfImages(5);
    const paramsData: any = params;
    if (paramsData?.QRData) {
      const data = paramsData?.QRData;
      const plot = plotList?.find((item: any) => item?.id === data?.plot_id);
      if (plot) {
        handlePlotSelect(plot);
      }
    }
  }, [plotListData]);

  const updateRecordData: UpdateRecordDataFunction = (
    observationId,
    traitId,
    observedValue,
  ) => {
    // 1️⃣ keep recordData up-to-date for payload
    setRecordData(prev => ({
      ...prev,
      [traitId]: {observationId, traitId, observedValue},
    }));

    // 2️⃣ also mirror into unRecordedTraitList.value so your inputs reflect the change
    setUnRecordedTraitList(prevList =>
      prevList.map(trait =>
        trait.traitId === traitId
          ? {...trait, observationId, value: observedValue}
          : trait,
      ),
    );
  };

  useEffect(() => {
    if (trraitsRecordData?.status_code !== 200) {
      return;
    }
    const {message, nextPlotObject} = trraitsRecordData;
    Toast.success({message: message});
    setRecordData({});
    if (hasNextPlot && nextPlotObject) {
      const plot: any = plotList?.find(
        (item: any) =>
          item?.id == nextPlotObject?.plotId &&
          item?.plotNumber == nextPlotObject?.plotNumber,
      );
      if (plot) {
        setSelectedPlot(plot);
        setUnRecordedTraitList(plot?.unrecordedTraitData);
        setNotes(plot?.notes || '');
        setImages(plot?.imageUrls || []);
      }
    }
  }, [trraitsRecordData, hasNextPlot]);

  const onSaveRecord = async (hasNextPlot: boolean) => {
    setHasNextPlot(hasNextPlot);

    // 1️⃣ build your phenotypes array (new OR edited)
    const phenotypes = Object.values(recordData)
      .filter(p => p.observedValue !== '')
      .map(({observationId, traitId, observedValue}) => ({
        observationId,
        traitId,
        observedValue,
      }));

    // 2️⃣ detect notes & prior state
    const hasNotes = notes.trim().length > 0;
    const hadNotesBefore = Boolean(selectedPlot?.notes?.trim());
    // your GET should populate recordedTraitData when there are existing obs
    const hadObsBefore = Boolean(selectedPlot?.recordedTraitData?.length);

    // 3️⃣ common bits
    const locationData = await validateLocationForAPI(true, true);
    if (!locationData) {
      return;
    }

    const {latitude, longitude} = locationData;
    const now = formatDateTime(new Date());
    const headers = {'Content-Type': 'application/json'};

    // Track data recording activity before saving
    if (
      (phenotypes.length > 0 || hasNotes) &&
      selectedExperiment &&
      selectedCrop
    ) {
      try {
        await trackDataRecording(selectedExperiment, selectedCrop);
      } catch (error) {}
    }

    // 4️⃣ PUT if overriding existing obs or overriding existing note
    if (
      (hadObsBefore && phenotypes.length > 0) ||
      (hadNotesBefore && hasNotes)
    ) {
      const putPayload = {
        date: now,
        fieldExperimentId: selectedExperiment.id,
        experimentType: selectedExperiment.experimentType,
        phenotypes, // may be []
        plotId: selectedPlot.id,
        notes, // override old note
      };
      await updateTraitsRecord({payload: putPayload, headers});
      Toast.success({message: 'Data Uploaded Successfully'});

      // 5️⃣ POST when brand-new obs or brand-new note (and nothing to PUT)
    } else if (
      phenotypes.length > 0 || // new trait values
      (hasNotes && !hadNotesBefore) // new notes
    ) {
      const postPayload = {
        experimentType: selectedExperiment.experimentType,
        fieldExperimentId: selectedExperiment.id,
        observations: [
          {
            plotId: selectedPlot.id,
            date: now,
            lat: latitude,
            long: longitude,
            notes,
            applications: null,
            phenotypes,
          },
        ],
      };
      await createTraitsRecord({payload: postPayload, headers});
      Toast.success({message: 'Data Uploaded Successfully'});
    }
  };

  const onSaveNotes = (notes: string) => {
    setNotes(notes.trim());
    setIsNotesModalVisible(false);
  };

  const onDeleteImages = (arr: number[]) => {
    if (!Array.isArray(images)) return;
    const newImages = images.filter((_, index) => !arr.includes(index));
    setImages(newImages);
  };

  const getExperimentTypeColor = useCallback((type: string) => {
    if (type === 'hybrid') {
      return '#fdf8ee';
    } else if (type === 'line') {
      return '#fcebea';
    } else {
      return '#eaf4e7';
    }
  }, []);

  const value = {
    userInteractionOptions,
    cropList,
    projectList,
    experimentList,
    fieldList,
    plotList,
    unRecordedTraitList,
    selectedCrop,
    selectedProject,
    selectedExperiment,
    selectedField,
    selectedPlot,
    images,
    notes,
    isNotesModalVisible,
    isSelectExperimentVisible,
    isSelectFieldVisible,
    isSelectPlotVisible,
    isUnrecordedTraitsVisible,
    isSaveRecordBtnVisible,
    isNotesVisible,
    isTraitsImageVisible,
    hasNextPlot,
    handleExperimentSelect,
    handleFieldSelect,
    handlePlotSelect,
    pickImageFromCamera,
    closeNotesModal,
    handleCropChange,
    handleProjectChange,
    updateRecordData,
    onSaveRecord,
    onSaveNotes,
    onDeleteImages,
    getExperimentTypeColor,
    isExperimentListLoading:
      experimentListData?.status_code === 200 ? false : true, // Add this line
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
