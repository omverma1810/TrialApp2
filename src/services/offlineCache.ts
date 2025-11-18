// src/services/offlineCache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useRef, useState} from 'react';
import {URL} from '../constants/URLS';
import {useApi} from '../hooks/useApi';
import {TOAST_EVENT_TYPES} from '../types/components/Toast';
import eventEmitter from '../utilities/eventEmitter';
import Toast from '../utilities/toast';
import {db} from './db';
import {saveOfflineLocationState} from './DbQueries';

export interface ExperimentParams {
  id: number; // fieldExperimentId
  cropId: number;
  experimentType: string;
}

const OFFLINE_KEY = 'offline_experiment_ids';

// Cache step enum to track the sequential flow
enum CacheStep {
  IDLE = 'IDLE',
  FETCHING_FILTERS = 'FETCHING_FILTERS',
  SAVING_FILTERS = 'SAVING_FILTERS',
  FETCHING_EXPERIMENT_LIST = 'FETCHING_EXPERIMENT_LIST',
  SAVING_EXPERIMENT_LIST = 'SAVING_EXPERIMENT_LIST',
  FETCHING_EXPERIMENT_DETAILS = 'FETCHING_EXPERIMENT_DETAILS',
  SAVING_EXPERIMENT_DETAILS = 'SAVING_EXPERIMENT_DETAILS',
  FETCHING_PLOTS = 'FETCHING_PLOTS',
  SAVING_PLOTS = 'SAVING_PLOTS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export async function savePayloads(
  url: string,
  rawUrl: string,
  pathParams: string,
  queryParams: string,
  payload: any,
  method: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        tx.executeSql(
          `INSERT into payload_sync(
            url, 
            rawUrl,
            rawPayload,
            
            method,
            createdAt
          ) VALUES(? , ? , ? , ? , ?);`,
          [
            url,
            rawUrl,
            JSON.stringify(payload),
            method,
            new Date().toISOString(),
          ],
          (tx: any, rows: any) => {
            Toast.success({message: 'Data Saved Locally until online'});
          },
          (tx: any, err: any) => {
            reject(err);
            return false;
          },
        );
      },
      (error: any) => {
        reject(error);
      },
      () => {
        // Only resolve in the transaction success callback
        resolve();
      },
    );
  });
}

