import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import { Theme } from '../constants/Theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
});
