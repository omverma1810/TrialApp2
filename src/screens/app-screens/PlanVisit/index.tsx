import dayjs, {Dayjs} from 'dayjs';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Back,
  DropdownArrow,
  Search,
  Adfilter,
} from '../../../assets/icons/svgs';
import {
  Calender,
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
} from '../../../components';
import Chip from '../../../components/Chip';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import PlanVisitStyles from './PlanVisitStyles';
import Toast from '../../../utilities/toast';
import FilterCards from './Filter/FilterCards';
import FilterModal from './FilterModal';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const PlanVisit = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const language = i18n.language;
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [chipTitle, setChipTitle] = useState(
    t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT),
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  // ─── NEW state for GET_FILTERS / POST flows ───────────────────────────
  interface FilterOptionItem {
    label: string;
    value: string;
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
  const [cropList, setCropList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [seasonList, setSeasonList] = useState<string[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);
  // Flattened experiments - no more project concept
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<FilterOptionItem>(
    experimentFilters.Crops[0],
  );
  const [selectedYear, setSelectedYear] = useState<FilterOptionItem>(
    experimentFilters.Years[0] || {label: '', value: ''},
  );
  const [selectedSeason, setSelectedSeason] = useState<FilterOptionItem>(
    experimentFilters.Seasons[0] || {label: '', value: ''},
  );
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Define FilterOptionItem to accept string for value/label
  interface FilterOptionItem {
    label: string;
    value: string;
  }

  interface FilterOptions {
    Years: FilterOptionItem[];
    Crops: FilterOptionItem[];
    Seasons: FilterOptionItem[];
    Locations: FilterOptionItem[];
  }
  const [chipVisible, setChipVisible] = useState(true);
  const bottomSheetModalRef = useRef(null);
  const secondBottomSheetRef = useRef(null);

  // Ref to track when filters should be applied after state updates
  const shouldApplyFiltersAfterUpdate = useRef(false);
  const {bottom} = useSafeAreaInsets();
  const [selectedExperiment, setSelectedExperiment] = useState<any>();
  const [fields, setFields] = useState([]);
  const [resetExperiment, setResetExperiment] = useState(false);
  const [resetField, setResetField] = useState(false);
  const handleSelectedExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
  };

  const handleSelectedField = (field: any) => {
    setSelectedField(field);
  };
  const resetSelection = () => {
    setSelectedExperiment(null);
    setSelectedField(null);
    setSelectedDate(null);
    setChipTitle(t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT));
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
    setModalVisible(true);
  };

  const handleExperimentSelect = (item: Chip) => {
    setSelectedChips([item]);
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFieldSelect = (item: Chip) => {
    setSelectedField(item);
    setChipTitle(t(LOCALES.PLAN_VISIT.LBL_SELECT_VISIT_DATE));
    (secondBottomSheetRef.current as any).dismiss();
  };

  const handleOk = (date: Dayjs | null) => {
    setSelectedDate(dayjs(date));
    setModalVisible(false);
    setPayload(prevPayload => ({
      ...prevPayload,
      date: dayjs(date).format('YYYY-MM-DD'),
    }));
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

  useEffect(() => {
    if (!selectedField && !selectedDate) {
      setChipTitle(t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT));
    } else if (selectedField && !selectedDate) {
      setChipTitle(t(LOCALES.PLAN_VISIT.LBL_SELECT_VISIT_DATE));
    }
  }, [t, language, selectedField, selectedDate]);

  // ─── NEW two‐API hooks for Crops→Projects→Experiments ───────────────────
  // (Already declared above, duplicate removed)

  // ─── NEW two‐API hooks for Crops→Projects→Experiments ───────────────────
  // (Removed duplicate declaration)

  const [payload, setPayload] = useState({
    field_id: '',
    experiment_id: '',
    date: '',
    experiment_type: '',
  });

  const [planVisit, planVisitResponse] = useApi({
    url: URL.VISITS,
    method: 'POST',
  });

  const onPlanVisit = async () => {
    if (!selectedDate) {
      Toast.error({
        message: t(LOCALES.PLAN_VISIT.MSG_SELECT_FIELDS),
      });
      return;
    }
    const newData = {
      field_id: selectedField?.landVillageId,
      experiment_id: selectedExperiment?.id,
      experiment_type: selectedExperiment?.experimentType,
      date: selectedDate.format('YYYY-MM-DD'),
    };
    await planVisit({payload: newData});
  };

  useEffect(() => {
    if (planVisitResponse && planVisitResponse.status_code == 201) {
      Toast.success({
        message: t(LOCALES.PLAN_VISIT.MSG_SUCCESS),
      });
      navigation.navigate('Home', {refresh: true});
    } else {
      if (planVisitResponse) {
        Toast.error({
          message:
            t(LOCALES.PLAN_VISIT.MSG_ERROR) ||
            t(LOCALES.COMMON.MSG_GENERIC_ERROR),
        });
      }
    }
  }, [planVisitResponse]);

  const [getFields, getFieldsResponse] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  useEffect(() => {
    if (selectedExperiment) {
      const queryParams = `experimentType=${selectedExperiment?.experimentType}`;
      getFields({
        pathParams: selectedExperiment?.id,
        queryParams,
      });
    }
  }, [selectedExperiment]);

  useEffect(() => {
    if (getFieldsResponse && getFieldsResponse.status_code == 200) {
      setFields(getFieldsResponse.data.locationList);
    }
  }, [getFieldsResponse]);

  useEffect(() => {}, []);

  // ─── NEW two‐API hooks for Crops→Projects→Experiments ───────────────────
  const [getFilters, filtersData, isFiltersLoading] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });
  const [postFiltered, filteredData, isFilteredLoading] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  // 1) Fetch filter metadata on mount
  useEffect(() => {
    getFilters();
  }, [getFilters]);

  // 2) When filters arrive, populate Crops & default‐fetch experiments
  useEffect(() => {
    if (filtersData?.status_code === 200 && filtersData.filters) {
      const {Crops, Years, Seasons} = filtersData.filters;
      setExperimentFilters(filtersData.filters);
      setCropList(Crops.map((c: {label: string; value: string}) => c.label));
      setYearList(Years.map((y: {label: string; value: string}) => y.label));
      setSeasonList(
        Seasons.map((s: {label: string; value: string}) => s.label),
      );
      setLocationList(
        filtersData.filters.Locations.map(
          (l: {label: string; value: string}) => l.label,
        ),
      );

      // Set default selected filters
      const defaultSelectedFilters = {
        Seasons: Seasons.length > 0 ? [Seasons[0].label] : [],
        Locations: [],
        Years: Years.length > 0 ? [Years[0].label] : [],
        Crops: Crops.length > 0 ? [Crops[0].label] : [],
      };
      setSelectedFilters(defaultSelectedFilters);

      // Set individual selected options
      if (Years.length > 0) setSelectedYear(Years[0]);
      if (Seasons.length > 0) setSelectedSeason(Seasons[0]);
      if (Crops.length > 0) setSelectedCrop(Crops[0]);

      // Build filters payload with default selections
      const filters = [];
      if (Years.length > 0)
        filters.push({key: 'years', value: [Years[0].value]});
      if (Seasons.length > 0)
        filters.push({key: 'seasons', value: [Seasons[0].value]});
      // Note: crops are handled via cropId field, not in filters array

      // Fetch data with default filters
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
  }, [filtersData, postFiltered]);

  // 3) When POST returns { projects }, populate projectList & default first
  // Process filtered experiments (flattened approach like Experiment screen)
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    if (filteredData?.projects) {
      // Flatten all experiments from all projects - following Experiment screen approach
      const uniqueExpMap = new Map<number, any>();

      Object.entries(filteredData.projects).forEach(
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
        filteredData.totalExperiments || flattenedExperiments.length,
      );
      setHasMore(flattenedExperiments.length === 10); // Assuming 10 per page
      setLoadingMore(false);
    }
  }, [filteredData, currentPage]);

  // ─── Handler for Crop selection ──────────────────────────────
  const handleCropSelect = useCallback(
    (label: string) => {
      const opt = experimentFilters.Crops.find(c => c.label === label);
      if (!opt) return;
      setSelectedCrop(opt); // <-- set the full object, not just label
      // clear everything downstream when crop changes
      setSelectedExperiment(null);
      setSelectedField(null);
      setSelectedDate(null);
      setResetExperiment(true);
      setResetField(true);
      setExperimentList([]);
      // reset pagination when crop changes
      setCurrentPage(1);
      // Use selectedYear if available
      const filters = [];
      if (selectedYear && selectedYear.value && selectedYear.value !== '') {
        filters.push({key: 'years', value: [selectedYear.value]});
      }
      if (selectedFilters.Locations.length > 0) {
        const locationValues = selectedFilters.Locations.map(locationLabel => {
          const location = experimentFilters.Locations.find(
            l => l.label === locationLabel,
          );
          return location?.value;
        }).filter(value => value !== undefined);
        if (locationValues.length > 0) {
          filters.push({key: 'locations', value: locationValues});
        }
      }
      postFiltered({
        payload: {
          cropId: opt.value,
          page: 1,
          perPage: 10,
          filters,
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedYear],
  );

  const handleYearSelect = useCallback(
    (label: string) => {
      const yearOption = experimentFilters.Years.find(
        y => String(y.label) === String(label),
      ) || {label: '', value: ''};
      setSelectedYear(yearOption);
      setSelectedExperiment(null);
      setSelectedField(null);
      setSelectedDate(null);
      setResetExperiment(true);
      setResetField(true);
      setExperimentList([]);
      setCurrentPage(1);

      if (!selectedCrop) return;

      // Build filters array
      const filters = [];
      if (yearOption.value && yearOption.value !== '') {
        filters.push({key: 'years', value: [yearOption.value]});
      }
      if (selectedFilters.Locations.length > 0) {
        const locationValues = selectedFilters.Locations.map(locationLabel => {
          const location = experimentFilters.Locations.find(
            l => l.label === locationLabel,
          );
          return location?.value;
        }).filter(value => value !== undefined);
        if (locationValues.length > 0) {
          filters.push({key: 'locations', value: locationValues});
        }
      }

      postFiltered({
        payload: {
          cropId: selectedCrop.value,
          page: 1,
          perPage: 10,
          filters,
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedCrop],
  );

  const handleSeasonSelect = useCallback(
    (label: string) => {
      const seasonOption = experimentFilters.Seasons.find(
        s => String(s.label) === String(label),
      ) || {label: '', value: ''};
      setSelectedSeason(seasonOption);

      // Reset downstream selections
      setSelectedExperiment(null);
      setSelectedField(null);
      setSelectedDate(null);
      setResetExperiment(true);
      setResetField(true);
      setExperimentList([]);
      setCurrentPage(1);

      if (!selectedCrop) return;

      // Build filters array
      const filters = [];
      if (seasonOption.value && seasonOption.value !== '') {
        filters.push({key: 'seasons', value: [seasonOption.value]});
      }
      if (selectedYear.value && selectedYear.value !== '') {
        filters.push({key: 'years', value: [selectedYear.value]});
      }
      if (selectedFilters.Locations.length > 0) {
        const locationValues = selectedFilters.Locations.map(locationLabel => {
          const location = experimentFilters.Locations.find(
            l => l.label === locationLabel,
          );
          return location?.value;
        }).filter(value => value !== undefined);
        if (locationValues.length > 0) {
          filters.push({key: 'locations', value: locationValues});
        }
      }

      postFiltered({
        payload: {
          cropId: selectedCrop.value,
          page: 1,
          perPage: 10,
          filters,
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedCrop, selectedYear],
  );

  // Load more experiments handler for pagination
  const loadMoreExperiments = () => {
    if (loadingMore || !hasMore || !selectedCrop) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    const filters = buildFiltersPayload();
    postFiltered({
      payload: {
        cropId: selectedCrop.value,
        page: nextPage,
        perPage: 10,
        filters,
        searchKeyword: '',
      },
      headers: {'Content-Type': 'application/json'},
    });
  };

  const ListEmptyComponent = useMemo(
    () => (
      <View style={PlanVisitStyles.emptyContainer}>
        {filteredData ? (
          <Loader />
        ) : (
          <Text style={PlanVisitStyles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [filteredData, t],
  );

  // const ListHeaderComponent = useMemo(
  //   () => (
  //     <View style={PlanVisitStyles.filter}>
  //       <Filter
  //         title={t(LOCALES.EXPERIMENT.LBL_CROP)}
  //         options={cropList}
  //         selectedOption={selectedCrop.label}
  //         onPress={handleCropSelect}
  //       />
  //       <Filter
  //         title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
  //         options={projectList}
  //         selectedOption={selectedProject}
  //         onPress={handleProjectSelect}
  //         onScroll={handleProjectScroll} // (+) hook up pagination
  //       />
  //     </View>
  //   ),
  //   [cropList, projectList, selectedCrop, selectedProject],
  // );

  // // const ListHeaderComponent = useMemo(
  //   () => (
  //     <FilterCards
  //       yearOptions={experimentFilters.Years}
  //       seasonOptions={experimentFilters.Seasons}
  //       cropOptions={experimentFilters.Crops}
  //       // pull strings out of those objects (fallback safely)
  //       selectedYear={
  //         selectedFilters.Years[0] ||
  //         experimentFilters.Years[0]?.label.toString() ||
  //         ''
  //       }
  //       selectedSeason={
  //         selectedFilters.Seasons[0] ||
  //         experimentFilters.Seasons[0]?.label ||
  //         ''
  //       }
  //       selectedCrop={selectedCrop?.label || cropOptions[0]?.label || ''}
  //       // handlers: update your filters / crop selection
  //       onSelectYear={yearLabel => {
  //         handleFilterUpdate('Years', [yearLabel]);
  //       }}
  //       onSelectSeason={seasonLabel => {
  //         handleFilterUpdate('Seasons', [seasonLabel]);
  //       }}
  //       onSelectCrop={cropLabel => handleCropSelection(cropLabel, true)}
  //     />
  //   ),
  //   [
  //     experimentFilters,
  //     selectedFilters,
  //     selectedCrop,
  //     cropOptions,
  //     handleFilterUpdate,
  //     handleCropSelection,
  //   ],
  // );

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
      setSelectedDate(null);
      setResetExperiment(true);
      setResetField(true);

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

  // Handler for FilterModal - batches updates, no immediate API call
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

  // Handler for FilterCards - triggers immediate API call
  const handleFilterCardsUpdate = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    values: string[],
  ) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
      return;
    }

    // Create new filters
    const newFilters = {...selectedFilters, [filterType]: values};

    // Update state
    setSelectedFilters(newFilters);

    // Trigger immediate API call with new filters
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
        setSelectedDate(null);
        setResetExperiment(true);
        setResetField(true);

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

  const ListHeaderComponent1 = useMemo(
    () => (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
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
              onSelectYear={yearLabels => {
                handleFilterCardsUpdate('Years', yearLabels);
              }}
              onSelectSeason={seasonLabels => {
                handleFilterCardsUpdate('Seasons', seasonLabels);
              }}
              onSelectCrop={cropLabels => {
                handleFilterCardsUpdate('Crops', cropLabels);
              }}
            />
          </View>
          <Pressable onPress={() => setIsFilterModalVisible(true)}>
            <Adfilter />
          </Pressable>
        </View>
      </View>
    ),
    [experimentFilters, selectedFilters, handleFilterCardsUpdate, language],
  );

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
    setSelectedDate(null);
    setResetExperiment(true);
    setResetField(true);

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

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar />
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Back width={24} height={24} />
          </TouchableOpacity>
          <Text style={PlanVisitStyles.ScreenTitle}>
            {t(LOCALES.PLAN_VISIT.TITLE_PLAN_VISIT)}
          </Text>
        </View>

        <View style={PlanVisitStyles.container}>
          <View style={PlanVisitStyles.container}>
            <FlatList
              data={experimentList}
              contentContainerStyle={
                // experimentList?.length === 0 ? {flexGrow: 1} : {paddingBottom: 10}
                experimentList?.length === 0
                  ? {
                      height: '100%',
                      width: '100%',
                    }
                  : {paddingVertical: 10}
              }
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={ListHeaderComponent1}
              renderItem={({item, index}) => null}
              keyExtractor={(_, index) => index.toString()}
              ListEmptyComponent={ListEmptyComponent}
              onEndReached={() => {
                if (!loadingMore && hasMore) {
                  loadMoreExperiments();
                }
              }}
              onEndReachedThreshold={0.8}
              ListFooterComponent={loadingMore ? <Loader /> : null}
            />
          </View>
          {selectedCrop && (
            <ExperimentCard
              data={experimentList}
              onExperimentSelect={handleSelectedExperiment}
              name={'experiment'}
              onFieldSelect={handleSelectedField}
              isProjectSelected={!!selectedExperiment}
              resetExperiment={resetExperiment}
              onReset={() => setResetExperiment(false)}
              onEndReached={loadMoreExperiments}
            />
          )}
          {selectedCrop && selectedExperiment && (
            <ExperimentCard
              data={fields}
              name={'field'}
              onExperimentSelect={handleSelectedField}
              onFieldSelect={handleSelectedField}
              onReset={() => setResetField(false)}
              resetExperiment={resetSelection}
              selectedField={selectedField}
              selectedDate={selectedDate}
            />
          )}
          {selectedExperiment && selectedField && !selectedDate && (
            <Pressable
              style={PlanVisitStyles.chipItem}
              onPress={() => setModalVisible(true)}>
              <View style={PlanVisitStyles.chipTextRow}>
                <Text style={PlanVisitStyles.chipText}>
                  {t(LOCALES.PLAN_VISIT.LBL_SELECT_VISIT_DATE)}
                </Text>
                <DropdownArrow />
              </View>
            </Pressable>
          )}
          {selectedDate && (
            <View style={PlanVisitStyles.dateContainer}>
              <Text style={PlanVisitStyles.dateTitle}>
                {t(LOCALES.PLAN_VISIT.LBL_DATE)}
              </Text>
              <Text style={PlanVisitStyles.dateText}>
                {selectedDate.format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
          )}
          {selectedDate && (
            <Pressable
              style={PlanVisitStyles.submitButton}
              onPress={onPlanVisit}>
              <Text style={PlanVisitStyles.submitButtonText}>
                {t(LOCALES.PLAN_VISIT.BTN_PLAN_VISIT)}
              </Text>
            </Pressable>
          )}
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

          <FilterModal
            isVisible={isFilterModalVisible}
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
            selectedFilters={selectedFilters}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlanVisit;
