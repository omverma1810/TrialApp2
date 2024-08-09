const BASE_URL = 'https://dev.piatrika.com/';

const API_CONFIG = {};

const URL = {
  LOGIN: 'auth/login/',
  REFRESH_TOKEN: 'auth/token/refresh',
  EXPERIMENT_LIST: 'app/experiment-list/',
  EXPERIMENT_DETAILS: 'app/experiment-details',
  PLOT_LIST: 'app/trial-location',
  RECORD_TRAITS: 'app/trait-data-record/',
  MULTI_TRIAL_LOCATION : 'app/multi-trial-location/',
  VISITS: 'upcoming_visits/',
  NOTES: 'notes/',
  PROFILE: 'auth/me/',
  LOGOUT: 'auth/logout/',
  DASH: 'app/userdashboard/',
  FIELDS: 'app/experiment-details/',
};

export {API_CONFIG, BASE_URL, URL};
