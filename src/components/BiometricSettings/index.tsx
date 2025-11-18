import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import Text from '../Text';
import Switch from '../Switch';
import {useBiometricAuth} from '../../hooks/useBiometricAuth';
import Toast from '../../utilities/toast';

interface BiometricSettingsProps {
  username?: string;
  password?: string;
  style?: any;
  onBiometricEnabled?: () => void;
}

const BiometricSettings: React.FC<BiometricSettingsProps> = ({
  username,
  password,
  style,
  onBiometricEnabled,
}) => {
  const {
    biometricAvailable,
    biometricEnabled,
    enableBiometric,
    disableBiometric,
    getBiometricTypeName,
    isLoading,
  } = useBiometricAuth();

  const [biometricTypeName, setBiometricTypeName] = useState('Biometric');

  React.useEffect(() => {
    const loadBiometricTypeName = async () => {
      const typeName = await getBiometricTypeName();
      setBiometricTypeName(typeName);
    };

    if (biometricAvailable) {
      loadBiometricTypeName();
    }
  }, [biometricAvailable]);

  const handleToggleBiometric = async (enabled: boolean) => {
    try {
      if (enabled) {
        if (!username || !password) {
          Alert.alert(
            'Credentials Required',
            'Please enter your username and password first to enable biometric login.',
          );
          return;
        }

        await enableBiometric(username, password);
        Toast.success({
          message: `${biometricTypeName} login enabled successfully!`,
        });

        // Call the callback to refresh state
        onBiometricEnabled?.();
      } else {
        Alert.alert(
          `Disable ${biometricTypeName}`,
          `Are you sure you want to disable ${biometricTypeName} login?`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await disableBiometric();
                  Toast.success({
                    message: `${biometricTypeName} login disabled`,
                  });
                } catch (error: any) {
                  Toast.error({
                    message:
                      error.message || 'Failed to disable biometric login',
                  });
                }
              },
            },
          ],
        );
      }
    } catch (error: any) {
      if (error.message === 'Biometric setup was cancelled') {
        // User cancelled, no need to show error
        return;
      }

      Toast.error({
        message: error.message || 'Failed to configure biometric login',
      });
    }
  };

  if (!biometricAvailable) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enable {biometricTypeName} Login</Text>
          <Text style={styles.subtitle}>
            Use {biometricTypeName.toLowerCase()} for quick and secure login
          </Text>
        </View>
        <Switch value={biometricEnabled} onChange={handleToggleBiometric} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default BiometricSettings;
