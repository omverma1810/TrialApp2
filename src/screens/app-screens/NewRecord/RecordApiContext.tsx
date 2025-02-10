import React, {createContext, ReactNode, useContext, useEffect} from 'react';

import {URL} from '../../../constants/URLS';
import {useApi} from '../../../hooks/useApi';

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
  updateTraitsRecord: any;
  updatedTraitsRecordData: any;
  isTraitsRecordLoading: boolean;
  validateTraitsRecord: any;
  validatedTrraitsRecordData: any;
  isValidateTraitsRecordLoading: boolean;
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

  const [updateTraitsRecord, updatedTraitsRecordData] = useApi({
    url: URL.RECORD_TRAITS,
    method: 'PUT',
  });

  const [
    validateTraitsRecord,
    validatedTrraitsRecordData,
    isValidateTraitsRecordLoading,
  ] = useApi({
    url: URL.VALIDATE_TRAITS,
    method: 'POST',
  });

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
    updateTraitsRecord,
    updatedTraitsRecordData,
    isTraitsRecordLoading,
    validateTraitsRecord,
    validatedTrraitsRecordData,
    isValidateTraitsRecordLoading,
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
