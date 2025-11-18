import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {Platform} from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

export interface BiometricAvailability {
  available: boolean;
  biometryType?: keyof typeof BiometryTypes;
  error?: string;
}

class BiometricAuthService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true, // Allow device PIN/Password as fallback
    });
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<BiometricAvailability> {
    try {
      const {available, biometryType} =
        await this.rnBiometrics.isSensorAvailable();

      return {
        available,
        biometryType,
      };
    } catch (error) {
      return {
        available: false,
        error: 'Error checking biometric availability',
      };
    }
  }

  /**
   * Get human-readable name for biometric type
   */
  getBiometricTypeName(biometryType?: keyof typeof BiometryTypes): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Prompt user for biometric authentication
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const {available, biometryType} = await this.isBiometricAvailable();

      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      const defaultMessage = `Authenticate using ${this.getBiometricTypeName(
        biometryType,
      )}`;

      const {success} = await this.rnBiometrics.simplePrompt({
        promptMessage: promptMessage || defaultMessage,
        cancelButtonText: 'Cancel',
      });

      return {success};
    } catch (error: any) {
      // Handle user cancellation
      if (
        error.message?.includes('User cancel') ||
        error.message?.includes('Authentication was cancelled') ||
        error.message?.includes('User denied access')
      ) {
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }
  /**
   * Create biometric key pair for advanced authentication
   */
  async createBiometricKeys(
    keyAlias: string = 'biometric_key',
  ): Promise<boolean> {
    try {
      const {keysExist} = await this.rnBiometrics.biometricKeysExist();

      if (!keysExist) {
        const {publicKey} = await this.rnBiometrics.createKeys();
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteBiometricKeys(): Promise<boolean> {
    try {
      const {keysDeleted} = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      return false;
    }
  }
}

export const biometricAuthService = new BiometricAuthService();
