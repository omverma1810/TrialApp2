export type TOAST_TYPES = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'NATIVE';

export const TOAST_EVENT_TYPES = {
  SHOW: 'SHOW_TOAST',
  SHOW_TOAST: 'SHOW_TOAST',
};

export type toastOptions = {
  type: TOAST_TYPES;
  message: string;
  duration?: number;
};
