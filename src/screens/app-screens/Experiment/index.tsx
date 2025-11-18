import NetInfo from '@react-native-community/netinfo';
import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useApi} from '../../../hooks/useApi';
import {fetchOfflineExperimentList} from '../../../services/DbQueries';
// Add this import to src/screens/app-screens/Experiment/index.tsx
import DatabaseDebugger from '../../../components/DatabaseDebugger';

import {
  ExperimentParams,
  useOfflineCache,
} from '../../../services/offlineCache';

import {
  LocationCacheParams,
  useLocationOfflineCache,
} from '../../../services/locationOfflineCache';

import {useOfflineDataRetrieval} from '../../../services/offlineDataRetrieval';

import {
  Adfilter,
  NoInternet,
  Plus,
  Search,
  OrangeNoNetwork,
} from '../../../assets/icons/svgs';
import {
  Input,
  Loader,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {URL} from '../../../constants/URLS';
import {LOCALES} from '../../../localization/constants';
import {FONTS} from '../../../theme/fonts';
import {ExperimentScreenProps} from '../../../types/navigation/appTypes';
import Toast from '../../../utilities/toast';
import {useExperimentTracker} from '../../../utilities/experimentTracker';
import eventEmitter from '../../../utilities/eventEmitter';
import Header from '../Home/Header';
import ExperimentCard from './ExperimentCard';
import FilterModal from './FilterModal';
import NewRecordOptionsModal from './NewRecordOptionsModal';
import {styles} from './styles';
import FilterCards from './Filter/FilterCards';

// Module-level cache to persist selection across remounts
interface CropOption {
  label: string;
  value: number;
}

interface YearOption {
  value: number;
  label: string;
}
interface SeasonOption {
  value: string;
  label: string;
}

interface LocationOption {
  label: string;
  value: string | number;
}

interface ExperimentFilters {
  Years: YearOption[];
  Crops: CropOption[]; // you already have this
  Seasons: SeasonOption[];
  Locations: LocationOption[]; // similarly if you ever use Locations
}
interface SelectedFilters {
  Seasons: string[];
  Locations: string[];
  Years: string[];
  Crops: string[];
}

interface Experiment {
  id: number;
  cropId: number;
  experimentType: string;
  experimentName?: string;
  fieldExperimentName?: string;
  projectKey?: string;
  [key: string]: any;
}

interface FilteredExperiments {
  [projectKey: string]: Experiment[];
}

interface OfflineExperiments {
  [projectKey: string]: Experiment[];
}

let cachedSelectedCrop: CropOption | null = null;
let cachedSelectedProject = '';

const Experiment: React.FC<ExperimentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();

  // Get prefilled experiment data from route params
  const prefilledExperiment = route.params?.prefilledExperiment;

  // ─── Offline cache hook ─────────────────────────────────
  const {cacheAll, deleteOfflineData, isCaching, offlineIds} =
    useOfflineCache();
  const [offlineExperiments, setOfflineExperiments] = useState({});

  // ─── Location-specific offline cache hook ──────────────────────
  const {
    toggleLocationOffline,
    loadOfflineStates,
    isLocationOffline,
    getExperimentOfflineLocations,
    isCaching: isLocationCaching,
    offlineLocationStates,
  } = useLocationOfflineCache();

  // ─── Offline data retrieval hook ────────────────────────
  const {
    isConnected: networkIsConnected,
    isLoadingOfflineData,
    getFilteredExperimentList,
    getFilters: getOfflineFilters,
    hasOfflineData,
    refreshOfflineData,
  } = useOfflineDataRetrieval();

  // ─── State ─────────────────────────────────────────────
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [experimentFilters, setExperimentFilters] = useState<ExperimentFilters>(
    {
      Years: [],
      Crops: [],
      Seasons: [],
      Locations: [],
    },
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [cropOptions, setCropOptions] = useState<CropOption[]>([]);
  const [cropList, setCropList] = useState<string[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Track the last applied prefilled experiment to prevent infinite loops
  const lastAppliedPrefilledExperiment = useRef<any>(null);

  // Persisted selectedCrop and selectedProject
  const [selectedCrop, _setSelectedCropState] = useState(cachedSelectedCrop);
  const [selectedProject, _setSelectedProjectState] = useState(
    cachedSelectedProject,
  );

  interface SetSelectedCrop {
    (crop: CropOption | null): void;
  }

  const setSelectedCrop: SetSelectedCrop = crop => {
    cachedSelectedCrop = crop;
    _setSelectedCropState(crop);
  };

  interface SetSelectedProject {
    (projectKey: string): void;
  }

  const setSelectedProject: SetSelectedProject = projectKey => {
    cachedSelectedProject = projectKey;
    _setSelectedProjectState(projectKey);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    Seasons: [],
    Locations: [],
    Years: [],
    Crops: [],
  });
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Add a ref to track when we need to apply filters after FilterModal updates
  const shouldApplyFiltersAfterUpdate = useRef(false);

  const [projectPage, setProjectPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<{
    [key: string]: Experiment[];
  }>({});

  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // how many per‐page your API returns
  const PER_PAGE = 10;

  const skipAutoFilterApplyRef = useRef(false);

  // ─── Redux selector ────────────────────────────────────
  // Define RootState type or import it from your store typings
  interface RootState {
    auth?: {
      userDetails?: {
        role?: Array<{
          role_name?: string;
        }>;
      };
    };
  }

  const roleName = useSelector(
    (state: RootState) => state.auth?.userDetails?.role?.[0]?.role_name,
  );

  // ─── API hooks ─────────────────────────────────────────
  let [postFiltered, postFilteredData, isPostLoading] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });
  // API to fetch experiment details by id (fallback)
  const [
    getExperimentDetails,
    experimentDetailsData,
    isGettingExperimentDetails,
  ] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });
  const [getFilters, filtersApiData, isFiltersLoading] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });

  // ─── Build filters payload ─────────────────────────────
  const buildFiltersPayload = () => {
    const fl = [];

    if (selectedFilters.Years.length > 0) {
      // Convert year labels to values for API
      const yearValues = selectedFilters.Years.map(yearLabel => {
        const year = experimentFilters.Years.find(
          y => y.label.toString() === yearLabel,
        );
        return year?.value;
      }).filter(value => value !== undefined);
      if (yearValues.length > 0) {
        fl.push({key: 'years', value: yearValues});
      }
    }
    if (selectedFilters.Seasons.length > 0) {
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
    if (selectedFilters.Locations.length > 0) {
      // Locations are stored as value strings (e.g., "112"), not labels
      const locationValues = selectedFilters.Locations.map(locationValueStr => {
        // Try to parse as number or keep as string
        const locationValue = !isNaN(Number(locationValueStr))
          ? Number(locationValueStr)
          : locationValueStr;

        return locationValue;
      }).filter(value => value !== undefined);
      if (locationValues.length > 0) {
        fl.push({key: 'locations', value: locationValues});
      } else {
      }
    } else {
    }
    // Note: crops are handled via cropId field, not in filters array

    return fl;
  };

  const toggleOptionModal = () => setIsOptionModalVisible(v => !v);
  const toggleFilterModal = () => setIsFilterModalVisible(v => !v);

  // ─── Initial "fetch filters" on mount ───────────────────
  const isFirstLoad = useRef(true);

  // Handle initial API call for online mode
  useEffect(() => {
    if (networkIsConnected === true && isFirstLoad.current) {
      getFilters();
      isFirstLoad.current = false;
    }
  }, [networkIsConnected]);

  // Handle offline data loading
  useEffect(() => {
    console.log('🌐 [Experiment Screen] Network state changed:', networkIsConnected);
    
    if (networkIsConnected === false) {
      console.log('📴 [Experiment Screen] Going offline - loading offline data...');
      
      const offlineFiltersResponse = getOfflineFilters();
      console.log('📴 [Experiment Screen] Offline filters response:', offlineFiltersResponse);
      
      if (
        offlineFiltersResponse &&
        offlineFiltersResponse.status_code === 200 &&
        offlineFiltersResponse.filters
      ) {
        const offlineFilters = offlineFiltersResponse.filters;

        // Process offline filters the same way as online filters
        setExperimentFilters(offlineFilters as unknown as ExperimentFilters);

        if (Array.isArray(offlineFilters.Crops)) {
          setCropOptions(offlineFilters.Crops);
          setCropList(offlineFilters.Crops.map((c: CropOption) => c.label));
        }

        // NEW: Build filter payload and use enhanced API-mimicking function
        const defaultSelectedFilters = {
          Seasons:
            Array.isArray(offlineFilters.Seasons) &&
            offlineFilters.Seasons.length > 0
              ? [offlineFilters.Seasons[0].label]
              : [],
          Locations: [], // Don't auto-select any location
          Years:
            Array.isArray(offlineFilters.Years) &&
            offlineFilters.Years.length > 0
              ? [offlineFilters.Years[0].label.toString()]
              : [],
          Crops:
            Array.isArray(offlineFilters.Crops) &&
            offlineFilters.Crops.length > 0
              ? [offlineFilters.Crops[0].label]
              : [],
        };
        setSelectedFilters(defaultSelectedFilters);

        // Get the first crop ID if available
        const selectedCropId =
          Array.isArray(offlineFilters.Crops) && offlineFilters.Crops.length > 0
            ? offlineFilters.Crops[0].value
            : '';

        // Use the new API-mimicking function
        console.log('📴 [Experiment Screen] Calling getFilteredExperimentList with filters:', defaultSelectedFilters);
        const offlineExperimentData = getFilteredExperimentList(
          defaultSelectedFilters,
          selectedCropId,
        );
        console.log('📴 [Experiment Screen] Offline experiment data:', offlineExperimentData);
        
        if (offlineExperimentData && offlineExperimentData.projects) {
          // Process exactly like online API response
          const newProjectsData: {[key: string]: Experiment[]} =
            offlineExperimentData.projects;
          const keys = Object.keys(newProjectsData);

          setTotalProjects(offlineExperimentData.totalProjects || 0);
          setFilteredExperiments(newProjectsData);
          setProjectList(keys);
          setSelectedProject(keys[0] || '');

          // Set default crop selection if available
          if (
            Array.isArray(offlineFilters.Crops) &&
            offlineFilters.Crops.length > 0
          ) {
            setSelectedCrop(offlineFilters.Crops[0]);
          }
          
          console.log('✅ [Experiment Screen] Offline data loaded successfully - projects:', keys);
        } else {
          console.log('⚠️ [Experiment Screen] No offline experiment data available');
        }
      } else {
        console.log('⚠️ [Experiment Screen] No offline filters available or invalid response');
      }
    } else {
      console.log('🌐 [Experiment Screen] Online mode - skipping offline data load');
    }
    }
  }, [networkIsConnected, getOfflineFilters, getFilteredExperimentList]);

  // ─── Listen for offline cache completion to refresh data ───────────
  useEffect(() => {
    const handleCacheComplete = async (data: any) => {
      console.log('🔔 [Experiment Screen] Cache completion event received:', data);
      console.log('🔔 [Experiment Screen] Current network state:', networkIsConnected);
      console.log('🔔 [Experiment Screen] Starting data refresh...');

      try {
        // Reload offline data
        console.log('🔔 [Experiment Screen] Calling refreshOfflineData...');
        await refreshOfflineData();
        console.log('🔔 [Experiment Screen] refreshOfflineData completed');

        // Refresh the experiment list display
        console.log('🔔 [Experiment Screen] Calling getOfflineFilters...');
        const offlineFiltersResponse = getOfflineFilters();
        console.log('🔔 [Experiment Screen] getOfflineFilters result:', offlineFiltersResponse);
        
        if (offlineFiltersResponse && offlineFiltersResponse.filters) {
          const offlineFilters = offlineFiltersResponse.filters;

          // Update filters
          setExperimentFilters(offlineFilters as unknown as ExperimentFilters);

          if (Array.isArray(offlineFilters.Crops)) {
            setCropOptions(offlineFilters.Crops);
            setCropList(offlineFilters.Crops.map((c: CropOption) => c.label));
          }

          // Get first crop ID
          const selectedCropId =
            Array.isArray(offlineFilters.Crops) && offlineFilters.Crops.length > 0
              ? offlineFilters.Crops[0].value
              : '';

          // Load experiments
          console.log('🔔 [Experiment Screen] Calling getFilteredExperimentList...');
          const offlineExperimentData = getFilteredExperimentList(
            undefined,
            selectedCropId,
          );
          console.log('🔔 [Experiment Screen] getFilteredExperimentList result:', offlineExperimentData);

          if (offlineExperimentData && offlineExperimentData.projects) {
            const newProjectsData: {[key: string]: Experiment[]} =
              offlineExperimentData.projects;
            const keys = Object.keys(newProjectsData);

            setTotalProjects(offlineExperimentData.totalProjects || 0);
            setFilteredExperiments(newProjectsData);
            setProjectList(keys);
            setSelectedProject(keys[0] || '');

            if (
              Array.isArray(offlineFilters.Crops) &&
              offlineFilters.Crops.length > 0
            ) {
              setSelectedCrop(offlineFilters.Crops[0]);
            }

            console.log('✅ [Experiment Screen] Screen refreshed with offline data - projects:', keys);
          } else {
            console.log('⚠️ [Experiment Screen] No offline experiment data available');
          }
        } else {
          console.log('⚠️ [Experiment Screen] No offline filters available');
        }
      } catch (error) {
        console.error('❌ [Experiment Screen] Error refreshing offline data:', error);
      }
    };

    console.log('🔔 [Experiment Screen] Setting up OFFLINE_CACHE_COMPLETED listener');
    eventEmitter.on('OFFLINE_CACHE_COMPLETED', handleCacheComplete);

    return () => {
      console.log('🔔 [Experiment Screen] Removing OFFLINE_CACHE_COMPLETED listener');
      eventEmitter.off('OFFLINE_CACHE_COMPLETED', handleCacheComplete);
    };
  }, [refreshOfflineData, getOfflineFilters, getFilteredExperimentList]);

  // ─── When filtersApiData arrives ────────────────────────
  useEffect(() => {
    if (filtersApiData?.status_code === 200 && filtersApiData.filters) {
      const {Crops, Years, Seasons, Locations} = filtersApiData.filters;
      setExperimentFilters(filtersApiData.filters);

      if (Array.isArray(Crops)) {
        setCropOptions(Crops);
        setCropList(Crops.map((c: CropOption) => c.label));
      }

      // Set default selected filters (first option of each)
      const defaultSelectedFilters = {
        Seasons: Seasons.length > 0 ? [Seasons[0].label] : [],
        Locations: [], // Don't auto-select any location
        Years: Years.length > 0 ? [Years[0].label.toString()] : [],
        Crops: Crops.length > 0 ? [Crops[0].label] : [],
      };

      // Find matching options for prefilled data (if available)
      let matchingCrop = null;
      let matchingSeason = null;
      let matchingYear = null;

      if (prefilledExperiment) {
        // Debug available filter options

        matchingCrop = Crops.find(
          (crop: CropOption) =>
            crop.label.toLowerCase() ===
            prefilledExperiment.cropName?.toLowerCase(),
        );
        matchingSeason = Seasons.find(
          (season: SeasonOption) =>
            season.label.toLowerCase() ===
            prefilledExperiment.season?.toLowerCase(),
        );
        matchingYear = Years.find(
          (year: YearOption) =>
            year.label.toString() === prefilledExperiment.year,
        );

        // Debug matching results
      }

      // Override with prefilled experiment data if available
      if (prefilledExperiment) {
        const prefilledFilters = {
          Seasons: matchingSeason
            ? [matchingSeason.label]
            : defaultSelectedFilters.Seasons,
          Locations: defaultSelectedFilters.Locations, // Keep default for now
          Years: matchingYear
            ? [matchingYear.label.toString()]
            : defaultSelectedFilters.Years,
          Crops: matchingCrop
            ? [matchingCrop.label]
            : defaultSelectedFilters.Crops,
        };

        setSelectedFilters(prefilledFilters);

        // Set prefilled crop selection
        if (matchingCrop) {
          setSelectedCrop(matchingCrop);
        }

        // Pre-populate search query with experiment name to help user find the specific experiment
        const experimentName =
          prefilledExperiment.fieldExperimentName ||
          prefilledExperiment.experimentName ||
          '';
        if (experimentName) {
          setSearchQuery(experimentName);
        }
      } else {
        setSelectedFilters(defaultSelectedFilters);
        // Set default crop selection
        if (Crops.length > 0) {
          setSelectedCrop(Crops[0]);
        }
      }

      // Build filters payload with selected filters (prefilled or default)
      const filters = [];

      // Determine which crop to use (prefilled or default)
      const selectedCropOption =
        prefilledExperiment && matchingCrop
          ? matchingCrop
          : Crops.length > 0
          ? Crops[0]
          : null;

      if (selectedCropOption) {
        // Add year filter
        const selectedYear =
          prefilledExperiment && matchingYear
            ? matchingYear
            : Years.length > 0
            ? Years[0]
            : null;
        if (selectedYear) {
          filters.push({key: 'years', value: [selectedYear.value]});
        }

        // Add season filter
        const selectedSeason =
          prefilledExperiment && matchingSeason
            ? matchingSeason
            : Seasons.length > 0
            ? Seasons[0]
            : null;
        if (selectedSeason) {
          filters.push({key: 'seasons', value: [selectedSeason.value]});
        }

        // Note: crops are handled via cropId field, not in filters array

        // Fetch data with selected filters (only if online)
        if (networkIsConnected !== false) {
          const apiPayload = {
            cropId: selectedCropOption.value,
            page: 1,
            perPage: 10,
            filters,
            searchKeyword: '',
          };

          postFiltered({
            payload: apiPayload,
            headers: {'Content-Type': 'application/json'},
          });
        } else {
        }
      }
    }
  }, [filtersApiData, networkIsConnected]);

  // ─── Handle prefilled experiment changes (for navigation from recent experiments) ────────────────────────
  useEffect(() => {
    // Only apply prefilled experiment if we have filters loaded and a prefilled experiment
    if (
      !experimentFilters.Crops ||
      experimentFilters.Crops.length === 0 ||
      !prefilledExperiment
    ) {
      return;
    }

    // Check if this is the same prefilled experiment we already applied
    if (
      lastAppliedPrefilledExperiment.current &&
      lastAppliedPrefilledExperiment.current.experimentId ===
        prefilledExperiment.experimentId
    ) {
      return;
    }

    // Before applying new experiment, clear previous list state to avoid flashing stale data
    setFilteredExperiments({});
    setProjectList([]);
    setSelectedProject('');
    setSearchQuery('');

    // Mark this experiment as applied (reset fallback flag for new experiment)
    lastAppliedPrefilledExperiment.current = {
      ...prefilledExperiment,
      fallbackAttempted: false,
    };

    const {Crops, Years, Seasons, Locations} = experimentFilters;

    // Find matching options for the new prefilled data
    const matchingCrop = Crops.find(
      (crop: CropOption) =>
        crop.label.toLowerCase() ===
        prefilledExperiment.cropName?.toLowerCase(),
    );
    const matchingSeason = Seasons.find(
      (season: SeasonOption) =>
        season.label.toLowerCase() ===
        prefilledExperiment.season?.toLowerCase(),
    );
    const matchingYear = Years.find(
      (year: YearOption) => year.label.toString() === prefilledExperiment.year,
    );

    // Debug matching results for route change

    // Create prefilled filters
    const defaultSelectedFilters = {
      Seasons: Seasons.length > 0 ? [Seasons[0].label] : [],
      Locations: [], // Don't auto-select any location
      Years: Years.length > 0 ? [Years[0].label.toString()] : [],
      Crops: Crops.length > 0 ? [Crops[0].label] : [],
    };

    const prefilledFilters = {
      Seasons: matchingSeason
        ? [matchingSeason.label]
        : defaultSelectedFilters.Seasons,
      Locations: defaultSelectedFilters.Locations, // Keep default for now
      Years: matchingYear
        ? [matchingYear.label.toString()]
        : defaultSelectedFilters.Years,
      Crops: matchingCrop ? [matchingCrop.label] : defaultSelectedFilters.Crops,
    };

    setSelectedFilters(prefilledFilters);

    // Set prefilled crop selection
    if (matchingCrop) {
      setSelectedCrop(matchingCrop);
    }

    // Pre-populate search query with experiment name
    const experimentName =
      prefilledExperiment.fieldExperimentName ||
      prefilledExperiment.experimentName ||
      '';
    if (experimentName) {
      setSearchQuery(experimentName);
    }

    // Build filters payload with a broader approach to ensure we find the experiment
    const selectedCropOption =
      matchingCrop || (Crops.length > 0 ? Crops[0] : null);

    if (selectedCropOption) {
      // Start with broader filters - only use crop filter initially
      const filters = [];

      // Only add filters that we're confident about
      if (matchingYear) {
        filters.push({key: 'years', value: [matchingYear.value]});
      }

      if (matchingSeason) {
        filters.push({key: 'seasons', value: [matchingSeason.value]});
      }

      // Fetch data with broader filters and search
      const apiPayload = {
        cropId: selectedCropOption.value,
        page: 1,
        perPage: 20, // Increased to get more results
        filters,
        searchKeyword: experimentName ? experimentName.substring(0, 20) : '', // Use partial search
      };

      postFiltered({
        payload: apiPayload,
        headers: {'Content-Type': 'application/json'},
      });
    }
  }, [prefilledExperiment, experimentFilters, postFiltered]);

  // Clear the last applied prefilled experiment when the component unmounts or navigation changes
  useEffect(() => {
    return () => {
      lastAppliedPrefilledExperiment.current = null;
    };
  }, [route.params]);

  // ─── When postFilteredData arrives ─────────────────────
  useEffect(() => {
    try {
      if (postFilteredData?.projects) {
        const newProjectsData: {[key: string]: Experiment[]} =
          postFilteredData.projects;
        const keys = Object.keys(newProjectsData);

        setTotalProjects(postFilteredData.totalProjects || 0);

        if (projectPage === 1) {
          setFilteredExperiments(newProjectsData);
          setProjectList(keys);
          setSelectedProject(keys[0] || '');

          // Only inject metadata from first experiment if this is the initial load
          // and we don't have any filters selected yet
          const firstExperiment = Object.values(newProjectsData)?.[0]?.[0];
          if (firstExperiment && skipAutoFilterApplyRef.current) {
            const {cropId, cropName, year, season} =
              extractMetadataFromExperiment(firstExperiment);

            if (cropId && cropName) {
              setSelectedCrop({value: cropId, label: cropName});
            }

            // Only set default filters if we don't have any selected
            setSelectedFilters(prev => {
              const hasAnyFilters =
                prev.Years.length > 0 ||
                prev.Seasons.length > 0 ||
                prev.Locations.length > 0;
              if (!hasAnyFilters) {
                return {
                  ...prev,
                  Years: year ? [year.toString()] : [],
                  Seasons: season ? [season] : [],
                };
              }
              return prev; // Keep existing filters
            });

            skipAutoFilterApplyRef.current = false;
          }
        } else {
          setFilteredExperiments(prev => ({
            ...prev,
            ...newProjectsData,
          }));
          setProjectList(prev => {
            const merged = [...prev];
            keys.forEach(k => {
              if (!merged.includes(k)) {
                merged.push(k);
              }
            });
            return merged;
          });
        }

        setLoadingMore(false);
        setIsFilterLoading(false);
        // If we have a prefilledExperiment but the filtered response didn't include it,
        // we will attempt a direct fetch by experiment id in the postFilteredData handling below.
      } else if (postFilteredData && !postFilteredData.projects) {
        // Handle case where API returns success but no data
        setFilteredExperiments({});
        setProjectList([]);
        setSelectedProject('');
        setLoadingMore(false);
        setIsFilterLoading(false);
      }
    } catch (error) {
      Toast.error({message: t(LOCALES.EXPERIMENT.MSG_ERROR_PROCESSING)});
      setLoadingMore(false);
      setIsFilterLoading(false);
    }
  }, [postFilteredData, projectPage]);

  // If the filtered API returned no projects for a prefilled experiment, try fetching by id
  useEffect(() => {
    if (
      prefilledExperiment &&
      postFilteredData &&
      (!postFilteredData.projects ||
        Object.keys(postFilteredData.projects).length === 0) &&
      !isGettingExperimentDetails
    ) {
      const id =
        prefilledExperiment.experimentId || prefilledExperiment.experimentId;
      if (id) {
        // call details endpoint; use pathParams/queryParams signature used elsewhere
        // Some endpoints expect id as path param; if API expects query param, adjust queryParams accordingly
        getExperimentDetails({
          pathParams: id,
          queryParams: prefilledExperiment?.experimentType
            ? `experimentType=${encodeURIComponent(
                prefilledExperiment.experimentType,
              )}`
            : '',
        });
      }
    }
  }, [
    prefilledExperiment,
    postFilteredData,
    getExperimentDetails,
    isGettingExperimentDetails,
  ]);

  // When experiment details arrive, inject into filteredExperiments so the UI shows it
  useEffect(() => {
    if (experimentDetailsData && experimentDetailsData.status_code === 200) {
      const exp = experimentDetailsData.data || experimentDetailsData;
      if (exp) {
        try {
          // Build a minimal projects object that matches existing shape
          const projectKey =
            exp.projectKey ||
            exp.project_id ||
            exp.project ||
            'prefill_project';
          const projectsObj: {[key: string]: Experiment[]} = {};
          projectsObj[projectKey] = [exp];

          setFilteredExperiments(projectsObj);
          setProjectList([projectKey]);
          setSelectedProject(projectKey);
          setTotalProjects(1);
          setIsFilterLoading(false);
        } catch (err) {}
      }
    }
  }, [experimentDetailsData]);

  // ─── Fallback for recent experiments navigation when no results found ──────────────────────────────────
  useEffect(() => {
    // Check if we're coming from recent experiments navigation and got no results
    if (
      prefilledExperiment &&
      postFilteredData &&
      (!postFilteredData.projects ||
        Object.keys(postFilteredData.projects).length === 0) &&
      !isFilterLoading
    ) {
      // Try a broader search with just the crop and experiment name
      const {Crops} = experimentFilters;
      const matchingCrop = Crops?.find(
        (crop: CropOption) =>
          crop.label.toLowerCase() ===
          prefilledExperiment.cropName?.toLowerCase(),
      );

      if (matchingCrop) {
        const experimentName =
          prefilledExperiment.fieldExperimentName ||
          prefilledExperiment.experimentName ||
          '';

        // Use a very broad search - just crop and partial experiment name
        const fallbackPayload = {
          cropId: matchingCrop.value,
          page: 1,
          perPage: 20,
          filters: [], // No additional filters
          searchKeyword:
            experimentName.split('-')[0] || experimentName.substring(0, 10), // Use first part or shorter substring
        };

        // Mark that we're doing a fallback search to prevent infinite loops
        if (!lastAppliedPrefilledExperiment.current?.fallbackAttempted) {
          lastAppliedPrefilledExperiment.current = {
            ...lastAppliedPrefilledExperiment.current,
            fallbackAttempted: true,
          };

          postFiltered({
            payload: fallbackPayload,
            headers: {'Content-Type': 'application/json'},
          });
        }
      }
    }
  }, [
    postFilteredData,
    prefilledExperiment,
    experimentFilters,
    isFilterLoading,
    postFiltered,
  ]);

  // Remove the old useEffect that was causing conflicts
  // Filter application is now handled directly in handleFilterUpdate

  useEffect(() => {
    setIsFilterApplied(
      selectedFilters.Seasons.length > 0 ||
        selectedFilters.Locations.length > 0 ||
        selectedFilters.Years.length > 0,
    );
  }, [selectedFilters]);

  // Apply filters after FilterModal updates all filter states
  useEffect(() => {
    if (shouldApplyFiltersAfterUpdate.current) {
      shouldApplyFiltersAfterUpdate.current = false;

      // Use setTimeout to ensure all state updates have been processed
      setTimeout(() => {
        applyFiltersWithCurrentState();
      }, 100);
    }
  }, [selectedFilters]);

  interface HandleFilterUpdate {
    (filterType: keyof SelectedFilters, values: string[]): void;
  }

  const handleFilterClearAll = () => {
    // Clear search query when clearing all filters
    setSearchQuery('');

    // Reset to default selections (first option of each)
    const defaultSelectedFilters = {
      Seasons:
        experimentFilters.Seasons.length > 0
          ? [experimentFilters.Seasons[0].label]
          : [],
      Locations: [], // Don't auto-select any location
      Years:
        experimentFilters.Years.length > 0
          ? [experimentFilters.Years[0].label.toString()]
          : [],
      Crops:
        experimentFilters.Crops.length > 0
          ? [experimentFilters.Crops[0].label]
          : [],
    };
    setSelectedFilters(defaultSelectedFilters);

    // Reset crop selection to first option
    if (experimentFilters.Crops.length > 0) {
      setSelectedCrop(experimentFilters.Crops[0]);
    }

    // Trigger API call with cleared filters
    setTimeout(() => {
      applyFiltersWithCurrentState();
    }, 0);
  };

  const handleFilterUpdate: HandleFilterUpdate = (filterType, values) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
      return;
    }

    // Clear search query when any filter is changed to avoid confusion
    setSearchQuery('');

    // Update the state - use functional update to ensure we have the latest state
    setSelectedFilters(prevFilters => {
      const newSelectedFilters = {
        ...prevFilters,
        [filterType]: values,
      };
      return newSelectedFilters;
    });

    // If this is a crop selection, update the selectedCrop state as well
    if (filterType === 'Crops' && values.length > 0) {
      const cropLabel = values[0];
      const crop = experimentFilters.Crops.find(c => c.label === cropLabel);
      if (crop) {
        setSelectedCrop(crop);
      }
    }

    // DON'T trigger API call here - let the FilterModal's Apply button handle it
  };

  // Handler for FilterCards - triggers API call immediately
  const handleFilterCardsUpdate = (
    filterType: keyof SelectedFilters,
    values: string[],
  ) => {
    // Restrict crop selection to only one
    if (filterType === 'Crops' && values.length > 1) {
      Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
      return;
    }

    // Clear search query when any filter is changed to avoid confusion
    setSearchQuery('');

    // Create the new state immediately for use in API call
    const newSelectedFilters = {
      ...selectedFilters,
      [filterType]: values,
    };

    // Update the state
    setSelectedFilters(newSelectedFilters);

    // If this is a crop selection, update the selectedCrop state as well
    let currentCrop = selectedCrop;
    if (filterType === 'Crops' && values.length > 0) {
      const cropLabel = values[0];
      const crop = experimentFilters.Crops.find(c => c.label === cropLabel);
      if (crop) {
        setSelectedCrop(crop);
        currentCrop = crop;
      }
    }

    // Trigger API call immediately with the new filter values for FilterCards
    applyFiltersWithValues(newSelectedFilters, currentCrop, '');
  };

  // New function to apply filters with provided values instead of state
  const applyFiltersWithValues = (
    filterValues: SelectedFilters,
    cropToUse?: CropOption | null,
    searchKeyword: string = '',
  ) => {
    if (isFilterLoading) return;

    // Check if we have a valid crop selected
    let cropId = cropToUse?.value || selectedCrop?.value;
    if (!cropId && filterValues.Crops.length > 0) {
      const cropLabel = filterValues.Crops[0];
      const crop = experimentFilters.Crops.find(c => c.label === cropLabel);
      cropId = crop?.value;
    }

    if (!cropId) {
      return;
    }

    // Build filters payload with provided filterValues
    const filters = [];
    if (filterValues.Years.length > 0) {
      const yearValues = filterValues.Years.map(yearLabel => {
        const year = experimentFilters.Years.find(
          y => y.label.toString() === yearLabel,
        );
        return year?.value;
      }).filter(value => value !== undefined);
      if (yearValues.length > 0) {
        filters.push({key: 'years', value: yearValues});
      }
    }
    if (filterValues.Seasons.length > 0) {
      const seasonValues = filterValues.Seasons.map(seasonLabel => {
        const season = experimentFilters.Seasons.find(
          s => s.label === seasonLabel,
        );
        return season?.value;
      }).filter(value => value !== undefined);
      if (seasonValues.length > 0) {
        filters.push({key: 'seasons', value: seasonValues});
      }
    }
    if (filterValues.Locations.length > 0) {
      // Locations are stored as value strings (e.g., "112"), not labels
      const locationValues = filterValues.Locations.map(locationValueStr => {
        // Try to parse as number or keep as string
        const locationValue = !isNaN(Number(locationValueStr))
          ? Number(locationValueStr)
          : locationValueStr;

        return locationValue;
      }).filter(value => value !== undefined);

      if (locationValues.length > 0) {
        filters.push({key: 'locations', value: locationValues});
      } else {
      }
    } else {
    }
    // Note: crops are handled via cropId field, not in filters array

    setIsFilterLoading(true);
    // reset to page 1
    setProjectPage(1);
    setProjectList([]);
    setFilteredExperiments({});

    // kick off the filtered POST
    const apiPayload = {
      cropId: cropId,
      page: 1,
      perPage: 10,
      filters,
      searchKeyword: searchKeyword,
    };

    postFiltered({
      payload: apiPayload,
      headers: {'Content-Type': 'application/json'},
    })
      .then(() => {
        setIsFilterLoading(false);
      })
      .catch(error => {
        setIsFilterLoading(false);
      });
  };

  // New function to apply filters with current state
  const applyFiltersWithCurrentState = () => {
    if (isFilterLoading) return;

    // Check if we have a valid crop selected
    let cropId = selectedCrop?.value;
    if (!cropId && selectedFilters.Crops.length > 0) {
      const cropLabel = selectedFilters.Crops[0];
      const crop = experimentFilters.Crops.find(c => c.label === cropLabel);
      cropId = crop?.value;
    }

    if (!cropId) {
      return;
    }

    // Build filters payload with current selectedFilters state
    const filters = [];
    if (selectedFilters.Years.length > 0) {
      const yearValues = selectedFilters.Years.map(yearLabel => {
        const year = experimentFilters.Years.find(
          y => y.label.toString() === yearLabel,
        );
        return year?.value;
      }).filter(value => value !== undefined);
      if (yearValues.length > 0) {
        filters.push({key: 'years', value: yearValues});
      }
    }
    if (selectedFilters.Seasons.length > 0) {
      const seasonValues = selectedFilters.Seasons.map(seasonLabel => {
        const season = experimentFilters.Seasons.find(
          s => s.label === seasonLabel,
        );
        return season?.value;
      }).filter(value => value !== undefined);
      if (seasonValues.length > 0) {
        filters.push({key: 'seasons', value: seasonValues});
      }
    }
    if (selectedFilters.Locations.length > 0) {
      // Locations are stored as value strings (e.g., "112"), not labels
      const locationValues = selectedFilters.Locations.map(locationValueStr => {
        // Try to parse as number or keep as string
        const locationValue = !isNaN(Number(locationValueStr))
          ? Number(locationValueStr)
          : locationValueStr;

        return locationValue;
      }).filter(value => value !== undefined);

      if (locationValues.length > 0) {
        filters.push({key: 'locations', value: locationValues});
      } else {
      }
    } else {
    }
    // Note: crops are handled via cropId field, not in filters array

    setIsFilterLoading(true);
    // reset to page 1
    setProjectPage(1);
    setProjectList([]);
    setFilteredExperiments({});

    // kick off the filtered POST
    const apiPayload = {
      cropId: cropId,
      page: 1,
      perPage: 10,
      filters,
      searchKeyword: searchQuery,
    };

    postFiltered({
      payload: apiPayload,
      headers: {'Content-Type': 'application/json'},
    })
      .then(() => {
        setIsFilterLoading(false);
      })
      .catch(error => {
        Toast.error({
          message: t(LOCALES.EXPERIMENT.MSG_FAILED_APPLY_FILTERS),
        });
        setIsFilterLoading(false);
      });
  };

  interface HandleCropSelection {
    (label: string, clear?: boolean): void;
  }

  const applyFilters = () => {
    applyFiltersWithCurrentState();
  };

  const handleCropSelection: HandleCropSelection = (label, clear = false) => {
    if (isFilterLoading) return; // Prevent multiple simultaneous calls

    const crop: CropOption | undefined = cropOptions.find(
      (c: CropOption) => c.label === label,
    );
    if (!crop) {
      return;
    }

    // Always clear search query when crop selection changes to avoid confusion
    setSearchQuery('');

    setSelectedCrop(crop);

    // Update selectedFilters with new crop but preserve existing filters
    setSelectedFilters(prev => ({
      ...prev,
      Crops: [label],
    }));

    // Trigger API call with updated filters
    setTimeout(() => {
      applyFiltersWithCurrentState();
    }, 0);
  };

  // Remove these useEffects as crop selection is now handled in the initial filter loading

  interface ProjectScrollEvent {
    nativeEvent: {
      contentOffset: {x: number; y: number};
      layoutMeasurement: {width: number; height: number};
      contentSize: {width: number; height: number};
    };
  }

  const handleProjectScroll = useCallback(
    (e: ProjectScrollEvent) => {
      const {contentOffset, layoutMeasurement, contentSize} = e.nativeEvent;
      if (
        contentOffset.x + layoutMeasurement.width + 100 >= contentSize.width &&
        projectList.length < totalProjects &&
        !isPostLoading
      ) {
        setProjectPage((p: number) => p + 1);
        if (selectedCrop) {
          const apiPayload = {
            cropId: selectedCrop.value,
            page: projectPage + 1,
            perPage: 10,
            filters: buildFiltersPayload(),
          };

          postFiltered({
            payload: apiPayload,
            headers: {'Content-Type': 'application/json'},
          }).catch(error => {
            Toast.error({
              message: t(LOCALES.EXPERIMENT.MSG_FAILED_LOAD_PROJECTS),
            });
          });
        }
      }
    },
    [projectList, totalProjects, projectPage, selectedCrop, isPostLoading],
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View style={{width: '100%'}}>
        <FilterCards
          yearOptions={experimentFilters.Years.map(y => ({
            ...y,
            label: y.label.toString(),
          }))}
          seasonOptions={experimentFilters.Seasons}
          cropOptions={experimentFilters.Crops}
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
            // Restrict crop selection to only one
            if (cropLabels.length > 1) {
              Toast.error({message: t(LOCALES.COMMON.MSG_SELECT_SINGLE_CROP)});
              return;
            }
            if (cropLabels.length > 0) {
              handleFilterCardsUpdate('Crops', cropLabels);
            }
          }}
        />
      </View>
    ),
    [experimentFilters, selectedFilters, handleFilterCardsUpdate],
  );

  const finalExperimentList = useMemo(() => {
    const arr =
      selectedProject && filteredExperiments[selectedProject]
        ? filteredExperiments[selectedProject]
        : [];
    if (!searchQuery) {
      return arr;
    }
    const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    return arr.filter(ex => {
      const n1 = (ex.experimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const n2 = (ex.fieldExperimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      return n1.includes(q) || n2.includes(q);
    });
  }, [filteredExperiments, selectedProject, searchQuery]);

  const finalList = useMemo(() => {
    if (isConnected === false) {
      // offline
    }
    return (filteredExperiments[selectedProject] || []).filter(ex => {
      if (!searchQuery) {
        return true;
      }
      const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        (ex.experimentName || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .includes(q) ||
        (ex.fieldExperimentName || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .includes(q)
      );
    });
  }, [
    isConnected,
    selectedProject,
    offlineExperiments,
    filteredExperiments,
    searchQuery,
  ]);

  const handleSearch = () => {
    if (isConnected) {
      if (selectedCrop) {
        handleCropSelection(selectedCrop.label, false);
      } else if (cropList.length) {
        handleCropSelection(cropList[0]);
      }
    } else {
      fetchOfflineExperimentList(selectedProject)
        .then(rows => setOfflineExperiments({[selectedProject]: rows}))
        .catch(() => setOfflineExperiments({[selectedProject]: []}));
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const onOfflineToggle = useCallback(
    async (exp: Experiment & {locationId?: number}) => {
      // If locationId is provided, use location-specific caching
      if (exp.locationId) {
        const locationParams: LocationCacheParams = {
          experimentId: exp.id,
          locationId: exp.locationId,
          experimentType: exp.experimentType,
          cropId: exp.cropId,
        };

        await toggleLocationOffline(locationParams);

        // Load updated offline states for this experiment
        await loadOfflineStates(exp.id);
      } else {
        // Fallback to experiment-level caching (existing functionality)
        const already = offlineIds.includes(exp.id);
        if (!already) {
          // Cache the experiment if it's not already offline
          await cacheAll(exp);
          if (exp.projectKey) {
            await fetchOfflineExperimentList(exp.projectKey);
          }
        } else {
          // Remove the experiment from cache if it's already offline
          await deleteOfflineData(exp);
          if (exp.projectKey) {
            await fetchOfflineExperimentList(exp.projectKey);
          }
        }
      }
    },
    [
      cacheAll,
      deleteOfflineData,
      offlineIds,
      toggleLocationOffline,
      loadOfflineStates,
    ],
  );

  useEffect(() => {
    if (isConnected === false && selectedProject) {
      fetchOfflineExperimentList(selectedProject)
        .then(rows => setOfflineExperiments({[selectedProject]: rows}))
        .catch(() => setOfflineExperiments({[selectedProject]: []}));
    }
  }, [isConnected, selectedProject]);

  // Load offline states for experiments when they're fetched
  useEffect(() => {
    const uniqueExperimentIds = [
      ...new Set(
        Object.values(filteredExperiments)
          .flat()
          .map(exp => exp.id),
      ),
    ];

    // Load offline states for all experiments
    uniqueExperimentIds.forEach(experimentId => {
      loadOfflineStates(experimentId).catch(error => {});
    });
  }, [filteredExperiments, loadOfflineStates]);

  useEffect(() => {
    if (!isPostLoading) {
      setIsFetchingMore(false);
    }
  }, [isPostLoading]);

  // flatten *all* projects’ experiments and apply the search‐query filter
  const experiments = useMemo<Experiment[]>(() => {
    // 1) flatten
    const all = Object.values(filteredExperiments).flat();
    // 2) dedupe by id
    const uniqMap = new Map<number, Experiment>();
    all.forEach(ex => {
      if (!uniqMap.has(ex.id)) uniqMap.set(ex.id, ex);
    });
    const uniq = Array.from(uniqMap.values());

    // 3) search‐filter
    if (!searchQuery) return uniq;
    const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    return uniq.filter(ex => {
      const n1 = (ex.experimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const n2 = (ex.fieldExperimentName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      return n1.includes(q) || n2.includes(q);
    });
  }, [filteredExperiments, searchQuery]);

  // pagination flag: keep loading until we get a “short” page
  const hasMore = experiments.length === projectPage * PER_PAGE;

  // State to track if more data is being fetched during pagination
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const extractMetadataFromExperiment = (experiment: Experiment) => {
    return {
      cropId: experiment.cropId,
      cropName: experiment.cropName,
      year: experiment.Year?.toString(),
      season: experiment.season,
    };
  };

  return (
    <SafeAreaView
      edges={['top']}
      parentStyle={isOptionModalVisible && styles.modalOpen}>
      {isPostLoading || isFiltersLoading || isFilterLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <>
          {roleName?.toLowerCase() !== 'admin' && (
            <View style={styles.main_header}>
              <Header navigation={navigation as any} />
            </View>
          )}
          {/* 🔍 TEMPORARY: Add this for debugging - REMOVE AFTER TESTING */}
          {/* {__DEV__ && <DatabaseDebugger />} */}

          <StatusBar />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
            </Text>
            {!isConnected && (
              <View style={{position: 'absolute', right: 30}}>
                <NoInternet />
              </View>
            )}
          </View>
          {networkIsConnected === false && (
            <View style={styles.offlineBanner}>
              <OrangeNoNetwork width={30} height={20} />
              <Text style={styles.offlineBannerText}>
                {t(LOCALES.EXPERIMENT.MSG_OFFLINE_USING_CACHE)}
              </Text>
            </View>
          )}
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

            {experiments.length === 0 ? (
              <View style={additionalStyles.noDataContainer}>
                <Text style={additionalStyles.noDataText}>
                  {t(LOCALES.COMMON.LBL_NO_DATA_FOUND)}
                </Text>
              </View>
            ) : (
              <FlatList
                data={experiments}
                contentContainerStyle={additionalStyles.flatListContent}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <ExperimentCard
                    item={{
                      // use the fieldExperimentName as the group name:
                      name:
                        item.fieldExperimentName ||
                        item.experimentName ||
                        selectedProject,
                      data: [item],
                    }}
                    selectedProject={selectedProject}
                    offlineEnabledExperiments={offlineIds}
                    toggleOffline={exp => onOfflineToggle(exp)}
                    isAnyCaching={isCaching || isLocationCaching}
                    isGlobalCaching={isCaching}
                    // Location-specific props
                    offlineLocationStates={offlineLocationStates}
                    isLocationOffline={isLocationOffline}
                    getExperimentOfflineLocations={
                      getExperimentOfflineLocations
                    }
                    // Network connectivity state for conditional rendering
                    networkIsConnected={networkIsConnected}
                  />
                )}
                keyExtractor={ex => ex.id.toString()}
                // prevent multiple calls per scroll gesture
                onMomentumScrollBegin={() => setIsFetchingMore(false)}
                // fire when user scrolls within 50% of bottom
                onEndReachedThreshold={0.8}
                onEndReached={() => {
                  // only if we’re not already loading and the last page was “full”
                  if (!isPostLoading && hasMore) {
                    setLoadingMore(true);
                    const nextPage = projectPage + 1;
                    setProjectPage(nextPage);

                    const apiPayload = {
                      cropId: selectedCrop!.value,
                      page: nextPage,
                      perPage: PER_PAGE,
                      filters: buildFiltersPayload(),
                      searchKeyword: searchQuery,
                    };

                    postFiltered({
                      payload: apiPayload,
                      headers: {'Content-Type': 'application/json'},
                    }).catch(error => {
                      Toast.error({
                        message: t(LOCALES.EXPERIMENT.MSG_FAILED_LOAD_DATA),
                      });
                    });
                  }
                }}
                ListFooterComponent={loadingMore ? <Loader /> : null}
              />
            )}
          </View>

          {!isOptionModalVisible && (
            <Pressable style={styles.newRecord} onPress={toggleOptionModal}>
              <Plus />
              <Text style={styles.newRecordText}>
                {t(LOCALES.EXPERIMENT.NEW_RECORD)}
              </Text>
            </Pressable>
          )}

          <NewRecordOptionsModal
            isModalVisible={isOptionModalVisible}
            closeModal={() => setIsOptionModalVisible(false)}
            onSelectFromList={() => {
              setIsOptionModalVisible(false);
              navigation.navigate('NewRecord');
            }}
          />

          <FilterModal
            isVisible={isFilterModalVisible}
            onClose={() => setIsFilterModalVisible(false)}
            onApply={() => {
              shouldApplyFiltersAfterUpdate.current = true;
            }}
            onFilterSelect={handleFilterUpdate}
            filterData={{
              ...experimentFilters,
              Years: experimentFilters.Years.map(y => ({
                ...y,
                label: y.label.toString(),
                value: y.value,
              })),
              Crops: experimentFilters.Crops.map(c => ({
                ...c,
                label: c.label.toString(),
                value: c.value,
              })),
            }}
            selectedFilters={selectedFilters}
            onClearAll={handleFilterClearAll}
          />
        </>
      )}
    </SafeAreaView>
  );
};

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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'black',
    fontFamily: FONTS.SEMI_BOLD,
  },
  flatListContent: {
    paddingBottom: 80,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Experiment;
