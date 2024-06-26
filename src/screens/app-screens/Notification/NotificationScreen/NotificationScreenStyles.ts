import { StyleSheet } from 'react-native';

const NotificationScreenStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    height: '100%',
    gap: 10,
  },
  card: {
    backgroundColor: '#EEF2F6',
    borderRadius: 6,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  textContainer: {
    gap: 8,
    width: 268,
    marginTop: -4,
  },
  titleText: {
    fontWeight: '500',
    color: '#161616',
    fontSize: 15,
  },
  bodyText: {
    color: '#636363',
    fontSize: 13,
    fontWeight: '400',
  },
  button: {
    borderWidth: 1,
    borderColor: '#1A6DD2',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#1A6DD2',
    fontSize: 14,
    fontWeight: '500',
  },
  reminderTextContainer: {
    gap: 5,
    width: 268,
    marginTop: -4,
  },
  alertCard: {
    padding: 16,
  }
});

export default NotificationScreenStyles;
