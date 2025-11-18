import {useEffect, useState, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getAllOfflineLocationIds,
  fetchOfflineExperimentList,
  fetchOfflineExperimentDetails,
  fetchOfflinePlotList,
  fetchOfflineFilters,
} from './DbQueries';

// Type definitions for offline data
interface OfflineExperimentData {
  filters: any; // Object with Years, Crops, Seasons, Locations arrays
  experimentList: any; // Object with projects and totalProjects
  experimentDetails: {[experimentId: string]: any};
  plotData: {[locationId: string]: any}; // Keyed by locationId, not experimentId
}

interface LocationOfflineState {
  id: number;
  experimentId: number;
  locationId: number;
  experimentType: string;
  cropId: number;
  isOffline: number;
  lastCachedAt: number;
}

export const useOfflineDataRetrieval = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [offlineData, setOfflineData] = useState<OfflineExperimentData>({
    filters: {filters: {Years: [], Crops: [], Seasons: [], Locations: []}},
    experimentList: {projects: {}, totalProjects: 0},
    experimentDetails: {},
    plotData: {},
  });
  const [isLoadingOfflineData, setIsLoadingOfflineData] =
    useState<boolean>(false);

  // Monitor network connectivity and load initial data
  useEffect(() => {
    const initializeData = async () => {
      // Get initial network state
      const state = await NetInfo.fetch();
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Always try to load offline data on startup regardless of network state
      // This ensures data is available immediately when app starts
      await loadOfflineData();
    };

    initializeData();

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Load offline data when going offline
      if (!connected) {
        loadOfflineData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadOfflineData = async () => {
    setIsLoadingOfflineData(true);

    try {
      console.log('🔍 [OfflineDataRetrieval] Starting to load offline data...');

      // Get all offline location states (uses correct camelCase columns)
      const offlineLocations: LocationOfflineState[] =
        await getAllOfflineLocationIds();

      console.log(
        `🔍 [OfflineDataRetrieval] Found ${offlineLocations.length} offline locations`,
      );

      if (offlineLocations.length === 0) {
        console.log(
          '⚠️ [OfflineDataRetrieval] No offline locations found, skipping data load',
        );
        setIsLoadingOfflineData(false);
        return;
      }

      // ✅ Load filters data using CORRECT function
      const filters = await fetchOfflineFilters();
      console.log(
        '✅ [OfflineDataRetrieval] Filters loaded:',
        filters?.filters
          ? `Years: ${filters.filters.Years?.length}, Crops: ${filters.filters.Crops?.length}, Seasons: ${filters.filters.Seasons?.length}, Locations: ${filters.filters.Locations?.length}`
          : 'No filters',
      );

      // ✅ Load experiment list data using CORRECT function
      const experimentList = await fetchOfflineExperimentList('');
      console.log(
        `✅ [OfflineDataRetrieval] Experiment list loaded: ${experimentList?.totalProjects || 0} experiments`,
      );

      // Get unique experiment IDs from offline locations (use correct camelCase property)
      const experimentIds = [
        ...new Set(offlineLocations.map(loc => loc.experimentId)),
      ];
      console.log(
        `🔍 [OfflineDataRetrieval] Processing ${experimentIds.length} unique experiments`,
      );

      // Load experiment details and plot data for each experiment
      const experimentDetails: {[key: string]: any} = {};
      const plotData: {[key: string]: any} = {};

      for (const experimentId of experimentIds) {
        try {
          console.log(
            `🔍 [OfflineDataRetrieval] Loading details for experiment ${experimentId}`,
          );

          // ✅ Load experiment details using CORRECT function
          const details = await fetchOfflineExperimentDetails(
            experimentId.toString(),
          );
          if (details && details.data) {
            experimentDetails[experimentId] = details.data;
            console.log(
              `✅ [OfflineDataRetrieval] Experiment ${experimentId} details loaded, locations: ${details.data.locationList?.length || 0}`,
            );

            // 🔑 CRITICAL FIX: Extract location IDs from experiment details
            // Plot data is keyed by LOCATION ID, not experiment ID!
            const locationList = details.data.locationList || [];
            for (const location of locationList) {
              const locationId = location.id;
              console.log(
                `🔍 [OfflineDataRetrieval] Loading plots for location ${locationId}`,
              );

              // ✅ Load plot data using CORRECT function with LOCATION ID
              const plots = await fetchOfflinePlotList(locationId.toString());
              if (plots && plots.data) {
                plotData[locationId] = plots.data;
                console.log(
                  `✅ [OfflineDataRetrieval] Location ${locationId} plots loaded: ${plots.data.plotData?.length || 0} plots`,
                );
              } else {
                console.log(
                  `⚠️ [OfflineDataRetrieval] No plot data found for location ${locationId}`,
                );
              }
            }
          } else {
            console.log(
              `⚠️ [OfflineDataRetrieval] No details found for experiment ${experimentId}`,
            );
          }
        } catch (error) {
          console.error(
            `❌ [OfflineDataRetrieval] Error loading data for experiment ${experimentId}:`,
            error,
          );
        }
      }

      // Update offline data state with correct structure
      const newOfflineData: OfflineExperimentData = {
        filters: filters || {filters: {Years: [], Crops: [], Seasons: [], Locations: []}},
        experimentList: experimentList || {projects: {}, totalProjects: 0},
        experimentDetails,
        plotData,
      };

      console.log('✅ [OfflineDataRetrieval] Offline data fully loaded:', {
        filtersCount: newOfflineData.filters?.filters?.Years?.length || 0,
        experimentsCount: newOfflineData.experimentList?.totalProjects || 0,
        experimentDetailsCount: Object.keys(experimentDetails).length,
        plotDataCount: Object.keys(plotData).length,
      });

      setOfflineData(newOfflineData);
    } catch (error) {
      console.error(
        '❌ [OfflineDataRetrieval] Error in loadOfflineData:',
        error,
      );
    } finally {
      setIsLoadingOfflineData(false);
    }
  };

  // Get experiment list with offline filtering - mimics EXPERIMENT_LIST_FILTERED API
  const getFilteredExperimentList = useCallback(
    (filtersPayload?: any, cropId?: number) => {
      if (isConnected) {
        return null; // Use online data when connected
      }

      console.log(
        '🔍 [OfflineDataRetrieval] getFilteredExperimentList called',
        {filtersPayload, cropId},
      );

      // Get the stored experiment list from offline data (now an object with projects)
      const storedData = offlineData.experimentList;

      if (
        !storedData ||
        !storedData.projects ||
        storedData.totalProjects === 0
      ) {
        console.log(
          '⚠️ [OfflineDataRetrieval] No experiments in offline data',
        );
        return {projects: {}, totalProjects: 0};
      }

      // Flatten the projects object into an array of experiments
      let experiments: any[] = [];
      Object.values(storedData.projects).forEach((projectExperiments: any) => {
        if (Array.isArray(projectExperiments)) {
          experiments = experiments.concat(projectExperiments);
        }
      });

      console.log(
        `🔍 [OfflineDataRetrieval] Found ${experiments.length} total experiments before filtering`,
      );


      // Apply filters (same logic as online API would do)
      let filteredExperiments = experiments;

      // Filter by crop ID if provided
      if (cropId) {
        filteredExperiments = filteredExperiments.filter((exp: any) => {
          return exp.cropId === cropId || exp.crop_id === cropId;
        });
      }

      // Apply other filters from payload
      if (filtersPayload && Array.isArray(filtersPayload)) {
        filtersPayload.forEach((filter: any) => {
          if (
            filter.key === 'years' &&
            filter.value &&
            filter.value.length > 0
          ) {
            filteredExperiments = filteredExperiments.filter((exp: any) => {
              return (
                filter.value.includes(exp.year) ||
                filter.value.includes(exp.Year)
              );
            });
          }

          if (
            filter.key === 'seasons' &&
            filter.value &&
            filter.value.length > 0
          ) {
            filteredExperiments = filteredExperiments.filter((exp: any) => {
              return (
                filter.value.includes(exp.season) ||
                filter.value.includes(exp.Season)
              );
            });
          }

          if (
            filter.key === 'locations' &&
            filter.value &&
            filter.value.length > 0
          ) {
            filteredExperiments = filteredExperiments.filter((exp: any) => {
              return (
                filter.value.includes(exp.locationId) ||
                filter.value.includes(exp.location_id)
              );
            });
          }
        });
      }

      // Group by project key (same structure as online API response)
      const groupedProjects: {[key: string]: any[]} = {};

      filteredExperiments.forEach((exp: any) => {
        const projectKey =
          exp.projectKey ||
          exp.project_key ||
          exp.experimentName ||
          exp.experiment_name ||
          'default';

        if (!groupedProjects[projectKey]) {
          groupedProjects[projectKey] = [];
        }
        groupedProjects[projectKey].push(exp);
      });

      const result = {
        projects: groupedProjects,
        totalProjects: filteredExperiments.length,
      };

      console.log(
        `✅ [OfflineDataRetrieval] Returning ${result.totalProjects} filtered experiments in ${Object.keys(groupedProjects).length} projects`,
      );

      return result;
    },
    [isConnected, offlineData.experimentList],
  );

  // Get experiment details
  const getExperimentDetails = useCallback(
    (experimentId: string) => {
      if (isConnected) {
        return null; // Use online data when connected
      }

      return offlineData.experimentDetails[experimentId] || null;
    },
    [isConnected, offlineData.experimentDetails],
  );

  // Get plot list for an experiment
  const getPlotList = useCallback(
    (experimentId: string) => {
      if (isConnected) {
        return null; // Use online data when connected
      }

      return offlineData.plotData[experimentId] || [];
    },
    [isConnected, offlineData.plotData],
  );

  // Get filters data - mimics GET_FILTERS API
  const getFilters = useCallback(() => {
    if (isConnected) {
      return null; // Use online data when connected
    }

    console.log('🔍 [OfflineDataRetrieval] getFilters called');

    const filtersData = offlineData.filters;
    if (
      !filtersData ||
      !filtersData.filters ||
      Object.keys(filtersData.filters).length === 0
    ) {
      console.log('⚠️ [OfflineDataRetrieval] No filters in offline data');
      return null;
    }

    // Return in the same format as online API
    const filtersResponse = {
      status_code: 200,
      filters: filtersData.filters, // Object with Years, Crops, Seasons, Locations
    };

    console.log('✅ [OfflineDataRetrieval] Returning filters:', {
      Years: filtersResponse.filters.Years?.length || 0,
      Crops: filtersResponse.filters.Crops?.length || 0,
      Seasons: filtersResponse.filters.Seasons?.length || 0,
      Locations: filtersResponse.filters.Locations?.length || 0,
    });

    return filtersResponse;
  }, [isConnected, offlineData.filters]);

  // Check if specific experiment has offline data
  const hasOfflineData = useCallback(
    (experimentId: string) => {
      return (
        !!offlineData.experimentDetails[experimentId] ||
        !!offlineData.plotData[experimentId]
      );
    },
    [offlineData.experimentDetails, offlineData.plotData],
  );

  // Refresh offline data manually
  const refreshOfflineData = useCallback(async () => {
    await loadOfflineData();
  }, [loadOfflineData]);

  return {
    isConnected,
    isLoadingOfflineData,
    offlineData,
    getFilteredExperimentList,
    getExperimentDetails,
    getPlotList,
    getFilters,
    hasOfflineData,
    refreshOfflineData,
    loadOfflineData,
  };
};

// Helper function to check if app should use offline mode
export const shouldUseOfflineMode = (isConnected: boolean): boolean => {
  return !isConnected;
};

// Helper function to get offline indicator text
export const getOfflineIndicatorText = (
  isConnected: boolean,
  hasOfflineData: boolean,
): string => {
  if (isConnected) {
    return 'Online';
  }

  if (hasOfflineData) {
    return 'Offline Mode';
  }

  return 'No Offline Data';
};
