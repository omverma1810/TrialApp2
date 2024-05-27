import {Alert, AlertButton} from 'react-native';

import {AlertType} from '../../types/components/Alert';
import i18n from '../../localization/i18n';
import {LOCALES} from '../../localization/constants';

const appAlert = ({
  title = '',
  message,
  onOK = () => {},
  onCancel = () => {},
  showCancelButton = false,
  isCustomButton = false,
  customButtonArray = [],
}: AlertType) => {
  const buttonArrayWithCancel: Array<AlertButton> = [
    {
      text: i18n.t(LOCALES.COMMON.LBL_CANCEL),
      onPress: onCancel,
      style: 'cancel',
    },
    {text: i18n.t(LOCALES.COMMON.LBL_OK), onPress: onOK},
  ];
  const buttonArrayWithoutCancel: Array<AlertButton> = [
    {text: i18n.t(LOCALES.COMMON.LBL_OK), onPress: onOK},
  ];
  const button: Array<AlertButton> = isCustomButton
    ? customButtonArray
    : showCancelButton
    ? buttonArrayWithCancel
    : buttonArrayWithoutCancel;
  Alert.alert(title, message, button);
};

export default appAlert;
