import {useIsFocused} from '@react-navigation/native';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Pressable, View, StyleSheet, ScrollView} from 'react-native';
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

  useEffect(() => {
    if (isFocused) {
      getFilters();
      setSelectedCrop(null);
      setSelectedProject('');
      setCropList([]);
      setProjectList([]);
      setFilteredExperiments({});
    }
  }, [isFocused]);

  useEffect(() => {
    if (filtersApiData?.status_code === 200 && filtersApiData?.filters) {
      setExperimentFilters(filtersApiData.filters);
      console.log('Crops from API:', filtersApiData.filters.Crops);
      if (Array.isArray(filtersApiData.filters.Crops)) {
        setCropOptions(filtersApiData.filters.Crops);
        setCropList(
          filtersApiData.filters.Crops.map(item => item.label || item.name),
        );
      }
    }
  }, [filtersApiData]);

  useEffect(() => {
    if (postFilteredData && postFilteredData.projects) {
      const projectsData = postFilteredData.projects;
      setFilteredExperiments(projectsData);

      const projects = Object.keys(projectsData);
      setProjectList(projects);

      if (!selectedProject && projects.length > 0) {
        setSelectedProject(projects[0]);
      }
    }
  }, [postFilteredData]);

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
    const hasFilters =
      selectedFilters.Seasons.length > 0 ||
      selectedFilters.Locations.length > 0 ||
      selectedFilters.Years.length > 0;
    setIsFilterApplied(hasFilters);
  }, [selectedFilters]);

  const handleFilterUpdate = (filterType, updatedValues) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: updatedValues,
    }));
  };

  const handleCropSelection = (optionLabel: string) => {
    const selectedObj = cropOptions.find(item => item.label === optionLabel);
    if (selectedObj) {
      console.log('Selected Crop:', selectedObj);
      setSelectedCrop(selectedObj);
      const payload = {
        cropId: selectedObj.value,
        page: 1,
        perPage: 10,
        filters: [],
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

  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={styles.filter}>
        {/* Crop Filter */}
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={cropList}
          selectedOption={selectedCrop ? selectedCrop.label : ''}
          onPress={(option: string) => handleCropSelection(option)}
        />
        {/* Project Filter displayed in the same way as the crop filter */}
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projectList}
          selectedOption={selectedProject}
          onPress={(option: string) => setSelectedProject(option)}
        />
      </View>
    );
  }, [cropList, selectedCrop, projectList, selectedProject, t]);

  console.log('finalExperimentList:', finalExperimentList);
  console.log('selectedProject:', selectedProject);

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
    // Group experiments by experimentName (or use fieldExperimentName if more appropriate)
    const groups = finalExperimentList.reduce((acc: any, experiment: any) => {
      const groupKey = experiment.experimentName || 'N/A';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(experiment);
      return acc;
    }, {});
    // Convert to an array with structure: { name: groupKey, data: [experiments...] }
    return Object.keys(groups).map(key => ({
      name: key,
      data: groups[key],
    }));
  }, [finalExperimentList]);

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
        {ListHeaderComponent}
        {finalExperimentList.length === 0 ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
              <ExperimentCard item={item} selectedProject={selectedProject} />
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
        onFilterSelect={handleFilterUpdate}
        filterData={experimentFilters}
      />
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
