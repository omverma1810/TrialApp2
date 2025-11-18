import axios, {AxiosRequestConfig, Method} from 'axios';
import {useCallback, useEffect, useMemo, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';
import {URL} from '../constants/URLS';
import {
  fetchOfflineExperimentDetails,
  fetchOfflineExperimentList,
  fetchOfflineFilters,
  fetchOfflinePlotList,
} from '../services/DbQueries';
import {savePayloads} from '../services/offlineCache';
import {useAppSelector} from '../store';
import Toast from '../utilities/toast';
import {getTokens, getVerifiedToken} from '../utilities/token';
import useCleanUp from './useCleanUp';

type UseApiType = {
  url: string;
  method: Method;
  isSecureEntry?: boolean;
  isConnected?: boolean | null;
};

type ApiCallType = {
  payload?: Record<string, unknown>;
  headers?: Record<string, string>;
  pathParams?: string;
  queryParams?: string;
};

type CacheableUrlEntry = {
  func: (...args: any[]) => Promise<any>;
  params?: boolean;
};

const CacheableURLs: {[key: string]: CacheableUrlEntry} = {};

CacheableURLs[URL.EXPERIMENT_LIST_FILTERED] = {
  func: fetchOfflineExperimentList,
  params: true,
};
CacheableURLs[URL.EXPERIMENT_DETAILS] = {
  func: fetchOfflineExperimentDetails,
  params: true,
};
CacheableURLs[URL.PLOT_LIST] = {func: fetchOfflinePlotList, params: true};
CacheableURLs[URL.GET_FILTERS] = {func: fetchOfflineFilters};

// URLs that should be queued for sync when offline (write operations)
const QueueableURLs = [
  URL.RECORD_TRAITS,
  URL.NOTES,
  URL.UPLOAD_IMAGE,
  // Add other write operations here as needed
];

export const useApi = ({
  url,
  method,
  isSecureEntry = true,
  isConnected: initialConnection,
}: UseApiType): [typeof apiCall, any, boolean, any] => {
  const {organizationURL} = useAppSelector(state => state.auth);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoutUser] = useCleanUp();
  const [isConnected, setIsConnected] = useState<boolean | null>(
    initialConnection ?? true,
  );
  let connectable = true;
  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsConnected(connected);
      connectable = connected;
    });

    // Listen for network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsConnected(connected);
      connectable = connected;
    });

    return () => unsubscribe();
  }, []);

  const getUrl = useMemo(() => {
    return (pathParams = '', queryParams = '') => {
      const formattedPathParams = pathParams ? `/${pathParams}/` : '';
      const formattedQueryParams = queryParams ? `?${queryParams}` : '';
      return `${organizationURL}${url}${formattedPathParams}${formattedQueryParams}`;
    };
  }, [url, organizationURL]);

  const defaultHeaders = useMemo(
    () => ({
      Accept: '*/*',
      'Content-Type': 'multipart/form-data',
    }),
    [],
  );

  const getAxiosConfig = useCallback(
    async ({
      payload,
      headers,
      pathParams = '',
      queryParams = '',
    }: ApiCallType = {}) => {
      const axiosConfig: AxiosRequestConfig = {
        url: getUrl(pathParams, queryParams),
        method,
      };

      if (payload) {
        axiosConfig.data = payload;
      }

      axiosConfig.headers = {...defaultHeaders};

      if (isSecureEntry) {
        const tokens = await getTokens();
        const newTokens = await getVerifiedToken(tokens);
        if (newTokens) {
          axiosConfig.headers = {
            ...axiosConfig.headers,
            Authorization: `Bearer ${newTokens?.accessToken}`,
          };
        } else {
          logoutUser();
        }
      }

      if (headers) {
        axiosConfig.headers = {...axiosConfig.headers, ...headers};
      }

      return axiosConfig;
    },
    [defaultHeaders, getUrl, isSecureEntry, logoutUser, method],
  );

  const apiCall = useCallback(
    async ({payload, headers, pathParams, queryParams}: ApiCallType = {}) => {
      setLoading(true);
      try {
        const axiosConfig = await getAxiosConfig({
          payload,
          headers,
          pathParams,
          queryParams,
        });
        let res: unknown;
        if (payload) {
        }
        if (pathParams) {
        }
        if (queryParams) {
        }
        if (headers) {
        }
        if (connectable === true) {
          res = await axios(axiosConfig);
          setResponse((res as any)?.data);
        } else if (!connectable && url in CacheableURLs) {
          let target = CacheableURLs[url];
          if (target?.params) {
            let data = await target.func(pathParams);
            res = {...data, status_code: 200};
          } else {
            let data = await target.func();
            res = {...data, status_code: 200};
          }
          setResponse(res as any);
        } else if (
          !connectable &&
          QueueableURLs.includes(url) &&
          (method === 'POST' || method === 'PUT' || method === 'PATCH')
        ) {
          // Queue write operations for later sync when offline

          try {
            await savePayloads(
              axiosConfig.url || '',
              url,
              pathParams || '',
              queryParams || '',
              payload || {},
              method,
            );

            // Return a successful response to simulate the API call worked
            const mockResponse = {
              status_code: 200,
              message: 'Data saved locally. Will sync when online.',
              queued: true,
            };

            setResponse(mockResponse as any);
          } catch (error) {
            throw new Error('Failed to save data offline');
          }
        } else if (!connectable) {
          // No offline support for this URL
          throw new Error(
            'No internet connection and this operation is not available offline.',
          );
        }

        // setResponse(res?.data);
      } catch (err: any) {
        const userMessage =
          err?.response?.data?.userErrorMessage ||
          err?.response?.data?.message ||
          'Something went wrong!';

        Toast.error({message: userMessage});
        setError(err?.response ? err.response.data : err);

        if (err?.response?.data?.status_code === 401) {
          logoutUser();
        }
      } finally {
        setLoading(false);
      }
    },
    [getAxiosConfig, logoutUser, url],
  );

  return [apiCall, response, loading, error];
};
