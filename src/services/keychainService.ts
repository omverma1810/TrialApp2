import {Platform} from 'react-native';
import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.fieldgenie.credentials';

export enum KeychainErrorCode {
  CANCELLED = 'CANCELLED',
  NOT_FOUND = 'NOT_FOUND',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  ENROLLMENT_CHANGED = 'ENROLLMENT_CHANGED',
  AUTH_FAILED = 'AUTH_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export class KeychainStorageError extends Error {
  code: KeychainErrorCode;

  constructor(code: KeychainErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'KeychainStorageError';
    this.code = code;
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

type StoredCredentials = {
  username: string;
  password: string;
};

const normalize = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (value && typeof value === 'object' && 'message' in (value as any)) {
    const message = (value as any).message;
    if (typeof message === 'string') {
      return message.toLowerCase();
    }
  }
  return String(value || '').toLowerCase();
};

type AuthenticationPromptOptions = {
  title: string;
  subtitle?: string;
  description?: string;
  cancel?: string;
};

const buildAuthenticationPrompt = (
  promptMessage?: string,
): AuthenticationPromptOptions => {
  const title = promptMessage || 'Authenticate to continue';

  if (Platform.OS === 'android') {
    return {
      title,
      subtitle: 'Unlock FieldGenie',
      description: 'Use biometric or device credentials to continue',
      cancel: 'Cancel',
    };
  }

  return {
    title,
    cancel: 'Cancel',
  };
};

const getStoreOptions = (): Keychain.Options => {
  const baseOptions: Keychain.Options = {
    service: SERVICE_NAME,
  };

  if (Platform.OS === 'ios') {
    // iOS: Use biometric protection - Keychain handles prompts automatically
    baseOptions.accessible =
      Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY;
    baseOptions.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
  } else {
    // Android: Only use secure storage - NO accessControl (causes failures)
    // Biometric verification must be done separately via react-native-biometrics
    baseOptions.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
    baseOptions.accessible = Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY;
  }

  return baseOptions;
};

const mapErrorToKeychainError = (error: unknown): KeychainStorageError => {
  const normalized = normalize(error);

  if (normalized.includes('cancel') || normalized.includes('usercancel')) {
    return new KeychainStorageError(
      KeychainErrorCode.CANCELLED,
      'Authentication was cancelled',
      error,
    );
  }

  if (
    normalized.includes('permanently invalidated') ||
    normalized.includes('biometry has changed') ||
    normalized.includes('biometry is locked') ||
    normalized.includes('biometry not available') ||
    normalized.includes('key was permanently invalidated') ||
    normalized.includes('no biometric credentials') ||
    normalized.includes('laerrorbiometrynotavailable')
  ) {
    return new KeychainStorageError(
      KeychainErrorCode.ENROLLMENT_CHANGED,
      'Biometric enrollment has changed',
      error,
    );
  }

  if (
    normalized.includes('not available') ||
    normalized.includes('not enrolled') ||
    normalized.includes('no biometric') ||
    normalized.includes('passcode')
  ) {
    return new KeychainStorageError(
      KeychainErrorCode.NOT_AVAILABLE,
      'Biometric authentication is not available',
      error,
    );
  }

  if (
    normalized.includes('authentication failed') ||
    normalized.includes('failed to authenticate') ||
    normalized.includes('auth failed')
  ) {
    return new KeychainStorageError(
      KeychainErrorCode.AUTH_FAILED,
      'Failed to authenticate with biometrics',
      error,
    );
  }

  return new KeychainStorageError(
    KeychainErrorCode.UNKNOWN,
    'Keychain operation failed',
    error,
  );
};

const storeCredentials = async (
  username: string,
  password: string,
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(username, password, getStoreOptions());
    console.log('✅ Keychain: Credentials stored securely');
  } catch (error) {
    console.log('❌ Keychain: Failed to store credentials');
    throw mapErrorToKeychainError(error);
  }
};

const retrieveCredentials = async (
  promptMessage?: string,
): Promise<StoredCredentials> => {
  try {
    // Platform-specific retrieval
    let result;

    if (Platform.OS === 'ios') {
      // iOS: Keychain handles biometric prompt automatically
      result = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
        authenticationPrompt: buildAuthenticationPrompt(promptMessage),
      });
    } else {
      // Android: Just retrieve credentials (biometric verification done separately)
      // No authenticationPrompt - it doesn't work on Android
      result = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
    }

    if (!result) {
      throw new KeychainStorageError(
        KeychainErrorCode.NOT_FOUND,
        'No stored credentials found',
      );
    }

    console.log('✅ Keychain: Credentials retrieved');
    return {
      username: result.username,
      password: result.password,
    };
  } catch (error) {
    console.log('❌ Keychain: Failed to retrieve credentials');
    if (error instanceof KeychainStorageError) {
      throw error;
    }
    throw mapErrorToKeychainError(error);
  }
};

const clearCredentials = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({service: SERVICE_NAME});
    console.log('✅ Keychain: Credentials cleared');
  } catch (error) {
    console.log('❌ Keychain: Failed to clear credentials');
    throw mapErrorToKeychainError(error);
  }
};

export const keychainService = {
  storeCredentials,
  retrieveCredentials,
  clearCredentials,
};
