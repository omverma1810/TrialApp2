import React, {useEffect, useMemo, useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import Calendar from '../../../../components/Calender';
import UpcomingVisits from '../../../../components/Upcomingvisit';
import {URL} from '../../../../constants/URLS';
import {useApi} from '../../../../hooks/useApi';
import MyVisitStyles from './MyVistStyles';

const MyVisits = () => {
  const [visits, setVisits] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editableId, setEditableId] = useState(null);

  const [getVisits, getVisitResponse] = useApi({
    url: URL.VISITS,
    method: 'GET',
  });
  useMemo(() => {
    getVisits();
  }, []);
  useEffect(() => {
    if (getVisitResponse && getVisitResponse.status_code === 200) {
      setVisits(getVisitResponse.data.filter(i => i?.experiment_name));
    }
  }, [getVisitResponse]);
  const [deleteVisits] = useApi({
    url: URL.VISITS,
    method: 'DELETE',
  });
  const [updateVisits] = useApi({
    url: URL.VISITS,
    method: 'PUT',
  });

  const handleOk = (date: string) => {
    const updatedVisit = visits.filter(i => i.id === editableId);
    if (updatedVisit.length) {
      updatedVisit[0].date = date;
      updateVisits({payload: updatedVisit, pathParams: editableId});
      setModalVisible(false);
      setVisits((prevVisits: any[]) => {
        let new_visits = prevVisits;
        new_visits[
          prevVisits.findIndex(visit => visit.id === editableId)
        ].date = date;
        return new_visits;
      });
    }
  };

  const handleCancel = () => {
    setModalVisible(true);
  };
  const handleDeletevisit = id => {
    deleteVisits({pathParams: id});
    setVisits((prevVisits: any[]) =>
      prevVisits.filter(visit => visit.id !== id),
    );
  };
  const handleEditVisit = id => {
    setEditableId(id);
    setModalVisible(true);
  };

  return (
    <View style={{}}>
      {visits && visits.length > 0 && (
        <View style={MyVisitStyles.upcomingVisitsContainer}>
          <Text style={MyVisitStyles.upcomingVisitsTitle}>
            My Upcoming Visits
          </Text>
          {visits &&
            visits.map(visit => (
              <UpcomingVisits
                key={visit.id}
                visit={visit}
                onDelete={handleDeletevisit}
                onEdit={handleEditVisit}
              />
            ))}
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <Calendar
            modalVisible={modalVisible}
            onCancel={handleCancel}
            onOk={handleOk}
          />
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
export default MyVisits;
