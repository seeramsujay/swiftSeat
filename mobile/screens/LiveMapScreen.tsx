import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { Screen } from '../components/Screen';
import { Theme } from '../constants/Theme';
import { GlassContainer } from '../components/GlassContainer';
import { MapPin, Navigation, Info, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LiveMapScreen = () => {
  return (
    <Screen style={styles.screen}>
      <View style={styles.mapContainer}>
        {/* Mock Map Background - Deep Dark Stadium Layout */}
        <View style={styles.mockMap}>
          {/* Concourse Areas */}
          <View style={[styles.concourse, { top: '20%', left: '10%', width: '80%', height: '15%', backgroundColor: 'rgba(74, 225, 131, 0.1)' }]} />
          <View style={[styles.concourse, { top: '45%', left: '10%', width: '80%', height: '15%', backgroundColor: 'rgba(255, 181, 159, 0.1)' }]} />
          
          {/* Legend/Route */}
          <View style={styles.routePath} />
          
          {/* Markers */}
          <View style={[styles.marker, { top: '25%', left: '30%' }]}>
            <MapPin size={24} color={Theme.colors.tertiary} />
            <Text style={styles.markerText}>You</Text>
          </View>

          <View style={[styles.marker, { top: '50%', left: '60%' }]}>
            <MapPin size={24} color={Theme.colors.primary} />
            <Text style={styles.markerText}>BBQ Stand</Text>
          </View>
        </View>

        {/* Floating Info Overlays */}
        <View style={styles.overlayTop}>
          <GlassContainer style={styles.statusChip}>
            <Users size={16} color={Theme.colors.tertiary} />
            <Text style={styles.statusText}>Concourse Clear</Text>
          </GlassContainer>
        </View>

        <View style={styles.overlayBottom}>
          <GlassContainer style={styles.routingCard}>
            <View style={styles.routingInfo}>
              <View>
                <Text style={styles.routeTitle}>To Prime Pit BBQ</Text>
                <Text style={styles.routeSub}>Estimated arrival: 3m 45s</Text>
              </View>
              <View style={styles.navIcon}>
                <Navigation size={24} color={Theme.colors.onPrimary} fill={Theme.colors.onPrimary} />
              </View>
            </View>
            <View style={styles.stepInfo}>
              <Info size={16} color={Theme.colors.primary} />
              <Text style={styles.stepText}>Follow the blue lights on Floor 2</Text>
            </View>
          </GlassContainer>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#0a0d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  concourse: {
    position: 'absolute',
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  routePath: {
    position: 'absolute',
    width: 2,
    height: '30%',
    backgroundColor: Theme.colors.primary,
    top: '30%',
    left: '42%',
    opacity: 0.5,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerText: {
    ...Theme.typography.label,
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  overlayTop: {
    position: 'absolute',
    top: 60,
    left: 24,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Theme.roundness.full,
  },
  statusText: {
    ...Theme.typography.label,
    color: Theme.colors.text,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  routingCard: {
    padding: Theme.spacing.md,
  },
  routingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  routeTitle: {
    ...Theme.typography.title,
    color: Theme.colors.text,
  },
  routeSub: {
    ...Theme.typography.body,
    fontSize: 14,
    color: Theme.colors.textVariant,
  },
  navIcon: {
    backgroundColor: Theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(173, 198, 255, 0.1)',
    padding: 12,
    borderRadius: Theme.roundness.md,
  },
  stepText: {
    ...Theme.typography.body,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});

export default LiveMapScreen;
