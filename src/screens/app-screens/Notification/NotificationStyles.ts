import { StyleSheet } from 'react-native';

const NotificationStyles = StyleSheet.create({
  container: {
    marginTop: 40,
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  innerContent: {
    gap: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#161616',
  },
  messageContainer: {
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#454545',
  },
});

export default NotificationStyles;
