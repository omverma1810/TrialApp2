import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Portal } from '@gorhom/portal';
import { useWindowDimensions } from 'react-native';
import { useKeyboard } from '../../hooks/useKeaboard'; // Custom hook for keyboard height

const SPACE = 10; // Space between the target element and the menu

export type MenuProps = {
  targetLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  onClose: () => void;
  isMenuVisible: boolean;
  children: React.ReactNode;
};

const Menu: React.FC<MenuProps> = ({
  targetLayout,
  onClose,
  children,
  isMenuVisible,
}) => {
  const { height } = useWindowDimensions(); // Screen height
  const { keyboardHeight } = useKeyboard(); // Keyboard height
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // Calculate top position
  const topPosition = useMemo(() => {
    if (!targetLayout) return 0;

    let top = targetLayout.y + targetLayout.height + SPACE;
    if (top + layout.height > height - keyboardHeight) {
      top = targetLayout.y - layout.height - SPACE;
    }
    return top;
  }, [targetLayout, layout, height, keyboardHeight]);

  // Calculate left position
  const leftPosition = useMemo(() => {
    if (!targetLayout) return 0;

    let left = targetLayout.x - layout.width + targetLayout.width;
    if (targetLayout.x - layout.width < 0) {
      left = targetLayout.x;
    }
    return left;
  }, [targetLayout, layout]);

  // Menu position styles
  const menuPosition = useMemo(
    () => ({
      opacity: layout.height === 0 || layout.width === 0 ? 0 : 1,
      top: topPosition,
      left: leftPosition,
    }),
    [layout, topPosition, leftPosition]
  );

  // Combined styles for the menu container
  const menuContainerStyle = useMemo(
    () => [styles.menuContainer, menuPosition],
    [menuPosition]
  );

  // Handle layout changes to update menu dimensions
  const handleMenuLayout = useCallback(
    ({ nativeEvent: { layout: { height, width } } }) => {
      setLayout((state) => {
        if (state.height === height && state.width === width) {
          return state;
        }

        return { height, width };
      });
    },
    []
  );

  // Render the menu if visible
  return (
    <Portal name="Menu">
      {isMenuVisible && targetLayout && (
        <TouchableWithoutFeedback onPress={onClose} style={styles.container}>
          <View style={styles.backdropContainer}>
            <View onLayout={handleMenuLayout} style={menuContainerStyle}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </Portal>
  );
};

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

export default Menu;