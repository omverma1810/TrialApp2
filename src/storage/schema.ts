// 1) Filters
export const CREATE_TABLE_YEARS = `
CREATE TABLE IF NOT EXISTS filters_years (
  value INTEGER PRIMARY KEY,
  label TEXT
);`;

export const CREATE_TABLE_CROPS = `
CREATE TABLE IF NOT EXISTS filters_crops (
  value INTEGER PRIMARY KEY,
  label TEXT
);`;

export const CREATE_TABLE_SEASONS = `
CREATE TABLE IF NOT EXISTS filters_seasons (
  value TEXT PRIMARY KEY,
  label TEXT
);`;

export const CREATE_TABLE_LOCATIONS = `
CREATE TABLE IF NOT EXISTS filters_locations (
  value INTEGER PRIMARY KEY,
  label TEXT
);`;

// 2) Experiment List (from EXPERIMENT_LIST_FILTERED)
export const CREATE_TABLE_EXPERIMENT_LIST = `
CREATE TABLE IF NOT EXISTS experiment_list (
  id INTEGER PRIMARY KEY,
  project TEXT,
  rawPayload TEXT  -- full JSON for that experiment
);`;

// 3) Experiment Details (from EXPERIMENT_DETAILS)
export const CREATE_TABLE_EXPERIMENT_DETAILS = `
CREATE TABLE IF NOT EXISTS experiment_details (
  trialLocationId INTEGER PRIMARY KEY,
  rawPayload TEXT  -- full JSON
);`;

// 4) Plot List + Trait Meta (from PLOT_LIST)
export const CREATE_TABLE_PLOT_LIST = `
CREATE TABLE IF NOT EXISTS plot_list (
  trialLocationId INTEGER PRIMARY KEY,
  rawPayload TEXT  -- full JSON
);`;

// 5) User-entered trait values
export const CREATE_TABLE_TRAIT_VALUES = `
CREATE TABLE IF NOT EXISTS trait_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trialLocationId INTEGER,
  plotId INTEGER,
  traitId INTEGER,
  value TEXT,
  timestamp INTEGER,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY(trialLocationId) REFERENCES experiment_details(trialLocationId)
);`;

export const CREATE_TABLE_PAYLOAD_SYNC = `
CREATE TABLE IF NOT EXISTS payload_sync (
id INTEGER PRIMARY KEY AUTOINCREMENT,
rawPayload TEXT,
url varchar(500),
rawUrl varchar(250),
pathParams varchar(100),
queryParams varchar(100),
method varchar(50),
createdAt TEXT --apparently sqlite is dumb
);
`;

// 6) Recent Experiments Activity Tracking
export const CREATE_TABLE_RECENT_EXPERIMENTS = `
CREATE TABLE IF NOT EXISTS recent_experiments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experimentId INTEGER,
  experimentName TEXT,
  fieldExperimentName TEXT,
  projectKey TEXT,
  cropName TEXT,
  season TEXT,
  year TEXT,
  experimentType TEXT,
  activityType TEXT, -- 'data_recorded', 'visited', 'viewed'
  lastActivityTimestamp INTEGER,
  UNIQUE(experimentId, activityType) ON CONFLICT REPLACE
);`;

// 7) Location-specific offline cache tracking
export const CREATE_TABLE_OFFLINE_LOCATIONS = `
CREATE TABLE IF NOT EXISTS offline_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experimentId INTEGER,
  locationId INTEGER,
  experimentType TEXT,
  cropId INTEGER,
  isOffline INTEGER DEFAULT 0,
  lastCachedAt INTEGER,
  UNIQUE(experimentId, locationId) ON CONFLICT REPLACE
);`;
