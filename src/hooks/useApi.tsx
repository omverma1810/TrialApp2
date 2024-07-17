import axios, {AxiosRequestConfig, Method} from 'axios';
import {useCallback, useMemo, useState} from 'react';

import {BASE_URL} from '../constants/URLS';
import {getTokens, getVerifiedToken} from '../utilities/token';
import useCleanUp from './useCleanUp';

type UseApiType = {
  url: string;
  method: Method;
  isSecureEntry?: boolean;
};

type ApiCallType = {
  payload?: any;
  headers?: Record<string, string>;
  pathParams?: string;
  queryParams?: string;
};

export const useApi = ({
  url,
  method,
  isSecureEntry = true,
}: UseApiType): [typeof apiCall, any, boolean, any] => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoutUser] = useCleanUp();

  const getUrl = useMemo(() => {
    return (pathParams = '', queryParams = '') => {
      const formattedPathParams = pathParams ? `/${pathParams}` : '';
      const formattedQueryParams = queryParams ? `?${queryParams}` : '';
      return `${BASE_URL}${url}${formattedPathParams}${formattedQueryParams}`;
    };
  }, [url]);

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
        const res = await axios(axiosConfig);

        console.log('API url:', url);
        if (payload) console.log('API payload:', payload);
        if (pathParams) console.log('API pathParams:', pathParams);
        if (queryParams) console.log('API queryParams:', queryParams);
        if (headers) console.log('API headers:', headers);
        console.log('API response:', res.data);

        setResponse(res.data);
      } catch (err: any) {
        console.log('API url:', url);
        if (payload) console.log('API payload:', payload);
        if (pathParams) console.log('API pathParams:', pathParams);
        if (queryParams) console.log('API queryParams:', queryParams);
        if (headers) console.log('API headers:', headers);
        console.log('API error:', err.response.message || err);

        setError(err.response ? err.response.data : err);
        if (err?.response?.data?.statusCode === 401) {
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
