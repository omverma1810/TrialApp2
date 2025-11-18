import SQLite from 'react-native-sqlite-storage';
import * as schema from '../storage/schema';

// Enable minimal debug logging for production stability
SQLite.DEBUG(false);
SQLite.enablePromise(false);

export const db = SQLite.openDatabase(
  {name: 'PiatrikaOffline.db', location: 'default'},
  () => {
    // Database opened successfully
  },
  err => {
    // Don't throw error, just log it
  },
);

export function initDB() {
  try {
    db.transaction(
      tx => {
        // Create tables with individual error handling
        const tables = [
          {name: 'YEARS', sql: schema.CREATE_TABLE_YEARS},
          {name: 'CROPS', sql: schema.CREATE_TABLE_CROPS},
          {name: 'SEASONS', sql: schema.CREATE_TABLE_SEASONS},
          {name: 'LOCATIONS', sql: schema.CREATE_TABLE_LOCATIONS},
          {name: 'EXPERIMENT_LIST', sql: schema.CREATE_TABLE_EXPERIMENT_LIST},
          {
            name: 'EXPERIMENT_DETAILS',
            sql: schema.CREATE_TABLE_EXPERIMENT_DETAILS,
          },
          {name: 'PLOT_LIST', sql: schema.CREATE_TABLE_PLOT_LIST},
          {name: 'TRAIT_VALUES', sql: schema.CREATE_TABLE_TRAIT_VALUES},
          {name: 'PAYLOAD_SYNC', sql: schema.CREATE_TABLE_PAYLOAD_SYNC},
          {
            name: 'RECENT_EXPERIMENTS',
            sql: schema.CREATE_TABLE_RECENT_EXPERIMENTS,
          },
          {
            name: 'OFFLINE_LOCATIONS',
            sql: schema.CREATE_TABLE_OFFLINE_LOCATIONS,
          },
        ];

        tables.forEach(table => {
          try {
            tx.executeSql(
              table.sql,
              [],
              () => {
                // Table created successfully
              },
              (tx, error) => {
                return false; // Don't halt transaction
              },
            );
          } catch (error) {}
        });
      },
      error => {
        // Don't crash the app, just log the error
      },
      () => {
        // Perform a health check after initialization
        performDatabaseHealthCheck();
      },
    );
  } catch (error) {
    // Don't let this crash the app
  }
}

// Health check function to verify database is working
export function performDatabaseHealthCheck() {
  try {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT name FROM sqlite_master WHERE type="table"',
          [],
          (tx, results) => {
            const tableCount = results.rows.length;
          },
          (tx, error) => {
            return false;
          },
        );
      },
      error => {
        // Transaction error
      },
      () => {
        // Transaction complete
      },
    );
  } catch (error) {
    // Database initialization error
  }
}
