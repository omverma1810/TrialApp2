import {TOAST_EVENT_TYPES} from '../types/components/Toast';
import eventEmitter from './eventEmitter';

const TOAST_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  NATIVE: 'NATIVE',
};

type toastOptions = {
  message: string;
  duration?: number;
};

const defaultToastOptions = {
  message: '',
  duration: 1000,
};

const Toast = {
  info: (options: toastOptions = defaultToastOptions) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
      ...options,
      type: TOAST_TYPES.INFO,
    });
  },
  success: (options: toastOptions = defaultToastOptions) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
      ...options,
      type: TOAST_TYPES.SUCCESS,
    });
  },
  warning: (options: toastOptions = defaultToastOptions) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
      ...options,
      type: TOAST_TYPES.WARNING,
    });
  },
  error: (options: toastOptions = defaultToastOptions) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
      ...options,
      type: TOAST_TYPES.ERROR,
    });
  },
  native: (options: toastOptions = defaultToastOptions) => {
    eventEmitter.emit(TOAST_EVENT_TYPES.SHOW, {
      ...options,
      type: TOAST_TYPES.NATIVE,
    });
  },
};
export default Toast;
