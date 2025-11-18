import {useEffect, useState, useRef} from 'react';
import {Keyboard, KeyboardEvent, Platform} from 'react-native';

export const useKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isKeyboardOpenRef = useRef(false);

  useEffect(() => {
    const handleKeyboardShow = (event: KeyboardEvent) => {
      if (!isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = true;
        setIsKeyboardOpen(true);
        setKeyboardHeight(event?.endCoordinates?.height ?? 0);
      }
    };

    const handleKeyboardHide = () => {
      if (isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = false;
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    const subscriptions = [
      Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        handleKeyboardShow,
      ),
      Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        handleKeyboardHide,
      ),
    ];

    return () => {
      subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      });
    };
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
  };
};