export function useOfflineCache() {
  // API hooks
  const [getFilters, filtersResponse, filtersLoading, filtersError] = useApi<{
    filters: {
      Years: Array<{value: number; label: number}>;
      Crops: Array<{value: number; label: string}>;
      Seasons: Array<{value: string; label: string}>;
      Locations: Array<{value: number; label: string}>;
    };
    message: string;
    status_code: number;
  }>({
    url: URL.GET_FILTERS,
    method: 'GET',
  });

  const [getExperimentList, listResponse, listLoading, listError] = useApi<{
    projects: Record<string, any[]>;
    totalProjects: number;
  }>({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  const [getExperimentDetails, detailsResponse, detailsLoading, detailsError] =
    useApi<{
      data: any;
      message: string;
      status_code: number;
    }>({
      url: URL.EXPERIMENT_DETAILS,
      method: 'GET',
    });

  const [getPlotList, plotResponse, plotLoading, plotError] = useApi<{
    data: any;
    message: string;
    status_code: number;
  }>({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  // State management
  const [isCaching, setIsCaching] = useState(false);
  const [offlineIds, setOfflineIds] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<CacheStep>(CacheStep.IDLE);

  // Refs to store current caching context
  const currentExperimentRef = useRef<ExperimentParams | null>(null);
  const filtersDataRef = useRef<any>(null);
  const locationListRef = useRef<any[]>([]);
  const currentLocationIndexRef = useRef<number>(0);

  // Load persisted offline IDs
  useEffect(() => {
    AsyncStorage.getItem(OFFLINE_KEY).then(raw => {
      if (raw) {
        try {
          setOfflineIds(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  // Persist offline IDs
  useEffect(() => {
    AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(offlineIds)).catch(
      () => {},
    );
  }, [offlineIds]);

  // Database helper for async operations
  const executeDbTransaction = (
    queries: Array<{sql: string; params?: any[]}>,
  ) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        tx => {
          queries.forEach(({sql, params = []}) => {
            tx.executeSql(sql, params);
          });
        },
        error => {
          reject(error);
        },
        () => resolve(),
      );
    });
  };

  // Handle filters response
  useEffect(() => {
    if (
      currentStep === CacheStep.FETCHING_FILTERS &&
      filtersResponse &&
      !filtersLoading
    ) {
      setCurrentStep(CacheStep.SAVING_FILTERS);

      const filterPayload = filtersResponse?.filters;
      filtersDataRef.current = filterPayload;

      if (filterPayload) {
        const {
          Years = [],
          Crops = [],
          Seasons = [],
          Locations = [],
        } = filterPayload;


        // Save filters to database
        const filterQueries = [
          {sql: 'DELETE FROM filters_years;'},
          {sql: 'DELETE FROM filters_crops;'},
          {sql: 'DELETE FROM filters_seasons;'},
          {sql: 'DELETE FROM filters_locations;'},
          ...Years.map((y: any) => ({
            sql: 'INSERT INTO filters_years (value, label) VALUES (?,?);',
            params: [y.value, y.label],
          })),
          ...Crops.map((c: any) => ({
            sql: 'INSERT INTO filters_crops (value, label) VALUES (?,?);',
            params: [c.value, c.label],
          })),
          ...Seasons.map((s: any) => ({
            sql: 'INSERT INTO filters_seasons (value, label) VALUES (?,?);',
            params: [s.value, s.label],
          })),
          ...Locations.map((l: any) => ({
            sql: 'INSERT INTO filters_locations (value, label) VALUES (?,?);',
            params: [l.value, l.label],
          })),
        ];

        executeDbTransaction(filterQueries)
          .then(() => {
            setCurrentStep(CacheStep.FETCHING_EXPERIMENT_LIST);
          })
          .catch(error => {
            handleCacheError(`Failed to save filters: ${error.message}`);
          });
      } else {
        setCurrentStep(CacheStep.FETCHING_EXPERIMENT_LIST);
      }
    }
  }, [filtersResponse, filtersLoading, currentStep]);

  // Handle filters error
  useEffect(() => {
    if (
      currentStep === CacheStep.FETCHING_FILTERS &&
      filtersError &&
      !filtersLoading
    ) {
      handleCacheError(`Failed to fetch filters: ${filtersError.message}`);
    }
  }, [filtersError, filtersLoading, currentStep]);

  // Handle experiment list response
  useEffect(() => {
    if (
      currentStep === CacheStep.FETCHING_EXPERIMENT_LIST &&
      listResponse &&
      !listLoading
    ) {
      setCurrentStep(CacheStep.SAVING_EXPERIMENT_LIST);

      if (listResponse && listResponse.projects) {
        const projects = listResponse.projects;

        // Save experiment list to database
        const listQueries = [
          {sql: 'DELETE FROM experiment_list;'},
          ...Object.entries(projects).flatMap(([key, exps]) =>
            exps.map(expItem => ({
              sql: 'INSERT OR REPLACE INTO experiment_list (id, project, rawPayload) VALUES (?,?,?);',
              params: [expItem.id, key, JSON.stringify(expItem)],
            })),
          ),
        ];

        executeDbTransaction(listQueries)
          .then(() => {
            setCurrentStep(CacheStep.FETCHING_EXPERIMENT_DETAILS);
          })
          .catch(error => {
            handleCacheError(
              `Failed to save experiment list: ${error.message}`,
            );
          });
      } else {
        setCurrentStep(CacheStep.FETCHING_EXPERIMENT_DETAILS);
      }
    }
  }, [listResponse, listLoading, currentStep]);

  // Handle experiment list error (non-critical, continue to next step)
  useEffect(() => {
    if (
      currentStep === CacheStep.FETCHING_EXPERIMENT_LIST &&
      listError &&
      !listLoading
    ) {
      setCurrentStep(CacheStep.FETCHING_EXPERIMENT_DETAILS);
    }
  }, [listError, listLoading, currentStep]);

  // Handle experiment details response
  useEffect(() => {
    if (
      currentStep === CacheStep.FETCHING_EXPERIMENT_DETAILS &&
      detailsResponse &&
      !detailsLoading
    ) {
      setCurrentStep(CacheStep.SAVING_EXPERIMENT_DETAILS);

      if (detailsResponse && detailsResponse.data) {
        const detailsData = detailsResponse.data;
        locationListRef.current = detailsData.locationList || [];


        // Save experiment details
        executeDbTransaction([
          {
            sql: 'INSERT OR REPLACE INTO experiment_details (trialLocationId, rawPayload) VALUES (?,?);',
            params: [detailsData.id, JSON.stringify(detailsData)],
          },
        ])
          .then(() => {
            // Start fetching plots for locations
            currentLocationIndexRef.current = 0;
            if (locationListRef.current.length > 0) {
              setCurrentStep(CacheStep.FETCHING_PLOTS);
            } else {
              setCurrentStep(CacheStep.COMPLETED);
            }
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
      currentStep === CacheStep.FETCHING_EXPERIMENT_DETAILS &&
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
      currentStep === CacheStep.FETCHING_PLOTS &&
      plotResponse &&
      !plotLoading
    ) {
      const currentLocationIndex = currentLocationIndexRef.current;
      const currentLocation = locationListRef.current[currentLocationIndex];

      setCurrentStep(CacheStep.SAVING_PLOTS);

      if (plotResponse) {
        executeDbTransaction([
          {
            sql: 'INSERT OR REPLACE INTO plot_list (trialLocationId, rawPayload) VALUES (?,?);',
            params: [currentLocation.id, JSON.stringify(plotResponse)],
          },
        ])
          .then(() => {

            // Move to next location or complete
            currentLocationIndexRef.current++;
            if (
              currentLocationIndexRef.current < locationListRef.current.length
            ) {
              // Fetch next location's plots
              setCurrentStep(CacheStep.FETCHING_PLOTS);
            } else {
              // All locations processed
              setCurrentStep(CacheStep.COMPLETED);
            }
          })
          .catch(error => {
            // Continue to next location even if this one fails
            currentLocationIndexRef.current++;
            if (
              currentLocationIndexRef.current < locationListRef.current.length
            ) {
              setCurrentStep(CacheStep.FETCHING_PLOTS);
            } else {
              setCurrentStep(CacheStep.COMPLETED);
            }
          });
      } else {
        // Continue to next location
        currentLocationIndexRef.current++;
        if (currentLocationIndexRef.current < locationListRef.current.length) {
          setCurrentStep(CacheStep.FETCHING_PLOTS);
        } else {
          setCurrentStep(CacheStep.COMPLETED);
        }
      }
    }
  }, [plotResponse, plotLoading, currentStep]);

  // Handle plot list error
  useEffect(() => {
    if (currentStep === CacheStep.FETCHING_PLOTS && plotError && !plotLoading) {
      const currentLocationIndex = currentLocationIndexRef.current;
      const currentLocation = locationListRef.current[currentLocationIndex];

      // Continue to next location even if this one fails
      currentLocationIndexRef.current++;
      if (currentLocationIndexRef.current < locationListRef.current.length) {
        setCurrentStep(CacheStep.FETCHING_PLOTS);
      } else {
        setCurrentStep(CacheStep.COMPLETED);
      }
    }
  }, [plotError, plotLoading, currentStep]);

  // Handle step transitions that trigger API calls
  useEffect(() => {
    const experiment = currentExperimentRef.current;
    if (!experiment) {
      return;
    }

    switch (currentStep) {
      case CacheStep.FETCHING_EXPERIMENT_LIST:
        getExperimentList({
          payload: {
            cropId: experiment.cropId,
            filters: [
              {
                key: 'locations',
                value: filtersDataRef.current?.Locations || [],
              },
              {key: 'years', value: filtersDataRef.current?.Years || []},
              {key: 'seasons', value: filtersDataRef.current?.Seasons || []},
            ],
            page: 1,
            perPage: 10000,
            searchKeyword: '',
          },
        });
        break;

      case CacheStep.FETCHING_EXPERIMENT_DETAILS:
        getExperimentDetails({
          pathParams: `${experiment.id}`,
          queryParams: `experimentType=${experiment.experimentType}`,
        });
        break;

      case CacheStep.FETCHING_PLOTS:
        const currentLocationIndex = currentLocationIndexRef.current;
        const currentLocation = locationListRef.current[currentLocationIndex];
        if (currentLocation) {
          getPlotList({
            pathParams: `${currentLocation.id}`,
            queryParams: `experimentType=${experiment.experimentType}`,
          });
        }
        break;

      case CacheStep.COMPLETED:
        handleCacheSuccess();
        break;

      case CacheStep.ERROR:
        break;
    }
  }, [currentStep]);

  // Helper functions
  const handleCacheError = (errorMessage: string) => {
    const experiment = currentExperimentRef.current;
    setCurrentStep(CacheStep.ERROR);
    setIsCaching(false);

    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
      type: 'error',
      message: `Failed to cache experiment ${experiment?.id}: ${errorMessage}`,
    });
  };

  const handleCacheSuccess = async () => {
    const experiment = currentExperimentRef.current;
    if (!experiment) {
      return;
    }

    // ✅ CRITICAL FIX: Save offline location states to database
    // This is what offlineDataRetrieval.ts looks for on app restart!
    const locations = locationListRef.current || [];

    try {
      // Save each location to offline_locations table
      for (const location of locations) {
        await saveOfflineLocationState(
          experiment.id,           // experimentId
          location.id,             // locationId
          experiment.experimentType,
          experiment.cropId,
          true                     // isOffline = true
        );
      }

      console.log(`✅ Saved ${locations.length} locations to offline_locations table`);
    } catch (error) {
      console.error('❌ Failed to save offline location states:', error);
    }

    // Update offline IDs
    setOfflineIds(ids =>
      ids.includes(experiment.id) ? ids : [...ids, experiment.id],
    );

    setCurrentStep(CacheStep.IDLE);
    setIsCaching(false);

    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW_TOAST, {
      type: 'success',
      message: `Experiment ${experiment.id} cached successfully for offline use`,
    });

    // Clear refs
    currentExperimentRef.current = null;
    filtersDataRef.current = null;
    locationListRef.current = [];
    currentLocationIndexRef.current = 0;
  };

  // Delete offline data function (unchanged)
  const deleteOfflineData = useCallback(async (exp: ExperimentParams) => {
    try {
      // First get the experiment details to find all related locations
      const getDetailsQuery = new Promise<any[]>((resolve, reject) => {
        db.transaction(
          tx => {
            tx.executeSql(
              'SELECT rawPayload FROM experiment_details WHERE trialLocationId = ?;',
              [exp.id],
              (_, result) => {
                const rows = [];
                for (let i = 0; i < result.rows.length; i++) {
                  rows.push(result.rows.item(i));
                }
                resolve(rows);
              },
              (_, error) => {
                reject(error);
                return false;
              },
            );
          },
          error => reject(error),
        );
      });

      const detailsRows = await getDetailsQuery;
      const locationIds: number[] = [];

      // Extract location IDs from experiment details
      detailsRows.forEach(row => {
        try {
          const payload = JSON.parse(row.rawPayload);
          payload.locationList?.forEach((l: any) => {
            if (l.id) {
              locationIds.push(l.id);
            }
          });
        } catch (parseError) {
        }
      });

      // Delete all related data
      const deleteQueries = [
        {sql: 'DELETE FROM experiment_list WHERE id = ?;', params: [exp.id]},
        {
          sql: 'DELETE FROM experiment_details WHERE trialLocationId = ?;',
          params: [exp.id],
        },
        {
          sql: 'DELETE FROM offline_locations WHERE experimentId = ?;',
          params: [exp.id],
        },
        ...locationIds.map(locationId => ({
          sql: 'DELETE FROM plot_list WHERE trialLocationId = ?;',
          params: [locationId],
        })),
      ];

      await executeDbTransaction(deleteQueries);

      // Update offline IDs
      setOfflineIds(ids => ids.filter(id => id !== exp.id));

    } catch (error) {
      throw error;
    }
  }, []);

  // Main cacheAll function
  const cacheAll = useCallback(
    async (experiment: ExperimentParams) => {
      if (isCaching) {
        return;
      }


      // Set up caching state
      currentExperimentRef.current = experiment;
      setIsCaching(true);
      setCurrentStep(CacheStep.FETCHING_FILTERS);

      // Start the process by fetching filters
      getFilters();
    },
    [isCaching, getFilters],
  );

  return {cacheAll, deleteOfflineData, isCaching, offlineIds};
}
