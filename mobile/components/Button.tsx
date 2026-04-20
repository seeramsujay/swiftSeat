import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Theme } from '../constants/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'tertiary':
        return {
          container: styles.tertiaryContainer,
          text: styles.tertiaryText,
        };
    }
  };

  const { container, text } = getStyles();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.baseContainer, container, style]}
      >
        <Text style={[styles.baseText, text]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.roundness.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    ...Theme.typography.title,
  },
  primaryContainer: {
    backgroundColor: Theme.colors.primary,
  },
  primaryText: {
    color: Theme.colors.onPrimary,
  },
  secondaryContainer: {
    backgroundColor: Theme.colors.surfaceHighest,
  },
  secondaryText: {
    color: Theme.colors.text,
  },
  tertiaryContainer: {
    backgroundColor: 'transparent',
  },
  tertiaryText: {
    color: Theme.colors.primary,
  },
});
