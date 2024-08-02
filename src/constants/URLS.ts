const BASE_URL = 'https://stage.piatrika.com/';

const API_CONFIG = {};

const URL = {
  LOGIN: 'auth/login/',
  REFRESH_TOKEN: 'auth/token/refresh',
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

export {API_CONFIG, BASE_URL, URL};
