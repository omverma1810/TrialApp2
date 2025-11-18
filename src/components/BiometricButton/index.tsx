import React from 'react';
import {Pressable, View, StyleSheet} from 'react-native';
import Text from '../Text';
import {useBiometricAuth} from '../../hooks/useBiometricAuth';

interface BiometricButtonProps {
  onBiometricSuccess: (credentials: {
    username: string;
    password: string;
  }) => void;
  onBiometricError?: (error: string) => void;
  disabled?: boolean;
  style?: any;
}

const BiometricButton: React.FC<BiometricButtonProps> = ({
  onBiometricSuccess,
  onBiometricError,
  disabled = false,
  style,
}) => {
  const {
    biometricAvailable,
    biometricEnabled,
    authenticateWithBiometric,
    getBiometricTypeName,
    isLoading,
  } = useBiometricAuth();

  const [biometricTypeName, setBiometricTypeName] = React.useState('Biometric');

  React.useEffect(() => {
    const loadBiometricTypeName = async () => {
      const typeName = await getBiometricTypeName();
      setBiometricTypeName(typeName);
    };

    if (biometricAvailable) {
      loadBiometricTypeName();
    }
  }, [biometricAvailable]);

  const handleBiometricAuth = async () => {
    try {
      // This will always trigger biometric verification due to our Keychain settings
      const credentials = await authenticateWithBiometric();
      if (credentials) {
        onBiometricSuccess(credentials);
      } else {
        onBiometricError?.('No credentials available');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Biometric authentication failed';
      onBiometricError?.(errorMessage);
    }
  };

  if (!biometricAvailable || !biometricEnabled) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={[
          styles.button,
          (disabled || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleBiometricAuth}
        disabled={disabled || isLoading}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>👆</Text>
        </View>
        <Text
          style={[
            styles.buttonText,
            (disabled || isLoading) && styles.buttonTextDisabled,
          ]}>
          {isLoading ? 'Authenticating...' : `Login with ${biometricTypeName}`}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 200,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  buttonTextDisabled: {
    color: '#adb5bd',
  },
});

export default BiometricButton;
