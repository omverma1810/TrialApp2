import React, {useMemo, useState, useEffect} from 'react';
import Toast from '../../../../utilities/toast';
import {Pressable, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppStackParamList} from '../../../../types/navigation/appTypes';

import {styles} from '../styles';
import {CardArrowDown, Close, Search} from '../../../../assets/icons/svgs';
import {LOCALES} from '../../../../localization/constants';
import Filter from '../Filter';
import {useRecord} from '../RecordContext';
import {useRecordApi} from '../RecordApiContext';
import {Input, Loader} from '../../../../components';
import {FONTS} from '../../../../theme/fonts';
import {ExperimentStackParamList} from '../../../../types/navigation/appTypes';
import FilterCards from '../../PlanVisit/Filter/FilterCards';
import {formatExperimentTypeForDisplay} from '../../../../utilities/experimentTypeUtils';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type CropOption = {
  label: string;
  value: string;
};

type ExperimentItem = {
  id: string;
  fieldExperimentName: string;
  experimentType: string;
  designType: string;
  season: string;
};

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  filters: {Seasons: string[]; Locations: string[]; Years: string[]};
  onFiltersChange?: (filters: {
    Seasons: string[];
    Locations: string[];
    Years: string[];
  }) => void;
}

const SelectExperiment: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  filters,
  onFiltersChange,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const {
    filtersData,
    isFiltersLoading,
    postFilteredExperiments,
    filteredExperimentsData,
    isFilteredLoading,
  } = useRecordApi();

  const cropOptions = useMemo(
    () => filtersData?.filters?.Crops ?? [],
    [filtersData],
  );
  const apiCropList = useMemo(
    () => cropOptions?.map((c: CropOption) => c.label) ?? [],
    [cropOptions],
  );

  // Use a unified selectedFilters state like other screens
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

  // Keep individual states for backward compatibility
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  const [page, setPage] = useState(1);
  // Flattened experiments - no more project concept
  const [allExperiments, setAllExperiments] = useState<ExperimentItem[]>([]);

  const {selectedExperiment, handleExperimentSelect, getExperimentTypeColor} =
    useRecord();

  // Sync internal selectedFilters with parent filters prop
  useEffect(() => {
    setSelectedFilters(prev => ({
      ...prev,
      Seasons: filters.Seasons || [],
      Locations: filters.Locations || [],
      Years: filters.Years || [],
    }));
  }, [filters.Seasons, filters.Locations, filters.Years]);

  useEffect(() => {
    setPage(1);
    setAllExperiments([]);
  }, [filters.Seasons, filters.Locations, filters.Years]);

  useEffect(() => {
    setPage(1);
    setAllExperiments([]);
  }, [selectedCrop]);

  useEffect(() => {
    if (
      !isFiltersLoading &&
      cropOptions &&
      Array.isArray(cropOptions) &&
      cropOptions.length
    ) {
      setSelectedCrop(cropOptions[0]);
    }
  }, [isFiltersLoading, cropOptions]);

  useEffect(() => {
    if (filtersData?.filters) {
      const {Crops, Years, Seasons} = filtersData.filters;

      // Set individual states
      if (Crops && Array.isArray(Crops) && Crops.length)
        setSelectedCrop(Crops[0]);
      if (Years && Array.isArray(Years) && Years.length)
        setSelectedYear(Years[0]);
      if (Seasons && Array.isArray(Seasons) && Seasons.length)
        setSelectedSeason(Seasons[0]);

      // Set selectedFilters state
      setSelectedFilters({
        Seasons:
          Seasons && Array.isArray(Seasons) && Seasons.length
            ? [Seasons[0].label]
            : [],
        Locations: [],
        Years:
          Years && Array.isArray(Years) && Years.length ? [Years[0].label] : [],
        Crops:
          Crops && Array.isArray(Crops) && Crops.length ? [Crops[0].label] : [],
      });
    }
  }, [filtersData]);

  useEffect(() => {
    const cropObj = cropOptions.find(
      (c: CropOption) => c.label === selectedCrop?.label,
    );
    if (!cropObj) return;
    postFilteredExperiments({
      payload: {
        cropId: cropObj.value,
        filters: [
          {key: 'locations', value: filters.Locations},
          {key: 'years', value: selectedFilters.Years},
          {key: 'seasons', value: selectedFilters.Seasons},
        ],
        page,
        perPage: 10,
        searchKeyword: '',
      },
      headers: {'Content-Type': 'application/json'},
    });
  }, [
    selectedCrop,
    cropOptions,
    page,
    postFilteredExperiments,
    filters.Locations,
    selectedFilters.Years,
    selectedFilters.Seasons,
  ]);

  // Flatten all experiments from all projects
  useEffect(() => {
    const projects = filteredExperimentsData?.projects;
    if (!projects) return;

    const flattened = Object.values(projects).flat() as ExperimentItem[];
    setAllExperiments(prev =>
      page === 1 ? flattened : [...prev, ...flattened],
    );
  }, [filteredExperimentsData, page]);

  const filteredExperiments = useMemo(() => {
    if (!searchQuery) return allExperiments;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const q = norm(searchQuery);
    return allExperiments.filter(e => norm(e.fieldExperimentName).includes(q));
  }, [allExperiments, searchQuery]);

  const handleProjectScroll = (e: any) => {
    const {contentOffset, layoutMeasurement, contentSize} = e.nativeEvent;
    const threshold = 50;
    const totalProjects = filteredExperimentsData?.totalProjects ?? 0;
    const totalExperiments = filteredExperimentsData?.totalExperiments ?? 0;
    if (
      contentOffset.x + layoutMeasurement.width + threshold >=
        contentSize.width &&
      allExperiments.length < totalExperiments &&
      !isFilteredLoading
    ) {
      setPage(prev => prev + 1);
    }
  };

  const handleCropSelect = (labels: string[]) => {
    if (labels.length > 1) {
      Toast.error({message: 'Please select only one crop at a time.'});
      return;
    }

    // Update selectedFilters state
    setSelectedFilters(prev => ({...prev, Crops: labels}));

    // Update individual state for backward compatibility
    const crops = filtersData?.filters?.Crops;
    if (!crops || !Array.isArray(crops)) return;
    const label = labels[0];
    const crop = crops.find((c: any) => c && c.label === label);
    if (crop) {
      setSelectedCrop(crop);
    }
  };
  const handleYearSelect = (labels: string[]) => {
    // Update selectedFilters state
    setSelectedFilters(prev => {
      const newFilters = {...prev, Years: labels};

      // Notify parent of filter changes
      if (onFiltersChange) {
        onFiltersChange({
          Seasons: newFilters.Seasons,
          Locations: newFilters.Locations,
          Years: newFilters.Years,
        });
      }

      return newFilters;
    });

    // Update individual state for backward compatibility
    const years = filtersData?.filters?.Years;
    if (!years || !Array.isArray(years)) return;
    const label = labels[0];
    const year = years.find((y: any) => y && String(y.label) === String(label));
    if (year) {
      setSelectedYear(year);
    }
  };
  const handleSeasonSelect = (labels: string[]) => {
    // Update selectedFilters state
    setSelectedFilters(prev => {
      const newFilters = {...prev, Seasons: labels};

      // Notify parent of filter changes
      if (onFiltersChange) {
        onFiltersChange({
          Seasons: newFilters.Seasons,
          Locations: newFilters.Locations,
          Years: newFilters.Years,
        });
      }

      return newFilters;
    });

    // Update individual state for backward compatibility
    const seasons = filtersData?.filters?.Seasons;
    if (!seasons || !Array.isArray(seasons)) return;
    const label = labels[0];
    const season = seasons.find(
      (s: any) => s && String(s.label) === String(label),
    );
    if (season) {
      setSelectedSeason(season);
    }
  };

  const headerText = selectedExperiment
    ? selectedExperiment.fieldExperimentName
    : t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT);
  const headerSub = selectedExperiment?.experimentType;

  const onPick = (e: ExperimentItem) => {
    handleExperimentSelect(e);
    setIsOpen(false);

    navigation.navigate('TabBar', {
      screen: 'ExperimentStack',
      params: {
        screen: 'ExperimentDetails',
        params: {
          id: e.id,
          type: e.experimentType,
          data: {
            projectId: '', // No longer using projects
            designType: e.designType,
            season: e.season,
          },
          fromNewRecord: true, // ✅ Add flag to indicate this is from NewRecord flow
        },
      },
    });
  };

  if (isFiltersLoading || isFilteredLoading) {
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );
  }

  if (!isOpen) {
    return (
      <Pressable
        style={[
          styles.experimentInfoContainer,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
        onPress={() => setIsOpen(true)}>
        <View style={{flex: 1}}>
          <Text style={styles.experimentHeaderTitle}>
            {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
          </Text>
          <Text style={styles.experimentName}>{headerText}</Text>
          {headerSub && (
            <View
              style={[
                styles.cropLabelContainer,
                {
                  backgroundColor: getExperimentTypeColor(headerSub),
                  alignSelf: 'flex-start',
                },
              ]}>
              <Text style={styles.cropLabel}>
                {formatExperimentTypeForDisplay(headerSub)}
              </Text>
            </View>
          )}
        </View>
        <CardArrowDown />
      </Pressable>
    );
  }

  return (
    <View style={styles.selectExperimentContainer}>
      {/* Search and experiment/project selection UI below remains unchanged */}
      {isSearchEnabled ? (
        <Input
          placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
          leftIcon={
            <Pressable
              onPress={() => {
                const cropObj: CropOption | undefined = cropOptions.find(
                  (c: CropOption) => c.label === selectedCrop?.label,
                );
                if (!cropObj || !searchQuery.trim()) return;

                setPage(1);
                setAllExperiments([]);

                postFilteredExperiments({
                  payload: {
                    cropId: cropObj.value,
                    filters: [
                      {key: 'locations', value: filters.Locations},
                      {key: 'years', value: selectedFilters.Years},
                      {key: 'seasons', value: selectedFilters.Seasons},
                    ],
                    page: 1,
                    perPage: 10,
                    searchKeyword: searchQuery.trim(),
                  },
                  headers: {'Content-Type': 'application/json'},
                });
              }}>
              <Search />
            </Pressable>
          }
          customLeftIconStyle={{marginRight: 10}}
          rightIcon={<Close color="#161616" />}
          customRightIconStyle={{marginLeft: 10}}
          onRightIconClick={() => {
            setIsSearchEnabled(false);
            setSearchQuery('');
          }}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      ) : (
        <>
          <Pressable
            style={[styles.selectExperimentTextContainer, styles.row]}
            onPress={() => setIsSearchEnabled(true)}>
            <Text style={styles.selectExperimentText}>
              {t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
            </Text>
            <Search />
          </Pressable>

          <View style={{paddingTop: 8}}>
            <FilterCards
              yearOptions={
                filtersData?.filters?.Years?.filter(
                  (y: any) => !isNaN(Number(y.value)),
                ).map((y: any) => ({
                  label: Number(y.label),
                  value: Number(y.value),
                })) || []
              }
              seasonOptions={
                filtersData?.filters?.Seasons?.map((s: any) => ({
                  label: s.label,
                  value: s.value,
                })) || []
              }
              cropOptions={
                filtersData?.filters?.Crops?.filter(
                  (c: any) => !isNaN(Number(c.value)),
                ).map((c: any) => ({label: c.label, value: Number(c.value)})) ||
                []
              }
              selectedYears={selectedFilters.Years}
              selectedSeasons={selectedFilters.Seasons}
              selectedCrops={selectedFilters.Crops}
              onSelectYear={handleYearSelect}
              onSelectSeason={handleSeasonSelect}
              onSelectCrop={handleCropSelect}
            />
          </View>
        </>
      )}

      {allExperiments.length === 0 && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'black', fontFamily: FONTS.SEMI_BOLD}}>
            No Data Found!
          </Text>
        </View>
      )}

      {filteredExperiments.map((item, idx) => (
        <Pressable
          key={idx}
          style={styles.experimentLabelContainer}
          onPress={() => onPick(item)}>
          <Text style={styles.experimentLabel}>{item.fieldExperimentName}</Text>
          <View
            style={[
              styles.cropLabelContainer,
              {backgroundColor: getExperimentTypeColor(item.experimentType)},
            ]}>
            <Text style={styles.cropLabel}>
              {formatExperimentTypeForDisplay(item.experimentType)}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default SelectExperiment;
