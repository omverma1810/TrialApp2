import {AlertButton} from 'react-native';

export type AlertType = {
  title?: string;
  message: string;
  onOK?: () => void;
  onCancel?: () => void;
  isCustomButton?: boolean;
  showCancelButton?: boolean;
  customButtonArray?: Array<AlertButton>;
};
