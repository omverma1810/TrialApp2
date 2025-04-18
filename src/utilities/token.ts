import axios, {AxiosRequestConfig} from 'axios';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import EncryptedStorage from 'react-native-encrypted-storage';
import {decode} from 'base-64';

import {BASE_URL, URL} from '../constants/URLS';

global.atob = decode;

type TokensType = {
  accessToken: string;
  refreshToken: string;
};

const TOKEN_STORAGE_KEY = 'API_TOKENS';

const setTokens = async (tokens: TokensType): Promise<void> => {
  try {
    await EncryptedStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.log('Error while setting tokens:', error);
  }
};

const getTokens = async (): Promise<TokensType | null> => {
  try {
    const result = await EncryptedStorage.getItem(TOKEN_STORAGE_KEY);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.log('Error while getting tokens:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded?.exp ? decoded.exp < Date.now() / 1000 : true;
  } catch (error) {
    console.log('Error while decoding token:', error);
    return true;
  }
};

const getNewAccessToken = async (
  tokens: TokensType,
): Promise<TokensType | null> => {
  const data = {
    refresh_token: tokens.refreshToken,
  };
  const axiosConfig: AxiosRequestConfig = {
    url: `${BASE_URL}${URL.REFRESH_TOKEN}`,
    method: 'POST',
    data,
  };

  try {
    const response = await axios(axiosConfig);
    const {access_token, refresh_token} = response?.data?.data;
    return access_token && refresh_token
      ? {accessToken: access_token, refreshToken: refresh_token}
      : null;
  } catch (error) {
    console.log('Error while getting access token:', error);
    return null;
  }
};

const getVerifiedToken = async (
  tokens: TokensType | null,
): Promise<TokensType | null> => {
  if (!tokens || !tokens?.accessToken) {
    console.log('Tokens are not available, please login.');
    return null;
  }

  if (!isTokenExpired(tokens.accessToken)) {
    return tokens;
  }

  const newTokens = await getNewAccessToken(tokens);
  if (newTokens) {
    await setTokens(newTokens);
    return newTokens;
  } else {
    console.log('Refresh token expired, please login.');
    return null;
  }
};

export {getVerifiedToken, isTokenExpired, getTokens, setTokens};
