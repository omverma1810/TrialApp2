import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const LOCATION_DISABLED_ERROR_CODE = 'LOCATION_DISABLED';

const createLocationDisabledError = (message?: string) => {
  const error: any = new Error(
    message ||
      'Location services are disabled. Please enable them to continue.',
  );
  error.code = LOCATION_DISABLED_ERROR_CODE;
  return error;
};

const ensureLocationServicesEnabled = async () => {
  try {
    const enabled = await DeviceInfo.isLocationEnabled();

    if (enabled === false) {
      throw createLocationDisabledError();
    }
  } catch (error: any) {
    if (error?.code === LOCATION_DISABLED_ERROR_CODE) {
      throw error;
    }
    // Swallow errors from DeviceInfo check so we can fall back to geolocation attempt.
  }
};

const normalizeGeolocationError = (error: any) => {
  if (!error) {
    return new Error('Unable to determine location');
  }

  const message = String(error?.message || '').toLowerCase();

  if (
    error?.code === 2 &&
    (message.includes('disabled') ||
      message.includes('provider') ||
      message.includes('location provider') ||
      message.includes('location services'))
  ) {
    return createLocationDisabledError();
  }

  return error;
};

const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const getNameFromUrl = (url: string) => {
  let name = url.split('/').pop();
  if (name?.includes('?')) {
    name = name.split('?')[0];
  }
  return name;
};

const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('FileReader result is not a string'));
        }
      };

      reader.onerror = error => {
        reject(error);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
};

const getCoordinates = async (): Promise<Coordinates> => {
  await ensureLocationServicesEnabled();

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve({latitude, longitude});
      },
      error => {
        reject(normalizeGeolocationError(error));
      },
      {
        enableHighAccuracy: true, // Request high accuracy location
        timeout: 20000, // Increased timeout to 20 seconds for slower devices
        maximumAge: 10000, // Accept cached location up to 10 seconds old
      },
    );
  });
};

export {formatDateTime, getNameFromUrl, getBase64FromUrl, getCoordinates};
