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
  generatePreSignedUrl: any;
  preSignedUrlData: any;
  uploadImage: any;
  uploadImageData: any;
  getFilters: () => void;
  filtersData: any;
  isFiltersLoading: boolean;
  postFilteredExperiments: (opts: {payload: any; headers?: any}) => void;
  filteredExperimentsData: any;
  isFilteredLoading: boolean;
  filteredError: any;
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

  const [getFilters, filtersData, isFiltersLoading] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });
  const [
    postFilteredExperiments,
    filteredExperimentsData,
    isFilteredLoading,
    filteredError,
  ] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  const [
    validateTraitsRecord,
    validatedTrraitsRecordData,
    isValidateTraitsRecordLoading,
  ] = useApi({
    url: URL.VALIDATE_TRAITS,
    method: 'POST',
  });

  const [generatePreSignedUrl, preSignedUrlData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
    method: 'GET',
  });

  const [uploadImage, uploadImageData] = useApi({
    url: URL.GENERATE_PRE_SIGNED,
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
    generatePreSignedUrl,
    preSignedUrlData,
    uploadImage,
    uploadImageData,
    getFilters,
    filtersData,
    isFiltersLoading,
    postFilteredExperiments,
    filteredExperimentsData,
    isFilteredLoading,
    filteredError,
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
