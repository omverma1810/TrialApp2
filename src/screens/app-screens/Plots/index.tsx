import NetInfo from '@react-native-community/netinfo';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FONTS} from '../../../theme/fonts';

import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import {Calendar} from 'react-native-calendars';
import ImagePicker from 'react-native-image-crop-picker';
import {
  Back,
  DeleteBin,
  GreenTick,
  MapIcon,
  PopupDot,
  Attachment,
  MatrixNote,
  Microphone as MicrophoneIcon,
} from '../../../assets/icons/svgs';
import {
  Button,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
  ImageCarouselModal,
  NotesViewModal,
  ValidationErrorModal,
  ProtocolInfo,
  LastUpdatedInfo,
  IndividualPlantsManager,
  FieldLayoutModal,
  VoiceNoteRecorder,
  InlineVoiceRecorder,
  MultiVoiceNoteManager,
  VoiceNotePlayerModal,
  AgronomyProtocol,
} from '../../../components';
import BottomSheetModalView from '../../../components/BottomSheetModal';
import {ValidationError} from '../../../components/ValidationErrorModal';
import {URL, BASE_URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import {PlotsScreenProps} from '../../../types/navigation/appTypes';
import {formatDateTime} from '../../../utilities/function';
import Toast from '../../../utilities/toast';
import {validateLocationForAPI} from '../../../utilities/locationValidation';
import {isLineExperiment} from '../../../utilities/experimentTypeUtils';
import {
  uploadVoiceNoteToS3,
  generateVoiceNoteQueryParams,
} from '../../../utilities/voiceNoteUpload';
import {usePermissions} from '../../../hooks/usePermissions';
import {useAppSelector} from '../../../store';
import {useExperimentTracker} from '../../../utilities/experimentTracker';
import {ExperimentMetadata} from '../../../services/recentExperimentsService';
import {useOfflineDataRetrieval} from '../../../services/offlineDataRetrieval';
import {savePayloads} from '../../../services/offlineCache';
import {
  registerSyncCompleteCallback,
  unregisterSyncCompleteCallback,
} from '../../../services/offlineDataSync';
import FixedOptionsGrid from '../NewDataRecording/FixedOptionsGrid';
import ImageDisplayNew from '../NewDataRecording/ImageDisplayNew';
import InputField from '../NewDataRecording/InputField';
import PlotNavigator from '../NewDataRecording/PlotNavigator';
import RecordingStatusBar from '../NewDataRecording/RecordingStatusBar';
import {getTraitUpdateData} from '../../../components/LastUpdatedInfo/mockData';
import {PlantData} from '../../../types/components/IndividualPlantsManager';
import RecordedInputCard from '../NewDataRecording/RecordInputCard';
import TraitDisplay from '../NewDataRecording/TraitDisplay';
import NotesModal from '../NewRecord/NotesModal';
import PreviewImageModal from '../NewRecord/TraitsImage/PreviewImageModal';
import {styles} from './styles';
import PlotsSkeleton from './PlotsSkeleton';

const MAX_VOICE_NOTE_DURATION_SECONDS = 180;

const Plots = ({navigation, route}: PlotsScreenProps) => {
  const {t} = useTranslation();
  const {hasPermission} = usePermissions();
  const permissions = useAppSelector(state => state.auth.permissions);
  // Dynamically provided base URL from auth (matches useApi behavior)
  const organizationURL = useAppSelector(state => state.auth.organizationURL);

  // Debug permissions
  useEffect(() => {
    // Permission debugging removed
  }, [hasPermission, permissions]);

  const {id, type, data, experimentID, locationID, fromNewRecord} =
    route.params;

  // Initialize experiment tracker
  const {trackDataRecording} = useExperimentTracker();

  // ─── Offline data retrieval hook ────────────────────────
  const {
    isConnected: networkIsConnected,
    getPlotList: getOfflinePlotList,
    getExperimentDetails: getOfflineExperimentDetails,
  } = useOfflineDataRetrieval();

  const [plotList, setPlotList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isFirstFetch = useRef<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [details, setDetails] = useState({
    cropName: '',
    cropId: '',
    fieldExperimentId: '',
    fieldExperimentName: '',
    maxNoOfImages: 0,
    villageName: '',
    trialLocationId: '',
    name: '',
    fieldLabel: '',
  });

  const buildTrackingMetadata = useCallback(
    (
      overrides: Partial<ExperimentMetadata> = {},
    ): ExperimentMetadata | null => {
      const parseId = (value: unknown): number | null => {
        if (value === null || value === undefined) {
          return null;
        }
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      };

      const numericExperimentId =
        parseId(overrides.experimentId) ??
        parseId(experimentID) ??
        parseId(data?.experimentId);

      if (numericExperimentId === null) {
        return null;
      }

      const fieldExperimentName =
        overrides.fieldExperimentName ||
        data?.fieldExperimentName ||
        details.fieldExperimentName ||
        details.name ||
        overrides.experimentName ||
        data?.experimentName ||
        `Experiment ${numericExperimentId}`;

      const cropName =
        overrides.cropName || details.cropName || data?.cropName || 'Unknown';

      const season = overrides.season || data?.season || 'Unknown';

      const year =
        overrides.year ||
        (data?.year ? String(data.year) : undefined) ||
        new Date().getFullYear().toString();

      return {
        experimentId: numericExperimentId,
        experimentName: overrides.experimentName || fieldExperimentName,
        fieldExperimentName,
        projectKey:
          overrides.projectKey || data?.projectKey || data?.projectId || '',
        cropName,
        season,
        year,
        experimentType:
          overrides.experimentType || data?.experimentType || type || 'Trial',
      };
    },
    [data, details, experimentID, type],
  );

  const [currentTrait, setCurrentTrait] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [currentPlotIndex, setCurrentPlotIndex] = useState(0);
  const [selectedFixedValue, setSelectedFixedValue] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [recordedData, setRecordedData] = useState<Record<string, TraitData[]>>(
    {},
  );
  // Track original data from server to detect unsaved changes
  const [originalRecordedData, setOriginalRecordedData] = useState<
    Record<string, TraitData[]>
  >({});
  // Track traits that were modified in current session (not from server)
  // Format: { "plotNumber": Set(["traitName1", "traitName2"]) }
  // This ensures only newly recorded/modified traits are sent to API,
  // preserving historical metadata (who, when, where) for previously recorded traits
  const [modifiedTraitsInSession, setModifiedTraitsInSession] = useState<
    Record<string, Set<string>>
  >({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [draftNote, setDraftNote] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPreviewVisible, setPreviewVisible] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  // Track recently updated notes to preserve during refresh
  const [recentlyUpdatedNotes, setRecentlyUpdatedNotes] = useState<
    Record<string, string>
  >({});
  const [noteUpdateInProgress, setNoteUpdateInProgress] =
    useState<boolean>(false);
  // ── for error-only filter and auto-scroll ─────────────────────────────────
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const plotScrollRef = useRef<any>(null);
  const [pendingSavePayload, setPendingSavePayload] = useState<any>(null);
  const [pendingCellSavePayload, setPendingCellSavePayload] =
    useState<any>(null);
  const [cellValidationPassed, setCellValidationPassed] =
    useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'plot' | 'matrix' | 'agronomy'>(
    'plot',
  );
  const [isMapModalVisible, setIsMapModalVisible] = useState<boolean>(false);
  const [isCellEditModalVisible, setIsCellEditModalVisible] =
    useState<boolean>(false);
  const [isImageCarouselVisible, setIsImageCarouselVisible] =
    useState<boolean>(false);
  const [selectedPlotImages, setSelectedPlotImages] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isNotesViewVisible, setIsNotesViewVisible] = useState<boolean>(false);
  const [selectedPlotNotes, setSelectedPlotNotes] = useState<string>('');
  const [selectedNotesPlotNumber, setSelectedNotesPlotNumber] =
    useState<string>('');
  // Voice note state - only keeping upload status for inline recorder
  const [isUploadingVoiceNote, setIsUploadingVoiceNote] =
    useState<boolean>(false);
  const [isVoiceNotePlayerVisible, setIsVoiceNotePlayerVisible] =
    useState<boolean>(false);
  const [selectedPlotVoiceNotes, setSelectedPlotVoiceNotes] = useState<any[]>(
    [],
  );
  const [selectedVoiceNoteIndex, setSelectedVoiceNoteIndex] =
    useState<number>(0);
  const [isMatrixViewLoading, setIsMatrixViewLoading] =
    useState<boolean>(false);
  const [selectedCellData, setSelectedCellData] = useState<{
    plotId?: number | string;
    plotNumber: string;
    traitName: string;
    userDefined: string;
    value: string;
    dataType: string;
    traitUom?: string;
    traitId?: number;
    observationId?: number | null;
  } | null>(null);
  // Snapshot of the cell targeted for deletion (so UI stays stable even if selection changes before confirm)
  const [deleteTarget, setDeleteTarget] =
    useState<typeof selectedCellData>(null);

  // Track which specific cell is being refreshed after successful save
  const [refreshingCell, setRefreshingCell] = useState<{
    plotNumber: string;
    traitName: string;
  } | null>(null);

  // ── Validation Error Modal State ─────────────────────────────────────────────
  const [isValidationErrorModalVisible, setIsValidationErrorModalVisible] =
    useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  // ── Individual Plants Manager State ──────────────────────────────────────────
  const [totalPlants, setTotalPlants] = useState<number>(4); // Default to 4, will be updated from API
  const [plantsData, setPlantsData] = useState<any[] | null>(null); // null = not loaded, [] = no data, [data] = has data
  const [isSavingPlants, setIsSavingPlants] = useState<boolean>(false);
  const [plantsAverageValue, setPlantsAverageValue] = useState<number | null>(
    null,
  ); // Store the calculated average from individual plants
  const [hasPlantsSaved, setHasPlantsSaved] = useState<boolean>(false); // Track if user has saved plants data

  // ── Accordion State ──────────────────────────────────────────────────────────
  const [isIndividualPlantsExpanded, setIsIndividualPlantsExpanded] =
    useState<boolean>(false);

  // ───────────────── DATE HELPERS (API now expects & returns DD/MM/YYYY without time) ────────────────
  // Ensure custom parsing for DD/MM/YYYY
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const customParseFormat = require('dayjs/plugin/customParseFormat');
  if (!(dayjs as any)._ddmmyyyy) {
    dayjs.extend(customParseFormat);
    (dayjs as any)._ddmmyyyy = true;
  }

  const isApiDate = (v: any) =>
    typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(v);
  const isIsoDate = (v: any) =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const parseToDayjs = (value: any) => {
    if (!value) return null; // Return null instead of today's date
    if (isApiDate(value)) return dayjs(value, 'DD/MM/YYYY', true);
    if (isIsoDate(value)) return dayjs(value, 'YYYY-MM-DD', true);
    if (typeof value === 'string' && value.includes('T')) return dayjs(value); // ISO datetime
    return dayjs(value);
  };

  const toApiDate = (value: any): string | null => {
    if (!value || value === '') return null; // Return null for empty values instead of defaulting to today
    if (isApiDate(value)) return value; // already in format
    const d = parseToDayjs(value);
    return d && d.isValid() ? d.format('DD/MM/YYYY') : null; // Return null for invalid dates
  };

  // Calendar component needs YYYY-MM-DD
  const toCalendarDate = (value: any): string => {
    const d = parseToDayjs(value);
    return d && d.isValid()
      ? d.format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  };

  const getCalendarDateString = (value: any): string => toCalendarDate(value);

  interface TraitData {
    traitId: number;
    traitName: string;
    traitUom?: string; // ← matches API's "traitUom"
    dataType?: string;
    preDefiendList?: any[]; // ← note API typo "preDefiendList"
    userDefiend?: string; // ← matches API's typo'd "userDefiend"
    value?: string;
    // Update information fields
    updateDate?: string;
    updateTime?: string;
    updateBy?: string;
    updateAt?: string;
  }

  interface PlotData {
    recordedTraitData?: TraitData[];
    unrecordedTraitData?: TraitData[];
    plotNumber?: string;
    rowNumber?: number;
    columnNumber?: number;
  }

  const currentTraitData: TraitData | undefined = useMemo(() => {
    const recorded = selectedPlot?.recordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );
    const unrecorded = selectedPlot?.unrecordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );

    return recorded || unrecorded;
  }, [selectedPlot, currentTrait]);

  // Reset hasPlantsSaved flag when trait or plot changes
  useEffect(() => {
    setHasPlantsSaved(false);
  }, [currentTrait, selectedPlot]);

  // ────────────────────────────────────────────────────────────────────────────
  // Accession ID permission + resolver
  // Show accessionId ONLY if user has explicit permission 'fieldbook:accession:view'
  // Backend responses have inconsistent key casing, so normalize.
  const canViewAccessionId = hasPermission('fieldbook:accession:view');
  const resolveAccessionId = (plot: any): string | number | null => {
    if (!plot) return null;
    const val =
      plot.accessionId ?? plot.ACCESSIONID ?? plot.accession_id ?? null;
    // Treat empty string as null for display purposes
    if (val === '') return null;
    return val;
  };

  // AsyncStorage helpers for persisting recently updated notes
  const RECENTLY_UPDATED_NOTES_KEY = `recentlyUpdatedNotes_${id}_${type}`;

  const saveRecentlyUpdatedNotesToStorage = async (
    notes: Record<string, string>,
  ) => {
    try {
      await AsyncStorage.setItem(
        RECENTLY_UPDATED_NOTES_KEY,
        JSON.stringify(notes),
      );
    } catch (error) {}
  };

  const loadRecentlyUpdatedNotesFromStorage = async (): Promise<
    Record<string, string>
  > => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_UPDATED_NOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {}
    return {};
  };

  const clearRecentlyUpdatedNotesFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(RECENTLY_UPDATED_NOTES_KEY);
    } catch (error) {}
  };

  // Helper function to get all unique traits for matrix view
  const getAllUniqueTraits = useMemo(() => {
    if (plotList.length === 0) return [];

    const allTraitsMap = new Map<string, any>();

    plotList.forEach((plot: any) => {
      // Collect from recorded traits
      (plot.recordedTraitData || []).forEach((trait: any) => {
        if (!allTraitsMap.has(trait.traitName)) {
          allTraitsMap.set(trait.traitName, trait);
        }
      });

      // Collect from unrecorded traits
      (plot.unrecordedTraitData || []).forEach((trait: any) => {
        if (!allTraitsMap.has(trait.traitName)) {
          allTraitsMap.set(trait.traitName, trait);
        }
      });
    });

    return Array.from(allTraitsMap.values());
  }, [plotList]);

  // Helper function to get trait data for a specific plot and trait
  const getTraitDataForPlot = (plot: any, traitName: string) => {
    // First check recorded traits
    const recordedTrait = plot.recordedTraitData?.find(
      (t: any) => t.traitName === traitName,
    );
    if (recordedTrait) return recordedTrait;

    // Then check unrecorded traits
    const unrecordedTrait = plot.unrecordedTraitData?.find(
      (t: any) => t.traitName === traitName,
    );
    if (unrecordedTrait) return unrecordedTrait;

    // Return empty trait data if not found
    return {
      traitName,
      value: null,
      dataType: 'str',
      traitId: null,
      userDefiend: traitName,
    };
  };

  const syncSelectedFixedValue = () => {
    if (!selectedPlot || !currentTrait) {
      return;
    }

    const plotNumber = selectedPlot.plotNumber;
    const traits = recordedData[plotNumber] || [];

    const matchingTrait = traits.find(
      trait => trait.traitName === currentTrait,
    );

    setSelectedFixedValue(matchingTrait?.value || '');
  };

  // Function to detect if there are any unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // If no recorded data yet, no changes to save
    if (Object.keys(recordedData).length === 0) {
      return false;
    }

    // Compare current recordedData with original data from server
    for (const plotNumber in recordedData) {
      const currentTraits = recordedData[plotNumber] || [];
      const originalTraits = originalRecordedData[plotNumber] || [];

      // Check if the number of traits changed
      if (currentTraits.length !== originalTraits.length) {
        return true;
      }

      // Check if any trait values changed
      for (const currentTrait of currentTraits) {
        const originalTrait = originalTraits.find(
          t => t.traitName === currentTrait.traitName,
        );

        // If trait doesn't exist in original data, it's new
        if (!originalTrait) {
          return true;
        }

        // If trait value changed
        if (currentTrait.value !== originalTrait.value) {
          return true;
        }
      }
    }

    // Also check if any traits were removed (exist in original but not in current)
    for (const plotNumber in originalRecordedData) {
      const originalTraits = originalRecordedData[plotNumber] || [];
      const currentTraits = recordedData[plotNumber] || [];

      for (const originalTrait of originalTraits) {
        const currentTrait = currentTraits.find(
          t => t.traitName === originalTrait.traitName,
        );

        // If original trait doesn't exist in current data, it was removed
        if (!currentTrait) {
          return true;
        }
      }
    }

    return false;
  }, [recordedData, originalRecordedData]);

  useEffect(() => {
    const selectedFixedTrait = selectedPlot?.recordedTraitData?.find(
      (t: TraitData) => t.traitName === currentTrait,
    );
    setSelectedFixedValue(selectedFixedTrait?.value || '');
  }, [selectedPlot, currentTrait]);

  // Load persisted recently updated notes on component mount
  useEffect(() => {
    const loadPersistedNotes = async () => {
      const savedNotes = await loadRecentlyUpdatedNotesFromStorage();
      if (Object.keys(savedNotes).length > 0) {
        setRecentlyUpdatedNotes(savedNotes);

        // If we have plotList data already loaded, merge the persisted notes immediately
        if (plotList.length > 0) {
          setPlotList(currentPlots => {
            const updatedPlots = currentPlots.map(plot => {
              const recentNote = savedNotes[plot.plotNumber];
              if (recentNote !== undefined) {
                return {...plot, notes: recentNote};
              }
              return plot;
            });
            return updatedPlots;
          });

          // Also update selectedPlot if it exists
          if (selectedPlot) {
            const recentNote = savedNotes[selectedPlot.plotNumber];
            if (recentNote !== undefined) {
              setSelectedPlot((currentSelected: any) =>
                currentSelected
                  ? {...currentSelected, notes: recentNote}
                  : currentSelected,
              );
            }
          }
        }
      }
    };

    loadPersistedNotes();
  }, []); // Only run on mount

  // Save recentlyUpdatedNotes to AsyncStorage whenever it changes
  useEffect(() => {
    // Don't save on initial mount (empty state)
    if (Object.keys(recentlyUpdatedNotes).length > 0) {
      saveRecentlyUpdatedNotesToStorage(recentlyUpdatedNotes);
    }
  }, [recentlyUpdatedNotes]);

  // Debug logging for recentlyUpdatedNotes changes
  useEffect(() => {}, [recentlyUpdatedNotes, selectedPlot?.plotNumber]);

  // Apply persisted notes to plot list when either plotList or recentlyUpdatedNotes changes
  useEffect(() => {
    if (plotList.length > 0 && Object.keys(recentlyUpdatedNotes).length > 0) {
      setPlotList(currentPlots => {
        let hasChanges = false;
        const updatedPlots = currentPlots.map(plot => {
          const recentNote = recentlyUpdatedNotes[plot.plotNumber];
          if (recentNote !== undefined && plot.notes !== recentNote) {
            hasChanges = true;
            return {...plot, notes: recentNote};
          }
          return plot;
        });

        // Only update if there are actual changes to prevent infinite loops
        return hasChanges ? updatedPlots : currentPlots;
      });

      // Also update selectedPlot if it exists and needs updating
      if (selectedPlot) {
        const recentNote = recentlyUpdatedNotes[selectedPlot.plotNumber];
        if (recentNote !== undefined && selectedPlot.notes !== recentNote) {
          setSelectedPlot((currentSelected: any) =>
            currentSelected
              ? {...currentSelected, notes: recentNote}
              : currentSelected,
          );
        }
      }
    }
  }, [plotList.length, Object.keys(recentlyUpdatedNotes).length]); // Only depend on lengths to avoid infinite loops

  // Cleanup effect to ensure notes are persisted when component unmounts
  useEffect(() => {
    return () => {
      if (Object.keys(recentlyUpdatedNotes).length > 0) {
        // Save one final time before unmounting
        saveRecentlyUpdatedNotesToStorage(recentlyUpdatedNotes);
      }
    };
  }, [recentlyUpdatedNotes]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const plotModalRef = useRef<BottomSheetModal>(null);
  const deleteConfirmRef = useRef<BottomSheetModal>(null);
  const cellEditModalRef = useRef<BottomSheetModal>(null);
  const pendingVoiceNoteUploadRef = useRef<any>(null);

  const openPlotModal = () => {
    plotModalRef.current?.present();
  };

  const openMapModal = () => {
    setIsMapModalVisible(true);
  };

  const openImageCarousel = (plot: any, initialIndex: number = 0) => {
    if (plot.imageUrls && plot.imageUrls.length > 0) {
      const formattedImages = plot.imageUrls
        .map((imageData: any, index: number) => {
          let imageUrl: string;
          if (typeof imageData === 'string') {
            imageUrl = imageData;
          } else if (imageData && typeof imageData === 'object') {
            imageUrl =
              imageData.url || imageData.uri || imageData.imagePath || '';
          } else {
            return null;
          }

          if (!imageUrl) {
            return null;
          }

          return {
            url: imageUrl,
            id: `${plot.plotNumber}_${index}`,
            uploadedOn: imageData.uploadedOn || new Date().toISOString(),
            imagePath: imageData.imagePath || imageUrl,
            location: imageData.locationName || imageData.location, // Include location from API (locationName is the correct key)
          };
        })
        .filter(Boolean); // Remove null entries

      if (formattedImages.length > 0) {
        setSelectedPlotImages(formattedImages);
        setSelectedImageIndex(
          Math.max(0, Math.min(initialIndex, formattedImages.length - 1)),
        );
        setIsImageCarouselVisible(true);
      } else {
        Toast.error({
          message: `No valid images found for Plot ${plot.plotNumber}`,
        });
      }
    } else {
      Toast.error({
        message: `No images available for Plot ${plot.plotNumber}`,
      });
    }
  };

  const openNotesView = (plot: any) => {
    // Check for recently updated notes first, then fallback to plot.notes
    const notesToShow =
      recentlyUpdatedNotes[plot.plotNumber] || plot.notes || '';

    if (notesToShow.trim()) {
      setSelectedPlotNotes(notesToShow);
      setSelectedNotesPlotNumber(plot.plotNumber);
      setIsNotesViewVisible(true);
    } else {
      Toast.error({
        message: `No notes available for Plot ${plot.plotNumber}`,
      });
    }
  };

  const openVoiceNotePlayer = (plot: any, initialIndex: number = 0) => {
    // Support both audioUrls (new format) and voiceNote (old format)
    const voiceNotes = plot.audioUrls || plot.voiceNote;

    if (voiceNotes && Array.isArray(voiceNotes) && voiceNotes.length > 0) {
      // Map audioUrls to the format expected by VoiceNotePlayerModal
      const mappedVoiceNotes = voiceNotes.map((vn: any, idx: number) => ({
        fileName: vn.fileName || `voice_note_${idx + 1}`,
        duration: vn.duration || 0,
        mimeType: vn.mimeType || 'audio/mpeg',
        timestamp: vn.timestamp
          ? vn.timestamp
          : vn.uploadedOn
          ? new Date(vn.uploadedOn).getTime()
          : Date.now(),
        url: vn.url, // S3 URL for playback
        audioPath: vn.audioPath,
        uploadedOn: vn.uploadedOn,
        locationName: vn.locationName,
        lat: vn.lat,
        long: vn.long,
      }));

      // Set the selected plot so we can access plotId and experimentType
      setSelectedPlot(plot);
      setSelectedPlotVoiceNotes(mappedVoiceNotes);
      setSelectedVoiceNoteIndex(initialIndex);
      setIsVoiceNotePlayerVisible(true);
    } else {
      Toast.error({
        message: `No voice notes available for Plot ${plot.plotNumber}`,
      });
    }
  };

  const handleSaveNotes = async (updatedNotes: string) => {
    try {
      // Find the plot to get its ID
      const plotToUpdate = plotList.find(
        p => p.plotNumber === selectedNotesPlotNumber,
      );
      if (!plotToUpdate) {
        Toast.error({
          message: `Plot ${selectedNotesPlotNumber} not found`,
        });
        return;
      }

      // 🔒 VALIDATE LOCATION BEFORE PROCEEDING
      const locationData = await validateLocationForAPI(true, true);

      if (!locationData) {
        Toast.error({
          message: 'Location access is required to save notes',
          duration: 3000,
        });
        return; // Stop execution if location is not available
      }

      const {latitude, longitude} = locationData;

      // Prepare payload
      const payload = {
        experimentType: type,
        fieldExperimentId: Number(details.fieldExperimentId),
        observations: [
          {
            plotId: plotToUpdate.id,
            date: formatDateTime(new Date()),
            phenotypes: [], // No phenotype data for notes
            applications: null,
            lat: latitude,
            long: longitude,
            imageData: [],
            notes: updatedNotes.trim(),
          },
        ],
      };

      // Check network connectivity to determine save strategy
      if (networkIsConnected === false) {
        // OFFLINE MODE: Save notes locally for sync later

        try {
          // Use the savePayloads function to queue this data for sync
          await savePayloads(
            `${organizationURL}${URL.RECORD_TRAITS}`, // Full URL
            URL.RECORD_TRAITS, // URL key
            '', // pathParams (empty for this API)
            `experimentType=${type}`, // queryParams
            payload, // The payload to save
            'POST', // HTTP method
          );

          // Update local state to reflect the change
          setRecentlyUpdatedNotes(prev => ({
            ...prev,
            [selectedNotesPlotNumber]: updatedNotes.trim(),
          }));

          // Update the plot list to show the updated notes
          setPlotList(currentPlots =>
            currentPlots.map(p => {
              if (p.plotNumber === selectedNotesPlotNumber) {
                return {
                  ...p,
                  notes: updatedNotes.trim(),
                };
              }
              return p;
            }),
          );

          // Show offline success message
          Toast.success({
            message:
              'Notes saved locally. Your data will be synced with the server when there is internet connection.',
          });

          // Close the notes modal
          setIsNotesViewVisible(false);
        } catch (error) {
          Toast.error({
            message: 'Failed to save notes locally. Please try again.',
          });
        }
      } else {
        // ONLINE MODE: Save notes to server

        // Save notes
        saveNotes({
          payload,
          headers: {'Content-Type': 'application/json'},
        });
      }
    } catch (error) {
      Toast.error({
        message: 'Failed to save notes. Please try again.',
      });
    }
  };

  const handleUploadVoiceNote = async (voiceNoteData: any) => {
    try {
      setIsUploadingVoiceNote(true);

      if (voiceNoteData.duration > MAX_VOICE_NOTE_DURATION_SECONDS) {
        Toast.error({
          message: 'Voice notes must be 3 minutes or less. Please re-record.',
        });
        setIsUploadingVoiceNote(false); // Stop the loader
        return;
      }

      // Find the plot to get its ID
      const plotToUpdate = plotList.find(
        p => p.plotNumber === selectedPlot?.plotNumber,
      );
      if (!plotToUpdate) {
        Toast.error({
          message: `Plot ${selectedPlot?.plotNumber} not found`,
        });
        setIsUploadingVoiceNote(false); // Stop the loader
        return;
      }

      // 🔒 VALIDATE LOCATION BEFORE PROCEEDING
      const locationData = await validateLocationForAPI(true, true);

      if (!locationData) {
        Toast.error({
          message: 'Location access is required to upload voice notes',
          duration: 3000,
        });
        setIsUploadingVoiceNote(false); // Stop the loader
        return;
      }

      const {latitude, longitude} = locationData;

      // Get existing voice notes from the plot
      const existingVoiceNotes = plotToUpdate.voiceNote || [];

      // Check if we've reached the maximum limit
      if (existingVoiceNotes.length >= 3) {
        Toast.error({
          message: 'Maximum of 3 voice notes allowed per plot.',
        });
        setIsUploadingVoiceNote(false); // Stop the loader
        return;
      }

      // Check network connectivity to determine save strategy
      if (networkIsConnected === false) {
        // OFFLINE MODE: Not supported for voice notes
        Toast.error({
          message:
            'Voice notes require an internet connection. Please connect to upload.',
        });
        setIsUploadingVoiceNote(false); // Stop the loader
        return;
      }

      // ONLINE MODE: Upload voice note using pre-signed URL flow (similar to images)
      console.log('\n\n');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('🎤 VOICE NOTE UPLOAD FLOW - STEP 1: INITIALIZE');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('Plot Details:');
      console.log('  - Plot ID:', plotToUpdate.id);
      console.log('  - Plot Number:', plotToUpdate.plotNumber);
      console.log('  - Location: Lat', latitude, 'Long', longitude);
      console.log('\nVoice Note Details:');
      console.log('  - File Name:', voiceNoteData.fileName);
      console.log('  - Duration:', voiceNoteData.duration, 'seconds');
      console.log('  - MIME Type:', voiceNoteData.mimeType);
      console.log('  - Timestamp:', voiceNoteData.timestamp);
      console.log(
        '  - Audio Base64 Length:',
        voiceNoteData.audioBase64.length,
        'characters',
      );
      console.log('\nExperiment Details:');
      console.log('  - Experiment Type:', type);
      console.log('  - Field Experiment ID:', details.fieldExperimentId);
      console.log('  - Existing Voice Notes Count:', existingVoiceNotes.length);
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('\n');

      // Step 1: Generate query params for pre-signed URL
      const queryParams = generateVoiceNoteQueryParams(
        plotToUpdate.id,
        voiceNoteData.fileName,
      );

      console.log('\n');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('🎤 VOICE NOTE UPLOAD FLOW - STEP 2: REQUEST PRE-SIGNED URL');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log(
        'API Endpoint:',
        `${organizationURL}${URL.GENERATE_PRE_SIGNED}`,
      );
      console.log('Query Parameters:', queryParams);
      console.log('\nComplete URL:');
      console.log(
        `${organizationURL}${URL.GENERATE_PRE_SIGNED}?${queryParams}`,
      );
      console.log('\nExpected Response:');
      console.log('  - presigned_url: (S3 upload URL)');
      console.log('  - s3_path: (Path where file will be stored)');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('\n');

      // Step 2: Request pre-signed URL from server
      generatePreSignedUrl({
        queryParams,
      });

      // Store voice note data temporarily for use in the upload process
      // We'll use it in the useEffect that handles preSignedUrlData
      pendingVoiceNoteUploadRef.current = {
        voiceNoteData,
        plotId: plotToUpdate.id,
        plotNumber: plotToUpdate.plotNumber,
        latitude,
        longitude,
        existingVoiceNotesCount: existingVoiceNotes.length,
      };
    } catch (error) {
      console.error('Voice note upload error:', error);
      Toast.error({
        message: 'Failed to upload voice note. Please try again.',
      });
      setIsUploadingVoiceNote(false);
    }
  };

  const handleCellPress = (plot: any, trait: any) => {
    // Ensure we get the most up-to-date trait data for this plot and trait
    const currentTraitData = getTraitDataForPlot(plot, trait.traitName);

    setSelectedCellData({
      plotId: plot.id ?? plot.plotNumber,
      plotNumber: plot.plotNumber,
      traitName: currentTraitData.traitName,
      userDefined: currentTraitData.userDefiend || currentTraitData.traitName,
      value: currentTraitData.value || '',
      dataType: currentTraitData.dataType || 'str',
      traitUom: currentTraitData.traitUom,
      traitId: currentTraitData.traitId,
      // capture observationId if present so we can extend deletion logic later if backend requires it
      // (kept optional to avoid breaking existing consumers)
      observationId: currentTraitData.observationId,
    });
    cellEditModalRef.current?.present();
  };

  const handleCellValueChange = (newValue: string) => {
    if (!selectedCellData) return;

    // Mark this trait as modified in current session
    setModifiedTraitsInSession(prev => {
      const plotNo = selectedCellData.plotNumber;
      const modifiedSet = prev[plotNo] || new Set<string>();
      modifiedSet.add(selectedCellData.traitName);
      return {...prev, [plotNo]: modifiedSet};
    });

    // Update local state immediately for UI feedback
    setRecordedData((prev: Record<string, TraitData[]>) => {
      const plotNumber = selectedCellData.plotNumber;
      const existingTraits = prev[plotNumber] || [];

      const updatedTraits = existingTraits.filter(
        (trait: TraitData) => trait.traitName !== selectedCellData.traitName,
      );

      // Find traitId from recorded or unrecorded trait data
      const plot = plotList.find(p => p.plotNumber === plotNumber);
      const traitMeta =
        plot?.recordedTraitData?.find(
          (t: TraitData) => t.traitName === selectedCellData.traitName,
        ) ||
        plot?.unrecordedTraitData?.find(
          (t: TraitData) => t.traitName === selectedCellData.traitName,
        );

      updatedTraits.push({
        traitId: traitMeta?.traitId ?? 0,
        traitName: selectedCellData.traitName,
        dataType: selectedCellData.dataType,
        value: newValue,
      });

      return {
        ...prev,
        [plotNumber]: updatedTraits,
      };
    });

    // Update selectedCellData for the bottom sheet display
    setSelectedCellData(prev => (prev ? {...prev, value: newValue} : null));
  };

  const handleCellSave = async () => {
    if (!selectedCellData) return;

    try {
      const locationData = await validateLocationForAPI(true, true);
      if (!locationData) {
        return;
      }

      const {latitude, longitude} = locationData;

      const date = formatDateTime(new Date());

      // Find the plot to get plotId
      const plot = plotList.find(
        p => p.plotNumber === selectedCellData.plotNumber,
      );

      // Find trait metadata
      const traitMeta =
        plot?.recordedTraitData?.find(
          (t: TraitData) => t.traitName === selectedCellData.traitName,
        ) ||
        plot?.unrecordedTraitData?.find(
          (t: TraitData) => t.traitName === selectedCellData.traitName,
        );

      const payload = {
        experimentType: type,
        fieldExperimentId: Number(details.fieldExperimentId),
        observations: [
          {
            plotNumber: plot?.plotNumber,
            plotId: plot?.id ?? plot?.plotNumber,
            date,
            lat: latitude,
            long: longitude,
            notes: '',
            applications: null,
            phenotypes: [
              {
                observationId: traitMeta?.observationId ?? null,
                observedValue:
                  (traitMeta?.dataType || selectedCellData.dataType) === 'date'
                    ? toApiDate(selectedCellData.value) ||
                      selectedCellData.value // Use original value if toApiDate returns null
                    : selectedCellData.value,
                traitId: traitMeta?.traitId ?? 0,
              },
            ],
          },
        ],
      };

      // Check network connectivity to determine save strategy
      if (networkIsConnected === false) {
        // OFFLINE MODE: Save directly to local database for sync later

        try {
          // Use the savePayloads function to queue this data for sync
          await savePayloads(
            `${organizationURL}${URL.RECORD_TRAITS}`, // Full URL
            URL.RECORD_TRAITS, // URL key
            '', // pathParams (empty for this API)
            `experimentType=${type}`, // queryParams
            payload, // The payload to save
            'POST', // HTTP method
          );

          // Close the modal
          cellEditModalRef.current?.dismiss();

          // Update local state immediately to reflect the change
          setPlotList(currentPlots =>
            currentPlots.map(p => {
              if (p.plotNumber === selectedCellData.plotNumber) {
                // Update the trait data in the plot
                const updatedRecordedTraits = [...(p.recordedTraitData || [])];
                const existingTraitIndex = updatedRecordedTraits.findIndex(
                  t => t.traitName === selectedCellData.traitName,
                );

                if (existingTraitIndex >= 0) {
                  // Update existing trait
                  updatedRecordedTraits[existingTraitIndex] = {
                    ...updatedRecordedTraits[existingTraitIndex],
                    value: selectedCellData.value,
                  };
                } else {
                  // Add new trait
                  updatedRecordedTraits.push({
                    traitId: traitMeta?.traitId ?? 0,
                    traitName: selectedCellData.traitName,
                    dataType: selectedCellData.dataType,
                    value: selectedCellData.value,
                  });
                }

                return {
                  ...p,
                  recordedTraitData: updatedRecordedTraits,
                };
              }
              return p;
            }),
          );

          // Show offline success message
          Toast.success({
            message:
              'Saved locally. Your data will be synced with the server when there is internet connection.',
          });
        } catch (error) {
          Toast.error({
            message: 'Failed to save data locally. Please try again.',
          });
        }
      } else {
        // ONLINE MODE: Validate first, then save to server

        // Save for post-validation use
        setPendingCellSavePayload(payload);

        // Reset validation flag for new save operation
        setCellValidationPassed(false);

        // Trigger validation, response will be handled by useEffect!
        validateCellTraits({
          payload: {...payload},
          headers: {'Content-Type': 'application/json'},
        });
      }
    } catch (error) {
      Toast.error({message: 'Failed to save value. Please try again.'});
    }
  };

  const handleDelete = () => {
    if (!selectedCellData) {
      Toast.error({message: 'No selected value to delete'});
      return;
    }
    // Capture snapshot for confirmation dialog
    setDeleteTarget(selectedCellData);
    setShowDeleteConfirm(true);
    deleteConfirmRef.current?.present();
  };

  const confirmDelete = async () => {
    deleteConfirmRef.current?.dismiss();
    const target = deleteTarget || selectedCellData;
    if (target && target.traitId) {
      // Always resolve fresh from plotList using plotNumber to avoid stale selection
      const plotFromList = plotList.find(
        p => p.plotNumber === target.plotNumber,
      );
      const resolvedPlotId =
        plotFromList?.id ??
        target.plotId ??
        plotFromList?.plotNumber ??
        target.plotNumber;
      if (selectedPlot && selectedPlot.plotNumber !== target.plotNumber) {
      }
      const payload = {
        plot_id: resolvedPlotId,
        delete_type: 'trait',
        experiment_type: type,
        trait_id: target.traitId,
      } as any;

      // Immediately clear the selected cell data to show "-" in the modal if it's still open
      if (
        selectedCellData?.plotNumber === target.plotNumber &&
        selectedCellData?.traitName === target.traitName
      ) {
        setSelectedCellData(prev =>
          prev
            ? {
                ...prev,
                value: '', // Clear the value immediately
                observationId: null, // Clear observationId
              }
            : null,
        );
      }

      deleteTraitRecord({
        payload,
        headers: {'Content-Type': 'application/json'},
      });
      return;
    }
    if (target && !target.traitId) {
      // Provide clearer diagnostics if deletion can't proceed due to missing traitId
      Toast.error({message: 'Cannot delete: missing trait identifier'});
      return;
    }
    // Fallback local removal (plot view) if no cell context
    if (
      selectedPlot &&
      currentTrait &&
      !['Image', 'Notes', 'Voice Note'].includes(currentTrait)
    ) {
      setRecordedData(prev => {
        const plotNumber = selectedPlot.plotNumber;
        const existing = prev[plotNumber] || [];
        const filtered = existing.filter(t => t.traitName !== currentTrait);
        return {...prev, [plotNumber]: filtered};
      });
      setSelectedFixedValue('');
      Toast.success({message: 'Value removed (local)'});
    }
  };

  const selectPlot = (plot: any) => {
    setSelectedPlot(plot);

    const recordedTraits =
      plot.recordedTraitData?.map(
        (trait: {traitName: any}) => trait.traitName,
      ) || [];

    const unrecordedTraits =
      plot.unrecordedTraitData?.map(
        (trait: {traitName: any}) => trait.traitName,
      ) || [];

    const allTraits = [...recordedTraits, ...unrecordedTraits];
    const uniqueTraits = Array.from(new Set(allTraits));
    // ←— APPEND Image, Notes & Voice Note HERE
    const augmentedTraits = [...uniqueTraits, 'Image', 'Notes', 'Voice Note'];
    setTraits(augmentedTraits);

    if (!augmentedTraits.includes(currentTrait)) {
      setCurrentTrait(augmentedTraits[0] || '');
    }

    plotModalRef.current?.dismiss();

    const index = filteredPlotList.findIndex(
      p => p.plotNumber === plot.plotNumber,
    );
    if (index !== -1) {
      setCurrentPlotIndex(index);
    }

    setTimeout(syncSelectedFixedValue, 0);
  };

  const handlePrevTrait = () => {
    const currentIndex = traits.indexOf(currentTrait);
    if (currentIndex > 0) {
      setCurrentTrait(traits[currentIndex - 1]);
    }
  };

  const handleNextTrait = () => {
    const currentIndex = traits.indexOf(currentTrait);
    if (currentIndex < traits.length - 1) {
      setCurrentTrait(traits[currentIndex + 1]);
    }
  };

  const handlePrevPlot = () => {
    setCurrentPlotIndex((prev: number) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPlot = () => {
    setCurrentPlotIndex((prev: number) =>
      prev < filteredPlotList.length - 1 ? prev + 1 : prev,
    );
  };

  // ── Individual Plants Manager Handler ─────────────────────────────────────────
  const handleSavePlantsData = async (
    plantsData: PlantData[],
    average: number | null,
  ) => {
    console.log('INDIVIDUAL PLANTS - Saving plants data:', plantsData);
    console.log('INDIVIDUAL PLANTS - Calculated average value:', average);

    if (!plantsData || plantsData.length === 0) {
      return;
    }

    if (!selectedPlot || !currentTrait) {
      Toast.error({message: 'Please select a plot and trait first'});
      return;
    }

    setIsSavingPlants(true);

    try {
      const locationData = await validateLocationForAPI(true, true);

      if (!locationData) {
        Toast.error({
          message: 'Location access is required to save plants data',
          duration: 3000,
        });
        setIsSavingPlants(false);
        return;
      }

      const {latitude, longitude} = locationData;

      const date = formatDateTime(new Date());

      // Transform plantsData to match API format for later inclusion
      const individualPlantsData = plantsData
        .filter(plant => {
          // Only include plants that have at least one field filled
          return (
            plant.name.trim() ||
            plant.value.trim() ||
            plant.x.trim() ||
            plant.y.trim()
          );
        })
        .map(plant => ({
          value: plant.value ? parseFloat(plant.value) : null,
          x: plant.x ? parseFloat(plant.x) : null,
          y: plant.y ? parseFloat(plant.y) : null,
          name: plant.name.trim() || null,
        }));

      // BUILD PAYLOAD ONLY FOR THE CURRENT PLOT (align with handleSaveAll semantics)
      console.log(
        '🔧 [Payload Build] Current plot saving data for:',
        selectedPlot?.plotNumber,
      );
      console.log(
        '🔧 [Payload Build] Current trait saving data for:',
        currentTrait,
      );

      const plotNumberKey = String(selectedPlot.plotNumber);
      const traitsForSelectedPlot: TraitData[] = [
        ...(recordedData[plotNumberKey] || []),
      ];

      const normalizedAverage =
        average !== null && !Number.isNaN(average) ? average.toString() : null;

      const currentTraitIndex = traitsForSelectedPlot.findIndex(
        trait => trait.traitName === currentTrait,
      );

      if (currentTraitIndex === -1) {
        traitsForSelectedPlot.push({
          traitId: currentTraitData?.traitId ?? 0,
          traitName: currentTrait,
          dataType: currentTraitData?.dataType,
          value:
            normalizedAverage ??
            currentTraitData?.value ??
            currentTraitData?.userDefiend ??
            '',
        });
      } else if (normalizedAverage !== null) {
        traitsForSelectedPlot[currentTraitIndex] = {
          ...traitsForSelectedPlot[currentTraitIndex],
          value: normalizedAverage,
        };
      }

      const phenotypes = traitsForSelectedPlot
        .map((rec: TraitData) => {
          const recordedMeta = selectedPlot?.recordedTraitData?.find(
            (t: TraitData) => t.traitName === rec.traitName,
          );
          const unrecordedMeta = selectedPlot?.unrecordedTraitData?.find(
            (t: TraitData) => t.traitName === rec.traitName,
          );
          const meta = recordedMeta ?? unrecordedMeta ?? null;

          if (!meta) {
            console.log(
              `🔧 [Plot ${plotNumberKey}] [Trait ${rec.traitName}] ❌ Missing metadata, skipping phenotype`,
            );
            return null;
          }

          const isDate = meta?.dataType === 'date' || rec.dataType === 'date';

          let observedValue = rec.value ?? meta.value ?? meta.userDefiend ?? '';

          if (rec.traitName === currentTrait && normalizedAverage !== null) {
            observedValue = normalizedAverage;
          }

          if (isDate) {
            const apiDate = toApiDate(rec.value ?? observedValue);
            if (apiDate === null || apiDate === '') {
              return null;
            }
            observedValue = apiDate;
          }

          const phenotype: any = {
            observationId: meta?.observationId ?? null,
            observedValue,
            traitId: meta.traitId,
          };

          if (
            rec.traitName === currentTrait &&
            individualPlantsData.length > 0
          ) {
            phenotype.individualPlantsData = individualPlantsData;
            if (normalizedAverage !== null) {
              phenotype.observedValue = normalizedAverage;
            }
          }

          return phenotype;
        })
        .filter(Boolean);

      const observations = [
        {
          plotNumber: selectedPlot?.plotNumber,
          plotId: selectedPlot?.id ?? selectedPlot?.plotNumber,
          date,
          lat: latitude,
          long: longitude,
          notes: '',
          applications: null,
          phenotypes,
        },
      ];

      const payload = {
        experimentType: type,
        fieldExperimentId: Number(details.fieldExperimentId),
        observations,
      };

      // Log complete payload in detailed format
      console.log('\n\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('INDIVIDUAL PLANTS - SAVE PLANTS DATA PAYLOAD');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Root Level:');
      console.log('  experimentType:', payload.experimentType);
      console.log('  fieldExperimentId:', payload.fieldExperimentId);
      console.log('  Total observations (plots):', payload.observations.length);
      console.log('\n');

      // Log each observation
      payload.observations.forEach((obs, obsIndex) => {
        console.log(`Observation [${obsIndex}] - Plot ${obs.plotNumber}:`);
        console.log('  plotId:', obs.plotId);
        console.log('  date:', obs.date);
        console.log('  lat:', obs.lat);
        console.log('  long:', obs.long);
        console.log('  phenotypes count:', obs.phenotypes.length);

        obs.phenotypes.forEach((pheno, phenoIndex) => {
          console.log(`    Phenotype [${phenoIndex}]:`);
          console.log('      traitId:', pheno.traitId);
          console.log('      observationId:', pheno.observationId);
          console.log('      observedValue:', pheno.observedValue);

          if (pheno.individualPlantsData) {
            console.log('      individualPlantsData: ✅ INCLUDED');
            console.log(
              '      Number of plants:',
              pheno.individualPlantsData.length,
            );
            pheno.individualPlantsData.forEach(
              (plant: any, plantIdx: number) => {
                console.log(
                  `        Plant [${plantIdx}]:`,
                  JSON.stringify(plant, null, 2),
                );
              },
            );
          } else {
            console.log('      individualPlantsData: ❌ NOT INCLUDED');
          }
        });
        console.log('\n');
      });

      console.log('COMPLETE JSON PAYLOAD:');
      const payloadStr = JSON.stringify(payload, null, 2);
      const chunkSize = 500;
      for (let i = 0; i < payloadStr.length; i += chunkSize) {
        console.log(payloadStr.substring(i, i + chunkSize));
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n\n');

      // Check network connectivity to determine save strategy
      if (networkIsConnected === false) {
        // OFFLINE MODE: Save directly to local database for sync later

        await savePayloads(
          `${organizationURL}${URL.RECORD_TRAITS}`, // Full URL
          URL.RECORD_TRAITS, // URL key
          '', // pathParams (empty for this API)
          `experimentType=${type}`, // queryParams
          payload, // The payload to save
          'POST', // HTTP method
        );

        console.log('INDIVIDUAL PLANTS - OFFLINE: Data saved locally for sync');

        // Update local state
        setPlantsData(plantsData);
        setPlantsAverageValue(average);

        // Mark this trait as modified since we're saving plants data
        setModifiedTraitsInSession(prev => {
          const plotNo = selectedPlot.plotNumber;
          const modifiedSet = prev[plotNo] || new Set<string>();
          modifiedSet.add(currentTrait);
          return {...prev, [plotNo]: modifiedSet};
        });

        setRecordedData(prev => ({
          ...prev,
          [plotNumberKey]: traitsForSelectedPlot,
        }));

        // Show offline success message
        Toast.success({
          message: `Plants data saved locally${
            average !== null ? ` (Average: ${average.toFixed(2)})` : ''
          }. Will sync when online.`,
        });

        // Refresh the plot list to show updated state
        refreshPlotList();
      } else {
        // ONLINE MODE: Post to server
        console.log('INDIVIDUAL PLANTS - ONLINE MODE: Posting to server');
        console.log('INDIVIDUAL PLANTS - Posting payload...');

        await postTraits({
          payload: payload,
          headers: {'Content-Type': 'application/json'},
        });

        // Update local state
        setPlantsData(plantsData);
        setPlantsAverageValue(average);
        setHasPlantsSaved(true);

        // Mark this trait as modified since we're saving plants data
        setModifiedTraitsInSession(prev => {
          const plotNo = selectedPlot.plotNumber;
          const modifiedSet = prev[plotNo] || new Set<string>();
          modifiedSet.add(currentTrait);
          return {...prev, [plotNo]: modifiedSet};
        });

        setRecordedData(prev => ({
          ...prev,
          [plotNumberKey]: traitsForSelectedPlot,
        }));

        Toast.success({
          message: `Plants data saved successfully${
            average !== null ? ` (Average: ${average.toFixed(2)})` : ''
          }`,
        });

        // Refresh the plot list to reflect server changes
        refreshPlotList();
      }

      // Track the data recording in experiment tracker
      const trackingMetadata = buildTrackingMetadata();
      if (trackingMetadata) {
        trackDataRecording(trackingMetadata, trackingMetadata.cropName);
      }
    } catch (error) {
      console.log('INDIVIDUAL PLANTS - ERROR saving plants data:', error);
      Toast.error({message: 'Failed to save plants data. Please try again.'});
    } finally {
      setIsSavingPlants(false);
    }
  };

  // ── Accordion Handlers ────────────────────────────────────────────────────────
  const handleIndividualPlantsExpand = () => {
    setIsIndividualPlantsExpanded(true);

    // Set to null to indicate "loading" state (not yet loaded)
    setPlantsData(null);

    // Fetch individual plants data for the CURRENT plot and trait
    if (
      id &&
      type &&
      selectedPlot &&
      currentTrait &&
      networkIsConnected !== false
    ) {
      const queryParams = `experimentType=${type}&individualData=True`;
      getIndividualPlantsData({pathParams: id, queryParams});
    }
  };

  const handleIndividualPlantsCollapse = () => {
    setIsIndividualPlantsExpanded(false);
    // Reset to null when collapsed (not loaded state)
    setPlantsData(null);
  };

  // ── Real-time Average Handler ─────────────────────────────────────────────────
  const handleAverageChange = (average: number | null) => {
    setPlantsAverageValue(average);
  };

  const openTraitModal = () => {
    bottomSheetModalRef.current?.present();
  };

  const selectTrait = (trait: string) => {
    setCurrentTrait(trait);
    syncSelectedFixedValue();
    bottomSheetModalRef.current?.dismiss();
  };

  const [getPlotList, plotListData, isPlotListLoading, plotListError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  // after your getPlotList hook
  interface PostTraitsResponse {
    status_code: number;
    message?: string;
  }

  interface PostTraitsResponse {
    status_code: number;
    message?: string;
  }

  const [postTraits, postResponse, isPosting, postError] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'POST',
  });

  // Single trait deletion hook (POST)
  const [
    deleteTraitRecord,
    deleteTraitResponse,
    isDeletingTrait,
    deleteTraitError,
  ] = useApi({
    url: URL.DELETE_TRAIT_RECORD, // TODO: confirm actual backend path
    method: 'POST',
  });

  // ── bulk validation hook ────────────────────────────────────────────────────
  const [validateTraits, validationResponse, isValidating, validationError] =
    useApi({
      url: URL.VALIDATE_TRAITS_BULK,
      method: 'POST',
    });

  // ── cell validation hook for matrix view ────────────────────────────────────
  const [
    validateCellTraits,
    cellValidationResponse,
    isCellValidating,
    cellValidationError,
  ] = useApi({
    url: URL.VALIDATE_TRAITS_BULK,
    method: 'POST',
  });

  // ── single plot fetch hook for cell refresh ─────────────────────────────────
  const [getSinglePlot, singlePlotData, isSinglePlotLoading, singlePlotError] =
    useApi({
      url: URL.PLOT_LIST,
      method: 'GET',
    });

  // ── notes saving hook ─────────────────────────────────────────────────────
  const [saveNotes, saveNotesResponse, isSavingNotes, saveNotesError] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'POST',
  });

  // ── individual plants data fetch hook ─────────────────────────────────────
  const [
    getIndividualPlantsData,
    individualPlantsResponse,
    isLoadingIndividualPlants,
    individualPlantsError,
  ] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  // ── voice note upload hooks ──────────────────────────────────────────────────
  const [generatePreSignedUrl, preSignedUrlData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'GET',
  });

  // ── track invalid plots ─────────────────────────────────────────────────────
  const [invalidPlotIds, setInvalidPlotIds] = useState<number[]>([]);

  // Track previous trial/location id to detect change
  const prevIdRef = useRef<string | null>(null);

  // ── refresh plot list function ──────────────────────────────────────────────
  const refreshPlotList = React.useCallback(() => {
    if (id && type) {
      // Check if we're offline and have cached data
      if (networkIsConnected === false) {
        const offlinePlots = getOfflinePlotList(id);
        if (offlinePlots && offlinePlots.length > 0) {
          setPlotList(offlinePlots);

          // Also get offline experiment details
          const offlineDetails = getOfflineExperimentDetails(id);
          if (offlineDetails) {
            setDetails({
              cropName: offlineDetails.cropName || '',
              cropId: offlineDetails.cropId || offlineDetails.crop_id || '',
              fieldExperimentId: offlineDetails.fieldExperimentId || '',
              fieldExperimentName: offlineDetails.fieldExperimentName || '',
              maxNoOfImages: offlineDetails.maxNoOfImages || 0,
              villageName: offlineDetails.villageName || '',
              trialLocationId: offlineDetails.trialLocationId || '',
              name: offlineDetails.name || '',
              fieldLabel: offlineDetails.fieldLabel || '',
            });
          }
        } else {
        }
      } else {
        // Online mode - fetch from API (without individualData parameter)
        getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
      }
    }
  }, [
    id,
    type,
    networkIsConnected,
    getOfflinePlotList,
    getOfflineExperimentDetails,
  ]);

  useEffect(() => {
    // If id changed (e.g. via QR scan navigating to another location), reset pertinent state
    if (prevIdRef.current && prevIdRef.current !== id) {
      // Reset state so UI does not momentarily show previous experiment's plots
      setPlotList([]);
      setSelectedPlot(null);
      setCurrentPlotIndex(0);
      setTraits([]);
      setCurrentTrait('');
      isFirstFetch.current = true; // allow initial-load logic for new id
    }
    prevIdRef.current = id || null;

    if (id) {
      refreshPlotList();
    }
  }, [isConnected, id, type, route.params?.plotId, refreshPlotList]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsConnected(s.isConnected));
    return () => unsub();
  }, []);

  // Register callback for automatic plot list refresh after sync
  useEffect(() => {
    const syncCompleteCallback = () => {
      // Only refresh if we're currently viewing this experiment and we're online
      if (id && type && networkIsConnected !== false) {
        refreshPlotList();
      }
    };

    // Register the callback
    registerSyncCompleteCallback(syncCompleteCallback);

    // Cleanup: unregister the callback when component unmounts
    return () => {
      unregisterSyncCompleteCallback(syncCompleteCallback);
    };
  }, [id, type, networkIsConnected, refreshPlotList]);

  useEffect(() => {
    if (plotListData?.status_code !== 200 || !plotListData.data) {
      return;
    }
    const dataResp = plotListData.data;
    const plots = dataResp.plotData || [];

    // 🔍 DEBUG: Log complete structure of first plot to identify protocol fields
    if (plots.length > 0) {
      // Also check if protocol info is nested in other objects
      console.log(
        '🎤 DEBUG: First plot audioUrls structure:',
        plots[0].audioUrls,
      );
    }

    // 🚨 DETECT DUPLICATE IMAGE SHARING BUG 🚨
    const allImageUrls: string[] = [];
    const duplicateImages: string[] = [];

    plots.forEach((plot: any) => {
      if (plot.imageUrls) {
        plot.imageUrls.forEach((img: any) => {
          const url = img.url || img;
          if (allImageUrls.includes(url)) {
            if (!duplicateImages.includes(url)) {
              duplicateImages.push(url);
            }
          } else {
            allImageUrls.push(url);
          }
        });
      }
    });

    // 🚨 DETECT DUPLICATE NOTES SHARING BUG 🚨
    const allNotes: string[] = [];
    const duplicateNotes: string[] = [];
    const notesPlotMapping: Record<string, string[]> = {};

    plots.forEach((plot: any) => {
      if (plot.notes && plot.notes.trim() !== '') {
        const noteContent = plot.notes.trim();

        if (!notesPlotMapping[noteContent]) {
          notesPlotMapping[noteContent] = [];
        }
        notesPlotMapping[noteContent].push(plot.plotNumber);

        if (allNotes.includes(noteContent)) {
          if (!duplicateNotes.includes(noteContent)) {
            duplicateNotes.push(noteContent);
          }
        } else {
          allNotes.push(noteContent);
        }
      }
    });

    if (duplicateImages.length > 0) {
      // Show which plots have the same images
      duplicateImages.forEach(duplicateUrl => {
        const affectedPlots = plots
          .filter((plot: any) =>
            plot.imageUrls?.some(
              (img: any) => (img.url || img) === duplicateUrl,
            ),
          )
          .map((plot: any) => plot.plotNumber);
      });
    } else {
    }

    if (duplicateNotes.length > 0) {
      // Show which plots have the same notes
      Object.entries(notesPlotMapping).forEach(([noteContent, plotNumbers]) => {
        if (plotNumbers.length > 1) {
        }
      });
    } else {
    }

    // 🔧 TEMPORARY FRONTEND WORKAROUND FOR SHARED NOTES BUG
    // This is a client-side fix while backend is being fixed
    if (duplicateNotes.length > 0) {
      plots.forEach((plot: any, index: number) => {
        if (plot.notes && plot.notes.trim() !== '') {
          // If this is not the first plot with this note content, clear it
          const isFirstOccurrence =
            plots.findIndex(
              (p: any) => p.notes && p.notes.trim() === plot.notes.trim(),
            ) === index;

          if (!isFirstOccurrence) {
            // This is a duplicate note, clear it
            plot.notes = '';
          }
        }
      });
    }

    // 🔧 PRESERVE RECENTLY UPDATED NOTES DURING REFRESH
    // Merge recently updated notes with server data to prevent losing local changes
    if (Object.keys(recentlyUpdatedNotes).length > 0) {
      plots.forEach((plot: any) => {
        const recentNote = recentlyUpdatedNotes[plot.plotNumber];
        if (recentNote !== undefined) {
          plot.notes = recentNote;
        }
      });

      // Clear recently updated notes after merging (with conservative delay for navigation scenarios)
      setTimeout(() => {
        setRecentlyUpdatedNotes({});
        // Also clear from AsyncStorage
        clearRecentlyUpdatedNotesFromStorage();
      }, 30000); // Increased to 30 seconds to handle navigation scenarios
    } else {
    }

    // Debug plot data for accessionId

    // update global list & details
    setPlotList(plots);
    setDetails({
      cropName: dataResp.cropName,
      cropId: dataResp.cropId || dataResp.crop_id || '',
      fieldExperimentId: dataResp.fieldExperimentId,
      fieldExperimentName: dataResp.fieldExperimentName,
      maxNoOfImages: dataResp.maxNoOfImages ?? 5,
      villageName: dataResp.villageName,
      trialLocationId: dataResp.trialLocationId,
      name: dataResp.name,
      fieldLabel: dataResp.fieldLabel, // ← grab the new fieldLabel
    });

    // build recordedData map
    const map: Record<string, any[]> = {};
    interface RecordedTrait {
      traitName: string;
      dataType?: string;
      value?: string;
    }

    interface Plot {
      plotNumber: string;
      recordedTraitData?: RecordedTrait[];
    }

    plots.forEach((p: Plot) => {
      map[p.plotNumber] =
        p.recordedTraitData?.map((rt: RecordedTrait) => ({
          traitName: rt.traitName,
          dataType: rt.dataType,
          value: rt.value,
        })) || [];
    });
    setRecordedData(map);
    // Store the original data to detect unsaved changes
    setOriginalRecordedData(JSON.parse(JSON.stringify(map)));

    if (isFirstFetch.current) {
      // initial load (or reset after id change) → choose plot based on route.params.plotId if provided
      isFirstFetch.current = false;
      if (plots.length > 0) {
        const routePlotIdRaw = route.params?.plotId;
        let initialPlot = plots[0];
        if (routePlotIdRaw) {
          // match either by internal id or plotNumber (both may be numbers or strings)
          const routePlotId = String(routePlotIdRaw);
          const found = plots.find(
            (p: any) =>
              String(p.id) === routePlotId ||
              String(p.plotNumber) === routePlotId,
          );
          if (found) {
            initialPlot = found;
          }
        }
        setSelectedPlot(initialPlot);
        const idx = plots.findIndex(
          (p: any) => p.plotNumber === initialPlot.plotNumber,
        );
        setCurrentPlotIndex(idx === -1 ? 0 : idx);
        const rec =
          initialPlot.recordedTraitData?.map((t: any) => t.traitName) || [];
        const unrec =
          initialPlot.unrecordedTraitData?.map((t: any) => t.traitName) || [];
        const all = Array.from(new Set([...rec, ...unrec]));
        const augmented = [...all, 'Image', 'Notes', 'Voice Note'];
        setTraits(augmented);
        setCurrentTrait(augmented[0] || '');
      }
    } else {
      // refresh after upload → keep same index & trait, update selectedPlot data
      if (selectedPlot) {
        const updated: Plot | undefined = plots.find(
          (p: Plot) => p.plotNumber === selectedPlot.plotNumber,
        );
        if (updated) {
          // 🔧 FORCE UPDATE WITH RECENT NOTE IF AVAILABLE
          const recentNote = recentlyUpdatedNotes[selectedPlot.plotNumber];
          if (recentNote !== undefined) {
            (updated as any).notes = recentNote;
          } else {
          }

          setSelectedPlot(updated);

          // 🔧 Update index too so it stays in sync
          const updatedIndex = plots.findIndex(
            (p: Plot) => p.plotNumber === selectedPlot.plotNumber,
          );
          if (updatedIndex !== -1) {
            setCurrentPlotIndex(updatedIndex);
          }
        }
      }
    }
  }, [plotListData]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        {isPlotListLoading ? (
          <Loader />
        ) : (
          <Text style={styles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isPlotListLoading],
  );

  const handleRecordedTraits = () => {
    setPlotList([]);
    getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
  };

  const filteredPlotList = useMemo(() => {
    if (searchQuery === '') {
      return plotList;
    }
    return plotList.filter(plot =>
      plot.plotNumber
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [plotList, searchQuery]);

  const totalPlots = plotList.length;

  const recordedPlots = useMemo(() => {
    return plotList.reduce((count, plot) => {
      // Get total number of API traits (excluding frontend-added Image and Notes)
      const totalApiTraits =
        (plot.recordedTraitData?.length ?? 0) +
        (plot.unrecordedTraitData?.length ?? 0);

      // Count how many of these API traits have valid recorded values
      const validRecordedCount = (
        plot.recordedTraitData?.filter(
          (trait: any) => trait.value != null && trait.value !== '',
        ) ?? []
      ).length;

      // A plot is considered "recorded" only if ALL API traits have valid values
      const isPlotFullyRecorded = validRecordedCount === totalApiTraits;

      return isPlotFullyRecorded ? count + 1 : count;
    }, 0);
  }, [plotList]);

  useEffect(() => {
    if (
      filteredPlotList.length > 0 &&
      currentPlotIndex < filteredPlotList.length
    ) {
      const newSelectedPlot = filteredPlotList[currentPlotIndex];
      setSelectedPlot(newSelectedPlot);
    }
  }, [currentPlotIndex, filteredPlotList]);

  useEffect(() => {
    syncSelectedFixedValue();
  }, [selectedPlot, currentTrait, recordedData]);

  // ── Voice Note Upload: Handle pre-signed URL response ──────────────────────────
  useEffect(() => {
    if (!preSignedUrlData || !pendingVoiceNoteUploadRef.current) {
      return;
    }

    const handleVoiceNoteS3Upload = async () => {
      try {
        const {s3_path, status_code, data: responseData} = preSignedUrlData;

        console.log('\n');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log(
          '🎤 VOICE NOTE UPLOAD FLOW - STEP 3: RECEIVED PRE-SIGNED URL RESPONSE',
        );
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log(
          '📥 COMPLETE RESPONSE FROM PRE-SIGNED URL API (FULL JSON):',
        );
        console.log(
          '─────────────────────────────────────────────────────────────────────',
        );
        const preSignedResponseJSON = JSON.stringify(preSignedUrlData, null, 2);
        console.log(preSignedResponseJSON);
        console.log(
          '─────────────────────────────────────────────────────────────────────',
        );
        console.log('\nResponse Details:');
        console.log('  - Status Code:', status_code);
        console.log('  - S3 Path:', s3_path);
        console.log(
          '  - Pre-signed URL (truncated):',
          responseData?.presigned_url?.substring(0, 100) + '...',
        );
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('\n');

        if (status_code !== 200) {
          Toast.error({message: 'Failed to get upload URL', duration: 3000});
          setIsUploadingVoiceNote(false);
          pendingVoiceNoteUploadRef.current = null;
          return;
        }

        const presignedUrl = responseData?.presigned_url;
        if (!presignedUrl) {
          Toast.error({message: 'Invalid upload URL received', duration: 3000});
          setIsUploadingVoiceNote(false);
          pendingVoiceNoteUploadRef.current = null;
          return;
        }

        // Get Content-Type from backend response (audio/mp4, audio/mpeg, etc.)
        const contentType =
          responseData?.content_type || responseData?.contentType;
        if (!contentType) {
          console.warn(
            '⚠️  No Content-Type in backend response, using fallback',
          );
        }

        const {voiceNoteData} = pendingVoiceNoteUploadRef.current;

        console.log('\n');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('🎤 VOICE NOTE UPLOAD FLOW - STEP 4: UPLOAD TO S3');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('Preparing audio data for S3 upload...');
        console.log('  - Destination S3 Path (from backend):', s3_path);
        console.log(
          '  - Pre-signed URL (from backend):',
          presignedUrl.substring(0, 100) + '...',
        );
        console.log(
          '  - Content-Type (from backend):',
          contentType || voiceNoteData.mimeType,
        );
        console.log('\n📊 Audio Data Conversion:');
        console.log('  - Input Format: Base64 String');
        console.log(
          '  - Input Size:',
          voiceNoteData.audioBase64.length,
          'characters',
        );
        console.log('  - Output Format: Binary Buffer (ArrayBuffer)');
        console.log(
          '  - Output Size:',
          Math.floor(voiceNoteData.audioBase64.length * 0.75),
          'bytes (calculated)',
        );
        console.log('\n🔄 Backend Requirements:');
        console.log('  ✅ Use exact presigned_url from backend');
        console.log('  ✅ Use exact s3_path from backend');
        console.log('  ✅ Use exact Content-Type from backend');
        console.log('  ✅ Send binary data (base64 → bytes)');
        console.log('  ✅ Only Content-Type header, no extras');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('\n');

        // Step 3: Upload audio to S3 using backend-provided values
        await uploadVoiceNoteToS3(
          presignedUrl,
          voiceNoteData.audioBase64,
          contentType || voiceNoteData.mimeType, // Use backend's Content-Type if available
        );

        console.log('\n');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('✅ VOICE NOTE UPLOAD FLOW - STEP 5: S3 UPLOAD SUCCESSFUL');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('Audio file successfully uploaded to S3!');
        console.log('  - S3 Path:', s3_path);
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('\n');

        // Step 4: Prepare payload for RECORD_TRAITS API with voice note metadata
        const {
          plotId,
          plotNumber,
          latitude,
          longitude,
          existingVoiceNotesCount,
        } = pendingVoiceNoteUploadRef.current;

        // Get the plot to access existing data
        const plot = plotList.find(p => p.id === plotId);

        // ONLY collect phenotypes that were modified in this session
        // Don't send all traits - this would overwrite historical metadata
        const modifiedTraits = modifiedTraitsInSession[plotNumber];
        const plotTraits = recordedData[plotNumber] || [];

        // Filter to only include traits modified in this session
        const phenotypes =
          modifiedTraits && modifiedTraits.size > 0
            ? plotTraits
                .filter((rec: TraitData) => modifiedTraits.has(rec.traitName))
                .map((rec: TraitData) => {
                  const recordedMeta = plot?.recordedTraitData?.find(
                    (t: TraitData) => t.traitName === rec.traitName,
                  );
                  const unrecordedMeta = plot?.unrecordedTraitData?.find(
                    (t: TraitData) => t.traitName === rec.traitName,
                  );
                  const meta = recordedMeta ?? unrecordedMeta;

                  if (!meta) return null;

                  const isDate =
                    meta?.dataType === 'date' || rec.dataType === 'date';
                  let observedValue = rec.value!;

                  if (isDate) {
                    const apiDate = toApiDate(rec.value);
                    if (apiDate === null || apiDate === '') {
                      return null;
                    }
                    observedValue = apiDate;
                  }

                  const phenotype: any = {
                    observationId: meta?.observationId ?? null,
                    observedValue,
                    traitId: meta.traitId,
                  };

                  // Include individual plants data if available
                  if (
                    hasPlantsSaved &&
                    rec.traitName === currentTrait &&
                    plot?.plotNumber === selectedPlot?.plotNumber &&
                    plantsData &&
                    plantsData.length > 0
                  ) {
                    const individualPlantsData = plantsData
                      .filter(plant => {
                        return (
                          plant.name.trim() ||
                          plant.value.trim() ||
                          plant.x.trim() ||
                          plant.y.trim()
                        );
                      })
                      .map(plant => ({
                        value: plant.value ? parseFloat(plant.value) : null,
                        x: plant.x ? parseFloat(plant.x) : null,
                        y: plant.y ? parseFloat(plant.y) : null,
                        name: plant.name.trim() || null,
                      }));

                    if (individualPlantsData.length > 0) {
                      phenotype.individualPlantsData = individualPlantsData;
                    }
                  }

                  return phenotype;
                })
                .filter(Boolean)
            : []; // No modified traits, send empty phenotypes array

        // Get notes from plot
        const notes = recentlyUpdatedNotes[plotNumber] || plot?.notes || '';

        // Format audio data according to new backend format
        // Backend expects: audioData: [{ audioName: string, s3Path: string }]
        const audioData = [
          {
            audioName: voiceNoteData.fileName,
            s3Path: s3_path, // Use exact s3_path from backend response
          },
        ];

        // Include existing audio data if any
        const existingVoiceNotes = plot?.voiceNote || [];
        if (existingVoiceNotes.length > 0) {
          existingVoiceNotes.forEach((vn: any) => {
            audioData.push({
              audioName: vn.fileName || vn.audioName,
              s3Path: vn.s3Path || vn.s3_path,
            });
          });
        }

        const payload: any = {
          experimentType: type,
          fieldExperimentId: Number(details.fieldExperimentId),
          observations: [
            {
              plotId: plotId,
              lat: latitude,
              long: longitude,
              date: new Date().toISOString(),
              notes: notes || 'Fieldman added a voice note.',
              audioData: audioData,
              phenotypes: phenotypes,
            },
          ],
        };

        console.log('\n');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log(
          '🎤 VOICE NOTE UPLOAD FLOW - STEP 6: SEND METADATA TO RECORD_TRAITS API',
        );
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('API Endpoint:', `${organizationURL}${URL.RECORD_TRAITS}`);
        console.log('\n📦 COMPLETE PAYLOAD SENT TO RECORD_TRAITS (FULL JSON):');
        console.log(
          '─────────────────────────────────────────────────────────────────────',
        );
        const payloadJSON = JSON.stringify(payload, null, 2);
        console.log(payloadJSON);
        console.log(
          '─────────────────────────────────────────────────────────────────────',
        );
        console.log('\n📋 PAYLOAD BREAKDOWN:');
        console.log('  Root Level:');
        console.log('    - experimentType:', payload.experimentType);
        console.log('    - fieldExperimentId:', payload.fieldExperimentId);
        console.log(
          '    - observations: [array with',
          payload.observations.length,
          'item(s)]',
        );
        console.log('\n  Observation [0]:');
        console.log('    - plotId:', payload.observations[0].plotId);
        console.log('    - lat:', payload.observations[0].lat);
        console.log('    - long:', payload.observations[0].long);
        console.log('    - date:', payload.observations[0].date);
        console.log('    - notes:', payload.observations[0].notes);
        console.log(
          '    - audioData: [array with',
          payload.observations[0].audioData.length,
          'item(s)]',
        );

        // Log audio data detail
        console.log('\n  Audio Data Detail:');
        payload.observations[0].audioData.forEach((audio: any, idx: number) => {
          console.log(`    [${idx}]:`);
          console.log('      - audioName:', audio.audioName);
          console.log('      - s3Path:', audio.s3Path);
        });

        console.log('\n  Phenotypes:');
        console.log(
          '    - phenotypes: [array with',
          payload.observations[0].phenotypes.length,
          'item(s)]',
        );

        // Log phenotypes detail
        if (payload.observations[0].phenotypes.length > 0) {
          console.log('\n  Phenotypes Detail:');
          payload.observations[0].phenotypes.forEach(
            (pheno: any, idx: number) => {
              console.log(
                `    [${idx}] traitId:`,
                pheno.traitId,
                '| observedValue:',
                pheno.observedValue,
                '| observationId:',
                pheno.observationId,
              );
              if (pheno.individualPlantsData) {
                console.log(
                  '        individualPlantsData:',
                  JSON.stringify(pheno.individualPlantsData),
                );
              }
            },
          );
        }

        console.log('\n🔑 KEY FEATURES:');
        console.log('  ✅ Voice note uploaded to S3 first (binary data)');
        console.log('  ✅ Using exact s3_path from backend response');
        console.log(
          '  ✅ New payload format: audioData array with audioName and s3Path',
        );
        console.log('  ✅ Supports multiple voice notes per plot');
        console.log('  ✅ Combined with phenotypes and notes');
        console.log('  ✅ ISO 8601 date format for timestamp');
        console.log('  ✅ No imageData in voice note upload payload');
        console.log(
          '═══════════════════════════════════════════════════════════════════════',
        );
        console.log('\n');

        // Send to RECORD_TRAITS API
        postTraits({
          payload,
          headers: {'Content-Type': 'application/json'},
        });

        console.log('⏳ Waiting for RECORD_TRAITS API response...\n');

        // Store count for success message
        pendingVoiceNoteUploadRef.current.waitingForResponse = true;
      } catch (error) {
        console.error('Failed to upload voice note to S3:', error);
        Toast.error({
          message: 'Failed to upload voice note. Please try again.',
        });
        setIsUploadingVoiceNote(false);
        pendingVoiceNoteUploadRef.current = null;
      }
    };

    handleVoiceNoteS3Upload();
  }, [preSignedUrlData]);

  // ── Voice Note Upload: Handle RECORD_TRAITS response ───────────────────────────
  useEffect(() => {
    if (
      !postResponse ||
      !pendingVoiceNoteUploadRef.current?.waitingForResponse
    ) {
      return;
    }

    console.log('\n');
    console.log(
      '═══════════════════════════════════════════════════════════════════════',
    );
    console.log(
      '🎤 VOICE NOTE UPLOAD FLOW - STEP 7: RECEIVED RECORD_TRAITS RESPONSE',
    );
    console.log(
      '═══════════════════════════════════════════════════════════════════════',
    );
    console.log('📥 COMPLETE RESPONSE FROM RECORD_TRAITS API (FULL JSON):');
    console.log(
      '─────────────────────────────────────────────────────────────────────',
    );
    const responseJSON = JSON.stringify(postResponse, null, 2);
    console.log(responseJSON);
    console.log(
      '─────────────────────────────────────────────────────────────────────',
    );
    console.log('\nResponse Details:');
    console.log('  - Status Code:', postResponse.status_code);
    console.log('  - Message:', postResponse.message || '(none)');
    if (postResponse.data) {
      console.log('  - Data:', JSON.stringify(postResponse.data, null, 2));
    }
    console.log(
      '═══════════════════════════════════════════════════════════════════════',
    );
    console.log('\n');

    const {status_code} = postResponse;

    if (status_code !== 200) {
      console.log('❌ VOICE NOTE UPLOAD FAILED');
      console.log('Error:', postResponse.message || 'Unknown error');
      Toast.error({
        message: 'Failed to save voice note',
        duration: 3000,
      });
    } else {
      const {existingVoiceNotesCount} = pendingVoiceNoteUploadRef.current;

      console.log('\n');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('✅ VOICE NOTE UPLOAD FLOW - COMPLETE! SUCCESS! 🎉');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('Voice note successfully saved!');
      console.log(
        '  - Voice Note Number:',
        existingVoiceNotesCount + 1,
        'of 3',
      );
      console.log('\n📊 COMPLETE FLOW SUMMARY:');
      console.log('  Step 1: ✅ Initialized upload with voice note data');
      console.log('  Step 2: ✅ Requested pre-signed URL from server');
      console.log('  Step 3: ✅ Received pre-signed URL and S3 path');
      console.log('  Step 4: ✅ Uploaded audio binary to S3');
      console.log('  Step 5: ✅ S3 upload confirmed');
      console.log('  Step 6: ✅ Sent metadata to RECORD_TRAITS API');
      console.log('  Step 7: ✅ RECORD_TRAITS API saved successfully');
      console.log('\n🔄 Next: Refreshing plot list to show new voice note...');
      console.log(
        '═══════════════════════════════════════════════════════════════════════',
      );
      console.log('\n\n');

      Toast.success({
        message: `Voice note ${
          existingVoiceNotesCount + 1
        } of 3 uploaded successfully!`,
      });

      // Refresh plot list to get updated data
      setTimeout(() => {
        refreshPlotList();
      }, 1000);
    }

    // Cleanup
    setIsUploadingVoiceNote(false);
    pendingVoiceNoteUploadRef.current = null;
  }, [postResponse]);

  // ── Helper function to extract detailed validation errors ──────────────────────
  const extractValidationErrors = (
    validationResponse: any,
  ): ValidationError[] => {
    const validData = validationResponse.data ?? validationResponse;
    const errors: ValidationError[] = [];

    if (!validData.observations || !Array.isArray(validData.observations)) {
      return errors;
    }

    validData.observations.forEach((obs: any) => {
      if (!obs.phenotypes || !Array.isArray(obs.phenotypes)) return;

      // Find the plot information
      let plotNumber = obs.plotNumber;
      if (!plotNumber) {
        const plot = plotList.find(p => (p.id ?? p.plotNumber) === obs.plotId);
        plotNumber = plot?.plotNumber || obs.plotId?.toString() || 'Unknown';
      }

      obs.phenotypes.forEach((phenotype: any) => {
        if (phenotype.validationStatus === false) {
          // Find trait information from the plot data
          const plot = plotList.find(p => p.plotNumber === plotNumber);
          let traitName = 'Unknown Trait';
          let traitId = phenotype.traitId;
          let traitData: any = null;

          if (plot && traitId) {
            // Search in recorded traits first
            const recordedTrait = plot.recordedTraitData?.find(
              (t: any) => t.traitId === traitId,
            );
            if (recordedTrait) {
              traitName = recordedTrait.traitName;
              traitData = recordedTrait;
            } else {
              // Search in unrecorded traits
              const unrecordedTrait = plot.unrecordedTraitData?.find(
                (t: any) => t.traitId === traitId,
              );
              if (unrecordedTrait) {
                traitName = unrecordedTrait.traitName;
                traitData = unrecordedTrait;
              }
            }
          }

          // Extract range information from predefined list
          let expectedRange: any = undefined;
          if (
            traitData?.preDefiendList &&
            Array.isArray(traitData.preDefiendList)
          ) {
            // Look for range information in predefined list
            const rangeData = traitData.preDefiendList.find(
              (item: any) =>
                item &&
                (item.minimum !== undefined || item.maximum !== undefined),
            );

            if (rangeData) {
              expectedRange = {
                minimum: rangeData.minimum,
                maximum: rangeData.maximum,
                unit: traitData.traitUom || rangeData.unit,
              };
            }
          }

          errors.push({
            plotNumber: plotNumber,
            plotId: obs.plotId,
            traitName: traitName,
            traitId: traitId,
            value: phenotype.observedValue || '',
            errorMessage:
              phenotype.errorMessage || phenotype.message || 'Invalid value',
            validationStatus: false,
            expectedRange: expectedRange,
          });
        }
      });
    });

    return errors;
  };

  const hasPlotData = plotList.length > 0;
  const shouldShowSkeleton =
    !plotListError &&
    (isPlotListLoading || (!plotListData && !plotListError)) &&
    !hasPlotData;

  const handleSaveAll = async () => {
    setInvalidPlotIds([]);

    // 🔒 VALIDATE LOCATION BEFORE PROCEEDING
    const locationData = await validateLocationForAPI(true, true);

    if (!locationData) {
      Toast.error({
        message: 'Location access is required to save trait data',
        duration: 3000,
      });
      return; // Stop execution if location is not available
    }

    const {latitude, longitude} = locationData;

    const date = formatDateTime(new Date());

    // ONLY send traits that were modified in this session
    const observations = Object.entries(recordedData)
      .map(([plotNumber, traitsArray]) => {
        const plot = plotList.find(
          p => p.plotNumber.toString() === plotNumber.toString(),
        );

        // Get the set of modified traits for this plot
        const modifiedTraits = modifiedTraitsInSession[plotNumber];

        // If no traits were modified in this session for this plot, skip it
        if (!modifiedTraits || modifiedTraits.size === 0) {
          return null;
        }

        // Filter to only include traits that were modified in this session
        const phenotypesToSend = traitsArray
          .filter((rec: TraitData) => modifiedTraits.has(rec.traitName))
          .map((rec: TraitData) => {
            const recordedMeta = plot?.recordedTraitData?.find(
              (t: TraitData) => t.traitName === rec.traitName,
            );
            const unrecordedMeta = plot?.unrecordedTraitData?.find(
              (t: TraitData) => t.traitName === rec.traitName,
            );
            const meta = recordedMeta ?? unrecordedMeta!;
            const isDate = meta?.dataType === 'date' || rec.dataType === 'date';

            // For date traits, convert to API format
            let observedValue = rec.value!;
            if (isDate) {
              const apiDate = toApiDate(rec.value);
              if (apiDate === null || apiDate === '') {
                // Skip this trait if it's a date with no valid value
                return null;
              }
              observedValue = apiDate;
            }

            const phenotype: any = {
              observationId: meta?.observationId ?? null,
              observedValue,
              traitId: meta.traitId,
            };

            // Add individualPlantsData ONLY if:
            // 1. User has saved plants data (hasPlantsSaved flag is true)
            // 2. Current trait matches the trait for which plants were saved
            // 3. Current plot matches the plot for which plants were saved
            // 4. There's actual plants data available
            if (
              hasPlantsSaved &&
              rec.traitName === currentTrait &&
              plot?.plotNumber === selectedPlot?.plotNumber &&
              plantsData &&
              plantsData.length > 0
            ) {
              const individualPlantsData = plantsData
                .filter(plant => {
                  return (
                    plant.name.trim() ||
                    plant.value.trim() ||
                    plant.x.trim() ||
                    plant.y.trim()
                  );
                })
                .map(plant => ({
                  value: plant.value ? parseFloat(plant.value) : null,
                  x: plant.x ? parseFloat(plant.x) : null,
                  y: plant.y ? parseFloat(plant.y) : null,
                  name: plant.name.trim() || null,
                }));

              if (individualPlantsData.length > 0) {
                phenotype.individualPlantsData = individualPlantsData;
              }
            }

            return phenotype;
          })
          .filter(Boolean); // Remove null entries (empty dates)

        // If no valid phenotypes after filtering, skip this plot
        if (phenotypesToSend.length === 0) {
          return null;
        }

        return {
          plotNumber: plot?.plotNumber,
          plotId: plot?.id ?? plot?.plotNumber,
          date,
          lat: latitude,
          long: longitude,
          notes: '',
          applications: null,
          phenotypes: phenotypesToSend,
        };
      })
      .filter(Boolean); // Remove null entries (plots with no modified traits)

    // If no observations to send, show a message
    if (observations.length === 0) {
      Toast.info({
        message: 'No new data to save',
      });
      return;
    }

    const payload = {
      experimentType: type,
      fieldExperimentId: Number(details.fieldExperimentId),
      observations,
    };

    // Log the complete payload being sent to RECORD_TRAITS API
    console.log('\n\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('INDIVIDUAL PLANTS DATA PAYLOAD - POST RECORD_TRAITS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Root Level:');
    console.log('  experimentType:', payload.experimentType);
    console.log('  fieldExperimentId:', payload.fieldExperimentId);
    console.log('  observations count:', payload.observations.length);
    console.log('\n');

    console.log('COMPLETE PAYLOAD AS JSON:');
    const payloadString = JSON.stringify(payload, null, 2);
    // Split into chunks to avoid truncation
    const chunkSize = 500;
    for (let i = 0; i < payloadString.length; i += chunkSize) {
      console.log(payloadString.substring(i, i + chunkSize));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n\n');

    // Check network connectivity to determine save strategy
    if (networkIsConnected === false) {
      // OFFLINE MODE: Save directly to local database for sync later

      try {
        // Use the savePayloads function to queue this data for sync
        await savePayloads(
          `${organizationURL}${URL.RECORD_TRAITS}`, // Full URL
          URL.RECORD_TRAITS, // URL key
          '', // pathParams (empty for this API)
          `experimentType=${type}`, // queryParams
          payload, // The payload to save
          'POST', // HTTP method
        );

        // Clear the local recorded data since it's now queued for sync
        setRecordedData({});
        setOriginalRecordedData({});
        setModifiedTraitsInSession({}); // Clear modified traits tracking

        // Show offline success message
        Toast.success({
          message:
            'Saved locally. Your data will be synced with the server when there is internet connection.',
        });

        // Refresh the plot list to show updated state
        refreshPlotList();
      } catch (error) {
        Toast.error({
          message: 'Failed to save data locally. Please try again.',
        });
      }
    } else {
      // ONLINE MODE: Validate first, then save to server

      // Save for post-validation use
      setPendingSavePayload(payload);

      // Trigger validation, response will be handled by useEffect!
      validateTraits({
        payload: {...payload},
        headers: {'Content-Type': 'application/json'},
      });
    }
  };

  useEffect(() => {
    // Only proceed if we have a payload waiting to save AND a validation response
    if (!pendingSavePayload || !validationResponse) return;

    // Support both { data: {...} } and plain {...}
    const validData = validationResponse.data ?? validationResponse;

    if (validData.overallValidation === true) {
      // All valid, proceed to save
      postTraits({
        payload: {...pendingSavePayload},
        headers: {'Content-Type': 'application/json'},
      });
      setPendingSavePayload(null); // Reset
    } else if (validData.overallValidation === false) {
      // Extract detailed validation errors
      const detailedErrors = extractValidationErrors(validationResponse);

      if (detailedErrors.length > 0) {
        // Set validation errors and show the detailed modal
        setValidationErrors(detailedErrors);
        setIsValidationErrorModalVisible(true);

        // Also set invalid plot IDs for backward compatibility with existing UI
        const badIds: number[] = detailedErrors
          .map(error => {
            const plot = plotList.find(p => p.plotNumber === error.plotNumber);
            return plot?.id ?? plot?.plotNumber;
          })
          .filter(Boolean);
        setInvalidPlotIds(badIds);

        // Show a summary toast for quick reference
        const uniquePlots = new Set(detailedErrors.map(e => e.plotNumber));
        const uniqueTraits = new Set(detailedErrors.map(e => e.traitName));

        Toast.error({
          message: `${detailedErrors.length} validation errors found across ${uniquePlots.size} plots and ${uniqueTraits.size} traits. Check details for more info.`,
        });
      } else {
        // Fallback to old behavior if no detailed errors extracted
        const badPlotNumbers: string[] = (
          Array.isArray(validData.observations) ? validData.observations : []
        )
          .filter((obs: any) =>
            obs.phenotypes?.some((p: any) => p.validationStatus === false),
          )
          .map((obs: any) => {
            // Try to get plotNumber from validation response first, fallback to finding by plotId
            if (obs.plotNumber) {
              return obs.plotNumber;
            }
            // Fallback: find plot by plotId and get its plotNumber
            const plot = plotList.find(
              p => (p.id ?? p.plotNumber) === obs.plotId,
            );
            return plot?.plotNumber || obs.plotId;
          });

        // Convert plot numbers to IDs for setInvalidPlotIds (if needed for other functionality)
        const badIds: number[] = badPlotNumbers
          .map(plotNumber => {
            const plot = plotList.find(p => p.plotNumber === plotNumber);
            return plot?.id ?? plot?.plotNumber;
          })
          .filter(Boolean);

        setInvalidPlotIds(badIds);

        Toast.error({
          message: badPlotNumbers.length
            ? `Plots ${badPlotNumbers.join(', ')} have invalid values`
            : 'Some plots have invalid values',
        });

        plotModalRef.current?.present();

        setTimeout(() => {
          const idx = filteredPlotList.findIndex(p =>
            badIds.includes(p.id ?? p.plotNumber),
          );
          if (idx >= 0) {
            plotScrollRef.current?.scrollTo({y: idx * 48, animated: true});
          }
        }, 300);
      }

      setPendingSavePayload(null); // Reset
    } else {
      // Catch-all: Unexpected validation response
      Toast.error({
        message: 'Unexpected validation response. Please try again.',
      });
      setPendingSavePayload(null); // Reset
    }
  }, [validationResponse]);

  useEffect(() => {
    if (!postResponse && !postError) return;

    // Determine if this is a cell save operation (has pendingCellSavePayload)
    const isCellSave = !!pendingCellSavePayload;

    // Check for errors first (postError takes precedence)
    if (postError) {
      // Clear flags on failure
      setNoteUpdateInProgress(false);

      // Close cell modal if this was a cell save
      if (isCellSave) {
        cellEditModalRef.current?.dismiss();
        setPendingCellSavePayload(null);
        setCellValidationPassed(false); // Reset validation flag
      }

      // Extract error message from postError
      let errorMessage = 'Failed to upload the data';

      // Try to extract more specific error message
      if (postError?.message) {
        errorMessage = postError.message;
      } else if (typeof postError === 'string') {
        errorMessage = postError;
      } else if (postError?.response?.data?.message) {
        errorMessage = postError.response.data.message;
      } else if (postError?.data?.message) {
        errorMessage = postError.data.message;
      }

      Toast.error({
        message: errorMessage,
      });

      // Return early for cell saves to prevent any further processing
      if (isCellSave) {
        return;
      }
    } else if (postResponse?.status_code === 200) {
      // Additional validation: Only show success for valid cell saves
      // This prevents showing success when validation should have failed
      if (isCellSave) {
        // Additional safeguard: Don't show success if validation didn't pass
        if (!cellValidationPassed) {
          // Close the modal and show error instead
          cellEditModalRef.current?.dismiss();
          setPendingCellSavePayload(null);
          setCellValidationPassed(false);

          Toast.error({
            message: 'Data validation failed. Changes not saved.',
          });

          return; // Prevent further processing
        }
      }

      // Show appropriate success message
      const successMessage = isCellSave
        ? 'Value saved successfully!'
        : 'Data uploaded successfully!';

      Toast.success({message: successMessage});

      // Track data recording activity for experiment tracking
      const trackingMetadata = buildTrackingMetadata({
        fieldExperimentName: details.fieldExperimentName,
        experimentName: details.fieldExperimentName,
        cropName: details.cropName,
        experimentType: type,
        projectKey: data?.projectId,
        season: data?.season,
        year: new Date().getFullYear().toString(),
      });

      if (trackingMetadata) {
        trackDataRecording(trackingMetadata, trackingMetadata.cropName);
      }

      // Clear recorded data for bulk saves only
      if (!isCellSave) {
        setRecordedData({}); // clear your local data
        setOriginalRecordedData({}); // reset original data to match current (empty) state
        setModifiedTraitsInSession({}); // Clear modified traits tracking
      }

      // Close cell modal if this was a cell save
      if (isCellSave) {
        cellEditModalRef.current?.dismiss();
        setPendingCellSavePayload(null);
        setCellValidationPassed(false); // Reset validation flag after successful save

        // For cell saves, only refresh that specific cell instead of entire plot list
        if (selectedCellData) {
          // Set refreshing state for this specific cell
          setRefreshingCell({
            plotNumber: selectedCellData.plotNumber,
            traitName: selectedCellData.traitName,
          });

          // Add safety timeout to clear refreshing state
          setTimeout(() => {
            setRefreshingCell(null);
          }, 10000); // 10 second timeout

          // Fetch single plot data to update just this cell
          getSinglePlot({
            pathParams: id,
            queryParams: `experimentType=${type}`,
          });
        }

        // ALWAYS return early for cell saves to prevent full screen refresh
        return;
      }

      // Add a slight delay to allow server to process the update
      setTimeout(() => {
        getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
        // Clear the note update flag after refresh
        setNoteUpdateInProgress(false);
      }, 1000); // 1 second delay to allow server to update
    } else {
      // Handle non-200 responses or other failure scenarios

      // Clear flags on failure
      setNoteUpdateInProgress(false);

      // Close cell modal if this was a cell save
      if (isCellSave) {
        cellEditModalRef.current?.dismiss();
        setPendingCellSavePayload(null);
        setCellValidationPassed(false); // Reset validation flag
      }

      // Extract error message from response or use fallback
      let errorMessage = 'Failed to upload the data';

      // Try to extract more specific error message from various possible locations
      if (postResponse?.message) {
        errorMessage = postResponse.message;
      } else if (postResponse?.data?.message) {
        errorMessage = postResponse.data.message;
      } else if (postResponse?.error?.message) {
        errorMessage = postResponse.error.message;
      } else if (postResponse?.status_code) {
        errorMessage = `Server error (${postResponse.status_code})`;
      }

      Toast.error({
        message: errorMessage,
      });

      // Return early for cell saves to prevent any further processing
      if (isCellSave) {
        return;
      }
    }
  }, [postResponse, postError, pendingCellSavePayload]);

  // Handle notes save response
  useEffect(() => {
    if (!saveNotesResponse && !saveNotesError) return;

    if (saveNotesError) {
      let errorMessage = 'Failed to save notes. Please try again.';
      if (saveNotesError?.message) {
        errorMessage = saveNotesError.message;
      } else if (typeof saveNotesError === 'string') {
        errorMessage = saveNotesError;
      }

      Toast.error({
        message: errorMessage,
      });
    } else if (saveNotesResponse?.status_code === 200) {
      Toast.success({
        message: 'Notes saved successfully!',
      });

      // Update local state immediately
      setRecentlyUpdatedNotes(prev => ({
        ...prev,
        [selectedNotesPlotNumber]: selectedPlotNotes,
      }));

      // DO NOT close the notes view modal - let user close it manually
      // setIsNotesViewVisible(false); // <- REMOVED: Keep modal open

      // Refresh plot list to get updated data from server
      setTimeout(() => {
        getPlotList({pathParams: id, queryParams: `experimentType=${type}`});
      }, 1000);
    } else {
      Toast.error({
        message: saveNotesResponse?.message || 'Failed to save notes',
      });
    }
  }, [
    saveNotesResponse,
    saveNotesError,
    selectedNotesPlotNumber,
    selectedPlotNotes,
    id,
    type,
  ]);

  // Handle trait deletion response
  useEffect(() => {
    if (!deleteTraitResponse && !deleteTraitError) return;
    if (deleteTraitError) {
      const apiErrMsg =
        deleteTraitError?.response?.data?.message ||
        deleteTraitError?.data?.message ||
        deleteTraitError?.message;
      Toast.error({
        message: apiErrMsg || 'Failed to delete value',
      });
      return;
    }
    if (deleteTraitResponse) {
      // Show success message
      const successMsg =
        deleteTraitResponse?.message ||
        deleteTraitResponse?.data?.message ||
        'Value deleted';
      Toast.success({message: successMsg});

      // Close modal
      cellEditModalRef.current?.dismiss();

      // Optimistically update local state so UI reflects removal immediately without waiting for refetch
      if (deleteTarget?.traitName && deleteTarget?.plotNumber) {
        setPlotList(prev =>
          prev.map(p => {
            if (p.plotNumber !== deleteTarget.plotNumber) return p;

            // Remove from recorded traits
            const updatedRecordedTraits =
              p.recordedTraitData?.filter(
                (t: any) => t.traitName !== deleteTarget.traitName,
              ) || [];

            // Update unrecorded traits - ensure the trait exists with cleared value
            let updatedUnrecordedTraits = p.unrecordedTraitData || [];
            const existingUnrecordedIndex = updatedUnrecordedTraits.findIndex(
              (t: any) => t.traitName === deleteTarget.traitName,
            );

            if (existingUnrecordedIndex >= 0) {
              // Update existing unrecorded trait with cleared value
              updatedUnrecordedTraits = updatedUnrecordedTraits.map(
                (t: any, index: number) =>
                  index === existingUnrecordedIndex
                    ? {
                        ...t,
                        value: null,
                        observationId: null,
                      }
                    : t,
              );
            } else {
              // Find trait template from recorded traits to create unrecorded version
              const deletedTrait = p.recordedTraitData?.find(
                (t: any) => t.traitName === deleteTarget.traitName,
              );
              if (deletedTrait) {
                updatedUnrecordedTraits.push({
                  ...deletedTrait,
                  value: null,
                  observationId: null,
                });
              }
            }

            return {
              ...p,
              recordedTraitData: updatedRecordedTraits,
              unrecordedTraitData: updatedUnrecordedTraits,
            };
          }),
        );

        setRecordedData(prev => {
          const arr = prev[deleteTarget.plotNumber] || [];
          return {
            ...prev,
            [deleteTarget.plotNumber]: arr.filter(
              t => t.traitName !== deleteTarget.traitName,
            ),
          };
        });

        if (
          selectedPlot?.plotNumber === deleteTarget.plotNumber &&
          currentTrait === deleteTarget.traitName
        ) {
          setSelectedFixedValue('');
        }

        // Clear the selected cell data if it matches the deleted trait
        if (
          selectedCellData?.plotNumber === deleteTarget.plotNumber &&
          selectedCellData?.traitName === deleteTarget.traitName
        ) {
          setSelectedCellData(prev =>
            prev
              ? {
                  ...prev,
                  value: '', // Clear the value to show "-" in matrix view
                  observationId: null, // Clear observationId
                }
              : null,
          );
        }
      } // Refresh entire plot list to ensure matrix view is updated correctly
      getPlotList({
        pathParams: id,
        queryParams: `experimentType=${type}`,
      });

      // Clear delete target after processing
      setDeleteTarget(null);
    }
  }, [deleteTraitResponse, deleteTraitError]);

  // Handle cell validation response for matrix view
  useEffect(() => {
    // Only proceed if we have a payload waiting to save AND a cell validation response
    if (!pendingCellSavePayload || !cellValidationResponse) return;

    // Support both { data: {...} } and plain {...}
    const validData = cellValidationResponse.data ?? cellValidationResponse;

    // Additional safety check - ensure validation response is valid
    if (!validData || typeof validData !== 'object') {
      // Close the modal
      cellEditModalRef.current?.dismiss();

      Toast.error({
        message: 'Invalid validation response. Please try again.',
      });

      setPendingCellSavePayload(null); // Reset
      return;
    }

    // Enhanced validation check - check multiple possible validation failure indicators
    const hasAnyValidationFailures = (
      Array.isArray(validData.observations) ? validData.observations : []
    ).some((obs: any) => {
      if (!obs.phenotypes || !Array.isArray(obs.phenotypes)) return false;

      return obs.phenotypes.some((p: any) => {
        // Check multiple possible validation failure indicators
        return (
          p.validationStatus === false ||
          p.status === false ||
          p.isValid === false ||
          p.valid === false ||
          (p.validationStatus !== true && p.validationStatus !== undefined)
        );
      });
    });

    // Also check for overall validation status more strictly
    const isOverallValidationFailed =
      validData.overallValidation === false ||
      validData.status === false ||
      validData.isValid === false ||
      validData.valid === false ||
      (validData.overallValidation !== true &&
        validData.overallValidation !== undefined);

    // Only proceed if validation explicitly passes AND no validation failures detected
    if (
      !isOverallValidationFailed &&
      !hasAnyValidationFailures &&
      validData.overallValidation === true
    ) {
      // Data is valid and no validation failures detected, proceed to save

      // Set validation passed flag
      setCellValidationPassed(true);

      postTraits({
        payload: {...pendingCellSavePayload},
        headers: {'Content-Type': 'application/json'},
      });

      // Don't close modal or show success message yet - let postResponse useEffect handle it
      // Don't reset payload yet - let postResponse useEffect handle cleanup

      // Only refresh plot list on successful post (handled in postResponse useEffect)
    } else {
      // Data validation failed or inconclusive - prevent save

      // Set validation failed flag
      setCellValidationPassed(false);

      // Extract detailed errors for cell validation
      const cellErrors = extractValidationErrors(cellValidationResponse);

      if (cellErrors.length > 0) {
        // For single cell validation, show a focused error message
        const primaryError = cellErrors[0];
        const errorMessage =
          primaryError.errorMessage ||
          `Invalid value "${primaryError.value}" for ${primaryError.traitName}`;

        // Close the modal and show error
        cellEditModalRef.current?.dismiss();

        // Show toast with detailed error
        Toast.error({
          message: errorMessage,
        });

        // If multiple errors somehow exist for a single cell operation,
        // log them but only show the first one in toast
        if (cellErrors.length > 1) {
        }

        setPendingCellSavePayload(null); // Reset
        setCellValidationPassed(false); // Reset validation flag
        return;
      }

      // Fallback to original logic if detailed extraction fails
      // Find invalid observations using enhanced logic
      const invalidObservations = (
        Array.isArray(validData.observations) ? validData.observations : []
      ).filter((obs: any) => {
        if (!obs.phenotypes || !Array.isArray(obs.phenotypes)) return false;

        return obs.phenotypes.some(
          (p: any) =>
            p.validationStatus === false ||
            p.status === false ||
            p.isValid === false ||
            p.valid === false ||
            (p.validationStatus !== true && p.validationStatus !== undefined),
        );
      });

      let errorMessage = `Invalid value for ${selectedCellData?.traitName}`;

      if (invalidObservations.length > 0) {
        const observation = invalidObservations[0];
        const failedPhenotype = observation.phenotypes?.find(
          (p: any) =>
            p.validationStatus === false ||
            p.status === false ||
            p.isValid === false ||
            p.valid === false ||
            (p.validationStatus !== true && p.validationStatus !== undefined),
        );

        // Try multiple sources for error message
        errorMessage =
          failedPhenotype?.validationMessage ||
          failedPhenotype?.message ||
          failedPhenotype?.error ||
          observation?.validationMessage ||
          observation?.message ||
          observation?.error ||
          validData.message ||
          validData.error ||
          `Invalid value for ${selectedCellData?.traitName}`;
      } else if (validData.message) {
        // Fallback to top-level message if available
        errorMessage = validData.message;
      }

      // Close the modal
      cellEditModalRef.current?.dismiss();

      // Show validation error
      Toast.error({
        message: errorMessage,
      });

      setPendingCellSavePayload(null); // Reset
      setCellValidationPassed(false); // Reset validation flag
    }
  }, [
    cellValidationResponse,
    selectedCellData?.traitName,
    pendingCellSavePayload,
  ]);

  // Handle cell validation errors for matrix view
  useEffect(() => {
    if (!cellValidationError || !pendingCellSavePayload) return;

    // Close the modal
    cellEditModalRef.current?.dismiss();

    // Show error message
    const errorMessage =
      cellValidationError?.response?.data?.message ||
      cellValidationError?.message ||
      'Validation failed. Please check your connection and try again.';

    Toast.error({
      message: errorMessage,
    });

    setPendingCellSavePayload(null); // Reset
  }, [cellValidationError]);

  // Handle single plot response for cell-specific refresh
  useEffect(() => {
    if (!singlePlotData || !refreshingCell) return;

    if (singlePlotData?.status_code === 200 && singlePlotData.data) {
      const plotData = singlePlotData.data.plotData;

      if (plotData && plotData.length > 0) {
        // Find the specific plot we need to update
        const updatedPlot = plotData.find(
          (plot: any) => plot.plotNumber === refreshingCell.plotNumber,
        );

        if (updatedPlot) {
          // Find the specific trait value that was updated
          const updatedTrait = updatedPlot.recordedTraitData?.find(
            (trait: any) => trait.traitName === refreshingCell.traitName,
          );

          // Update the plot list with only the specific plot data
          setPlotList(currentPlots => {
            return currentPlots.map(plot => {
              if (plot.plotNumber === refreshingCell.plotNumber) {
                return {
                  ...plot,
                  ...updatedPlot, // Update with fresh data
                };
              }
              return plot;
            });
          });

          // Update selected plot if it's the one being refreshed
          if (selectedPlot?.plotNumber === refreshingCell.plotNumber) {
            setSelectedPlot((currentSelected: any) =>
              currentSelected
                ? {...currentSelected, ...updatedPlot}
                : currentSelected,
            );
          }

          // Update recorded data with fresh trait values for this plot only
          setRecordedData(prev => {
            const updatedRecordedData = {...prev};
            const recordedTraits =
              updatedPlot.recordedTraitData?.map((trait: any) => ({
                traitName: trait.traitName,
                dataType: trait.dataType,
                value: trait.value,
                traitId: trait.traitId,
              })) || [];

            updatedRecordedData[refreshingCell.plotNumber] = recordedTraits;

            return updatedRecordedData;
          });
        } else {
        }
      }
    } else {
    }

    // Clear refreshing state
    setRefreshingCell(null);
  }, [singlePlotData, singlePlotError, refreshingCell]);

  // Handle single plot error for cell-specific refresh
  useEffect(() => {
    if (!singlePlotError || !refreshingCell) return;

    // Clear refreshing state on error
    setRefreshingCell(null);
  }, [singlePlotError, refreshingCell]);

  useEffect(() => {
    if (currentTraitData?.dataType === 'date') {
      setIsCalendarVisible(true);
    }
  }, [currentTraitData?.dataType]);

  // whenever the selected plot, trait or recorded data changes, if it's a date trait
  // re-hydrate the calendar to the value we saved (or don't pre-select any date)
  useEffect(() => {
    if (currentTraitData?.dataType === 'date' && selectedPlot) {
      const existingEntry = recordedData[selectedPlot.plotNumber]?.find(
        t => t.traitName === currentTrait && t.dataType === 'date',
      )?.value;

      if (existingEntry) {
        // Use parseToDayjs to properly handle DD/MM/YYYY format
        const savedDateDayjs = parseToDayjs(existingEntry);
        if (savedDateDayjs && savedDateDayjs.isValid()) {
          const savedDate = savedDateDayjs.toDate();
          setSelectedDate(savedDate);
        } else {
          setSelectedDate(null); // Invalid saved date, don't pre-select
        }
      } else {
        // Check if there's a previously recorded value from the plot data
        const recordedTrait = selectedPlot.recordedTraitData?.find(
          (t: TraitData) =>
            t.traitName === currentTrait && t.dataType === 'date',
        );

        if (recordedTrait?.value) {
          // Use parseToDayjs to properly handle DD/MM/YYYY format
          const serverDateDayjs = parseToDayjs(recordedTrait.value);
          if (serverDateDayjs && serverDateDayjs.isValid()) {
            const serverDate = serverDateDayjs.toDate();
            setSelectedDate(serverDate);
          } else {
            setSelectedDate(null); // Invalid server date, don't pre-select
          }
        } else {
          // No existing data, don't pre-select any date
          setSelectedDate(null);
        }
      }
    }
  }, [selectedPlot, currentTrait, recordedData, currentTraitData]);

  // ── Handle Individual Plants Data API Response ────────────────────────────────
  useEffect(() => {
    // Only process if we have a valid response
    if (
      !individualPlantsResponse?.status_code ||
      individualPlantsResponse.status_code !== 200
    ) {
      return;
    }

    // Critical: Only process if we're still on the same plot and trait that triggered the request
    // This prevents data from one plot appearing on another plot
    if (!selectedPlot || !currentTrait) {
      setPlantsData([]); // Empty array = no data for this plot/trait
      setTotalPlants(0);
      return;
    }

    const dataResp = individualPlantsResponse.data;
    const plots = dataResp.plotData || [];

    // Find the EXACT plot that matches the current selected plot
    const currentPlotData = plots.find(
      (p: any) => p.plotNumber === selectedPlot.plotNumber,
    );

    // If plot not found OR trait is not float, clear data and exit
    if (!currentPlotData || currentTraitData?.dataType !== 'float') {
      setPlantsData([]); // Empty array = no data for this plot/trait
      setTotalPlants(0);
      return;
    }

    // Find the EXACT trait data for the current trait
    const traitData = currentPlotData.recordedTraitData?.find(
      (t: any) => t.traitName === currentTrait,
    );

    // If trait not found, clear data
    if (!traitData) {
      setPlantsData([]); // Empty array = no data for this plot/trait
      setTotalPlants(0);
      return;
    }

    // Handle individual_plants_data
    if (traitData.individual_plants_data) {
      const plantsDataFromApi = traitData.individual_plants_data;

      // Check if it's a valid array with data
      if (Array.isArray(plantsDataFromApi) && plantsDataFromApi.length > 0) {
        const transformedPlants = plantsDataFromApi.map(
          (plant: any, index: number) => ({
            id: `plant_${index + 1}`,
            name: plant.name ? String(plant.name) : '',
            value:
              plant.value !== null && plant.value !== undefined
                ? String(plant.value)
                : '',
            x: plant.x !== null && plant.x !== undefined ? String(plant.x) : '',
            y: plant.y !== null && plant.y !== undefined ? String(plant.y) : '',
          }),
        );

        // Set the transformed plants data
        setPlantsData(transformedPlants);
        setTotalPlants(transformedPlants.length);
      } else {
        // Empty object {} or empty array [] - no data saved for this plot/trait
        setPlantsData([]); // Empty array = no data for this plot/trait
        setTotalPlants(0);
      }
    } else {
      // No individual_plants_data key - no data for this plot/trait
      setPlantsData([]); // Empty array = no data for this plot/trait
      setTotalPlants(0);
    }
  }, [individualPlantsResponse, selectedPlot, currentTrait, currentTraitData]);

  // Clear plants data when plot or trait changes while component is expanded
  useEffect(() => {
    if (isIndividualPlantsExpanded) {
      // Set to null to indicate loading state when plot/trait changes
      setPlantsData(null);

      // If conditions are met, fetch new data
      if (
        id &&
        type &&
        selectedPlot &&
        currentTrait &&
        networkIsConnected !== false
      ) {
        const queryParams = `experimentType=${type}&individualData=True`;
        getIndividualPlantsData({pathParams: id, queryParams});
      }
    }
  }, [selectedPlot?.plotNumber, currentTrait]);

  useEffect(() => {
    // whenever AddImage pushes back with a new imageUrl,
    // re-fetch the list so that plotData.imageUrls is up-to-date
    if (route.params.imageUrl) {
      getPlotList({pathParams: id, queryParams: `experimentType=${type}`});

      // Clear the imageUrl from route params to prevent re-triggering
      navigation.setParams({imageUrl: undefined});
    }
  }, [route.params.imageUrl]);

  // ── Validation Error Modal Handlers ──────────────────────────────────────────
  const handleValidationErrorModalClose = () => {
    setIsValidationErrorModalVisible(false);
    setValidationErrors([]);
  };

  const handleValidationErrorPlotSelect = (
    plotNumber: string,
    traitName: string,
  ) => {
    // Find and select the plot
    const targetPlot = plotList.find(p => p.plotNumber === plotNumber);
    if (targetPlot) {
      selectPlot(targetPlot);

      // Set the trait if it exists in the plot's trait list
      const allTraitNames = [
        ...(targetPlot.recordedTraitData?.map((t: any) => t.traitName) || []),
        ...(targetPlot.unrecordedTraitData?.map((t: any) => t.traitName) || []),
        'Image',
        'Notes',
      ];

      if (allTraitNames.includes(traitName)) {
        setCurrentTrait(traitName);
      }

      // Also switch to plot view if currently in matrix view
      if ((viewMode as string) === 'matrix') {
        setViewMode('plot');
      }
    }

    // Close the validation error modal
    handleValidationErrorModalClose();
  };

  const handleRetryAllValidationErrors = () => {
    handleValidationErrorModalClose();
    // Trigger save again which will re-validate
    handleSaveAll();
  };

  return (
    <SafeAreaView edges={['top']} style={{flex: 1}}>
      <StatusBar />
      {/* wrap everything so the keyboard pushes content up */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        {/* ─── HEADER: back, save and map icon ─── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 18,
            height: 60,
          }}>
          {/* Back button */}
          <Pressable
            style={styles.backIconContainer}
            onPress={navigation.goBack}>
            <Back />
          </Pressable>

          {/* Save + Map container */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <Button
              title="Save"
              onPress={handleSaveAll}
              disabled={!hasUnsavedChanges || isPosting || isValidating}
              loading={isPosting || isValidating}
              containerStyle={{
                width: 80,
                height: 36,
                opacity:
                  !hasUnsavedChanges || isPosting || isValidating ? 0.5 : 1,
              }}
            />
            {/* ✅ Conditionally render MapIcon - hide when coming from NewRecord flow */}
            {!fromNewRecord && (
              <Pressable
                onPress={openMapModal}
                style={{
                  width: 36,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MapIcon width={24} height={24} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Offline Mode Banner */}
        {networkIsConnected === false && (
          <View
            style={{
              backgroundColor: '#FF8C00',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              📱 Offline Mode: Using cached data
            </Text>
          </View>
        )}

        {shouldShowSkeleton ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 32}}>
            <PlotsSkeleton />
          </ScrollView>
        ) : isPlotListLoading || (!plotListData && !plotListError) ? (
          <View
            style={[
              styles.container,
              {justifyContent: 'center', alignItems: 'center'},
            ]}>
            <Loader />
          </View>
        ) : plotListError || plotListData?.status_code !== 200 ? (
          <View
            style={[
              styles.container,
              {
                justifyContent: 'center',
                alignItems: 'center',
                padding: 24,
                margin: 16,
                backgroundColor: '#fffbe6',
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              },
            ]}>
            {/* Big, friendly headline */}
            <Text
              style={{
                fontSize: 28,
                marginBottom: 8,
                color: '#333',
                fontFamily: FONTS.MEDIUM,
              }}>
              😵‍💫 Oops!
            </Text>

            {/* Playful subheading */}
            <Text
              style={{
                fontSize: 18,
                marginBottom: 12,
                textAlign: 'center',
                color: '#555',
              }}>
              {/* {plotListError?.message ||
                plotListData?.message ||
                "Something's not right on our end."} */}
              There was an error while trying to load the plots of the
              experiment
            </Text>

            {/* Catchy retry button */}
            <Button
              title="Refresh"
              onPress={() =>
                getPlotList({
                  pathParams: id,
                  queryParams: `experimentType=${type}`,
                })
              }
              containerStyle={{
                paddingHorizontal: 32,
                paddingVertical: 8,
                borderRadius: 24,
                backgroundColor: '#1976D2',
              }}
            />
          </View>
        ) : (
          // Plot View, Matrix View & Agronomy View - All share the same container with tabs
          <ScrollView>
            <View style={[styles.container]}>
              <View style={styles.plotContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    paddingVertical: 6,
                  }}>
                  {details?.trialLocationId && (
                    <Text style={styles.fieldTitle}>
                      {t(LOCALES.EXPERIMENT.LBL_FIELD)} {details.fieldLabel}
                    </Text>
                  )}
                </View>
                {details.fieldExperimentName && details.cropName && (
                  <View style={styles.row}>
                    <Text style={styles.experimentTitle}>
                      {details?.fieldExperimentName} ({type})
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.rowContainer}>
                      {details?.cropName && (
                        <View style={styles.cropTitleContainer}>
                          <Text style={styles.cropTitle}>
                            {details?.cropName}
                          </Text>
                        </View>
                      )}
                      {data?.projectId && (
                        <View
                          style={[
                            styles.cropTitleContainer,
                            {backgroundColor: '#e8f0fb'},
                          ]}>
                          <Text style={styles.cropTitle}>
                            {data?.projectId}
                          </Text>
                        </View>
                      )}
                      {data?.season && (
                        <View
                          style={[
                            styles.cropTitleContainer,
                            {backgroundColor: '#fdf8ee'},
                          ]}>
                          <Text style={styles.cropTitle}>{data?.season}</Text>
                        </View>
                      )}
                      {data?.designType && !isLineExperiment(type) && (
                        <View
                          style={[
                            styles.cropTitleContainer,
                            {backgroundColor: '#fcebea'},
                          ]}>
                          <Text style={styles.cropTitle}>
                            {data?.designType}
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
                {/* Tab Bar Slider */}
                <View style={[styles.tabBarContainer, {width: '100%'}]}>
                  <View style={styles.tabBarBackground}>
                    <Pressable
                      style={[
                        styles.tabButton,
                        (viewMode as string) === 'plot' &&
                          styles.tabButtonActive,
                      ]}
                      onPress={() => {
                        setViewMode('plot');
                        setIsMatrixViewLoading(false);
                      }}>
                      <Text
                        style={[
                          styles.tabButtonText,
                          (viewMode as string) === 'plot' &&
                            styles.tabButtonTextActive,
                        ]}>
                        Plot
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.tabButton,
                        viewMode === 'matrix' && styles.tabButtonActive,
                      ]}
                      onPress={() => {
                        if (viewMode !== 'matrix') {
                          setIsMatrixViewLoading(true);
                          setViewMode('matrix');
                          // Use setTimeout to allow the heavy matrix rendering before clearing loader
                          setTimeout(() => {
                            setIsMatrixViewLoading(false);
                          }, 500);
                        }
                      }}>
                      <Text
                        style={[
                          styles.tabButtonText,
                          viewMode === 'matrix' && styles.tabButtonTextActive,
                        ]}>
                        Matrix
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.tabButton,
                        (viewMode as string) === 'agronomy' &&
                          styles.tabButtonActive,
                      ]}
                      onPress={() => {
                        setViewMode('agronomy');
                        setIsMatrixViewLoading(false);
                      }}>
                      <Text
                        style={[
                          styles.tabButtonText,
                          (viewMode as string) === 'agronomy' &&
                            styles.tabButtonTextActive,
                        ]}>
                        Agronomy
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              {(viewMode as string) === 'plot' ? (
                <View style={{gap: 8}}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: '#ddd',
                      // paddingTop: 8,
                      display: isIndividualPlantsExpanded ? 'none' : 'flex',
                    }}>
                    <PlotNavigator
                      row={selectedPlot?.row ?? 0}
                      col={selectedPlot?.column ?? 0}
                      plotCode={selectedPlot?.plotNumber || ''}
                      onPrev={handlePrevPlot}
                      onNext={handleNextPlot}
                      onPressNavigator={openPlotModal}
                    />
                  </View>

                  <View
                    style={{
                      display: isIndividualPlantsExpanded ? 'none' : 'flex',
                    }}>
                    <TraitDisplay
                      traitName={
                        currentTrait === 'Image' ||
                        currentTrait === 'Notes' ||
                        currentTrait === 'Voice Note'
                          ? // just show the literal (with count for Voice Note)
                            currentTrait === 'Voice Note' &&
                            Array.isArray(selectedPlot?.voiceNote) &&
                            selectedPlot.voiceNote.length > 0
                            ? `${currentTrait} (${selectedPlot.voiceNote.length}/3)`
                            : currentTrait
                          : // otherwise show userDefiend → uom → " – " + trait
                            `${currentTraitData?.userDefiend ?? ''}` +
                            (currentTraitData?.traitUom
                              ? ` (${currentTraitData.traitUom})`
                              : '') +
                            ` – ${currentTrait}`
                      }
                      onPrev={handlePrevTrait}
                      onNext={handleNextTrait}
                      onTraitPress={openTraitModal}
                    />
                  </View>
                  {/* Protocol Information Display */}
                  {(() => {
                    // Extract protocol data from the first available trait (they all have the same protocol info)
                    const getProtocolDataFromTraits = () => {
                      // Check recorded traits first
                      if (
                        selectedPlot?.recordedTraitData &&
                        selectedPlot.recordedTraitData.length > 0
                      ) {
                        const firstTrait = selectedPlot.recordedTraitData[0];
                        return {
                          stageName: firstTrait.stageName,
                          dateOfSowing: firstTrait.dateOfSowing,
                          dueDate: firstTrait.dueDate,
                        };
                      }

                      // Check unrecorded traits if no recorded traits
                      if (
                        selectedPlot?.unrecordedTraitData &&
                        selectedPlot.unrecordedTraitData.length > 0
                      ) {
                        const firstTrait = selectedPlot.unrecordedTraitData[0];
                        return {
                          stageName: firstTrait.stageName,
                          dateOfSowing: firstTrait.dateOfSowing,
                          dueDate: firstTrait.dueDate,
                        };
                      }

                      // Fallback to direct plot fields (in case API structure changes)
                      return {
                        stageName: selectedPlot?.stageName,
                        dateOfSowing: selectedPlot?.dateOfSowing,
                        dueDate: selectedPlot?.dueDate,
                      };
                    };

                    const protocolData = getProtocolDataFromTraits();
                    const {stageName, dateOfSowing, dueDate} = protocolData;

                    // Debug log to see protocol data extraction

                    return (
                      <ProtocolInfo
                        stageName={stageName}
                        dateOfSowing={dateOfSowing}
                        dueDate={dueDate}
                      />
                    );
                  })()}
                </View>
              ) : (viewMode as string) === 'matrix' ? (
                // Matrix View - Table Format
                <View style={styles.matrixContainer}>
                  {/* Matrix Title */}
                  <View
                    style={[
                      styles.matrixTitleContainer,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      },
                    ]}>
                    <Text style={styles.matrixTitle}>Data Matrix</Text>
                    <Text style={{fontSize: 12, color: '#999'}}>
                      Tap Cell to edit . Scroll right →
                    </Text>
                  </View>

                  {isMatrixViewLoading ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 100,
                      }}>
                      <Loader />
                      <Text
                        style={{
                          marginTop: 16,
                          fontSize: 14,
                          color: '#666',
                          textAlign: 'center',
                        }}>
                        Loading matrix data...
                      </Text>
                    </View>
                  ) : plotList.length > 0 ? (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={styles.tableContainer}>
                      <View style={styles.tableContent}>
                        {/* Fixed Columns Section */}
                        <View style={styles.fixedColumnsSection}>
                          {/* Fixed Header */}
                          <View style={styles.fixedHeader}>
                            <View style={styles.fixedHeaderCell}>
                              <Text style={styles.headerText}>Plots</Text>
                            </View>
                            <View style={styles.fixedHeaderCell}>
                              <Text style={styles.headerText}>Loc</Text>
                            </View>
                          </View>

                          {/* Fixed Body */}
                          {plotList.map((plot: any, plotIndex: number) => (
                            <View key={plotIndex} style={styles.fixedRow}>
                              <View style={styles.fixedCell}>
                                {(() => {
                                  const accessionIdValue =
                                    resolveAccessionId(plot);
                                  if (
                                    canViewAccessionId &&
                                    accessionIdValue != null
                                  ) {
                                    return (
                                      <Text
                                        style={[
                                          styles.cellText,
                                          {
                                            fontSize: 10,
                                            color: '#666',
                                            marginBottom: 2,
                                          },
                                        ]}>
                                        ({accessionIdValue})
                                      </Text>
                                    );
                                  }
                                  return null;
                                })()}
                                <Text style={styles.cellText}>
                                  {plot.plotNumber}
                                </Text>
                              </View>
                              <View style={styles.fixedCell}>
                                <Text style={styles.cellText}>
                                  R{plot.row} C{plot.column}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>

                        {/* Scrollable Columns Section */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.scrollableSection}>
                          <View style={styles.scrollableContent}>
                            {/* Scrollable Header */}
                            <View style={styles.scrollableHeader}>
                              {(() => {
                                // Get all unique traits across all plots
                                const traits = getAllUniqueTraits;
                                return traits.map(
                                  (trait: any, index: number) => (
                                    <View key={index} style={styles.headerCell}>
                                      <Text
                                        style={styles.headerText}
                                        numberOfLines={2}>
                                        {trait.userDefiend || trait.traitName}
                                      </Text>
                                      {trait.traitUom && (
                                        <Text style={styles.headerUnitText}>
                                          ({trait.traitUom})
                                        </Text>
                                      )}
                                    </View>
                                  ),
                                );
                              })()}
                              {/* Additional static columns */}
                              <View style={styles.headerCell}>
                                <Text
                                  style={styles.headerText}
                                  numberOfLines={2}>
                                  Notes
                                </Text>
                              </View>
                              <View style={styles.headerCell}>
                                <Text
                                  style={styles.headerText}
                                  numberOfLines={2}>
                                  Images
                                </Text>
                              </View>
                              <View style={styles.headerCell}>
                                <Text
                                  style={styles.headerText}
                                  numberOfLines={2}>
                                  Voice Notes
                                </Text>
                              </View>
                            </View>

                            {/* Scrollable Body */}
                            {plotList.map((plot: any, plotIndex: number) => (
                              <View key={plotIndex} style={styles.tableRow}>
                                {(() => {
                                  // Get all unique traits and find data for each
                                  const traits = getAllUniqueTraits;
                                  return traits.map(
                                    (
                                      traitTemplate: any,
                                      traitIndex: number,
                                    ) => {
                                      // Get actual trait data for this plot
                                      const trait = getTraitDataForPlot(
                                        plot,
                                        traitTemplate.traitName,
                                      );

                                      return (
                                        <Pressable
                                          key={traitIndex}
                                          style={styles.cell}
                                          onPress={() =>
                                            handleCellPress(plot, trait)
                                          }>
                                          {refreshingCell &&
                                          refreshingCell.plotNumber ===
                                            plot.plotNumber &&
                                          refreshingCell.traitName ===
                                            trait.traitName ? (
                                            // Show loader for the specific cell being refreshed
                                            <View
                                              style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flex: 1,
                                              }}>
                                              <Loader size={16} />
                                            </View>
                                          ) : (
                                            <Text
                                              style={[
                                                styles.cellText,
                                                trait.value
                                                  ? styles.cellTextWithValue
                                                  : styles.cellTextEmpty,
                                              ]}>
                                              {trait.dataType === 'date' &&
                                              trait.value
                                                ? (() => {
                                                    // Use the same robust date parsing logic
                                                    const d = parseToDayjs(
                                                      trait.value,
                                                    );
                                                    return d && d.isValid()
                                                      ? d.format('DD/MM/YYYY')
                                                      : trait.value;
                                                  })()
                                                : trait.value || '-'}
                                            </Text>
                                          )}
                                        </Pressable>
                                      );
                                    },
                                  );
                                })()}
                                {/* Notes column cell */}
                                <Pressable
                                  style={[
                                    styles.cell,
                                    {
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      paddingHorizontal: 4,
                                    },
                                  ]}
                                  onPress={() => {
                                    // Check if plot has notes, then open notes view
                                    const hasNotes =
                                      (plot.notes && plot.notes.trim()) ||
                                      recentlyUpdatedNotes[plot.plotNumber];
                                    if (hasNotes) {
                                      openNotesView(plot);
                                    } else {
                                      // Show toaster message if no notes available
                                      Toast.error({
                                        message: `No notes available for Plot ${plot.plotNumber}`,
                                      });
                                    }
                                  }}>
                                  {(() => {
                                    // Check if plot has notes (either saved or recently updated)
                                    const hasNotes =
                                      (plot.notes && plot.notes.trim()) ||
                                      recentlyUpdatedNotes[plot.plotNumber];

                                    if (hasNotes) {
                                      // Show icon and text when notes exist
                                      return (
                                        <>
                                          <MatrixNote width={18} height={18} />
                                          <Text
                                            style={[
                                              styles.cellText,
                                              styles.cellTextWithValue,
                                              {marginLeft: 4},
                                            ]}
                                            numberOfLines={1}>
                                            {plot.notes && plot.notes.trim()
                                              ? plot.notes.length > 10
                                                ? plot.notes.substring(0, 10) +
                                                  '…'
                                                : plot.notes
                                              : recentlyUpdatedNotes[
                                                  plot.plotNumber
                                                ]?.length > 10
                                              ? recentlyUpdatedNotes[
                                                  plot.plotNumber
                                                ].substring(0, 10) + '…'
                                              : recentlyUpdatedNotes[
                                                  plot.plotNumber
                                                ]}
                                          </Text>
                                        </>
                                      );
                                    } else {
                                      // Show dash when no notes
                                      return (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            styles.cellTextEmpty,
                                          ]}>
                                          -
                                        </Text>
                                      );
                                    }
                                  })()}
                                </Pressable>
                                {/* Images column cell */}
                                <Pressable
                                  style={[
                                    styles.cell,
                                    {
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      paddingHorizontal: 4,
                                    },
                                  ]}
                                  onPress={() => {
                                    // Prevent image viewing in offline mode
                                    if (!networkIsConnected) {
                                      Toast.error({
                                        message:
                                          'Images are not available in offline mode. Connect to internet to view images.',
                                      });
                                      return;
                                    }

                                    // Check if plot has images, then open carousel
                                    if (
                                      plot.imageUrls &&
                                      plot.imageUrls.length > 0
                                    ) {
                                      openImageCarousel(plot, 0);
                                    } else {
                                      // Show toaster message if no images available
                                      Toast.error({
                                        message: `No images available for Plot ${plot.plotNumber}`,
                                      });
                                    }
                                  }}>
                                  {(() => {
                                    // Show offline indicator when device is offline
                                    if (!networkIsConnected) {
                                      return (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            styles.cellTextEmpty,
                                            {color: '#999'},
                                          ]}>
                                          📱
                                        </Text>
                                      );
                                    }

                                    // Check if plot has images
                                    const hasImages =
                                      Array.isArray(plot.imageUrls) &&
                                      plot.imageUrls.length > 0;

                                    if (hasImages) {
                                      // Show icon and count when images exist
                                      return (
                                        <>
                                          <Attachment width={20} height={20} />
                                          <Text
                                            style={[
                                              styles.cellText,
                                              styles.cellTextWithValue,
                                              {marginLeft: 4},
                                            ]}
                                            numberOfLines={1}>
                                            {String(plot.imageUrls.length)}
                                          </Text>
                                        </>
                                      );
                                    } else {
                                      // Show dash when no images
                                      return (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            styles.cellTextEmpty,
                                          ]}>
                                          -
                                        </Text>
                                      );
                                    }
                                  })()}
                                </Pressable>
                                {/* Voice Notes column cell */}
                                <Pressable
                                  style={[
                                    styles.cell,
                                    {
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      paddingHorizontal: 4,
                                    },
                                  ]}
                                  onPress={() => {
                                    // Prevent voice note viewing in offline mode
                                    if (!networkIsConnected) {
                                      Toast.error({
                                        message:
                                          'Voice Notes are not available in offline mode. Connect to internet to play voice notes.',
                                      });
                                      return;
                                    }

                                    // Check if plot has voice notes, then open player
                                    const voiceNotes =
                                      plot.audioUrls || plot.voiceNote;
                                    if (
                                      voiceNotes &&
                                      Array.isArray(voiceNotes) &&
                                      voiceNotes.length > 0
                                    ) {
                                      openVoiceNotePlayer(plot, 0);
                                    } else {
                                      // Show toaster message if no voice notes available
                                      Toast.error({
                                        message: `No voice notes available for Plot ${plot.plotNumber}`,
                                      });
                                    }
                                  }}>
                                  {(() => {
                                    // Show offline indicator when device is offline
                                    if (!networkIsConnected) {
                                      return (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            styles.cellTextEmpty,
                                            {color: '#999'},
                                          ]}>
                                          📱
                                        </Text>
                                      );
                                    }

                                    // Check if plot has voice notes (support both formats)
                                    const voiceNotes =
                                      plot.audioUrls || plot.voiceNote;
                                    const hasVoiceNotes =
                                      Array.isArray(voiceNotes) &&
                                      voiceNotes.length > 0;

                                    if (hasVoiceNotes) {
                                      // Show attachment icon and count when voice notes exist (matching Images column style)
                                      return (
                                        <>
                                          <Attachment width={20} height={20} />
                                          <Text
                                            style={[
                                              styles.cellText,
                                              styles.cellTextWithValue,
                                              {marginLeft: 4},
                                            ]}
                                            numberOfLines={1}>
                                            {String(voiceNotes.length)}
                                          </Text>
                                        </>
                                      );
                                    } else {
                                      // Show dash when no voice notes
                                      return (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            styles.cellTextEmpty,
                                          ]}>
                                          -
                                        </Text>
                                      );
                                    }
                                  })()}
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 100,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#666',
                          textAlign: 'center',
                        }}>
                        No plot data available
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                // Agronomy Protocol View
                <AgronomyProtocol
                  experimentID={experimentID}
                  locationID={locationID}
                  cropId={details.cropId}
                />
              )}

              {(viewMode as string) === 'plot' && (
                <>
                  {/* only show the numeric/text InputField for all traits except Image, Notes and Voice Note */}
                  {!['Image', 'Notes', 'Voice Note'].includes(currentTrait) &&
                    (isPlotListLoading ? (
                      <View
                        style={{
                          height: 50,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Loader />
                      </View>
                    ) : (
                      <InputField
                        value={(() => {
                          // If we have a plants average value (real-time or saved), display it
                          if (plantsAverageValue !== null) {
                            return plantsAverageValue.toString();
                          }

                          const traitValue =
                            recordedData[selectedPlot?.plotNumber]?.find(
                              (trait: TraitData) =>
                                trait.traitName === currentTrait,
                            )?.value || '';

                          // For date traits, convert DD/MM/YYYY string back to Date object for InputField
                          if (
                            currentTraitData?.dataType === 'date' &&
                            traitValue
                          ) {
                            const parsedDate = parseToDayjs(traitValue);
                            if (parsedDate && parsedDate.isValid()) {
                              return parsedDate.toDate();
                            }
                            return null; // Return null for invalid dates
                          }

                          return traitValue;
                        })()}
                        dataType={currentTraitData?.dataType as any}
                        decimals={2}
                      />
                    ))}

                  <View
                    style={{
                      display: isIndividualPlantsExpanded ? 'none' : 'flex',
                    }}>
                    <KeyboardAvoidingView
                      style={{}}
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}>
                      {currentTrait === 'Notes' ? (
                        <>
                          <NotesModal
                            isModalVisible={isNotesModalVisible}
                            preNotes={
                              // Use the same priority logic as the display: recent note first, then server note
                              recentlyUpdatedNotes[selectedPlot?.plotNumber] ||
                              selectedPlot?.notes ||
                              draftNote
                            }
                            closeModal={() => setIsNotesModalVisible(false)}
                            onDiscard={() => {
                              // only close, no trait change
                              setIsNotesModalVisible(false);
                            }}
                            onSave={async (text: string) => {
                              setIsNotesModalVisible(false);
                              setNoteUpdateInProgress(true);

                              // Track this note update to preserve during refresh
                              setRecentlyUpdatedNotes(prev => {
                                const updated = {
                                  ...prev,
                                  [selectedPlot.plotNumber]: text,
                                };
                                // Save to AsyncStorage for persistence across navigation
                                saveRecentlyUpdatedNotesToStorage(updated);
                                return updated;
                              });

                              // update local state
                              setPlotList(pls => {
                                const updated = pls.map(p =>
                                  p.plotNumber === selectedPlot.plotNumber
                                    ? {...p, notes: text}
                                    : p,
                                );
                                return updated;
                              });

                              setSelectedPlot((sp: PlotData | null) => {
                                const updated = sp
                                  ? {...sp, notes: text}
                                  : null;
                                return updated;
                              });
                              const locationData = await validateLocationForAPI(
                                true,
                                true,
                              );
                              if (!locationData) {
                                throw new Error('Location unavailable');
                              }

                              const {latitude, longitude} = locationData;
                              const date = formatDateTime(new Date());

                              const notesPayload = {
                                experimentType: type,
                                fieldExperimentId: Number(
                                  details.fieldExperimentId,
                                ),
                                observations: [
                                  {
                                    plotNumber: selectedPlot.plotNumber,
                                    plotId: selectedPlot.id,
                                    date,
                                    lat: latitude,
                                    long: longitude,
                                    notes: text,
                                    applications: null,
                                    phenotypes: [],
                                  },
                                ],
                              };

                              try {
                                await postTraits({
                                  payload: notesPayload,
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                });
                              } catch (error) {
                                setNoteUpdateInProgress(false);
                                // Remove from recently updated notes on failure
                                setRecentlyUpdatedNotes(prev => {
                                  const updated = {...prev};
                                  delete updated[selectedPlot.plotNumber];
                                  // Update AsyncStorage to reflect the removal
                                  saveRecentlyUpdatedNotesToStorage(updated);
                                  return updated;
                                });
                              }
                            }}
                          />
                          {selectedPlot?.notes ||
                          recentlyUpdatedNotes[selectedPlot?.plotNumber] ? (
                            <View
                              style={{
                                width: '100%',
                                backgroundColor: '#f9f9f9',
                                borderRadius: 12,
                                padding: 16,
                                marginVertical: 16,
                              }}>
                              {/* existing note text */}
                              <Text
                                style={{
                                  fontFamily: FONTS.MEDIUM,
                                  fontSize: 16,
                                  color: '#333',
                                  marginBottom: 12,
                                }}>
                                {(() => {
                                  const displayNote =
                                    recentlyUpdatedNotes[
                                      selectedPlot.plotNumber
                                    ] || selectedPlot.notes;
                                  return displayNote;
                                })()}
                              </Text>

                              {/* Debug note display */}
                              {/* {__DEV__ && (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: '#666',
                                    marginBottom: 8,
                                  }}>
                                  🔍 Debug: Plot {selectedPlot.plotNumber} -
                                  Note: "{selectedPlot.notes.substring(0, 50)}
                                  ..."{' '}
                                  {noteUpdateInProgress &&
                                    ' [UPDATE IN PROGRESS]'}
                                </Text>
                              )} */}

                              {/* smaller "Edit Note" button */}
                              <Pressable
                                onPress={() => {
                                  // Use recent note if available, otherwise use selectedPlot.notes
                                  const noteToEdit =
                                    recentlyUpdatedNotes[
                                      selectedPlot.plotNumber
                                    ] || selectedPlot.notes;

                                  setDraftNote(noteToEdit);
                                  setIsNotesModalVisible(true);
                                }}
                                style={{
                                  alignSelf: 'flex-start',
                                  backgroundColor: '#1976D2',
                                  borderRadius: 8,
                                  paddingVertical: 8,
                                  paddingHorizontal: 16,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: FONTS.MEDIUM,
                                    fontSize: 14,
                                    color: '#fff',
                                  }}>
                                  {t(LOCALES.EXPERIMENT.LBL_EDIT_NOTE)}
                                </Text>
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              onPress={() => {
                                setDraftNote('');
                                setIsNotesModalVisible(true);
                              }}
                              style={{
                                width: '80%',
                                height: 200,
                                alignSelf: 'center',
                                borderWidth: 1,
                                borderColor: '#ddd',
                                borderRadius: 8,
                                backgroundColor: '#f9f9f9',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginVertical: 16,
                              }}>
                              <Text
                                style={{
                                  fontFamily: FONTS.MEDIUM,
                                  fontSize: 16,
                                  color: '#333',
                                }}>
                                {t(LOCALES.EXPERIMENT.LBL_ADD_NOTES)}
                              </Text>
                            </Pressable>
                          )}
                        </>
                      ) : currentTrait === 'Image' ? (
                        <>
                          {/** pull URLs out of the selected plot */}
                          {(() => {
                            const urls = selectedPlot?.imageUrls ?? [];

                            // Additional debugging to check for shared references

                            // Check if this plot's images are the same as other plots (potential reference issue)
                            const otherPlotsWithSameImages = plotList.filter(
                              plot =>
                                plot.plotNumber !== selectedPlot?.plotNumber &&
                                JSON.stringify(plot.imageUrls) ===
                                  JSON.stringify(urls),
                            );

                            if (otherPlotsWithSameImages.length > 0) {
                            }

                            return (
                              <>
                                {/* Hide images in offline mode since they can't be displayed */}
                                {networkIsConnected === false ? (
                                  <View
                                    style={{
                                      width: '80%',
                                      height: 200,
                                      alignSelf: 'center',
                                      borderWidth: 1,
                                      borderColor: '#ddd',
                                      borderRadius: 8,
                                      backgroundColor: '#f9f9f9',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginVertical: 16,
                                    }}>
                                    <Text
                                      style={{
                                        fontFamily: FONTS.MEDIUM,
                                        fontSize: 16,
                                        color: '#666',
                                        textAlign: 'center',
                                        marginBottom: 8,
                                      }}>
                                      📱 Offline Mode
                                    </Text>
                                    <Text
                                      style={{
                                        fontFamily: FONTS.REGULAR,
                                        fontSize: 14,
                                        color: '#999',
                                        textAlign: 'center',
                                        paddingHorizontal: 20,
                                      }}>
                                      Images are not available in offline mode.
                                      Connect to internet to view and upload
                                      images.
                                    </Text>
                                  </View>
                                ) : (
                                  <ImageDisplayNew
                                    images={urls.map((item: any) => ({
                                      url: item.url,
                                    }))}
                                    maxNoOfImages={5} // Force to 5 images per plot
                                    onUploadPress={() => {
                                      // Check if device is offline before allowing image upload
                                      if (!networkIsConnected) {
                                        Toast.error({
                                          message:
                                            'Image Uploads are not supported in offline mode, try when the device is online',
                                        });
                                        return;
                                      }

                                      ImagePicker.openCamera({cropping: true})
                                        .then((image: {path: string}) => {
                                          navigation.navigate('AddImage', {
                                            imageUrl: image.path,
                                            screen: 'Plots',
                                            data: {
                                              id,
                                              type,
                                              plotId: selectedPlot.id,
                                              plotNumber:
                                                selectedPlot.plotNumber, // Add plot number for debugging
                                              data,
                                            },
                                          });
                                        })
                                        .catch(error => {});
                                    }}
                                    onThumbnailPress={(index: number) => {
                                      openImageCarousel(selectedPlot, index);
                                    }}
                                  />
                                )}

                                {/** wire up your existing PreviewImageModal */}
                                <PreviewImageModal
                                  isModalVisible={isPreviewVisible}
                                  selectedImage={{
                                    url: previewUrl,
                                    uploadedOn: selectedPlot?.uploadedOn,
                                    imagePath: previewUrl, // if you want to copy the uri into imagePath
                                  }}
                                  metadata={{
                                    field: `${details.trialLocationId}-${details.villageName}`,
                                  }}
                                  closeModal={() => setPreviewVisible(false)}
                                />
                              </>
                            );
                          })()}
                        </>
                      ) : currentTrait === 'Voice Note' ? (
                        <>
                          {/* Voice Note Multi Recorder */}
                          <View
                            style={{
                              width: '100%',
                              marginVertical: 16,
                            }}>
                            {networkIsConnected === false ? (
                              <View
                                style={{
                                  width: '100%',
                                  padding: 32,
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: 12,
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#ddd',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: FONTS.MEDIUM,
                                    fontSize: 16,
                                    color: '#666',
                                    textAlign: 'center',
                                    marginBottom: 8,
                                  }}>
                                  📱 Offline Mode
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: FONTS.REGULAR,
                                    fontSize: 14,
                                    color: '#999',
                                    textAlign: 'center',
                                    paddingHorizontal: 20,
                                  }}>
                                  Voice Notes are not available in offline mode.
                                  Connect to internet to record and upload voice
                                  notes.
                                </Text>
                              </View>
                            ) : (
                              <MultiVoiceNoteManager
                                plotNumber={selectedPlot?.plotNumber || ''}
                                fieldName={`${details.trialLocationId}-${details.villageName}`}
                                plotId={selectedPlot?.id}
                                experimentType={type}
                                existingVoiceNotes={
                                  (
                                    selectedPlot?.audioUrls ||
                                    selectedPlot?.voiceNote
                                  )?.map((vn: any, idx: number) => ({
                                    id: `${
                                      vn.timestamp ||
                                      vn.uploadedOn ||
                                      Date.now() + idx
                                    }`,
                                    fileName:
                                      vn.fileName || `voice_note_${idx + 1}`,
                                    duration: vn.duration || 0,
                                    mimeType: vn.mimeType || 'audio/mpeg',
                                    timestamp: vn.timestamp
                                      ? vn.timestamp
                                      : vn.uploadedOn
                                      ? new Date(vn.uploadedOn).getTime()
                                      : Date.now(),
                                    isUploaded: true,
                                    url: vn.url, // URL for playback
                                    audioPath: vn.audioPath, // S3 path
                                    uploadedOn: vn.uploadedOn, // Upload timestamp
                                    locationName: vn.locationName, // Location name
                                    lat: vn.lat, // Latitude
                                    long: vn.long, // Longitude
                                  })) || []
                                }
                                onUpload={handleUploadVoiceNote}
                                isUploading={isUploadingVoiceNote}
                                onRefreshPlotList={refreshPlotList}
                              />
                            )}
                          </View>
                        </>
                      ) : currentTraitData?.dataType === 'fixed' ? (
                        // If we have predefined options, render the grid…
                        Array.isArray(currentTraitData.preDefiendList) &&
                        currentTraitData.preDefiendList.length > 0 ? (
                          <FixedOptionsGrid
                            options={currentTraitData.preDefiendList}
                            selected={selectedFixedValue}
                            onSelect={(option: string) => {
                              setSelectedFixedValue(option);
                              if (!selectedPlot || !currentTrait) {
                                return;
                              }

                              // Mark this trait as modified in current session
                              setModifiedTraitsInSession(prev => {
                                const plotNo = selectedPlot.plotNumber;
                                const modifiedSet =
                                  prev[plotNo] || new Set<string>();
                                modifiedSet.add(currentTrait);
                                return {...prev, [plotNo]: modifiedSet};
                              });

                              setRecordedData(
                                (prev: Record<string, TraitData[]>) => {
                                  const plotNo = selectedPlot.plotNumber;
                                  const existing = prev[plotNo] || [];
                                  const filtered = existing.filter(
                                    t => t.traitName !== currentTrait,
                                  );
                                  // Find traitId from recorded or unrecorded trait data
                                  const traitMeta =
                                    selectedPlot?.recordedTraitData?.find(
                                      (t: TraitData) =>
                                        t.traitName === currentTrait,
                                    ) ||
                                    selectedPlot?.unrecordedTraitData?.find(
                                      (t: TraitData) =>
                                        t.traitName === currentTrait,
                                    );

                                  filtered.push({
                                    traitId: traitMeta?.traitId ?? 0,
                                    traitName: currentTrait,
                                    dataType: 'fixed',
                                    value: option,
                                  });
                                  return {...prev, [plotNo]: filtered};
                                },
                              );
                            }}
                          />
                        ) : (
                          // …otherwise show a friendly fallback card
                          <View
                            style={{
                              backgroundColor: '#fff4e5',
                              borderRadius: 12,
                              padding: 20,
                              marginVertical: 16,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: '#ffd8a8',
                            }}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: FONTS.MEDIUM,
                                color: '#ff9800',
                                marginBottom: 8,
                              }}>
                              🤷 No options available
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: FONTS.REGULAR,
                                color: '#666',
                                textAlign: 'center',
                              }}>
                              There aren't any predefined values for "
                              {currentTrait}" right now. Check back later once
                              options are added.
                            </Text>
                          </View>
                        )
                      ) : currentTraitData?.dataType === 'date' ? (
                        <>
                          <View style={styles.calendarCard}>
                            <Calendar
                              // force re-mount whenever date changes (key must be stable & valid)
                              key={
                                selectedDate
                                  ? getCalendarDateString(selectedDate)
                                  : 'no-date-selected'
                              }
                              current={
                                selectedDate
                                  ? getCalendarDateString(selectedDate)
                                  : dayjs().format('YYYY-MM-DD')
                              }
                              // Allow selection of past, present, and future dates (removed maxDate restriction)
                              pastScrollRange={50} // Allow scrolling 50 months back
                              futureScrollRange={60} // Allow scrolling ~5 years ahead
                              markedDates={((): any => {
                                const selectedKey = selectedDate
                                  ? getCalendarDateString(selectedDate)
                                  : null;
                                const todayKey = dayjs().format('YYYY-MM-DD');
                                const obj: any = {};

                                // Only mark a date as selected if there's actually a selected date
                                if (selectedKey) {
                                  obj[selectedKey] = {
                                    selected: true,
                                    selectedColor: '#1976D2',
                                  };
                                }

                                // Always mark today for reference, but merge with selection if they're the same
                                if (selectedKey && todayKey === selectedKey) {
                                  // Merge dot marker into the same selected day to avoid overriding selection styling
                                  obj[selectedKey] = {
                                    ...obj[selectedKey],
                                    marked: true,
                                    dotColor: '#1976D2',
                                  };
                                } else {
                                  obj[todayKey] = {
                                    marked: true,
                                    dotColor: '#1976D2',
                                  };
                                }
                                return obj;
                              })()}
                              onDayPress={(day: {dateString: string}) => {
                                const selectedDateString = day.dateString;
                                const today = dayjs().format('YYYY-MM-DD');

                                // Future dates now allowed – removed restriction check

                                const [y, m, d] = selectedDateString
                                  .split('-')
                                  .map(Number);
                                // pick noon local so toISOString() stays on the same date
                                const picked = new Date(y, m - 1, d, 12, 0, 0);
                                setSelectedDate(picked);

                                // save into recordedData
                                if (selectedPlot && currentTrait) {
                                  // Mark this trait as modified in current session
                                  setModifiedTraitsInSession(prev => {
                                    const plotNo = selectedPlot.plotNumber;
                                    const modifiedSet =
                                      prev[plotNo] || new Set<string>();
                                    modifiedSet.add(currentTrait);
                                    return {...prev, [plotNo]: modifiedSet};
                                  });

                                  setRecordedData(
                                    (prev: Record<string, TraitData[]>) => {
                                      const plotNumber =
                                        selectedPlot.plotNumber;
                                      const existing = prev[plotNumber] || [];
                                      const filtered = existing.filter(
                                        (t: TraitData) =>
                                          t.traitName !== currentTrait,
                                      );
                                      return {
                                        ...prev,
                                        [plotNumber]: [
                                          ...filtered,
                                          {
                                            traitName: currentTrait,
                                            dataType: 'date',
                                            value: toApiDate(picked), // store as DD/MM/YYYY
                                            traitId:
                                              currentTraitData?.traitId ?? 0,
                                          },
                                        ],
                                      };
                                    },
                                  );

                                  // Show success feedback for date selection
                                  Toast.success({
                                    message: `Date selected: ${dayjs(
                                      picked,
                                    ).format('MMM DD, YYYY')}`,
                                  });
                                }
                              }}
                              theme={{
                                todayTextColor: '#1976D2',
                                arrowColor: '#1976D2',
                                selectedDayBackgroundColor: '#1976D2',
                                selectedDayTextColor: '#ffffff',
                                dayTextColor: '#2d4150',
                                textDisabledColor: '#d9e1e8',
                                dotColor: '#1976D2',
                                selectedDotColor: '#ffffff',
                              }}
                              // Calendar layout adjusted to prevent overlap with input area
                              style={{
                                width: '92%', // occupy most width of card
                                alignSelf: 'center',
                                marginTop: 12,
                                marginBottom: 8,
                                // remove negative margins that caused collision
                                // provide consistent height based on intrinsic content
                                borderRadius: 12,
                              }}
                            />
                          </View>
                        </>
                      ) : ['str', 'int', 'float'].includes(
                          currentTraitData?.dataType || '',
                        ) ? (
                        <RecordedInputCard
                          traitName={currentTrait}
                          uom={currentTraitData?.traitUom || ''}
                          value={
                            recordedData[selectedPlot?.plotNumber]?.find(
                              (trait: TraitData) =>
                                trait.traitName === currentTrait,
                            )?.value || ''
                          }
                          onValueChange={(value: string) => {
                            if (!selectedPlot || !currentTrait) {
                              return;
                            }

                            // Mark this trait as modified in current session
                            setModifiedTraitsInSession(prev => {
                              const plotNo = selectedPlot.plotNumber;
                              const modifiedSet =
                                prev[plotNo] || new Set<string>();
                              modifiedSet.add(currentTrait);
                              return {...prev, [plotNo]: modifiedSet};
                            });

                            setRecordedData(
                              (prev: Record<string, TraitData[]>) => {
                                const currentPlotNumber =
                                  selectedPlot.plotNumber;
                                const existingTraits =
                                  prev[currentPlotNumber] || [];

                                const updatedTraits = existingTraits.filter(
                                  (trait: TraitData) =>
                                    trait.traitName !== currentTrait,
                                );

                                // Find traitId from recorded or unrecorded trait data
                                const traitMeta =
                                  selectedPlot?.recordedTraitData?.find(
                                    (t: TraitData) =>
                                      t.traitName === currentTrait,
                                  ) ||
                                  selectedPlot?.unrecordedTraitData?.find(
                                    (t: TraitData) =>
                                      t.traitName === currentTrait,
                                  );

                                updatedTraits.push({
                                  traitId: traitMeta?.traitId ?? 0,
                                  traitName: currentTrait,
                                  dataType: currentTraitData?.dataType,
                                  value: value,
                                });

                                return {
                                  ...prev,
                                  [currentPlotNumber]: updatedTraits,
                                };
                              },
                            );
                          }}
                          keyboardType={
                            currentTraitData?.dataType === 'int' ||
                            currentTraitData?.dataType === 'float'
                              ? 'numeric'
                              : 'default'
                          }
                        />
                      ) : (
                        <View
                          style={{
                            margin: 16,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 8,
                            backgroundColor: '#fffbe6',
                          }}>
                          <Text style={{fontSize: 14, color: '#444'}}>
                            ⚠️ Unsupported trait type for: {currentTrait}
                          </Text>
                          <Text style={{fontSize: 12, color: '#666'}}>
                            {JSON.stringify(currentTraitData, null, 2)}
                          </Text>
                        </View>
                      )}
                      {/* </ScrollView> */}
                    </KeyboardAvoidingView>
                  </View>

                  {/* Last Updated Info Component */}
                  <View
                    style={{
                      paddingHorizontal: 16,
                      marginBottom: 16,
                    }}>
                    {/* Individual Plants Manager Component - Only visible for 'float' data type traits */}
                    {currentTraitData?.dataType === 'float' && (
                      <IndividualPlantsManager
                        totalPlants={totalPlants}
                        plantsData={plantsData || []}
                        visible={true}
                        theme="light"
                        onSave={handleSavePlantsData}
                        onAverageChange={handleAverageChange}
                        isSaving={isSavingPlants}
                        isLoading={isLoadingIndividualPlants}
                        onExpand={handleIndividualPlantsExpand}
                        onCollapse={handleIndividualPlantsCollapse}
                        containerStyle={{
                          marginBottom: 8,
                        }}
                      />
                    )}

                    {/* Debug: Log currentTraitData before passing to LastUpdatedInfo */}
                    {(() => {
                      const mappedData = getTraitUpdateData(
                        currentTraitData,
                        currentTrait,
                      );
                      return null;
                    })()}
                    <LastUpdatedInfo
                      traitData={getTraitUpdateData(
                        currentTraitData,
                        currentTrait,
                      )}
                      visible={!!currentTraitData && !!currentTrait}
                      theme="light"
                    />
                  </View>

                  {/* Footer: Recording Status Bar */}
                  <View style={{marginTop: 8}}>
                    <RecordingStatusBar
                      recorded={recordedPlots}
                      total={totalPlots}
                    />
                  </View>
                </>
              )}

              {/* Delete Confirmation Modal */}
              <BottomSheetModalView
                bottomSheetModalRef={deleteConfirmRef}
                type="CONTENT_HEIGHT">
                <View style={{padding: 20}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: FONTS.MEDIUM,
                      marginBottom: 16,
                      textAlign: 'center',
                    }}>
                    Delete Value?
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 24,
                      textAlign: 'center',
                      color: '#555',
                    }}>
                    Are you sure you want to delete the current value for "
                    {deleteTarget?.traitName ||
                      selectedCellData?.traitName ||
                      currentTrait}
                    "?
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Pressable
                      onPress={() => {
                        setDeleteTarget(null);
                        deleteConfirmRef.current?.dismiss();
                      }}
                      style={{
                        flex: 1,
                        marginRight: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                        backgroundColor: '#f5f5f5',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: '#555', fontFamily: FONTS.MEDIUM}}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmDelete}
                      style={{
                        flex: 1,
                        marginLeft: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                        backgroundColor: '#e53935',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white', fontFamily: FONTS.MEDIUM}}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </BottomSheetModalView>

              {/* trait display modal */}
              <BottomSheetModalView
                bottomSheetModalRef={bottomSheetModalRef}
                type="SCREEN_HEIGHT">
                <View style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
                  {/* 1) Centered header with total count */}
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: FONTS.MEDIUM,
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      marginBottom: 16,
                    }}>
                    Traits ({traits.length})
                  </Text>

                  {/* 2) Scrollable list */}
                  <BottomSheetScrollView
                    style={{flex: 1}} // <-- take up all available space
                    contentContainerStyle={{paddingBottom: 16}}
                    keyboardShouldPersistTaps="handled">
                    {traits.map((trait, idx) => {
                      // determine recorded vs pending
                      let isComplete = false;

                      if (trait === 'Image') {
                        isComplete = (selectedPlot?.imageUrls?.length ?? 0) > 0;
                      } else if (trait === 'Notes') {
                        isComplete = Boolean(selectedPlot?.notes);
                      } else if (trait === 'Voice Note') {
                        isComplete =
                          Array.isArray(selectedPlot?.voiceNote) &&
                          selectedPlot.voiceNote.length > 0;
                      } else {
                        const recs =
                          recordedData[selectedPlot?.plotNumber ?? ''] || [];
                        // only mark complete if we actually have a non‐empty value
                        isComplete = recs.some(
                          r =>
                            r.traitName === trait &&
                            r.value != null &&
                            r.value !== '',
                        );
                      }

                      // lookup metadata
                      const meta =
                        selectedPlot?.recordedTraitData?.find(
                          (t: TraitData) => t.traitName === trait,
                        ) ||
                        selectedPlot?.unrecordedTraitData?.find(
                          (t: TraitData) => t.traitName === trait,
                        );

                      // new label ordering: userDefiend, then uom, then – traitName
                      let label: string;
                      if (
                        trait === 'Image' ||
                        trait === 'Notes' ||
                        trait === 'Voice Note'
                      ) {
                        // for the three front-end slots just show the name
                        label = trait;
                        // Add count indicator for Voice Note
                        if (
                          trait === 'Voice Note' &&
                          Array.isArray(selectedPlot?.voiceNote) &&
                          selectedPlot.voiceNote.length > 0
                        ) {
                          label = `${trait} (${selectedPlot.voiceNote.length}/3)`;
                        }
                      } else {
                        label =
                          `${meta?.userDefiend ?? ''}` +
                          (meta?.traitUom ? ` (${meta.traitUom})` : '') +
                          ` – ${trait}`;
                      }

                      return (
                        <Pressable
                          key={idx}
                          onPress={() => selectTrait(trait)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 16,
                              fontFamily: FONTS.REGULAR,
                              color: '#000',
                              marginRight: 8,
                            }}
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {label}
                          </Text>
                          {isComplete ? (
                            <GreenTick width={20} height={20} />
                          ) : (
                            <PopupDot width={20} height={20} />
                          )}
                        </Pressable>
                      );
                    })}
                  </BottomSheetScrollView>

                  {/* 3) Legend footer is outside the ScrollView so it never scrolls away */}
                  {(() => {
                    const recordedCount = traits.filter(trait => {
                      if (trait === 'Image') {
                        return (selectedPlot?.imageUrls?.length ?? 0) > 0;
                      }
                      if (trait === 'Notes') {
                        return Boolean(selectedPlot?.notes);
                      }
                      if (trait === 'Voice Note') {
                        return Boolean(selectedPlot?.voiceNote);
                      }
                      const recs =
                        recordedData[selectedPlot?.plotNumber ?? ''] || [];
                      return recs.some(r => r.traitName === trait);
                    }).length;
                    const pendingCount = traits.length - recordedCount;

                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: '#eee',
                        }}>
                        <PopupDot width={22} height={18} />
                        <Text
                          style={{
                            marginHorizontal: 8,
                            fontSize: 14,
                            fontFamily: FONTS.REGULAR,
                            color: '#666',
                          }}>
                          Pending ({pendingCount})
                        </Text>
                        <GreenTick width={22} height={18} />
                        <Text
                          style={{
                            marginLeft: 8,
                            fontSize: 14,
                            fontFamily: FONTS.REGULAR,
                            color: '#666',
                          }}>
                          Recorded ({recordedCount})
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              </BottomSheetModalView>

              {/* Field Layout Modal */}
              <FieldLayoutModal
                isVisible={isMapModalVisible}
                onClose={() => setIsMapModalVisible(false)}
                experimentID={experimentID}
                locationID={locationID}
                type={type}
                fieldLabel={details.fieldLabel}
                canViewAccessionId={canViewAccessionId}
                resolveAccessionId={resolveAccessionId}
              />

              {/* Cell Edit Modal */}
              <BottomSheetModalView
                bottomSheetModalRef={cellEditModalRef}
                type="CONTENT_HEIGHT">
                <View style={{padding: 20}}>
                  {selectedCellData && (
                    <>
                      {/* Header */}
                      <View style={styles.cellEditHeader}>
                        <View style={styles.cellEditHeader}>
                          <View>
                            <Text style={styles.cellEditTitle}>
                              Plot {selectedCellData.plotNumber} -{' '}
                              {selectedCellData.traitName}
                            </Text>
                            {/* <Text style={styles.cellEditSubtitle}>
                                {selectedCellData.userDefined}
                                {selectedCellData.traitUom &&
                                  ` (${selectedCellData.traitUom})`}
                              </Text> */}
                          </View>
                          {
                            !['Image', 'Notes', 'Voice Note'].includes(
                              selectedCellData.dataType,
                            )
                          }
                        </View>
                      </View>

                      {/* Input Section */}
                      <View style={styles.cellEditInputContainer}>
                        {/* Value Display Field */}
                        <View style={styles.valueDisplayContainer}>
                          <View style={styles.valueDisplayField}>
                            <Text style={styles.valueDisplayText}>
                              {selectedCellData.dataType === 'date' &&
                              selectedCellData.value
                                ? (() => {
                                    // Use the same date formatting logic as InputField
                                    const d = parseToDayjs(
                                      selectedCellData.value,
                                    );
                                    return d && d.isValid()
                                      ? d.format('DD/MM/YYYY')
                                      : selectedCellData.value;
                                  })()
                                : selectedCellData.value || '-'}
                            </Text>
                            <Text style={styles.cellEditSubtitle}>
                              {selectedCellData.userDefined}
                              {selectedCellData.traitUom &&
                                ` (${selectedCellData.traitUom})`}
                              {selectedCellData.userDefined && ' - '}
                              {selectedCellData.traitName}
                            </Text>
                          </View>
                        </View>

                        {/* Input Method */}
                        {selectedCellData.dataType === 'fixed' ? (
                          <FixedOptionsGrid
                            options={(() => {
                              // Find the trait metadata to get predefined options
                              const plot = plotList.find(
                                p =>
                                  p.plotNumber === selectedCellData.plotNumber,
                              );
                              const traitMeta =
                                plot?.recordedTraitData?.find(
                                  (t: TraitData) =>
                                    t.traitName === selectedCellData.traitName,
                                ) ||
                                plot?.unrecordedTraitData?.find(
                                  (t: TraitData) =>
                                    t.traitName === selectedCellData.traitName,
                                );

                              // Return the full predefined options array (not just names)
                              return traitMeta?.preDefiendList || [];
                            })()}
                            selected={selectedCellData.value}
                            onSelect={(option: string) =>
                              handleCellValueChange(option)
                            }
                          />
                        ) : selectedCellData.dataType === 'date' ? (
                          <View style={styles.calendarCard}>
                            <Calendar
                              current={
                                selectedCellData.value
                                  ? getCalendarDateString(
                                      selectedCellData.value,
                                    )
                                  : dayjs().format('YYYY-MM-DD')
                              }
                              // Allow selection of past, present, and future dates
                              pastScrollRange={50}
                              futureScrollRange={60} // Allow scrolling ~5 years ahead
                              markedDates={((): any => {
                                const selectedKey = selectedCellData.value
                                  ? getCalendarDateString(
                                      selectedCellData.value,
                                    )
                                  : null;
                                const todayKey = dayjs().format('YYYY-MM-DD');
                                const obj: any = {};

                                // Only mark a date as selected if there's actually a value
                                if (selectedKey) {
                                  obj[selectedKey] = {
                                    selected: true,
                                    selectedColor: '#1976D2',
                                  };
                                }

                                // Always mark today for reference, but merge with selection if they're the same
                                if (selectedKey && todayKey === selectedKey) {
                                  obj[selectedKey] = {
                                    ...obj[selectedKey],
                                    marked: true,
                                    dotColor: '#1976D2',
                                  };
                                } else {
                                  obj[todayKey] = {
                                    marked: true,
                                    dotColor: '#1976D2',
                                  };
                                }
                                return obj;
                              })()}
                              onDayPress={(day: {dateString: string}) => {
                                const selectedDateString = day.dateString;

                                // Future dates now allowed – removed restriction check

                                const [y, m, d] = selectedDateString
                                  .split('-')
                                  .map(Number);
                                const picked = new Date(y, m - 1, d, 12, 0, 0);
                                const apiDate = toApiDate(picked);
                                if (apiDate) {
                                  handleCellValueChange(apiDate);
                                  // Show success feedback for date selection
                                  Toast.success({
                                    message: `Date updated: ${dayjs(
                                      picked,
                                    ).format('MMM DD, YYYY')}`,
                                  });
                                }
                              }}
                              theme={{
                                todayTextColor: '#1976D2',
                                arrowColor: '#1976D2',
                                selectedDayBackgroundColor: '#1976D2',
                                selectedDayTextColor: '#ffffff',
                                dayTextColor: '#2d4150',
                                textDisabledColor: '#d9e1e8',
                                dotColor: '#1976D2',
                                selectedDotColor: '#ffffff',
                              }}
                              style={{
                                width: '100%',
                                alignSelf: 'center',
                                marginVertical: 10,
                              }}
                            />
                          </View>
                        ) : ['int', 'float', 'str'].includes(
                            selectedCellData.dataType,
                          ) ? (
                          <RecordedInputCard
                            value={selectedCellData.value}
                            onValueChange={handleCellValueChange}
                          />
                        ) : (
                          <View style={styles.textInputContainer}>
                            <TextInput
                              style={styles.textInput}
                              value={selectedCellData.value}
                              onChangeText={handleCellValueChange}
                              placeholder="Enter value..."
                              autoFocus={true}
                            />
                          </View>
                        )}
                      </View>

                      {/* Delete Button - Centered */}
                      <View style={{alignItems: 'center', marginVertical: 16}}>
                        <Pressable
                          onPress={handleDelete}
                          style={styles.cellEditDeleteButton}>
                          <DeleteBin width={20} height={25} color="#EF4444" />
                        </Pressable>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.cellEditActions}>
                        <Pressable
                          onPress={() => cellEditModalRef.current?.dismiss()}
                          style={styles.cellEditButton}>
                          <Text style={styles.cellEditButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={handleCellSave}
                          disabled={isPosting || isCellValidating}
                          style={[
                            styles.cellEditButton,
                            styles.cellEditButtonPrimary,
                          ]}>
                          <Text
                            style={[
                              styles.cellEditButtonText,
                              styles.cellEditButtonTextPrimary,
                            ]}>
                            {isCellValidating
                              ? 'Validating...'
                              : isPosting
                              ? 'Saving...'
                              : 'Save'}
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </BottomSheetModalView>

              {/* Plot display modal */}
              <BottomSheetModalView
                bottomSheetModalRef={plotModalRef}
                type="SCREEN_HEIGHT">
                <View
                  style={{flex: 1, backgroundColor: '#ffffff', padding: 16}}>
                  {/* 1) Header with total count */}
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: FONTS.MEDIUM,
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      marginBottom: 16,
                    }}>
                    Plots ({filteredPlotList.length})
                  </Text>

                  {/* toggle to show only invalid plots */}
                  <Pressable
                    onPress={() => setShowOnlyErrors(prev => !prev)}
                    style={{marginVertical: 8, alignSelf: 'center'}}>
                    <Text style={{color: '#1976D2', fontFamily: FONTS.BOLD}}>
                      {showOnlyErrors
                        ? 'Show All Plots'
                        : 'Show Only Incorrect Plots'}
                    </Text>
                  </Pressable>

                  {/* 2) Scrollable list of plots */}
                  <BottomSheetScrollView
                    ref={plotScrollRef}
                    contentContainerStyle={{paddingBottom: 16}}
                    keyboardShouldPersistTaps="handled">
                    {(showOnlyErrors
                      ? filteredPlotList.filter(p =>
                          invalidPlotIds.includes(p.id),
                        )
                      : filteredPlotList
                    ).map((plot, index) => {
                      // 1) Total number of traits coming from the API
                      const totalApiTraits =
                        (plot.recordedTraitData?.length ?? 0) +
                        (plot.unrecordedTraitData?.length ?? 0);

                      // 2) Count only those recorded traits that have a real, non‐empty value
                      interface RecordedTraitData {
                        traitName: string;
                        value?: string | null;
                        [key: string]: any;
                      }

                      interface PlotItem {
                        recordedTraitData?: RecordedTraitData[];
                        unrecordedTraitData?: RecordedTraitData[];
                        plotNumber?: string | number;
                        accessionId?: string | number;
                        [key: string]: any;
                      }

                      const recordedValidCount: number =
                        (plot as PlotItem).recordedTraitData?.filter(
                          (rt: RecordedTraitData) =>
                            rt.value != null && rt.value !== '',
                        ).length ?? 0;

                      // 3) Mark complete only if every API trait is now recorded with a value
                      const isComplete = recordedValidCount === totalApiTraits;

                      return (
                        <Pressable
                          key={index}
                          onPress={() => selectPlot(plot)}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: FONTS.REGULAR,
                              color: invalidPlotIds.includes(plot.id)
                                ? 'red'
                                : '#000',
                            }}>
                            {(() => {
                              const accessionIdValue = resolveAccessionId(plot);
                              return canViewAccessionId &&
                                accessionIdValue != null
                                ? `${plot.plotNumber} (${accessionIdValue})`
                                : `${plot.plotNumber}`;
                            })()}
                          </Text>
                          {isComplete ? (
                            <GreenTick width={22} height={18} />
                          ) : (
                            <PopupDot width={22} height={18} />
                          )}
                        </Pressable>
                      );
                    })}
                  </BottomSheetScrollView>

                  {/* 3) Legend with recorded/pending counts */}
                  {(() => {
                    const total = filteredPlotList.length;

                    const recordedCount = filteredPlotList.reduce(
                      (cnt, plot) => {
                        const totalTraits =
                          (plot.recordedTraitData?.length ?? 0) +
                          (plot.unrecordedTraitData?.length ?? 0);

                        const validRecordedCount: number =
                          (
                            plot as {
                              recordedTraitData?: {value?: string | null}[];
                            }
                          ).recordedTraitData?.filter(
                            (rt: {value?: string | null}) =>
                              rt.value != null && rt.value !== '',
                          ).length ?? 0;

                        return validRecordedCount === totalTraits
                          ? cnt + 1
                          : cnt;
                      },
                      0,
                    );

                    const pendingCount = total - recordedCount;

                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: '#eee',
                        }}>
                        <PopupDot width={22} height={18} />
                        <Text
                          style={{
                            marginHorizontal: 8,
                            fontSize: 14,
                            fontFamily: FONTS.REGULAR,
                            color: '#666',
                          }}>
                          Pending ({pendingCount})
                        </Text>
                        <GreenTick width={22} height={18} />
                        <Text
                          style={{
                            marginLeft: 8,
                            fontSize: 14,
                            fontFamily: FONTS.REGULAR,
                            color: '#666',
                          }}>
                          Recorded ({recordedCount})
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              </BottomSheetModalView>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Image Carousel Modal */}
      <ImageCarouselModal
        isVisible={isImageCarouselVisible}
        images={selectedPlotImages}
        initialIndex={selectedImageIndex}
        plotNumber={selectedPlot?.plotNumber}
        fieldName={`${details.trialLocationId}-${details.villageName}`}
        plotId={selectedPlot?.id}
        experimentType={type}
        onRefreshPlotList={refreshPlotList}
        onImageDeleted={() => {
          // Refresh plot images after deletion
          if (selectedPlot) {
            // The plot list will be refreshed automatically via onRefreshPlotList
            // For now, we'll just close the modal
            setIsImageCarouselVisible(false);
          }
        }}
        onClose={() => setIsImageCarouselVisible(false)}
      />

      {/* Notes View Modal */}
      <NotesViewModal
        isVisible={isNotesViewVisible}
        notes={selectedPlotNotes}
        plotNumber={selectedNotesPlotNumber}
        fieldName={`${details.trialLocationId}-${details.villageName}`}
        plotId={
          plotList.find(p => p.plotNumber === selectedNotesPlotNumber)?.id
        }
        onClose={() => setIsNotesViewVisible(false)}
        onSave={(updatedNotes: string) => {
          setSelectedPlotNotes(updatedNotes);
          handleSaveNotes(updatedNotes);
        }}
        isSaving={isSavingNotes}
      />

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isVisible={isValidationErrorModalVisible}
        errors={validationErrors}
        onClose={handleValidationErrorModalClose}
        onPlotSelect={handleValidationErrorPlotSelect}
        onRetryAll={handleRetryAllValidationErrors}
        title="Trait Validation Errors"
      />

      {/* Voice Note Player Modal */}
      <VoiceNotePlayerModal
        isVisible={isVoiceNotePlayerVisible}
        voiceNotes={selectedPlotVoiceNotes}
        initialIndex={selectedVoiceNoteIndex}
        plotNumber={selectedPlot?.plotNumber}
        fieldName={`${details.trialLocationId}-${details.villageName}`}
        plotId={selectedPlot?.id}
        experimentType={type}
        onClose={() => setIsVoiceNotePlayerVisible(false)}
        onRefreshPlotList={refreshPlotList}
      />

      {/* Voice Note Recorder Modal - No longer needed, using inline recorder */}
      {/* <VoiceNoteRecorder
        isVisible={isVoiceNoteVisible}
        plotNumber={selectedPlot?.plotNumber}
        fieldName={`${details.trialLocationId}-${details.villageName}`}
        onClose={() => setIsVoiceNoteVisible(false)}
        onUpload={handleUploadVoiceNote}
        isUploading={isUploadingVoiceNote}
      /> */}
    </SafeAreaView>
  );
};

export default Plots;
