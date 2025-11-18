// src/services/locationOfflineCache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useRef, useState} from 'react';
import {URL} from '../constants/URLS';
import {useApi} from '../hooks/useApi';
import {TOAST_EVENT_TYPES} from '../types/components/Toast';
import eventEmitter from '../utilities/eventEmitter';
import Toast from '../utilities/toast';
import {
  saveOfflineLocationState,
  getOfflineLocationStates,
  getAllOfflineLocationIds,
  deleteOfflineLocationData,
  saveLocationExperimentDetails,
  saveLocationPlotList,
} from './DbQueries';

export interface LocationCacheParams {
  experimentId: number;
  locationId: number;
  experimentType: string;
  cropId: number;
}

// Location-specific cache step enum
enum LocationCacheStep {
  IDLE = 'IDLE',
  FETCHING_EXPERIMENT_DETAILS = 'FETCHING_EXPERIMENT_DETAILS',
  SAVING_EXPERIMENT_DETAILS = 'SAVING_EXPERIMENT_DETAILS',
  FETCHING_PLOTS = 'FETCHING_PLOTS',
  SAVING_PLOTS = 'SAVING_PLOTS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export function useLocationOfflineCache() {
  // API hooks
  const [getExperimentDetails, detailsResponse, detailsLoading, detailsError] =
    useApi({
      url: URL.EXPERIMENT_DETAILS,
      method: 'GET',
    });

  const [getPlotList, plotResponse, plotLoading, plotError] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  // State management
  const [isCaching, setIsCaching] = useState(false);
  const [offlineLocationStates, setOfflineLocationStates] = useState<{
    [experimentId: number]: {[locationId: number]: boolean};
  }>({});
  const [currentStep, setCurrentStep] = useState<LocationCacheStep>(
    LocationCacheStep.IDLE,
  );

  // Refs to store current caching context
  const currentLocationRef = useRef<LocationCacheParams | null>(null);

  // Load persisted offline location states
  const loadOfflineStates = useCallback(async (experimentId: number) => {
    try {
      const states = await getOfflineLocationStates(experimentId);
      setOfflineLocationStates(prev => ({
        ...prev,
        [experimentId]: states,
      }));
      return states;
    } catch (error) {
      return {};
    }
  }, []);

  // Handle experiment details response
  useEffect(() => {
    if (
      currentStep === LocationCacheStep.FETCHING_EXPERIMENT_DETAILS &&
      detailsResponse &&
      !detailsLoading
    ) {
      setCurrentStep(LocationCacheStep.SAVING_EXPERIMENT_DETAILS);

      const location = currentLocationRef.current;
      if (detailsResponse && detailsResponse.data && location) {
        const detailsData = detailsResponse.data;


        // 🔍 ENHANCED DEBUG: Log the full experiment details structure

        // Save experiment details - we'll use the experiment ID as the key
        saveLocationExperimentDetails(location.experimentId, detailsData)
          .then(() => {
            setCurrentStep(LocationCacheStep.FETCHING_PLOTS);
          })
          .catch(error => {
            handleCacheError(
              `Failed to save experiment details: ${error.message}`,
            );
          });
      } else {
        handleCacheError('Experiment details returned no data');
      }
    }
  }, [detailsResponse, detailsLoading, currentStep]);

  // Handle experiment details error
  useEffect(() => {
    if (
      currentStep === LocationCacheStep.FETCHING_EXPERIMENT_DETAILS &&
      detailsError &&
      !detailsLoading
    ) {
      handleCacheError(
        `Failed to fetch experiment details: ${detailsError.message}`,
      );
    }
  }, [detailsError, detailsLoading, currentStep]);

  // Handle plot list response
  useEffect(() => {
    if (
      currentStep === LocationCacheStep.FETCHING_PLOTS &&
      plotResponse &&
      !plotLoading
    ) {
      const location = currentLocationRef.current;

      setCurrentStep(LocationCacheStep.SAVING_PLOTS);

      if (plotResponse && location) {
        // 🔍 ENHANCED DEBUG: Log the complete plot response structure

        // Show key properties
        if (plotResponse.data) {

          // Show first plot if available
          const plots =
            plotResponse.data.plotDetails || plotResponse.data.plots;
          if (plots && plots.length > 0) {
          }
        }

        saveLocationPlotList(location.locationId, plotResponse)
          .then(() => {
            setCurrentStep(LocationCacheStep.COMPLETED);
          })
          .catch(error => {
            handleCacheError(`Failed to save plots: ${error.message}`);
          });
      } else {
        setCurrentStep(LocationCacheStep.COMPLETED);
      }
    }
  }, [plotResponse, plotLoading, currentStep]);

