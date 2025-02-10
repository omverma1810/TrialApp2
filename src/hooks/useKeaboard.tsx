import {useEffect, useState} from 'react';
import {Keyboard, KeyboardEvent} from 'react-native';

export const useKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      'keyboardWillShow',
      _keyboardDidShow,
    );
    const keyboardDidShow = Keyboard.addListener(
      'keyboardDidShow',
      _keyboardDidShow,
    );
    const keyboardDidHide = Keyboard.addListener(
      'keyboardDidHide',
      _keyboardDidHide,
    );
    const keyboardWillHide = Keyboard.addListener(
      'keyboardWillHide',
      _keyboardDidHide,
    );

    // cleanup function
    return () => {
      keyboardWillShow.remove();
      keyboardDidShow.remove();
      keyboardDidHide.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const _keyboardDidShow = (event: KeyboardEvent) => {
    setIsKeyboardOpen(true);
    setKeyboardHeight(event.endCoordinates.height);
  };

  const _keyboardDidHide = () => {
    setIsKeyboardOpen(false);
    setKeyboardHeight(0);
  };

  return {
    isKeyboardOpen,
    keyboardHeight,
  };
};
