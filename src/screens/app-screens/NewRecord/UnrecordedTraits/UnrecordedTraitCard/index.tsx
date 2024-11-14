import React from 'react';

import InitialValueCard from './InitialValueCard';
import ValueInputCard from './ValueInputCard';
import RecordedValueCard from './RecordedValueCard';
import {useUnrecordedTraits} from '../UnrecordedTraitsContext';

const UnrecordedTraitCard = () => {
  const {isRecorded, isInputActive} = useUnrecordedTraits();
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

export default React.memo(UnrecordedTraitCard);
