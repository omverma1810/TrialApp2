import {
  GestureResponderEvent,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {Portal} from '@gorhom/portal';
import {useKeyboard} from '../../hooks/useKeaboard';

const SPACE = 10;

export type MenuTypes = {
  targetLayout: LayoutRectangle;
  onClose: (event: GestureResponderEvent) => void;
  children: ReactNode;
  isMenuVisible: boolean;
};

const Menu = ({
  targetLayout = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  onClose = () => {},
  children,
  isMenuVisible = false,
}: MenuTypes) => {
  const {height} = useWindowDimensions();
  const {keyboardHeight} = useKeyboard();
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const topPosition = useMemo(() => {
    let top = 0;
    top = targetLayout.y + targetLayout.height + SPACE;
    if (top + layout.height > height - keyboardHeight) {
      top = targetLayout.y - layout.height - SPACE;
    }
    return top;
  }, [targetLayout, layout, keyboardHeight]);

  const letPosition = useMemo(() => {
    let left = 0;
    left = targetLayout.x - layout.width + targetLayout.width;
    if (targetLayout.x - layout.width < 0) {
      left = targetLayout.x;
    }
    return left;
  }, [targetLayout, layout]);

  const menuPosition = useMemo(
    () => ({
      opacity: layout.height === 0 || layout.width === 0 ? 0 : 1,
      top: topPosition,
      left: letPosition,
    }),
    [layout, topPosition, letPosition],
  );

  const menuContainerStyle = useMemo(
    () => [styles.menuContainer, menuPosition],
    [menuPosition],
  );

  const handleMenuLayout = useCallback(
    ({
      nativeEvent: {
        layout: {height, width},
      },
    }: LayoutChangeEvent) => {
      setLayout(state => {
        if (state.height === height && state.width === width) {
          return state;
        }

        return {
          height,
          width,
        };
      });
    },
    [],
  );

  if (isMenuVisible)
    return (
      <Portal name="Menu">
        <TouchableWithoutFeedback onPress={onClose} style={styles.container}>
          <View style={styles.backdropContainer}>
            <View onLayout={handleMenuLayout} style={menuContainerStyle}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Portal>
    );
  else return null;
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: 'absolute',
  },
});
