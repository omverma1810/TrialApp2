import React, {createContext, useContext, ReactNode, useEffect} from 'react';

import {useApi} from '../../../hooks/useApi';
import {URL} from '../../../constants/URLS';

interface RecordApiContextType {
  experimentListData: any;
  isExperimentListLoading: boolean;
  getFieldList: any;
  fieldListData: any;
  isFieldListLoading: boolean;
  getPlotList: any;
  plotListData: any;
  isPlotListLoading: boolean;
  createTraitsRecord: any;
  trraitsRecordData: any;
  isTraitsRecordLoading: boolean;
}

const RecordApiContext = createContext<RecordApiContextType | undefined>(
  undefined,
);

export const RecordApiProvider = ({children}: {children: ReactNode}) => {
  const [getExperimentList, experimentListData, isExperimentListLoading] =
    useApi({
      url: URL.EXPERIMENT_LIST,
      method: 'GET',
    });

  useEffect(() => {
    getExperimentList();
  }, []);

  const [getFieldList, fieldListData, isFieldListLoading] = useApi({
    url: URL.EXPERIMENT_DETAILS,
    method: 'GET',
  });

  const [getPlotList, plotListData, isPlotListLoading] = useApi({
    url: URL.PLOT_LIST,
    method: 'GET',
  });

  const [createTraitsRecord, trraitsRecordData, isTraitsRecordLoading] = useApi(
    {
      url: URL.RECORD_TRAITS,
      method: 'POST',
    },
  );

  const value = {
    experimentListData,
    isExperimentListLoading,
    getFieldList,
    fieldListData,
    isFieldListLoading,
    getPlotList,
    plotListData,
    isPlotListLoading,
    createTraitsRecord,
    trraitsRecordData,
    isTraitsRecordLoading,
  };

  return (
    <RecordApiContext.Provider value={value}>
      {children}
    </RecordApiContext.Provider>
  );
};

export const useRecordApi = () => {
  const context = useContext(RecordApiContext);
  if (!context) {
    throw new Error('useRecordApi must be used within a RecordApiProvider');
  }
  return context;
};