  // Handle plot list error
  useEffect(() => {
    if (
      currentStep === LocationCacheStep.FETCHING_PLOTS &&
      plotError &&
      !plotLoading
    ) {
      const location = currentLocationRef.current;
      // Consider this non-critical and complete the process
      setCurrentStep(LocationCacheStep.COMPLETED);
    }
  }, [plotError, plotLoading, currentStep]);

  // Handle step transitions that trigger API calls
  useEffect(() => {
    const location = currentLocationRef.current;
    if (!location) {
      return;
    }

    switch (currentStep) {
      case LocationCacheStep.FETCHING_EXPERIMENT_DETAILS:
        getExperimentDetails({
          pathParams: `${location.experimentId}`,
          queryParams: `experimentType=${location.experimentType}`,
        });
        break;

      case LocationCacheStep.FETCHING_PLOTS:
        getPlotList({
          pathParams: `${location.locationId}`,
          queryParams: `experimentType=${location.experimentType}`,
        });
        break;

      case LocationCacheStep.COMPLETED:
        handleCacheSuccess();
        break;

      case LocationCacheStep.ERROR:
        break;
    }
  }, [currentStep]);

  // Helper functions
  const handleCacheError = (errorMessage: string) => {
    const location = currentLocationRef.current;
    setCurrentStep(LocationCacheStep.ERROR);
    setIsCaching(false);

    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
      type: 'error',
      message: `Failed to cache location ${location?.locationId}: ${errorMessage}`,
    });
  };

  const handleCacheSuccess = async () => {
    const location = currentLocationRef.current;
    if (!location) {
      return;
    }

    try {
      // Update offline location state
      await saveOfflineLocationState(
        location.experimentId,
        location.locationId,
        location.experimentType,
        location.cropId,
        true,
      );

      // Update local state
      setOfflineLocationStates(prev => ({
        ...prev,
        [location.experimentId]: {
          ...prev[location.experimentId],
          [location.locationId]: true,
        },
      }));


      setCurrentStep(LocationCacheStep.IDLE);
      setIsCaching(false);

      eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
        type: 'success',
        message: `Location cached successfully for offline use`,
      });

      // Clear refs
      currentLocationRef.current = null;
    } catch (error) {
      handleCacheError(
        `Failed to save offline state: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  // Main cacheLocation function
  const cacheLocation = useCallback(
    async (locationParams: LocationCacheParams) => {
      if (isCaching) {
        return;
      }


      // Set up caching state
      currentLocationRef.current = locationParams;
      setIsCaching(true);
      setCurrentStep(LocationCacheStep.FETCHING_EXPERIMENT_DETAILS);
    },
    [isCaching],
  );

  // Delete offline location data function
  const deleteOfflineLocation = useCallback(
    async (locationParams: LocationCacheParams) => {
      try {
        await deleteOfflineLocationData(
          locationParams.experimentId,
          locationParams.locationId,
        );

        // Update offline location state
        await saveOfflineLocationState(
          locationParams.experimentId,
          locationParams.locationId,
          locationParams.experimentType,
          locationParams.cropId,
          false,
        );

        // Update local state
        setOfflineLocationStates(prev => ({
          ...prev,
          [locationParams.experimentId]: {
            ...prev[locationParams.experimentId],
            [locationParams.locationId]: false,
          },
        }));


        eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
          type: 'success',
          message: 'Location data removed from offline storage',
        });
      } catch (error) {

        eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
          type: 'error',
          message: `Failed to remove location data: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });

        throw error;
      }
    },
    [],
  );

  // Toggle location offline state
  const toggleLocationOffline = useCallback(
    async (locationParams: LocationCacheParams) => {
      const currentStates =
        offlineLocationStates[locationParams.experimentId] || {};
      const isCurrentlyOffline =
        currentStates[locationParams.locationId] || false;

      if (isCurrentlyOffline) {
        // Remove from offline
        await deleteOfflineLocation(locationParams);
      } else {
        // Add to offline
        await cacheLocation(locationParams);
      }
    },
    [offlineLocationStates, cacheLocation, deleteOfflineLocation],
  );

  // Get offline state for specific location
  const isLocationOffline = useCallback(
    (experimentId: number, locationId: number): boolean => {
      return offlineLocationStates[experimentId]?.[locationId] || false;
    },
    [offlineLocationStates],
  );

  // Get all offline locations for an experiment
  const getExperimentOfflineLocations = useCallback(
    (experimentId: number): number[] => {
      const states = offlineLocationStates[experimentId] || {};
      return Object.entries(states)
        .filter(([_, isOffline]) => isOffline)
        .map(([locationId, _]) => parseInt(locationId));
    },
    [offlineLocationStates],
  );

  return {
    cacheLocation,
    deleteOfflineLocation,
    toggleLocationOffline,
    loadOfflineStates,
    isLocationOffline,
    getExperimentOfflineLocations,
    isCaching,
    offlineLocationStates,
  };
}
