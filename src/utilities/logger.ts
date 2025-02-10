/*

1. Requred third party libraries
- npm i react-native-device-info
- npm i react-native-fs


2. AndroidManifest.xml file changes
  - Add permissions 
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
 
  - Add properties in <application   
    android:requestLegacyExternalStorage="true"

*/

import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const log = console.log;
const fileName = 'log.txt';
const fileEncoding = 'utf8';
const UPLOAD_FILE_URL =
  'https://7m424fut04.execute-api.ap-south-1.amazonaws.com/staging/file/getUploadUrl';

const getDateString = () => {
  return new Date().toLocaleString();
};

const requestStoragePermission = async () => {
  if (Platform.OS === 'ios') return true;
  const apiLevel = await DeviceInfo.getApiLevel();
  if (Platform.OS === 'android' && apiLevel >= 33) return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your storage',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // log('Storage permission granted');
      return true;
    } else {
      // log('Storage permission denied');
      return false;
    }
  } catch (error) {
    log('Error requesting storage permission:', error);
    return false;
  }
};

const getFileUrl = async () => {
  const data = {
    fileName,
    fileModule: 'IOS_LOGS',
  };
  const requestData = {
    method: 'POST',
    headers: {
      'x-recaptcha-token':
        'hOQwWNu2ZyDwCxM6b3JeQqQa3ntoHTdQeTd50D4A1WZAT9xEI7xROl9E5cg0PGyMPHb0kQm6L5B4RG1D8XPdUHqIKtAYb18eFtZukMCQco3BWAmYR7qY0xyTnATyGcRj',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch(UPLOAD_FILE_URL, requestData);
    if (response.ok) {
      const responseData = await response.json();
      const url = responseData?.data?.displayUrl;
      return url;
    }
  } catch (error) {
    log('Error while getting log file url : ', error);
  }
};

const saveFileOnServer = async () => {
  const file = await readFile();
  const url = await getFileUrl();
  if (!file || !url) return;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
    });
    if (response.ok) {
      // log('Successfully uploaded log file on server');
      deleteFile();
    }
  } catch (error) {
    log('Error while saving log file on server : ', error);
  }
};

const getFilePath = () => {
  const dirToSave =
    Platform.OS == 'ios'
      ? RNFS.DocumentDirectoryPath
      : RNFS.DownloadDirectoryPath;
  // log('Log file Path', dirToSave);
  return dirToSave + '/' + fileName;
};

const saveFile = async (fileContent: string) => {
  const isStoragePermissionGranted = await requestStoragePermission();
  if (!isStoragePermissionGranted) return;
  const filePath = getFilePath();
  try {
    await RNFS.appendFile(filePath, fileContent, fileEncoding);
    // log('Log file saved successfully.');
  } catch (error) {
    log('Error while saving log file : ', error);
  }
};

const readFile = async () => {
  const filePath = getFilePath();
  try {
    const fileContent = await RNFS.readFile(filePath, fileEncoding);
    return fileContent;
  } catch (error) {
    log('Error while reading log file : ', error);
  }
};

const deleteFile = async () => {
  const filePath = getFilePath();
  try {
    await RNFS.unlink(filePath);
    // log('Log file deleted successfully.');
  } catch (error) {
    log('Error while deleting log file : ', error);
  }
};

console.log = (...args) => {
  log(...args);
  let newLogStr = '';
  args.map(item => {
    if (typeof item === 'object') {
      newLogStr = newLogStr + JSON.stringify(item) + ' ';
    } else {
      newLogStr = newLogStr + item + ' ';
    }
  });
  const logStr = getDateString() + ' ' + newLogStr + '\n';
  saveFile(logStr);
};

const initLogger = async () => {
  const isStoragePermissionGranted = await requestStoragePermission();
  if (isStoragePermissionGranted) {
    saveFileOnServer();
  }
};

initLogger();
