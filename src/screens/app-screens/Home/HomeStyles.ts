import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    gap: 25,
    paddingVertical: 10,
  },
  viewStyle: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    height: '100%',
  },
  rowStyle: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  takeNotesButton: {
    backgroundColor: 'white',
    height: 50,
    width: '45%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#1A6DD2',
  },
  takeNotesText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
  planVisitButton: {
    backgroundColor: '#1A6DD2',
    height: 50,
    width: '45%',
    borderRadius: 15,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  planVisitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default styles;
