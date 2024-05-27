import axios, {AxiosRequestConfig} from 'axios';
import jwt_decode, {JwtPayload} from 'jwt-decode';
import EncryptedStorage from 'react-native-encrypted-storage';

import {BASE_URL, URL, API_CONFIG} from '../constants/URLS';

type tokensType = {
  accessToken: string;
  refreshToken: string;
};

const setTokens = async (tokens: tokensType) => {
  try {
    await EncryptedStorage.setItem('API_TOKENS', JSON.stringify(tokens));
  } catch (error) {
    console.log('Error while setting tokens : ', error);
  }
};

const getTokens = async () => {
  try {
    const result = await EncryptedStorage.getItem('API_TOKENS');
    if (result) {
      const tokens = JSON.parse(result);
      return tokens;
    }
  } catch (error) {
    console.log('Error while getting tokens : ', error);
  }
};

const isTokenExpired = (token: string) => {
  const decoded: JwtPayload = jwt_decode(token);
  if (decoded?.exp) {
    return decoded.exp < Date.now() / 1000;
  } else return true;
};

const getAccessTokenUsingRefreshToken = async (refreshToken: string) => {
  const data = {
    refreshToken: refreshToken,
  };
  const axiosConfig: AxiosRequestConfig = {
    url: BASE_URL + URL.REFRESH_TOKEN,
    method: 'POST',
    data: data,
    headers: {
      Accept: '*/*',
      'Content-Type': 'multipart/form-data',
      'x-client-id': API_CONFIG.X_CLIENT_ID,
    },
  };
  try {
    const response = await axios(axiosConfig);
    return {
      accessToken: response?.data?.data?.accessToken,
      refreshToken: response?.data?.data?.refreshToken,
    };
  } catch (error) {
    console.log('Error while getting access token using refresh token', error);
  }
};

const getVerifiedToken = async (tokens: tokensType) => {
  if (tokens?.accessToken && tokens?.refreshToken) {
    if (!isTokenExpired(tokens?.accessToken)) {
      return tokens;
    } else {
      if (tokens?.refreshToken) {
        const newTokens = await getAccessTokenUsingRefreshToken(
          tokens?.refreshToken,
        );
        if (newTokens) {
          setTokens(newTokens);
          return newTokens;
        } else return null;
      } else {
        console.log('refreshToken expired, please login...');
        return null;
      }
    }
  } else {
    console.log('Tokens are not available, please login...');
    return null;
  }
};

export {getVerifiedToken, isTokenExpired, getTokens, setTokens};
