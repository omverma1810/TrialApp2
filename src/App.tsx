import React, {useEffect} from 'react';
import {Provider} from 'react-redux';

import './localization/i18n';
import RootNavigator from './navigation';
import {store} from './store';
import {initDB} from './services/db';
import usePreventOfflineAppClose from './hooks/usePreventOfflineAppClose';

const App = () => {
  usePreventOfflineAppClose();

  useEffect(() => {
    // Initialize database with proper error handling to prevent crashes

    // Use setTimeout to delay DB initialization and prevent blocking the main thread
    const initializeDatabase = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        initDB(); // ← this will run once on app startup
      } catch (error) {
        // Don't crash the app if DB fails to initialize
        // The app will continue to work but without offline data storage
      }
    };

    initializeDatabase();
  }, []); //     with an empty deps array

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
