import React, {useState} from 'react';
import {View, Text} from 'react-native';

import MyVisitStyles from './MyVistStyles';
import {visits as initialVisits} from '../../../../Data';
import UpcomingVisits from '../../../../components/Upcomingvisit';

const MyVisits = () => {
  const [visits, setVisits] = useState(initialVisits);

  const handleDeletevisit = id => {
    setVisits(prevVisits => prevVisits.filter(visit => visit.id !== id));
  };
  return (
    <View style={{}}>
      {visits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>
            My Upcoming Visits
          </Text>
          {visits.map(visit => (
            <UpcomingVisits
              key={visit.id}
              visit={visit}
              onDelete={handleDeletevisit}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MyVisits;
