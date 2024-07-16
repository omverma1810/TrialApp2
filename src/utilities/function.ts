import RNFS from 'react-native-fs';

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

const getNameFromUrl = (url: string) => url.split('/').pop();

const getBase64FromUrl = async (filePath: string) => {
  try {
    const base64 = RNFS.readFile(filePath, 'base64');
    return base64;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

export {formatDateTime, getNameFromUrl, getBase64FromUrl};
