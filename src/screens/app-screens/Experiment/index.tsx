import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Pressable, View} from 'react-native';
import {Modal, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

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
import ExperimentList from './ExperimentCard/ExperimentList';
import Filter from './Filter';
import NewRecordOptionsModal from './NewRecordOptionsModal';
import {styles} from './styles';
import FilterModal from './FilterModal';
import {FONTS} from '../../../theme/fonts';
import index from '../../../components/KeyboardAvoidingView';

const Experiment: React.FC<ExperimentScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [experimentFilters, setExperimentFilters] = useState<any>(null);
  const [cropList, setCropList] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [experimentList, setExperimentList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    Seasons: [],
    Locations: [],
    Years: [],
  });
  const [filtersData, setFiltersData] = useState<any>([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const roleName = useSelector((state: RootState) => {
    return state.auth?.userDetails?.role?.[0]?.role_name;
  });

  const handleCropChange = useCallback(
    (option: string) => {
      setSelectedCrop(option);
      if (!filtersData[option]) return; // Prevent selecting disabled crops
      const newProjectList = Object.keys(filtersData[option] || {});
      const experimentList = filtersData[option][newProjectList[0]] || [];
      const formattedExperimentList = groupByExperimentName(experimentList);
      setProjectList(newProjectList);
      setSelectedProject(newProjectList[0] || '');
      setExperimentList(formattedExperimentList);
      setIsFilterApplied(false);
    },
    [filtersData],
  );

  const handleProjectChange = useCallback(
    (option: string) => {
      setSelectedProject(option);
      if (!filtersData[selectedCrop]?.[option]) return; // Prevent selecting disabled projects
      const experimentList = filtersData[selectedCrop][option] || [];
      const formattedExperimentList = groupByExperimentName(experimentList);
      setExperimentList(formattedExperimentList);
    },
    [filtersData, selectedCrop],
  );

  const ListHeaderComponent = useMemo(() => {
    const filteredCropList = cropList.filter(crop => filtersData[crop]);
    const filteredProjectList = projectList.filter(
      project => filtersData[selectedCrop]?.[project],
    );

    return (
      <View style={styles.filter}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={filteredCropList}
          selectedOption={selectedCrop}
          onPress={handleCropChange}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={filteredProjectList}
          selectedOption={selectedProject}
          onPress={handleProjectChange}
        />
      </View>
    );
  }, [filtersData, cropList, projectList, selectedCrop, selectedProject]);

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

  const [
    getExperimentList,
    experimentListData,
    isExperimentListLoading,
    experimentListError,
  ] = useApi({
    url: URL.EXPERIMENT_LIST,
    method: 'GET',
  });

  useEffect(() => {
    if (isFocused) {
      getExperimentList();
      setSelectedCrop('');
      setSelectedProject('');
      setCropList([]);
      setProjectList([]);
      setExperimentList([]);
    }
  }, [isFocused]);

  const groupByExperimentName = (array: any[]) => {
    const groupedMap = array.reduce((acc, curr) => {
      const key = curr.experimentName || 'N/A';
      if (!acc.has(key)) {
        acc.set(key, {name: key, data: []});
      }
      acc.get(key).data.push(curr);
      return acc;
    }, new Map());

    return Array.from(groupedMap.values());
  };

  useEffect(() => {
    if (experimentListData?.status_code !== 200 || !experimentListData?.data) {
      return;
    }

    // Original lines: setting up experiment data
    const {data, filters} = experimentListData; // Extract filters separately
    const cropList = Object.keys(data);
    const selectedCrop = cropList[0];
    const projectList = Object.keys(data[selectedCrop] || {});
    const selectedProject = projectList[0];
    const experimentList = data[selectedCrop][selectedProject] || [];
    const formattedExperimentList = groupByExperimentName(experimentList);

    setExperimentData(data);
    setCropList(cropList);
    setProjectList(projectList);
    setExperimentList(formattedExperimentList);
    setSelectedCrop(selectedCrop);
    setSelectedProject(selectedProject);

    setExperimentFilters(filters || null);
  }, [experimentListData]);

  const filterExperiments = (data = {}, selectedFilters) => {
    // Normalize filter keys and provide default values
    const {
      Locations = [], // Expected to be an array of numbers or strings
      Seasons = [], // Expected to be an array of strings
      Years = [], // Expected to be an array of numbers
    } = selectedFilters;

    // Extract actual experiment data (in case it's nested under `data`)
    const experimentData = data.data || data;

    const filteredData = {};

    Object.keys(experimentData).forEach(cropName => {
      const cropExperiments = experimentData[cropName];

      Object.keys(cropExperiments).forEach(experimentKey => {
        const experiments = cropExperiments[experimentKey].filter(
          experiment => {
            // Convert locations to strings if necessary (to match selectedFilters format)
            const experimentLocations = experiment.locations.map(loc =>
              loc.toString(),
            );

            // Apply filters
            const matchLocation =
              Locations.length === 0 || // No location filter applied, allow all
              experimentLocations.some(loc =>
                Locations.includes(loc.toString()),
              );

            const matchSeason =
              Seasons.length === 0 || // No season filter applied, allow all
              Seasons.includes(experiment.season); // Convert to lowercase for consistency

            const matchYear =
              Years.length === 0 || // No year filter applied, allow all
              Years.includes(experiment.Year);

            return matchLocation && matchSeason && matchYear;
          },
        );

        if (experiments.length > 0) {
          if (!filteredData[cropName]) filteredData[cropName] = {};
          filteredData[cropName][experimentKey] = experiments;
        }
      });
    });

    return filteredData;
  };

  useEffect(() => {
    const results = filterExperiments(
      experimentListData?.data || {},
      selectedFilters,
    );
    setFiltersData(results);
  }, [experimentListData, selectedFilters]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        {isExperimentListLoading ? (
          <Loader />
        ) : (
          <Text style={styles.emptyText}>
            {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
          </Text>
        )}
      </View>
    ),
    [isExperimentListLoading],
  );

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  useEffect(() => {
    const hasFilters =
      selectedFilters.Seasons.length > 0 ||
      selectedFilters.Locations.length > 0 ||
      selectedFilters.Years.length > 0;

    setIsFilterApplied(hasFilters); // ✅ Set true when filters exist
  }, [selectedFilters]);
  const finalExperimentList = useMemo(() => {
    // const dataToUse = isFilterApplied ? filtersData : experimentList;

    const dataToUse = experimentList;

    console.log(dataToUse, 'check which data');

    if (searchQuery === '') {
      return dataToUse;
    }

    const normalizedQuery = normalizeString(searchQuery);

    return dataToUse.filter(experiment => {
      const normalizedExperimentName = normalizeString(experiment.name || '');
      const normalizedFieldExperimentName = normalizeString(
        experiment.data[0]?.fieldExperimentName || '',
      );

      return (
        normalizedExperimentName.includes(normalizedQuery) ||
        normalizedFieldExperimentName.includes(normalizedQuery)
      );
    });
  }, [experimentList, filtersData, selectedFilters, searchQuery]);

  const handleFilterUpdate = (filterType, updatedValues) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: updatedValues, // Store full updated array
    }));
  };

  const handleFilterSelect = (
    filterType: 'Season' | 'Location' | 'Year',
    selectedOption: string,
  ) => {
    setSelectedFilters(prev => {
      // Ensure prev is properly structured
      if (!prev) {
        prev = {Season: [], Location: [], Year: []}; // Provide a default structure
      }

      const currentFilter = prev[filterType] || []; // Ensure it's an array

      const isSelected = currentFilter.includes(selectedOption);

      return {
        ...prev,
        [filterType]: isSelected
          ? currentFilter.filter(item => item !== selectedOption) // Remove if selected
          : [...currentFilter, selectedOption], // Add if not selected
      };
    });
  };
  console.log('selectedFilters in', selectedFilters);

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
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
        {/* Search bar with filter icon container */}
        <View style={additionalStyles.searchContainer}>
          <Input
            placeholder={t(LOCALES.EXPERIMENT.LBL_SEARCH_EXPERIMENT)}
            leftIcon={Search}
            customLeftIconStyle={{marginRight: 10}}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable
            onPress={() => setIsFilterModalVisible(true)}
            style={additionalStyles.filterIconContainer}>
            <Adfilter />
          </Pressable>
        </View>
        <FlatList
          data={finalExperimentList}
          contentContainerStyle={
            finalExperimentList?.length === 0
              ? {flexGrow: 1}
              : {paddingBottom: 80}
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({item, index}) => {
            // Hide ExperimentCard when filters are applied
            if (isFilterApplied) {
              return null; // This will hide ExperimentCard
            }

            return (
              <ExperimentCard item={item} selectedProject={selectedProject} />
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
        {/* <ExperimentCard item={fina} selectedProject={selectedProject} /> */}
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
      {/* Render the full-screen filter modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onFilterSelect={handleFilterUpdate} // Pass the function that tracks selections
        filterData={experimentFilters} // <-- NEW: pass the filters from the API
      />
    </SafeAreaView>
  );
};

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onFilterSelect: (
    filterType: 'season' | 'location' | 'year',
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
  /* LEFT SIDEBAR */
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
  /* RIGHT PANE */
  rightPane: {
    flex: 1,
    padding: 16,
  },
  /* Existing dropdown styles */
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
  /* Footer with CLOSE & APPLY */
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
