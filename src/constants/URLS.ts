const DEFAULT_ENV: string = 'STAGING'; // DEVELOPMENT | STAGING

const DEVELOPMENT_BASE_URL = 'https://dev.piatrika.com/';
const STAGING_BASE_URL = 'https://stage.piatrika.com/';

const BASE_URL =
  DEFAULT_ENV === 'STAGING' ? STAGING_BASE_URL : DEVELOPMENT_BASE_URL;

const API_CONFIG = {};

const URL = {
  ORGANIZATION_URL_VALIDATOR: 'app/url-validation/',
  LOGIN: 'auth/login/',
  REFRESH_TOKEN: 'auth/token/refresh/',
  EXPERIMENT_LIST: 'app/experiment-list/',
  EXPERIMENT_DETAILS: 'app/experiment-details',
  PLOT_LIST: 'app/trial-location',
  RECORD_TRAITS: 'app/trait-data-record/',
  MULTI_TRIAL_LOCATION: 'app/multi-trial-location/',
  VISITS: 'upcoming_visits/',
  NOTES: 'notes/',
  PROFILE: 'auth/me/',
  LOGOUT: 'auth/logout/',
  DASH: 'app/userdashboard/',
  CHANGE_PASSWORD: 'change-password/',
  DECODE_QR: 'decode-qr/',
};

export {API_CONFIG, BASE_URL, URL, DEFAULT_ENV};
