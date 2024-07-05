import { StyleSheet } from "react-native";

const ProfileStyle = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'white',
        height: '100%',
        gap: 24,
        paddingVertical: 10,
      },
    profileContainer: {
        height: 80,
        width: 80,
        borderRadius: 50,
    },
    infoContainer: {
        gap: 15,
      },
      infoItem: {
        padding: 16,
        backgroundColor: '#F7F7F7',
        width: 328,
        gap: 8,
      },
      infoText: {
        color: '#636363',
        fontSize: 13,
        fontWeight: '400',
      },
      infoTextBold: {
        fontWeight: '500',
        color: '#161616',
        fontSize: 15,
      },
      editButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      editButton: {
        color: '#1A6DD2',
      },
      logoutButton: {
        borderColor: '#1A6DD2',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
      },
      profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100, // To make it circular, assuming the image is square
      },
      addImageText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
      },
      updateButton: {
        backgroundColor: '#1A6DD2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
      },
      updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
      },
    
})
export default ProfileStyle;