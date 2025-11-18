import {db} from './db';

export interface RecentExperiment {
  id: number;
  experimentId: number;
  experimentName: string;
  fieldExperimentName: string;
  projectKey: string;
  cropName: string;
  season: string;
  year: string;
  experimentType: string;
  activityType: 'data_recorded' | 'visited' | 'viewed';
  lastActivityTimestamp: number;
  organizationURL?: string;
}

export interface ExperimentMetadata {
  experimentId: number;
  experimentName?: string;
  fieldExperimentName?: string;
  projectKey?: string;
  cropName: string;
  season: string;
  year: string;
  experimentType: string;
}

export class RecentExperimentsService {
  // Ensure the table has organizationURL column. Run once per app session.
  private static schemaEnsured = false;

  private static async ensureSchema() {
    if (this.schemaEnsured) return;
    await new Promise<void>(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          // Add column if it doesn't exist. SQLite lacks IF NOT EXISTS for columns, so try/catch pattern.
          // We attempt to add and ignore the error if it already exists.
          'ALTER TABLE recent_experiments ADD COLUMN organizationURL TEXT;',
          [],
          () => resolve(),
          () => {
            // Likely column already exists
            resolve();
            return false;
          },
        );
      });
    });
    this.schemaEnsured = true;
  }

  /**
   * Record a new activity for an experiment
   */
  static recordActivity(
    metadata: ExperimentMetadata,
    activityType: 'data_recorded' | 'visited' | 'viewed',
    organizationURL?: string | null,
  ): Promise<void> {
    if (!Number.isFinite(metadata.experimentId)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      RecentExperimentsService.ensureSchema().then(() => {
        const timestamp = Date.now();

        db.transaction(
          tx => {
            const org = organizationURL || '';

            // Manually ensure uniqueness across (experimentId, activityType, organizationURL)
            tx.executeSql(
              'DELETE FROM recent_experiments WHERE experimentId = ? AND activityType = ? AND IFNULL(organizationURL, "") = ?;',
              [metadata.experimentId, activityType, org],
            );

            const query = `
            INSERT INTO recent_experiments 
            (experimentId, experimentName, fieldExperimentName, projectKey, cropName, season, year, experimentType, activityType, lastActivityTimestamp, organizationURL)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            tx.executeSql(
              query,
              [
                metadata.experimentId,
                metadata.experimentName || '',
                metadata.fieldExperimentName || '',
                metadata.projectKey || '',
                metadata.cropName,
                metadata.season,
                metadata.year,
                metadata.experimentType,
                activityType,
                timestamp,
                org,
              ],
              () => {},
              (_, error) => {
                return false;
              },
            );
          },
          error => {
            reject(error);
          },
          () => {
            resolve();
          },
        );
      });
    });
  }

  /**
   * Get recent experiments (prioritizing data_recorded activities)
   */
  static getRecentExperiments(
    limit: number = 5,
    organizationURL?: string | null,
  ): Promise<RecentExperiment[]> {
    return new Promise((resolve, reject) => {
      // Ensure schema first, then run transaction
      RecentExperimentsService.ensureSchema()
        .then(() => {
          db.transaction(
            tx => {
              const query = `
            SELECT * FROM recent_experiments
            WHERE (activityType = 'data_recorded' OR activityType = 'visited')
              AND IFNULL(organizationURL, '') = ?
            ORDER BY 
              CASE 
                WHEN activityType = 'data_recorded' THEN 1 
                WHEN activityType = 'visited' THEN 2 
                ELSE 3 
              END,
              lastActivityTimestamp DESC
            LIMIT ?
          `;

              tx.executeSql(
                query,
                [organizationURL || '', limit],
                (_, result) => {
                  const experiments: RecentExperiment[] = [];
                  for (let i = 0; i < result.rows.length; i++) {
                    const item = result.rows.item(i);
                    experiments.push(item);
                  }
                  resolve(experiments);
                },
                (_, error) => {
                  reject(error);
                  return false;
                },
              );
            },
            error => {
              reject(error);
            },
          );
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get experiments that user has recorded data for
   */
  static getExperimentsWithDataRecorded(
    limit: number = 10,
  ): Promise<RecentExperiment[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const query = `
          SELECT * FROM recent_experiments
          WHERE activityType = 'data_recorded'
          ORDER BY lastActivityTimestamp DESC
          LIMIT ?
        `;

        tx.executeSql(
          query,
          [limit],
          (_, result) => {
            const experiments: RecentExperiment[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              experiments.push(result.rows.item(i));
            }
            resolve(experiments);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }

  /**
   * Clear old activities (keep only recent ones)
   */
  static cleanupOldActivities(keepDays: number = 30): Promise<void> {
    return new Promise((resolve, reject) => {
      const cutoffTimestamp = Date.now() - keepDays * 24 * 60 * 60 * 1000;

      db.transaction(
        tx => {
          tx.executeSql(
            'DELETE FROM recent_experiments WHERE lastActivityTimestamp < ?',
            [cutoffTimestamp],
            () => {},
            (_, error) => {
              return false;
            },
          );
        },
        error => reject(error),
        () => resolve(),
      );
    });
  }
}
