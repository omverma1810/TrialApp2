import Geolocation from '@react-native-community/geolocation';
import Toast from './toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

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
    console.error('Error fetching or converting to base64:', error);
    throw error;
  }
};

const getCoordinates = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve({latitude, longitude});
      },
      error => {
        Toast.error({message: error.message || 'Something went wrong!'});
        reject(error);
      },
    );
  });
};

export {formatDateTime, getNameFromUrl, getBase64FromUrl, getCoordinates};
