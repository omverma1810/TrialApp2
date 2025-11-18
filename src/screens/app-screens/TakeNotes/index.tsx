import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Back, Adfilter} from '../../../assets/icons/svgs';
import {Loader, SafeAreaView, StatusBar} from '../../../components';
import Chip from '../../../components/Chip';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import Toast from '../../../utilities/toast';
// import {NotesScreenProps} from '../../../types/navigation/appTypes';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import TakeNotesStyles from './TakeNotesStyle';
import FilterCards from '../PlanVisit/Filter/FilterCards';
import FilterModal from '../PlanVisit/FilterModal';
interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const TakeNotes = ({navigation, route}: any) => {
  const {t, i18n} = useTranslation();
  const language = i18n.language;
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState(
    t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT),
  );
  const [defaultChipTitleField, setDefaultChipTitleField] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [chipVisible, setChipVisible] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);

  // Ref to track when filters should be applied after state updates
  const shouldApplyFiltersAfterUpdate = useRef(false);
  const [isEdit, setIsEdit] = useState(false);
  const [noteId, setNoteId] = useState(null);
  const [editNotesData, setEditNotesData] = useState<any>(null);
  const [text, setText] = useState('');
  // ─ New: filter & pagination state ─────────────────────────────────
  interface CropOption {
    label: string;
    value: number;
  }
  const [cropOptions, setCropOptions] = useState<CropOption[]>([]);
  const [cropList, setCropList] = useState<string[]>([]); // already here
  const [selectedCrop, setSelectedCrop] = useState<CropOption | null>(null);
  // Flattened experiments - no more project concept
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [experimentList, setExperimentList] = useState<any[]>([]); // already here
  const [selectedExperiment, setSelectedExperiment] = useState<any>();
  const [selectedExperimentId, setSelectedExperimentId] = useState<any>();
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState();
  const [resetExperiment, setResetExperiment] = useState(false);

  const handleSelectedExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
  };
  const handleSelectedField = (field: any) => {
    setSelectedField(field);
  };

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
    if (!isEdit) {
      setModalVisible(true);
    }
  };

  const handleChipPress = () => {
    //
    if (selectedChips.length === 0) {
      handleFirstRightIconClick();
    } else if (!selectedField) {
      handleSecondRightIconClick();
    } else {
      handleThirdRightIconClick();
    }
  };

  useEffect(() => {
    if (!selectedExperiment) {
      setChipTitle(t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT));
    }
  }, [language, selectedExperiment, t]);

  // new: fetch crop filters
  const [getFilters, filtersData, isFiltersLoading] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });

  // new: fetch filtered list by crop → returns { projects: { [project]: [exps] }, totalProjects }
  const [postFiltered, postFilteredData, isPostLoading] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  /**
   * When a crop is tapped, fire FILTERED API
   * to fetch experiments for that crop (flattened approach)
   */
  const handleCropSelection = (label: string) => {
    const crop = cropOptions.find(c => c.label === label);
    if (!crop) return;
    // ─── Reset everything below Crop ─────────────────────
    setExperimentList([]);
    setSelectedExperiment(null);
    setSelectedExperimentId(null);
    setSelectedField(null);
    setFields([]);
    setText('');
    setInputVisible(false);
    setChipVisible(true);
    setChipTitle(t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT));
    setSelectedCrop(crop);
    setCurrentPage(1);
    postFiltered({
      payload: {
        cropId: crop.value,
        page: 1,
        perPage: 10,
        filters:
          selectedFilters.Locations.length > 0
            ? [
                {
                  key: 'locations',
                  value: selectedFilters.Locations.map(locationLabel => {
                    const location = experimentFilters.Locations.find(
                      l => l.label === locationLabel,
                    );
                    return location?.value;
                  }).filter(value => value !== undefined),
                },
              ]
            : [],
        searchKeyword: '',
      },
    });
  };

  // Process filtered experiments (flattened approach like Experiment screen)
  useEffect(() => {
    if (!postFilteredData?.projects) return;

    // Flatten all experiments from all projects - following Experiment screen approach
    const uniqueExpMap = new Map<number, any>();

    Object.entries(postFilteredData.projects).forEach(
      ([projectKey, experiments]) => {
        if (Array.isArray(experiments)) {
          experiments.forEach(exp => {
            // Only add actual experiments (skip project entries)
            if (
              (exp.experimentName || exp.fieldExperimentName) &&
              !uniqueExpMap.has(exp.id)
            ) {
              uniqueExpMap.set(exp.id, exp);
            }
          });
        }
      },
    );

    const flattenedExperiments = Array.from(uniqueExpMap.values());

    if (currentPage === 1) {
      // Replace experiments for first page
      setExperimentList(flattenedExperiments);
    } else {
      // Append experiments for subsequent pages
      setExperimentList(prev => [...prev, ...flattenedExperiments]);
    }

    setTotalExperiments(
      postFilteredData.totalExperiments || flattenedExperiments.length,
    );
  }, [postFilteredData, currentPage]);

  const [getFields, getFieldsResponse] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  // 1) On mount, fetch crops
  useEffect(() => {
    getFilters();
  }, [getFilters]);

  // Detect edit mode from route params and seed initial state
  useEffect(() => {
    if (route?.params?.data) {
      const data = route.params.data;
      setIsEdit(true);
      setNoteId(data.id ?? null);
      setEditNotesData(data);
      setText(data.content ?? '');
      // Preseed ids for later selection once lists arrive
      setSelectedExperimentId(data.experiment_id ?? undefined);
      setSelectedFieldId(data.location ?? undefined);
    }
  }, [route?.params?.data]);

  // 2) When filters arrive, populate crop dropdown and set defaults, then trigger API
  useEffect(() => {
    if (filtersData?.status_code === 200 && filtersData.filters) {
      const {Crops, Years, Seasons} = filtersData.filters;
      setExperimentFilters(filtersData.filters);
      setCropOptions(Crops.map((c: any) => ({label: c.label, value: c.value})));
      setCropList(Crops.map((c: any) => c.label));

      if (isEdit && editNotesData) {
        // Prefill from note for edit mode
        const cropOption =
          Crops.find((c: any) => c.label === editNotesData.crop_name) ||
          Crops[0];
        const yearOption =
          Years.find(
            (y: any) => String(y.label) === String(editNotesData.year),
          ) || Years[0];
        const seasonOption =
          Seasons.find((s: any) => s.label === editNotesData.season) ||
          Seasons[0];

        setSelectedFilters({
          Seasons: seasonOption ? [seasonOption.label] : [],
          Locations: [],
          Years: yearOption ? [yearOption.label] : [],
          Crops: cropOption ? [cropOption.label] : [],
        });
        if (yearOption) setSelectedYear(yearOption);
        if (seasonOption) setSelectedSeason(seasonOption);
        if (cropOption)
          setSelectedCrop({label: cropOption.label, value: cropOption.value});

        const filters = [] as any[];
        if (yearOption) filters.push({key: 'years', value: [yearOption.value]});
        if (seasonOption)
          filters.push({key: 'seasons', value: [seasonOption.value]});

        if (cropOption) {
          postFiltered({
            payload: {
              cropId: cropOption.value,
              page: 1,
              perPage: 10,
              filters,
              searchKeyword: '',
            },
            headers: {'Content-Type': 'application/json'},
          });
        }
      } else {
        // Default initial selections for take-notes
        const defaultSelectedFilters = {
          Seasons: Seasons.length > 0 ? [Seasons[0].label] : [],
          Locations: [],
          Years: Years.length > 0 ? [Years[0].label] : [],
          Crops: Crops.length > 0 ? [Crops[0].label] : [],
        };
        setSelectedFilters(defaultSelectedFilters);

        if (Years.length > 0) setSelectedYear(Years[0]);
        if (Seasons.length > 0) setSelectedSeason(Seasons[0]);
        if (Crops.length > 0) setSelectedCrop(Crops[0]);

        const filters = [] as any[];
        if (Years.length > 0)
          filters.push({key: 'years', value: [Years[0].value]});
        if (Seasons.length > 0)
          filters.push({key: 'seasons', value: [Seasons[0].value]});

        if (Crops.length > 0) {
          postFiltered({
            payload: {
              cropId: Crops[0].value,
              page: 1,
              perPage: 10,
              filters,
              searchKeyword: '',
            },
            headers: {'Content-Type': 'application/json'},
          });
        }
      }
    }
  }, [filtersData, postFiltered, isEdit, editNotesData]);

  // 3) Auto‐select first crop
  useEffect(() => {
    if (!isEdit && cropList.length && !selectedCrop) {
      handleCropSelection(cropList[0]);
    }
  }, [cropList, isEdit, selectedCrop]);

  // When experiments are fetched in edit mode, select the target experiment
  useEffect(() => {
    if (isEdit && selectedExperimentId && experimentList?.length) {
      const exp = experimentList.find(exp => exp.id === selectedExperimentId);
      if (exp) {
        setSelectedExperiment(exp);
      }
    }
  }, [isEdit, selectedExperimentId, experimentList]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.emptyContainer}>
        {isFiltersLoading || (isPostLoading && currentPage === 1) ? (
          <Loader />
        ) : (
          <Text style={TakeNotesStyles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isFiltersLoading, isPostLoading, currentPage, t],
  );
  const [payload, setPayload] = useState({
    field_id: '',
    experiment_id: '',
    content: '',
    experiment_type: '',
  });
  const [takeNotes, takeNotesResponse] = useApi({
    url: isEdit ? `${URL.NOTES}${noteId}/` : URL.NOTES,
    method: isEdit ? 'PUT' : 'POST',
  });

  const onTakeNotes = async () => {
    if (!selectedExperiment || !selectedField || !text.trim()) {
      Toast.error({
        message: t(LOCALES.TAKE_NOTES.MSG_SELECT_FIELDS),
      });
      return;
    }
    const newData = {
      field_id: selectedField?.landVillageId,
      experiment_id: selectedExperiment?.id,
      experiment_type: selectedExperiment?.experimentType,
      content: text,
    };
    await takeNotes({payload: newData});
  };

  useEffect(() => {
    if (
      takeNotesResponse &&
      (takeNotesResponse.status_code == 201 ||
        takeNotesResponse.status_code == 200)
    ) {
      if (isEdit) {
        Toast.success({
          message: t(LOCALES.TAKE_NOTES.MSG_NOTE_UPDATED),
        });
        // route.params?.fetchNotes();
      } else {
        Toast.success({
          message: t(LOCALES.TAKE_NOTES.MSG_NOTE_CREATED),
        });
      }
      navigation.navigate('Home', {refresh: true});
    } else {
      if (takeNotesResponse) {
        Toast.error({
          message:
            t(LOCALES.TAKE_NOTES.MSG_ERROR) ||
            t(LOCALES.COMMON.MSG_GENERIC_ERROR),
        });
      }
    }
  }, [takeNotesResponse, t, navigation, isEdit]);

  useEffect(() => {
    const experimentId = selectedExperiment?.id || selectedExperimentId;

    let experimentType = 'line';
    if (isEdit && editNotesData?.trial_type) {
      experimentType = editNotesData.trial_type;
    } else if (selectedExperiment?.experimentType) {
      experimentType = selectedExperiment.experimentType;
    }
    if (experimentId && experimentType) {
      const queryParams = `experimentType=${experimentType}`;
      getFields({
        pathParams: experimentId,
        queryParams: queryParams,
      });
    }
  }, [selectedExperiment, selectedExperimentId]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      const {locationList} = getFieldsResponse.data;
      // Always set fields list so UI can render options
      setFields(locationList || []);

      if (isEdit && locationList?.length) {
        let selectedField = locationList.find((location: any) => {
          return String(location?.landVillageId) === String(selectedFieldId);
        });
        // Fallback: try to match by field label if id comparison fails
        if (!selectedField && editNotesData?.fieldLabel) {
          selectedField = locationList.find((location: any) => {
            return (
              String(location?.location?.fieldLabel) ===
                String(editNotesData?.fieldLabel) ||
              String(location?.location?.villageName) ===
                String(editNotesData?.fieldLabel)
            );
          });
        }
        const field_name = selectedField?.location?.villageName;
        if (selectedField) {
          setDefaultChipTitleField(field_name);
          handleSelectedField(selectedField);
        }
      }
    }
  }, [getFieldsResponse, selectedFieldId, editNotesData, isEdit]);

  useEffect(() => {}, []);

  // Add PlanVisit-style filter state
  interface FilterOptionItem {
    label: string;
    value: any;
  }
  interface FilterOptions {
    Years: FilterOptionItem[];
    Crops: FilterOptionItem[];
    Seasons: FilterOptionItem[];
    Locations: FilterOptionItem[];
  }
  const [experimentFilters, setExperimentFilters] = useState<FilterOptions>({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    Seasons: string[];
    Locations: string[];
    Years: string[];
    Crops: string[];
  }>({
    Seasons: [],
    Locations: [],
    Years: [],
    Crops: [],
  });

  // useEffect to apply filters when flag is set and state has updated
  useEffect(() => {
    if (shouldApplyFiltersAfterUpdate.current) {
      shouldApplyFiltersAfterUpdate.current = false;

      // Build filters payload from selectedFilters
      const filters = buildFiltersPayload();
      setCurrentPage(1);
      setExperimentList([]);
      setSelectedExperiment(null);
      setSelectedField(null);
      setResetExperiment(true);

      // Use the first selected crop for cropId (if any)
      const cropLabel = selectedFilters.Crops[0];
      const cropObj = experimentFilters.Crops.find(c => c.label === cropLabel);

      if (cropObj) {
        postFiltered({
          payload: {
            cropId: cropObj.value,
            page: 1,
            perPage: 10,
            filters,
            searchKeyword: '',
          },
          headers: {'Content-Type': 'application/json'},
        });
      }
    }
  }, [selectedFilters]);

  // --- Handler for FilterModal (batched updates) ---
  const handleFilterUpdate = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    values: string[],
  ) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
      return;
    }

    // Update state using functional update
    setSelectedFilters(prev => {
      const newFilters = {...prev, [filterType]: values};
      return newFilters;
    });

    // DON'T trigger API call here - let FilterModal's Apply button handle it
  };

  // --- Handler for FilterCards (immediate API call) ---
  const handleFilterCardsUpdate = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    values: string[],
  ) => {
    let appliedValues = values;
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
      appliedValues = [values[0]];
    }

    const newFilters = {...selectedFilters, [filterType]: appliedValues};

    // Update state
    setSelectedFilters(newFilters);

    // Trigger immediate API call
    setTimeout(() => {
      const cropLabel = newFilters.Crops[0];
      const cropObj = experimentFilters.Crops.find(c => c.label === cropLabel);

      if (cropObj) {
        const filters = [];

        if (newFilters.Years.length > 0) {
          const yearValues = newFilters.Years.map(yearLabel => {
            const year = experimentFilters.Years.find(
              y => y.label === yearLabel,
            );
            return year?.value;
          }).filter(value => value !== undefined);
          if (yearValues.length > 0) {
            filters.push({key: 'years', value: yearValues});
          }
        }

        if (newFilters.Seasons.length > 0) {
          const seasonValues = newFilters.Seasons.map(seasonLabel => {
            const season = experimentFilters.Seasons.find(
              s => s.label === seasonLabel,
            );
            return season?.value;
          }).filter(value => value !== undefined);
          if (seasonValues.length > 0) {
            filters.push({key: 'seasons', value: seasonValues});
          }
        }

        if (newFilters.Locations.length > 0) {
          // Locations are stored as value strings, convert to numbers
          const locationValues = newFilters.Locations.map(locationValueStr => {
            return !isNaN(Number(locationValueStr))
              ? Number(locationValueStr)
              : locationValueStr;
          }).filter(value => value !== undefined);
          if (locationValues.length > 0) {
            filters.push({key: 'locations', value: locationValues});
          }
        }

        setCurrentPage(1);
        setExperimentList([]);
        setSelectedExperiment(null);
        setSelectedField(null);
        setResetExperiment(true);

        postFiltered({
          payload: {
            cropId: cropObj.value,
            page: 1,
            perPage: 10,
            filters,
            searchKeyword: '',
          },
          headers: {'Content-Type': 'application/json'},
        });
      }
    }, 0);
  };

  const buildFiltersPayload = () => {
    const fl = [];
    if (selectedFilters.Years.length) {
      // Convert year labels to values for API
      const yearValues = selectedFilters.Years.map(yearLabel => {
        const year = experimentFilters.Years.find(y => y.label === yearLabel);
        return year?.value;
      }).filter(value => value !== undefined);
      if (yearValues.length > 0) {
        fl.push({key: 'years', value: yearValues});
      }
    }
    if (selectedFilters.Seasons.length) {
      // Convert season labels to values for API
      const seasonValues = selectedFilters.Seasons.map(seasonLabel => {
        const season = experimentFilters.Seasons.find(
          s => s.label === seasonLabel,
        );
        return season?.value;
      }).filter(value => value !== undefined);
      if (seasonValues.length > 0) {
        fl.push({key: 'seasons', value: seasonValues});
      }
    }
    if (selectedFilters.Locations.length) {
      // Locations are stored as value strings, convert to numbers
      const locationValues = selectedFilters.Locations.map(locationValueStr => {
        return !isNaN(Number(locationValueStr))
          ? Number(locationValueStr)
          : locationValueStr;
      }).filter(value => value !== undefined);
      if (locationValues.length > 0) {
        fl.push({key: 'locations', value: locationValues});
      }
    }
    // Note: crops are handled via cropId field, not in filters array
    return fl;
  };

  const handleFilterApply = () => {
    // Set flag to apply filters after state updates complete
    shouldApplyFiltersAfterUpdate.current = true;
  };

  const handleFilterClearAll = () => {
    // Reset to default selections (first index of each)
    const defaultSelectedFilters = {
      Seasons:
        experimentFilters.Seasons.length > 0
          ? [experimentFilters.Seasons[0].label]
          : [],
      Locations: [],
      Years:
        experimentFilters.Years.length > 0
          ? [experimentFilters.Years[0].label]
          : [],
      Crops:
        experimentFilters.Crops.length > 0
          ? [experimentFilters.Crops[0].label]
          : [],
    };
    setSelectedFilters(defaultSelectedFilters);
    // Reset individual selected options
    if (experimentFilters.Years.length > 0) {
      setSelectedYear(experimentFilters.Years[0]);
    }
    if (experimentFilters.Seasons.length > 0) {
      setSelectedSeason(experimentFilters.Seasons[0]);
    }
    if (experimentFilters.Crops.length > 0) {
      setSelectedCrop(experimentFilters.Crops[0]);
    }
    // Clear downstream selections
    setExperimentList([]);
    setSelectedExperiment(null);
    setSelectedField(null);
    setResetExperiment(true);
    // Fetch data with default filters
    if (experimentFilters.Crops.length > 0) {
      const filters = [];
      if (experimentFilters.Years.length > 0) {
        filters.push({key: 'years', value: [experimentFilters.Years[0].value]});
      }
      if (experimentFilters.Seasons.length > 0) {
        filters.push({
          key: 'seasons',
          value: [experimentFilters.Seasons[0].value],
        });
      }
      postFiltered({
        payload: {
          cropId: experimentFilters.Crops[0].value,
          page: 1,
          perPage: 10,
          filters,
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    }
  };

  // Replace ListHeaderComponent with PlanVisit-style FilterCards
  const ListHeaderComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.filter}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <View>
            <FilterCards
              yearOptions={experimentFilters.Years.filter(
                y => !isNaN(Number(y.value)),
              ).map(y => ({label: Number(y.label), value: Number(y.value)}))}
              seasonOptions={experimentFilters.Seasons.map(s => ({
                label: s.label,
                value: s.value,
              }))}
              cropOptions={experimentFilters.Crops.filter(
                c => !isNaN(Number(c.value)),
              ).map(c => ({label: c.label, value: Number(c.value)}))}
              selectedYears={selectedFilters.Years}
              selectedSeasons={selectedFilters.Seasons}
              selectedCrops={selectedFilters.Crops}
              isDisabled={isEdit}
              disabledMessage={t(LOCALES.TAKE_NOTES.MSG_EDITING_RESTRICTED)}
              onSelectYear={yearLabels => {
                if (!isEdit) handleFilterCardsUpdate('Years', yearLabels);
              }}
              onSelectSeason={seasonLabels => {
                if (!isEdit) handleFilterCardsUpdate('Seasons', seasonLabels);
              }}
              onSelectCrop={cropLabels => {
                if (!isEdit) handleFilterCardsUpdate('Crops', cropLabels);
              }}
            />
          </View>
          <Pressable
            onPress={() => {
              if (!isEdit) setIsFilterModalVisible(true);
            }}>
            <Adfilter />
          </Pressable>
        </View>
      </View>
    ),
    [experimentFilters, selectedFilters, handleFilterCardsUpdate, isEdit, t],
  );

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isFilterModalVisible && TakeNotesStyles.modalOpen}>
      <StatusBar />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 20,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back width={24} height={24} />
        </TouchableOpacity>
        <Text style={TakeNotesStyles.ScreenTitle}>
          {isEdit
            ? t(LOCALES.TAKE_NOTES.TITLE_EDIT_NOTES)
            : t(LOCALES.TAKE_NOTES.TITLE_TAKE_NOTES)}
        </Text>
      </View>
      <View style={TakeNotesStyles.container}>
        <FlatList
          data={experimentList}
          contentContainerStyle={
            // experimentList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 10}
            experimentList?.length === 0
              ? {
                  flexGrow: 1,
                  height: '100%',
                  width: '100%',
                }
              : {}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item, index}) => null}
          keyExtractor={(_, index: any) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
        {selectedCrop && (
          <ExperimentCard
            data={experimentList}
            name="experiment"
            onExperimentSelect={!isEdit ? handleSelectedExperiment : () => {}}
            selectedItem={selectedExperiment}
            resetExperiment={resetExperiment}
            onReset={() => setResetExperiment(false)}
            isEdit={isEdit}
          />
        )}
        {selectedCrop && selectedExperiment && (
          <ExperimentCard
            data={fields}
            name={'field'}
            onExperimentSelect={!isEdit ? handleSelectedExperiment : () => {}}
            onFieldSelect={!isEdit ? handleSelectedField : () => {}}
            selectedItem={selectedField}
            isEdit={isEdit}
          />
        )}

        {selectedExperiment && selectedField && (
          <View>
            <View style={TakeNotesStyles.inputContainer}>
              <TextInput
                style={TakeNotesStyles.inputText}
                multiline={true}
                placeholder={t(LOCALES.TAKE_NOTES.PLACEHOLDER_NOTES)}
                value={text}
                onChangeText={setText}
                placeholderTextColor="#636363"
              />
            </View>
            <TouchableOpacity
              style={TakeNotesStyles.submitButton}
              onPress={onTakeNotes}>
              <Text style={TakeNotesStyles.submitButtonText}>
                {isEdit
                  ? t(LOCALES.TAKE_NOTES.BTN_UPDATE_NOTE)
                  : t(LOCALES.TAKE_NOTES.BTN_SAVE_NOTE)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FilterModal
          isVisible={isFilterModalVisible && !isEdit}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleFilterApply}
          onClearAll={handleFilterClearAll}
          onFilterSelect={handleFilterUpdate}
          filterData={{
            Years: experimentFilters.Years,
            Seasons: experimentFilters.Seasons,
            Crops: experimentFilters.Crops,
            Locations: experimentFilters.Locations,
          }}
          selectedFilters={{
            ...selectedFilters,
            Years: selectedFilters.Years.map(String),
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default TakeNotes;
