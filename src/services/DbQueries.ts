import axios from 'axios';
import {getTokens, getVerifiedToken} from '../utilities/token';
import {db} from './db';

export async function syncPayloads() {
  let shouldSync = true;
  // while(shouldSync){
  let queueLength = await countSavedPayloads();

  if (queueLength === 0) {
    shouldSync = false;
  }
  let sync = await fetchSyncPayloads();

  let {id, rawPayload, url, rawUrl, method, createdDate} = sync;
  // const { postPayload, postResponse, isLoading } = useApi({
  //   url: rawUrl,
  //   method,
  // });
  let headers: any = {
    'Content-Type': 'application/json',
  };
  const tokens = await getTokens();
  const newTokens = await getVerifiedToken(tokens);
  if (newTokens) {
    headers = {
      ...headers,
      Authorization: `Bearer ${newTokens?.accessToken}`,
    };
  }
  let response = await axios({url, method, headers, data: rawPayload});
  if ([200, 201].includes(response.status)) {
    await deletePayloads(id);
  }
}

// }
export async function countSavedPayloads() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'select count(*) as sync_count from payload_sync ;',
        [],
        (_, {rows}) => {
          try {
            if (!rows.length) {
              resolve(null);
            }
            resolve(rows.item(0)?.sync_count);
          } catch {
            /* skip bad JSON */
          }
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}
export async function fetchSyncPayloads() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `select id, rawPayload,  url, rawUrl, method , STRFTIME('%d/%m/%Y, %H:%M', createdAt)
  AS createdDate from payload_sync order by createdDate desc limit 1;`,
        [],
        (_, {rows}) => {
          try {
            // if (!rows.length) {
            //   resolve(null);
            // }
            let {
              id,
              rawPayload,
              pathParams,
              queryParams,
              url,
              rawUrl,
              method,
              createdDate,
            } = rows.item(0);
            resolve({
              id,
              rawPayload: JSON.parse(rawPayload),
              pathParams,
              queryParams,
              url,
              rawUrl,
              method,
            });
          } catch {
            /* skip bad JSON */
          }
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export async function deletePayloads(id: Number) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'delete from payload_sync where id = ?;',
        [id],
        (_, {rows}) => {
          resolve(null);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}
/** Read the list of experiments for a particular projectKey from SQLite */
export function fetchOfflineExperimentList(projectKey: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // if (projectKey) {
      //   query += ' WHERE project = ?';
      // }
      tx.executeSql(
        'SELECT rawPayload FROM experiment_list;',
        [],
        (_, {rows}) => {
          const result = {
            projects: {},
            totalProjects: rows.length,
          };

          for (let i = 0; i < rows.length; i++) {
            try {
              let rawPayload = JSON.parse(rows.item(i).rawPayload);
              if (rawPayload?.experimentName) {
                result.projects[rawPayload?.experimentName] = [rawPayload];
              }
            } catch {
              /* skip bad JSON */
            }
          }
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}
export function fetchOfflinePlotList(trailLocationId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rawPayload FROM plot_list WHERE trialLocationId = ?;',
        [trailLocationId],
        (_, {rows}) => {
          let details = {};

          for (let i = 0; i < rows.length; i++) {
            try {
              details = JSON.parse(rows.item(i).rawPayload);
              // if (arr[0]) {
              //   details = {
              //     cropName: arr[0].cropName,
              //     fieldExperimentId: arr[0].fieldExperimentId,
              //     fieldExperimentName: arr[0].fieldExperimentName,
              //     maxNoOfImages: arr[0].maxNoOfImages,
              //     villageName: arr[0].villageName,
              //     trialLocationId: arr[0].trialLocationId,
              //     name: arr[0].name,
              //     fieldLabel: arr[0].fieldLabel,
              //   };
              // }
            } catch {
              /* skip bad JSON */
            }
          }
          resolve(details);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}
export function fetchOfflineExperimentDetails(
  trailLocationId: string,
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rawPayload FROM experiment_details WHERE trialLocationId = ?;',
        [trailLocationId],
        (_, {rows}) => {
          let data = {};

          for (let i = 0; i < rows.length; i++) {
            try {
              data = {data: JSON.parse(rows.item(i).rawPayload)};
            } catch {
              /* skip bad JSON */
            }
          }
          resolve(data);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}
export function fetchOfflineFilters(): Promise<{
  years: any[];
  crops: any[];
  Locations: any[];
  Seasons: any[];
}> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const result: {
        filters: {Years: any[]; Crops: any[]; Locations: any[]; Seasons: any[]};
      } = {
        filters: {
          Years: [],
          Crops: [],
          Locations: [],
          Seasons: [],
        },
      };
      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 4) {
          resolve(result);
        }
      };

      tx.executeSql(
        'SELECT value,label FROM filters_years;',
        [],
        (_, {rows}) => {
          for (let i = 0; i < rows.length; i++) {
            result.filters.Years.push({
              value: rows.item(i)?.value,
              label: rows.item(i)?.label,
            });
          }
          checkDone();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );

      tx.executeSql(
        'SELECT value,label FROM filters_crops;',
        [],
        (_, {rows}) => {
          for (let i = 0; i < rows.length; i++) {
            result.filters.Crops.push({
              value: rows.item(i)?.value,
              label: rows.item(i)?.label,
            });
          }
          checkDone();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );

      tx.executeSql(
        'SELECT value,label FROM filters_locations;',
        [],
        (_, {rows}) => {
          for (let i = 0; i < rows.length; i++) {
            result.filters.Locations.push({
              value: rows.item(i)?.value,
              label: rows.item(i)?.label,
            });
          }
          checkDone();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );

      tx.executeSql(
        'SELECT value,label FROM filters_seasons;',
        [],
        (_, {rows}) => {
          for (let i = 0; i < rows.length; i++) {
            result.filters.Seasons.push({
              value: rows.item(i)?.value,
              label: rows.item(i)?.label,
            });
          }
          checkDone();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

// Location-specific offline cache functions
export function saveOfflineLocationState(
  experimentId: number,
  locationId: number,
  experimentType: string,
  cropId: number,
  isOffline: boolean,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO offline_locations 
         (experimentId, locationId, experimentType, cropId, isOffline, lastCachedAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          experimentId,
          locationId,
          experimentType,
          cropId,
          isOffline ? 1 : 0,
          Date.now(),
        ],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export function getOfflineLocationStates(
  experimentId: number,
): Promise<{[locationId: number]: boolean}> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT locationId, isOffline FROM offline_locations WHERE experimentId = ?',
        [experimentId],
        (_, {rows}) => {
          const result: {[locationId: number]: boolean} = {};
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            result[row.locationId] = row.isOffline === 1;
          }
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

// ✅ Get all offline location IDs with correct camelCase column names
export function getAllOfflineLocationIds(): Promise<
  {
    experimentId: number;
    locationId: number;
    experimentType: string;
    cropId: number;
  }[]
> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT experimentId, locationId, experimentType, cropId FROM offline_locations WHERE isOffline = 1',
        [],
        (_, {rows}) => {
          const result = [];
          for (let i = 0; i < rows.length; i++) {
            result.push(rows.item(i));
          }
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export function deleteOfflineLocationData(
  experimentId: number,
  locationId: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Delete from all related tables
      const queries = [
        {
          sql: 'DELETE FROM offline_locations WHERE experimentId = ? AND locationId = ?',
          params: [experimentId, locationId],
        },
        {
          sql: 'DELETE FROM plot_list WHERE trialLocationId = ?',
          params: [locationId],
        },
        // Keep experiment_details as it might be shared across locations
      ];

      let completed = 0;
      const totalQueries = queries.length;

      queries.forEach(({sql, params}) => {
        tx.executeSql(
          sql,
          params,
          () => {
            completed++;
            if (completed === totalQueries) {
              resolve();
            }
          },
          (_, err) => {
            reject(err);
            return false;
          },
        );
      });
    });
  });
}

export function saveLocationExperimentDetails(
  locationId: number,
  experimentDetails: any,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO experiment_details (trialLocationId, rawPayload) VALUES (?, ?)',
        [locationId, JSON.stringify(experimentDetails)],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export function saveLocationPlotList(
  locationId: number,
  plotData: any,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO plot_list (trialLocationId, rawPayload) VALUES (?, ?)',
        [locationId, JSON.stringify(plotData)],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

// 🔍 DEBUG FUNCTIONS - For database verification
export function debugDatabaseContents(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {

      // Check all tables and their row counts
      const tables = [
        'filters_years',
        'filters_crops',
        'filters_seasons',
        'filters_locations',
        'experiment_list',
        'experiment_details',
        'plot_list',
        'trait_values',
        'payload_sync',
        'recent_experiments',
        'offline_locations',
      ];

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === tables.length) {
          resolve();
        }
      };

      tables.forEach(tableName => {
        tx.executeSql(
          `SELECT COUNT(*) as count FROM ${tableName}`,
          [],
          (_, result) => {
            const count = result.rows.item(0).count;
            checkDone();
          },
          (_, error) => {
            checkDone();
            return false;
          },
        );
      });
    });
  });
}

export function debugOfflineLocations(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM offline_locations',
        [],
        (_, {rows}) => {

          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
          }
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export function debugPlotData(locationId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rawPayload FROM plot_list WHERE trialLocationId = ?',
        [locationId],
        (_, {rows}) => {

          if (rows.length === 0) {
          } else {
            for (let i = 0; i < rows.length; i++) {
              try {
                const plotData = JSON.parse(rows.item(i).rawPayload);

                // 🔍 First, let's see the actual structure

                // The correct structure should be plotData.data (the actual data from API)
                const actualData = plotData.data;

                if (actualData) {

                  // The correct property is "plotData" according to the logs
                  if (actualData.plotData) {

                    // Show sample plot if it's an array
                    if (
                      Array.isArray(actualData.plotData) &&
                      actualData.plotData.length > 0
                    ) {
                    }
                  }

                  // Check for trait data in the plotData structure
                  if (
                    actualData.plotData &&
                    typeof actualData.plotData === 'object'
                  ) {
                  }
                }


                // Show first few plots as sample - try different paths
                const plotDetails =
                  plotData.data?.plotDetails ||
                  plotData.plotDetails ||
                  plotData.data?.plots ||
                  plotData.plots;

                if (plotDetails && plotDetails.length > 0) {
                }
              } catch (error) {
              }
            }
          }
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

export function debugExperimentDetails(experimentId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rawPayload FROM experiment_details WHERE trialLocationId = ?',
        [experimentId],
        (_, {rows}) => {

          if (rows.length === 0) {
          } else {
            for (let i = 0; i < rows.length; i++) {
              try {
                const expData = JSON.parse(rows.item(i).rawPayload);

                // Show location details
                if (expData.locationList?.length > 0) {
                  expData.locationList.forEach((loc: any, idx: number) => {
                  });
                }
              } catch (error) {
              }
            }
          }
          resolve();
        },
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
}

// ❌ REMOVED: Broken offline data retrieval functions (getFiltersData, getExperimentListData, etc.)
// These functions used incorrect table/column names and have been replaced with the working
// fetchOffline* functions above (fetchOfflineFilters, fetchOfflineExperimentList, etc.)
// The offlineDataRetrieval.ts hook now uses the correct functions.
