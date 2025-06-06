import {useIsFocused} from '@react-navigation/native';
import {useEffect, useMemo, useState, useCallback, useRef} from 'react';
import {FlatList, Pressable, View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Plus, Search, Adfilter} from '../../../assets/icons/svgs';
import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';
import {LOCALES} from '../../../localization/constants';
import {ExperimentScreenProps} from '../../../types/navigation/appTypes';
import {RootState} from '../../../store';
import Header from '../Home/Header';
import ExperimentCard from './ExperimentCard';
import Filter from './Filter';
import NewRecordOptionsModal from './NewRecordOptionsModal';
import {styles} from './styles';
import FilterModal from './FilterModal';
import {FONTS} from '../../../theme/fonts';
import index from '../../../components/KeyboardAvoidingView';
import {useSelector} from 'react-redux';

const Experiment: React.FC<ExperimentScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();

  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [experimentFilters, setExperimentFilters] = useState({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });

  const [cropOptions, setCropOptions] = useState<
    Array<{label: string; value: number}>
  >([]);
  const [cropList, setCropList] = useState<string[]>([]);

  const [projectList, setProjectList] = useState<string[]>([]);

  const [filteredExperiments, setFilteredExperiments] = useState<any>({});

  const [selectedCrop, setSelectedCrop] = useState<{
    label: string;
    value: number;
  } | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    Seasons: [],
    Locations: [],
    Years: [],
    Crops: [],
  });
  const [filtersData, setFiltersData] = useState<any>([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [projectPage, setProjectPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const buildFiltersPayload = () => {
    const filters = [];
    if (selectedFilters.Locations && selectedFilters.Locations.length > 0) {
      filters.push({key: 'locations', value: selectedFilters.Locations});
    }
    if (selectedFilters.Years && selectedFilters.Years.length > 0) {
      filters.push({key: 'years', value: selectedFilters.Years});
    }
    if (selectedFilters.Crops && selectedFilters.Crops.length > 0) {
      filters.push({key: 'crops', value: selectedFilters.Crops});
    }
    if (selectedFilters.Seasons && selectedFilters.Seasons.length > 0) {
      filters.push({key: 'seasons', value: selectedFilters.Seasons});
    }
    return filters;
  };

  const roleName = useSelector(
    (state: RootState) => state.auth?.userDetails?.role?.[0]?.role_name,
  );

  const [postFiltered, postFilteredData, isPostLoading, postError] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  const [getFilters, filtersApiData, isFiltersLoading, filtersError] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });

  // useEffect(() => {
  //     if (isFocused) {
  //       getFilters();
  //       setSelectedCrop(null);
  //       setSelectedProject('');
  //       setCropList([]);
  //       setProjectList([]);
  //       setFilteredExperiments({});
  //       setProjectPage(1);
  //       setTotalProjects(0);
  //     }
  //   }, [isFocused]);

  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isFocused) {
      getFilters();

      if (isFirstLoad.current) {
        setSelectedCrop(null);
        setSelectedProject('');
        setCropList([]);
        setProjectList([]);
        setFilteredExperiments({});
        setProjectPage(1);
        setTotalProjects(0);
        isFirstLoad.current = false;
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (filtersApiData?.status_code === 200 && filtersApiData?.filters) {
      setExperimentFilters(filtersApiData.filters);
      if (Array.isArray(filtersApiData.filters.Crops)) {
        setCropOptions(filtersApiData.filters.Crops);
        setCropList(
          filtersApiData.filters.Crops.map(
            (item: {label: string; name: string}) => item.label || item.name,
          ),
        );
      }
    }
  }, [filtersApiData]);

  useEffect(() => {
    if (postFilteredData && postFilteredData.projects) {
      const newProjectsData = postFilteredData.projects;
      const newProjectKeys = Object.keys(newProjectsData);

      setTotalProjects(postFilteredData.totalProjects);
      if (projectPage === 1) {
        setFilteredExperiments(newProjectsData);
        setProjectList(newProjectKeys);
        if (newProjectKeys.length > 0) {
          setSelectedProject(newProjectKeys[0]);
        } else {
          setSelectedProject('');
        }
      } else {
        setFilteredExperiments((prev: Record<string, any>) => ({
          ...prev,
          ...newProjectsData,
        }));
        setProjectList(prev => {
          const merged = [...prev];
          newProjectKeys.forEach(key => {
            if (!merged.includes(key)) {
              merged.push(key);
            }
          });
          return merged;
        });
      }
    }
  }, [postFilteredData, projectPage]);

  useEffect(() => {
    const hasFilters =
      selectedFilters.Seasons.length > 0 ||
      selectedFilters.Locations.length > 0 ||
      selectedFilters.Years.length > 0;
    setIsFilterApplied(hasFilters);
  }, [selectedFilters]);

  interface FilterUpdateHandler {
    (
      filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
      updatedValues: string[],
    ): void;
  }

  const handleFilterUpdate: FilterUpdateHandler = (
    filterType,
    updatedValues,
  ) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: updatedValues,
    }));
  };

  // Modified handleCropSelection accepts a flag to clear the search query.
  const handleCropSelection = (
    optionLabel: string,
    shouldClearSearch: boolean = false,
  ) => {
    const selectedObj = cropOptions.find(item => item.label === optionLabel);
    if (selectedObj) {
      if (shouldClearSearch) {
        setSearchQuery(''); // Clear the search query when switching crops.
      }
      setSelectedCrop(selectedObj);
      setProjectPage(1);
      setProjectList([]);
      setFilteredExperiments({});
      const payload = {
        cropId: selectedObj.value,
        page: 1,
        perPage: 10,
        filters: buildFiltersPayload(),
        // Use an empty searchKeyword if shouldClearSearch is true
        searchKeyword: shouldClearSearch ? '' : searchQuery,
      };
      console.log('Payload being sent:', payload);
      postFiltered({
        payload,
        headers: {'Content-Type': 'application/json'},
      });
    } else {
      console.log('No matching crop found for:', optionLabel);
    }
  };

  useEffect(() => {
    console.log('POST API response:', postFilteredData);
    if (postError) {
      console.log('POST API error:', postError);
    }
  }, [postFilteredData, postError]);

  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {x: number; y: number};
      layoutMeasurement: {width: number; height: number};
      contentSize: {width: number; height: number};
    };
  }

  const handleProjectScroll = useCallback(
    (event: ScrollEvent) => {
      const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent;
      const threshold = 100;
      if (
        contentOffset.x + layoutMeasurement.width + threshold >=
          contentSize.width &&
        projectList.length < totalProjects &&
        !isPostLoading
      ) {
        const nextPage = projectPage + 1;
        setProjectPage(nextPage);
        if (selectedCrop) {
          const payload = {
            cropId: selectedCrop.value,
            page: nextPage,
            perPage: 10,
            filters: buildFiltersPayload(),
          };
          console.log('Loading more projects with payload:', payload);
          postFiltered({
            payload,
            headers: {'Content-Type': 'application/json'},
          });
        }
      }
    },
    [
      projectList,
      totalProjects,
      projectPage,
      selectedCrop,
      isPostLoading,
      buildFiltersPayload,
    ],
  );

  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={styles.filter}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={cropList}
          selectedOption={selectedCrop ? selectedCrop.label : ''}
          // Pass "true" to clear the search when switching crops.
          onPress={(option: string) => handleCropSelection(option, true)}
        />

        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projectList}
          selectedOption={selectedProject}
          onPress={(option: string) => setSelectedProject(option)}
          onScroll={handleProjectScroll}
        />
      </View>
    );
  }, [
    cropList,
    selectedCrop,
    projectList,
    selectedProject,
    t,
    handleProjectScroll,
  ]);

  const finalExperimentList = useMemo(() => {
    let experimentsArray: any[] = [];
    if (selectedProject && filteredExperiments[selectedProject]) {
      experimentsArray = filteredExperiments[selectedProject];
    }
    if (searchQuery === '') {
      return experimentsArray;
    }
    const normalizedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    return experimentsArray.filter(experiment => {
      const normalizedExpName = (experiment.experimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const normalizedFieldExpName = (experiment.fieldExperimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      return (
        normalizedExpName.includes(normalizedQuery) ||
        normalizedFieldExpName.includes(normalizedQuery)
      );
    });
  }, [filteredExperiments, searchQuery, selectedProject]);

  useEffect(() => {
    if (cropList.length > 0 && !selectedCrop) {
      handleCropSelection(cropList[0]);
    }
  }, [cropList, selectedCrop]);

  useEffect(() => {
    if (
      selectedCrop &&
      selectedFilters.Seasons.length === 0 &&
      selectedFilters.Locations.length === 0 &&
      selectedFilters.Years.length === 0
    ) {
      handleCropSelection(selectedCrop.label);
    }
  }, [selectedFilters]);

  const onNewRecordClick = () => {
    setIsOptionModalVisible(true);
  };

  const onCloseOptionsModalClick = () => {
    setIsOptionModalVisible(false);
  };

  const onSelectFromList = () => {
    setIsOptionModalVisible(false);
    navigation.navigate('NewRecord');
  };

  const groupedExperiments = useMemo(() => {
    const groups = finalExperimentList.reduce((acc: any, experiment: any) => {
      const groupKey = experiment.experimentName || 'N/A';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(experiment);
      return acc;
    }, {});
    return Object.keys(groups).map(key => ({
      name: key,
      data: groups[key],
    }));
  }, [finalExperimentList]);

  const isLoading = isFiltersLoading || isPostLoading;

  const handleSearch = () => {
    if (selectedCrop) {
      // Here, we don't clear the search query because the user is actively searching.
      handleCropSelection(selectedCrop.label, false);
    } else if (cropList.length > 0) {
      handleCropSelection(cropList[0], false);
    }
  };

  useEffect(() => {
    if (searchQuery === '' && cropList.length > 0) {
      handleCropSelection(cropList[0]);
    }
  }, [searchQuery, cropList]);

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Loader />
        </View>
      ) : (
        <>
          {roleName?.toLowerCase() !== 'admin' && (
            <View style={styles.main_header}>
              <Header navigation={navigation} />
            </View>
          )}

          <StatusBar />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
            </Text>
          </View>
          <View style={styles.container}>
            <View style={additionalStyles.searchContainer}>
              <Input
                placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
                rightIcon={
                  <Pressable onPress={handleSearch}>
                    <Search />
                  </Pressable>
                }
                customLeftIconStyle={{marginRight: 10}}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <Pressable
                onPress={() => setIsFilterModalVisible(true)}
                style={additionalStyles.filterIconContainer}>
                <Adfilter />
              </Pressable>
            </View>

            {ListHeaderComponent}
            {finalExperimentList.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'black', fontFamily: FONTS.SEMI_BOLD}}>
                  No Data Found!
                </Text>
              </View>
            ) : (
              <FlatList
                data={groupedExperiments}
                contentContainerStyle={
                  groupedExperiments.length === 0
                    ? {flexGrow: 1}
                    : {paddingBottom: 80}
                }
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <ExperimentCard
                    item={item}
                    selectedProject={selectedProject}
                  />
                )}
                keyExtractor={(_, index) => index.toString()}
              />
            )}
          </View>

          {!isOptionModalVisible && (
            <Pressable style={styles.newRecord} onPress={onNewRecordClick}>
              <Plus />
              <Text style={styles.newRecordText}>
                {t(LOCALES.EXPERIMENT.NEW_RECORD)}
              </Text>
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
            onApply={() => {
              if (selectedCrop) {
                handleCropSelection(selectedCrop.label);
              }
            }}
            onFilterSelect={handleFilterUpdate}
            filterData={experimentFilters}
            selectedFilters={selectedFilters}
          />
        </>
      )}
    </SafeAreaView>
  );
};

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onFilterSelect: (
    filterType: 'season' | 'location' | 'year' | 'crop',
    selectedOption: string,
  ) => void;
  filterData?: {
    seasons?: {label: string; value: string}[];
    years?: {label: string; value: string}[];
    locations?: {label: string; value: string}[];
  };
}

const additionalStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 50,
    marginLeft: 8,
  },
  filterIconContainer: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 4,
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterModalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 20,
  },
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebarContainer: {
    width: '35%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#1A6DD2',
  },
  sidebarItemText: {
    fontSize: 14,
    color: '#333',
  },
  sidebarItemTextActive: {
    color: '#EAF4E7',
    fontWeight: 'bold',
  },

  rightPane: {
    flex: 1,
    padding: 16,
  },

  dropdownHeader: {
    backgroundColor: '#1A6DD2',
    padding: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  dropdownHeaderText: {
    color: '#EAF4E7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownList: {
    marginTop: 4,
  },
  dropdownItem: {
    backgroundColor: '#EAF4E7',
    padding: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  dropdownItemText: {
    color: '#1A6DD2',
    fontSize: 16,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    fontFamily: FONTS.MEDIUM,
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#1A6DD2',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: FONTS.MEDIUM,
  },
});

export default Experiment;
