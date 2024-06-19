import React from 'react';

import InitialValueCard from './InitialValueCard';
import ValueInputCard from './ValueInputCard';
import RecordedValueCard from './RecordedValueCard';
import {useRecord} from '../RecordContext';

const UnrecordedTraitCard = () => {
  const {isRecorded, isInputActive} = useRecord();
  const renderCard = () => {
    if (isRecorded) {
      return <RecordedValueCard />;
    }

    if (isInputActive) {
      return <ValueInputCard />;
    }

    return <InitialValueCard />;
  };

  return renderCard();
};

export default UnrecordedTraitCard;
