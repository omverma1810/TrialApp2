import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Portal} from '@gorhom/portal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import eventEmitter from '../../utilities/eventEmitter';
import {TOAST_EVENT_TYPES, toastOptions} from '../../types/components/Toast';
import {useKeyboard} from '../../hooks/useKeaboard';

const SPACE = 10;

const Toast = () => {
  const {bottom} = useSafeAreaInsets();
  const {COLORS, FONTS} = useTheme();
  const {isKeyboardOpen, keyboardHeight} = useKeyboard();
  const timeOutRef = useRef<any>(0);
  const [showToast, setShowToast] = useState(false);
  const [options, setOptions] = useState<toastOptions | null>(null);
  const [timeOut, setTimeout] = useState(3000);

  // Calculate bottom position considering keyboard
  const bottomPosition = useMemo(() => {
    if (isKeyboardOpen) {
      // Position toast above keyboard with some spacing
      return keyboardHeight + SPACE;
    }
    // Default position at bottom with safe area
    return bottom + SPACE;
  }, [isKeyboardOpen, keyboardHeight, bottom]);

  useEffect(() => {
    const subscription = eventEmitter.addListener(
      TOAST_EVENT_TYPES.SHOW,
      (options: toastOptions) => {
        setOptions(options);
        setShowToast(true);
        if (options?.duration) {
          setTimeout(options.duration);
        }
      },
    );
    return () => {
      subscription.removeAllListeners();
    };
  }, []);

  const messageBackgroundColor = useMemo(() => {
    if (!options) return;
    if (options?.type === 'INFO') {
      return COLORS.COMPONENTS.TOAST.INFO_BACKGROUND_COLOR;
    } else if (options?.type === 'SUCCESS') {
      return COLORS.COMPONENTS.TOAST.SUCCESS_BACKGROUND_COLOR;
    } else if (options?.type === 'WARNING') {
      return COLORS.COMPONENTS.TOAST.WARNING_BACKGROUND_COLOR;
    } else if (options?.type === 'ERROR') {
      return COLORS.COMPONENTS.TOAST.ERROR_BACKGROUND_COLOR;
    } else {
      return COLORS.COMPONENTS.TOAST.NATIVE_BACKGROUND_COLOR;
    }
  }, [options]);

  const messageColor = useMemo(() => {
    if (!options) return;
    if (options?.type === 'INFO') {
      return COLORS.COMPONENTS.TOAST.INFO_TEXT_COLOR;
    } else if (options?.type === 'SUCCESS') {
      return COLORS.COMPONENTS.TOAST.SUCCESS_TEXT_COLOR;
    } else if (options?.type === 'WARNING') {
      return COLORS.COMPONENTS.TOAST.WARNING_TEXT_COLOR;
    } else if (options?.type === 'ERROR') {
      return COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR;
    } else {
      return COLORS.COMPONENTS.TOAST.NATIVE_TEXT_COLOR;
    }
  }, [options]);

  const closeToast = useCallback(() => {
    setOptions(null);
    setTimeout(3000);
    setShowToast(false);
    clearInterval(timeOutRef.current);
  }, []);

  useEffect(() => {
    if (showToast) {
      timeOutRef.current = setInterval(() => {
        if (timeOut === 0) closeToast();
        else setTimeout(prev => prev - 1000);
      }, 1000);
    }
    return () => {
      clearInterval(timeOutRef.current);
    };
  }, [showToast, timeOut]);

  if (showToast)
    return (
      <Portal name="Toast">
        <TouchableWithoutFeedback onPress={closeToast} style={styles.container}>
          <View style={styles.backdropContainer}>
            <View style={[styles.toastContainer, {bottom: bottomPosition}]}>
              <View
                style={[
                  styles.messageContainer,
                  {backgroundColor: messageBackgroundColor},
                ]}>
                <Text
                  style={[
                    styles.message,
                    {color: messageColor, fontFamily: FONTS.MEDIUM},
                  ]}
                  numberOfLines={2}>
                  {options?.message}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Portal>
    );
  else return null;
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  messageContainer: {
    alignSelf: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 4,
  },
  message: {},
});
