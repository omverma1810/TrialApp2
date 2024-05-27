import axios, {AxiosRequestConfig, Method} from 'axios';
import {useCallback, useMemo, useState} from 'react';

import {API_CONFIG, BASE_URL} from '../constants/URLS';
import {getTokens, getVerifiedToken} from '../utilities/token';
import useCleanUp from './useCleanUp';

type useApiType = {
  url: string;
  method: Method;
  isSecureEntry?: boolean;
};

type ApiCallType = {
  payload?: {};
  headers?: {};
  params?: string;
};

export const useApi = ({
  url,
  method,
  isSecureEntry = true,
}: useApiType): [typeof apiCall, any, any, boolean] => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoutUser] = useCleanUp();

  const getUrl = useCallback((params: string) => {
    return params ? `${BASE_URL}${url}?${params}` : `${BASE_URL}${url}`;
  }, []);

  const defaultHeaders = useMemo(() => {
    return {
      Accept: '*/*',
      'Content-Type': 'multipart/form-data',
      'x-client-id': API_CONFIG.X_CLIENT_ID,
    };
  }, []);

  const getAxiosConfig = useCallback(
    async ({payload, headers, params = ''}: ApiCallType = {}) => {
      const axiosConfig: AxiosRequestConfig = {
        url: getUrl(params),
        method,
      };

      if (payload) {
        axiosConfig.data = payload;
      }

      axiosConfig.headers = defaultHeaders;

      if (isSecureEntry) {
        const tokens = await getTokens();
        const newTokens = await getVerifiedToken(tokens);
        if (newTokens) {
          axiosConfig.headers = {
            ...axiosConfig.headers,
            'x-auth-token': newTokens?.accessToken,
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
    [method, url, isSecureEntry],
  );

  const apiCall = useCallback(
    async ({payload, headers, params}: ApiCallType = {}) => {
      setLoading(true);
      axios(await getAxiosConfig({payload, params, headers}))
        .then(res => {
          console.log('API url : ', url);
          payload && console.log('API payload : ', payload);
          params && console.log('API params : ', params);
          headers && console.log('API headers : ', headers);
          console.log('API response', res.data);
          setResponse(res.data);
        })
        .catch(err => {
          console.log('API url : ', url);
          payload && console.log('API payload : ', payload);
          params && console.log('API params : ', params);
          headers && console.log('API headers : ', headers);
          console.log('API error : ', err.response || err);
          setError(err.response.data);
          if (err?.response?.data?.statusCode === 401) {
            logoutUser();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [],
  );

  return [apiCall, response, error, loading];
};
