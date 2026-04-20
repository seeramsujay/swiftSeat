import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../constants/Theme';

interface GlassContainerProps extends ViewProps {
  intensity?: number;
  children: React.ReactNode;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  intensity = 80, 
  children, 
  style, 
  ...props 
}) => {
  return (
    <View style={[styles.outer, style]} {...props}>
      <BlurView intensity={intensity} style={styles.blur} tint="dark">
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: Theme.roundness.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(49, 53, 60, 0.7)',
  },
  blur: {
    padding: Theme.spacing.md,
  },
  content: {
    // Content padding is handled by blur style for now
  },
});
