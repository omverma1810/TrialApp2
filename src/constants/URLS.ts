const BASE_URL = 'https://dev.piatrika.com/';

const API_CONFIG = {};

const URL = {
  LOGIN: 'auth/login/',
  REFRESH_TOKEN: 'auth/token/refresh',
  PROFILE: 'auth/me/',
  LOGOUT: 'auth/logout/',
  EXPERIMENT_LIST: 'app/experiment-list/',
  EXPERIMENT_DETAILS: 'app/experiment-details',
  PLOT_LIST: 'app/trial-location',
  VISITS : 'upcoming_visits/',
  NOTES : 'notes/'
};

export {URL, BASE_URL, API_CONFIG};