// SplashScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image , } from 'react-native';
import { APP_LOGO } from '../../../assets/images';

const SplashScreen = ({ }) => {

    return (
        <View style={styles.container}>
            <Image source={APP_LOGO}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default SplashScreen;