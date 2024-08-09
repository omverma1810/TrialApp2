const DEFAULT_ENV: string = 'DEVELOPMENT'; // DEVELOPMENT | STAGING

const DEVELOPMENT_BASE_URL = 'https://dev.piatrika.com/';
const STAGING_BASE_URL = 'https://stage.piatrika.com/';

const BASE_URL =
  DEFAULT_ENV === 'STAGING' ? STAGING_BASE_URL : DEVELOPMENT_BASE_URL;

const API_CONFIG = {};

const URL = {
  LOGIN: 'auth/login/',
  REFRESH_TOKEN: 'auth/token/refresh/',
  EXPERIMENT_LIST: 'app/experiment-list/',
  EXPERIMENT_DETAILS: 'app/experiment-details',
  PLOT_LIST: 'app/trial-location',
  RECORD_TRAITS: 'app/trait-data-record/',
  VISITS: 'upcoming_visits/',
  NOTES: 'notes/',
  PROFILE: 'auth/me/',
  LOGOUT: 'auth/logout/',
  DASH: 'app/userdashboard/',
  FIELDS: 'app/experiment-details/',
  CHANGE_PASSWORD: 'change-password/',
};

export {API_CONFIG, BASE_URL, URL, DEFAULT_ENV};
