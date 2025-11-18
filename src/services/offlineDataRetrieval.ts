import {useEffect, useState, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getAllOfflineLocationStates,
  getExperimentListData,
  getExperimentDetailsData,
  getPlotListData,
  getFiltersData,
} from './DbQueries';

// Type definitions for offline data
interface OfflineExperimentData {
  filters: any[];
  experimentList: any[];
  experimentDetails: {[experimentId: string]: any};
  plotData: {[experimentId: string]: any[]};
}

interface LocationOfflineState {
  id: number;
  experiment_id: string;
  location_id: string;
  is_offline: number;
  created_at: string;
}

export const useOfflineDataRetrieval = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [offlineData, setOfflineData] = useState<OfflineExperimentData>({
    filters: [],
    experimentList: [],
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
      // Get all offline location states
      const offlineLocations: LocationOfflineState[] =
        await getAllOfflineLocationStates();

      if (offlineLocations.length === 0) {
        setIsLoadingOfflineData(false);
        return;
      }

      // Load filters data
      const filters = await getFiltersData();

      // Load experiment list data
      const experimentList = await getExperimentListData();

      // Get unique experiment IDs from offline locations
      const experimentIds = [
        ...new Set(offlineLocations.map(loc => loc.experiment_id)),
      ];

      // Load experiment details for each experiment
      const experimentDetails: {[key: string]: any} = {};
      const plotData: {[key: string]: any[]} = {};

      for (const experimentId of experimentIds) {
        try {
          // Load experiment details
          const details = await getExperimentDetailsData(experimentId);
          if (details) {
            experimentDetails[experimentId] = details;
          }

          // Load plot data
          const plots = await getPlotListData(experimentId);
          if (plots && plots.length > 0) {
            plotData[experimentId] = plots;
          }
        } catch (error) {
        }
      }

      // Update offline data state
      const newOfflineData: OfflineExperimentData = {
        filters: filters || [],
        experimentList: experimentList || [],
        experimentDetails,
        plotData,
      };

      setOfflineData(newOfflineData);
    } catch (error) {
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


      // Get the stored experiment list from offline data
      let experiments = offlineData.experimentList;

      if (!experiments || experiments.length === 0) {
        return {projects: {}, totalProjects: 0};
      }


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


    const filters = offlineData.filters;
    if (!filters || filters.length === 0) {
      return null;
    }

    // Return in the same format as online API
    const filtersResponse = {
      status_code: 200,
      filters: filters[0], // Assuming first item contains the filters structure
    };

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
