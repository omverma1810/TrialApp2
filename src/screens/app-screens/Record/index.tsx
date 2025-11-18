import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DropdownArrow, Plus, Adfilter} from '../../../assets/icons/svgs';
import Cancel from '../../../assets/icons/svgs/Cancel';
import {Loader, SafeAreaView, StatusBar} from '../../../components';
import BottomModal from '../../../components/BottomSheetModal';
import CheckBox from '../../../components/CheckBox';
import Chip from '../../../components/Chip';
import RecordDropDown from '../../../components/RecordDropdown';
import TraitSection from '../../../components/TraitComponent';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import Toast from '../../../utilities/toast';
import NewRecordOptionsModal from '../Experiment/NewRecordOptionsModal';
import TakeNotesStyles from '../TakeNotes/TakeNotesStyle';
import Filter from './Filter';
import RecordStyles from './RecordStyles';
import FilterCards from '../PlanVisit/Filter/FilterCards';
import FilterModal from '../PlanVisit/FilterModal';
import {formatExperimentTypeForDisplay} from '../../../utilities/experimentTypeUtils';

//
// ——— Types for filter-driven flow —————————————————————————————
//
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

interface SelectedFieldData {
  fieldName: string;
  plots: any;
}

const Record: React.FC<any> = ({navigation}) => {
  const {t} = useTranslation();
  const {bottom} = useSafeAreaInsets();

  //
  // ——— New state for crop → project → experiment ——————————————————————————
  //
  const [experimentFilters, setExperimentFilters] = useState<FilterOptions>({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });
  const [selectedYear, setSelectedYear] = useState<FilterOptionItem | null>(
    null,
  );
  const [selectedSeason, setSelectedSeason] = useState<FilterOptionItem | null>(
    null,
  );
  const [cropOptions, setCropOptions] = useState<
    {label: string; value: number}[]
  >([]);
  const [cropList, setCropList] = useState<string[]>([]);
  // Flattened experiments - no more project concept
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState<{
    label: string;
    value: number;
  } | null>(null);
  const [experimentList, setExperimentList] = useState<any[]>([]);

  //
  // ——— Existing Record state (unchanged) ——————————————————————————————
  //
  const [selectedExperiment, setSelectedExperiment] = useState<any | null>(
    null,
  );
  const [chipTitle, setChipTitle] = useState('Select an Experiment');
  const [inputVisible, setInputVisible] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModalMethods>(null);
  const secondBottomModalRef = useRef<BottomSheetModalMethods>(null);

  // Ref to track when filters should be applied after state updates
  const shouldApplyFiltersAfterUpdate = useRef(false);

  const [activeListButton, setActiveListButton] = useState('Plot');
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [fields, setFields] = useState<any[]>([]);
  const [experimentType, setExperimentType] = useState<string | null>(null);
  const [locationIds, setLocationIds] = useState<any[]>([]);
  const [traitData, setTraitData] = useState<any>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingTraitData, setIsLoadingTraitData] = useState(false);
  const [isLoadingPlotData, setIsLoadingPlotData] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
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

  //
  // ——— API hooks for new endpoints ———————————————————————————————
  //
  const [getFilters, filtersApiData, isFiltersLoading] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });
  const [postFiltered, filteredProjectsData, isPostLoading] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  //
  // 1️⃣ Fetch filter options on mount
  //
  useEffect(() => {
    getFilters();
  }, [getFilters]);

  //
  // 2️⃣ When GET_FILTERS returns, populate crops & auto-select first
  //
  useEffect(() => {
    if (filtersApiData?.status_code === 200 && filtersApiData.filters) {
      const {Crops, Years, Seasons} = filtersApiData.filters;
      setExperimentFilters(filtersApiData.filters);

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
      if (Crops.length > 0)
        filters.push({key: 'crops', value: [Crops[0].value]});

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
  }, [filtersApiData, postFiltered]);

  //
  // Build filters payload for POST
  //
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
      // Locations are stored as value strings, convert to numbers for API
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

  //
  // 3️⃣ Handle crop selection: reset downstream & POST projects+experiments
  //
  const handleCropSelect = useCallback(
    (label: string) => {
      const crop = (experimentFilters.Crops as any[]).find(
        (c: any) => c && c.label === label,
      );
      if (!crop) return;
      setSelectedCrop(crop);
      setSelectedExperiment(null);
      // Clear selected fields when crop changes
      setSelectedFields({});
      setLocationIds([]);
      setTraitData(null);
      setPlotData(null);
      setSelectedYear((experimentFilters.Years as any[])[0] || null);
      setSelectedSeason((experimentFilters.Seasons as any[])[0] || null);
      postFiltered({
        payload: {
          cropId: (crop as any).value,
          page: 1,
          perPage: 10,
          filters: [
            {key: 'years', value: [(selectedYear as any)?.value || '']},
            {key: 'seasons', value: [(selectedSeason as any)?.value || '']},
            ...(selectedFilters.Locations.length > 0
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
              : []),
          ],
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedYear, selectedSeason],
  );
  const handleYearSelect = useCallback(
    (label: string) => {
      const year = (experimentFilters.Years as any[]).find(
        (y: any) => y && String(y.label) === String(label),
      );
      setSelectedYear(year || null);
      setSelectedExperiment(null);
      // Clear selected fields when year changes
      setSelectedFields({});
      setLocationIds([]);
      setTraitData(null);
      setPlotData(null);
      postFiltered({
        payload: {
          cropId:
            selectedCrop && (selectedCrop as any).value
              ? (selectedCrop as any).value
              : '',
          page: 1,
          perPage: 10,
          filters: [
            {key: 'years', value: [(year as any)?.value || '']},
            {key: 'seasons', value: [(selectedSeason as any)?.value || '']},
            ...(selectedFilters.Locations.length > 0
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
              : []),
          ],
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedCrop, selectedSeason],
  );
  const handleSeasonSelect = useCallback(
    (label: string) => {
      const season = (experimentFilters.Seasons as any[]).find(
        (s: any) => s && String(s.label) === String(label),
      );
      setSelectedSeason(season || null);
      setSelectedExperiment(null);
      // Clear selected fields when season changes
      setSelectedFields({});
      setLocationIds([]);
      setTraitData(null);
      setPlotData(null);
      postFiltered({
        payload: {
          cropId:
            selectedCrop && (selectedCrop as any).value
              ? (selectedCrop as any).value
              : '',
          page: 1,
          perPage: 10,
          filters: [
            {key: 'years', value: [(selectedYear as any)?.value || '']},
            {key: 'seasons', value: [(season as any)?.value || '']},
            ...(selectedFilters.Locations.length > 0
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
              : []),
          ],
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    },
    [experimentFilters, postFiltered, selectedCrop, selectedYear],
  );

  // useEffect to apply filters when flag is set and state has updated
  useEffect(() => {
    if (shouldApplyFiltersAfterUpdate.current) {
      shouldApplyFiltersAfterUpdate.current = false;

      // Build filters payload from selectedFilters
      const filters = buildFiltersPayload();
      setCurrentPage(1);
      setExperimentList([]);
      setSelectedExperiment(null);
      setSelectedFields({});
      setLocationIds([]);
      setTraitData(null);
      setPlotData(null);

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

  // Handler for FilterModal (batched updates)
  const handleFilterUpdate = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    values: string[],
  ) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      if (typeof Toast !== 'undefined' && Toast.error) {
        Toast.error({message: 'Please select only one crop at a time.'});
      }
      return;
    }

    // Update state using functional update
    setSelectedFilters(prev => {
      const newFilters = {...prev, [filterType]: values};
      return newFilters;
    });

    // DON'T trigger API call here - let FilterModal's Apply button handle it
  };

  // Handler for FilterCards (immediate API call)
  const handleFilterCardsUpdate = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    values: string[],
  ) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      if (typeof Toast !== 'undefined' && Toast.error) {
        Toast.error({message: 'Please select only one crop at a time.'});
      }
      return;
    }

    const newFilters = {...selectedFilters, [filterType]: values};

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
        setSelectedFields({});
        setLocationIds([]);
        setTraitData(null);
        setPlotData(null);

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
    // Clear selected fields when filters are cleared
    setSelectedFields({});
    setLocationIds([]);
    setTraitData(null);
    setPlotData(null);

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

  //
  // Process filtered experiments (flattened approach like Experiment screen)
  //
  useEffect(() => {
    if (!filteredProjectsData?.projects) return;

    // Flatten all experiments from all projects - following Experiment screen approach
    const uniqueExpMap = new Map<number, any>();

    Object.entries(filteredProjectsData.projects).forEach(
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
      filteredProjectsData.totalExperiments || flattenedExperiments.length,
    );
  }, [filteredProjectsData, currentPage]);

  //
  // Load more experiments handler for pagination
  //
  const loadMoreExperiments = useCallback(() => {
    const hasMore = experimentList.length < totalExperiments;
    if (!isPostLoading && hasMore && selectedCrop) {
      const next = currentPage + 1;
      setCurrentPage(next);
      postFiltered({
        payload: {
          cropId: selectedCrop.value,
          page: next,
          perPage: 10,
          filters: buildFiltersPayload(),
          searchKeyword: '',
        },
        headers: {'Content-Type': 'application/json'},
      });
    }
  }, [
    isPostLoading,
    experimentList.length,
    totalExperiments,
    currentPage,
    selectedCrop,
    buildFiltersPayload,
    postFiltered,
  ]);

  //
  // ——— Experiment selection & field/trait/plot logic (unchanged) —————————
  //
  const handleRightIconClick = () => bottomSheetModalRef.current?.present();
  const handleExperimentSelect = (item: any) => {
    setSelectedExperiment(item);
    setChipTitle(item.fieldExperimentName);
    setTraitData(null);
    setPlotData(null);
    setLoading(false);
    setIsLoadingTraitData(false);
    setIsLoadingPlotData(false);
    setExperimentType(item.experimentType);
    // Clear selected fields when experiment changes
    setSelectedFields({});
    setLocationIds([]);
    (bottomSheetModalRef.current as any).dismiss();
  };

  const [getFields, getFieldsResponse] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  useEffect(() => {
    if (selectedExperiment) {
      getFields({
        pathParams: selectedExperiment.id,
        queryParams: `experimentType=${selectedExperiment.experimentType}`,
      });
    }
  }, [selectedExperiment, getFields]);

  useEffect(() => {
    if (getFieldsResponse?.status_code === 200) {
      setFields(getFieldsResponse.data.locationList);
    }
  }, [getFieldsResponse]);

  const [getLocationTraitData, locationTraitDataResponse] = useApi({
    url: URL.MULTI_TRIAL_LOCATION,
    method: 'POST',
  });
  const [locationPlotData, locationPlotDataResponse] = useApi({
    url: URL.MULTI_TRIAL_LOCATION,
    method: 'POST',
  });

  useEffect(() => {
    if (locationTraitDataResponse?.status_code === 200) {
      setTraitData(locationTraitDataResponse.data);
      setIsLoadingTraitData(false);
    } else if (
      locationTraitDataResponse?.status_code &&
      locationTraitDataResponse.status_code !== 200
    ) {
      setIsLoadingTraitData(false);
    }
  }, [locationTraitDataResponse]);

  useEffect(() => {
    if (locationPlotDataResponse?.status_code === 200) {
      setPlotData(locationPlotDataResponse.data);
      setIsLoadingPlotData(false);
    } else if (
      locationPlotDataResponse?.status_code &&
      locationPlotDataResponse.status_code !== 200
    ) {
      setIsLoadingPlotData(false);
    }
  }, [locationPlotDataResponse]);

  // Combined loading effect - set loading to false when both API calls complete (regardless of success/failure)
  useEffect(() => {
    if (!isLoadingTraitData && !isLoadingPlotData) {
      setLoading(false);
    }
  }, [isLoadingTraitData, isLoadingPlotData]);

  const fetchTraitData = () => {
    setIsLoadingTraitData(true);
    getLocationTraitData({
      payload: {
        experimentId: selectedExperiment?.id,
        experimentType: experimentType || 'line',
        locationIds,
        apiCallType: 'trait',
      },
      headers: {'Content-Type': 'application/json'},
    });
  };

  const fetchPlotData = () => {
    setIsLoadingPlotData(true);
    locationPlotData({
      payload: {
        experimentId: selectedExperiment?.id,
        experimentType: experimentType || 'line',
        locationIds,
        apiCallType: 'plot',
      },
      headers: {'Content-Type': 'application/json'},
    });
  };

  useEffect(() => {
    if (locationIds.length > 0) {
      setLoading(true);
      // Reset previous data
      setTraitData(null);
      setPlotData(null);
      // Start fetching both data sets
      fetchTraitData();
      fetchPlotData();

      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setIsLoadingTraitData(false);
        setIsLoadingPlotData(false);
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(timeoutId);
    } else {
      // Reset loading states when no locations are selected
      setLoading(false);
      setIsLoadingTraitData(false);
      setIsLoadingPlotData(false);
      setTraitData(null);
      setPlotData(null);
    }
  }, [locationIds]);

  // field selection handlers left unchanged
  const handleFieldSelect = (id: string) => {
    const isSelected = !selectedFields[id];
    setSelectedFields(prev => {
      const updated = {...prev, [id]: isSelected};
      if (!isSelected) delete updated[id];

      // Reset data but don't reset loading states here - let the useEffect handle it
      setTraitData(null);
      setPlotData(null);
      setLocationIds(Object.keys(updated).filter(k => updated[k]));

      // Close the modal immediately when fields are selected and we'll start loading
      if (Object.keys(updated).filter(k => updated[k]).length > 0) {
        secondBottomModalRef.current?.close();
      }

      return updated;
    });
  };

  //
  // ——— UI Components & Layout —————————————————————————————————————
  //
  const ListEmptyComponent = useMemo(
    () => (
      <View style={TakeNotesStyles.emptyContainer}>
        {isPostLoading || isFiltersLoading ? (
          <View style={RecordStyles.loaderContainer}>
            <Loader />
          </View>
        ) : (
          <Text style={TakeNotesStyles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isPostLoading, isFiltersLoading],
  );

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
    [experimentFilters, selectedFilters, handleFilterCardsUpdate],
  );

  const handleListPress = (button: string) => setActiveListButton(button);
  const onNewRecordClick = () => setIsOptionModalVisible(true);
  const onCloseOptionsModalClick = () => setIsOptionModalVisible(false);
  const onSelectFromList = () => {
    setIsOptionModalVisible(false);
    navigation.navigate('NewRecord');
  };

  useEffect(() => {
    if (cropList.length && !selectedCrop) {
      handleCropSelect(cropList[0]);
    }
  }, [cropList, selectedCrop, handleCropSelect]);

  function handleSecondBottomModalOpen(): void {
    if (fields.length > 0) {
      secondBottomModalRef.current?.present();
    }
  }
  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && RecordStyles.modalOpen}>
      <StatusBar />
      <View>
        <Text style={RecordStyles.ScreenTitle}>Record</Text>
      </View>

      {/* Filters header area */}
      <View style={RecordStyles.container}>
        <FlatList
          data={experimentList}
          contentContainerStyle={
            experimentList.length === 0
              ? {
                  flexGrow: 1,
                  height: '100%',
                  width: '100%',
                }
              : {}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={() => null}
          keyExtractor={(_, i) => i.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={RecordStyles.container}>
          {selectedCrop && !selectedExperiment && (
            <Chip
              onPress={handleRightIconClick}
              rightIcon={<DropdownArrow />}
              onRightIconClick={handleRightIconClick}
              containerStyle={RecordStyles.chip}
              customLabelStyle={RecordStyles.chipLabel}
              title="Select an Experiment"
              isSelected={false}
            />
          )}

          <View style={RecordStyles.experimentContainer}>
            {selectedExperiment && (
              <Pressable onPress={handleRightIconClick}>
                <View style={TakeNotesStyles.chipItem}>
                  <Text style={TakeNotesStyles.chipTitle}>Experiment</Text>
                  <View style={TakeNotesStyles.chipTextRow}>
                    <Text style={TakeNotesStyles.chipText}>
                      {selectedExperiment.fieldExperimentName}
                    </Text>
                    <DropdownArrow />
                  </View>
                  <View
                    style={[
                      TakeNotesStyles.chipCropText,
                      {
                        backgroundColor:
                          selectedExperiment.experimentType === 'hybrid'
                            ? '#fdf8ee'
                            : selectedExperiment.experimentType === 'line'
                            ? '#fcebea'
                            : '#eaf4e7',
                      },
                    ]}>
                    <Text style={TakeNotesStyles.chipCropText1}>
                      {formatExperimentTypeForDisplay(
                        selectedExperiment?.experimentType,
                      )}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>

          {selectedExperiment && (
            <View style={RecordStyles.inputContainer}>
              <Pressable onPress={handleSecondBottomModalOpen}>
                <View style={RecordStyles.fieldContainer}>
                  <View style={RecordStyles.fieldRow}>
                    {Object.values(selectedFields).some(
                      isSelected => isSelected,
                    ) ? (
                      <View style={RecordStyles.selectedFieldsWrapper}>
                        {Object.keys(selectedFields).map((fieldId, index) => {
                          if (
                            fieldId in selectedFields &&
                            selectedFields[fieldId]
                          ) {
                            const matchedField = fields.find(
                              field => String(field?.id) === String(fieldId),
                            );

                            if (!matchedField) {
                              return (
                                <View
                                  key={fieldId}
                                  style={RecordStyles.selectedFieldContainer}>
                                  <Text style={RecordStyles.fieldName}>
                                    {fieldId} - Unknown
                                  </Text>
                                  <Pressable
                                    onPress={() => handleFieldSelect(fieldId)}>
                                    <Cancel />
                                  </Pressable>
                                </View>
                              );
                            }

                            return (
                              <View
                                key={fieldId}
                                style={RecordStyles.selectedFieldContainer}>
                                <Text style={RecordStyles.fieldName}>
                                  {matchedField.location.fieldLabel}
                                </Text>
                                <Pressable
                                  onPress={() => handleFieldSelect(fieldId)}>
                                  <Cancel />
                                </Pressable>
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>
                    ) : (
                      <Text style={RecordStyles.fieldTitle}>All Fields</Text>
                    )}
                    <Pressable onPress={handleSecondBottomModalOpen}>
                      <DropdownArrow />
                    </Pressable>
                  </View>
                </View>
              </Pressable>

              {selectedFields && plotData && traitData && !loading && (
                <View style={RecordStyles.inputContainer}>
                  <View style={RecordStyles.listByContainer}>
                    <Text style={RecordStyles.listByText}> List By</Text>
                    <View style={RecordStyles.listByButtonsContainer}>
                      <Pressable
                        onPress={() => handleListPress('Plot')}
                        style={[
                          RecordStyles.listByButton,
                          activeListButton === 'Plot'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Plot' ? 'white' : '#0E3C74',
                          }}>
                          Plots
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleListPress('Traits')}
                        style={[
                          RecordStyles.listByButton,
                          {
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            width: '20%',
                          },
                          activeListButton === 'Traits'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Traits'
                                ? 'white'
                                : '#0E3C74',
                          }}>
                          Traits
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  {activeListButton === 'Plot' && (
                    <RecordDropDown
                      selectedFields={selectedFields}
                      projectData={plotData}
                      experimentType={experimentType}
                      fields={fields}
                    />
                  )}
                  {activeListButton === 'Traits' && (
                    <TraitSection
                      selectedFields={selectedFields}
                      projectData={traitData}
                      fields={fields}
                      allPlotsData={plotData} // <-- ADD THIS NEW PROP
                    />
                  )}
                </View>
              )}

              {/* Loading state for plot and trait data */}
              {(() => {
                const hasSelectedFields =
                  selectedFields &&
                  Object.values(selectedFields).some(isSelected => isSelected);

                if (hasSelectedFields && loading) {
                  return (
                    <View
                      style={[
                        RecordStyles.loaderContainer,
                        {
                          minHeight: 400,
                          height: '80%',
                          marginTop: 20,
                          marginBottom: 50,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#e9ecef',
                          paddingVertical: 60,
                          paddingHorizontal: 20,
                        },
                      ]}>
                      <Loader />
                      <Text
                        style={[
                          RecordStyles.noDataText,
                          {marginTop: 20, fontSize: 16},
                        ]}>
                        Loading plots and traits data...
                      </Text>
                      <Text
                        style={[
                          RecordStyles.noDataText,
                          {marginTop: 10, fontSize: 14, opacity: 0.7},
                        ]}>
                        Please wait while we fetch the data
                      </Text>
                    </View>
                  );
                } else {
                  return null;
                }
              })()}
            </View>
          )}

          <BottomModal
            bottomSheetModalRef={bottomSheetModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select an Experiment</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {experimentList &&
                    experimentList.map((item, index) => (
                      <Pressable
                        key={`${item?.id}-${index}`}
                        onPress={() => handleExperimentSelect(item)}
                        style={RecordStyles.modalItem}>
                        <Text style={RecordStyles.modalItemText}>
                          {item.fieldExperimentName}
                        </Text>
                        <Text
                          style={[
                            TakeNotesStyles.modalItemCropText,
                            {
                              backgroundColor:
                                item.experimentType === 'hybrid'
                                  ? '#fdf8ee'
                                  : item.experimentType === 'line'
                                  ? '#fcebea'
                                  : '#eaf4e7',
                            },
                          ]}>
                          {formatExperimentTypeForDisplay(item.experimentType)}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>

          <BottomModal
            bottomSheetModalRef={secondBottomModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select a Field</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {fields.length ? (
                    fields.map((field: any) => (
                      <View
                        key={field.id}
                        style={RecordStyles.fieldCheckboxContainer}>
                        <CheckBox
                          value={!!selectedFields[field.id]}
                          onChange={() => handleFieldSelect(field.id)}
                        />
                        <Pressable onPress={() => handleFieldSelect(field.id)}>
                          <Text style={RecordStyles.fieldCheckboxText}>
                            {field.location.fieldName}
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  ) : (
                    <Loader />
                  )}
                </View>
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      </ScrollView>
      {!isOptionModalVisible && (
        <Pressable style={RecordStyles.newRecord} onPress={onNewRecordClick}>
          <Plus />
        </Pressable>
      )}

      <NewRecordOptionsModal
        isModalVisible={isOptionModalVisible}
        closeModal={onCloseOptionsModalClick}
        onSelectFromList={onSelectFromList}
      />

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
        selectedFilters={{
          ...selectedFilters,
          Years: selectedFilters.Years.map(String),
        }}
      />
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
