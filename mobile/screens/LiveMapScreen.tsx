import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Screen } from '../components/Screen';
import { Theme } from '../constants/Theme';
import { GlassContainer } from '../components/GlassContainer';
import { useStadiumData } from '../hooks/useStadiumData';
import { MapPin, Navigation, Info, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LiveMapScreen = () => {
  const { concessions, loading } = useStadiumData();
  const topStand = concessions[0]; // Nearest or best PALO

  return (
    <Screen style={styles.screen}>
      <View style={styles.mapContainer}>
        {/* Mock Map Background */}
        <View style={styles.mockMap}>
          {concessions.map((spot, i) => (
            <View key={i} style={[styles.marker, { top: `${20 + i * 20}%`, left: `${10 + i * 15}%` }]}>
              <MapPin size={24} color={i === 0 ? Theme.colors.primary : Theme.colors.tertiary} />
            </View>
          ))}
        </View>

        <View style={styles.overlayBottom}>
          <GlassContainer style={styles.routingCard}>
            <View style={styles.routingInfo}>
              <View>
                <Text style={styles.routeTitle}>To {topStand?.name || 'Loading...'}</Text>
                <Text style={styles.routeSub}>
                  {loading ? 'Calculating...' : `Arrival: ${topStand.waitTime}m + ${topStand.distance/10}m walk`}
                </Text>
              </View>
              <View style={styles.navIcon}>
                <Navigation size={24} color={Theme.colors.onPrimary} fill={Theme.colors.onPrimary} />
              </View>
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
