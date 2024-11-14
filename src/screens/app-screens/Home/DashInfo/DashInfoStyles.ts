import { StyleSheet } from 'react-native';

const DashInfoStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContainer: {
    gap: 8,
  },
  card: {
    backgroundColor: '#FBFBFB',
    justifyContent: 'space-between',
    width: '47%',
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardContent: {
    gap: 10,
  },
  cardTitle: {
    color: '#636363',
    fontSize: 14,
    fontWeight: '400',
  },
  cardValue: {
    fontWeight: '400',
    fontSize: 16,
    color: '#161616',
  },
  recordsContainer: {
    backgroundColor: '#FBFBFB',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordsTitle: {
    color: '#636363',
    fontSize: 14,
    fontWeight: '400',
  },
  recordsCountContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordsCount: {
    fontWeight: '400',
    fontSize: 17,
    color: '#161616',
  },
  recordsOutOf: {
    color: '#B7B7B7',
    fontSize: 14,
    fontWeight: '400',
  },
});

export default DashInfoStyles;
