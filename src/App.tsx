import React from 'react';
import {Provider} from 'react-redux';

import './localization/i18n';
// import './src/utilities/logger';
import RootNavigator from './navigation';
import {store} from './store';

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
